import systemPrompt from './systemPrompt';

/**
 * Parse JSON from text, handling markdown fences and prose wrapping
 */
function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response: ' + text.slice(0, 200));
  }
}

function extractGeneratedImageSource(data) {
  const image = data?.data?.[0];
  const format = data?.output_format || 'png';

  if (image?.b64_json) {
    return `data:image/${format};base64,${image.b64_json}`;
  }

  throw new Error('OpenAI image response did not include data[0].b64_json');
}

/**
 * Call Anthropic Claude API with streaming.
 * Fires onImagePrompt callback as soon as image_prompt is detected in stream,
 * allowing parallel DALL-E generation while Claude finishes.
 * @param {Object} payload - Full quiz data including answers and audit trail
 * @param {Function} onImagePrompt - Called with image_prompt string as soon as detected
 * @returns {Promise<Object>} - Either { follow_up } or full enigma object
 */
export async function getEnigma(payload, onImagePrompt) {
  try {
    const isDev = import.meta.env.DEV;
    const anthropicUrl = isDev ? '/api/anthropic/v1/messages' : '/api/anthropic';
    const headers = {
      'content-type': 'application/json',
    };
    if (isDev) {
      headers['anthropic-version'] = '2023-06-01';
      headers['x-api-key'] = import.meta.env.VITE_ANTHROPIC_API_KEY;
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    const response = await fetch(anthropicUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(payload),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || 'Unknown error';
      } catch {
        errorMessage = errorText.slice(0, 200);
      }
      throw new Error(`Anthropic API error: ${response.status} - ${errorMessage}`);
    }

    // Stream SSE response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let imagePromptFired = false;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            accumulated += event.delta.text;

            // Check if image_prompt value is complete in accumulated text
            if (!imagePromptFired && onImagePrompt) {
              const match = accumulated.match(/"image_prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              if (match) {
                imagePromptFired = true;
                // Unescape the JSON string value
                const prompt = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                onImagePrompt(prompt);
              }
            }
          }
        } catch {
          // Skip malformed SSE events
        }
      }
    }

    return extractJSON(accumulated);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}

/**
 * Generate an image using OpenAI DALL-E 3
 * @param {string} imagePrompt - The prompt for DALL-E
 * @returns {Promise<string>} - The URL of the generated image
 */
export async function generateImage(imagePrompt) {
  try {
    const isDev = import.meta.env.DEV;
    const openaiUrl = isDev ? '/api/openai/v1/images/generations' : '/api/openai';
    const headers = {
      'content-type': 'application/json',
    };
    if (isDev) {
      headers['authorization'] = `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`;
    }

    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'low',
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return extractGeneratedImageSource(data);
  } catch (error) {
    console.error('Error calling OpenAI GPT-Image API:', error);
    throw error;
  }
}

/**
 * Call Anthropic Claude API again with the original payload + follow-up response
 * @param {Object} originalPayload - The original quiz payload
 * @param {string} followUpQuestion - The follow-up question Claude asked
 * @param {string} followUpAnswer - The user's answer to the follow-up
 * @returns {Promise<Object>} - Full enigma object
 */
export async function getEnigmaWithFollowUp(
  originalPayload,
  followUpQuestion,
  followUpAnswer,
  onImagePrompt
) {
  try {
    const enhancedPayload = {
      ...originalPayload,
      followUpResponse: {
        question: followUpQuestion,
        answer: followUpAnswer,
      },
    };

    return await getEnigma(enhancedPayload, onImagePrompt);
  } catch (error) {
    console.error('Error calling Anthropic API with follow-up:', error);
    throw error;
  }
}

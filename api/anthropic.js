import { anthropicLimiter, getIp, rateLimitResponse } from "./_ratelimit.js";

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (anthropicLimiter) {
    const { success } = await anthropicLimiter.limit(getIp(req));
    if (!success) return rateLimitResponse();
  }

  try {
    const body = await req.text();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'content-type': 'application/json',
      },
      body,
    });

    // Stream the response back to the client
    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'text/event-stream',
        'cache-control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

import { openaiLimiter, getIp, rateLimitResponse } from "./_ratelimit.js";

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (openaiLimiter) {
    const { success } = await openaiLimiter.limit(getIp(req));
    if (!success) return rateLimitResponse();
  }

  try {
    const body = await req.text();

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

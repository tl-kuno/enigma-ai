import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createLimiter(prefix) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // rate limiting disabled (dev / env vars not configured)
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 d"),
    prefix: `rl:${prefix}`,
  });
}

export const anthropicLimiter = createLimiter("anthropic");
export const openaiLimiter = createLimiter("openai");

export function getIp(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again tomorrow." }),
    { status: 429, headers: { "content-type": "application/json" } }
  );
}

import { getCacheRedis } from "./client";

// Returns true if the request is within the limit, false if it should be blocked.
// No-ops (always allows) when Redis is not configured — safe for local dev.
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const redis = getCacheRedis();
  if (!redis) return true;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return count <= maxRequests;
}

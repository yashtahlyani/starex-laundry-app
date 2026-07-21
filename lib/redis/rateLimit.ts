import type { NextRequest } from "next/server";
import { getRestRedis } from "./client";

// Returns true if the request is within the limit, false if it should be blocked.
// No-ops (always allows) when Redis is not configured — safe for local dev.
// Also fails open if Redis is configured but unreachable: a rate-limit outage
// must never take the booking/contact endpoints down with it.
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const redis = getRestRedis();
  if (!redis) return true;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= maxRequests;
  } catch {
    return true;
  }
}

// Best-effort client IP for rate-limit keys. Behind Vercel/most proxies the
// left-most x-forwarded-for entry is the real client.
export function clientIp(req: NextRequest): string {
  return (
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

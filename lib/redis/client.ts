import { Redis } from "@upstash/redis";

// ── Cache + rate-limit backend (Upstash REST) ────────────────────────────────
// REST over HTTPS, so it works from Vercel serverless functions without a
// persistent TCP connection (the right fit for this app). Configured via
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. Every helper below no-ops
// gracefully when those aren't set (local dev) or if a call throws, so a Redis
// outage can never take the site down with it.
let _rest: Redis | null | undefined;

export function getRestRedis(): Redis | null {
  if (_rest !== undefined) return _rest;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  _rest = url && token ? new Redis({ url, token }) : null;
  return _rest;
}

// @upstash/redis auto-serializes JSON, so store/read plain objects directly —
// no manual JSON.stringify/parse.
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRestRedis();
  if (!redis) return null;
  try {
    return (await redis.get<T>(key)) ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRestRedis();
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Cache write failures are non-fatal — the caller recomputes next time.
  }
}

export async function cacheInvalidate(...keys: string[]): Promise<void> {
  const redis = getRestRedis();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // Non-fatal — stale entries expire on their own TTL.
  }
}

// ── BullMQ connection (native TCP) ────────────────────────────────────────────
// BullMQ needs a blocking TCP connection, which the REST client can't provide.
// It stays dormant unless a native REDIS_URL (rediss://…) is supplied; without
// it, notifications send inline (best-effort, no retries) — see
// lib/queue/notification.queue.ts. Wire a TCP Redis here only if you need
// durable, retried notification delivery.
export function createQueueConnection():
  | { url: string; maxRetriesPerRequest: null; enableReadyCheck: false }
  | null {
  if (!process.env.REDIS_URL) return null;
  return {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

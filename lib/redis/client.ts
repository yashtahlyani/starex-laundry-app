import { Redis } from "ioredis";

const isRedisConfigured = () => !!process.env.REDIS_URL;

// General-purpose cache connection (maxRetriesPerRequest: 3 is safe for cache ops)
let _cache: Redis | null = null;

export function getCacheRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (_cache) return _cache;
  _cache = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  return _cache;
}

// BullMQ bundles its own ioredis — passing a plain options object avoids the
// type mismatch between the two ioredis versions in node_modules.
export function createQueueConnection(): { url: string; maxRetriesPerRequest: null; enableReadyCheck: false } | null {
  if (!isRedisConfigured()) return null;
  return {
    url: process.env.REDIS_URL!,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

// Cache helpers gracefully no-op when Redis is not configured (local dev without Redis)
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getCacheRedis();
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getCacheRedis();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheInvalidate(...keys: string[]): Promise<void> {
  const redis = getCacheRedis();
  if (!redis || keys.length === 0) return;
  await redis.del(...keys);
}

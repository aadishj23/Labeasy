import { Redis } from "@upstash/redis";

// Singleton Upstash Redis client built from env (UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN). Returns null if not configured, so callers can
// degrade gracefully (no caching) instead of failing.
let client: Redis | null = null;
let initialized = false;

export function getRedis(): Redis | null {
  if (initialized) return client;
  initialized = true;
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      client = Redis.fromEnv();
    }
  } catch {
    client = null;
  }
  return client;
}

/**
 * Cache-aside helper. Returns the cached value when present; otherwise runs
 * `fn`, caches it for `ttlSeconds`, and returns it. Any Redis error falls back
 * to running `fn` directly — caching never breaks the request.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();

  try {
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    /* cache read failed — fall through to source */
  }

  const value = await fn();

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    /* cache write failed — ignore */
  }
  return value;
}

export async function cacheInvalidate(...keys: string[]) {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    /* ignore */
  }
}

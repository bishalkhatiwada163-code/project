/**
 * Simple in-memory TTL cache for server-side data.
 * Not suitable for multi-instance deployments — consider Redis for that.
 */
type Entry = { value: any; expiresAt: number };

const store = new Map<string, Entry>();

// Default in-memory implementations
export function inMemoryGet(key: string) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function inMemorySet(key: string, value: any, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });
}

export async function inMemoryFetchOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = inMemoryGet(key) as T | null;
  if (cached) return cached;
  const fresh = await fetcher();
  inMemorySet(key, fresh, ttlSeconds);
  return fresh;
}

export function inMemoryDel(key: string) {
  store.delete(key);
}

export function inMemoryKeys() {
  return Array.from(store.keys());
}

// Pluggable adapter — by default use in-memory adapter; switch to Redis if configured
let getImpl: (key: string) => Promise<any> | any = inMemoryGet;
let setImpl: (key: string, value: any, ttlSeconds?: number) => Promise<void> | void = inMemorySet;
let fetchOrSetImpl: <T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>) => Promise<T> = inMemoryFetchOrSet;
let delImpl: (key: string) => Promise<void> | void = inMemoryDel;
let keysImpl: (pattern?: string) => Promise<string[] | string[] > = inMemoryKeys as any;

if (process.env.USE_REDIS === 'true' || !!process.env.REDIS_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const redisAdapter = require('./cache-redis');
    // The adapter exports async methods
    getImpl = redisAdapter.get;
    setImpl = redisAdapter.set;
    fetchOrSetImpl = redisAdapter.fetchOrSet;
    delImpl = redisAdapter.del;
    keysImpl = redisAdapter.keys;
  } catch (err) {
    // If Redis adapter can't be loaded, fall back to in-memory quietly
    // This could occur in environments without ioredis installed
  }
}

export function get(key: string) {
  return getImpl(key);
}

export function set(key: string, value: any, ttlSeconds = 300) {
  return setImpl(key, value, ttlSeconds);
}

export function fetchOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  return fetchOrSetImpl<T>(key, ttlSeconds, fetcher);
}

export function del(key: string) {
  return delImpl(key);
}

export function keys(pattern?: string) {
  return keysImpl(pattern || '*');
}

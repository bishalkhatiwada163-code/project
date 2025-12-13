import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379';
const client = new Redis(redisUrl);

type Fetcher<T> = () => Promise<T>;

async function get(key: string) {
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function set(key: string, value: any, ttlSeconds = 300) {
  try {
    const raw = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await client.set(key, raw, 'EX', ttlSeconds);
    } else {
      await client.set(key, raw);
    }
  } catch (err) {
    // swallow errors — falling back is the safer option
  }
}

async function del(key: string) {
  try {
    await client.del(key);
  } catch (err) {
    // ignore
  }
}

async function keys(pattern = '*') {
  const found: string[] = [];
  try {
    let cursor = '0';
    do {
      // @ts-ignore ioredis returns a two-item array: [cursor, items]
      const [nextCursor, items] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor as string;
      found.push(...items as string[]);
    } while (cursor !== '0');
  } catch (err) {
    // ignore
  }
  return found;
}

async function fetchOrSet<T>(key: string, ttlSeconds: number, fetcher: Fetcher<T>): Promise<T> {
  const cached = await get(key) as T | null;
  if (cached != null) return cached;
  const fresh = await fetcher();
  await set(key, fresh, ttlSeconds);
  return fresh;
}

export { get, set, del, keys, fetchOrSet, client };

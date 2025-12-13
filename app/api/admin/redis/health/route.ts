import { NextResponse } from 'next/server';

export async function GET() {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
  if (!redisUrl) return NextResponse.json({ success: false, available: false, reason: 'REDIS_URL not configured' });
  try {
    // Try to import redis client from adapter if available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapter = require('@/server/cache-redis');
    if (adapter && adapter.client) {
      const pong = await adapter.client.ping();
      return NextResponse.json({ success: true, available: pong === 'PONG' });
    }
  } catch (err) {
    return NextResponse.json({ success: false, available: false, reason: String(err) });
  }
  return NextResponse.json({ success: false, available: false, reason: 'Unknown' });
}

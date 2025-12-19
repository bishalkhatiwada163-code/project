import { NextResponse } from 'next/server';
import { fetchOrSet } from '@/server/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MOCK_PLAYER = {
  id: 'p1',
  name: 'John Doe',
  position: 'Forward',
  age: 28,
  nationality: 'England',
  injuries: [ { id: 'i1', status: 'Out', reason: 'Hamstring', expectedReturn: '2025-12-23' } ],
};

async function fetchFromExternal(template?: string, playerId?: string) {
  if (!template || !playerId) return null;
  const target = template.replace('{playerId}', encodeURIComponent(playerId));
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(target, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { playerId: string } }) {
  const playerId = params.playerId;
  const template = process.env.ESPN_PLAYER_TEMPLATE;
  const cacheKey = `player:${playerId}`;
  const ttl = Number(process.env.CACHE_TTL_PLAYER || '3600');

  const data = await fetchOrSet(cacheKey, ttl, async () => {
    if (template) {
      const remote = await fetchFromExternal(template, playerId);
      if (remote) return remote;
    }
    return MOCK_PLAYER;
  });

  return NextResponse.json({ success: true, data });
}

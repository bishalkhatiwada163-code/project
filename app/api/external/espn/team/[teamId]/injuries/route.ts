import { NextResponse } from 'next/server';
import { fetchOrSet } from '@/server/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MOCK_INJURIES = [
  { id: 'p1', name: 'John Doe', position: 'Forward', status: 'Out', reason: 'Hamstring', expectedReturn: '2025-12-23' },
  { id: 'p2', name: 'Alex Smith', position: 'Midfielder', status: 'Doubtful', reason: 'Ankle', expectedReturn: null },
];

async function fetchFromExternal(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = params;
  const url = new URL(request.url);
  const sport = url.searchParams.get('sport') || 'football';

  const template = process.env.ESPN_TEAM_INJURIES_TEMPLATE;
  const cacheKey = `team:${sport}:${teamId}:injuries`;
  const ttl = Number(process.env.CACHE_TTL_INJURIES || '300');

  const data = await fetchOrSet(cacheKey, ttl, async () => {
    if (template) {
      const target = template.replace('{sport}', sport).replace('{teamId}', encodeURIComponent(teamId));
      const remote = await fetchFromExternal(target);
      if (remote) {
        if (Array.isArray(remote.injuries)) {
          return remote.injuries.map((i: any) => ({
            id: i.athlete?.id || i.id,
            name: i.athlete?.fullName || i.athlete?.displayName || i.athlete?.shortName,
            position: i.athlete?.position?.name || i.athlete?.position?.displayName || null,
            status: i.type?.description || i.status || (i.athlete?.status || null),
            reason: i.details?.type || i.details?.detail || i.type?.description || null,
            expectedReturn: i.details?.returnDate || i.details?.return || null,
          }));
        }

        if (Array.isArray(remote.players)) {
          return remote.players.map((p: any) => ({
            id: p.id || p.playerId || p.slug,
            name: p.fullName || p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            position: p.position || p.role || p.primaryPosition || null,
            status: p.injuryStatus || p.status || (p.isInjured ? 'Out' : 'Active'),
            reason: p.injuryType || p.injury || p.reason || null,
            expectedReturn: p.expectedReturn || p.returnDate || null,
          }));
        }

        if (Array.isArray(remote)) return remote;
        if (Array.isArray(remote.data)) return remote.data;
      }
    }

    return MOCK_INJURIES;
  });

  return NextResponse.json({ success: true, data });
}

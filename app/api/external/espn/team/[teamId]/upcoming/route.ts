import { NextResponse } from 'next/server';
import { Match } from '@/lib/types';
import { fetchOrSet } from '@/server/cache';

// Helper that fetches from a configured template or falls back to filtering
async function fetchFromExternal(url: string | undefined) {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
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

  // If a template is configured, call it
  const template = process.env.ESPN_TEAM_UPCOMING_TEMPLATE;
  if (template) {
    const target = template.replace('{sport}', sport).replace('{teamId}', encodeURIComponent(teamId));
    const remote = await fetchFromExternal(target);
    if (remote) {
      if (Array.isArray(remote)) return NextResponse.json({ success: true, data: remote });
      if (Array.isArray(remote?.data)) return NextResponse.json({ success: true, data: remote.data });
      if (Array.isArray(remote.events)) {
        const mapped = remote.events.map((e: any) => {
          const comp = e.competitions?.[0];
          const competitors = comp?.competitors || [];
          const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
          const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || competitors[0];
          return {
            id: e.id || comp?.id || `${e.id}-${Math.random().toString(36).slice(2, 7)}`,
            sport,
            league: comp?.league?.name || remote.sport?.name || '',
            homeTeam: { id: String(home?.team?.id || home?.id || ''), name: home?.team?.displayName || home?.team?.name || home?.team?.abbreviation },
            awayTeam: { id: String(away?.team?.id || away?.id || ''), name: away?.team?.displayName || away?.team?.name || away?.team?.abbreviation },
            startTime: e.date || comp?.date,
            status: comp?.status?.type?.name?.toLowerCase() === 'status' ? comp?.status?.type?.state?.toLowerCase() : comp?.status?.type?.name?.toLowerCase(),
            venue: comp?.venue?.fullName || comp?.venue?.displayName || '',
          };
        });
        return NextResponse.json({ success: true, data: mapped });
      }
    }
  }

  // Otherwise, try to read the global upcoming feed and filter by team
  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const res = await fetch(`${base}/api/matches/upcoming`, { cache: 'no-store' });
    const cacheKey = `team:${sport}:${teamId}:upcoming`;
    const ttl = Number(process.env.CACHE_TTL_UPCOMING || '60');
    const data = await fetchOrSet(cacheKey, ttl, async () => {
      if (template) {
        const target = template.replace('{sport}', sport).replace('{teamId}', encodeURIComponent(teamId));
        const remote = await fetchFromExternal(target);
        if (remote) {
          if (Array.isArray(remote)) return remote;
          if (Array.isArray(remote?.data)) return remote.data;
          if (Array.isArray(remote.events)) {
            const mapped = remote.events.map((e: any) => {
              const comp = e.competitions?.[0];
              const competitors = comp?.competitors || [];
              const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
              const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || competitors[0];
              return {
                id: e.id || comp?.id || `${e.id}-${Math.random().toString(36).slice(2, 7)}`,
                sport,
                league: comp?.league?.name || remote.sport?.name || '',
                homeTeam: { id: String(home?.team?.id || home?.id || ''), name: home?.team?.displayName || home?.team?.name || home?.team?.abbreviation },
                awayTeam: { id: String(away?.team?.id || away?.id || ''), name: away?.team?.displayName || away?.team?.name || away?.team?.abbreviation },
                startTime: e.date || comp?.date,
                status: comp?.status?.type?.name?.toLowerCase() === 'status' ? comp?.status?.type?.state?.toLowerCase() : comp?.status?.type?.name?.toLowerCase(),
                venue: comp?.venue?.fullName || comp?.venue?.displayName || '',
              };
            });
            return mapped;
          }
        }
      }

      // Fallback: read global upcoming feed
      try {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const res = await fetch(`${base}/api/matches/upcoming`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const matches: Match[] = json?.data || [];
          const teamMatches = matches.filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
          return teamMatches;
        }
      } catch (err) {
        // ignore
      }

      return [];
    });

    return NextResponse.json({ success: true, data });

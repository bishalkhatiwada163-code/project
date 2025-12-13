import { NextResponse } from 'next/server';
import { fetchOrSet } from '@/server/cache';
import { normalizeEventsToRecent } from '@/server/adapters/espn';

/**
 * Returns recent matches for a given team. This endpoint attempts to use
 * a configured external ESPN-like feed (via env var), and falls back to
 * mock data so frontend works without an external service.
 */

// Generate realistic mock data based on team ID
function generateMockRecent(teamId: string) {
  const seed = parseInt(teamId) || teamId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const results = ['W', 'W', 'L', 'D', 'W', 'L', 'D', 'W', 'W', 'L'];
  const opponents = ['Arsenal', 'Man City', 'Liverpool', 'Chelsea', 'Tottenham', 'Man United', 'Newcastle', 'Brighton', 'Aston Villa', 'West Ham'];
  
  const recent = [];
  for (let i = 0; i < 5; i++) {
    const idx = (seed + i) % results.length;
    const result = results[idx];
    const opponent = opponents[idx];
    
    let score;
    if (result === 'W') {
      score = `${2 + (idx % 3)}-${idx % 2}`;
    } else if (result === 'L') {
      score = `${idx % 2}-${2 + (idx % 3)}`;
    } else {
      score = `${1 + (idx % 2)}-${1 + (idx % 2)}`;
    }
    
    recent.push({
      id: `r${i + 1}`,
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      opponent,
      score,
      result
    });
  }
  
  return recent;
}

const MOCK_RECENT = generateMockRecent('default');

async function fetchFromExternal(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`⚠️  Fetch returned ${res.status} for ${url}`);
      return null;
    }
    const data = await res.json();
    console.log(`✅ Got response from ${url}`);
    return data;
  } catch (err) {
    console.warn(`⚠️  Fetch error for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  const { teamId } = params;

  // Allow callers to pass sport query param
  const url = new URL(request.url);
  const sport = url.searchParams.get('sport') || 'football';

  console.log(`📥 Recent endpoint called for team ${teamId} (sport: ${sport})`);

  // If the user configured a template URL, use it (replace {sport} and {teamId})
  const template = process.env.ESPN_TEAM_RECENT_TEMPLATE;

  // Fallback templates by sport (best-effort)
  const fallbackTemplates: string[] = [];
  if (sport === 'football') {
    fallbackTemplates.push(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/{teamId}/schedule',
      'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/{teamId}/schedule',
      'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/{teamId}/schedule',
      'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams/{teamId}/schedule',
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams/{teamId}/schedule'
    );
  } else if (sport === 'basketball') {
    fallbackTemplates.push(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{teamId}/schedule'
    );
  } else if (sport === 'cricket') {
    fallbackTemplates.push(
      'https://site.api.espn.com/apis/site/v2/sports/cricket/teams/{teamId}/schedule'
    );
  }

  // Use cache to avoid excessive external requests
  const cacheKey = `team:${sport}:${teamId}:recent`;
  const ttl = Number(process.env.CACHE_TTL_RECENT || '300');
  const data = await fetchOrSet(cacheKey, ttl, async () => {
    const templatesToTry = [template, ...fallbackTemplates].filter(Boolean) as string[];

    for (const tpl of templatesToTry) {
      const target = tpl.replace('{sport}', sport).replace('{teamId}', encodeURIComponent(teamId));
      console.log(`  Trying: ${target}`);
      const remote = await fetchFromExternal(target);
      if (remote) {
        if (Array.isArray(remote)) {
          console.log(`  ✅ Got array response with ${remote.length} items`);
          return remote;
        }
        if (Array.isArray(remote?.data)) {
          console.log(`  ✅ Got data array with ${remote.data.length} items`);
          return remote.data;
        }
        const eventsList = remote.events || remote.team?.events || [];
        if (Array.isArray(eventsList) && eventsList.length) {
          console.log(`  ✅ Got ${eventsList.length} events, normalizing...`);
          const events = normalizeEventsToRecent(eventsList, String(teamId));
          if (events.length) {
            console.log(`  ✅ Normalized to ${events.length} completed matches`);
            return events;
          }
        }
      }
    }

    // Nothing remote; return mock data with varied results based on team ID
    console.log(`  ⚠️  No remote data, returning mock for team ${teamId}`);
    return generateMockRecent(teamId);
  });

  console.log(`📤 Returning ${data.length} recent matches for team ${teamId}`);
  return NextResponse.json({ success: true, data });
}

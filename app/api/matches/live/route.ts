import { NextResponse } from 'next/server';
import { Match } from '@/lib/types';

// Mock data for live matches (one per sport to keep responses light and reliable)
const mockLiveMatches: Match[] = [
  {
    id: 'live-football-1',
    sport: 'football',
    homeTeam: {
      id: 'chelsea',
      name: 'Chelsea',
      logo: 'https://resources.premierleague.com/premierleague/badges/100/t8.png',
      form: 'WWDLW',
      ranking: 4,
      recentGoals: 9,
      recentConceded: 4,
    },
    awayTeam: {
      id: 'arsenal',
      name: 'Arsenal',
      logo: 'https://resources.premierleague.com/premierleague/badges/100/t3.png',
      form: 'WWWWL',
      ranking: 3,
      recentGoals: 13,
      recentConceded: 5,
    },
    homeScore: 1,
    awayScore: 2,
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'Premier League',
    venue: 'Stamford Bridge',
    minute: 62,
  },
  {
    id: 'live-basketball-1',
    sport: 'basketball',
    homeTeam: {
      id: 'lal',
      name: 'LA Lakers',
      logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
      form: 'WLWWW',
      ranking: 5,
      recentGoals: 520,
      recentConceded: 498,
    },
    awayTeam: {
      id: 'gsw',
      name: 'Golden State Warriors',
      logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
      form: 'WWLWW',
      ranking: 4,
      recentGoals: 528,
      recentConceded: 505,
    },
    homeScore: 78,
    awayScore: 81,
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'NBA',
    venue: 'Crypto.com Arena',
    minute: 34,
  },
  {
    id: 'live-cricket-1',
    sport: 'cricket',
    homeTeam: {
      id: 'ind',
      name: 'India',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Cricket_India_Crest.svg/200px-Cricket_India_Crest.svg.png',
      form: 'WWWLW',
      ranking: 1,
      recentGoals: 1460,
      recentConceded: 1325,
    },
    awayTeam: {
      id: 'aus',
      name: 'Australia',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Cricket_Australia.svg/200px-Cricket_Australia.svg.png',
      form: 'WLWWW',
      ranking: 2,
      recentGoals: 1475,
      recentConceded: 1340,
    },
    homeScore: 212,
    awayScore: 198,
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'ODI Series',
    venue: 'Melbourne Cricket Ground',
    minute: 38,
  },
  {
    id: 'live-cricket-2',
    sport: 'cricket',
    homeTeam: {
      id: 'eng',
      name: 'England',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/England_Cricket_Board.svg/200px-England_Cricket_Board.svg.png',
      form: 'WLWLW',
      ranking: 3,
      recentGoals: 1420,
      recentConceded: 1380,
    },
    awayTeam: {
      id: 'pak',
      name: 'Pakistan',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Pakistan_Cricket_Board_Logo.svg/200px-Pakistan_Cricket_Board_Logo.svg.png',
      form: 'LWLWW',
      ranking: 5,
      recentGoals: 1390,
      recentConceded: 1410,
    },
    homeScore: 165,
    awayScore: 142,
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'T20 International',
    venue: 'Lords Cricket Ground',
    minute: 28,
  },
  {
    id: 'live-cricket-3',
    sport: 'cricket',
    homeTeam: {
      id: 'mi',
      name: 'Mumbai Indians',
      logo: 'https://documents.iplt20.com/ipl/MI/logos/Logooutline/MIoutline.png',
      form: 'WWLWW',
      ranking: 2,
      recentGoals: 890,
      recentConceded: 845,
    },
    awayTeam: {
      id: 'csk',
      name: 'Chennai Super Kings',
      logo: 'https://documents.iplt20.com/ipl/CSK/Logos/Logooutline/CSKoutline.png',
      form: 'WLWWL',
      ranking: 1,
      recentGoals: 920,
      recentConceded: 860,
    },
    homeScore: 187,
    awayScore: 145,
    status: 'live',
    startTime: new Date().toISOString(),
    league: 'Indian Premier League',
    venue: 'Wankhede Stadium',
    minute: 15,
  },
];

async function fetchRemoteLiveMatches(): Promise<Match[] | null> {
  // Scrape ESPN web scoreboards (free but unstable)
  console.log('🔄 Fetching live matches from ESPN...');
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const endpoints = [
    // Football
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', sport: 'football' as const, league: 'Premier League' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard', sport: 'football' as const, league: 'MLS' },
    
    // Basketball
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', sport: 'basketball' as const, league: 'NBA' },
    
    // Cricket - Only International and BBL
    { url: 'https://site.api.espn.com/apis/site/v2/sports/cricket/int/scoreboard', sport: 'cricket' as const, league: 'International Cricket' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/cricket/aus-bbl/scoreboard', sport: 'cricket' as const, league: 'Big Bash League' },
  ];

  const results: Match[] = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Fetching ${endpoint.sport} (${endpoint.league})...`);
      
      const res = await fetch(endpoint.url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) {
        console.log(`⚠️  ESPN ${endpoint.sport} returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      const events = data.events || [];
      
      console.log(`   Found ${events.length} total events`);

      // Filter for ONLY live matches (currently in progress)
      const liveEvents = events.filter((e: any) => {
        const state = e.status?.type?.state || '';
        const completed = e.status?.type?.completed || false;
        return (state === 'in' && !completed);
      }).slice(0, 3);

      console.log(`   ${liveEvents.length} are LIVE right now`);

      liveEvents.forEach((e: any) => {
        const comp = e.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

        const match: Match = {
          id: e.id || `${endpoint.sport}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sport: endpoint.sport,
          homeTeam: {
            id: home.team?.id || 'home',
            name: home.team?.displayName || home.team?.name || home.team?.shortDisplayName || 'Home',
            logo: home.team?.logo || home.team?.logos?.[0]?.href || '',
            form: 'N/A',
            ranking: 0,
            recentGoals: Number(home.score) || 0,
            recentConceded: Number(away.score) || 0,
          },
          awayTeam: {
            id: away.team?.id || 'away',
            name: away.team?.displayName || away.team?.name || away.team?.shortDisplayName || 'Away',
            logo: away.team?.logo || away.team?.logos?.[0]?.href || '',
            form: 'N/A',
            ranking: 0,
            recentGoals: Number(away.score) || 0,
            recentConceded: Number(home.score) || 0,
          },
          homeScore: Number(home.score) || 0,
          awayScore: Number(away.score) || 0,
          status: 'live' as const,
          startTime: e.date || new Date().toISOString(),
          league: comp.league?.name || endpoint.league,
          venue: comp.venue?.fullName || 'TBA',
          minute: parseInt(comp.status?.displayClock?.split(':')[0]) || 0,
        };

        console.log(`   🔴 LIVE: ${match.homeTeam.name} ${match.homeScore}-${match.awayScore} ${match.awayTeam.name}`);
        results.push(match);
      });
    } catch (err) {
      console.error(`❌ Error fetching ${endpoint.sport}:`, err instanceof Error ? err.message : err);
    }
  }

  clearTimeout(timeout);
  
  if (results.length > 0) {
    console.log(`✅ ${results.length} LIVE matches found from ESPN API`);
    console.log(`   ⚽ Football: ${results.filter(m => m.sport === 'football').length}`);
    console.log(`   🏀 Basketball: ${results.filter(m => m.sport === 'basketball').length}`);
    console.log(`   🏏 Cricket: ${results.filter(m => m.sport === 'cricket').length}`);
    return results;
  }
  
  console.log('⚠️  No live matches happening right now from ESPN API');
  return [];
}

async function hydrateForms(matches: Match[]): Promise<Match[]> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || 'http://localhost:3000';
  const cache = new Map<string, string | null>();

  async function fetchForm(teamId: string, sport: string): Promise<string | null> {
    const key = `${sport}:${teamId}`;
    if (cache.has(key)) return cache.get(key) || null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${base}/api/external/espn/team/${encodeURIComponent(teamId)}/recent?sport=${encodeURIComponent(sport)}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      if (!res.ok) {
        console.warn(`⚠️  Form fetch failed for team ${teamId}: ${res.status}`);
        cache.set(key, null);
        return null;
      }
      const json = await res.json();
      const recent = Array.isArray(json.data) ? json.data : [];
      // Ensure most recent match appears first
      recent.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const letters = recent
        .slice(0, 5)
        .map((r: any) => (r.result || '').toUpperCase()[0])
        .filter((c: string) => ['W', 'D', 'L'].includes(c));
      const form = letters.length ? letters.join('') : null;
      console.log(`✅ Form for team ${teamId} (${sport}): ${form || 'N/A'}`);
      cache.set(key, form);
      return form;
    } catch (err) {
      console.warn(`❌ Error fetching form for team ${teamId}:`, err instanceof Error ? err.message : err);
      return null;
    }
  }

  console.log(`🔄 Hydrating forms for ${matches.length} live matches`);
  for (const m of matches) {
    if (!m.homeTeam.form || m.homeTeam.form === 'N/A') {
      const f = await fetchForm(String(m.homeTeam.id), m.sport);
      if (f) {
        m.homeTeam.form = f;
        console.log(`   Set ${m.homeTeam.name} form to ${f}`);
      }
    }
    if (!m.awayTeam.form || m.awayTeam.form === 'N/A') {
      const f = await fetchForm(String(m.awayTeam.id), m.sport);
      if (f) {
        m.awayTeam.form = f;
        console.log(`   Set ${m.awayTeam.name} form to ${f}`);
      }
    }
  }

  return matches;
}

export async function GET(request: Request) {
  // Try to fetch real-time matches if an external feed is configured
  // cache live matches for a short period to reduce external requests
  const { fetchOrSet } = await import('@/server/cache');
  const sportsParam = (() => {
    try { const url = new URL(request.url); return url.searchParams.get('sports'); } catch { return null }
  })();
  const cacheKey = `live:${sportsParam || 'all'}`;
  const ttl = Number(process.env.CACHE_TTL_LIVE || '10');
  const remote = await fetchOrSet(cacheKey, ttl, fetchRemoteLiveMatches);
  let data = remote || [];

  // Precompute form to avoid client fetches
  data = await hydrateForms(data);

  // Parse query parameter for sports filtering. Support `sports=football,basketball`
  try {
    const url = new URL(request.url);
    const sportsParam = url.searchParams.get('sports');
    const allowedDefault = ['football', 'basketball', 'cricket'];
    if (sportsParam) {
      const requested = sportsParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (requested.length > 0) {
        data = data.filter((m) => requested.includes(m.sport));
      }
    } else {
      // If no param provided, default to only the three sports requested
      data = data.filter((m) => allowedDefault.includes(m.sport));
    }
  } catch (err) {
    // ignore and return data unfiltered
  }

  // Simulate API delay for UX consistency
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

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
];

async function fetchRemoteLiveMatches(): Promise<Match[] | null> {
  const url = process.env.LIVE_MATCHES_URL;
  if (!url) return null;

  const headers: Record<string, string> = {};
  if (process.env.LIVE_MATCHES_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.LIVE_MATCHES_API_KEY}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    // Expecting the remote API to return { data: Match[] } or Match[] directly
    const matches: Match[] = Array.isArray(data) ? data : data?.data;
    if (!Array.isArray(matches)) return null;
    return matches;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  // Try to fetch real-time matches if an external feed is configured
  const remote = await fetchRemoteLiveMatches();
  const data = remote && remote.length > 0 ? remote : mockLiveMatches;

  // Simulate API delay for UX consistency
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

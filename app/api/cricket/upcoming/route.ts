import { NextResponse } from 'next/server';
import { Match } from '@/lib/types';
import { fetchOrSet } from '@/server/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dedicated API endpoint for fetching upcoming cricket matches from NATIONAL TEAMS ONLY
 * This endpoint provides coverage of upcoming international cricket:
 * - T20 Internationals
 * - One Day Internationals (ODI)
 * - Test Matches
 * Only matches between national teams are included (no franchise leagues)
 */

const INTERNATIONAL_CRICKET_LEAGUES = [
  // International Cricket Only
  { slug: 'int', name: 'International Cricket', priority: 1 },
];

async function fetchUpcomingCricketMatches(): Promise<Match[]> {
  console.log('🏏 Fetching upcoming cricket matches from international leagues...');
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  const results: Match[] = [];
  
  // Fetch from international leagues only
  const promises = INTERNATIONAL_CRICKET_LEAGUES.map(async (league) => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/cricket/${league.slug}/scoreboard`;
      console.log(`📡 Fetching ${league.name}...`);
      
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) {
        console.log(`⚠️  ${league.name} returned ${res.status}`);
        return [];
      }

      const data = await res.json();
      const events = data.events || [];
      
      console.log(`   Found ${events.length} events in ${league.name}`);

      // Filter for ONLY upcoming matches (scheduled, not started yet)
      const upcomingEvents = events.filter((e: any) => {
        const state = e.status?.type?.state || '';
        const completed = e.status?.type?.completed || false;
        return (state === 'pre' && !completed);
      });

      console.log(`   ${upcomingEvents.length} are UPCOMING in ${league.name}`);

      return upcomingEvents.map((e: any) => {
        const comp = e.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

        // Get match format (T20I, ODI, Test)
        const matchFormat = e.name || comp.type?.abbreviation || 'International';

        const match: Match = {
          id: e.id || `cricket-${league.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sport: 'cricket',
          homeTeam: {
            id: home.team?.id || 'home',
            name: home.team?.displayName || home.team?.name || home.team?.shortDisplayName || 'Team 1',
            logo: home.team?.logo || home.team?.logos?.[0]?.href || '',
            ranking: home.team?.rank || undefined,
          },
          awayTeam: {
            id: away.team?.id || 'away',
            name: away.team?.displayName || away.team?.name || away.team?.shortDisplayName || 'Team 2',
            logo: away.team?.logo || away.team?.logos?.[0]?.href || '',
            ranking: away.team?.rank || undefined,
          },
          homeScore: undefined,
          awayScore: undefined,
          status: 'upcoming',
          startTime: e.date || new Date().toISOString(),
          league: matchFormat,
          venue: comp.venue?.fullName || e.location || '',
        };

        return match;
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log(`⏱️  ${league.name} timed out`);
      } else {
        console.error(`❌ Error fetching ${league.name}:`, err.message);
      }
      return [];
    }
  });

  try {
    const arrays = await Promise.allSettled(promises);
    clearTimeout(timeout);

    // Combine all matches
    for (const result of arrays) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    }

    console.log(`✅ Total upcoming international matches found: ${results.length}`);

    // Sort by start time (soonest first)
    results.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });

    return results;
  } catch (error) {
    console.error('❌ Error in fetchUpcomingCricketMatches:', error);
    clearTimeout(timeout);
    return results;
  }
}

export async function GET(request: Request) {
  try {
    console.log('📥 GET /api/cricket/upcoming - fetching upcoming international cricket matches');

    // Cache for 5 minutes (300 seconds)
    const matches = await fetchOrSet(
      'cricket:upcoming:int',
      300,
      fetchUpcomingCricketMatches
    );

    // Filter to ensure we only have T20I, ODI, and Test matches
    const internationalMatches = matches.filter((match: Match) => {
      const league = match.league?.toLowerCase() || '';
      
      // Check if it's a T20I, ODI, or Test match
      return (
        league.includes('t20i') || 
        league.includes('odi') || 
        league.includes('test')
      );
    });

    console.log(`✅ Returning ${internationalMatches.length} upcoming international matches`);

    return NextResponse.json({
      success: true,
      count: internationalMatches.length,
      matches: internationalMatches,
      timestamp: new Date().toISOString(),
      source: 'ESPN Cricket API',
      cache: 'redis',
      ttl: 300,
    });
  } catch (error: any) {
    console.error('❌ Error in /api/cricket/upcoming:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch upcoming cricket matches',
        message: error.message,
        matches: [],
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { Match } from '@/lib/types';
import { fetchOrSet } from '@/server/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dedicated API endpoint for fetching live cricket matches from ALL major cricket leagues
 * This endpoint provides comprehensive coverage including:
 * - International Cricket (Tests, ODIs, T20Is)
 * - Major T20 Leagues (IPL, BBL, CPL, PSL, The Hundred, etc.)
 * - Domestic Competitions (County Championship, Sheffield Shield, Ranji Trophy, etc.)
 */

const CRICKET_LEAGUES = [
  // Only International Cricket (country vs country matches)
  { slug: 'int', name: 'International Cricket', priority: 1 },
];

async function fetchCricketMatches(): Promise<Match[]> {
  console.log('🏏 Fetching live cricket matches from all major leagues...');
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  const results: Match[] = [];
  
  // Fetch from all cricket leagues in parallel
  const promises = CRICKET_LEAGUES.map(async (league) => {
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

      // Get ALL events (live, scheduled, and upcoming) to show real matches
      const relevantEvents = events.filter((e: any) => {
        const completed = e.status?.type?.completed || false;
        return !completed; // Include all non-completed matches
      }).slice(0, 10); // Show up to 10 matches

      console.log(`   ${relevantEvents.length} matches found in ${league.name}`);

      return relevantEvents.map((e: any) => {
        const comp = e.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

        // Cricket-specific score extraction
        const homeScore = parseScore(home);
        const awayScore = parseScore(away);

        // Determine status based on game state
        const state = e.status?.type?.state || '';
        const matchStatus = state === 'in' ? 'live' : 'upcoming';

        const match: Match = {
          id: e.id || `cricket-${league.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sport: 'cricket',
          homeTeam: {
            id: home.team?.id || 'home',
            name: home.team?.displayName || home.team?.name || home.team?.shortDisplayName || 'Team 1',
            logo: home.team?.logo || home.team?.logos?.[0]?.href || '',
            form: extractFormFromStats(home),
            ranking: home.team?.rank || 0,
            recentGoals: 0,
            recentConceded: 0,
          },
          awayTeam: {
            id: away.team?.id || 'away',
            name: away.team?.displayName || away.team?.name || away.team?.shortDisplayName || 'Team 2',
            logo: away.team?.logo || away.team?.logos?.[0]?.href || '',
            form: extractFormFromStats(away),
            ranking: away.team?.rank || 0,
            recentGoals: 0,
            recentConceded: 0,
          },
          homeScore: homeScore.runs,
          awayScore: awayScore.runs,
          status: matchStatus as 'live' | 'upcoming',
          startTime: e.date || new Date().toISOString(),
          league: comp.league?.name || league.name,
          venue: comp.venue?.fullName || 'TBA',
          minute: 0, // Cricket doesn't have minutes, can use overs instead
        };

        const statusIcon = matchStatus === 'live' ? '🔴' : '📅';
        console.log(`   ${statusIcon} ${matchStatus.toUpperCase()}: ${match.homeTeam.name} ${homeScore.display} vs ${match.awayTeam.name} ${awayScore.display} - ${league.name}`);
        results.push(match);
      });
    } catch (err) {
      console.error(`❌ Error fetching ${league.name}:`, err instanceof Error ? err.message : err);
      return [];
    }
  });

  await Promise.all(promises);
  clearTimeout(timeout);
  
  // Sort by priority (higher priority leagues first) and then by start time
  results.sort((a, b) => {
    const leagueA = CRICKET_LEAGUES.find(l => a.league.includes(l.name)) || { priority: 999 };
    const leagueB = CRICKET_LEAGUES.find(l => b.league.includes(l.name)) || { priority: 999 };
    
    if (leagueA.priority !== leagueB.priority) {
      return leagueA.priority - leagueB.priority;
    }
    
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  console.log(`✅ ${results.length} LIVE cricket matches found across all leagues`);
  return results;
}

function parseScore(competitor: any): { runs: number, wickets: number, overs: string, display: string } {
  // ESPN cricket API returns scores in various formats
  // e.g., "245/7" or just "245" or nested in score.value
  const scoreStr = competitor.score?.displayValue || competitor.score?.value || competitor.score || '0';
  
  // Parse runs/wickets format (e.g., "245/7")
  const match = String(scoreStr).match(/(\d+)(?:\/(\d+))?/);
  const runs = match ? parseInt(match[1]) : 0;
  const wickets = match && match[2] ? parseInt(match[2]) : 0;
  
  // Get overs if available
  const overs = competitor.score?.overs || '';
  
  return {
    runs,
    wickets,
    overs,
    display: wickets > 0 ? `${runs}/${wickets}${overs ? ` (${overs})` : ''}` : `${runs}${overs ? ` (${overs})` : ''}`
  };
}

function extractFormFromStats(competitor: any): string {
  // Try to extract recent form from competitor stats if available
  const records = competitor.records || [];
  const recentResults = records
    .filter((r: any) => r.type === 'recent')
    .slice(0, 5)
    .map((r: any) => {
      const won = r.stats?.find((s: any) => s.name === 'wins')?.value || 0;
      return won > 0 ? 'W' : 'L';
    });
  
  return recentResults.length > 0 ? recentResults.join('') : 'N/A';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueFilter = searchParams.get('league')?.split(',') || [];
    
    // Cache cricket matches for 15 seconds to reduce API calls
    const cacheKey = 'cricket:live:all-leagues';
    const ttl = 15; // Short TTL for live data
    
    let matches = await fetchOrSet(cacheKey, ttl, fetchCricketMatches);
    
    // Filter by league if requested
    if (leagueFilter.length > 0) {
      matches = (matches || []).filter((match: Match) => {
        const matchLeague = match.league?.toLowerCase() || '';
        return leagueFilter.some(filter => 
          matchLeague.includes(filter.toLowerCase())
        );
      });
    }
    
    // Get unique leagues from results
    const uniqueLeagues = Array.from(new Set((matches || []).map(m => m.league)))
      .map(name => {
        const league = CRICKET_LEAGUES.find(l => name?.includes(l.name));
        return {
          name,
          slug: league?.slug || name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'
        };
      });
    
    return NextResponse.json({
      success: true,
      data: matches,
      count: (matches || []).length,
      timestamp: new Date().toISOString(),
      leagues: uniqueLeagues,
      availableLeagues: CRICKET_LEAGUES.map(l => ({ name: l.name, slug: l.slug })),
    });
  } catch (error) {
    console.error('Error in cricket live matches API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cricket matches',
      data: [],
    }, { status: 500 });
  }
}

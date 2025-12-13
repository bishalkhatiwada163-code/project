export function normalizeEventsToRecent(events: any[], teamId: string) {
  console.log(`   normalizeEventsToRecent: Processing ${events.length} events for team ${teamId}`);
  
  const completed = (events || []).filter((e: any) => {
    const completedFlag = e.status?.type?.completed || e.competitions?.[0]?.status?.type?.completed;
    const state = e.status?.type?.state;
    const isFinished = state === 'post' || completedFlag;
    return !!isFinished;
  });

  console.log(`   Found ${completed.length} completed events`);

  const sorted = completed.sort((a: any, b: any) => {
    const da = new Date(a.date || a.competitions?.[0]?.date || 0).getTime();
    const db = new Date(b.date || b.competitions?.[0]?.date || 0).getTime();
    return db - da; // newest first
  });

  const result = sorted.slice(0, 5).map((e: any) => {
    const comp = e.competitions?.[0] || e;
    if (!comp) return null;
    const competitors = comp.competitors || [];
    const teamEntry = competitors.find((c: any) => String(c.team?.id) === String(teamId));
    const opponentEntry = competitors.find((c: any) => c !== teamEntry) || competitors[0];
    const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
    const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || competitors[0];
    const teamIsHome = teamEntry?.homeAway === 'home';

    // Extract scores - handle both direct score and score.value
    const homeScore = Number(home.score?.value ?? home.score) || 0;
    const awayScore = Number(away.score?.value ?? away.score) || 0;
    const tScore = teamIsHome ? homeScore : awayScore;
    const oScore = teamIsHome ? awayScore : homeScore;
    
    // Determine result using if-else chain
    let result: string | undefined = undefined;
    if (tScore > oScore) {
      result = 'W';
    } else if (tScore === oScore) {
      result = 'D';
    } else if (tScore < oScore) {
      result = 'L';
    }

    return {
      id: e.id || e.shortName || `${e.id}-${Math.random().toString(36).slice(2, 7)}`,
      date: e.date || comp?.date,
      opponent: opponentEntry?.team?.displayName || opponentEntry?.team?.name || opponentEntry?.team?.abbreviation || opponentEntry?.team?.shortDisplayName,
      score: `${homeScore}-${awayScore}`,
      result,
    };
  }).filter(Boolean);

  console.log(`   Normalized to ${result.length} recent matches`);
  return result;
}

export function normalizeInjuries(remote: any[]) {
  return (remote || []).map((i: any) => ({
    id: i.athlete?.id || i.id,
    name: i.athlete?.fullName || i.athlete?.displayName || i.athlete?.shortName || i.name,
    position: i.athlete?.position?.name || i.athlete?.position?.displayName || i.position || null,
    status: i.type?.description || i.status || (i.athlete?.status || null),
    reason: i.details?.type || i.details?.detail || i.type?.description || null,
    expectedReturn: i.details?.returnDate || i.details?.return || null,
  }));
}

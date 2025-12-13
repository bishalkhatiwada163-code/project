/**
 * Simple cron task to warm caches by calling team endpoints.
 * This module schedules a job when imported.
 */
import cron from 'node-cron';
// Prefer native fetch; if unavailable, skip warming without error
const fetcher: typeof fetch | null = (globalThis as any).fetch || null;

const base = process.env.NEXT_PUBLIC_BASE_PATH || 'http://localhost:3000';
const interval = process.env.CACHE_WARM_CRON || '*/10 * * * *'; // default: every 10 minutes

async function warmCaches() {
  try {
    if (!fetcher) return;
    const res = await fetcher(`${base}/api/matches/upcoming`);
    if (!res.ok) return;
    const json = await res.json();
    const matches = json.data || [];
    const teamIds = new Set<string>();
    for (const m of matches) {
      if (m.homeTeam?.id) teamIds.add(String(m.homeTeam.id));
      if (m.awayTeam?.id) teamIds.add(String(m.awayTeam.id));
    }
    for (const id of teamIds) {
      const sport = matches.find((m: any) => m.homeTeam?.id == id || m.awayTeam?.id == id)?.sport || 'football';
      const endpoints = [
        `/api/external/espn/team/${encodeURIComponent(id)}/recent?sport=${encodeURIComponent(sport)}`,
        `/api/external/espn/team/${encodeURIComponent(id)}/injuries?sport=${encodeURIComponent(sport)}`,
        `/api/external/espn/team/${encodeURIComponent(id)}/upcoming?sport=${encodeURIComponent(sport)}`,
      ];
      for (const ep of endpoints) {
        try { await fetcher(`${base}${ep}`); } catch (err) { /* ignore */ }
      }
    }
  } catch (err) {
    // ignore
  }
}

// Schedule job
try {
  if (process.env.ENABLE_CACHE_WARM === 'true') {
    cron.schedule(interval, () => {
      warmCaches();
    });
  }
} catch (err) {
  // ignore
}

export { warmCaches };

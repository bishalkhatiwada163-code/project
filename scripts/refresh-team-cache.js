#!/usr/bin/env node
/**
 * Script to warm the server-side cache by calling team endpoints.
 * Requires the dev server to be running on localhost:3000 (or use NEXT_PUBLIC_BASE_PATH env).
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH || 'http://localhost:3000';
const fetch = global.fetch || require('node-fetch');

async function main() {
  console.log('Refreshing team cache...');
  try {
    const res = await fetch(`${base}/api/matches/upcoming`);
    const json = await res.json();
    const matches = json?.data || [];
    const teamIds = new Set();
    matches.forEach((m) => {
      if (m.homeTeam?.id) teamIds.add(String(m.homeTeam.id));
      if (m.awayTeam?.id) teamIds.add(String(m.awayTeam.id));
    });

    console.log(`Found ${teamIds.size} teams from upcoming matches. Refreshing their caches...`);
    for (const id of teamIds) {
      // For each sport we'll hit recent/injuries/upcoming; default sport to 'football' unless info exists in matches
      // Attempt to derive sport from match list
      const teamsMatches = matches.filter(m => m.homeTeam?.id == id || m.awayTeam?.id == id);
      const sport = teamsMatches[0]?.sport || 'football';
      const endpoints = [
        `/api/external/espn/team/${encodeURIComponent(id)}/recent?sport=${encodeURIComponent(sport)}`,
        `/api/external/espn/team/${encodeURIComponent(id)}/injuries?sport=${encodeURIComponent(sport)}`,
        `/api/external/espn/team/${encodeURIComponent(id)}/upcoming?sport=${encodeURIComponent(sport)}`,
      ];
      for (const ep of endpoints) {
        try {
          const r = await fetch(`${base}${ep}`);
          if (r.ok) console.log(`Refreshed ${ep}`);
          else console.log(`Failed to refresh ${ep}: ${r.status}`);
        } catch (err) {
          console.log(`Error refreshing ${ep}:`, err.message || err);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching upcoming matches', err);
  }
  console.log('Refresh complete.');
}

main();

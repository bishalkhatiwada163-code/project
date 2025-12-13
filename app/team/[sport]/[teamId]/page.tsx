import React from 'react';
import InjuriesClient from '@/components/InjuriesClient';
import { notFound } from 'next/navigation';

type Props = { params: { sport: string; teamId: string } };

async function fetchRecent(sport: string, teamId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/external/espn/team/${encodeURIComponent(teamId)}/recent?sport=${encodeURIComponent(sport)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

async function fetchInjuries(sport: string, teamId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/external/espn/team/${encodeURIComponent(teamId)}/injuries?sport=${encodeURIComponent(sport)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

async function fetchUpcoming(sport: string, teamId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/external/espn/team/${encodeURIComponent(teamId)}/upcoming?sport=${encodeURIComponent(sport)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

async function fetchLiveMatches(sport: string, teamId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/matches/live?sports=${encodeURIComponent(sport)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data || [];
  return data.filter((m: any) => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
}

export default async function TeamPage({ params }: Props) {
  const sport = params.sport;
  const teamId = params.teamId;

  const [recent, injuries, upcoming, liveMatches] = await Promise.all([
    fetchRecent(sport, teamId),
    fetchInjuries(sport, teamId),
    fetchUpcoming(sport, teamId),
    fetchLiveMatches(sport, teamId),
  ]);

  if (!recent && !injuries) return notFound();

  const wins = Array.isArray(recent)
    ? recent.filter((r: any) => r.result === 'W' || r.result === 'w' || (typeof r.result === 'string' && r.result.toUpperCase() === 'W')).length
    : 0;
  const draws = Array.isArray(recent)
    ? recent.filter((r: any) => r.result === 'D' || r.result === 'd' || (typeof r.result === 'string' && r.result.toUpperCase() === 'D')).length
    : 0;
  const losses = Array.isArray(recent) ? recent.length - wins - draws : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Team: {teamId}</h1>
          <div className="text-sm text-gray-400">Sport: {sport}</div>
        </div>
        <div className="text-sm text-gray-300">
          <div className="flex gap-4">
            <div><strong>{wins}</strong> W</div>
            <div><strong>{draws}</strong> D</div>
            <div><strong>{losses}</strong> L</div>
          </div>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Recent Matches</h2>
        {!recent || recent.length === 0 ? (
          <p className="text-sm text-gray-400">No recent matches available.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((m: any) => (
              <li key={m.id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between">
                <div>
                  <div className="font-medium">{m.opponent} — {m.score}</div>
                  <div className="text-xs text-gray-400">{new Date(m.date).toLocaleString()}</div>
                </div>
                <div className="text-sm font-semibold">{m.result}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Upcoming Matches</h2>
        {!upcoming || upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming matches available.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((m: any) => (
              <li key={m.id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-medium">{m.homeTeam?.name || m.opponent} vs {m.awayTeam?.name || ''}</div>
                  <div className="text-xs text-gray-400">{m.league} • {new Date(m.startTime || m.date).toLocaleString()}</div>
                </div>
                <div className="text-sm font-semibold">{m.status || 'upcoming'}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Live Matches</h2>
        {!liveMatches || liveMatches.length === 0 ? (
          <p className="text-sm text-gray-400">No live matches currently for this team.</p>
        ) : (
          <ul className="space-y-2">
            {liveMatches.map((m: any) => (
              <li key={m.id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <div className="font-medium">{m.homeTeam?.name} {m.homeScore} — {m.awayScore} {m.awayTeam?.name}</div>
                  <div className="text-xs text-gray-400">{m.league} • {m.venue}</div>
                </div>
                <div className="text-sm font-semibold">Live — {m.minute}'</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Injuries</h2>
        {!injuries || injuries.length === 0 ? (
          <p className="text-sm text-gray-400">No injuries reported.</p>
        ) : (
          <div className="space-y-2">
            <InjuriesClient injuries={injuries as any[]} sport={sport} />
          </div>
        )}
      </section>
    </div>
  );
}

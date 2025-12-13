import React from 'react';
import { notFound } from 'next/navigation';

type Props = { params: { sport: string; playerId: string } };

async function fetchPlayer(playerId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/external/espn/player/${encodeURIComponent(playerId)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

export default async function PlayerPage({ params }: Props) {
  const { playerId } = params;
  const player = await fetchPlayer(playerId);
  if (!player) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{player.name}</h1>
      <div className="space-y-3">
        <div>Position: <strong>{player.position}</strong></div>
        <div>Age: <strong>{player.age}</strong></div>
        <div>Nationality: <strong>{player.nationality}</strong></div>
        <div>
          <h2 className="font-semibold mt-4">Injuries</h2>
          {!player.injuries || player.injuries.length === 0 ? (
            <div className="text-sm text-gray-400">No current injuries.</div>
          ) : (
            <ul className="list-disc ml-5">
              {player.injuries.map((inj: any) => (
                <li key={inj.id} className="text-sm">{inj.reason} — {inj.status} (Return: {inj.expectedReturn || 'TBD'})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

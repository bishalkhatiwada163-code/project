"use client";

import React, { useState } from 'react';
import PlayerModal from './PlayerModal';

interface Injury {
  id: string;
  name: string;
  position?: string;
  status?: string;
  reason?: string;
  expectedReturn?: string;
}

export default function InjuriesList({ injuries, sport }: { injuries: Injury[]; sport: string }) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PlayerModal playerId={selectedPlayer || ''} isOpen={open} onClose={() => setOpen(false)} sport={sport} />
      <ul className="space-y-2">
        {injuries.map((inj) => (
          <li key={inj.id} className="p-3 rounded bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-medium">{inj.name} — {inj.status}</div>
              <div className="text-xs text-gray-400">{inj.reason} • Expected: {inj.expectedReturn || 'TBD'}</div>
            </div>
            <div>
              <button
                className="text-sm text-blue-400 hover:underline"
                onClick={() => {
                  setSelectedPlayer(inj.id);
                  setOpen(true);
                }}
              >
                View Player
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

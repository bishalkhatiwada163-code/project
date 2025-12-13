"use client";

import React from 'react';
import Modal from './AnalysisModal';
import useSWR from 'swr';

interface Props {
  playerId: string;
  isOpen: boolean;
  onClose: () => void;
  sport?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PlayerModal({ playerId, isOpen, onClose, sport = 'football' }: Props) {
  const { data, error } = useSWR(isOpen ? `/api/external/espn/player/${playerId}` : null, fetcher);
  const player = data?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={player?.name || 'Player Details'}>
      {!player ? (
        <div className="p-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="p-4 space-y-2">
          <div className="text-sm">Position: <strong>{player.position}</strong></div>
          <div className="text-sm">Nationality: <strong>{player.nationality}</strong></div>
          <div className="text-sm">Age: <strong>{player.age}</strong></div>
          <div className="text-sm">Current Injuries:</div>
          {player.injuries && player.injuries.length > 0 ? (
            <ul className="text-sm list-disc list-inside">
              {player.injuries.map((inj: any) => (
                <li key={inj.id}>{inj.reason} — {inj.status} (Return: {inj.expectedReturn || 'TBD'})</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-400">No injuries</div>
          )}
        </div>
      )}
    </Modal>
  );
}

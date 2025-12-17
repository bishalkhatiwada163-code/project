"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card w-full max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold gradient-text mb-4">
                {player?.name || 'Player Details'}
              </h2>
              {!player ? (
                <div className="p-4 text-sm text-gray-400">Loading...</div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm">Position: <strong className="text-white">{player.position}</strong></div>
                  <div className="text-sm">Nationality: <strong className="text-white">{player.nationality}</strong></div>
                  <div className="text-sm">Age: <strong className="text-white">{player.age}</strong></div>
                  <div className="text-sm font-semibold mt-4 mb-2">Current Injuries:</div>
                  {player.injuries && player.injuries.length > 0 ? (
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {player.injuries.map((inj: any) => (
                        <li key={inj.id} className="text-gray-300">
                          {inj.reason} — {inj.status} (Return: {inj.expectedReturn || 'TBD'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-400">No injuries</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MatchCard from '@/components/MatchCard';
import { Match, Prediction } from '@/lib/types';
import { calculatePrediction } from '@/lib/predictor';
import { Activity, Radio, Trophy } from 'lucide-react';

interface LeagueGroup {
  name: string;
  matches: Match[];
}

export default function CricketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetchMatches();
    // Refresh every 15 seconds for live data
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/cricket/live');
      const result = await response.json();
      
      if (result.success) {
        setMatches(result.data || []);
        setLeagues(result.availableLeagues || []);

        // Generate predictions for all matches
        const newPredictions = new Map<string, Prediction>();
        (result.data || []).forEach((match: Match) => {
          newPredictions.set(match.id, calculatePrediction(match));
        });
        setPredictions(newPredictions);
      }
    } catch (error) {
      console.error('Failed to fetch cricket matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group matches by league
  const groupedMatches: LeagueGroup[] = matches.reduce((acc: LeagueGroup[], match) => {
    const existingGroup = acc.find(g => g.name === match.league);
    if (existingGroup) {
      existingGroup.matches.push(match);
    } else {
      acc.push({ name: match.league, matches: [match] });
    }
    return acc;
  }, []);

  // Sort groups by priority (International first, then T20 leagues, then domestic)
  const priorityOrder = ['international', 'premier league', 'big bash', 'caribbean', 'pakistan super', 'hundred', 'sa20', 'ilt20', 't20 blast'];
  groupedMatches.sort((a, b) => {
    const aIndex = priorityOrder.findIndex(p => a.name.toLowerCase().includes(p));
    const bIndex = priorityOrder.findIndex(p => b.name.toLowerCase().includes(p));
    
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-cyan-500 border-opacity-70 rounded-full glow-cyan"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 sm:space-y-4"
      >
        <div className="flex items-center justify-center space-x-3 sm:space-x-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-4xl sm:text-5xl md:text-6xl">🏏</div>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">Cricket Live</h1>
        </div>
        <p className="text-gray-300 text-sm sm:text-base md:text-lg px-4">
          Real-time cricket matches from all major leagues worldwide
        </p>

        {/* Auto-refresh indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-sm text-gray-400"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-4 h-4 border-2 border-cyan-400 rounded-full"
          />
          <span>Auto-refreshing every 15 seconds</span>
        </motion.div>
      </motion.div>

      {/* Stats Banner */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-red-400" />
              <span className="text-lg sm:text-xl font-bold text-white">{matches.length}</span>
              <span className="text-gray-300 text-sm sm:text-base">Live Matches</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <span className="text-lg sm:text-xl font-bold text-white">{groupedMatches.length}</span>
              <span className="text-gray-300 text-sm sm:text-base">Active Leagues</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-lg sm:text-xl font-bold text-white">{leagues.length}</span>
              <span className="text-gray-300 text-sm sm:text-base">Total Leagues Covered</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Coverage Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-cyan-500/20"
      >
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center space-x-2">
          <Trophy className="w-5 h-5" />
          <span>Leagues Coverage</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm text-gray-300">
          <div>✅ International Cricket</div>
          <div>✅ Indian Premier League</div>
          <div>✅ Big Bash League</div>
          <div>✅ Caribbean Premier League</div>
          <div>✅ Pakistan Super League</div>
          <div>✅ The Hundred</div>
          <div>✅ SA20</div>
          <div>✅ ILT20</div>
          <div>✅ T20 Blast</div>
          <div>✅ County Championship</div>
          <div>✅ Sheffield Shield</div>
          <div>✅ Ranji Trophy</div>
          <div>✅ Bangladesh Premier League</div>
          <div>✅ Lanka Premier League</div>
          <div>✅ Plunket Shield</div>
          <div>✅ One-Day Competitions</div>
        </div>
      </motion.div>

      {/* Matches grouped by league */}
      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="text-6xl sm:text-7xl md:text-8xl mb-4">🏏</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">No Live Cricket Matches</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Check back soon for live cricket action from around the world!
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-4">
            We cover 15+ major cricket leagues including IPL, BBL, CPL, PSL, and international cricket.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {groupedMatches.map((group, idx) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">{group.name}</h2>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs sm:text-sm rounded-full font-semibold">
                  {group.matches.length} {group.matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {group.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictions.get(match.id)}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

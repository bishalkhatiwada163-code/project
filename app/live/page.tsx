'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import MatchCard from '@/components/MatchCard';
import { Match, Prediction } from '@/lib/types';
import { calculatePrediction } from '@/lib/predictor';
import { Activity, Radio, Filter } from 'lucide-react';

function LivePageContent() {
  const searchParams = useSearchParams();
  const sportParam = searchParams.get('sport') as 'football' | 'basketball' | 'cricket' | null;
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'football' | 'basketball' | 'cricket'>(sportParam || 'all');

  useEffect(() => {
    // Update filter when URL parameter changes
    if (sportParam) {
      setFilter(sportParam);
    }
  }, [sportParam]);

  useEffect(() => {
    fetchMatches();
    // Refresh every 10 seconds
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchMatches = async () => {
    try {
      // Fetch live matches and prefer server-side filtering
      const sportsQuery = filter === 'all' ? 'football,basketball,cricket' : filter;
      const response = await fetch(`/api/matches/live?sports=${encodeURIComponent(sportsQuery)}`);
      const result = await response.json();
      if (result.success) {
        setMatches(result.data);

        // Generate predictions for live matches too
        const newPredictions = new Map<string, Prediction>();
        result.data.forEach((match: Match) => {
          newPredictions.set(match.id, calculatePrediction(match));
        });
        setPredictions(newPredictions);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(
    (match) => filter === 'all' || match.sport === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-red-500 border-opacity-70 rounded-full glow-red"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Radio className="w-12 h-12 text-red-400 glow-red" />
          </motion.div>
          <h1 className="text-5xl font-bold gradient-text">Live Matches</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Watch real-time scores and follow the action as it happens
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
            className="w-4 h-4 border-2 border-gray-400 rounded-full"
          />
          <span>Auto-refreshing every 10 seconds</span>
        </motion.div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center space-x-4"
      >
        <Filter className="w-5 h-5 text-gray-400" />
        {(['all', 'football', 'basketball', 'cricket'] as const).map((sport) => (
          <motion.button
            key={sport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(sport)}
            className={`
              px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
              ${filter === sport
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50'
                : 'glass-card text-gray-300 hover:text-white'
              }
            `}
          >
            {sport === 'all' ? '🌐 All Sports' : sport === 'football' ? '⚽ Football' : sport === 'basketball' ? '🏀 Basketball' : '🏏 Cricket'}
          </motion.button>
        ))}
      </motion.div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Activity className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            No live matches right now
          </h3>
          <p className="text-gray-500">
            Check the <a href="/upcoming" className="text-purple-400 hover:text-purple-300 underline">upcoming matches</a> page for scheduled fixtures
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <MatchCard 
                match={match} 
                prediction={predictions.get(match.id)}
                showPrediction={false} 
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 text-center"
      >
        <div className="flex items-center justify-around flex-wrap gap-6">
          <div>
            <p className="text-3xl font-bold gradient-text">{matches.length}</p>
            <p className="text-gray-400 text-sm">Total Live</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">
              {matches.filter((m) => m.sport === 'football').length}
            </p>
            <p className="text-gray-400 text-sm">⚽ Football</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-400">
              {matches.filter((m) => m.sport === 'basketball').length}
            </p>
            <p className="text-gray-400 text-sm">🏀 Basketball</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-cyan-400">
              {matches.filter((m) => m.sport === 'cricket').length}
            </p>
            <p className="text-gray-400 text-sm">🏏 Cricket</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-red-500 border-opacity-70 rounded-full glow-red"
        />
      </div>
    }>
      <LivePageContent />
    </Suspense>
  );
}

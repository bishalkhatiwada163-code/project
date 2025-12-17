'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import MatchCard from '@/components/MatchCard';
import { Match, Prediction } from '@/lib/types';
import { calculatePrediction } from '@/lib/predictor';
import { Calendar, Sparkles, Filter, Clock } from 'lucide-react';

function UpcomingPageContent() {
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
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches/upcoming');
      const result = await response.json();
      if (result.success) {
        setMatches(result.data);

        // Generate predictions
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

  // Get unique sports that have matches
  const availableSports = Array.from(new Set(matches.map(m => m.sport)));
  const sportFilters = ['all' as const, ...availableSports];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-cyan-500 border-opacity-70 rounded-full glow"
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
              y: [0, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Calendar className="w-12 h-12 text-cyan-400 glow" />
          </motion.div>
          <h1 className="text-5xl font-bold gradient-text">Upcoming Matches</h1>
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-yellow-400" />
          </motion.div>
        </div>
        <p className="text-gray-300 text-lg">
          AI-powered predictions to help you know who's likely to win
        </p>

        {/* Total predictions count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block glass-card px-6 py-3"
        >
          <p className="text-sm text-gray-400">
            <span className="text-2xl font-bold gradient-text">{matches.length}</span> predictions available
          </p>
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
        {sportFilters.map((sport) => (
          <motion.button
            key={sport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(sport)}
            className={`
              px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
              ${filter === sport
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'glass-card text-gray-300 hover:text-white'
              }
            `}
          >
            {sport === 'all' ? '🌐 All Sports' : sport === 'football' ? '⚽ Football' : sport === 'basketball' ? '🏀 Basketball' : '🏏 Cricket'}
          </motion.button>
        ))}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
      >
        <div className="flex items-start space-x-4">
          <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-white mb-2">How Our Predictions Work</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Our AI analyzes team form, recent performance, home/away records, and head-to-head statistics 
              to calculate win probabilities. High confidence predictions have stronger statistical backing.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Clock className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            No upcoming matches in this category
          </h3>
          <p className="text-gray-500">
            Try a different filter or check back later
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <MatchCard
                match={match}
                prediction={predictions.get(match.id)}
                showPrediction={true}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Confidence Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold gradient-text mb-4 text-center">
          Prediction Confidence Distribution
        </h3>
        <div className="flex items-center justify-around flex-wrap gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {Array.from(predictions.values()).filter((p) => p.confidence === 'high').length}
            </p>
            <p className="text-gray-400 text-sm">High Confidence</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {Array.from(predictions.values()).filter((p) => p.confidence === 'medium').length}
            </p>
            <p className="text-gray-400 text-sm">Medium Confidence</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-400">
              {Array.from(predictions.values()).filter((p) => p.confidence === 'low').length}
            </p>
            <p className="text-gray-400 text-sm">Low Confidence</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UpcomingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-cyan-500 border-opacity-70 rounded-full glow"
        />
      </div>
    }>
      <UpcomingPageContent />
    </Suspense>
  );
}

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PredictionBarProps {
  homeTeam: string;
  awayTeam: string;
  homeProbability: number;
  awayProbability: number;
  drawProbability?: number;
  confidence: 'high' | 'medium' | 'low';
}

export default function PredictionBar({
  homeTeam,
  awayTeam,
  homeProbability,
  awayProbability,
  drawProbability,
  confidence,
}: PredictionBarProps) {
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
    }
  };

  const getWinnerIcon = () => {
    if (homeProbability > awayProbability) return <TrendingUp className="w-4 h-4" />;
    if (awayProbability > homeProbability) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Confidence Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          AI Prediction
        </span>
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-xs font-bold ${getConfidenceColor()} flex items-center space-x-1`}
        >
          {getWinnerIcon()}
          <span>{confidence.toUpperCase()} CONFIDENCE</span>
        </motion.span>
      </div>

      {/* Probability Bars */}
      <div className="space-y-2">
        {/* Home Team */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">{homeTeam}</span>
            <span className="font-bold text-cyan-400">{(homeProbability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${homeProbability * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full relative"
            >
              <div className="absolute inset-0 shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Draw (if applicable) */}
        {drawProbability !== undefined && drawProbability > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-400">Draw</span>
              <span className="font-bold text-gray-400">{(drawProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${drawProbability * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Away Team */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">{awayTeam}</span>
            <span className="font-bold text-pink-400">{(awayProbability * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${awayProbability * 100}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative"
            >
              <div className="absolute inset-0 shimmer" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Winner Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2 border-t border-white/10"
      >
        <p className="text-center text-sm">
          <span className="text-gray-400">Predicted Winner: </span>
          <span className="font-bold gradient-text">
            {homeProbability > awayProbability ? homeTeam : awayProbability > homeProbability ? awayTeam : 'Draw'}
          </span>
        </p>
      </motion.div>
    </div>
  );
}

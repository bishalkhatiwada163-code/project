'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Target, Users } from 'lucide-react';
import { Match, Prediction } from '@/lib/types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  prediction: Prediction;
}

export default function AnalysisModal({
  isOpen,
  onClose,
  match,
  prediction,
}: AnalysisModalProps) {
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  // Lock page scroll while the modal is open to prevent interacting with the background
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  const winner =
    prediction.homeWinProbability > prediction.awayWinProbability
      ? match.homeTeam
      : match.awayTeam;
  const winnerProb =
    prediction.homeWinProbability > prediction.awayWinProbability
      ? prediction.homeWinProbability
      : prediction.awayWinProbability;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - light tint + blur to keep content readable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-white/10 backdrop-blur-md"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Modal - Centered Large View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="w-[80vw] h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-3xl bg-slate-900/95 border border-white/15" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    Match Analysis
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {match.league} • {match.homeTeam.name} vs {match.awayTeam.name}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 overflow-y-auto scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
                {/* Winner Prediction */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Likely Winner</p>
                      <p className="text-2xl font-bold text-white">
                        {winner.name}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Winning Probability</span>
                      <span className="text-2xl font-bold gradient-text">
                        {(winnerProb * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${winnerProb * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 italic">
                    Based on form, head-to-head records, and home advantage
                  </p>
                </motion.div>

                {/* Prediction Details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <span>Prediction Breakdown</span>
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">{match.homeTeam.name}</p>
                      <p className="text-3xl font-bold gradient-text">
                        {(prediction.homeWinProbability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Win Chance</p>
                    </div>
                    {prediction.drawProbability !== undefined && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-xs text-gray-400 mb-2">Draw</p>
                        <p className="text-3xl font-bold text-yellow-400">
                          {(prediction.drawProbability * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Draw Chance</p>
                      </div>
                    )}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">{match.awayTeam.name}</p>
                      <p className="text-3xl font-bold gradient-text">
                        {(prediction.awayWinProbability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Win Chance</p>
                    </div>
                  </div>
                </motion.div>

                {/* Key Factors */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <span>Key Factors</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-300">
                          Form
                        </span>
                        <span className="text-sm text-gray-300">
                          {(prediction.factors.form * 100).toFixed(0)}% Impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Recent performance and consistency across matches
                      </p>
                    </div>
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-cyan-300">
                          Head-to-Head
                        </span>
                        <span className="text-sm text-gray-300">
                          {(prediction.factors.headToHead * 100).toFixed(0)}% Impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Historical matchup results and trends
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-indigo-300">
                          Home Advantage
                        </span>
                        <span className="text-sm text-gray-300">
                          {(prediction.factors.homeAdvantage * 100).toFixed(0)}% Impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Home field benefit and crowd support factor
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Confidence Level */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-300">Confidence Level</span>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      prediction.confidence === 'high'
                        ? 'bg-green-500/20 text-green-300'
                        : prediction.confidence === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {prediction.confidence.charAt(0).toUpperCase() +
                      prediction.confidence.slice(1)}
                  </span>
                </motion.div>

                {/* Detailed Analysis */}
                {prediction.analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
                  >
                    <h3 className="text-lg font-bold text-white mb-4">
                      AI Analysis
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {prediction.analysis}
                    </p>
                  </motion.div>
                )}

                {/* Team Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Team Comparison
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Home Team */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                          {match.homeTeam.logo && !homeLogoError ? (
                            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" onError={() => setHomeLogoError(true)} />
                          ) : (
                            <span className="text-xs font-bold">{match.homeTeam.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{match.homeTeam.name}</p>
                          <p className="text-xs text-gray-400">Home Team</p>
                        </div>
                      </div>
                      {match.homeTeam.ranking && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Ranking</span>
                            <span className="text-white font-semibold">#{match.homeTeam.ranking}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Recent Form</span>
                            <span className="text-white font-semibold">{match.homeTeam.form}</span>
                          </div>
                          {match.homeTeam.recentGoals && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Goals Scored</span>
                              <span className="text-green-400 font-semibold">{match.homeTeam.recentGoals}</span>
                            </div>
                          )}
                          {match.homeTeam.recentConceded && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Goals Conceded</span>
                              <span className="text-red-400 font-semibold">{match.homeTeam.recentConceded}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                          {match.awayTeam.logo && !awayLogoError ? (
                            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" onError={() => setAwayLogoError(true)} />
                          ) : (
                            <span className="text-xs font-bold">{match.awayTeam.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{match.awayTeam.name}</p>
                          <p className="text-xs text-gray-400">Away Team</p>
                        </div>
                      </div>
                      {match.awayTeam.ranking && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Ranking</span>
                            <span className="text-white font-semibold">#{match.awayTeam.ranking}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Recent Form</span>
                            <span className="text-white font-semibold">{match.awayTeam.form}</span>
                          </div>
                          {match.awayTeam.recentGoals && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Goals Scored</span>
                              <span className="text-green-400 font-semibold">{match.awayTeam.recentGoals}</span>
                            </div>
                          )}
                          {match.awayTeam.recentConceded && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Goals Conceded</span>
                              <span className="text-red-400 font-semibold">{match.awayTeam.recentConceded}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Win Probability Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl"
                >
                  <h3 className="text-lg font-bold text-white mb-6">
                    Probability Distribution
                  </h3>
                  <div className="space-y-4">
                    {/* Home Team Probability */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                            {match.homeTeam.logo && !homeLogoError ? (
                              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" onError={() => setHomeLogoError(true)} />
                            ) : (
                              <span className="text-xs font-bold">{match.homeTeam.name.substring(0, 1)}</span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-white">{match.homeTeam.name}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-400">
                          {(prediction.homeWinProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.homeWinProbability * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                        />
                      </div>
                    </div>

                    {/* Draw Probability (if available) */}
                    {prediction.drawProbability !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">Draw</span>
                          <span className="text-lg font-bold text-yellow-400">
                            {(prediction.drawProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prediction.drawProbability * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Away Team Probability */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                            {match.awayTeam.logo && !awayLogoError ? (
                              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" onError={() => setAwayLogoError(true)} />
                            ) : (
                              <span className="text-xs font-bold">{match.awayTeam.name.substring(0, 1)}</span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-white">{match.awayTeam.name}</span>
                        </div>
                        <span className="text-lg font-bold text-red-400">
                          {(prediction.awayWinProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.awayWinProbability * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-red-400 to-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

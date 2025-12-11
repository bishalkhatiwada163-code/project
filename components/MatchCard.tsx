'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Match, Prediction } from '@/lib/types';
import LiveIndicator from './LiveIndicator';
import PredictionBar from './PredictionBar';
import AnalysisModal from './AnalysisModal';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  showPrediction?: boolean;
}

export default function MatchCard({ match, prediction, showPrediction = true }: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  const getSportIcon = () => {
    if (match.sport === 'football') return '⚽';
    if (match.sport === 'basketball') return '🏀';
    return '🏏';
  };

  const getSportGradient = () => {
    if (match.sport === 'football') return 'from-green-500/20 to-emerald-500/20';
    if (match.sport === 'basketball') return 'from-orange-500/20 to-red-500/20';
    return 'from-blue-500/20 to-cyan-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="match-card-hover"
    >
      <div className={`glass-card p-6 bg-gradient-to-br ${getSportGradient()} border-2 ${isLive ? 'border-red-500/50 glow-red' : 'border-white/10'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {getSportIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{match.league}</h3>
              {match.venue && (
                <p className="text-xs text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{match.venue}</span>
                </p>
              )}
            </div>
          </div>

          {isLive && <LiveIndicator minute={match.minute} />}
          {isUpcoming && (
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(match.startTime), 'MMM dd, HH:mm')}</span>
            </div>
          )}
        </div>

        {/* Teams and Scores */}
        <div className="space-y-4 mb-6">
          {/* Home Team */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-lg shadow-lg overflow-hidden border-2 border-white/20">
                {match.homeTeam.logo && !homeLogoError ? (
                  <img 
                    src={match.homeTeam.logo} 
                    alt={match.homeTeam.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setHomeLogoError(true)}
                  />
                ) : (
                  <span className="text-sm">{match.homeTeam.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{match.homeTeam.name}</h4>
                {match.homeTeam.form && (
                  <div className="flex items-center space-x-1 mt-1">
                    {match.homeTeam.form.split('').map((result, idx) => (
                      <span
                        key={idx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {match.homeScore !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold gradient-text"
              >
                {match.homeScore}
              </motion.div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-sm">
              <span className="text-gray-300 font-bold text-sm">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-lg shadow-lg overflow-hidden border-2 border-white/20">
                {match.awayTeam.logo && !awayLogoError ? (
                  <img 
                    src={match.awayTeam.logo} 
                    alt={match.awayTeam.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setAwayLogoError(true)}
                  />
                ) : (
                  <span className="text-sm">{match.awayTeam.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{match.awayTeam.name}</h4>
                {match.awayTeam.form && (
                  <div className="flex items-center space-x-1 mt-1">
                    {match.awayTeam.form.split('').map((result, idx) => (
                      <span
                        key={idx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {match.awayScore !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold gradient-text"
              >
                {match.awayScore}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Prediction Section */}
        {showPrediction && prediction && isUpcoming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
            className="pt-4 border-t border-white/10"
          >
            <PredictionBar
              homeTeam={match.homeTeam.name}
              awayTeam={match.awayTeam.name}
              homeProbability={prediction.homeWinProbability}
              awayProbability={prediction.awayWinProbability}
              drawProbability={prediction.drawProbability}
              confidence={prediction.confidence}
            />
            {prediction.analysis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-3 text-xs text-gray-400 italic text-center bg-white/5 p-3 rounded-lg"
              >
                💡 {prediction.analysis}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Action Button - Always show */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => prediction && setIsModalOpen(true)}
          disabled={!prediction}
          className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 group transition-all duration-300 ${
            prediction
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:border-purple-400 cursor-pointer'
              : 'bg-gray-500/10 border border-gray-500/30 cursor-not-allowed opacity-50'
          }`}
        >
          <Trophy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>{prediction ? 'View Full Analysis' : 'Analysis Unavailable'}</span>
        </motion.button>

        {/* Analysis Modal */}
        {prediction && (
          <AnalysisModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            match={match}
            prediction={prediction}
          />
        )}
      </div>
    </motion.div>
  );
}

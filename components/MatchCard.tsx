'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Match, Prediction } from '@/lib/types';
import LiveIndicator from './LiveIndicator';
import PredictionBar from './PredictionBar';
import AnalysisModal from './AnalysisModal';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';
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
  const [homeForm, setHomeForm] = useState<string | null>(match.homeTeam.form || null);
  const [awayForm, setAwayForm] = useState<string | null>(match.awayTeam.form || null);

  useEffect(() => {
    async function fetchTeamForm(teamId: string, sport: string): Promise<string | null> {
      try {
        const res = await fetch(`/api/external/espn/team/${encodeURIComponent(teamId)}/recent?sport=${encodeURIComponent(sport)}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        const recent = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        // Ensure most recent match appears first
        recent.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        // recent items expected shape: { result: 'W'|'D'|'L' }
        const letters = recent.slice(0, 5).map((r: any) => (r.result || '').toUpperCase()[0]).filter((c: string) => ['W','D','L'].includes(c));
        return letters.length ? letters.join('') : null;
      } catch {
        return null;
      }
    }

    // Only fetch if not provided or marked as N/A
    (async () => {
      if (!homeForm || homeForm === 'N/A') {
        const f = await fetchTeamForm(String(match.homeTeam.id), match.sport);
        if (f) setHomeForm(f);
      }
      if (!awayForm || awayForm === 'N/A') {
        const f = await fetchTeamForm(String(match.awayTeam.id), match.sport);
        if (f) setAwayForm(f);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.homeTeam.id, match.awayTeam.id, match.sport]);

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
      <div className={`glass-card p-3 sm:p-4 md:p-6 bg-gradient-to-br ${getSportGradient()} border-2 ${isLive ? 'border-red-500/50 glow-red' : 'border-white/10'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-2xl sm:text-3xl">
              {getSportIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm">{match.league}</h3>
              {match.venue && (
                <p className="text-xs text-gray-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{match.venue}</span>
                </p>
              )}
            </div>
          </div>

          {isLive && <LiveIndicator minute={match.minute} />}
          {isUpcoming && (
            <div className="flex items-center space-x-1 text-gray-400 text-xs flex-shrink-0">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{format(new Date(match.startTime), 'MMM dd, HH:mm')}</span>
              <span className="sm:hidden">{format(new Date(match.startTime), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {/* Teams and Scores */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Home Team */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-sm sm:text-base md:text-lg shadow-lg overflow-hidden border-2 border-white/20 flex-shrink-0">
                {match.homeTeam.logo && !homeLogoError ? (
                  <img 
                    src={match.homeTeam.logo} 
                    alt={match.homeTeam.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setHomeLogoError(true)}
                  />
                ) : (
                  <span className="text-xs sm:text-sm">{match.homeTeam.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm sm:text-base md:text-lg truncate">
                  <Link href={`/team/${match.sport}/${match.homeTeam.id}`} className="hover:underline">
                    {match.homeTeam.name}
                  </Link>
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  {(homeForm && homeForm !== 'N/A') ? (
                    homeForm.split('').map((result, idx) => (
                      <span
                        key={idx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </span>
                    ))
                  ) : (
                    // Legend placeholders when form is not available
                    <>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-green-500">W</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-yellow-500">D</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-500">L</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {match.homeScore !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text flex-shrink-0"
              >
                {match.homeScore}
              </motion.div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-sm">
              <span className="text-gray-300 font-bold text-xs sm:text-sm">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-sm sm:text-base md:text-lg shadow-lg overflow-hidden border-2 border-white/20 flex-shrink-0">
                {match.awayTeam.logo && !awayLogoError ? (
                  <img 
                    src={match.awayTeam.logo} 
                    alt={match.awayTeam.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setAwayLogoError(true)}
                  />
                ) : (
                  <span className="text-xs sm:text-sm">{match.awayTeam.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm sm:text-base md:text-lg truncate">
                  <Link href={`/team/${match.sport}/${match.awayTeam.id}`} className="hover:underline">
                    {match.awayTeam.name}
                  </Link>
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  {(awayForm && awayForm !== 'N/A') ? (
                    awayForm.split('').map((result, idx) => (
                      <span
                        key={idx}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </span>
                    ))
                  ) : (
                    // Legend placeholders when form is not available
                    <>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-green-500">W</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-yellow-500">D</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-500">L</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {match.awayScore !== undefined && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text flex-shrink-0"
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
            className="pt-3 sm:pt-4 border-t border-white/10"
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
          className={`w-full mt-3 sm:mt-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 group transition-all duration-300 ${
            prediction
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:border-purple-400 cursor-pointer'
              : 'bg-gray-500/10 border border-gray-500/30 cursor-not-allowed opacity-50'
          }`}
        >
          <Trophy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="truncate">{prediction ? 'View Full Analysis' : 'Analysis Unavailable'}</span>
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

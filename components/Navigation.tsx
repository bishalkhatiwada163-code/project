'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Trophy, Activity, Calendar, Sparkles, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface TeamMatch {
  teamName: string;
  sport: 'football' | 'basketball' | 'cricket';
  matchId: string;
  opponent: string;
  isLive: boolean;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<TeamMatch[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/', label: 'Home', icon: Sparkles },
    { href: '/live', label: 'Live', icon: Activity },
    { href: '/upcoming', label: 'Upcoming', icon: Calendar },
  ];

  // All matches database with both teams
  const allMatches: Array<{ team1: string; team2: string; sport: 'football' | 'basketball' | 'cricket'; matchId: string; isLive: boolean }> = [
    // Football Live
    { team1: 'Manchester City', team2: 'Liverpool', sport: 'football', matchId: 'live-1', isLive: true },
    { team1: 'Real Madrid', team2: 'Barcelona', sport: 'football', matchId: 'live-3', isLive: true },
    
    // Basketball Live
    { team1: 'LA Lakers', team2: 'Boston Celtics', sport: 'basketball', matchId: 'live-2', isLive: true },
    { team1: 'Golden State Warriors', team2: 'Milwaukee Bucks', sport: 'basketball', matchId: 'live-4', isLive: true },
    
    // Cricket Live
    { team1: 'India', team2: 'Australia', sport: 'cricket', matchId: 'live-5', isLive: true },
    { team1: 'England', team2: 'Pakistan', sport: 'cricket', matchId: 'live-6', isLive: true },
    
    // Football Upcoming
    { team1: 'Chelsea', team2: 'Arsenal', sport: 'football', matchId: 'upcoming-1', isLive: false },
    { team1: 'Bayern Munich', team2: 'Borussia Dortmund', sport: 'football', matchId: 'upcoming-3', isLive: false },
    { team1: 'PSG', team2: 'Marseille', sport: 'football', matchId: 'upcoming-5', isLive: false },
    { team1: 'Juventus', team2: 'AC Milan', sport: 'football', matchId: 'upcoming-6', isLive: false },
    
    // Basketball Upcoming
    { team1: 'Miami Heat', team2: 'Phoenix Suns', sport: 'basketball', matchId: 'upcoming-2', isLive: false },
    { team1: 'Brooklyn Nets', team2: 'Philadelphia 76ers', sport: 'basketball', matchId: 'upcoming-4', isLive: false },
    
    // Cricket Upcoming
    { team1: 'New Zealand', team2: 'South Africa', sport: 'cricket', matchId: 'upcoming-7', isLive: false },
    { team1: 'West Indies', team2: 'Sri Lanka', sport: 'cricket', matchId: 'upcoming-8', isLive: false },
  ];

  // Flatten teams from matches for search
  const allTeams: TeamMatch[] = allMatches.flatMap(match => [
    { teamName: match.team1, sport: match.sport, matchId: match.matchId, opponent: match.team2, isLive: match.isLive },
    { teamName: match.team2, sport: match.sport, matchId: match.matchId, opponent: match.team1, isLive: match.isLive },
  ]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = allTeams.filter(team =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 6)); // Show max 6 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleResultClick = (result: TeamMatch) => {
    setSearchQuery('');
    setIsFocused(false);
    router.push(result.isLive ? '/live' : '/upcoming');
  };

  const getSportIcon = (sport: string) => {
    if (sport === 'football') return '⚽';
    if (sport === 'basketball') return '🏀';
    return '🏏';
  };

  const getSportColor = (sport: string) => {
    if (sport === 'football') return 'from-green-500 to-emerald-500';
    if (sport === 'basketball') return 'from-orange-500 to-red-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-20 relative">
          {/* Logo - Centered */}
          <Link href="/" className="flex items-center space-x-3 group absolute left-1/2 -translate-x-1/2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Trophy className="w-10 h-10 text-yellow-400 glow" />
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">
              SportPredict
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 absolute left-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Search Bar & CTA - Right Side */}
          <div className="flex items-center space-x-3 absolute right-4">
            {/* Enhanced Search Bar with Dropdown */}
            <div ref={searchRef} className="relative hidden md:block">
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{
                    boxShadow: isFocused 
                      ? '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)' 
                      : '0 0 0px rgba(139, 92, 246, 0)',
                    scale: isFocused ? 1.02 : 1,
                  }}
                  className="relative"
                >
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <motion.div
                      animate={{ rotate: isFocused ? 0 : 0, scale: isFocused ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Search className="w-5 h-5 text-purple-400" />
                    </motion.div>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search teams..."
                    className="pl-11 pr-20 py-3 w-64 lg:w-72 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-2 border-purple-500/30 rounded-2xl text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:border-purple-500/60 transition-all duration-300 shadow-lg"
                  />

                  {/* Search submit button */}
                  <button
                    type="submit"
                    className="absolute right-11 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {isFocused && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 w-full glass-card border-2 border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl max-h-96 overflow-y-auto z-50"
                    >
                      {/* Get unique matches to avoid duplicates */}
                      {Array.from(
                        new Map(
                          searchResults.map(result => [result.matchId, result])
                        ).values()
                      ).map((result, index) => (
                        <motion.div
                          key={`${result.matchId}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center justify-between space-x-4 p-4 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 cursor-pointer transition-all duration-300 border-b border-white/5 last:border-b-0 group"
                        >
                          {/* Both Teams Display */}
                          <div className="flex-1 flex items-center justify-between gap-4">
                            {/* Team 1 */}
                            <div className="flex items-center space-x-2 flex-1">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSportColor(result.sport)} flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                                {getSportIcon(result.sport)}
                              </div>
                              <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm">
                                {result.teamName}
                              </h4>
                            </div>

                            {/* VS Badge */}
                            <div className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full">
                              <span className="text-xs font-bold text-purple-300">VS</span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex items-center space-x-2 flex-1 justify-end">
                              <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm">
                                {result.opponent}
                              </h4>
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSportColor(result.sport)} flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                                {getSportIcon(result.sport)}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {result.isLive && (
                              <motion.span
                                animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full glow-red"
                              >
                                LIVE
                              </motion.span>
                            )}
                            <motion.div
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                              className="text-purple-400"
                            >
                              →
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* No Results */}
                  {isFocused && searchQuery && searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full glass-card border-2 border-purple-500/30 rounded-2xl p-6 text-center shadow-2xl"
                    >
                      <p className="text-gray-400">No teams found for "{searchQuery}"</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary hidden lg:block"
            >
              Get Premium
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const sports = [
    {
      id: 'football',
      name: 'Football',
      icon: '⚽',
      gradient: 'from-green-400 via-emerald-500 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:via-emerald-600 hover:to-green-700',
      shadow: 'shadow-green-500/50',
      glowColor: 'bg-green-500/20',
      description: 'Premier League, La Liga, Serie A & More',
    },
    {
      id: 'cricket',
      name: 'Cricket',
      icon: '🏏',
      gradient: 'from-blue-400 via-cyan-500 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:via-cyan-600 hover:to-blue-700',
      shadow: 'shadow-cyan-500/50',
      glowColor: 'bg-cyan-500/20',
      description: 'Test, ODI, T20 & World Cups',
    },
    {
      id: 'basketball',
      name: 'Basketball',
      icon: '🏀',
      gradient: 'from-orange-400 via-red-500 to-orange-600',
      hoverGradient: 'hover:from-orange-500 hover:via-red-600 hover:to-orange-700',
      shadow: 'shadow-orange-500/50',
      glowColor: 'bg-orange-500/20',
      description: 'NBA, EuroLeague & Championships',
    },
  ];

  const handleSportSelect = (sportId: string) => {
    router.push(`/live?sport=${sportId}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-16 px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        {/* Animated Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <Trophy className="w-24 h-24 text-yellow-400 glow" />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"
            />
          </div>
        </motion.div>

        {/* Title */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold gradient-text mb-4"
          >
            SportPredict
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-2 text-yellow-400"
          >
            <Sparkles className="w-5 h-5" />
            <p className="text-xl font-semibold">AI-Powered Sports Predictions</p>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
        >
          Choose your favorite sport and get <span className="text-cyan-400 font-bold">live scores</span> and <span className="text-pink-400 font-bold">AI predictions</span>
        </motion.p>
      </motion.div>

      {/* Sport Selection Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sports.map((sport, index) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1 + index * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSportSelect(sport.id)}
              className="cursor-pointer"
            >
              <div className={`glass-card p-8 bg-gradient-to-br ${sport.gradient} ${sport.hoverGradient} shadow-2xl ${sport.shadow} transition-all duration-500 border-2 border-white/20 hover:border-white/40 group relative overflow-hidden`}>
                {/* Animated Background Glow */}
                <motion.div
                  className={`absolute inset-0 ${sport.glowColor} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Content */}
                <div className="relative z-10 space-y-6 text-center">
                  {/* Sport Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-8xl group-hover:scale-110 transition-transform duration-300"
                  >
                    {sport.icon}
                  </motion.div>

                  {/* Sport Name */}
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                      {sport.name}
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                      {sport.description}
                    </p>
                  </div>

                  {/* Call to Action */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 px-6 bg-white/20 backdrop-blur-sm rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 shadow-lg"
                  >
                    View {sport.name} Matches
                  </motion.button>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="glass-card p-8 max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold gradient-text mb-2">95%</p>
            <p className="text-gray-400">Prediction Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-bold gradient-text mb-2">24/7</p>
            <p className="text-gray-400">Live Updates</p>
          </div>
          <div>
            <p className="text-4xl font-bold gradient-text mb-2">100+</p>
            <p className="text-gray-400">Matches Weekly</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

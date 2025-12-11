'use client';

import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

interface LiveIndicatorProps {
  minute?: number;
}

export default function LiveIndicator({ minute }: LiveIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2"
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-3 h-3 bg-red-500 rounded-full glow-red"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-red-500 rounded-full"
        />
      </div>
      <span className="text-red-400 font-bold text-sm flex items-center space-x-1">
        <Radio className="w-4 h-4" />
        <span>LIVE</span>
        {minute && <span className="text-white">· {minute}'</span>}
      </span>
    </motion.div>
  );
}

"use client"

import { motion } from 'framer-motion';

interface LeaderboardProps {
  category: string;
  region: string;
}

const leaderboardData: Record<string, Array<{ rank: number; name: string; score: number; color: string }>> = {
  'All Time-Global': [
    { rank: 1, name: 'Liam Anderson', score: 28200, color: '#3b82f6' },
    { rank: 2, name: 'Isabella Garcia', score: 27100, color: '#f97316' },
    { rank: 3, name: 'Emma Johnson', score: 26200, color: '#10b981' },
    { rank: 4, name: 'Charlotte Taylor', score: 24300, color: '#a855f7' },
    { rank: 5, name: 'Harper Jackson', score: 23800, color: '#ef4444' },
  ],
  'Weekly-Global': [
    { rank: 1, name: 'Alex Chen', score: 5420, color: '#06b6d4' },
    { rank: 2, name: 'Sarah Kim', score: 4890, color: '#ec4899' },
    { rank: 3, name: 'Mike Torres', score: 4560, color: '#f59e0b' },
    { rank: 4, name: 'Lisa Wang', score: 4340, color: '#8b5cf6' },
    { rank: 5, name: 'James Park', score: 4200, color: '#14b8a6' },
  ],
  'Monthly-Global': [
    { rank: 1, name: 'Ethan Martinez', score: 16500, color: '#f97316' },
    { rank: 2, name: 'Mia Rodriguez', score: 15200, color: '#3b82f6' },
    { rank: 3, name: 'Olivia Davis', score: 14300, color: '#10b981' },
    { rank: 4, name: 'Noah Wilson', score: 13400, color: '#a855f7' },
    { rank: 5, name: 'Sophia Brown', score: 12800, color: '#ec4899' },
  ],
  'Daily-Global': [
    { rank: 1, name: 'Lucas Lopez', score: 1410, color: '#f59e0b' },
    { rank: 2, name: 'Ava Gonzalez', score: 1390, color: '#ef4444' },
    { rank: 3, name: 'Mason Thomas', score: 1310, color: '#06b6d4' },
    { rank: 4, name: 'Amelia Moore', score: 1240, color: '#8b5cf6' },
    { rank: 5, name: 'Oliver White', score: 1170, color: '#14b8a6' },
  ],
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

export default function Leaderboard({ category, region }: LeaderboardProps) {
  const key = `${category}-${region}`;
  const data = leaderboardData[key] || leaderboardData['All Time-Global'];

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-1"
    >
      {data.map((player, index) => (
        <motion.div
          key={player.rank}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`
            relative flex items-center gap-4 p-3 rounded-lg transition-all duration-200
            ${player.rank <= 3 
              ? 'bg-white/5 hover:bg-white/8' 
              : 'bg-transparent hover:bg-white/3'
            }
          `}
        >
          {/* Rank */}
          <div className="w-6 text-right">
            <span className={`text-xs font-mono ${
              player.rank <= 3 ? 'text-white' : 'text-white/40'
            }`}>
              {player.rank}
            </span>
          </div>
          
          {/* Avatar */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: player.color }}
          >
            {getInitials(player.name)}
          </div>
          
          {/* Name */}
          <div className="flex-1">
            <p className={`text-sm ${
              player.rank <= 3 ? 'text-white font-medium' : 'text-white/80'
            }`}>
              {player.name}
            </p>
          </div>
          
          {/* Score */}
          <div className="text-right">
            <p className={`text-xs font-mono ${
              player.rank <= 3 ? 'text-white' : 'text-white/60'
            }`}>
              {player.score.toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

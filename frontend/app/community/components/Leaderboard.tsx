"use client"

import { motion } from 'framer-motion';
import { Trophy, Medal, Award, User } from 'lucide-react';

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

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-white/40 font-mono text-sm">{rank}</span>;
  }
};

export default function Leaderboard({ category, region }: LeaderboardProps) {
  const key = `${category}-${region}`;
  const data = leaderboardData[key] || leaderboardData['All Time-Global'];

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {data.map((player, index) => (
        <motion.div
          key={player.rank}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300
            ${player.rank <= 3 
              ? 'bg-white/10 border border-white/20 hover:bg-white/15' 
              : 'bg-white/5 border border-white/10 hover:bg-white/8'
            }
          `}
        >
          {/* Rank Icon */}
          <div className="flex items-center justify-center w-10 h-10">
            {getRankIcon(player.rank)}
          </div>
          
          {/* User Avatar */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white text-sm"
            style={{ backgroundColor: player.color }}
          >
            {getInitials(player.name)}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <p className="text-white font-medium text-base">{player.name}</p>
            <p className="text-white/50 text-xs font-mono">
              {player.score.toLocaleString()} points
            </p>
          </div>
          
          {/* Rank Badge */}
          <div className="bg-white/10 px-3 py-1 rounded-full">
            <p className="text-white text-xs font-mono font-semibold">
              #{player.rank}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

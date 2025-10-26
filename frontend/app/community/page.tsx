"use client"

import { useState } from 'react';
import Header from '../components/header';
import Leaderboard from './components/Leaderboard';

const categories = ['All Time', 'Weekly', 'Monthly', 'Daily'];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Time');

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight text-white mb-4">
            <span className="italic">Community</span> Leaderboard
          </h1>
          <p className="text-white/60 text-sm font-mono uppercase tracking-wider italic">
            find your <span className="italic">balance</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          {/* Left Column - Category Filter */}
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left
                  ${selectedCategory === category
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Right Column - Leaderboard */}
          <div className="liquid-glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">
                {selectedCategory} Rankings
              </h2>
              <div className="text-white/40 text-xs font-mono">
                Live
              </div>
            </div>
            <Leaderboard category={selectedCategory} region="Global" />
          </div>
        </div>
      </div>
    </main>
  );
}
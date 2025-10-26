"use client"

import { useState } from 'react';
import Header from '../components/header';
import Leaderboard from './components/Leaderboard';

const categories = ['All Time', 'Weekly', 'Monthly', 'Daily'];
const regions = ['Global', 'West Coast', 'Midwest', 'South', 'East Coast', 'Mountain'];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Time');
  const [selectedRegion, setSelectedRegion] = useState('Global');

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight text-white mb-4">
            <span className="italic">Community</span> Leaderboard
          </h1>
          <p className="text-white/60 text-sm font-mono uppercase tracking-wider">
            Top performers across the community
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Column - Filters */}
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="liquid-glass rounded-2xl p-6">
              <p className="text-white text-sm font-semibold mb-4 font-mono uppercase tracking-wider">Time Period</p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left
                      ${selectedCategory === category
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div className="liquid-glass rounded-2xl p-6">
              <p className="text-white text-sm font-semibold mb-4 font-mono uppercase tracking-wider">Region</p>
              <div className="space-y-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`
                      w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left
                      ${selectedRegion === region
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="liquid-glass rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold font-mono uppercase text-xs tracking-wider">
                {selectedCategory} - {selectedRegion}
              </h2>
              <div className="text-white/40 text-xs font-mono">
                Updated live
              </div>
            </div>
            <Leaderboard category={selectedCategory} region={selectedRegion} />
          </div>
        </div>
      </div>
    </main>
  );
}

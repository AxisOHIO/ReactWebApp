"use client"

import Image from 'next/image';

export default function Header() {
  return (
    <header className="liquid-glass fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 w-[95%] max-w-7xl rounded-2xl">
      {/* Logo */}
      <div className="flex items-center">
        <a href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
          <Image 
            src="/axislogowhite.png" 
            alt="Axis Logo" 
            width={40} 
            height={40}
            className="object-contain"
          />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        <a
          href="/community"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Community
        </a>
      </nav>

      {/* Login Button Group with Arrow */}
      <div id="gooey-btn" className="relative flex items-center group" style={{ filter: "url(#gooey-filter)" }}>
        <button className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>
        <button className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10">
          Login
        </button>
      </div>

      {/* SVG Filter for gooey effect */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </header>
  )
}

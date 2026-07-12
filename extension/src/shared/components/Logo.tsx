import React from 'react';

interface LogoProps {
  className?: string;
  theme?: 'sunrise' | 'midday' | 'sunset' | 'night' | 'default';
}

export function Logo({ className = 'h-10 w-10', theme = 'default' }: LogoProps) {
  // Determine actual theme (resolve 'default' to current local time of day)
  let activeTheme = theme;
  if (theme === 'default') {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 8) activeTheme = 'sunrise';
    else if (hours >= 8 && hours < 16) activeTheme = 'midday';
    else if (hours >= 16 && hours < 18) activeTheme = 'sunset';
    else activeTheme = 'night';
  }

  // Theme-specific colors and gradients
  let bgGradient = { start: '#091510', end: '#0d241d' }; // Dark emerald background
  let accentGradient = { start: '#34d399', end: '#10b981' }; // Mint to emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (activeTheme === 'sunrise') {
    // Peach / Rose / Warm Gold
    bgGradient = { start: '#1c0f16', end: '#2d1822' };
    accentGradient = { start: '#fda4af', end: '#f43f5e' };
    glowColor = 'rgba(244, 63, 94, 0.4)';
  } else if (activeTheme === 'midday') {
    // Sky Blue / Cyan
    bgGradient = { start: '#07162c', end: '#0c2547' };
    accentGradient = { start: '#38bdf8', end: '#0ea5e9' };
    glowColor = 'rgba(14, 165, 233, 0.4)';
  } else if (activeTheme === 'sunset') {
    // Sunset Violet / Orange
    bgGradient = { start: '#1d0c1e', end: '#2f1532' };
    accentGradient = { start: '#f472b6', end: '#db2777' };
    glowColor = 'rgba(219, 39, 119, 0.4)';
  }

  return (
    <svg 
      viewBox="0 0 256 256" 
      className={`${className} transition-all duration-1000`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Dynamic Gradients */}
        <linearGradient id="ap-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgGradient.start} />
          <stop offset="100%" stopColor={bgGradient.end} />
        </linearGradient>

        <linearGradient id="ap-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentGradient.start} />
          <stop offset="100%" stopColor={accentGradient.end} />
        </linearGradient>
      </defs>

      {/* Background Container with Glow */}
      <rect 
        x="12" 
        y="12" 
        width="232" 
        height="232" 
        rx="58" 
        fill="url(#ap-bg)" 
        stroke="url(#ap-accent)" 
        strokeWidth="6"
        style={{ filter: `drop-shadow(0px 0px 12px ${glowColor})` }}
        className="transition-all duration-1000"
      />

      {/* AP stylized Monogram grouped and skewed to match image */}
      <g 
        transform="translate(18, 5) skewX(-15)" 
        fill="url(#ap-accent)"
        style={{ filter: `drop-shadow(0px 0px 8px ${glowColor})` }}
        className="transition-all duration-1000"
      >
        {/* Left Leg and Crossbar of 'A' */}
        <path 
          d="M 75 168 L 75 142 L 58 142 L 58 128 L 92 128 L 92 168 Z" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Main Stem and Loop of 'P' (also forms top of 'A') */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd"
          d="M 106 168 L 106 88 L 148 88 C 165 88 178 98 178 113 C 178 128 165 138 148 138 L 124 138 L 124 168 H 106 Z M 124 102 L 124 124 L 146 124 C 151 124 156 120 156 113 C 156 106 151 102 146 102 H 124 Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Detached Right Foot Triangle of 'A' */}
        <polygon points="138,168 158,168 148,150" />
      </g>
    </svg>
  );
}

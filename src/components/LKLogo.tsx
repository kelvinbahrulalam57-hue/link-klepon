/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LKLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function LKLogo({ className = '', size = 120, glow = true }: LKLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer rotating cyber rings */}
      <div 
        className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 animate-[spin_20s_linear_infinite]"
        style={{ padding: '4px' }}
      />
      <div 
        className="absolute inset-2 rounded-full border border-rose-500/30 animate-[spin_10s_linear_infinite_reverse]"
        style={{ padding: '8px' }}
      />

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular background grid lines */}
        <circle cx="100" cy="100" r="85" stroke="url(#blueGrad)" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
        <circle cx="100" cy="100" r="75" stroke="url(#redGrad)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

        {/* Outer Split Energy Ring */}
        <path
          d="M 100 20 A 80 80 0 0 0 20 100 A 80 80 0 0 0 100 180"
          stroke="url(#blueGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          filter={glow ? 'url(#neonGlow)' : undefined}
          opacity="0.85"
        />
        <path
          d="M 100 180 A 80 80 0 0 0 180 100 A 80 80 0 0 0 100 20"
          stroke="url(#redGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          filter={glow ? 'url(#neonGlow)' : undefined}
          opacity="0.85"
        />

        {/* Corner tech notches */}
        <path d="M 40 40 L 30 50 M 30 50 L 30 70" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
        <path d="M 160 40 L 170 50 M 170 50 L 170 70" stroke="#f43f5e" strokeWidth="2" opacity="0.7" />
        <path d="M 40 160 L 30 150 M 30 150 L 30 130" stroke="#06b6d4" strokeWidth="2" opacity="0.7" />
        <path d="M 160 160 L 170 150 M 170 150 L 170 130" stroke="#f43f5e" strokeWidth="2" opacity="0.7" />

        {/* Futuristic overlapping L and K letters */}
        {/* L Shape (Left - Neon Blue) */}
        <g filter={glow ? 'url(#neonGlow)' : undefined}>
          <path
            d="M 65 55 L 65 145 L 115 145"
            stroke="url(#blueGrad)"
            strokeWidth="18"
            strokeLinecap="miter"
            strokeLinejoin="miter"
          />
          {/* Accent strip on L */}
          <path
            d="M 75 65 L 75 135 L 105 135"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="miter"
            strokeLinejoin="miter"
            opacity="0.9"
          />
        </g>

        {/* K Shape (Right - Neon Red) */}
        <g filter={glow ? 'url(#neonGlow)' : undefined}>
          {/* Vertical of K */}
          <path
            d="M 125 55 L 125 145"
            stroke="url(#redGrad)"
            strokeWidth="18"
            strokeLinecap="miter"
          />
          {/* Diagonals of K */}
          <path
            d="M 125 105 L 165 55"
            stroke="url(#redGrad)"
            strokeWidth="16"
            strokeLinecap="miter"
          />
          <path
            d="M 125 100 L 168 145"
            stroke="url(#redGrad)"
            strokeWidth="18"
            strokeLinecap="miter"
          />
          {/* White glowing core lines for K */}
          <path
            d="M 133 103 L 157 65"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.9"
          />
          <path
            d="M 132 100 L 158 135"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}

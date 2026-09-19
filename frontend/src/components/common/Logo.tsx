import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const LogoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`shrink-0 ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none drop-shadow-xs"
      >
        <defs>
          <linearGradient id="logoBar1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="60%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient id="logoBar2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>

          <linearGradient id="logoBar3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          <linearGradient id="logoSwoosh" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FED7AA" />
            <stop offset="85%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <radialGradient id="logoBeacon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="40%" stopColor="#FB923C" />
            <stop offset="80%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </radialGradient>

          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4338CA" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#logoShadow)">
          {/* Bar 1 (Left) */}
          <path
            d="M 46 98 C 46 91, 51 86, 58 86 L 72 86 C 79 86, 84 91, 84 98 L 74 138 C 74 142, 70 145, 65 145 L 40 145 C 36 145, 33 141, 35 137 Z"
            fill="url(#logoBar1)"
          />

          {/* Bar 2 (Center) */}
          <path
            d="M 94 62 C 94 54, 100 48, 108 48 L 126 48 C 134 48, 140 54, 140 62 L 122 138 C 122 142, 118 145, 113 145 L 86 145 C 82 145, 79 141, 81 137 Z"
            fill="url(#logoBar2)"
          />

          {/* Bar 3 (Right) */}
          <path
            d="M 148 76 C 148 69, 153 64, 160 64 L 176 64 C 183 64, 188 69, 188 76 L 168 138 C 168 142, 164 145, 159 145 L 136 145 C 132 145, 129 141, 131 137 Z"
            fill="url(#logoBar3)"
          />

          {/* Glossy Top 3D Edge Highlights */}
          <path d="M 50 94 C 50 89, 54 88, 60 88 L 70 88 C 76 88, 79 90, 78 95 L 75 106 L 47 106 Z" fill="#FFFFFF" fillOpacity="0.22" />
          <path d="M 98 58 C 98 52, 103 50, 110 50 L 124 50 C 131 50, 134 53, 133 59 L 130 72 L 95 72 Z" fill="#FFFFFF" fillOpacity="0.25" />
          <path d="M 152 72 C 152 66, 157 65, 163 65 L 173 65 C 179 65, 182 67, 181 73 L 178 84 L 149 84 Z" fill="#FFFFFF" fillOpacity="0.22" />

          {/* Swoosh Trajectory Arc */}
          <path
            d="M 32 131 C 68 126, 120 114, 180 72"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
          <path
            d="M 32 131 C 68 126, 120 114, 180 72"
            stroke="url(#logoSwoosh)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Orange Beacon Glow */}
          <circle cx="182" cy="71" r="14" fill="#F97316" fillOpacity="0.3" />
          <circle cx="182" cy="71" r="8" fill="url(#logoBeacon)" />
          <circle cx="180" cy="69" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />
        </g>
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-tight tracking-tight">
            <span className="font-black text-sm text-[#F97316]">DATA</span>
            <span className="font-black text-sm text-[#312E81]">SENSE</span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium tracking-wide">
            From Data to Intelligence.
          </span>
        </div>
      )}
    </div>
  );
};

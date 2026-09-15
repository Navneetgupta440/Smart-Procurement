import React from 'react';

interface ProcureLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
}

export const ProcureLogo: React.FC<ProcureLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Visual Monogram SVG (S-P Ribbons + 3D Parcel) */}
      <div className={`${currentSize.icon} shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBlueRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E88E5" />
              <stop offset="50%" stopColor="#0D47A1" />
              <stop offset="100%" stopColor="#002171" />
            </linearGradient>
            <linearGradient id="logoBlueDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B1E38" />
              <stop offset="100%" stopColor="#051026" />
            </linearGradient>
            <linearGradient id="logoGreenRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C853" />
              <stop offset="60%" stopColor="#00A86B" />
              <stop offset="100%" stopColor="#00693E" />
            </linearGradient>
            <linearGradient id="logoGreenDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004D2C" />
              <stop offset="100%" stopColor="#00331D" />
            </linearGradient>
            <linearGradient id="logoCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="logoCubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="logoCubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065F46" />
              <stop offset="100%" stopColor="#022C22" />
            </linearGradient>
          </defs>

          {/* BLUE RIBBON 'S' */}
          <path
            d="M 230 40 
               C 280 40, 290 85, 290 125 
               L 290 148 
               C 290 148, 275 142, 245 142 
               L 245 105 
               C 245 80, 230 75, 210 75 
               C 175 75, 140 100, 140 145 
               C 140 185, 185 220, 235 250 
               L 245 285 
               C 180 245, 100 205, 100 140 
               C 100 70, 160 40, 230 40 Z"
            fill="url(#logoBlueRibbon)"
          />

          <path
            d="M 235 250 
               L 170 330 
               L 100 350 
               L 100 310 
               L 185 220 
               Z"
            fill="url(#logoBlueDark)"
          />

          <path
            d="M 100 310 
               L 170 330 
               C 195 350, 220 375, 220 405 
               L 180 440 
               C 130 440, 100 380, 100 310 Z"
            fill="url(#logoBlueRibbon)"
          />

          {/* GREEN RIBBON 'P' */}
          <path
            d="M 195 125 
               C 240 75, 360 80, 400 180 
               C 435 265, 385 365, 270 375 
               L 260 325 
               C 335 320, 365 255, 345 200 
               C 325 145, 250 140, 205 175 
               Z"
            fill="url(#logoGreenRibbon)"
          />

          <path
            d="M 260 325 
               L 270 375 
               L 270 470 
               L 225 470 
               L 225 350 
               Z"
            fill="url(#logoGreenDark)"
          />

          <path
            d="M 225 350 
               L 270 325 
               L 270 470 
               C 255 475, 240 475, 225 470 
               Z"
            fill="url(#logoGreenRibbon)"
          />

          {/* 3D PARCEL BOX */}
          <g transform="translate(255, 175)">
            <polygon points="45,0 90,22 45,45 0,22" fill="url(#logoCubeTop)" />
            <polygon points="0,22 45,45 45,95 0,72" fill="url(#logoCubeLeft)" />
            <polygon points="45,45 90,22 90,72 45,95" fill="url(#logoCubeRight)" />

            <polygon points="38,4 52,11 38,39 24,32" fill="#FFFFFF" opacity="0.95" />
            <polygon points="18,13 68,37 60,41 10,17" fill="#FFFFFF" opacity="0.95" />

            <polygon points="18,31 28,36 28,86 18,81" fill="#E2E8F0" opacity="0.9" />
            <polygon points="62,36 72,31 72,81 62,86" fill="#CBD5E1" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight leading-none">
            <span className={`font-serif text-[#0B1E38] dark:text-blue-200 ${currentSize.text}`}>
              Smart
            </span>
            <span className={`font-serif text-[#008954] dark:text-emerald-400 ${currentSize.text}`}>
              Procurement
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-mono font-medium tracking-widest text-slate-500 dark:text-slate-400 mt-1 uppercase ${currentSize.sub}`}
            >
              Source • Simplify • Save
            </span>
          )}
        </div>
      )}
    </div>
  );
};

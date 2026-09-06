import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-xl',
      iconSize: 18,
      title: 'text-base',
      subtitle: 'text-[9.5px]',
    },
    md: {
      box: 'w-10 h-10 rounded-2xl',
      iconSize: 22,
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[10.5px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      iconSize: 26,
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs',
    },
  };

  const s = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Ultra-Minimalist High-End Robot AI Badge */}
      <div
        className={`${s.box} relative bg-slate-900 p-[1px] rounded-2xl border border-slate-800 shadow-md shadow-slate-950/20 transition-all duration-300 group-hover:scale-105 group-hover:border-[#00ffc6]/40`}
      >
        <div className="w-full h-full rounded-[14px] bg-[#070c14] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Radial Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,198,0.12)_0%,transparent_75%)] pointer-events-none" />

          {/* Minimalist Robot Vector Icon */}
          <svg
            width={s.iconSize}
            height={s.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 text-[#00ffc6] transition-transform duration-300 group-hover:scale-105"
          >
            {/* Top Antenna Node & Stem */}
            <circle cx="12" cy="3" r="1.75" fill="#00ffc6" />
            <path d="M12 4.75V7.5" stroke="#00ffc6" strokeWidth="2" strokeLinecap="round" />

            {/* Main Outer Squircle Head */}
            <rect
              x="3.5"
              y="7.5"
              width="17"
              height="13.5"
              rx="4.5"
              stroke="#00ffc6"
              strokeWidth="2.2"
              fill="rgba(0, 255, 198, 0.04)"
            />

            {/* Left Eye */}
            <circle cx="8.8" cy="13" r="1.8" fill="#00ffc6" />

            {/* Right Eye */}
            <circle cx="15.2" cy="13" r="1.8" fill="#00ffc6" />

            {/* Pill Mouth */}
            <rect
              x="9.5"
              y="16.8"
              width="5"
              height="1.5"
              rx="0.75"
              fill="#00ffc6"
            />
          </svg>
        </div>
      </div>

      {/* Editorial Luxury Typography with Playfair Display Italic */}
      <div className="flex flex-col justify-center leading-tight">
        <div className={`${s.title} tracking-tight font-black flex items-baseline text-slate-900`}>
          <span className="font-extrabold tracking-tight">Fun Math</span>
          <span
            className="font-serif italic font-normal text-emerald-600 ml-1.5 transition-colors group-hover:text-emerald-500"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            World
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${s.subtitle} font-bold text-slate-500 tracking-wider uppercase mt-0.5`}
          >
            Pecahan Kelas 7 SMP
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;

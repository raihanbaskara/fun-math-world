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
      iconSize: 20,
      title: 'text-sm sm:text-base',
      subtitle: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-2xl',
      iconSize: 24,
      title: 'text-base sm:text-lg',
      subtitle: 'text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      iconSize: 28,
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-xs',
    },
  };

  const s = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group shrink-0 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* High-End Tactile Bright Geometric Fraction Math Emblem */}
      <div
        className={`${s.box} relative bg-[#ffe600] border-2 border-slate-950 p-[2px] shadow-[2.5px_2.5px_0px_0px_#0f172a] group-hover:shadow-[3.5px_3.5px_0px_0px_#38bdf8] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 flex items-center justify-center overflow-hidden`}
      >
        <svg
          width={s.iconSize}
          height={s.iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110"
        >
          {/* Top Numerator (Pembilang) Dot in Clean White with Solid Outline */}
          <circle cx="16" cy="7.5" r="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
          
          {/* Main Solid Fraction Bar in Deep Slate */}
          <rect
            x="5.5"
            y="13.75"
            width="21"
            height="4.5"
            rx="2.25"
            fill="#0f172a"
          />
          
          {/* Bottom Denominator (Penyebut) Dot in Vibrant Cyan */}
          <circle cx="16" cy="24.5" r="3.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          
          {/* Subtle Math Sparkle Accents */}
          <path
            d="M24.5 6.5L26.5 8.5M26.5 6.5L24.5 8.5"
            stroke="#0f172a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="7.5" cy="24.5" r="1.2" fill="#0f172a" />
        </svg>
      </div>

      {/* Unified High-End Brand Typography */}
      <div className="flex flex-col justify-center leading-none min-w-0">
        <div className={`${s.title} font-black tracking-tight text-slate-950 flex items-center gap-1.5 whitespace-nowrap`}>
          <span className="font-mono tracking-tighter">Fun Math</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#ffe600] text-slate-950 text-[10px] font-mono font-black border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
            World
          </span>
        </div>
        {showSubtitle && (
          <span className={`${s.subtitle} font-mono font-bold text-slate-500 tracking-wider uppercase mt-1 whitespace-nowrap`}>
            Pecahan SMP Fase D
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;

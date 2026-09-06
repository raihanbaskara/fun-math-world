import React from 'react';
import { soundService } from '@/services/soundService';
import { Sparkles } from 'lucide-react';

export interface GlassmorphismCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'mint' | 'brand' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GlassmorphismCTA: React.FC<GlassmorphismCTAProps> = ({
  children,
  icon,
  variant = 'mint',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundService.click();
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    sm: 'px-4 h-9 text-xs gap-2',
    md: 'px-6 h-12 text-xs sm:text-sm gap-2.5',
    lg: 'px-8 h-14 text-sm sm:text-base gap-3',
  };

  const glowColors = {
    mint: 'from-[#00ffc6]/40 via-[#00e5b2]/10 to-transparent shadow-[0_4px_24px_rgba(0,255,198,0.25)] hover:shadow-[0_4px_32px_rgba(0,255,198,0.4)] border-[#00ffc6]/70',
    brand: 'from-blue-500/40 via-indigo-500/10 to-transparent shadow-[0_4px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_32px_rgba(59,130,246,0.4)] border-blue-400/70',
    purple: 'from-purple-500/40 via-pink-500/10 to-transparent shadow-[0_4px_24px_rgba(168,85,247,0.25)] hover:shadow-[0_4px_32px_rgba(168,85,247,0.4)] border-purple-400/70',
  };

  const badgeBg = {
    mint: 'bg-[#00ffc6] text-slate-950',
    brand: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-full font-black transition-all duration-300 select-none cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : 'inline-flex'
      } items-center justify-center backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-950 dark:text-white border ${
        glowColors[variant]
      } ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {/* Animated Rotating Conic Shimmer Border */}
      <div className="absolute -inset-[200%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#00ffc6_50%,transparent_100%)]" />

      {/* Frosted Glass Overlay */}
      <div className="absolute inset-[1px] rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors group-hover:bg-white/95 dark:group-hover:bg-slate-900/95" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        <span>{children}</span>
        {icon ? (
          icon
        ) : (
          <span className={`w-5 h-5 rounded-full ${badgeBg[variant]} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
            <Sparkles size={11} />
          </span>
        )}
      </span>
    </button>
  );
};

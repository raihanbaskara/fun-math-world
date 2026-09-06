import React from 'react';
import { soundService } from '@/services/soundService';
import { ArrowRight } from 'lucide-react';

export interface ArrowFillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'mint' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ArrowFillButton: React.FC<ArrowFillButtonProps> = ({
  children,
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
    sm: 'h-9 py-1 pl-4 pr-2 text-xs gap-2',
    md: 'h-11 py-1.5 pl-5 pr-2 text-xs sm:text-sm gap-3',
    lg: 'h-12.5 py-2 pl-6 pr-2.5 text-sm sm:text-base gap-3.5',
  };

  const circleSizeClasses = {
    sm: 'w-6.5 h-6.5',
    md: 'w-7.5 h-7.5',
    lg: 'w-8.5 h-8.5',
  };

  const variantStyles = {
    mint: {
      border: 'border-2 border-[#00ffc6] hover:border-[#00e5b2]',
      bg: 'bg-white',
      text: 'text-slate-900 group-hover:text-slate-950',
      fill: 'bg-[#00ffc6]',
      circleBg: 'bg-slate-100 text-slate-900 group-hover:bg-[#00ffc6]',
    },
    purple: {
      border: 'border-2 border-[#8b5cf6] hover:border-purple-600',
      bg: 'bg-white',
      text: 'text-slate-900 group-hover:text-white',
      fill: 'bg-[#8b5cf6]',
      circleBg: 'bg-slate-100 text-slate-900 group-hover:bg-[#8b5cf6] group-hover:text-white',
    },
    primary: {
      border: 'border-2 border-slate-900 hover:border-slate-700',
      bg: 'bg-white',
      text: 'text-slate-900 group-hover:text-white',
      fill: 'bg-slate-900',
      circleBg: 'bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white',
    },
    secondary: {
      border: 'border-2 border-slate-300 hover:border-slate-400',
      bg: 'bg-white',
      text: 'text-slate-800 group-hover:text-slate-950',
      fill: 'bg-slate-200',
      circleBg: 'bg-slate-100 text-slate-800 shadow-2xs',
    },
  };

  const v = variantStyles[variant];

  return (
    <button
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-full font-bold select-none cursor-pointer transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex ${
        fullWidth ? 'w-full' : 'inline-flex'
      } items-center justify-between shrink-0 ${v.bg} ${v.border} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {/* Sliding Fill Layer - Smooth full capsule expansion without any curve notch */}
      <span
        className={`absolute inset-0 rounded-full ${v.fill} scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500 ease-out z-0`}
      />

      {/* Button Text */}
      <span className={`relative z-10 inline-flex items-center gap-2 pr-2 font-black whitespace-nowrap transition-colors duration-300 ${v.text}`}>
        {children}
      </span>

      {/* Arrow Circle */}
      <span
        className={`relative z-10 flex items-center justify-center rounded-full shrink-0 transition-all duration-300 group-hover:translate-x-0.5 ${circleSizeClasses[size]} ${v.circleBg}`}
      >
        <ArrowRight size={15} className="transition-transform duration-300 group-hover:scale-110" />
      </span>
    </button>
  );
};

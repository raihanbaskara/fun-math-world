import React from 'react';
import { soundService } from '@/services/soundService';
import { ArrowRight } from 'lucide-react';

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  dotColor?: string;
  fullWidth?: boolean;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = 'Button',
      children,
      className = '',
      dotColor = 'bg-[#00ffc6]',
      fullWidth = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const label = children || text;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      soundService.click();
      if (onClick) onClick(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={`group relative ${
          fullWidth ? 'w-full' : 'w-auto'
        } cursor-pointer overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-center font-black text-xs sm:text-sm text-slate-900 dark:text-white transition-all duration-300 active:scale-[0.98] shadow-xs select-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {/* Background expanding dot (Single precision dot on the left) */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${dotColor} transition-all duration-500 ease-out group-hover:scale-[160] group-hover:opacity-100 z-0 pointer-events-none`}
        />

        {/* Default State: Text with left padding for the dot */}
        <span className="relative z-10 inline-flex items-center pl-4 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 whitespace-nowrap">
          <span>{label}</span>
        </span>

        {/* Hover State: Centered text with animated arrow */}
        <div className="absolute inset-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-slate-950 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap font-black">
          <span>{label}</span>
          <ArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

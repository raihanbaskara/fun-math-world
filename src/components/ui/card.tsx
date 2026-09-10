import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}

// Neobrutalist Double-Bezel Hardware Architecture
export const DoubleBezelCard: React.FC<CardProps> = ({
  children,
  className = '',
  innerClassName = '',
  onClick
}) => {
  const hasCustomBg = innerClassName.includes('bg-');
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl p-1.5 bg-amber-300 border-3 border-slate-900 shadow-[5px_5px_0px_0px_#0f172a] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#0f172a]' : ''
      } ${className}`}
    >
      <div
        className={`relative w-full h-full rounded-[calc(1rem-0.15rem)] ${
          hasCustomBg ? '' : 'bg-white'
        } p-6 border-2 border-slate-900/80 transition-all duration-200 ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

// Neobrutalist Glassmorphic / Pop Card
export const GlassCard: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`relative rounded-2xl p-6 bg-white border-3 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#0f172a]' : ''
    } ${className}`}
  >
    {children}
  </div>
);

// Standard Neobrutalist Card
export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl bg-white border-3 border-slate-900 p-6 shadow-[5px_5px_0px_0px_#0f172a] transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#0f172a]' : ''
    } ${className}`}
  >
    {children}
  </div>
);

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}

// Double-Bezel (Doppelrand) Hardware Architecture
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
      className={`group relative rounded-[2rem] p-1.5 bg-slate-100/90 border border-slate-200/90 shadow-xs transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-brand-500/40' : ''
      } ${className}`}
    >
      <div
        className={`relative w-full h-full rounded-[calc(2rem-0.375rem)] ${
          hasCustomBg ? '' : 'bg-white'
        } p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] border border-slate-100/20 transition-all duration-300 ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

// High-End Glassmorphic Card
export const GlassCard: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`relative rounded-[2rem] p-6 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all duration-300 ${
      onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
    } ${className}`}
  >
    {children}
  </div>
);

// Standard Card
export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
    } ${className}`}
  >
    {children}
  </div>
);


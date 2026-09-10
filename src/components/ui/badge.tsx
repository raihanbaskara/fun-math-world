import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral' | 'cyan' | 'yellow';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  className = ''
}) => {
  const variantStyles = {
    brand: 'bg-amber-300 text-slate-950 border-slate-900',
    yellow: 'bg-amber-300 text-slate-950 border-slate-900',
    cyan: 'bg-cyan-300 text-slate-950 border-slate-900',
    success: 'bg-lime-300 text-slate-950 border-slate-900',
    warning: 'bg-amber-300 text-slate-950 border-slate-900',
    danger: 'bg-pink-400 text-slate-950 border-slate-900',
    purple: 'bg-purple-300 text-slate-950 border-slate-900',
    neutral: 'bg-white text-slate-950 border-slate-900',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 shadow-[2.5px_2.5px_0px_0px_#0f172a] ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

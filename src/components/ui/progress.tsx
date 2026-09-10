import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  variant?: 'yellow' | 'cyan' | 'pink' | 'lime' | 'purple';
  showPercentage?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  label,
  variant = 'yellow',
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variantColors = {
    yellow: 'bg-[#ffe600]',
    cyan: 'bg-[#a5f3fc]',
    pink: 'bg-[#fbcfe8]',
    lime: 'bg-[#bef264]',
    purple: 'bg-[#c084fc]',
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-900">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded-md text-[11px]">{percentage}%</span>}
        </div>
      )}

      {/* Neobrutalist Progress Container */}
      <div className="relative w-full h-6 bg-white border-3 border-slate-900 rounded-full overflow-hidden shadow-[3px_3px_0px_0px_#0f172a] p-0.5">
        <div
          className={`h-full rounded-full ${variantColors[variant]} border-r-2 border-slate-900 transition-all duration-500 ease-out math-hatch`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

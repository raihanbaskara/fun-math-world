import React from 'react';
import { soundService } from '@/services/soundService';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'purple' | 'yellow' | 'lime' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyle = "group relative inline-flex items-center justify-center font-black uppercase tracking-wider rounded-2xl border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] transition-all duration-150 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#0f172a] whitespace-nowrap";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs gap-2",
    md: "px-5 py-3 text-sm gap-2.5",
    lg: "px-6 py-4 text-base gap-3",
  };

  const variantStyles = {
    primary: "bg-[#ffe600] hover:bg-[#fed700] text-slate-950",
    yellow: "bg-[#ffe600] hover:bg-[#fed700] text-slate-950",
    accent: "bg-[#a5f3fc] hover:bg-[#67e8f9] text-slate-950",
    cyan: "bg-[#38bdf8] hover:bg-[#0284c7] hover:text-white text-slate-950",
    secondary: "bg-white hover:bg-slate-100 text-slate-950",
    purple: "bg-[#c084fc] hover:bg-[#a855f7] text-slate-950",
    lime: "bg-[#bef264] hover:bg-[#a3e635] text-slate-950",
    outline: "bg-slate-100 hover:bg-slate-200 text-slate-900 border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a]",
    ghost: "bg-transparent border-transparent shadow-none hover:bg-slate-200/60 text-slate-900 hover:shadow-none hover:translate-x-0 hover:translate-y-0",
    danger: "bg-[#f472b6] hover:bg-[#e879f9] text-slate-950",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundService.click();
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
      {icon && (
        <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 text-xs shadow-xs">
          {icon}
        </span>
      )}
    </button>
  );
};

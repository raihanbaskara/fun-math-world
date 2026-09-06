import React from 'react';
import { soundService } from '@/services/soundService';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const baseStyle = "group relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs gap-2",
    md: "px-4.5 py-2.5 text-sm gap-2.5",
    lg: "px-6 py-3.5 text-base gap-3 shadow-xl",
  };

  const variantStyles = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10",
    accent: "bg-[#00ffc6] hover:bg-[#00e5b2] text-slate-950 font-black shadow-[0_0_24px_rgba(0,255,198,0.4)]",
    secondary: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700",
    outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
    ghost: "hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
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
        <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
          {icon}
        </span>
      )}
    </button>
  );
};

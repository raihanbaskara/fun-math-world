import React from 'react';

export const Footer: React.FC<{
  onAboutClick?: () => void;
  onSecurityClick?: () => void;
  onDataPolicyClick?: () => void;
}> = ({ onAboutClick, onSecurityClick, onDataPolicyClick }) => {
  return (
    <footer className="mt-auto border-t-3 border-slate-900 dark:border-slate-800 bg-[#fffbeb] dark:bg-[#0b0f19] py-6 text-center text-xs text-slate-800 dark:text-slate-300 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="px-2 py-0.5 bg-[#ffe600] text-slate-950 font-black rounded border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] font-mono text-[10px]">
            FUN MATH WORLD
          </span>
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            © 2026 Fun Math World — Kelas 7 SMP Kurikulum Merdeka
          </span>
        </div>
        <div className="flex gap-3 font-bold flex-wrap justify-center">
          {onAboutClick && (
            <button
              onClick={onAboutClick}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 border-2 border-slate-900 dark:border-slate-700 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] hover:bg-amber-200 dark:hover:bg-slate-700 transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Tentang Platform
            </button>
          )}
          {onSecurityClick && (
            <button
              onClick={onSecurityClick}
              className="px-2.5 py-1 bg-sky-200 dark:bg-sky-950 text-slate-950 dark:text-sky-200 border-2 border-slate-900 dark:border-slate-700 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] hover:bg-sky-300 dark:hover:bg-sky-900 transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Keamanan 1 Akun 1 Device
            </button>
          )}
          {onDataPolicyClick && (
            <button
              onClick={onDataPolicyClick}
              className="px-2.5 py-1 bg-lime-200 dark:bg-lime-950 text-slate-950 dark:text-lime-200 border-2 border-slate-900 dark:border-slate-700 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] hover:bg-lime-300 dark:hover:bg-lime-900 transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Database &amp; Privasi
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

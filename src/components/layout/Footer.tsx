import React from 'react';

export const Footer: React.FC<{
  onAboutClick?: () => void;
  onSecurityClick?: () => void;
  onDataPolicyClick?: () => void;
}> = ({ onAboutClick, onSecurityClick, onDataPolicyClick }) => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">© 2026 Fun Math World</span> — Kelas 7 SMP Kurikulum Merdeka
        </div>
        <div className="flex gap-4 font-semibold">
          {onAboutClick && (
            <button onClick={onAboutClick} className="hover:text-brand-500 hover:underline">
              Tentang Platform
            </button>
          )}
          {onSecurityClick && (
            <button onClick={onSecurityClick} className="hover:text-brand-500 hover:underline">
              Keamanan 1 Akun 1 Device
            </button>
          )}
          {onDataPolicyClick && (
            <button onClick={onDataPolicyClick} className="hover:text-brand-500 hover:underline">
              Database & Privasi
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

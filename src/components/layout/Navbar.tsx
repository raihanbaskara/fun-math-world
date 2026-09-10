import React from 'react';
import { Volume2, VolumeX, Moon, Sun, LogOut, Sparkles, Menu } from 'lucide-react';
import { User } from '@/types';
import { soundService } from '@/services/soundService';
import { Logo } from '@/components/ui/logo';

export interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  onNavigateLanding?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onToggleSidebar,
  onNavigateLanding,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b-3 border-slate-950 dark:border-slate-800 shadow-[0_4px_0px_0px_#0f172a] dark:shadow-[0_4px_0px_0px_#000000] transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={() => {
                soundService.click();
                onToggleSidebar();
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] text-slate-950 dark:text-slate-100 hover:bg-[#ffe600] dark:hover:bg-[#ffe600] dark:hover:text-slate-950 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer flex items-center justify-center group"
              title="Buka / Tutup Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} className="stroke-[2.5]" />
            </button>
          )}

          {/* Logo */}
          <Logo
            size="md"
            onClick={onNavigateLanding}
            className="cursor-pointer"
          />
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundService.click();
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] text-slate-950 dark:text-slate-100 hover:bg-[#ffe600] dark:hover:bg-[#ffe600] dark:hover:text-slate-950 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-500" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              onToggleDarkMode();
              soundService.click();
            }}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] text-slate-950 dark:text-slate-100 hover:bg-[#ffe600] dark:hover:bg-[#ffe600] dark:hover:text-slate-950 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title={darkMode ? "Mode Terang Aktif" : "Mode Gelap"}
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* User Profile Info & Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-950/20 dark:border-slate-700">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] object-cover bg-amber-100 shrink-0"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black leading-tight text-slate-950 dark:text-slate-100">{currentUser.name}</div>
                <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                  {currentUser.role === 'siswa' ? (currentUser.class || 'Kelas 7-A') : currentUser.role === 'guru' ? 'Guru Matematika' : 'Admin'}
                </div>
              </div>

              <button
                onClick={() => {
                  soundService.click();
                  onLogout();
                }}
                className="p-2 rounded-xl bg-rose-400 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] text-slate-950 hover:bg-rose-500 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition ml-1 cursor-pointer font-black"
                title="Keluar Akun"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundService.click();
                if (onNavigateLanding) onNavigateLanding();
              }}
              className="px-4 py-2 rounded-xl bg-[#ffe600] text-slate-950 border-2 border-slate-950 dark:border-slate-700 shadow-[2.5px_2.5px_0px_0px_#0f172a] dark:shadow-[2.5px_2.5px_0px_0px_#000] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono font-black text-xs transition cursor-pointer"
            >
              Masuk Belajar
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

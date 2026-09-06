import React from 'react';
import { Volume2, VolumeX, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { User } from '@/types';
import { soundService } from '@/services/soundService';
import { storageService } from '@/services/storageService';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left: Spike Staggered Hamburger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleSidebar && (
              <button
                onClick={() => {
                  soundService.click();
                  onToggleSidebar();
                }}
                className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center justify-center group"
                title="Buka / Tutup Sidebar"
                aria-label="Toggle Sidebar"
              >
                {/* Spike Staggered 3-Line Hamburger Icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-transform duration-200 group-hover:scale-105"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="15" y2="12" />
                  <line x1="4" y1="18" x2="10" y2="18" />
                </svg>
              </button>
            )}

            {/* Luxury Math Logo */}
            <Logo
              size="md"
              onClick={onNavigateLanding}
              className="cursor-pointer"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                soundService.click();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-red-500" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                onToggleDarkMode();
                soundService.click();
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title={darkMode ? "Mode Terang Aktif" : "Mode Gelap"}
            >
              {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
            </button>

            {/* User Info & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full ring-2 ring-brand-500/50 object-cover"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-black leading-tight text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] font-bold text-brand-600">
                    {currentUser.role === 'siswa' ? (currentUser.class || 'Kelas 7-A') : currentUser.role === 'guru' ? 'Guru Matematika' : 'Administrator'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundService.click();
                    onLogout();
                  }}
                  className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition ml-1 cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

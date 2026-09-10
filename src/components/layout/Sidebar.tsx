import React from 'react';
import {
  Home,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Trophy,
  PenTool,
  HeartHandshake,
  User as UserIcon,
  LogOut,
  Users,
  LayoutDashboard,
  Bell,
  Settings,
  Calculator,
  FlaskConical,
  X,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { User } from '@/types';
import { soundService } from '@/services/soundService';
import { Logo } from '@/components/ui/logo';

export interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: User;
  unreadCount?: number;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: any;
  color: 'yellow' | 'cyan' | 'pink' | 'lime' | 'purple' | 'orange';
  badge?: number;
  mathSymbol?: string;
}

// Neobrutalist Theme Styles for Active & Hover States
const colorStyles: Record<string, {
  activeBg: string;
  activeText: string;
  badgeBg: string;
  stickerBg: string;
}> = {
  yellow: {
    activeBg: 'bg-[#ffe600] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-yellow-400 text-slate-950',
    stickerBg: 'bg-amber-200',
  },
  cyan: {
    activeBg: 'bg-[#38bdf8] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-sky-400 text-slate-950',
    stickerBg: 'bg-sky-200',
  },
  pink: {
    activeBg: 'bg-[#ff94e8] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-pink-400 text-slate-950',
    stickerBg: 'bg-pink-300',
  },
  lime: {
    activeBg: 'bg-[#a3e635] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-lime-400 text-slate-950',
    stickerBg: 'bg-lime-300',
  },
  purple: {
    activeBg: 'bg-[#c084fc] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-purple-400 text-slate-950',
    stickerBg: 'bg-purple-300',
  },
  orange: {
    activeBg: 'bg-[#ff9838] text-slate-950 font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]',
    activeText: 'text-slate-950',
    badgeBg: 'bg-orange-400 text-slate-950',
    stickerBg: 'bg-orange-300',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  unreadCount = 0,
  onLogout,
  onCloseMobile,
}) => {
  const isSiswa = currentUser.role === 'siswa';
  const isGuru = currentUser.role === 'guru';
  const isAdmin = currentUser.role === 'admin';

  const handleNav = (route: string) => {
    soundService.click();
    onNavigate(route);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderItem = (item: NavItemConfig) => {
    const isActive = currentRoute === item.id;
    const style = colorStyles[item.color];
    const IconComponent = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none border-2 ${
          isActive
            ? style.activeBg
            : 'bg-white dark:bg-slate-800/80 border-transparent text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-700 hover:border-slate-900 dark:hover:border-slate-600 hover:shadow-[3px_3px_0px_0px_#0f172a] dark:hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#0f172a]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 group-hover:bg-slate-950 group-hover:text-white'} transition-colors`}>
            <IconComponent size={16} />
          </div>
          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {item.mathSymbol && (
            <span className="hidden group-hover:inline-block font-mono text-[10px] font-black px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded border border-slate-900">
              {item.mathSymbol}
            </span>
          )}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-md border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0f172a]">
              +{item.badge}
            </span>
          )}
          <ChevronRight
            size={14}
            className={`transition-transform duration-150 ${
              isActive ? 'translate-x-0.5 opacity-100 text-slate-950' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-1'
            }`}
          />
        </div>
      </button>
    );
  };

  // SISWA MENU GROUPS
  const siswaMenuUtama: NavItemConfig[] = [
    { id: 'siswa/home', label: 'Beranda Utama', icon: Home, color: 'yellow', mathSymbol: '[1]' },
    { id: 'siswa/materi', label: 'Materi Pecahan', icon: BookOpen, color: 'cyan', mathSymbol: '½' },
    { id: 'siswa/video', label: 'Video Belajar', icon: Video, color: 'lime', mathSymbol: '▶' },
    { id: 'siswa/studio', label: 'Studio Visual', icon: FlaskConical, color: 'purple', mathSymbol: '÷' },
    { id: 'siswa/kalkulator', label: 'Kalkulator Pecahan', icon: Calculator, color: 'pink', mathSymbol: '=' },
  ];

  const siswaTugasEvaluasi: NavItemConfig[] = [
    { id: 'siswa/lkpd', label: 'LKPD Digital AI', icon: FileText, color: 'yellow', mathSymbol: 'LKPD' },
    { id: 'siswa/latsol', label: 'Latihan Soal Kuis', icon: HelpCircle, color: 'pink', mathSymbol: 'QZ' },
    { id: 'siswa/evaluasi', label: 'Evaluasi Soal Essai', icon: PenTool, color: 'orange', mathSymbol: '7.A' },
  ];

  const siswaInteraksiAkun: NavItemConfig[] = [
    { id: 'siswa/refleksi', label: 'Refleksi Diri', icon: HeartHandshake, color: 'pink', mathSymbol: '★' },
    { id: 'siswa/pengumuman', label: 'Pengumuman Kelas', icon: Bell, color: 'cyan', badge: unreadCount, mathSymbol: 'INFO' },
    { id: 'siswa/profil', label: 'Profil & Progress', icon: UserIcon, color: 'lime', mathSymbol: '100%' },
  ];

  // GURU MENU
  const guruMenu: NavItemConfig[] = [
    { id: 'guru/dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, color: 'yellow' },
    { id: 'guru/siswa', label: 'Daftar Siswa', icon: Users, color: 'lime' },
    { id: 'guru/materi', label: 'Kelola Materi', icon: BookOpen, color: 'cyan' },
    { id: 'guru/lkpd', label: 'Kelola & Nilai LKPD', icon: FileText, color: 'purple' },
    { id: 'guru/latsol', label: 'Ruang Latihan Soal', icon: HelpCircle, color: 'pink' },
    { id: 'guru/soal', label: 'Bank Soal Essai', icon: PenTool, color: 'orange' },
    { id: 'guru/rekap', label: 'Rekap Nilai Excel', icon: BarChart3, color: 'yellow' },
    { id: 'guru/pengumuman', label: 'Buat Pengumuman', icon: Bell, color: 'cyan' },
  ];

  // ADMIN MENU
  const adminMenu: NavItemConfig[] = [
    { id: 'admin/dashboard', label: 'Status Sistem', icon: LayoutDashboard, color: 'purple' },
    { id: 'admin/users', label: 'Manajemen Akun', icon: Users, color: 'cyan' },
    { id: 'admin/maintenance', label: 'Pemeliharaan DB', icon: Settings, color: 'pink' },
  ];

  return (
    <aside className="w-full md:w-68 bg-[#fffdf5] dark:bg-[#111827] rounded-2xl border-3 border-slate-900 dark:border-slate-800 p-4 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] h-fit sticky top-20 flex flex-col justify-between gap-5 select-none font-sans">
      
      {/* SIDEBAR HEADER: CLEAN LOGO & MOBILE CLOSE */}
      <div className="flex items-center justify-between pb-3 border-b-3 border-slate-900 dark:border-slate-800">
        <Logo size="sm" showSubtitle={true} />

        {onCloseMobile && (
          <button
            onClick={() => {
              soundService.click();
              onCloseMobile();
            }}
            className="md:hidden p-1.5 rounded-lg bg-rose-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-rose-500 transition cursor-pointer"
            title="Tutup Menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* NAVIGATION SECTIONS */}
      <div className="space-y-4">
        
        {/* SISWA NAVIGATION */}
        {isSiswa && (
          <nav className="space-y-4">
            
            {/* Section 1: Home / Menu Utama */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <span>// MENU UTAMA</span>
              </div>
              {siswaMenuUtama.map(item => renderItem(item))}
            </div>

            {/* Section 2: Apps / Tugas & Evaluasi */}
            <div className="space-y-1 pt-1">
              <div className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <span>// LKPD &amp; EVALUASI</span>
              </div>
              {siswaTugasEvaluasi.map(item => renderItem(item))}
            </div>

            {/* Section 3: User / Interaksi & Akun */}
            <div className="space-y-1 pt-1">
              <div className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <span>// AKUN SISWA</span>
              </div>
              {siswaInteraksiAkun.map(item => renderItem(item))}
            </div>

          </nav>
        )}

        {/* GURU NAVIGATION */}
        {isGuru && (
          <nav className="space-y-4">
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <span>// PORTAL GURU</span>
              </div>
              {guruMenu.map(item => renderItem(item))}
            </div>
          </nav>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <nav className="space-y-4">
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                <span>// ADMINISTRATOR</span>
              </div>
              {adminMenu.map(item => renderItem(item))}
            </div>
          </nav>
        )}

      </div>

      {/* USER PROFILE STICKER CARD */}
      <div className="pt-3 border-t-3 border-slate-900 dark:border-slate-800 mt-auto">
        <div className="rounded-xl p-3 bg-amber-200 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-lg object-cover border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-950 dark:text-slate-100 leading-tight truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-400 truncate">
                {currentUser.role === 'siswa'
                  ? (currentUser.class || 'Kelas 7-A')
                  : currentUser.role === 'guru'
                  ? 'Guru Matematika'
                  : 'Administrator'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.click();
              onLogout();
            }}
            className="w-8 h-8 rounded-lg bg-rose-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-rose-500 flex items-center justify-center transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0 ml-1.5"
            title="Keluar Akun"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </aside>
  );
};

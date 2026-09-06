import React from 'react';
import {
  Home,
  BookOpen,
  Video,
  FlaskConical,
  Calculator,
  FileText,
  PenTool,
  HeartHandshake,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
  X,
  Sparkles
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

type ColorVariant = 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'teal' | 'pink' | 'orange' | 'cyan';

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: ColorVariant;
  badge?: number;
}

const colorVariants: Record<ColorVariant, {
  bgActive: string;
  bgHover: string;
  bar: string;
  textActive: string;
  textHover: string;
  iconActive: string;
  iconHover: string;
  chevron: string;
}> = {
  sky: {
    bgActive: "bg-[#e8f7ff] border-y border-r border-sky-200/80 shadow-xs",
    bgHover: "bg-[#e8f7ff]/75 border-y border-r border-sky-200/50",
    bar: "bg-sky-500",
    textActive: "text-sky-700",
    textHover: "group-hover:text-sky-700",
    iconActive: "text-sky-600",
    iconHover: "group-hover:text-sky-600",
    chevron: "text-sky-600",
  },
  emerald: {
    bgActive: "bg-emerald-50 border-y border-r border-emerald-200/80 shadow-xs",
    bgHover: "bg-emerald-50/75 border-y border-r border-emerald-200/50",
    bar: "bg-emerald-500",
    textActive: "text-emerald-800",
    textHover: "group-hover:text-emerald-800",
    iconActive: "text-emerald-600",
    iconHover: "group-hover:text-emerald-600",
    chevron: "text-emerald-600",
  },
  amber: {
    bgActive: "bg-[#fff8ec] border-y border-r border-amber-200/80 shadow-xs",
    bgHover: "bg-[#fff8ec]/80 border-y border-r border-amber-200/50",
    bar: "bg-amber-500",
    textActive: "text-amber-800",
    textHover: "group-hover:text-amber-800",
    iconActive: "text-amber-600",
    iconHover: "group-hover:text-amber-600",
    chevron: "text-amber-600",
  },
  purple: {
    bgActive: "bg-[#f4f0ff] border-y border-r border-purple-200/80 shadow-xs",
    bgHover: "bg-[#f4f0ff]/80 border-y border-r border-purple-200/50",
    bar: "bg-purple-500",
    textActive: "text-purple-800",
    textHover: "group-hover:text-purple-800",
    iconActive: "text-purple-600",
    iconHover: "group-hover:text-purple-600",
    chevron: "text-purple-600",
  },
  rose: {
    bgActive: "bg-rose-50 border-y border-r border-rose-200/80 shadow-xs",
    bgHover: "bg-rose-50/75 border-y border-r border-rose-200/50",
    bar: "bg-rose-500",
    textActive: "text-rose-800",
    textHover: "group-hover:text-rose-800",
    iconActive: "text-rose-600",
    iconHover: "group-hover:text-rose-600",
    chevron: "text-rose-600",
  },
  indigo: {
    bgActive: "bg-indigo-50 border-y border-r border-indigo-200/80 shadow-xs",
    bgHover: "bg-indigo-50/75 border-y border-r border-indigo-200/50",
    bar: "bg-indigo-500",
    textActive: "text-indigo-800",
    textHover: "group-hover:text-indigo-800",
    iconActive: "text-indigo-600",
    iconHover: "group-hover:text-indigo-600",
    chevron: "text-indigo-600",
  },
  teal: {
    bgActive: "bg-teal-50 border-y border-r border-teal-200/80 shadow-xs",
    bgHover: "bg-teal-50/75 border-y border-r border-teal-200/50",
    bar: "bg-teal-500",
    textActive: "text-teal-800",
    textHover: "group-hover:text-teal-800",
    iconActive: "text-teal-600",
    iconHover: "group-hover:text-teal-600",
    chevron: "text-teal-600",
  },
  pink: {
    bgActive: "bg-pink-50 border-y border-r border-pink-200/80 shadow-xs",
    bgHover: "bg-pink-50/75 border-y border-r border-pink-200/50",
    bar: "bg-pink-500",
    textActive: "text-pink-800",
    textHover: "group-hover:text-pink-800",
    iconActive: "text-pink-600",
    iconHover: "group-hover:text-pink-600",
    chevron: "text-pink-600",
  },
  orange: {
    bgActive: "bg-orange-50 border-y border-r border-orange-200/80 shadow-xs",
    bgHover: "bg-orange-50/75 border-y border-r border-orange-200/50",
    bar: "bg-orange-500",
    textActive: "text-orange-800",
    textHover: "group-hover:text-orange-800",
    iconActive: "text-orange-600",
    iconHover: "group-hover:text-orange-600",
    chevron: "text-orange-600",
  },
  cyan: {
    bgActive: "bg-cyan-50 border-y border-r border-cyan-200/80 shadow-xs",
    bgHover: "bg-cyan-50/75 border-y border-r border-cyan-200/50",
    bar: "bg-cyan-500",
    textActive: "text-cyan-800",
    textHover: "group-hover:text-cyan-800",
    iconActive: "text-cyan-600",
    iconHover: "group-hover:text-cyan-600",
    chevron: "text-cyan-600",
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

  const renderItem = (item: NavItemConfig, showChevron = true) => {
    const isActive = currentRoute === item.id;
    const variant = colorVariants[item.color];
    const IconComponent = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`group relative w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-r-2xl text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] overflow-hidden ${
          isActive
            ? `font-black ${variant.textActive}`
            : `text-slate-600 font-bold ${variant.textHover}`
        }`}
      >
        {/* Left-to-right animated slide-in background pill */}
        <div
          className={`absolute inset-0 origin-left transition-transform duration-300 ease-out rounded-r-2xl pointer-events-none ${
            isActive
              ? `${variant.bgActive} scale-x-100`
              : `${variant.bgHover} scale-x-0 group-hover:scale-x-100`
          }`}
        />

        {/* Spike Left Active Bar */}
        {isActive && (
          <div
            className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${variant.bar} shadow-xs`}
          />
        )}

        {/* Foreground Content */}
        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <IconComponent
            size={18}
            className={`transition-colors duration-200 shrink-0 ${
              isActive ? variant.iconActive : `text-slate-400 ${variant.iconHover}`
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 shrink-0 ml-2">
          {item.badge !== undefined && item.badge > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[10px] rounded-full badge-pulse shadow-xs">
              +{item.badge}
            </span>
          )}

          {showChevron && (
            <ChevronRight
              size={15}
              className={`transition-all duration-200 ${
                isActive
                  ? `${variant.chevron} translate-x-0.5 opacity-100`
                  : `text-slate-300 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 ${variant.iconHover}`
              }`}
            />
          )}
        </div>
      </button>
    );
  };

  // SISWA MENU GROUPS (Vibrant Spike Multi-Color Palette)
  const siswaMenuUtama: NavItemConfig[] = [
    { id: 'siswa/home', label: 'Beranda Utama', icon: Home, color: 'sky' },
    { id: 'siswa/materi', label: 'Materi Pembelajaran', icon: BookOpen, color: 'emerald' },
    { id: 'siswa/video', label: 'Video Belajar', icon: Video, color: 'amber' },
    { id: 'siswa/studio', label: 'Studio Visual', icon: FlaskConical, color: 'purple' },
    { id: 'siswa/kalkulator', label: 'Kalkulator Pecahan', icon: Calculator, color: 'rose' },
  ];

  const siswaTugasEvaluasi: NavItemConfig[] = [
    { id: 'siswa/lkpd', label: 'LKPD Digital AI', icon: FileText, color: 'indigo' },
    { id: 'siswa/evaluasi', label: 'Evaluasi Soal Essai', icon: PenTool, color: 'teal' },
  ];

  const siswaInteraksiAkun: NavItemConfig[] = [
    { id: 'siswa/refleksi', label: 'Refleksi Diri', icon: HeartHandshake, color: 'pink' },
    { id: 'siswa/pengumuman', label: 'Pengumuman Kelas', icon: Bell, color: 'orange', badge: unreadCount },
    { id: 'siswa/profil', label: 'Profil & Progress', icon: UserIcon, color: 'cyan' },
  ];

  // GURU MENU (Spike Color Palette)
  const guruMenu: NavItemConfig[] = [
    { id: 'guru/dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, color: 'sky' },
    { id: 'guru/materi', label: 'Kelola Materi', icon: BookOpen, color: 'emerald' },
    { id: 'guru/lkpd', label: 'Kelola & Nilai LKPD', icon: FileText, color: 'indigo' },
    { id: 'guru/soal', label: 'Bank Soal Essai', icon: HelpCircle, color: 'amber' },
    { id: 'guru/rekap', label: 'Rekap Nilai Excel', icon: BarChart3, color: 'purple' },
    { id: 'guru/pengumuman', label: 'Buat Pengumuman', icon: Bell, color: 'orange' },
  ];

  // ADMIN MENU (Spike Color Palette)
  const adminMenu: NavItemConfig[] = [
    { id: 'admin/dashboard', label: 'Status Sistem', icon: LayoutDashboard, color: 'purple' },
    { id: 'admin/users', label: 'Manajemen Akun', icon: Users, color: 'cyan' },
    { id: 'admin/maintenance', label: 'Pemeliharaan DB', icon: Settings, color: 'rose' },
  ];

  return (
    <aside className="w-full md:w-68 bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs h-fit sticky top-20 flex flex-col justify-between gap-6 select-none transition-colors">
      
      {/* SIDEBAR HEADER: SPIKE BRAND LOGO & MOBILE CLOSE */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1">
        <Logo size="sm" />

        {onCloseMobile && (
          <button
            onClick={() => {
              soundService.click();
              onCloseMobile();
            }}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            title="Tutup Menu"
          >
            <X size={18} />
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
              <div className="px-3 text-[10.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Home
              </div>
              {siswaMenuUtama.map(item => renderItem(item))}
            </div>

            {/* Section 2: Apps / Tugas & Evaluasi */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Apps
              </div>
              {siswaTugasEvaluasi.map(item => renderItem(item))}
            </div>

            {/* Section 3: User / Interaksi & Akun */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                User
              </div>
              {siswaInteraksiAkun.map(item => renderItem(item))}
            </div>

          </nav>
        )}

        {/* GURU NAVIGATION */}
        {isGuru && (
          <nav className="space-y-4">
            <div className="space-y-1">
              <div className="px-3 text-[10.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Portal Guru
              </div>
              {guruMenu.map(item => renderItem(item))}
            </div>
          </nav>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <nav className="space-y-4">
            <div className="space-y-1">
              <div className="px-3 text-[10.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Portal Administrator
              </div>
              {adminMenu.map(item => renderItem(item))}
            </div>
          </nav>
        )}

      </div>

      {/* SPIKE BOTTOM USER PROFILE CAPSULE */}
      <div className="pt-2 border-t border-slate-100 mt-auto">
        <div className="rounded-2xl p-3 bg-[#e8f7ff] border border-sky-100/90 flex items-center justify-between shadow-xs transition-all duration-200 hover:shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 truncate">
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
            className="w-8 h-8 rounded-full bg-white text-slate-700 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ml-2"
            title="Keluar Akun"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

    </aside>
  );
};

import React from 'react';
import { Logo } from '@/components/ui/logo';
import { soundService } from '@/services/soundService';
import { Cpu, ShieldCheck, ArrowRight } from 'lucide-react';

export interface AdminLandingProps {
  onNavigate: (route: string) => void;
}

export const AdminLanding: React.FC<AdminLandingProps> = ({ onNavigate }) => {
  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#c084fc] selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP FLOATING NEOBRUTAL HEADER */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4 bg-[#fffdf5]/90 backdrop-blur-md border-b-3 border-slate-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" onClick={() => handlePortalNavigate('landing')} />

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePortalNavigate('landing')}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Beranda Utama
            </button>
            <button
              onClick={() => handlePortalNavigate('admin/login')}
              className="px-5 py-2 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Masuk Admin</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION WITH FLOATING ACCENTS */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full">
        
        {/* Floating Math Decorative Elements (Gambar 4 & 5) */}
        {/* 1. SIGMA [∑] (Top Left Floating) */}
        <div 
          style={{ '--rot': '-10deg' } as React.CSSProperties}
          className="absolute -top-2 left-2 sm:left-6 hidden md:block animate-float-slow select-none pointer-events-none z-10"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c084fc] text-slate-950 font-mono font-black text-sm rounded-2xl border-3 border-slate-950 shadow-[3.5px_3.5px_0px_0px_#0f172a]">
            <span>∑</span>
            <span className="text-xs">DATA</span>
          </div>
        </div>

        {/* 2. PI [π] (Top Right Floating) */}
        <div 
          style={{ '--rot': '12deg' } as React.CSSProperties}
          className="absolute -top-3 right-2 sm:right-6 hidden md:block animate-float-reverse select-none pointer-events-none z-10"
        >
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a3e635] text-slate-950 font-mono font-black text-sm rounded-2xl border-3 border-slate-950 shadow-[3.5px_3.5px_0px_0px_#0f172a]">
            <span>π</span>
            <span className="text-xs">RAD</span>
          </div>
        </div>

        {/* 3. SQUARE ROOT [√] (Bottom Left Floating) */}
        <div 
          style={{ '--rot': '6deg' } as React.CSSProperties}
          className="absolute bottom-6 left-4 sm:left-10 hidden lg:block animate-float-reverse select-none pointer-events-none z-10"
        >
          <div className="flex items-center gap-1 px-3 py-1 bg-[#38bdf8] text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <span>√x &gt; 0</span>
          </div>
        </div>

        {/* 4. FRACTION / RATIO BADGE (Bottom Right Floating) */}
        <div 
          style={{ '--rot': '-7deg' } as React.CSSProperties}
          className="absolute bottom-6 right-4 sm:right-10 hidden lg:block animate-float-slow select-none pointer-events-none z-10"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffe600] text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <span>1/1 Sesi Lock</span>
          </div>
        </div>

        {/* Dual Neobrutal Eyebrow Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c084fc] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform -rotate-1">
            <Cpu size={14} className="text-slate-950" />
            <span>PORTAL ADMINISTRATOR SISTEM</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#a3e635] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform rotate-1">
            <ShieldCheck size={14} className="text-slate-950" />
            <span>KEAMANAN &amp; TATA KELOLA DATA</span>
          </div>
        </div>

        {/* Bold Fluid Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-slate-950 tracking-tight leading-[1.15] max-w-3xl">
          Infrastruktur &amp; Tata Kelola <br />
          <span className="bg-[#c084fc] px-3.5 py-1 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] inline-block mt-2">
            Pembelajaran Digital Terpadu
          </span>
        </h1>

        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Kontrol terpusat untuk akun pengguna (Siswa, Guru, Admin), pengawasan integritas sesi 1-Device Lock, pemeliharaan storage database, dan pencadangan data instan.
        </p>

        {/* Hero Action CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => handlePortalNavigate('admin/login')}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#c084fc] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#c084fc] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-3"
          >
            <span>Buka Dasbor Admin</span>
            <ArrowRight size={16} className="text-[#c084fc]" />
          </button>
          
          <button
            onClick={() => handlePortalNavigate('landing')}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Halaman Utama</span>
          </button>
        </div>

      </main>

      {/* 3. FOOTER (Gambar 3 Neobrutal Standard) */}
      <footer className="w-full bg-white border-t-2 border-slate-950 py-3.5 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-bold text-slate-600">
        <div>© 2026 Fun Math World — Kurikulum Merdeka Kelas 7 SMP</div>
        <div className="text-slate-500 font-medium">v2.0 Neobrutal Edition</div>
      </footer>

    </div>
  );
};

export default AdminLanding;

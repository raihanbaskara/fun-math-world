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

      {/* 2. MAIN HERO SECTION */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full">
        
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

      {/* Footer minimal info */}
      <footer className="py-6 border-t-2 border-slate-950 text-center text-xs font-mono font-bold text-slate-600">
        Fun Math World • Portal Administrator Sistem SMP Fase D
      </footer>

    </div>
  );
};

export default AdminLanding;

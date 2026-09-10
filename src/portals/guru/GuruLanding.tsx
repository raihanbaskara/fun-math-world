import React from 'react';
import { Logo } from '@/components/ui/logo';
import { soundService } from '@/services/soundService';
import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react';

export interface GuruLandingProps {
  onNavigate: (route: string) => void;
}

export const GuruLanding: React.FC<GuruLandingProps> = ({ onNavigate }) => {
  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#ffe600] selection:text-slate-950 flex flex-col justify-between">
      
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
              onClick={() => handlePortalNavigate('guru/login')}
              className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Masuk Guru</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FLOATING NEOBRUTAL MATH OPERATORS & FORMULA BADGES (In Wide Open Space Canvas) */}
      {/* Upper Left: MULTIPLY [X] 3D SVG & SIGMA FORMULA */}
      <div 
        style={{ '--rot': '-12deg' } as React.CSSProperties}
        className="absolute top-28 sm:top-36 left-4 md:left-8 lg:left-14 xl:left-24 2xl:left-36 hidden md:flex flex-col items-start gap-2.5 z-20 animate-float-slow select-none pointer-events-none"
      >
        <svg width="56" height="56" viewBox="0 0 80 80" fill="none" className="drop-shadow-sm">
          <path d="M16 28L32 44L48 28L58 38L42 54L58 70L48 80L32 64L16 80L6 70L22 54L6 38L16 28Z" fill="#0f172a" />
          <path d="M12 24L28 40L44 24L54 34L38 50L54 66L44 76L28 60L12 76L2 66L18 50L2 34L12 24Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
          <line x1="8" y1="66" x2="16" y2="74" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="22" y1="60" x2="30" y2="68" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffe600] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-3">
          <span>∑ n=1</span>
        </div>
      </div>

      {/* Upper Right: DIVIDE [÷] 3D SVG & PI FORMULA */}
      <div 
        style={{ '--rot': '10deg' } as React.CSSProperties}
        className="absolute top-28 sm:top-36 right-4 md:right-8 lg:right-14 xl:right-24 2xl:right-36 hidden md:flex flex-col items-end gap-2.5 z-20 animate-float-reverse select-none pointer-events-none"
      >
        <svg width="58" height="58" viewBox="0 0 90 90" fill="none" className="drop-shadow-sm">
          <circle cx="45" cy="14" r="10" fill="#0f172a" />
          <circle cx="42" cy="11" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="3.5" />
          <rect x="14" y="38" width="64" height="18" rx="6" fill="#0f172a" />
          <rect x="10" y="34" width="64" height="18" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
          <line x1="16" y1="48" x2="24" y2="40" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="28" y1="48" x2="36" y2="40" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="45" cy="74" r="10" fill="#0f172a" />
          <circle cx="42" cy="71" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="3.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#38bdf8] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-3">
          <span>π ≈ 3.14</span>
        </div>
      </div>

      {/* Lower Left: MINUS [-] 3D SVG & SQUARE ROOT FORMULA */}
      <div 
        style={{ '--rot': '6deg' } as React.CSSProperties}
        className="absolute bottom-24 sm:bottom-32 left-4 md:left-8 lg:left-14 xl:left-24 2xl:left-36 hidden lg:flex flex-col items-start gap-2.5 z-20 animate-float-reverse select-none pointer-events-none"
      >
        <svg width="56" height="32" viewBox="0 0 84 48" fill="none" className="drop-shadow-sm">
          <rect x="10" y="16" width="66" height="22" rx="6" fill="#0f172a" />
          <rect x="6" y="11" width="66" height="22" rx="6" fill="#fbbf24" stroke="#0f172a" strokeWidth="4" />
          <line x1="14" y1="28" x2="22" y2="20" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="26" y1="28" x2="34" y2="20" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#a3e635] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-2">
          <span>√(a² + b²)</span>
        </div>
      </div>

      {/* Lower Right: PLUS [+] 3D SVG & FRACTION EQUATION */}
      <div 
        style={{ '--rot': '-8deg' } as React.CSSProperties}
        className="absolute bottom-24 sm:bottom-32 right-4 md:right-8 lg:right-14 xl:right-24 2xl:right-36 hidden lg:flex flex-col items-end gap-2.5 z-20 animate-float-slow select-none pointer-events-none"
      >
        <svg width="56" height="56" viewBox="0 0 80 80" fill="none" className="drop-shadow-sm">
          <path d="M32 10H48V32H70V48H48V70H32V48H10V32H32V10Z" fill="#0f172a" />
          <path d="M28 6H44V28H66V44H44V66H28V44H6V28H28V6Z" fill="#a3e635" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
          <line x1="12" y1="44" x2="20" y2="52" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="32" y1="64" x2="40" y2="72" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f472b6] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-2">
          <span>1/2 + 1/3 = 5/6</span>
        </div>
      </div>

      {/* 3. MAIN HERO SECTION (Centered with clean spacing) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex-1 flex flex-col items-center justify-center text-center space-y-7 w-full z-10">
        
        {/* Dual Neobrutal Eyebrow Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform -rotate-1">
            <GraduationCap size={14} className="text-slate-950" />
            <span>PORTAL GURU MATEMATIKA</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#38bdf8] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform rotate-1">
            <Sparkles size={14} className="text-slate-950" />
            <span>KURIKULUM MERDEKA • FASE D</span>
          </div>
        </div>

        {/* Bold Fluid Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-slate-950 tracking-tight leading-[1.15] max-w-3xl">
          Pusat Kendali Pengajaran &amp; <br />
          <span className="bg-[#ffe600] px-3.5 py-1 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] inline-block mt-2">
            Penilaian Pecahan SMP
          </span>
        </h1>

        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Platform komprehensif untuk guru matematika kelas 7 SMP: pantau kemajuan modul siswa, verifikasi tugas LKPD dengan asisten AI, kelola ruang kuis, dan unduh rekap nilai Excel secara instan.
        </p>

        {/* Hero Action CTA */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => handlePortalNavigate('guru/login')}
            className="px-8 py-4 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-3"
          >
            <span>Masuk Guru</span>
            <ArrowRight size={16} className="text-slate-950" />
          </button>
        </div>

      </main>

      {/* 4. FOOTER (Gambar 3 Neobrutal Standard) */}
      <footer className="w-full bg-white border-t-2 border-slate-950 py-3.5 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-bold text-slate-600 z-10">
        <div>© 2026 Fun Math World — Kurikulum Merdeka Kelas 7 SMP</div>
        <div className="text-slate-500 font-medium">v2.0 Neobrutal Edition</div>
      </footer>

    </div>
  );
};

export default GuruLanding;

import React, { useState } from 'react';
import { ChevronDown, Infinity, Menu, X, BookOpen, FileText, PenTool, ArrowRight, GraduationCap, UserCheck, ShieldAlert, Sparkles, Calculator } from 'lucide-react';
import { soundService } from '@/services/soundService';

const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

export interface LiquidGlassMathHeroProps {
  onNavigate: (route: string) => void;
  onOpenModal?: (type: 'materi' | 'lkpd' | 'evaluasi') => void;
}

export const LiquidGlassMathHero: React.FC<LiquidGlassMathHeroProps> = ({
  onNavigate,
  onOpenModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', active: true, action: () => onNavigate('siswa') },
    { label: 'Materi Pecahan', dropdown: true, action: () => onOpenModal?.('materi') },
    { label: 'LKPD Digital AI', action: () => onOpenModal?.('lkpd') },
    { label: 'Evaluasi Uraian', action: () => onOpenModal?.('evaluasi') },
  ];

  const handleNavClick = (act?: () => void) => {
    soundService.click();
    if (act) act();
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-white font-sans selection:bg-[#ffe600] selection:text-slate-950">
      
      {/* 1. LOOPING BACKGROUND VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
        src={BG_VIDEO}
      />

      {/* Dark Overlay Tint for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/50 pointer-events-none" />

      {/* Math Graph Grid Overlay Pattern */}
      <div className="absolute inset-0 bg-graph-grid opacity-15 pointer-events-none" />

      {/* 2. NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-8 py-5">
        
        {/* Logo (Left) */}
        <div
          onClick={() => handleNavClick(() => onNavigate('siswa'))}
          className="flex items-center gap-2.5 text-white font-black text-lg sm:text-xl tracking-tight cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#ffe600] border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] flex items-center justify-center text-slate-950 group-hover:scale-105 transition-transform">
            <Infinity size={22} strokeWidth={2.5} />
          </div>
          <span className="font-mono tracking-tighter text-white drop-shadow-md">
            FunMath<span className="text-[#ffe600]">7</span>
          </span>
        </div>

        {/* Nav Pill (Center - Desktop) */}
        <div className="liquid-glass hidden md:flex items-center gap-1 rounded-xl px-2 py-1.5 border border-white/20 backdrop-blur-md shadow-lg">
          {navLinks.map((link, idx) => (
            <div key={idx} className="relative">
              <button
                onClick={() => {
                  if (link.dropdown) setDropdownOpen(prev => !prev);
                  else handleNavClick(link.action);
                }}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  link.active
                    ? 'bg-white/20 text-white font-black shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{link.label}</span>
                {link.dropdown && <ChevronDown size={13} className={`mt-px transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />}
              </button>

              {/* Dropdown Menu */}
              {link.dropdown && dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 liquid-glass rounded-xl p-2 border border-white/20 shadow-2xl flex flex-col gap-1 z-40 bg-slate-950/80 backdrop-blur-xl">
                  <button
                    onClick={() => handleNavClick(() => onOpenModal?.('materi'))}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white/90 hover:bg-white/15 font-semibold transition"
                  >
                    <BookOpen size={14} className="text-[#ffe600]" />
                    <span>Modul Teori Pecahan</span>
                  </button>
                  <button
                    onClick={() => handleNavClick(() => onOpenModal?.('lkpd'))}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white/90 hover:bg-white/15 font-semibold transition"
                  >
                    <FileText size={14} className="text-[#38bdf8]" />
                    <span>LKPD Digital AI</span>
                  </button>
                  <button
                    onClick={() => handleNavClick(() => onOpenModal?.('evaluasi'))}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-white/90 hover:bg-white/15 font-semibold transition"
                  >
                    <PenTool size={14} className="text-[#c084fc]" />
                    <span>Evaluasi Essai Uraian</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTAs (Right - Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavClick(() => onNavigate('guru'))}
            className="liquid-glass text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white/10 transition-colors border border-white/30 cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap size={15} className="text-[#ffe600]" />
            <span>Portal Guru</span>
          </button>

          <button
            onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
            className="bg-[#ffe600] text-slate-950 text-xs font-black px-5 py-2.5 rounded-full border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-yellow-400 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#0f172a] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Mulai Belajar</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="liquid-glass text-white p-2 rounded-xl md:hidden border border-white/30 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* 3. MOBILE MENU DRAWER */}
      {menuOpen && (
        <div className="absolute top-[76px] left-4 right-4 z-40 md:hidden liquid-glass rounded-2xl p-4 flex flex-col gap-2 bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(link.action)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-left text-white/90 hover:bg-white/15 transition"
            >
              <span>{link.label}</span>
              {link.dropdown && <ChevronDown size={14} />}
            </button>
          ))}
          <div className="flex gap-2 mt-2 pt-3 border-t border-white/15">
            <button
              onClick={() => handleNavClick(() => onNavigate('guru'))}
              className="flex-1 liquid-glass text-white text-xs font-bold py-2.5 rounded-xl border border-white/30 text-center"
            >
              Portal Guru
            </button>
            <button
              onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
              className="flex-1 bg-[#ffe600] text-slate-950 text-xs font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-center"
            >
              Mulai Belajar
            </button>
          </div>
        </div>
      )}

      {/* 4. HERO CONTENT (BOTTOM-LEFT) */}
      <div className="absolute bottom-0 left-0 z-20 px-6 sm:px-12 pb-10 sm:pb-16 max-w-3xl">
        
        {/* Math Sticker Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3.5 py-1 bg-[#ffe600] text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] inline-flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>KURSUS MATEMATIKA KELAS 7 SMP</span>
          </span>
          <span className="liquid-glass px-3.5 py-1 text-white font-mono text-xs rounded-xl border border-white/30 backdrop-blur-md">
            a/b = c/d • Kurikulum Merdeka
          </span>
        </div>

        {/* Main H1 Headline */}
        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4 font-mono drop-shadow-lg">
          Kuasai Pecahan <br />
          <span className="text-[#ffe600] underline decoration-4 underline-offset-8 decoration-white">
            Visual 3D & AI Interaktif.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-7 max-w-xl font-medium drop-shadow-sm">
          Solusi belajar matematika modern dengan simulasi visual pizza pecahan, koreksi otomatis asisten AI pada lembar kerja fisik, serta kuis evaluasi HOTS terintegrasi!
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
            className="bg-[#ffe600] text-slate-950 text-sm sm:text-base font-black px-6 sm:px-8 py-3.5 rounded-full border-3 border-slate-950 shadow-[5px_5px_0px_0px_#0f172a] hover:bg-yellow-400 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#0f172a] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Mulai Belajar (Siswa)</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => handleNavClick(() => onNavigate('guru'))}
            className="liquid-glass text-white text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 rounded-full hover:bg-white/15 transition-all border-2 border-white/40 cursor-pointer flex items-center gap-2 backdrop-blur-md"
          >
            <UserCheck size={18} className="text-[#ffe600]" />
            <span>Portal Guru / Admin</span>
          </button>
        </div>

      </div>

      {/* Floating Math Formula Badge (Bottom-Right Decorative Element) */}
      <div className="hidden lg:flex absolute bottom-12 right-12 z-20 liquid-glass p-5 rounded-2xl border-2 border-white/30 max-w-xs space-y-2 backdrop-blur-xl animate-pulse">
        <div className="flex items-center justify-between text-xs font-mono text-[#ffe600] font-bold">
          <span>RUMUS PECAHAN</span>
          <Calculator size={16} />
        </div>
        <div className="text-xl font-mono font-black tracking-widest text-white">
          \(\frac{1}{2} + \frac{1}{3} = \frac{5}{6}\)
        </div>
        <p className="text-[11px] text-white/70 font-medium">
          Menyamakan penyebut menggunakan KPK dengan mudah secara visual.
        </p>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { ChevronDown, Infinity, Menu, X, BookOpen, FileText, PenTool, ArrowRight, Sparkles, Calculator, PieChart, Layers } from 'lucide-react';
import { Fraction } from '@/components/ui/fraction';
import { soundService } from '@/services/soundService';

export interface NeobrutalMathHeroProps {
  onNavigate: (route: string) => void;
  onOpenModal?: (type: 'materi' | 'lkpd' | 'evaluasi') => void;
}

export const NeobrutalMathHero: React.FC<NeobrutalMathHeroProps> = ({
  onNavigate,
  onOpenModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewSlices, setPreviewSlices] = useState<number>(3);

  const handleNavClick = (act?: () => void) => {
    soundService.click();
    if (act) act();
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#ffe600] selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. NEOBRUTAL GRAPH GRID & GEOMETRIC ACCENTS BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffdf5] via-[#fffdf5]/90 to-[#ffe600]/15 pointer-events-none" />

      {/* 2. SUBTLE GEOMETRIC MATH WATERMARK (Clean & Spacious) */}
      <div className="absolute top-28 right-[42%] hidden xl:block pointer-events-none select-none">
        <span className="px-3.5 py-1 bg-[#ffe600] text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] transform -rotate-3 inline-flex items-center gap-1.5 opacity-90">
          <Fraction num="1" den="2" size="xs" />
          <span>+</span>
          <Fraction num="1" den="3" size="xs" />
          <span>=</span>
          <Fraction num="5" den="6" size="xs" />
        </span>
      </div>

      {/* 3. NEOBRUTAL NAVBAR */}
      <nav className="relative z-30 flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto w-full">
        
        {/* Logo (Left) */}
        <div
          onClick={() => handleNavClick(() => onNavigate('siswa'))}
          className="flex items-center gap-2.5 text-slate-950 font-black text-lg sm:text-xl tracking-tight cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#ffe600] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] flex items-center justify-center text-slate-950 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0px_0px_#0f172a] transition-all">
            <Infinity size={24} strokeWidth={2.5} />
          </div>
          <span className="font-mono tracking-tighter text-slate-950 font-black text-xl">
            FunMath<span className="text-amber-500">7</span>
          </span>
        </div>

        {/* Nav Pill (Center - Desktop Neobrutalist Pill Bar Without Duplication) */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-white border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] px-3 py-1.5 select-none">
          
          {/* Dropdown 1: FITUR BELAJAR */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer transition-all hover:bg-yellow-400"
            >
              <span>Fitur Belajar</span>
              <ChevronDown size={13} className={`mt-px transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Neobrutalist Dropdown Menu Items */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-56 bg-white border-3 border-slate-950 rounded-2xl p-2 shadow-[5px_5px_0px_0px_#0f172a] flex flex-col gap-1 z-40 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => handleNavClick(() => onOpenModal?.('materi'))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-950 hover:bg-[#ffe600] font-black transition border-2 border-transparent hover:border-slate-950"
                >
                  <BookOpen size={15} />
                  <span>Modul Teori Pecahan</span>
                </button>
                <button
                  onClick={() => handleNavClick(() => onOpenModal?.('lkpd'))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-950 hover:bg-[#a5f3fc] font-black transition border-2 border-transparent hover:border-slate-950"
                >
                  <FileText size={15} />
                  <span>LKPD Digital AI</span>
                </button>
                <button
                  onClick={() => handleNavClick(() => onOpenModal?.('evaluasi'))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-950 hover:bg-[#fbcfe8] font-black transition border-2 border-transparent hover:border-slate-950"
                >
                  <PenTool size={15} />
                  <span>Evaluasi Uraian HOTS</span>
                </button>
                <button
                  onClick={() => handleNavClick(() => onNavigate('siswa/studio'))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-950 hover:bg-[#bef264] font-black transition border-2 border-transparent hover:border-slate-950"
                >
                  <PieChart size={15} />
                  <span>Studio Visual Pecahan</span>
                </button>
                <button
                  onClick={() => handleNavClick(() => onNavigate('siswa/kalkulator'))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-950 hover:bg-[#c084fc] font-black transition border-2 border-transparent hover:border-slate-950"
                >
                  <Calculator size={15} />
                  <span>Kalkulator Pecahan</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Link 2: STUDIO VISUAL */}
          <button
            onClick={() => handleNavClick(() => onNavigate('siswa/studio'))}
            className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Studio Visual
          </button>

          {/* Direct Link 3: PANDUAN KURIKULUM */}
          <button
            onClick={() => handleNavClick(() => onOpenModal?.('materi'))}
            className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Panduan Kurikulum
          </button>

        </div>

        {/* CTAs (Right - Desktop Neobrutalist Primary Button Only) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
            className="px-5 py-2.5 rounded-full bg-[#ffe600] text-slate-950 font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Mulai Belajar</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Mobile Toggle Button (Neobrutal Square) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2.5 rounded-xl bg-[#ffe600] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] md:hidden cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* 4. MOBILE MENU DRAWER (NEOBRUTAL CARD) */}
      {menuOpen && (
        <div className="relative z-40 md:hidden mx-4 bg-[#fffdf5] border-3 border-slate-950 rounded-3xl p-5 shadow-[8px_8px_0px_0px_#0f172a] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick(() => onOpenModal?.('materi'))}
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#ffe600] shadow-[2px_2px_0px_0px_#0f172a]"
          >
            <span>Modul Teori Pecahan</span>
            <BookOpen size={15} />
          </button>

          <button
            onClick={() => handleNavClick(() => onOpenModal?.('lkpd'))}
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#a5f3fc] shadow-[2px_2px_0px_0px_#0f172a]"
          >
            <span>LKPD Digital AI</span>
            <FileText size={15} />
          </button>

          <button
            onClick={() => handleNavClick(() => onOpenModal?.('evaluasi'))}
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#fbcfe8] shadow-[2px_2px_0px_0px_#0f172a]"
          >
            <span>Evaluasi Uraian HOTS</span>
            <PenTool size={15} />
          </button>

          <div className="mt-2 pt-3 border-t-2 border-slate-950">
            <button
              onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
              className="w-full bg-[#ffe600] text-slate-950 font-black text-xs py-3 rounded-xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-center uppercase"
            >
              Mulai Belajar (Siswa)
            </button>
          </div>
        </div>
      )}

      {/* 5. HERO CONTENT: SPLIT EDITORIAL & DYNAMIC 3D MATH ARENA */}
      <div className="relative z-20 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Editorial Headline & CTA) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Dual Neobrutal Eyebrow Badges with Clear Curriculum Wording */}
            <div className="flex flex-wrap items-center gap-2.5 select-none">
              <span className="px-3.5 py-1.5 bg-[#ffe600] text-slate-950 font-mono font-black text-xs uppercase rounded-xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-1 inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-slate-950 stroke-[2.5]" />
                <span>KURIKULUM MERDEKA</span>
              </span>
              <span className="px-3.5 py-1.5 bg-[#38bdf8] text-slate-950 font-mono font-black text-xs uppercase rounded-xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-1 inline-flex items-center gap-1.5">
                <Calculator size={14} className="text-slate-950 stroke-[2.5]" />
                <span>SMP KELAS 7 • PECAHAN</span>
              </span>
            </div>

            {/* Main H1 Title (Fluid Monospaced Neobrutalism) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950 font-mono">
              FUN MATH WORLD <br />
              <span className="bg-[#ffe600] text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_#0f172a] inline-block mt-2 font-mono">
                PETUALANGAN PECAHAN!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-bold text-slate-900/90 max-w-xl leading-relaxed">
              Platform pembelajaran matematika interaktif Kurikulum Merdeka untuk siswa SMP. Belajar konsep pecahan lewat simulasi visual interaktif, asisten AI lembar kerja digital, dan latihan soal bertingkat!
            </p>

            {/* CTAs with Button-in-Button Pattern */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => handleNavClick(() => onNavigate('siswa/login'))}
                className="group px-7 py-3.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[5px_5px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#0f172a] transition-all cursor-pointer flex items-center gap-3"
              >
                <span>Mulai Belajar Sekarang</span>
                <span className="w-7 h-7 rounded-xl bg-slate-950 text-[#ffe600] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-[1px_1px_0px_0px_#0f172a]">
                  <ArrowRight size={16} className="stroke-[3]" />
                </span>
              </button>

              <button
                onClick={() => handleNavClick(() => onNavigate('siswa/studio'))}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <PieChart size={18} />
                <span>Studio Visual</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 pt-3 text-xs font-mono font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                Interaktif Sesuai Kurikulum
              </span>
              <span className="text-slate-400">•</span>
              <span>Koreksi AI Otomatis</span>
              <span className="text-slate-400">•</span>
              <span>100% Edukatif</span>
            </div>

          </div>

          {/* Right Column: Dynamic 3D Neobrutalist Math Showcase Arena */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[420px]">
            
            {/* Center Main Stage Card */}
            <div className="relative w-full max-w-sm rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[10px_10px_0px_0px_#0f172a] rotate-1 hover:rotate-0 transition-transform duration-300 z-10 space-y-4">
              
              {/* Card Header Tag */}
              <div className="flex items-center justify-between border-b-3 border-slate-950 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 border border-slate-950" />
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-slate-950" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-950" />
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-[10px] uppercase border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  EXPLORATION ARENA
                </span>
              </div>

              {/* Interactive Pizza Visual Slice Studio Mini Sim */}
              <div className="bg-[#fffdf5] rounded-2xl border-3 border-slate-950 p-4 space-y-3.5">
                
                <div className="flex items-center justify-between gap-4">
                  {/* Real-time Dynamic Pizza Slice SVG */}
                  <div className="w-20 h-20 relative shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[2px_2px_0px_#0f172a]">
                      {/* Base Background Plate */}
                      <circle cx="50" cy="50" r="46" fill="#fef08a" stroke="#0f172a" strokeWidth="5" />
                      
                      {/* Dynamic Slices Arc based on interactive slices state */}
                      {Array.from({ length: 8 }).map((_, i) => {
                        const startAngle = (i * 360) / 8 - 90;
                        const endAngle = ((i + 1) * 360) / 8 - 90;
                        const isShaded = i < previewSlices;
                        
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        
                        const x1 = 50 + 46 * Math.cos(startRad);
                        const y1 = 50 + 46 * Math.sin(startRad);
                        const x2 = 50 + 46 * Math.cos(endRad);
                        const y2 = 50 + 46 * Math.sin(endRad);
                        
                        return (
                          <path
                            key={i}
                            d={`M50 50 L${x1} ${y1} A46 46 0 0 1 ${x2} ${y2} Z`}
                            fill={isShaded ? (i % 2 === 0 ? '#f87171' : '#fb923c') : 'transparent'}
                            stroke="#0f172a"
                            strokeWidth="2.5"
                            className="transition-colors duration-200"
                          />
                        );
                      })}
                      <circle cx="50" cy="50" r="4.5" fill="#0f172a" />
                    </svg>
                  </div>

                  {/* Real-Time Values Output */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">
                        SIMULATOR NILAI
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-300">
                        {previewSlices} / 8 Porsi
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black">
                        <Fraction num={previewSlices} den={8} size="md" />
                      </span>
                      <div className="text-[11px] font-bold text-slate-800 leading-tight">
                        Porsi Terambil
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-mono font-black bg-[#a3e635] text-slate-950 px-2 py-0.5 rounded-md border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]">
                        = {(previewSlices * 12.5).toFixed(1).replace('.0', '')}%
                      </span>
                      <span className="text-[10px] font-mono font-black bg-[#38bdf8] text-slate-950 px-2 py-0.5 rounded-md border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]">
                        = {(previewSlices / 8).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Slider Controller */}
                <div className="space-y-1.5 pt-1 border-t-2 border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-mono font-black text-slate-800">
                    <span>Geser Porsi Pizza:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          soundService.click();
                          setPreviewSlices(s => Math.max(1, s - 1));
                        }}
                        className="w-6 h-6 rounded-lg bg-white border-2 border-slate-950 flex items-center justify-center font-mono font-black hover:bg-slate-100 active:translate-y-0.5 cursor-pointer"
                        title="Kurang 1 Potong"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          soundService.click();
                          setPreviewSlices(s => Math.min(8, s + 1));
                        }}
                        className="w-6 h-6 rounded-lg bg-[#ffe600] border-2 border-slate-950 flex items-center justify-center font-mono font-black hover:bg-yellow-400 active:translate-y-0.5 cursor-pointer shadow-[1px_1px_0px_0px_#0f172a]"
                        title="Tambah 1 Potong"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={previewSlices}
                    onChange={(e) => {
                      soundService.click();
                      setPreviewSlices(Number(e.target.value));
                    }}
                    className="w-full accent-slate-950 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                </div>

              </div>

              {/* Action Link to Full Studio */}
              <button
                onClick={() => handleNavClick(() => onNavigate('siswa/studio'))}
                className="w-full p-2.5 rounded-xl bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-mono font-black text-xs uppercase border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-between px-4"
              >
                <span>Buka Studio Visual Lengkap</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>

            </div>

            {/* 1. MULTIPLY [X] (Top Left Floating) */}
            <div 
              style={{ '--rot': '-10deg' } as React.CSSProperties}
              className="absolute -top-6 -left-6 sm:-left-8 z-20 animate-float-slow select-none pointer-events-none"
            >
              <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
                <path d="M16 28L32 44L48 28L58 38L42 54L58 70L48 80L32 64L16 80L6 70L22 54L6 38L16 28Z" fill="#0f172a" />
                <path d="M12 24L28 40L44 24L54 34L38 50L54 66L44 76L28 60L12 76L2 66L18 50L2 34L12 24Z" fill="#f43f5e" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
                <line x1="8" y1="66" x2="16" y2="74" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="22" y1="60" x2="30" y2="68" stroke="#0f172a" strokeWidth="2.5" />
              </svg>
            </div>

            {/* 2. DIVIDE [÷] (Top Right Floating) */}
            <div 
              style={{ '--rot': '8deg' } as React.CSSProperties}
              className="absolute -top-7 -right-5 sm:-right-8 z-20 animate-float-reverse select-none pointer-events-none"
            >
              <svg width="68" height="68" viewBox="0 0 90 90" fill="none">
                <circle cx="45" cy="14" r="10" fill="#0f172a" />
                <circle cx="42" cy="11" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="3.5" />
                
                <rect x="14" y="38" width="64" height="18" rx="6" fill="#0f172a" />
                <rect x="10" y="34" width="64" height="18" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
                <line x1="16" y1="48" x2="24" y2="40" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="28" y1="48" x2="36" y2="40" stroke="#0f172a" strokeWidth="2.5" />
                
                <circle cx="45" cy="74" r="10" fill="#0f172a" />
                <circle cx="42" cy="71" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="3.5" />
              </svg>
            </div>

            {/* 3. MINUS [-] (Bottom Left Floating) */}
            <div 
              style={{ '--rot': '5deg' } as React.CSSProperties}
              className="absolute -bottom-5 -left-6 sm:-left-9 z-20 animate-float-reverse select-none pointer-events-none"
            >
              <svg width="66" height="38" viewBox="0 0 84 48" fill="none">
                <rect x="10" y="16" width="66" height="22" rx="6" fill="#0f172a" />
                <rect x="6" y="11" width="66" height="22" rx="6" fill="#fbbf24" stroke="#0f172a" strokeWidth="4" />
                <line x1="14" y1="28" x2="22" y2="20" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="26" y1="28" x2="34" y2="20" stroke="#0f172a" strokeWidth="2.5" />
              </svg>
            </div>

            {/* 4. PLUS [+] (Bottom Right Floating) */}
            <div 
              style={{ '--rot': '-6deg' } as React.CSSProperties}
              className="absolute -bottom-5 -right-5 sm:-right-8 z-20 animate-float-slow select-none pointer-events-none"
            >
              <svg width="66" height="66" viewBox="0 0 80 80" fill="none">
                <path d="M32 10H48V32H70V48H48V70H32V48H10V32H32V10Z" fill="#0f172a" />
                <path d="M28 6H44V28H66V44H44V66H28V44H6V28H28V6Z" fill="#a3e635" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
                <line x1="12" y1="44" x2="20" y2="52" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="32" y1="64" x2="40" y2="72" stroke="#0f172a" strokeWidth="2.5" />
              </svg>
            </div>

          </div>

        </div>
      </div>

      {/* Footer copyright hairline strip */}
      <div className="relative z-20 px-6 sm:px-12 py-3 border-t-2 border-slate-950 bg-white/60 backdrop-blur-xs flex items-center justify-between text-xs font-bold text-slate-600 max-w-7xl mx-auto w-full">
        <span>© 2026 Fun Math World — Kurikulum Merdeka Kelas 7 SMP</span>
        <span className="font-mono text-[11px] text-slate-500">v2.0 Neobrutal Edition</span>
      </div>

    </div>
  );
};

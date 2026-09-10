import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { soundService } from '@/services/soundService';
import { ArrowRight, Sparkles, RefreshCw, Calculator, ShieldCheck, Check } from 'lucide-react';

export interface MathHeroCanvasProps {
  onCtaClick: () => void;
  ctaText: string;
}

export const MathHeroCanvas: React.FC<MathHeroCanvasProps> = ({ onCtaClick, ctaText }) => {
  const [numerator, setNumerator] = useState<number>(3);
  const [denominator, setDenominator] = useState<number>(4);
  const [shapeMode, setShapeMode] = useState<'pizza' | 'chocolate'>('pizza');

  const fractionVal = (numerator / denominator).toFixed(2);
  const percentVal = Math.round((numerator / denominator) * 100);

  // Generate SVG pizza slices dynamically based on numerator & denominator
  const renderPizzaSlices = () => {
    const radius = 80;
    const center = 100;
    const slices = [];
    const angleStep = (2 * Math.PI) / denominator;

    for (let i = 0; i < denominator; i++) {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = (i + 1) * angleStep - Math.PI / 2;
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);
      const isSelected = i < numerator;

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      slices.push(
        <path
          key={i}
          d={pathData}
          fill={isSelected ? '#ffe600' : '#0f172a'}
          stroke="#0f172a"
          strokeWidth="3.5"
          className="transition-all duration-300 hover:opacity-90 cursor-pointer"
          onClick={() => {
            soundService.click();
            setNumerator(i + 1);
          }}
        />
      );
    }
    return slices;
  };

  return (
    <div className="relative w-full bg-[#ffe600] text-slate-950 border-b-4 border-slate-950 overflow-hidden font-sans">
      
      {/* Graph Paper Background Grid */}
      <div className="absolute inset-0 bg-graph-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Math Sticker Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-white text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-1">
                KURSUS MATEMATIKA SMP 7
              </span>
              <span className="px-3 py-1 bg-[#a5f3fc] text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-1">
                BAB 1: PECAHAN &amp; DESIMAL
              </span>
            </div>

            {/* Ultra-Wide H1 Title (Strictly 2 lines) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-950 font-mono">
              FUN MATH WORLD <br />
              <span className="bg-white text-slate-950 px-4 py-1.5 rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_#0f172a] inline-block mt-2">
                PETUALANGAN PECAHAN!
              </span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-slate-900 max-w-xl leading-relaxed">
              Platform pembelajaran matematika interaktif Kurikulum Merdeka untuk siswa Kelas 7. Simulasi visual pizza pecahan, koreksi otomatis asisten AI, dan kuis evaluasi HOTS!
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  soundService.click();
                  onCtaClick();
                }}
                className="font-black bg-white hover:bg-slate-100 text-slate-950 border-3 border-slate-950 shadow-[5px_5px_0px_0px_#0f172a]"
              >
                {ctaText} <ArrowRight size={18} className="ml-1" />
              </Button>

              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-2xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-xs font-mono font-black text-slate-950">
                <ShieldCheck size={16} className="text-amber-500" />
                <span>1 Device Siswa Terverifikasi</span>
              </div>
            </div>

            {/* Quick Math Floating Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono font-extrabold">
              <span className="px-2.5 py-1 bg-white text-slate-950 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                1/2 = 2/4 = 50%
              </span>
              <span className="px-2.5 py-1 bg-[#a3e635] text-slate-950 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                KPK(4, 6) = 12
              </span>
              <span className="px-2.5 py-1 bg-[#ff94e8] text-slate-950 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                FPB(12, 18) = 6
              </span>
            </div>

          </div>

          {/* Right Column: Interactive Fraction Visualizer Box */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white text-slate-950 border-4 border-slate-950 p-6 shadow-[8px_8px_0px_0px_#0f172a] space-y-5 relative">
              
              {/* Box Badge Header */}
              <div className="flex items-center justify-between pb-3 border-b-3 border-slate-950">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black font-mono">
                    ÷
                  </div>
                  <span className="font-black text-sm text-slate-950">Simulasi Model Pecahan</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border-2 border-slate-950">
                  <button
                    type="button"
                    onClick={() => { soundService.click(); setShapeMode('pizza'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      shapeMode === 'pizza' ? 'bg-[#ffe600] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-600'
                    }`}
                  >
                    Pizza
                  </button>
                  <button
                    type="button"
                    onClick={() => { soundService.click(); setShapeMode('chocolate'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      shapeMode === 'chocolate' ? 'bg-[#ffe600] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]' : 'text-slate-600'
                    }`}
                  >
                    Cokelat
                  </button>
                </div>
              </div>

              {/* Graphic SVG Visualizer Area */}
              <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-3">
                {shapeMode === 'pizza' ? (
                  <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-md">
                    <circle cx="100" cy="100" r="84" fill="#0f172a" stroke="#0f172a" strokeWidth="4" />
                    {renderPizzaSlices()}
                    <circle cx="100" cy="100" r="8" fill="#ffe600" stroke="#0f172a" strokeWidth="2" />
                  </svg>
                ) : (
                  <div className="grid grid-cols-4 gap-2 w-full max-w-[220px] p-2 bg-slate-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                    {Array.from({ length: denominator }).map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          soundService.click();
                          setNumerator(idx + 1);
                        }}
                        className={`h-12 rounded-lg border-2 border-slate-950 cursor-pointer transition-all ${
                          idx < numerator ? 'bg-[#a3e635] shadow-[2px_2px_0px_0px_#0f172a]' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Live Formula Displays */}
                <div className="flex items-center gap-3 font-mono font-black text-lg text-slate-950">
                  <span className="px-3 py-1 bg-white border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
                    {numerator} / {denominator}
                  </span>
                  <span>=</span>
                  <span className="px-3 py-1 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
                    {percentVal}%
                  </span>
                  <span>=</span>
                  <span className="px-3 py-1 bg-[#ff94e8] border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
                    {fractionVal}
                  </span>
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs font-black uppercase text-slate-700 mb-1 font-mono">
                    <span>Pembilang (Bagian Diambil):</span>
                    <span className="text-slate-950 font-mono text-sm">{numerator}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={denominator}
                    value={numerator}
                    onChange={(e) => setNumerator(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-black uppercase text-slate-700 mb-1 font-mono">
                    <span>Penyebut (Total Potongan):</span>
                    <span className="text-slate-950 font-mono text-sm">{denominator}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={denominator}
                    onChange={(e) => {
                      const newDen = parseInt(e.target.value);
                      setDenominator(newDen);
                      if (numerator > newDen) setNumerator(newDen);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[11px] font-bold text-center text-slate-600 italic border-t-2 border-slate-950 pt-2">
                * Geser slider di atas untuk melihat potongan pecahan secara interaktif!
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

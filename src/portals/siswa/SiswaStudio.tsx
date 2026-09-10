import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Fraction } from '@/components/ui/fraction';
import { soundService } from '@/services/soundService';
import {
  FlaskConical,
  Sparkles,
  PieChart,
  Grid,
  Scale,
  Plus,
  Minus,
  CheckCircle2,
  Layers,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const SiswaStudio: React.FC = () => {
  const [studioMode, setStudioMode] = useState<'pizza' | 'chocolate' | 'compare'>('pizza');

  // Fraction 1 state
  const [num, setNum] = useState<number>(3);
  const [den, setDen] = useState<number>(8);

  // Fraction 2 state (for comparison mode)
  const [num2, setNum2] = useState<number>(1);
  const [den2, setDen2] = useState<number>(2);

  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const handleNumChange = (val: number) => {
    soundService.click();
    setNum(Math.max(0, Math.min(24, val)));
  };

  const handleDenChange = (val: number) => {
    soundService.click();
    setDen(Math.max(1, Math.min(24, val)));
  };

  const handleNum2Change = (val: number) => {
    soundService.click();
    setNum2(Math.max(0, Math.min(24, val)));
  };

  const handleDen2Change = (val: number) => {
    soundService.click();
    setDen2(Math.max(1, Math.min(24, val)));
  };

  const safeNum = Math.max(0, num);
  const safeDen = Math.max(1, den);
  const decimalVal = (safeNum / safeDen).toFixed(3).replace(/\.?0+$/, '') || '0';
  const percentVal = ((safeNum / safeDen) * 100).toFixed(1).replace(/\.?0+$/, '') + '%';

  const whole = Math.floor(safeNum / safeDen);
  const remainder = safeNum % safeDen;
  const mixedStr = remainder === 0 ? `${whole}` : `${whole} ${remainder}/${safeDen}`;

  // SVG Pizza Slices Generator
  const generatePieSlices = (total: number, filled: number) => {
    const slices = [];
    const radius = 80;
    const cx = 100;
    const cy = 100;

    for (let i = 0; i < total; i++) {
      const angle1 = (i / total) * 2 * Math.PI - Math.PI / 2;
      const angle2 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;

      const x1 = cx + radius * Math.cos(angle1);
      const y1 = cy + radius * Math.sin(angle1);
      const x2 = cx + radius * Math.cos(angle2);
      const y2 = cy + radius * Math.sin(angle2);

      const isLargeArc = total === 1 ? 1 : 0;
      const pathData =
        total === 1
          ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${isLargeArc} 1 ${x2} ${y2} Z`;

      const isFilled = i < filled;
      const isHover = hoveredSlice === i;

      slices.push(
        <path
          key={i}
          d={pathData}
          onMouseEnter={() => setHoveredSlice(i)}
          onMouseLeave={() => setHoveredSlice(null)}
          className={`transition-all duration-200 cursor-pointer ${
            isFilled
              ? isHover
                ? 'fill-[#38bdf8] stroke-slate-950 stroke-3'
                : 'fill-[#ffe600] stroke-slate-950 stroke-2.5 hover:fill-[#38bdf8]'
              : isHover
              ? 'fill-slate-200 stroke-slate-950 stroke-2'
              : 'fill-white stroke-slate-950 stroke-2'
          }`}
        />
      );
    }
    return slices;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#c084fc] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          PIZZA
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                SIMULATOR VISUAL INTERAKTIF
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                Geometri Pizza &amp; Batang Cokelat
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Studio Visualisasi Pecahan
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Ubah nilai pembilang dan penyebut untuk melihat representasi grafis pizza, blok cokelat batang, serta komparasi perbandingan nilai pecahan.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <FlaskConical size={36} />
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('pizza');
          }}
          className={`px-5 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            studioMode === 'pizza'
              ? 'bg-[#ffe600] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
              : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-yellow-50 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart size={18} />
          <span>Model Pizza (Lingkaran)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('chocolate');
          }}
          className={`px-5 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            studioMode === 'chocolate'
              ? 'bg-[#38bdf8] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
              : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-sky-50 dark:hover:bg-slate-800'
          }`}
        >
          <Grid size={18} />
          <span>Model Cokelat (Grid Batang)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('compare');
          }}
          className={`px-5 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            studioMode === 'compare'
              ? 'bg-[#a3e635] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
              : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-lime-50 dark:hover:bg-slate-800'
          }`}
        >
          <Scale size={18} />
          <span>Komparasi Dua Pecahan</span>
        </button>
      </div>

      {/* Main Studio Arena Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Fraction Controls */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-950 dark:border-slate-800">
            <h3 className="font-mono font-black text-base text-slate-950 dark:text-slate-100">
              Panel Pengaturan Nilai
            </h3>
            <button
              onClick={() => {
                soundService.click();
                setNum(3);
                setDen(8);
                setNum2(1);
                setDen2(2);
              }}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 text-xs font-black flex items-center gap-1 shadow-[1.5px_1.5px_0px_0px_#0f172a]"
              title="Reset Nilai"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Fraction 1 Controls */}
          <div className="p-4 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 space-y-4">
            <div className="text-xs font-mono font-black uppercase text-slate-950 dark:text-slate-100">
              Pecahan Utama: {safeNum}/{safeDen}
            </div>

            {/* Pembilang (Numerator) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Pembilang (Terarsir):</span>
                <span className="font-mono font-black text-slate-950 dark:text-slate-100">{safeNum}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNumChange(safeNum - 1)}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-950 dark:border-slate-600 font-black text-base text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={safeNum}
                  onChange={(e) => handleNumChange(parseInt(e.target.value) || 0)}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleNumChange(safeNum + 1)}
                  className="w-10 h-10 rounded-xl bg-[#ffe600] border-2 border-slate-950 font-black text-base text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Penyebut (Denominator) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Penyebut (Total Potongan):</span>
                <span className="font-mono font-black text-slate-950 dark:text-slate-100">{safeDen}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDenChange(safeDen - 1)}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-950 dark:border-slate-600 font-black text-base text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={safeDen}
                  onChange={(e) => handleDenChange(parseInt(e.target.value) || 1)}
                  className="flex-1 accent-sky-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleDenChange(safeDen + 1)}
                  className="w-10 h-10 rounded-xl bg-[#38bdf8] border-2 border-slate-950 font-black text-base text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-sky-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Fraction 2 Controls for Compare Mode */}
          {studioMode === 'compare' && (
            <div className="p-4 rounded-2xl bg-[#f0fdf4] dark:bg-emerald-950/30 border-3 border-slate-950 dark:border-slate-700 space-y-4">
              <div className="text-xs font-mono font-black uppercase text-slate-950 dark:text-slate-100">
                Pecahan Kedua: {num2}/{den2}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Pembilang 2:</span>
                  <span className="font-mono font-black text-slate-950 dark:text-slate-100">{num2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNum2Change(num2 - 1)}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-950 dark:border-slate-600 font-black text-base text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-lime-100 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={num2}
                    onChange={(e) => handleNum2Change(parseInt(e.target.value) || 0)}
                    className="flex-1 accent-lime-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => handleNum2Change(num2 + 1)}
                    className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-slate-950 font-black text-base text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-lime-400 flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Penyebut 2:</span>
                  <span className="font-mono font-black text-slate-950 dark:text-slate-100">{den2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDen2Change(den2 - 1)}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-950 dark:border-slate-600 font-black text-base text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-lime-100 flex items-center justify-center cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={den2}
                    onChange={(e) => handleDen2Change(parseInt(e.target.value) || 1)}
                    className="flex-1 accent-lime-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => handleDen2Change(den2 + 1)}
                    className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-slate-950 font-black text-base text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-lime-400 flex items-center justify-center cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Conversion Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-slate-700 text-center">
              <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">Desimal</div>
              <div className="text-sm font-black font-mono text-slate-950 dark:text-slate-100">{decimalVal}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-slate-700 text-center">
              <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">Persen</div>
              <div className="text-sm font-black font-mono text-slate-950 dark:text-slate-100">{percentVal}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 dark:border-slate-700 text-center">
              <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">Campuran</div>
              <div className="text-sm font-black font-mono text-slate-950 dark:text-slate-100">{mixedStr}</div>
            </div>
          </div>
        </div>

        {/* Right: Graphic Canvas Visualizer */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] flex flex-col items-center justify-center gap-6 min-h-[360px]">
          
          {studioMode === 'pizza' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-56 h-56 relative drop-shadow-[4px_4px_0px_#0f172a]">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="88" fill="#ffe4b5" stroke="#0f172a" strokeWidth="4" />
                  {generatePieSlices(safeDen, Math.min(safeNum, safeDen))}
                </svg>
              </div>

              <div className="px-5 py-2.5 rounded-2xl bg-[#ffe600] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-center">
                <span className="font-mono font-black text-slate-950 text-base">
                  {safeNum} dari {safeDen} Potong Terarsir ({percentVal})
                </span>
              </div>
            </div>
          )}

          {studioMode === 'chocolate' && (
            <div className="w-full space-y-4 max-w-md">
              <div className="text-center font-mono font-black text-slate-950 dark:text-slate-100 text-sm">
                Batang Cokelat Terbagi {safeDen} Bagian
              </div>

              <div className="grid gap-1.5 p-3 rounded-2xl bg-amber-950 border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a]"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(safeDen, 6)}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: safeDen }).map((_, i) => {
                  const isEaten = i < safeNum;
                  return (
                    <div
                      key={i}
                      className={`h-12 rounded-xl border-2 border-slate-950 flex items-center justify-center font-mono font-black text-xs transition-all ${
                        isEaten
                          ? 'bg-[#ffe600] text-slate-950 shadow-inner'
                          : 'bg-amber-900 text-amber-300'
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950/60 border-2 border-slate-950 dark:border-slate-700 text-center text-xs font-bold text-slate-900 dark:text-slate-100">
                Sebanyak <span className="font-black font-mono">{safeNum} blok</span> terarsir dari total <span className="font-black font-mono">{safeDen} blok</span>.
              </div>
            </div>
          )}

          {studioMode === 'compare' && (
            <div className="w-full space-y-6 max-w-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                {/* Visual 1 */}
                <div className="p-4 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 space-y-3">
                  <div className="font-mono font-black text-lg text-slate-950 dark:text-slate-100">
                    <Fraction num={safeNum} den={safeDen} size="md" />
                  </div>
                  <div className="w-28 h-28 mx-auto">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <circle cx="100" cy="100" r="88" fill="#ffe4b5" stroke="#0f172a" strokeWidth="4" />
                      {generatePieSlices(safeDen, Math.min(safeNum, safeDen))}
                    </svg>
                  </div>
                  <div className="font-mono font-black text-xs text-slate-950 dark:text-slate-100">{decimalVal}</div>
                </div>

                {/* Visual 2 */}
                <div className="p-4 rounded-2xl bg-[#f0fdf4] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 space-y-3">
                  <div className="font-mono font-black text-lg text-slate-950 dark:text-slate-100">
                    <Fraction num={num2} den={den2} size="md" />
                  </div>
                  <div className="w-28 h-28 mx-auto">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <circle cx="100" cy="100" r="88" fill="#ffe4b5" stroke="#0f172a" strokeWidth="4" />
                      {generatePieSlices(den2, Math.min(num2, den2))}
                    </svg>
                  </div>
                  <div className="font-mono font-black text-xs text-slate-950 dark:text-slate-100">
                    {(num2 / den2).toFixed(3).replace(/\.?0+$/, '') || '0'}
                  </div>
                </div>
              </div>

              {/* Comparison Verdict */}
              <div className="p-4 rounded-2xl bg-[#ffe600] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-center">
                <span className="font-mono font-black text-slate-950 text-sm sm:text-base">
                  {safeNum / safeDen > num2 / den2 ? (
                    `${safeNum}/${safeDen} LEBIH BESAR (>) dari ${num2}/${den2}`
                  ) : safeNum / safeDen < num2 / den2 ? (
                    `${safeNum}/${safeDen} LEBIH KECIL (<) dari ${num2}/${den2}`
                  ) : (
                    `${safeNum}/${safeDen} SAMA BESAR / SENILAI (=) dengan ${num2}/${den2}`
                  )}
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
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
  ArrowRight
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
                ? 'fill-[#00ffc6] stroke-slate-900 stroke-2'
                : 'fill-emerald-400 stroke-white stroke-2 hover:fill-[#00ffc6]'
              : isHover
              ? 'fill-slate-200 stroke-slate-400 stroke-1'
              : 'fill-slate-100 stroke-slate-300 stroke-1'
          }`}
        />
      );
    }
    return slices;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <FlaskConical size={13} className="text-[#00ffc6]" />
                <span>Laboratorium Visual Pecahan</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Sparkles size={12} className="text-emerald-500" />
                <span>Eksperimen Interaktif</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Studio Visualisasi & Komparasi Pecahan
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Eksplorasi pembagian juring lingkaran, pemotongan cokelat batang, serta komparasi kesetaraan dua pecahan secara visual.
            </p>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('pizza');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            studioMode === 'pizza'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <PieChart size={14} />
          <span>Lingkaran Pizza</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('chocolate');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            studioMode === 'chocolate'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Grid size={14} />
          <span>Cokelat Batang</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setStudioMode('compare');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            studioMode === 'compare'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Scale size={14} />
          <span>Komparasi</span>
        </button>
      </div>

      {/* Interactive Main Visual Playground */}
      <DoubleBezelCard className="bg-white border-slate-200/90 shadow-sm">
        <div className="space-y-6">
          
          {/* Stepper Inputs for Fraction 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            
            {/* Numerator Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Pembilang (a):
              </span>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleNumChange(num - 1)}
                  className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={num}
                  onChange={(e) => handleNumChange(parseInt(e.target.value) || 0)}
                  className="w-14 text-center font-mono font-black text-lg text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleNumChange(num + 1)}
                  className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="text-2xl font-black text-slate-300 hidden sm:block">/</div>

            {/* Denominator Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Penyebut (b):
              </span>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleDenChange(den - 1)}
                  className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={den}
                  onChange={(e) => handleDenChange(parseInt(e.target.value) || 1)}
                  className="w-14 text-center font-mono font-black text-lg text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleDenChange(den + 1)}
                  className="p-2 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Visual Canvas Render Area */}
          <div className="p-6 bg-slate-50/60 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center min-h-[260px] text-center space-y-4">
            
            {/* Mode 1: Pizza Lingkaran */}
            {studioMode === 'pizza' && (
              <div className="space-y-4">
                <div className="relative w-56 h-56 mx-auto">
                  <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-md">
                    {generatePieSlices(safeDen, safeNum)}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/95 px-2.5 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center justify-center">
                      <Fraction num={safeNum} den={safeDen} size="sm" className="text-slate-950" />
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
                  <span>{safeNum} dari {safeDen} bagian juring terisi ({percentVal})</span>
                </div>
              </div>
            )}

            {/* Mode 2: Batang Cokelat */}
            {studioMode === 'chocolate' && (
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-1 text-left">
                  <div className="text-xs font-bold text-slate-500">Grid Batangan Cokelat:</div>
                  <div className="w-full h-14 bg-slate-100 rounded-2xl overflow-hidden flex border-2 border-slate-300 shadow-inner">
                    {Array.from({ length: safeDen }).map((_, i) => {
                      const isFilled = i < safeNum;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-full border-r last:border-r-0 border-white/60 transition-colors duration-300 flex items-center justify-center ${
                            isFilled
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-mono text-[10px] font-black'
                              : 'bg-slate-200/90 text-slate-400 font-mono text-[10px]'
                          }`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {safeNum} dari {safeDen} petak terisi
                </div>
              </div>
            )}

            {/* Mode 3: Komparasi */}
            {studioMode === 'compare' && (
              <div className="w-full space-y-6">
                
                {/* Steppers for Fraction 2 */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold">
                  <span className="text-brand-700">Pecahan Pembanding (B):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={num2}
                      onChange={(e) => handleNum2Change(parseInt(e.target.value) || 0)}
                      className="w-12 text-center py-1 rounded-lg border border-slate-300 font-mono font-black"
                    />
                    <div className="h-4 w-[1.5px] bg-slate-400 rotate-12" />
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={den2}
                      onChange={(e) => handleDen2Change(parseInt(e.target.value) || 1)}
                      className="w-12 text-center py-1 rounded-lg border border-slate-300 font-mono font-black"
                    />
                  </div>
                </div>

                {/* Comparison Visual Bars */}
                <div className="space-y-4 max-w-md mx-auto text-left">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>Pecahan A:</span>
                        <Fraction num={safeNum} den={safeDen} size="xs" />
                      </div>
                      <span className="font-mono text-emerald-700">{(safeNum / safeDen).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (safeNum / safeDen) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>Pecahan B:</span>
                        <Fraction num={num2} den={den2} size="xs" />
                      </div>
                      <span className="font-mono text-blue-700">{(num2 / den2).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (num2 / den2) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Verdict Badge */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center font-black text-xs text-slate-900">
                    {safeNum / safeDen > num2 / den2 ? (
                      <span className="text-emerald-700 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>Pecahan A</span>
                        <Fraction num={safeNum} den={safeDen} size="xs" />
                        <span>LEBIH BESAR (&gt;) dari Pecahan B</span>
                        <Fraction num={num2} den={den2} size="xs" />
                      </span>
                    ) : safeNum / safeDen < num2 / den2 ? (
                      <span className="text-rose-700 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>Pecahan A</span>
                        <Fraction num={safeNum} den={safeDen} size="xs" />
                        <span>LEBIH KECIL (&lt;) dari Pecahan B</span>
                        <Fraction num={num2} den={den2} size="xs" />
                      </span>
                    ) : (
                      <span className="text-brand-700 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>Pecahan A dan Pecahan B bernilai SAMA / SENILAI (=)</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Form Analysis Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Pecahan Biasa</span>
              <div className="text-brand-700 py-1">
                <Fraction num={safeNum} den={safeDen} size="md" />
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Campuran</span>
              <div className="text-amber-600 py-1">
                {safeNum >= safeDen && remainder > 0 ? (
                  <Fraction whole={whole} num={remainder} den={safeDen} size="md" />
                ) : safeNum >= safeDen ? (
                  <span className="font-mono text-lg font-black">{whole}</span>
                ) : (
                  <span className="text-slate-400 font-bold">-</span>
                )}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Desimal</span>
              <div className="font-mono text-lg font-black text-slate-800">{decimalVal}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Persentase</span>
              <div className="font-mono text-lg font-black text-emerald-600">{percentVal}</div>
            </div>
          </div>

        </div>
      </DoubleBezelCard>

    </div>
  );
};

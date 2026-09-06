import React, { useState } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { Fraction, renderFormattedMathText } from '@/components/ui/fraction';
import { soundService } from '@/services/soundService';
import {
  Calculator,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
  X,
  Divide,
  Layers,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export const SiswaKalkulator: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  // Mode: 'biasa' | 'campuran'
  const [calcType, setCalcType] = useState<'biasa' | 'campuran'>('biasa');

  // Fraction 1: Whole (w1), Numerator (n1), Denominator (d1)
  const [w1, setW1] = useState<number>(0);
  const [n1, setN1] = useState<number>(1);
  const [d1, setD1] = useState<number>(4);

  // Operation
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');

  // Fraction 2: Whole (w2), Numerator (n2), Denominator (d2)
  const [w2, setW2] = useState<number>(0);
  const [n2, setN2] = useState<number>(1);
  const [d2, setD2] = useState<number>(2);

  const [result, setResult] = useState<{
    f1Display: string;
    f2Display: string;
    f1ImproperN: number;
    f1ImproperD: number;
    f2ImproperN: number;
    f2ImproperD: number;
    rawN: number;
    rawD: number;
    simN: number;
    simD: number;
    decimal: string;
    percentage: string;
    mixed: string | null;
    stepExplanation: string[];
    commonFactor: number;
    kpkVal: number;
  } | null>(null);

  const [hasZeroError, setHasZeroError] = useState<boolean>(false);

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
      }
    return a || 1;
  };

  const lcm = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  };

  const handleModeChange = (mode: 'biasa' | 'campuran') => {
    soundService.click();
    setCalcType(mode);
    if (mode === 'biasa') {
      setW1(0);
      setW2(0);
    } else {
      if (w1 === 0) setW1(1);
      if (w2 === 0) setW2(1);
    }
    setResult(null);
  };

  const handleReset = () => {
    soundService.click();
    setW1(calcType === 'campuran' ? 1 : 0);
    setN1(1);
    setD1(2);
    setOp('+');
    setW2(calcType === 'campuran' ? 1 : 0);
    setN2(1);
    setD2(4);
    setHasZeroError(false);
    setResult(null);
  };

  const calculate = () => {
    soundService.click();

    if (d1 === 0 || d2 === 0) {
      setHasZeroError(true);
      setResult(null);
      soundService.alert();
      showToast('Penyebut tidak boleh bernilai 0 (tidak terdefinisi)!', 'error');
      return;
    }

    const currentW1 = calcType === 'campuran' ? (w1 || 0) : 0;
    const currentW2 = calcType === 'campuran' ? (w2 || 0) : 0;

    // Convert Fraction 1 to Improper Fraction: (w1 * d1 + n1) / d1
    const impN1 = currentW1 * d1 + n1;
    const impD1 = d1;

    // Convert Fraction 2 to Improper Fraction: (w2 * d2 + n2) / d2
    const impN2 = currentW2 * d2 + n2;
    const impD2 = d2;

    if (op === '/' && impN2 === 0) {
      setHasZeroError(true);
      setResult(null);
      soundService.alert();
      showToast('Pembagian dengan 0 tidak diperbolehkan!', 'error');
      return;
    }

    setHasZeroError(false);

    let rawN = 0;
    let rawD = 1;
    const steps: string[] = [];
    let kpk = 1;

    // Display strings for Fraction 1 and Fraction 2
    const f1Str = currentW1 > 0 ? `${currentW1} ${n1}/${d1}` : `${n1}/${d1}`;
    const f2Str = currentW2 > 0 ? `${currentW2} ${n2}/${d2}` : `${n2}/${d2}`;

    // Step 1: Conversion of mixed fraction if applicable
    if (calcType === 'campuran' && (currentW1 > 0 || currentW2 > 0)) {
      let convText = '1. Konversi pecahan campuran menjadi pecahan biasa:';
      if (currentW1 > 0) {
        convText += `\n   • Pecahan 1: ${currentW1} ${n1}/${d1} = (${currentW1}×${d1} + ${n1})/${d1} = ${impN1}/${impD1}.`;
      }
      if (currentW2 > 0) {
        convText += `\n   • Pecahan 2: ${currentW2} ${n2}/${d2} = (${currentW2}×${d2} + ${n2})/${d2} = ${impN2}/${impD2}.`;
      }
      steps.push(convText);
    }

    if (op === '+') {
      kpk = lcm(impD1, impD2);
      const m1 = kpk / impD1;
      const m2 = kpk / impD2;
      const adjN1 = impN1 * m1;
      const adjN2 = impN2 * m2;
      rawN = adjN1 + adjN2;
      rawD = kpk;

      steps.push(`2. Samakan penyebut dengan mencari KPK(${impD1}, ${impD2}) = ${kpk}.`);
      steps.push(`3. Ubah pecahan: (${impN1}×${m1})/${kpk} + (${impN2}×${m2})/${kpk} = ${adjN1}/${kpk} + ${adjN2}/${kpk}.`);
      steps.push(`4. Jumlahkan pembilang: (${adjN1} + ${adjN2}) / ${kpk} = ${rawN}/${rawD}.`);
    } else if (op === '-') {
      kpk = lcm(impD1, impD2);
      const m1 = kpk / impD1;
      const m2 = kpk / impD2;
      const adjN1 = impN1 * m1;
      const adjN2 = impN2 * m2;
      rawN = adjN1 - adjN2;
      rawD = kpk;

      steps.push(`2. Samakan penyebut dengan mencari KPK(${impD1}, ${impD2}) = ${kpk}.`);
      steps.push(`3. Ubah pecahan: (${impN1}×${m1})/${kpk} − (${impN2}×${m2})/${kpk} = ${adjN1}/${kpk} − ${adjN2}/${kpk}.`);
      steps.push(`4. Kurangkan pembilang: (${adjN1} − ${adjN2}) / ${kpk} = ${rawN}/${rawD}.`);
    } else if (op === '*') {
      rawN = impN1 * impN2;
      rawD = impD1 * impD2;
      steps.push(`2. Kalikan pembilang dengan pembilang: ${impN1} × ${impN2} = ${rawN}.`);
      steps.push(`3. Kalikan penyebut dengan penyebut: ${impD1} × ${impD2} = ${rawD}.`);
      steps.push(`4. Hasil kali mentah = ${rawN}/${rawD}.`);
    } else if (op === '/') {
      rawN = impN1 * impD2;
      rawD = impD1 * impN2;
      steps.push(`2. Balikkan pecahan pembagi kedua: ${impN2}/${impD2} menjadi ${impD2}/${impN2}.`);
      steps.push(`3. Ubah menjadi perkalian: (${impN1}/${impD1}) × (${impD2}/${impN2}).`);
      steps.push(`4. Kalikan langsung: (${impN1}×${impD2}) / (${impD1}×${impN2}) = ${rawN}/${rawD}.`);
    }

    const common = gcd(rawN, rawD);
    let simN = rawN / common;
    let simD = rawD / common;

    if (simD < 0) {
      simN = -simN;
      simD = -simD;
    }

    let mixedStr: string | null = null;
    if (Math.abs(simN) >= simD && simD !== 1) {
      const whole = Math.floor(Math.abs(simN) / simD);
      const rem = Math.abs(simN) % simD;
      const sign = simN < 0 ? '-' : '';
      mixedStr = rem === 0 ? `${sign}${whole}` : `${sign}${whole} ${rem}/${simD}`;
    } else if (simD === 1) {
      mixedStr = `${simN}`;
    }

    const decVal = simN / simD;
    const decimal = decVal.toFixed(3).replace(/\.?0+$/, '') || '0';
    const percentage = (decVal * 100).toFixed(1).replace(/\.?0+$/, '') + '%';

    if (common > 1) {
      steps.push(`5. Sederhanakan menggunakan FPB (${common}): (${rawN}÷${common}) / (${rawD}÷${common}) = ${simN}/${simD}.`);
    } else {
      steps.push(`5. Pecahan ${simN}/${simD} sudah dalam bentuk paling sederhana (FPB = 1).`);
    }

    if (mixedStr && mixedStr !== `${simN}/${simD}`) {
      steps.push(`6. Konversi ke pecahan campuran: ${simN}/${simD} = ${mixedStr}.`);
    }

    setResult({
      f1Display: f1Str,
      f2Display: f2Str,
      f1ImproperN: impN1,
      f1ImproperD: impD1,
      f2ImproperN: impN2,
      f2ImproperD: impD2,
      rawN,
      rawD,
      simN,
      simD,
      decimal,
      percentage,
      mixed: mixedStr,
      stepExplanation: steps,
      commonFactor: common,
      kpkVal: kpk,
    });

    soundService.success();
  };

  const operations = [
    { key: '+' as const, label: 'Tambah', symbol: '+', icon: Plus },
    { key: '-' as const, label: 'Kurang', symbol: '−', icon: Minus },
    { key: '*' as const, label: 'Kali', symbol: '×', icon: X },
    { key: '/' as const, label: 'Bagi', symbol: '÷', icon: Divide },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      
      {/* Swiss Precision Header */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <Calculator size={13} className="text-[#00ffc6]" />
                <span>Kalkulator Pecahan Biasa & Campuran</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Sparkles size={12} className="text-emerald-500" />
                <span>FPB, KPK & Konversi Otomatis</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kalkulator & Analisis Pecahan
            </h1>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              Mendukung input <b>Pecahan Biasa</b> dan <b>Pecahan Campuran</b> dengan penjabaran langkah konversi dan operasi matematis formal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Nilai</span>
            </button>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Main Interactive Calculation Card */}
      <Card className="p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm border border-slate-200/90 bg-white">
        
        {/* Mode Selector: Pecahan Biasa vs Pecahan Campuran */}
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 text-center">
            Pilih Jenis Pecahan:
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleModeChange('biasa')}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                calcType === 'biasa'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span>Pecahan Biasa (a/b)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('campuran')}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                calcType === 'campuran'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pecahan Campuran (w a/b)</span>
            </button>
          </div>
        </div>

        {/* Tactile Segmented Operator Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 text-center">
            Pilih Operasi Hitung:
          </label>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            {operations.map((item) => {
              const isActive = op === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setOp(item.key);
                  }}
                  className={`relative py-2.5 px-2 rounded-xl text-xs font-black transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="font-mono text-lg leading-none">{item.symbol}</span>
                  <span className="text-[10px] font-bold">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00ffc6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Precision Fraction Dual Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Fraction 1 Card */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span>Pecahan 1</span>
              <span className="font-mono text-brand-600 bg-brand-50 border border-brand-200/60 px-2 py-1 rounded-md">
                <Fraction whole={calcType === 'campuran' && w1 > 0 ? w1 : undefined} num={n1} den={d1 || 1} size="xs" />
              </span>
            </div>

            {/* Layout */}
            <div className="flex items-center justify-center gap-3">
              {/* Bilangan Bulat (Only in Campuran Mode) */}
              {calcType === 'campuran' && (
                <div className="space-y-1 w-16">
                  <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Bulat
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={w1}
                    onChange={(e) => setW1(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full text-center py-3 rounded-xl border border-slate-300 bg-white font-mono font-black text-2xl text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition shadow-2xs"
                    title="Bilangan Bulat"
                  />
                </div>
              )}

              {/* Fraction Numerator & Denominator */}
              <div className={`space-y-1.5 ${calcType === 'campuran' ? 'w-24' : 'w-28'}`}>
                <input
                  type="number"
                  min="0"
                  value={n1}
                  onChange={(e) => setN1(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center py-2 rounded-xl border border-slate-300 bg-white font-mono font-black text-xl text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition shadow-2xs"
                  title="Pembilang"
                />
                <div className="h-0.5 bg-slate-400/80 rounded-full w-full" />
                <input
                  type="number"
                  min="1"
                  value={d1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setD1(v);
                    setHasZeroError(v === 0);
                  }}
                  className={`w-full text-center py-2 rounded-xl border font-mono font-black text-xl outline-none transition shadow-2xs ${
                    d1 === 0
                      ? 'border-red-400 bg-red-50 text-red-600 ring-4 ring-red-400/20'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'
                  }`}
                  title="Penyebut (Tidak boleh 0)"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <span>{calcType === 'campuran' ? 'Pecahan Campuran:' : 'Pecahan Biasa:'}</span>
              <Fraction whole={calcType === 'campuran' && w1 > 0 ? w1 : undefined} num={n1} den={d1 || 1} size="xs" />
            </div>
          </div>

          {/* Operator Badge in Center */}
          <div className="md:col-span-1 flex justify-center items-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-mono font-black text-xl flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-200">
              {op === '+' ? '+' : op === '-' ? '−' : op === '*' ? '×' : '÷'}
            </div>
          </div>

          {/* Fraction 2 Card */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span>Pecahan 2</span>
              <span className="font-mono text-brand-600 bg-brand-50 border border-brand-200/60 px-2 py-1 rounded-md">
                <Fraction whole={calcType === 'campuran' && w2 > 0 ? w2 : undefined} num={n2} den={d2 || 1} size="xs" />
              </span>
            </div>

            {/* Layout */}
            <div className="flex items-center justify-center gap-3">
              {/* Bilangan Bulat (Only in Campuran Mode) */}
              {calcType === 'campuran' && (
                <div className="space-y-1 w-16">
                  <span className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Bulat
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={w2}
                    onChange={(e) => setW2(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full text-center py-3 rounded-xl border border-slate-300 bg-white font-mono font-black text-2xl text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition shadow-2xs"
                    title="Bilangan Bulat"
                  />
                </div>
              )}

              {/* Fraction Numerator & Denominator */}
              <div className={`space-y-1.5 ${calcType === 'campuran' ? 'w-24' : 'w-28'}`}>
                <input
                  type="number"
                  min="0"
                  value={n2}
                  onChange={(e) => setN2(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center py-2 rounded-xl border border-slate-300 bg-white font-mono font-black text-xl text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition shadow-2xs"
                  title="Pembilang"
                />
                <div className="h-0.5 bg-slate-400/80 rounded-full w-full" />
                <input
                  type="number"
                  min="1"
                  value={d2}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setD2(v);
                    setHasZeroError(v === 0);
                  }}
                  className={`w-full text-center py-2 rounded-xl border font-mono font-black text-xl outline-none transition shadow-2xs ${
                    d2 === 0
                      ? 'border-red-400 bg-red-50 text-red-600 ring-4 ring-red-400/20'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15'
                  }`}
                  title="Penyebut (Tidak boleh 0)"
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <span>{calcType === 'campuran' ? 'Pecahan Campuran:' : 'Pecahan Biasa:'}</span>
              <Fraction whole={calcType === 'campuran' && w2 > 0 ? w2 : undefined} num={n2} den={d2 || 1} size="xs" />
            </div>
          </div>

        </div>

        {/* Zero Error Warning */}
        {hasZeroError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>Penyebut tidak boleh 0! Dalam matematika formal, pecahan dengan penyebut nol menghasilkan nilai tak terdefinisi.</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <GlassmorphismCTA
            variant="mint"
            size="lg"
            onClick={calculate}
            className="w-full sm:w-auto min-w-[240px]"
          >
            Hitung & Bedah Langkah
          </GlassmorphismCTA>
        </div>

        {/* Calculation Result & Reasoning Panel */}
        {result && (
          <div className="p-5 sm:p-6 bg-slate-50/90 border border-slate-200/90 rounded-3xl space-y-6 shadow-xs animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Hasil Operasi Hitung</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Penyederhanaan dan konversi lengkap ke seluruh bentuk pecahan
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-600">
                Terverifikasi
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              
              {/* Metric 1: Pecahan Biasa */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pecahan Biasa
                </span>
                <div className="text-brand-700 py-1">
                  <Fraction num={result.simN} den={result.simD} size="lg" />
                </div>
              </div>

              {/* Metric 2: Pecahan Campuran */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Campuran
                </span>
                <div className="text-amber-600 py-1">
                  {result.mixed && result.mixed.includes(' ') && result.mixed.includes('/') ? (
                    (() => {
                      const [w, f] = result.mixed.split(' ');
                      const [n, d] = f.split('/');
                      return <Fraction whole={w} num={n} den={d} size="lg" />;
                    })()
                  ) : result.mixed && result.mixed.includes('/') ? (
                    (() => {
                      const [n, d] = result.mixed.split('/');
                      return <Fraction num={n} den={d} size="lg" />;
                    })()
                  ) : (
                    <span className="font-mono text-xl font-black">{result.mixed || '-'}</span>
                  )}
                </div>
              </div>

              {/* Metric 3: Desimal */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bentuk Desimal
                </span>
                <div className="font-mono text-2xl font-black text-slate-800">
                  {result.decimal}
                </div>
              </div>

              {/* Metric 4: Persentase */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Persentase
                </span>
                <div className="font-mono text-2xl font-black text-emerald-600">
                  {result.percentage}
                </div>
              </div>

            </div>

            {/* Step-by-Step Formal Reasoning */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-black text-slate-900 pb-1.5 border-b border-slate-100">
                <Layers size={15} className="text-brand-600" />
                <span>Langkah-Langkah Penyelesaian Matematis:</span>
              </div>
              
              <div className="space-y-2 text-slate-700 leading-relaxed font-medium">
                {result.stepExplanation.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <p className="whitespace-pre-line leading-relaxed">{renderFormattedMathText(step, 'xs')}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </Card>
    </div>
  );
};

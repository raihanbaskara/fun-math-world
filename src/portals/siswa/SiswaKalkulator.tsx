import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
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
  SlidersHorizontal,
  ArrowRight,
  Equal
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

  const calculateFraction = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (d1 === 0 || d2 === 0) {
      setHasZeroError(true);
      showToast('Penyebut pecahan tidak boleh nol (b ≠ 0)!', 'error');
      return;
    }
    setHasZeroError(false);

    // Convert mixed to improper if applicable
    const impN1 = calcType === 'campuran' ? w1 * d1 + n1 : n1;
    const impD1 = d1;
    const impN2 = calcType === 'campuran' ? w2 * d2 + n2 : n2;
    const impD2 = d2;

    let rawNumerator = 0;
    let rawDenominator = 1;
    let kpk = lcm(impD1, impD2);
    const steps: string[] = [];

    if (calcType === 'campuran') {
      steps.push(
        `Langkah 1 (Ubah ke pecahan biasa):\n• Pecahan 1: ${w1 > 0 ? `${w1} ` : ''}${n1}/${d1} = (${w1} × ${d1} + ${n1})/${d1} = ${impN1}/${impD1}\n• Pecahan 2: ${w2 > 0 ? `${w2} ` : ''}${n2}/${d2} = (${w2} × ${d2} + ${n2})/${d2} = ${impN2}/${impD2}`
      );
    }

    if (op === '+') {
      const k1 = kpk / impD1;
      const k2 = kpk / impD2;
      rawNumerator = impN1 * k1 + impN2 * k2;
      rawDenominator = kpk;
      steps.push(
        `Langkah 2 (Samakan Penyebut dengan KPK):\n• KPK(${impD1}, ${impD2}) = ${kpk}\n• (${impN1} × ${k1})/${kpk} + (${impN2} × ${k2})/${kpk} = ${impN1 * k1}/${kpk} + ${impN2 * k2}/${kpk}`
      );
      steps.push(`Langkah 3 (Jumlahkan Pembilang):\n• (${impN1 * k1} + ${impN2 * k2})/${kpk} = ${rawNumerator}/${rawDenominator}`);
    } else if (op === '-') {
      const k1 = kpk / impD1;
      const k2 = kpk / impD2;
      rawNumerator = impN1 * k1 - impN2 * k2;
      rawDenominator = kpk;
      steps.push(
        `Langkah 2 (Samakan Penyebut dengan KPK):\n• KPK(${impD1}, ${impD2}) = ${kpk}\n• (${impN1} × ${k1})/${kpk} - (${impN2} × ${k2})/${kpk} = ${impN1 * k1}/${kpk} - ${impN2 * k2}/${kpk}`
      );
      steps.push(`Langkah 3 (Kurangkan Pembilang):\n• (${impN1 * k1} - ${impN2 * k2})/${kpk} = ${rawNumerator}/${rawDenominator}`);
    } else if (op === '*') {
      rawNumerator = impN1 * impN2;
      rawDenominator = impD1 * impD2;
      steps.push(
        `Langkah 2 (Kalikan Pembilang dengan Pembilang & Penyebut dengan Penyebut):\n• (${impN1} × ${impN2}) / (${impD1} × ${impD2}) = ${rawNumerator}/${rawDenominator}`
      );
    } else if (op === '/') {
      if (impN2 === 0) {
        setHasZeroError(true);
        showToast('Tidak dapat membagi dengan pecahan bernilai nol!', 'error');
        return;
      }
      rawNumerator = impN1 * impD2;
      rawDenominator = impD1 * impN2;
      steps.push(
        `Langkah 2 (Ubah pembagian menjadi perkalian kebalikan):\n• ${impN1}/${impD1} ÷ ${impN2}/${impD2} = ${impN1}/${impD1} × ${impD2}/${impN2}\n• (${impN1} × ${impD2}) / (${impD1} × ${impN2}) = ${rawNumerator}/${rawDenominator}`
      );
    }

    // Simplify using GCD
    const common = gcd(rawNumerator, rawDenominator);
    const simN = rawNumerator / common;
    const simD = rawDenominator / common;

    if (common > 1) {
      steps.push(
        `Langkah 4 (Sederhanakan dengan FPB = ${common}):\n• (${rawNumerator} ÷ ${common}) / (${rawDenominator} ÷ ${common}) = ${simN}/${simD}`
      );
    } else {
      steps.push(`Langkah 4:\n• Bentuk ${rawNumerator}/${rawDenominator} sudah paling sederhana.`);
    }

    // Mixed representation if improper
    let mixedFormat: string | null = null;
    if (Math.abs(simN) >= Math.abs(simD) && simD !== 1) {
      const wPart = Math.floor(Math.abs(simN) / simD);
      const remPart = Math.abs(simN) % simD;
      const sign = simN < 0 ? '-' : '';
      if (remPart > 0) {
        mixedFormat = `${sign}${wPart} ${remPart}/${simD}`;
        steps.push(`Langkah 5 (Konversi ke Pecahan Campuran):\n• ${simN}/${simD} = ${mixedFormat}`);
      }
    }

    const dec = (simN / simD).toFixed(3).replace(/\.?0+$/, '') || '0';
    const pct = ((simN / simD) * 100).toFixed(1).replace(/\.?0+$/, '') + '%';

    setResult({
      f1Display: calcType === 'campuran' ? `${w1 > 0 ? `${w1} ` : ''}${n1}/${d1}` : `${n1}/${d1}`,
      f2Display: calcType === 'campuran' ? `${w2 > 0 ? `${w2} ` : ''}${n2}/${d2}` : `${n2}/${d2}`,
      f1ImproperN: impN1,
      f1ImproperD: impD1,
      f2ImproperN: impN2,
      f2ImproperD: impD2,
      rawN: rawNumerator,
      rawD: rawDenominator,
      simN: simN,
      simD: simD,
      decimal: dec,
      percentage: pct,
      mixed: mixedFormat,
      stepExplanation: steps,
      commonFactor: common,
      kpkVal: kpk,
    });

    soundService.success();
    showToast('Hasil perhitungan dan langkah sistematis siap!', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ff94e8] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          + - × ÷
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                KALKULATOR PECAHAN CERDAS
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                Langkah Penyelesaian KPK &amp; FPB Lengkap
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Kalkulator Operasi Hitung Pecahan
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Hitung operasi penjumlahan, pengurangan, perkalian, dan pembagian pecahan biasa maupun campuran dengan penjabaran langkah demi langkah yang runtut.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Calculator size={36} />
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleModeChange('biasa')}
          className={`px-5 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            calcType === 'biasa'
              ? 'bg-[#ffe600] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
              : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-yellow-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>Pecahan Biasa (a/b)</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('campuran')}
          className={`px-5 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            calcType === 'campuran'
              ? 'bg-[#38bdf8] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
              : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-sky-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>Pecahan Campuran (w a/b)</span>
        </button>
      </div>

      {/* Calculator Interactive Form */}
      <form onSubmit={calculateFraction} className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          
          {/* Fraction 1 Card */}
          <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
            {calcType === 'campuran' && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Utuh</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={w1}
                  onChange={(e) => setW1(parseInt(e.target.value) || 0)}
                  className="w-14 p-2.5 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Pembilang</span>
              <input
                type="number"
                min="0"
                max="999"
                value={n1}
                onChange={(e) => setN1(parseInt(e.target.value) || 0)}
                className="w-16 p-2 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
              />
              <div className="w-16 h-1 bg-slate-950 dark:bg-slate-400 rounded-full" />
              <input
                type="number"
                min="1"
                max="999"
                value={d1}
                onChange={(e) => setD1(parseInt(e.target.value) || 1)}
                className="w-16 p-2 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
              />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Penyebut</span>
            </div>
          </div>

          {/* Operation Selector */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">Operasi</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { op: '+', label: '+', icon: Plus, bg: 'bg-[#ffe600]' },
                { op: '-', label: '-', icon: Minus, bg: 'bg-[#38bdf8]' },
                { op: '*', label: '×', icon: X, bg: 'bg-[#ff94e8]' },
                { op: '/', label: '÷', icon: Divide, bg: 'bg-[#a3e635]' },
              ].map((item) => (
                <button
                  key={item.op}
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setOp(item.op as '+' | '-' | '*' | '/');
                  }}
                  className={`w-11 h-11 rounded-xl border-2 border-slate-950 dark:border-slate-700 font-mono font-black text-lg flex items-center justify-center transition-all cursor-pointer ${
                    op === item.op
                      ? `${item.bg} text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Fraction 2 Card */}
          <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3">
            {calcType === 'campuran' && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Utuh</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={w2}
                  onChange={(e) => setW2(parseInt(e.target.value) || 0)}
                  className="w-14 p-2.5 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Pembilang</span>
              <input
                type="number"
                min="0"
                max="999"
                value={n2}
                onChange={(e) => setN2(parseInt(e.target.value) || 0)}
                className="w-16 p-2 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
              />
              <div className="w-16 h-1 bg-slate-950 dark:bg-slate-400 rounded-full" />
              <input
                type="number"
                min="1"
                max="999"
                value={d2}
                onChange={(e) => setD2(parseInt(e.target.value) || 1)}
                className="w-16 p-2 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-center font-mono font-black text-lg focus:bg-yellow-50 dark:focus:bg-slate-800 outline-none"
              />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Penyebut</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="font-black text-xs"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            <span>Reset Angka</span>
          </Button>

          <Button
            type="submit"
            variant="yellow"
            size="md"
            className="font-black text-xs"
          >
            <Equal size={18} />
            <span>Hitung Hasil Pecahan</span>
          </Button>
        </div>

      </form>

      {/* Results Arena */}
      {result && (
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-950 dark:border-slate-800">
            <h3 className="font-mono font-black text-lg text-slate-950 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />
              <span>Hasil Perhitungan Akhir</span>
            </h3>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-slate-950 dark:text-emerald-200 font-mono text-xs font-black border border-slate-950 dark:border-slate-700">
              Terverifikasi Matematika
            </span>
          </div>

          {/* Primary Result Box */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            
            <div className="p-4 rounded-2xl bg-[#ffe600] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-1 text-slate-950">
              <div className="text-[10px] font-mono font-bold text-slate-800 uppercase">Pecahan Sederhana</div>
              <div className="text-2xl font-black font-mono">
                {result.simD === 1 ? result.simN : `${result.simN}/${result.simD}`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#38bdf8] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-1 text-slate-950">
              <div className="text-[10px] font-mono font-bold text-slate-800 uppercase">Pecahan Campuran</div>
              <div className="text-xl font-black font-mono">
                {result.mixed || '-'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#a3e635] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-1 text-slate-950">
              <div className="text-[10px] font-mono font-bold text-slate-800 uppercase">Bentuk Desimal</div>
              <div className="text-2xl font-black font-mono">
                {result.decimal}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#ff94e8] border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-1 text-slate-950">
              <div className="text-[10px] font-mono font-bold text-slate-800 uppercase">Bentuk Persentase</div>
              <div className="text-2xl font-black font-mono">
                {result.percentage}
              </div>
            </div>

          </div>

          {/* Step-by-Step Breakdown */}
          <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 space-y-3 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]">
            <div className="text-xs font-mono font-black uppercase text-slate-950 dark:text-slate-100 flex items-center gap-1.5">
              <Layers size={15} />
              <span>Penjabaran Langkah demi Langkah:</span>
            </div>

            <div className="space-y-2.5">
              {result.stepExplanation.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

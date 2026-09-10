import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Fraction, renderFormattedMathText } from '@/components/ui/fraction';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Divide,
  FileText,
  Download,
  Lightbulb
} from 'lucide-react';

export const SiswaMateri: React.FC<{
  onNavigate: (route: string) => void;
}> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const materials = storageService.getState().materials;

  const topicsDetail = [
    {
      code: 'BAB 1.1',
      title: 'Konsep Dasar & Arti Pecahan',
      badge: 'Fondasi',
      summary: 'Pecahan merepresentasikan bagian dari keseluruhan dengan syarat penyebut b ≠ 0.',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-lg font-mono font-black text-slate-950 dark:text-slate-100">
          <Fraction num="a" den="b" size="lg" className="text-slate-950 dark:text-slate-100" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-sans font-bold">(a = Pembilang / Terarsir, b = Penyebut / Total Porsi)</span>
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <span>Jika 1 loyang pizza dipotong menjadi 8 bagian sama besar dan dimakan 3 potong:</span>
          <span className="px-2 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 border-2 border-slate-950 font-black">
            <Fraction num="3" den="8" size="sm" />
          </span>
        </div>
      ),
      visualType: 'pizza',
      visualData: { n: 3, d: 8 },
    },
    {
      code: 'BAB 1.2',
      title: 'Jenis-Jenis Pecahan di Kelas 7',
      badge: 'Klasifikasi',
      summary: 'Mengenal pecahan biasa, pecahan campuran, desimal, dan persen.',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-mono font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <span>Campuran:</span>
          <Fraction whole="w" num="n" den="d" size="md" />
          <span>=</span>
          <Fraction num="(w×d + n)" den="d" size="md" />
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <span className="px-2 py-0.5 rounded-lg bg-sky-200 text-slate-950 border-2 border-slate-950">
            <Fraction num="7" den="4" size="sm" />
          </span>
          <span>diubah menjadi bentuk campuran</span>
          <span className="px-2 py-0.5 rounded-lg bg-yellow-200 text-slate-950 border-2 border-slate-950">
            <Fraction whole="1" num="3" den="4" size="sm" />
          </span>
          <span>= 1,75 = 175%</span>
        </div>
      ),
      visualType: 'mixed',
      visualData: { whole: 1, n: 3, d: 4 },
    },
    {
      code: 'BAB 1.3',
      title: 'Pecahan Senilai & Menyederhanakan',
      badge: 'Penyederhanaan',
      summary: 'Pecahan senilai memiliki rasio perbandingan yang setara (dikalikan/dibagi FPB yang sama).',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-mono font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <Fraction num="a × k" den="b × k" size="md" />
          <span>=</span>
          <Fraction num="a" den="b" size="md" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-sans font-bold">(Pengali k ≠ 0)</span>
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <span className="px-2 py-0.5 rounded-lg bg-lime-200 text-slate-950 border-2 border-slate-950 font-black">
            <Fraction num="2" den="3" size="sm" />
          </span>
          <span>=</span>
          <span className="px-2 py-0.5 rounded-lg bg-lime-200 text-slate-950 border-2 border-slate-950 font-black">
            <Fraction num="4" den="6" size="sm" />
          </span>
          <span>=</span>
          <span className="px-2 py-0.5 rounded-lg bg-lime-200 text-slate-950 border-2 border-slate-950 font-black">
            <Fraction num="8" den="12" size="sm" />
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">(Pecahan senilai dari perkalian faktor 2 dan 4)</span>
        </div>
      ),
      visualType: 'equivalent',
      visualData: { pairs: ['2/3', '4/6', '8/12'] },
    },
    {
      code: 'BAB 1.4',
      title: 'Operasi Penjumlahan & Pengurangan',
      badge: 'Operasi Hitung',
      summary: 'Menyamakan penyebut yang berbeda dengan mencari Kelipatan Persekutuan Terkecil (KPK).',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-mono font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <Fraction num="a" den="c" size="md" />
          <span>+</span>
          <Fraction num="b" den="d" size="md" />
          <span>=</span>
          <Fraction num="(a×k₁ + b×k₂)" den="KPK(c, d)" size="md" />
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <Fraction num="1" den="2" size="sm" />
          <span>+</span>
          <Fraction num="1" den="3" size="sm" />
          <span>=</span>
          <Fraction num="3" den="6" size="sm" />
          <span>+</span>
          <Fraction num="2" den="6" size="sm" />
          <span>=</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#ffe600] text-slate-950 border-2 border-slate-950 font-black">
            <Fraction num="5" den="6" size="sm" />
          </span>
        </div>
      ),
      visualType: 'operation',
      visualData: { exp: '1/2 + 1/3 = 5/6' },
    },
  ];

  const currentTopic = topicsDetail[activeTab] || topicsDetail[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#38bdf8] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          MATERI
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                MODUL TEORI &amp; KONSEP DASAR
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                Kurikulum Merdeka Kelas 7 SMP
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Materi Pembelajaran Bilangan Pecahan
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Pelajari definisi formal, ragam bentuk pecahan, metode penyederhanaan FPB, serta operasi hitung berbasis KPK secara runtut dan visual.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <BookOpen size={36} />
          </div>
        </div>
      </div>

      {/* Sub-Topic Selection Pills (Neobrutal High-Contrast Buttons) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topicsDetail.map((t, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => {
                soundService.click();
                setActiveTab(idx);
              }}
              className={`p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? 'bg-[#ffe600] text-slate-950 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-amber-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-950 dark:border-slate-700 text-[10px] font-mono font-black text-slate-950 dark:text-slate-100">
                  {t.code}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                  {t.badge}
                </span>
              </div>
              <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-slate-100 line-clamp-1">
                {t.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Material Detail Card */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
        
        {/* Topic Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-slate-950 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#a3e635] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {currentTopic.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#c084fc] text-slate-950 font-mono font-black text-xs border-2 border-slate-950">
                {currentTopic.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 font-mono mt-2">
              {currentTopic.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
              {currentTopic.summary}
            </p>
          </div>
        </div>

        {/* Formula / Concept Rule Box (Yellow Neobrutal Card) */}
        <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
            <Lightbulb size={16} className="text-amber-500" />
            <span>Rumus &amp; Definisi Formal:</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 overflow-x-auto shadow-inner">
            {currentTopic.renderFormula()}
          </div>
        </div>

        {/* Concrete Example Box (Cyan Neobrutal Card) */}
        <div className="p-5 rounded-2xl bg-[#e0f2fe] dark:bg-sky-950/40 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
            <CheckCircle2 size={16} className="text-sky-600 dark:text-sky-400" />
            <span>Contoh Kasus &amp; Penyelesaian:</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700">
            {currentTopic.renderExample()}
          </div>
        </div>

        {/* Supplementary Materials from Teacher (Uploaded Files & Subbab) */}
        {materials && materials.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#fdf4ff] dark:bg-purple-950/40 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              <FileText size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Modul &amp; Berkas Tambahan dari Guru:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {materials.map(m => (
                <div key={m.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-yellow-200 text-slate-950 font-mono font-black text-[10px] border border-slate-950">
                      {m.badge}
                    </span>
                  </div>
                  <h4 className="font-black text-xs text-slate-950 dark:text-slate-100">{m.title}</h4>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {renderFormattedMathText(m.content, 'xs')}
                  </div>
                  {m.fileName && (
                    <a
                      href={m.fileUrl || '#'}
                      download={m.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffe600] text-slate-950 border border-slate-950 text-[11px] font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] hover:bg-yellow-400"
                    >
                      <Download size={13} />
                      <span>Unduh {m.fileName}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons to next modules */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-3 border-slate-950 dark:border-slate-800">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto font-black text-xs"
            onClick={() => onNavigate('siswa/studio')}
          >
            <PieChart size={16} />
            <span>Eksplorasi Studio Visual Pizza</span>
          </Button>

          <Button
            variant="yellow"
            size="md"
            className="w-full sm:w-auto font-black text-xs"
            onClick={() => onNavigate('siswa/lkpd')}
          >
            <span>Lanjut Kerjakan LKPD Digital</span>
            <ArrowRight size={16} />
          </Button>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Fraction, renderFormattedMathText } from '@/components/ui/fraction';
import { storageService } from '@/services/storageService';
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Divide,
  Compass,
  FileText
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
        <div className="flex items-center gap-2 text-base sm:text-lg font-mono font-black text-[#00ffc6]">
          <Fraction num="a" den="b" size="lg" />
          <span className="text-xs text-slate-300 font-sans font-medium">(a = Pembilang, b = Penyebut)</span>
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2">
          <span>Jika 1 loyang pizza dipotong 8 bagian dan dimakan 3 potong:</span>
          <Fraction num="3" den="8" size="sm" className="text-brand-600" />
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
        <div className="flex items-center gap-2 text-base sm:text-lg font-mono font-black text-[#00ffc6]">
          <span>Campuran:</span>
          <Fraction whole="w" num="n" den="d" size="md" />
          <span>=</span>
          <Fraction num="(w×d + n)" den="d" size="md" />
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap">
          <Fraction num="7" den="4" size="sm" className="text-brand-600" />
          <span>diubah menjadi bentuk campuran</span>
          <Fraction whole="1" num="3" den="4" size="sm" className="text-amber-600" />
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
        <div className="flex items-center gap-2 text-base sm:text-lg font-mono font-black text-[#00ffc6]">
          <Fraction num="a × k" den="b × k" size="md" />
          <span>=</span>
          <Fraction num="a" den="b" size="md" />
          <span className="text-xs text-slate-300 font-sans font-medium">(k ≠ 0)</span>
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap">
          <Fraction num="2" den="3" size="sm" className="text-brand-600" />
          <span>=</span>
          <Fraction num="4" den="6" size="sm" className="text-brand-600" />
          <span>=</span>
          <Fraction num="8" den="12" size="sm" className="text-brand-600" />
          <span>(disederhanakan menggunakan FPB)</span>
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
        <div className="flex items-center gap-2 text-base sm:text-lg font-mono font-black text-[#00ffc6]">
          <Fraction num="a" den="c" size="md" />
          <span>+</span>
          <Fraction num="b" den="d" size="md" />
          <span>=</span>
          <Fraction num="(a×k₁ + b×k₂)" den="KPK(c, d)" size="md" />
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap">
          <Fraction num="1" den="2" size="sm" className="text-brand-600" />
          <span>+</span>
          <Fraction num="1" den="3" size="sm" className="text-brand-600" />
          <span>=</span>
          <Fraction num="3" den="6" size="sm" className="text-brand-600" />
          <span>+</span>
          <Fraction num="2" den="6" size="sm" className="text-brand-600" />
          <span>=</span>
          <Fraction num="5" den="6" size="sm" className="text-emerald-600" />
        </div>
      ),
      visualType: 'operation',
      visualData: { exp: '1/2 + 1/3 = 5/6' },
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <BookOpen size={13} className="text-[#00ffc6]" />
                <span>Modul Teori & Konsep</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Sparkles size={12} className="text-emerald-500" />
                <span>Kurikulum Merdeka Fase D</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Materi Pembelajaran Bilangan Pecahan
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Pelajari definisi formal, ragam bentuk pecahan, metode penyederhanaan FPB, serta operasi hitung berbasis KPK secara runtut.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <ArrowFillButton
              variant="mint"
              size="sm"
              onClick={() => onNavigate('siswa/studio')}
            >
              Buka Studio Visual
            </ArrowFillButton>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Sub-Bab Quick Segmented Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {topicsDetail.map((t, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-70 mb-1">
                <span>{t.code}</span>
                <span>{t.badge}</span>
              </div>
              <div className="font-extrabold text-xs line-clamp-1">
                {t.title.split('. ')[1] || t.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Bab Interactive Bento Presentation */}
      {(() => {
        const item = topicsDetail[activeTab];
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Main Content Double-Bezel Card */}
            <DoubleBezelCard className="bg-white border-slate-200/90 shadow-sm">
              <div className="space-y-5">
                
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-brand-700 bg-brand-50 border border-brand-200/70 px-2.5 py-1 rounded-lg">
                      {item.code}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {item.title}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {item.badge}
                  </span>
                </div>

                {/* Mathematical Concept Formula Highlight Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Notasi / Rumus Kunci:
                    </span>
                    <div>
                      {item.renderFormula()}
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-medium max-w-xs leading-relaxed">
                    {item.summary}
                  </div>
                </div>

                {/* Explanation Content */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                  <h4 className="font-black text-slate-900 text-sm">Uraian Konsep Matematis:</h4>
                  <p className="whitespace-pre-line leading-relaxed">
                    {renderFormattedMathText(materials[activeTab]?.content || '', 'sm')}
                  </p>
                </div>

                {/* Visual Demonstration Bar */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-black shrink-0">
                      <PieChart size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-slate-900">Contoh Nyata Pembuktian:</div>
                      <div className="text-xs text-slate-600 font-medium">{item.renderExample()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowFillButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('siswa/studio')}
                    >
                      Buka di Studio
                    </ArrowFillButton>
                    <ArrowFillButton
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate('siswa/lkpd')}
                    >
                      Kerjakan LKPD
                    </ArrowFillButton>
                  </div>
                </div>

              </div>
            </DoubleBezelCard>

          </div>
        );
      })()}

    </div>
  );
};

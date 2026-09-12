import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fraction, renderFormattedMathText } from '@/components/ui/fraction';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  PieChart,
  ArrowRight,
  FileText,
  Download,
  Lightbulb,
  Image as ImageIcon,
  Eye,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Material } from '@/types';

export const SiswaMateri: React.FC<{
  onNavigate: (route: string) => void;
}> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>(storageService.getState().materials || []);
  const [previewItem, setPreviewItem] = useState<{
    title: string;
    url: string;
    type: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    setMaterials(storageService.getState().materials || []);
    const unsub = storageService.subscribe(state => {
      setMaterials(state.materials || []);
    });

    const user = storageService.getCurrentSessionUser();
    if (user && user.role === 'siswa') {
      storageService.update(draft => {
        const u = draft.users.find(usr => usr.id === user.id);
        if (u) {
          if (!u.progress) u.progress = { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 };
          u.progress.materi = 100;
        }
      });
    }

    return () => unsub();
  }, []);

  const topicsDetail = [
    {
      code: 'BAB 1.1',
      title: 'Konsep Dasar & Arti Pecahan',
      badge: 'Fondasi',
      summary: 'Pecahan merepresentasikan bagian dari keseluruhan atau rasio himpunan dengan syarat penyebut b ≠ 0.',
      renderFormula: () => (
        <div className="flex items-center gap-4 text-lg font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <Fraction num="a" den="b" size="lg" className="text-slate-950 dark:text-slate-100" />
          <div className="text-xs text-slate-700 dark:text-slate-300 font-bold space-y-0.5">
            <p><span className="text-amber-600 dark:text-amber-400 font-black">a (Pembilang):</span> Bagian yang diambil / terarsir</p>
            <p><span className="text-sky-600 dark:text-sky-400 font-black">b (Penyebut):</span> Total bagian utuh sama rata (b ≠ 0)</p>
          </div>
        </div>
      ),
      renderExample: () => (
        <div className="space-y-2 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <p>Jika 1 loyang pizza dipotong menjadi 8 bagian sama besar dan kamu memakan 3 potong:</p>
          <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950">
            <span>Bagian pizza termakan =</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 border border-slate-950 font-black">
              <Fraction num="3" den="8" size="sm" />
            </span>
            <span className="text-xs text-slate-500">(3 dari total 8 porsi)</span>
          </div>
        </div>
      ),
      visualType: 'pizza',
      visualData: { n: 3, d: 8 },
    },
    {
      code: 'BAB 1.2',
      title: 'Jenis-Jenis Pecahan di Kelas 7',
      badge: 'Klasifikasi',
      summary: 'Mengenal karakteristik pecahan biasa, pecahan campuran, desimal persepuluhan, dan persen.',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase">Campuran:</span>
          <Fraction whole="w" num="n" den="d" size="md" />
          <span>=</span>
          <Fraction num="(w × d + n)" den="d" size="md" />
        </div>
      ),
      renderExample: () => (
        <div className="flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm">
          <span className="px-2 py-0.5 rounded-lg bg-sky-200 text-slate-950 border-2 border-slate-950">
            <Fraction num="7" den="4" size="sm" />
          </span>
          <span>diubah menjadi bentuk campuran:</span>
          <span className="px-2 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 border-2 border-slate-950 font-black">
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
      summary: 'Pecahan senilai memiliki rasio proporsi setara yang diperoleh melalui perkalian/pembagian faktor pengali sama.',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <Fraction num="a × k" den="b × k" size="md" />
          <span>=</span>
          <Fraction num="a" den="b" size="md" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">(Faktor pengali k ≠ 0)</span>
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
          <span className="text-xs text-slate-500 dark:text-slate-400">(Hasil pengali 2 dan 4)</span>
        </div>
      ),
      visualType: 'equivalent',
      visualData: { pairs: ['2/3', '4/6', '8/12'] },
    },
    {
      code: 'BAB 1.4',
      title: 'Operasi Penjumlahan & Pengurangan',
      badge: 'Operasi Hitung',
      summary: 'Menyamakan penyebut berbeda menggunakan Kelipatan Persekutuan Terkecil (KPK) sebelum mengoperasikan pembilang.',
      renderFormula: () => (
        <div className="flex items-center gap-3 text-base sm:text-lg font-black text-slate-950 dark:text-slate-100 flex-wrap">
          <Fraction num="a" den="c" size="md" />
          <span>±</span>
          <Fraction num="b" den="d" size="md" />
          <span>=</span>
          <Fraction num="(a×k₁ ± b×k₂)" den="KPK(c, d)" size="md" />
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
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      
      {/* 1. Header Banner Pure Neobrutalism */}
      <div className="relative rounded-3xl bg-[#38bdf8] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-black text-8xl pointer-events-none select-none">
          MATERI
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#0f172a]">
                MODUL TEORI &amp; KONSEP DASAR
              </span>
              <span className="px-3 py-1 bg-white/90 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold">
                Kurikulum Merdeka Kelas 7 SMP
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 leading-tight">
              Materi Pembelajaran Bilangan Pecahan
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Pelajari definisi formal, ragam bentuk pecahan, metode penyederhanaan FPB, serta operasi hitung berbasis KPK secara runtut dan visual.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <BookOpen size={34} />
          </div>
        </div>
      </div>

      {/* 2. Sub-Topic Selection Pills (Sleek High-Contrast Tabs) */}
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
              className={`p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'bg-[#ffe600] text-slate-950 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-amber-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-950 dark:border-slate-700 text-[10px] font-black text-slate-950 dark:text-slate-100">
                  {t.code}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
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

      {/* 3. Main Material Detail Card (Double-Bezel Architecture) */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
        
        {/* Topic Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-slate-950 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#a3e635] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {currentTopic.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#c084fc] text-slate-950 font-black text-xs border-2 border-slate-950">
                {currentTopic.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 mt-2">
              {currentTopic.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
              {currentTopic.summary}
            </p>
          </div>
        </div>

        {/* Formula / Concept Rule Box */}
        <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            <Lightbulb size={16} className="text-amber-500" />
            <span>Rumus &amp; Definisi Formal:</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 overflow-x-auto shadow-inner">
            {currentTopic.renderFormula()}
          </div>
        </div>

        {/* Concrete Example Box */}
        <div className="p-5 rounded-2xl bg-[#e0f2fe] dark:bg-sky-950/40 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            <CheckCircle2 size={16} className="text-sky-600 dark:text-sky-400" />
            <span>Contoh Kasus &amp; Penyelesaian:</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700">
            {currentTopic.renderExample()}
          </div>
        </div>

        {/* Supplementary Materials & Files from Teacher (Compact & Sleek) */}
        {materials && materials.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf4ff] dark:bg-purple-950/30 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-200 border-2 border-slate-950 text-slate-950">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100">
                    Berkas &amp; Modul Tambahan dari Guru
                  </h3>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Unduh rangkuman PDF, infografis gambar, atau modul pendukung materi pecahan
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-200 text-purple-950 border border-slate-950 text-[10px] font-black">
                {materials.length} Berkas Tersedia
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {materials.map((m: Material) => {
                const isPdf = m.fileType?.includes('pdf') || m.fileName?.endsWith('.pdf');
                const isImage = m.fileType?.startsWith('image/') || m.fileName?.match(/\.(png|jpe?g|webp|svg)$/i);

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex flex-col justify-between gap-3 transition-all hover:translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-black text-[10px] border border-slate-950">
                          {m.badge}
                        </span>
                        {isPdf ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-400 text-[10px] font-black flex items-center gap-1">
                            <FileText size={11} /> PDF
                          </span>
                        ) : isImage ? (
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-400 text-[10px] font-black flex items-center gap-1">
                            <ImageIcon size={11} /> GAMBAR
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-black text-xs sm:text-sm text-slate-950 dark:text-slate-100 leading-snug line-clamp-1">
                        {m.title}
                      </h4>

                      {m.content && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold line-clamp-2">
                          {m.content}
                        </p>
                      )}

                      {/* Image Thumbnail if attached */}
                      {isImage && m.fileUrl && (
                        <div
                          onClick={() => setPreviewItem({ title: m.title, url: m.fileUrl!, type: 'image', name: m.fileName })}
                          className="relative h-24 rounded-xl overflow-hidden border-2 border-slate-950 group cursor-pointer"
                        >
                          <img
                            src={m.fileUrl}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-black text-[11px]">
                            <Eye size={14} />
                            <span>Perbesar Gambar</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {m.fileName || 'Modul Guru'} {m.fileSize ? `• ${m.fileSize}` : ''}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.fileUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewItem({
                              title: m.title,
                              url: m.fileUrl!,
                              type: isPdf ? 'pdf' : 'image',
                              name: m.fileName
                            })}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-950 dark:text-slate-100 border border-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                        )}

                        <a
                          href={m.fileUrl || '#'}
                          download={m.fileName || `${m.title}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border border-slate-950 text-[11px] font-black shadow-[1px_1px_0px_0px_#0f172a] flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>Unduh</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Lightbox / Preview Modal for Students */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`Pratinjau Materi: ${previewItem.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {previewItem.type === 'image' ? (
              <div className="rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={previewItem.url}
                  alt={previewItem.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-rose-600" />
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {previewItem.name || 'Dokumen PDF Modul Guru'}
                    </span>
                  </div>
                  <a
                    href={previewItem.url}
                    download={previewItem.name || 'modul-materi.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400 flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Buka / Unduh File Penuh</span>
                  </a>
                </div>
                <iframe
                  src={previewItem.url}
                  title={previewItem.title}
                  className="w-full h-[65vh] rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-white"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white font-black text-xs border-2 border-slate-950 cursor-pointer hover:bg-slate-800"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};


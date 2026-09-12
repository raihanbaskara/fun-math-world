import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { Modal } from '@/components/ui/modal';
import { DocumentPreviewModal, DocumentPreviewItem } from '@/components/ui/DocumentPreviewModal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ArrowLeft,
  FileText,
  Download,
  Lightbulb,
  Image as ImageIcon,
  Eye,
  Layers,
  ChevronRight,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { Material } from '@/types';

export const SiswaMateri: React.FC<{
  onNavigate: (route: string) => void;
}> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>(storageService.getState().materials || []);
  const [previewItem, setPreviewItem] = useState<DocumentPreviewItem | null>(null);

  useEffect(() => {
    const loadData = () => {
      const state = storageService.getState();
      setMaterials(state.materials || []);
    };

    loadData();
    const unsub = storageService.subscribe(() => {
      loadData();
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

  // Safe bounds check for activeTab
  const currentChapter: Material | undefined = materials[activeTab] || materials[0];

  const isPdf = currentChapter?.fileType?.includes('pdf') || currentChapter?.fileName?.endsWith('.pdf');
  const isImage = currentChapter?.fileType?.startsWith('image/') || currentChapter?.fileName?.match(/\.(png|jpe?g|webp|svg)$/i);

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
              Pelajari definisi formal, ragam bentuk pecahan, metode penyederhanaan FPB, serta operasi hitung berbasis KPK secara runtut, interaktif, dan visual.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <BookOpen size={34} />
          </div>
        </div>
      </div>

      {/* 2. Sub-Topic Selection Pills (Dynamic Chapters from Database) */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {materials.map((m, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={m.id || idx}
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
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-950 dark:border-slate-700 text-[10px] font-black text-slate-950 dark:text-slate-100">
                    {m.chapterCode || `BAB 1.${idx + 1}`}
                  </span>
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                    {m.badge || 'Modul'}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-slate-100 line-clamp-2 leading-snug">
                  {m.title}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a]">
          <p className="text-sm font-black text-slate-700 dark:text-slate-300">
            Belum ada bab materi yang terdaftar.
          </p>
        </div>
      )}

      {/* 3. Main Chapter Card (Unified per-chapter theory, formulas, examples, and files) */}
      {currentChapter && (
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
          
          {/* Chapter Title, Badges & Summary */}
          <div className="space-y-3 pb-5 border-b-3 border-slate-950/15 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#a3e635] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {currentChapter.chapterCode || `BAB 1.${activeTab + 1}`}
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950">
                {currentChapter.badge || 'Teori Inti'}
              </span>
              {isPdf && (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-950 border border-slate-950 text-[11px] font-black flex items-center gap-1">
                  <FileText size={12} /> Modul PDF Tersedia
                </span>
              )}
              {isImage && (
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-950 border border-slate-950 text-[11px] font-black flex items-center gap-1">
                  <ImageIcon size={12} /> Gambar Infografis
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 dark:text-slate-100 leading-tight">
              {currentChapter.title}
            </h2>

            {currentChapter.summary && (
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentChapter.summary}
              </p>
            )}
          </div>

          {/* Uraian Teori & Penjelasan Konsep */}
          {currentChapter.content && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-100">
                <GraduationCap size={16} className="text-[#38bdf8]" />
                <span>Uraian Penjelasan Konsep:</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {renderFormattedMathText(currentChapter.content, 'sm')}
              </div>
            </div>
          )}

          {/* Formula / Concept Rule Box */}
          {currentChapter.formula && (
            <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-amber-950/20 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-100">
                <Lightbulb size={16} className="text-amber-500" />
                <span>Rumus &amp; Kaidah Matematis:</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 overflow-x-auto shadow-inner">
                <div className="text-sm sm:text-base font-black text-slate-950 dark:text-slate-100">
                  {renderFormattedMathText(currentChapter.formula, 'md')}
                </div>
              </div>
            </div>
          )}

          {/* Concrete Example Box */}
          {currentChapter.exampleCase && (
            <div className="p-5 rounded-2xl bg-[#e0f2fe] dark:bg-sky-950/40 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-100">
                <CheckCircle2 size={16} className="text-sky-600 dark:text-sky-400" />
                <span>Contoh Kasus &amp; Penyelesaian:</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 leading-relaxed">
                <div className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100">
                  {renderFormattedMathText(currentChapter.exampleCase, 'sm')}
                </div>
              </div>
            </div>
          )}

          {/* Dedicated File Attachment for THIS chapter (PDF / Image) */}
          {(currentChapter.fileName || currentChapter.fileUrl) && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fdf4ff] dark:bg-purple-950/30 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-200 border-2 border-slate-950 text-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    {isPdf ? <FileText size={18} /> : <ImageIcon size={18} />}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100">
                      Lampiran Berkas Pendukung Bab Ini
                    </h3>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Materi dan berkas referensi khusus untuk {currentChapter.chapterCode || 'bab ini'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-purple-200 text-purple-950 border border-slate-950 text-[10px] font-black">
                  {isPdf ? 'Dokumen PDF' : isImage ? 'Gambar / Infografis' : 'Berkas Guru'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 border-2 border-slate-950 flex items-center justify-center shrink-0">
                      {isPdf ? <FileText size={20} className="text-rose-600" /> : <ImageIcon size={20} className="text-sky-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100 truncate max-w-[250px] sm:max-w-md">
                        {currentChapter.fileName || `${currentChapter.title}.${isPdf ? 'pdf' : 'png'}`}
                      </p>
                      {currentChapter.fileSize && (
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Ukuran: {currentChapter.fileSize}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for active chapter's file */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewItem({
                        title: currentChapter.title,
                        url: currentChapter.fileUrl,
                        type: isPdf ? 'pdf' : 'image',
                        name: currentChapter.fileName,
                        chapterCode: currentChapter.chapterCode,
                        badge: currentChapter.badge,
                        summary: currentChapter.summary,
                        content: currentChapter.content,
                        formula: currentChapter.formula,
                        exampleCase: currentChapter.exampleCase,
                        fileSize: currentChapter.fileSize
                      })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-950 dark:text-slate-100 border-2 border-slate-950 text-xs font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Pratinjau Berkas</span>
                    </button>

                    <a
                      href={currentChapter.fileUrl || '#'}
                      download={currentChapter.fileName || `${currentChapter.title}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Unduh File</span>
                    </a>
                  </div>
                </div>

                {/* Inline Image Thumbnail if image attached */}
                {isImage && currentChapter.fileUrl && (
                  <div
                    onClick={() => setPreviewItem({
                      title: currentChapter.title,
                      url: currentChapter.fileUrl,
                      type: 'image',
                      name: currentChapter.fileName,
                      chapterCode: currentChapter.chapterCode,
                      badge: currentChapter.badge,
                      summary: currentChapter.summary,
                      content: currentChapter.content,
                      formula: currentChapter.formula,
                      exampleCase: currentChapter.exampleCase,
                      fileSize: currentChapter.fileSize
                    })}
                    className="relative h-44 sm:h-52 rounded-xl overflow-hidden border-2 border-slate-950 bg-slate-900 group cursor-pointer shadow-inner"
                  >
                    <img
                      src={currentChapter.fileUrl}
                      alt={currentChapter.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-black text-xs">
                      <Eye size={16} />
                      <span>Klik untuk Perbesar Gambar Infografis</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chapter Navigation Bar (Prev / Next Chapter) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t-3 border-slate-950/15 dark:border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={activeTab === 0}
                onClick={() => {
                  soundService.click();
                  setActiveTab(prev => Math.max(0, prev - 1));
                }}
                className="flex-1 sm:flex-initial font-black text-xs"
              >
                <ArrowLeft size={14} />
                <span>Bab Sebelumnya</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={activeTab >= materials.length - 1}
                onClick={() => {
                  soundService.click();
                  setActiveTab(prev => Math.min(materials.length - 1, prev + 1));
                }}
                className="flex-1 sm:flex-initial font-black text-xs"
              >
                <span>Bab Selanjutnya</span>
                <ArrowRight size={14} />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-initial font-black text-xs"
                onClick={() => onNavigate('siswa/studio')}
              >
                <PieChart size={15} />
                <span>Studio Pizza</span>
              </Button>

              <Button
                variant="yellow"
                size="sm"
                className="flex-1 sm:flex-initial font-black text-xs"
                onClick={() => onNavigate('siswa/lkpd')}
              >
                <span>LKPD Digital</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* Lightbox / Document Preview Modal for Students */}
      <DocumentPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

    </div>
  );
};

export default SiswaMateri;


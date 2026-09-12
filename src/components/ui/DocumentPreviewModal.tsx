import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { getSafePreviewUrl } from '@/utils/pdfUtils';
import { renderFormattedMathText } from '@/components/ui/fraction';
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Eye,
  Image as ImageIcon,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Printer,
  X,
  GraduationCap
} from 'lucide-react';

export interface DocumentPreviewItem {
  title: string;
  url?: string;
  type: 'pdf' | 'image' | string;
  name?: string;
  chapterCode?: string;
  badge?: string;
  summary?: string;
  content?: string;
  formula?: string;
  exampleCase?: string;
  fileSize?: string;
}

export const DocumentPreviewModal: React.FC<{
  item: DocumentPreviewItem | null;
  onClose: () => void;
}> = ({ item, onClose }) => {
  // Default to 'reader' so students & teachers immediately see the rich digital paper sheet
  const [activeView, setActiveView] = useState<'reader' | 'pdf'>('reader');
  const [safeUrl, setSafeUrl] = useState<string>('');

  useEffect(() => {
    if (item?.url) {
      const mime = item.type === 'image' ? 'image/jpeg' : 'application/pdf';
      const resolved = getSafePreviewUrl(item.url, mime);
      setSafeUrl(resolved);
    } else {
      setSafeUrl('');
    }
    setActiveView('reader');
  }, [item]);

  if (!item) return null;

  const isPdf = item.type === 'pdf' || item.name?.endsWith('.pdf') || !item.type?.startsWith('image/');
  const isImage = item.type === 'image' || item.type?.startsWith('image/') || item.name?.match(/\.(png|jpe?g|webp|svg)$/i);

  const handleOpenNewTab = () => {
    if (safeUrl) {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isImage ? "Pratinjau Infografis: " + item.title : "Modul Pembelajaran: " + item.title}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 font-sans">
        {/* Top Actions & Subheader Bar */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
              {isPdf ? <FileText size={22} className="text-rose-600" /> : <ImageIcon size={22} className="text-sky-600" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.chapterCode && (
                  <span className="px-2 py-0.5 rounded-md bg-[#a3e635] text-slate-950 font-black text-[10px] border border-slate-950">
                    {item.chapterCode}
                  </span>
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-[#ffe600] text-slate-950 font-black text-[10px] border border-slate-950">
                    {item.badge}
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {item.fileSize || 'Kurikulum Merdeka'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100 truncate mt-0.5">
                {item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {safeUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-950 dark:text-slate-100 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <ExternalLink size={13} />
                <span>Buka Tab Penuh</span>
              </button>
            )}

            {safeUrl && (
              <a
                href={safeUrl}
                download={item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Download size={13} />
                <span>Unduh File</span>
              </a>
            )}
          </div>
        </div>

        {/* PDF Mode: View Switcher Tabs */}
        {isPdf && (
          <div className="flex items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('reader')}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 " + (
                  activeView === 'reader'
                    ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950'
                )}
              >
                <BookOpen size={14} />
                <span>Lembar Pembaca Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('pdf')}
                className={"px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 " + (
                  activeView === 'pdf'
                    ? 'bg-[#38bdf8] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950'
                )}
              >
                <FileText size={14} />
                <span>Tampilan File PDF</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-slate-200"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        {isImage ? (
          <div className="rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-950 flex items-center justify-center p-2 min-h-[50vh]">
            <img
              src={safeUrl || item.url}
              alt={item.title}
              className="max-h-[65vh] w-auto object-contain rounded-xl"
            />
          </div>
        ) : isPdf && activeView === 'pdf' && safeUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-inner">
            <iframe
              src={safeUrl}
              title={item.title}
              className="w-full h-[65vh] rounded-xl bg-white border-0"
            />
          </div>
        ) : (
          /* High-End Digital Paper Reader View */
          <div className="max-h-[65vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-inner space-y-6">
            
            {/* Header / Kop Modul */}
            <div className="border-b-3 border-slate-950/15 dark:border-slate-800 pb-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#a3e635] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    {item.chapterCode || 'MODUL MATERI'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950">
                    {item.badge || 'Kurikulum Merdeka'}
                  </span>
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                  SMP Negeri Malang • Matematika Kelas 7
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 leading-tight">
                {item.title}
              </h3>

              {item.summary && (
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-950/20">
                  {item.summary}
                </p>
              )}
            </div>

            {/* Uraian Teori & Konsep */}
            {item.content && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[#38bdf8]" />
                  <span>A. Uraian Penjelasan Konsep &amp; Teori:</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-950 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {renderFormattedMathText(item.content, 'sm')}
                </div>
              </div>
            )}

            {/* Rumus Kaidah Matematis */}
            {item.formula && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <Lightbulb size={15} className="text-amber-500" />
                  <span>B. Rumus / Kaidah Matematis Utama:</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#fffdf5] dark:bg-amber-950/20 border-2 border-slate-950 dark:border-slate-700 text-sm sm:text-base font-black text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a]">
                  {renderFormattedMathText(item.formula, 'md')}
                </div>
              </div>
            )}

            {/* Contoh Kasus & Pembahasan */}
            {item.exampleCase && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-sky-500" />
                  <span>C. Contoh Kasus &amp; Penyelesaian Nyata:</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#e0f2fe] dark:bg-sky-950/40 border-2 border-slate-950 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-relaxed shadow-[2px_2px_0px_0px_#0f172a]">
                  {renderFormattedMathText(item.exampleCase, 'sm')}
                </div>
              </div>
            )}

            {/* Official Module Footer */}
            <div className="pt-4 border-t-2 border-dashed border-slate-950/20 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Fun Math World • Media Pembelajaran Interaktif SMP</span>
              <span>Hak Cipta © 2026 Tim Pengembang</span>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {isPdf ? 'Gunakan tombol unduh jika ingin menyimpan modul untuk belajar luring.' : 'Gambar beresolusi penuh.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-950 text-white font-black text-xs border-2 border-slate-950 cursor-pointer hover:bg-slate-800"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
};

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
  X
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
  const [activeView, setActiveView] = useState<'pdf' | 'reader'>('pdf');
  const [safeUrl, setSafeUrl] = useState<string>('');

  useEffect(() => {
    if (item?.url) {
      const mime = item.type === 'image' ? 'image/jpeg' : 'application/pdf';
      const resolved = getSafePreviewUrl(item.url, mime);
      setSafeUrl(resolved);
    } else {
      setSafeUrl('');
    }
  }, [item]);

  if (!item) return null;

  const isPdf = item.type === 'pdf' || item.name?.endsWith('.pdf') || !item.type?.startsWith('image/');
  const isImage = item.type === 'image' || item.type?.startsWith('image/') || item.name?.match(/\.(png|jpe?g|webp|svg)$/i);

  const handleOpenNewTab = () => {
    if (safeUrl) {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isImage ? "Pratinjau Infografis: " + item.title : "Pratinjau Modul: " + item.title}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Top Actions & Subheader Bar */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/90 border-3 border-slate-950 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#0f172a]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 flex items-center justify-center shrink-0">
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
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100 truncate mt-0.5">
                {item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {safeUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-950 dark:text-slate-100 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Buka Tab Baru</span>
              </button>
            )}

            {safeUrl && (
              <a
                href={safeUrl}
                download={item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Unduh File</span>
              </a>
            )}
          </div>
        </div>

        {/* PDF Mode: Tab Switcher */}
        {isPdf && (
          <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveView('pdf')}
              className={"px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 " + (
                activeView === 'pdf'
                  ? 'bg-[#38bdf8] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950'
              )}
            >
              <FileText size={14} />
              <span>Dokumen PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('reader')}
              className={"px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 " + (
                activeView === 'reader'
                  ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950'
              )}
            >
              <BookOpen size={14} />
              <span>Lembar Pembaca Digital</span>
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
            <object
              data={safeUrl}
              type="application/pdf"
              className="w-full h-[65vh] rounded-xl bg-white"
            >
              {/* Fallback if browser PDF plugin is blocked or unavailable */}
              <div className="p-8 text-center space-y-4 flex flex-col items-center justify-center h-full bg-white dark:bg-slate-900">
                <div className="w-16 h-16 rounded-2xl bg-amber-200 border-3 border-slate-950 flex items-center justify-center text-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
                  <FileText size={30} className="text-rose-600" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-black text-sm text-slate-950 dark:text-slate-100">
                    Pratinjau PDF di Browser Anda
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Browser Anda mengarahkan tampilan PDF ke tab baru atau belum mengaktifkan plugin PDF inline.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="px-4 py-2 rounded-xl bg-[#38bdf8] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-sky-400 cursor-pointer"
                  >
                    Buka Dokumen PDF di Tab Penuh
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('reader')}
                    className="px-4 py-2 rounded-xl bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer"
                  >
                    Buka Lembar Pembaca Digital
                  </button>
                </div>
              </div>
            </object>
          </div>
        ) : (
          /* Digital Paper Reader View (100% reliable across all browsers & devices) */
          <div className="max-h-[65vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-inner space-y-6">
            <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#a3e635] text-slate-950 font-black text-xs border-2 border-slate-950">
                  {item.chapterCode || 'MODUL MATERI'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950">
                  {item.badge || 'Kurikulum Merdeka'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100">
                {item.title}
              </h3>
              {item.summary && (
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  {item.summary}
                </p>
              )}
            </div>

            {item.content && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Uraian Konsep &amp; Penjelasan:</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {renderFormattedMathText(item.content, 'sm')}
                </div>
              </div>
            )}

            {item.formula && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Rumus / Kaidah Matematis:</span>
                </h4>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-slate-800 border-2 border-slate-950 text-sm font-black text-slate-950 dark:text-slate-100">
                  {renderFormattedMathText(item.formula, 'md')}
                </div>
              </div>
            )}

            {item.exampleCase && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sky-500" />
                  <span>Contoh Kasus &amp; Penyelesaian:</span>
                </h4>
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-slate-800 border-2 border-slate-950 text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100">
                  {renderFormattedMathText(item.exampleCase, 'sm')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
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

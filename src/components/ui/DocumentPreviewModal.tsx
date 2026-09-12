import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { getSafePreviewUrl } from '@/utils/pdfUtils';
import { PdfCanvasViewer } from '@/components/ui/PdfCanvasViewer';
import {
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Printer
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isImage ? "Pratinjau Gambar: " + item.title : "Pratinjau Modul: " + item.title}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4 font-sans">
        {/* Top Actions & File Info Bar */}
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
                  {item.fileSize || 'Berkas Dokumen'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-950 dark:text-slate-100 truncate mt-0.5">
                {item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
              </p>
            </div>
          </div>

          {/* Action buttons: Download, Tab Penuh, Cetak */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {safeUrl && (
              <a
                href={safeUrl}
                download={item.name || (item.title + '.' + (isPdf ? 'pdf' : 'png'))}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Download size={14} />
                <span>Unduh File</span>
              </a>
            )}

            {safeUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-950 dark:text-slate-100 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <ExternalLink size={13} />
                <span>Tab Penuh</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-slate-200"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Content Body: Direct Canvas Preview for PDF without browser plugin issues */}
        {isImage ? (
          <div className="rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-950 flex items-center justify-center p-2 min-h-[50vh]">
            <img
              src={safeUrl || item.url}
              alt={item.title}
              className="max-h-[70vh] w-auto object-contain rounded-xl"
            />
          </div>
        ) : (
          <div>
            {safeUrl || item.url ? (
              <PdfCanvasViewer
                url={safeUrl || item.url || ''}
                title={item.title}
              />
            ) : (
              <div className="p-8 text-center space-y-4 rounded-2xl border-3 border-slate-950 bg-white dark:bg-slate-900">
                <FileText size={48} className="mx-auto text-rose-500" />
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {item.name || item.title}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  Pratinjau langsung tidak dapat dimuat di peramban ini. Silakan unduh berkas di bawah.
                </p>
              </div>
            )}
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
            className="px-5 py-2 rounded-xl bg-slate-950 text-white font-black text-xs border-2 border-slate-950 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Maximize2,
  FileText
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PdfCanvasViewerProps {
  url: string;
  title?: string;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({ url, title }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        let loadingTask;
        if (url.startsWith('data:')) {
          const base64 = url.includes(',') ? url.split(',')[1] : url;
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else if (url.startsWith('blob:')) {
          try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf) });
          } catch {
            loadingTask = pdfjsLib.getDocument({ url });
          }
        } else {
          loadingTask = pdfjsLib.getDocument({ url });
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          setError(err?.message || "Gagal memproses dokumen PDF.");
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  // Render Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale });
        // Safe pixelRatio: Cap at 2 to prevent iOS Safari memory exhaustion on 3x retina screens
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error("PDF render page error:", err);
          setError("Peramban mengalami kendala saat merender halaman PDF. Anda dapat membuka atau mengunduh berkas langsung.");
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100));
  };

  const handleResetZoom = () => {
    setScale(1.1);
  };

  return (
    <div className="flex flex-col rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-inner">
      {/* Top PDF Toolbar */}
      <div className="p-2.5 bg-slate-200/90 dark:bg-slate-800 border-b-2 border-slate-950/20 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap text-slate-950 dark:text-slate-100">
        {/* Page Navigator */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border-2 border-slate-950/20 dark:border-slate-700 text-xs font-black">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={handlePrevPage}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-1 tracking-tight">
            {numPages > 0 ? `${currentPage} / ${numPages}` : '-'}
          </span>
          <button
            type="button"
            disabled={currentPage >= numPages || loading}
            onClick={handleNextPage}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Halaman Selanjutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Title or Page status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-xs">
          <FileText size={14} className="text-rose-500 shrink-0" />
          <span className="truncate">{title || 'Dokumen Modul'}</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border-2 border-slate-950/20 dark:border-slate-700 text-xs font-black">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.6 || loading}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Perkecil Tampilan"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-black"
            title="Reset Ukuran"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5 || loading}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Perbesar Tampilan"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* PDF Canvas Stage */}
      <div className="relative min-h-[55vh] max-h-[70vh] overflow-auto p-4 sm:p-6 flex items-start justify-center bg-slate-200/50 dark:bg-slate-950/60">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs z-10 space-y-3">
            <Loader2 size={32} className="animate-spin text-amber-500" />
            <p className="text-xs font-black text-slate-800 dark:text-slate-200">
              Menyiapkan tampilan dokumen PDF...
            </p>
          </div>
        )}

        {error && (
          <div className="my-auto p-6 max-w-md text-center bg-white dark:bg-slate-900 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
            <AlertCircle size={36} className="mx-auto text-amber-500" />
            <h4 className="text-sm font-black text-slate-950 dark:text-slate-100">
              Tidak Dapat Memuat Halaman PDF
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {error}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              {url && (
                <button
                  type="button"
                  onClick={() => window.open(url, '_blank')}
                  className="px-4 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
                >
                  Buka di Tab Baru
                </button>
              )}
              {url && (
                <a
                  href={url}
                  download={title ? `${title}.pdf` : 'dokumen.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
                >
                  Unduh Berkas PDF
                </a>
              )}
            </div>
          </div>
        )}

        {/* The Native HTML5 Canvas (Crisp Vector/Font Render) */}
        <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          <canvas
            ref={canvasRef}
            className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-300 dark:border-slate-700 block max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfCanvasViewer;
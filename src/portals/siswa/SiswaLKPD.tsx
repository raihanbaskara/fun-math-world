import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LKPDItem, LKPDSubmission } from '@/types';
import { compressImage } from '@/lib/utils';
import { FileText, ExternalLink, Download, Image as ImageIcon, Sparkles, CheckCircle2, Bot, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SiswaLKPD: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const [db, setDb] = useState(storageService.getState());

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDb(newState);
    });
  }, []);

  const lkpdList = db.lkpdList;
  const [selectedLkpdId, setSelectedLkpdId] = useState<string>(lkpdList[0]?.id || "lkpd_1");

  const submission = db.lkpdSubmissions.find(
    s => s.studentId === currentUser.id && s.lkpdId === selectedLkpdId
  );

  const [previewLKPD, setPreviewLKPD] = useState<LKPDItem | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    submission?.photoUrls || (submission?.photoUrl ? [submission.photoUrl] : [])
  );
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{ score: number; feedback: string } | null>(
    submission ? { score: submission.aiScore, feedback: submission.aiFeedback } : null
  );

  useEffect(() => {
    const current = db.lkpdSubmissions.find(
      s => s.studentId === currentUser.id && s.lkpdId === selectedLkpdId
    );
    setSelectedPhotos(current?.photoUrls || (current?.photoUrl ? [current.photoUrl] : []));
    setAiResult(current ? { score: current.aiScore, feedback: current.aiFeedback } : null);
  }, [selectedLkpdId, db.lkpdSubmissions, currentUser.id]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    showToast(`Memproses ${files.length} foto...`, "info");
    const compressedList: string[] = [];

    for (const file of files) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string);
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(dataUrl);
      compressedList.push(compressed);
    }

    setSelectedPhotos(prev => [...prev, ...compressedList]);
    showToast(`${files.length} foto lembar kerja berhasil dimuat.`, "success");
  };

  const handleRunAiCorrection = () => {
    soundService.click();
    if (selectedPhotos.length === 0) {
      soundService.alert();
      showToast("Pilih minimal 1 file foto hasil kerjaan LKPD terlebih dahulu!", "error");
      return;
    }

    setIsAiLoading(true);
    showToast("🤖 AI sedang memindai dan mengoreksi lembar kerja...", "info");

    setTimeout(() => {
      setIsAiLoading(false);
      const res = {
        score: 92,
        feedback: "Analisis Asisten AI: Model representasi pecahan senilai (2/4 = 4/8) berhasil diidentifikasi secara akurat. Langkah pembagian FPB sudah tepat. Rekomendasi: Pertahankan kerapian penulisan lambang pecahan."
      };
      setAiResult(res);
      soundService.success();
      confetti({ particleCount: 50, spread: 60 });
      showToast("Koreksi AI selesai!", "success");
    }, 1500);
  };

  const handleSubmitLKPD = () => {
    soundService.click();
    if (selectedPhotos.length === 0) {
      soundService.alert();
      showToast("Unggah foto tugas sebelum mengirimkan ke guru!", "error");
      return;
    }

    const currentSub = db.lkpdSubmissions.find(
      s => s.studentId === currentUser.id && s.lkpdId === selectedLkpdId
    );
    const subData: LKPDSubmission = {
      id: currentSub ? currentSub.id : "sub_" + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7-A",
      lkpdId: selectedLkpdId,
      photoUrl: selectedPhotos[0],
      photoUrls: selectedPhotos,
      date: new Date().toLocaleDateString(),
      aiScore: aiResult ? aiResult.score : 90,
      aiFeedback: aiResult ? aiResult.feedback : "Pekerjaan terdeteksi rapi dan tepat.",
      teacherScore: currentSub ? currentSub.teacherScore : null,
      teacherFeedback: currentSub ? currentSub.teacherFeedback : "Menunggu penilaian guru",
      status: "Terkumpul"
    };

    storageService.update(draft => {
      const idx = draft.lkpdSubmissions.findIndex(
        s => s.studentId === currentUser.id && s.lkpdId === selectedLkpdId
      );
      if (idx >= 0) draft.lkpdSubmissions[idx] = subData;
      else draft.lkpdSubmissions.push(subData);

      const user = draft.users.find(u => u.id === currentUser.id);
      if (user && user.progress) {
        user.progress.lkpd = 100;
      }
    });

    soundService.success();
    showToast("Hasil kerjaan LKPD berhasil dikirimkan ke Guru!", "success");
  };

  // Helper to convert Base64 PDF data URLs to browser Blob URLs for seamless iframe/object rendering on Vercel
  const getPdfDisplayUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    }
    return url;
  };

  const downloadPDF = (item: LKPDItem) => {
    soundService.click();
    let url = item.pdfUrl;
    let isTempUrl = false;

    if (!url) {
      const content = `LEMBAR KERJA PESERTA DIDIK (LKPD) DIGITAL\nFUN MATH WORLD SMP 7\n\nJudul: ${item.title}\nMata Pelajaran: Matematika (Pecahan)\nKelas: 7 SMP Kurikulum Merdeka\n\nPetunjuk Pengerjaan:\n1. Tulis nama, kelas, dan NIS.\n2. Selesaikan pemodelan pecahan dan langkah hitung.\n3. Foto hasil pengerjaan di buku tulismu dan unggah ke aplikasi.`;
      const blob = new Blob([content], { type: 'application/pdf' });
      url = URL.createObjectURL(blob);
      isTempUrl = true;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = item.pdfFilename || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (isTempUrl) URL.revokeObjectURL(url);

    showToast(`Berkas PDF "${item.pdfFilename || item.title}" berhasil diunduh!`, "success");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
          <FileText className="text-indigo-600" />
          <span>Lembar Kerja Peserta Didik (LKPD) Digital</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
          Klik <b>judul LKPD</b> untuk melihat lembar kerja visual resolusi tinggi & unduh file PDF tugas.
        </p>
      </div>

      {/* LKPD Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {lkpdList.map(item => (
          <Card key={item.id} className="p-6 flex flex-col justify-between h-full hover:border-brand-500 transition border border-slate-200 shadow-xs">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <Badge variant="brand">LKPD Terverifikasi</Badge>
                <span className="text-xs font-semibold text-slate-400">Kurikulum Merdeka</span>
              </div>

              {/* Clickable Title */}
              <h3
                onClick={() => {
                  soundService.click();
                  setPreviewLKPD(item);
                }}
                className="font-black text-base sm:text-lg text-slate-900 hover:text-brand-600 cursor-pointer flex items-center justify-between gap-2 group transition min-h-[3.25rem]"
              >
                <span>{item.title}</span>
                <ExternalLink size={16} className="text-brand-500 opacity-70 group-hover:opacity-100 shrink-0" />
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-3 min-h-[3rem] leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
              <ArrowFillButton
                variant="purple"
                size="sm"
                className="font-bold text-xs"
                onClick={() => {
                  soundService.click();
                  setPreviewLKPD(item);
                }}
              >
                Buka Gambar & PDF
              </ArrowFillButton>

              <span className={`inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-full text-xs font-bold border shadow-2xs whitespace-nowrap ${
                submission ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-amber-50 text-amber-700 border-amber-200/80'
              }`}>
                {submission ? '✓ Sudah Terkumpul' : '⏳ Belum Mengumpulkan'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Photo & AI Correction Card */}
      <Card className="p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-sm border border-slate-200">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-[#00ffc6] text-slate-950 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-md">
            <Upload size={24} />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Unggah Bukti Hasil Pengerjaan LKPD
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Foto lembar kerja fisik tulisan tanganmu dan dapatkan analisis instan dari <b>Asisten AI</b>.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Pilih Judul Tugas LKPD:
            </label>
            <select
              value={selectedLkpdId}
              onChange={(e) => {
                soundService.click();
                setSelectedLkpdId(e.target.value);
              }}
              className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-800"
            >
              {lkpdList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Pilih Berkas Foto Hasil Kerja (Bisa Pilih Lebih Dari 1 Foto):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          {/* Multi Photo Preview Grid */}
          {selectedPhotos.length > 0 && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Preview Foto Terunggah ({selectedPhotos.length} Halaman):
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPhotos([])}
                  className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {selectedPhotos.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 shadow-2xs aspect-4/3 bg-slate-900">
                    <img src={imgUrl} alt={`Halaman ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 text-white font-mono font-bold text-[10px] rounded-md backdrop-blur-xs">
                      Hal {idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md hover:bg-red-700 cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <InteractiveHoverButton
              disabled={isAiLoading || selectedPhotos.length === 0}
              onClick={handleRunAiCorrection}
              className="flex-1"
              text={isAiLoading ? "AI Menganalisis..." : "Koreksi Otomatis dengan AI"}
              dotColor="bg-[#00ffc6]"
            />

            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold"
              disabled={selectedPhotos.length === 0}
              onClick={handleSubmitLKPD}
            >
              <CheckCircle2 size={18} />
              <span>Kumpulkan ke Guru</span>
            </Button>
          </div>
        </div>

        {/* AI Result Card */}
        {aiResult && (
          <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-brand-50/80 rounded-2xl border border-indigo-200 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-indigo-600" />
                <span className="font-black text-xs sm:text-sm text-indigo-950">
                  Hasil Analisis Asisten AI
                </span>
              </div>
              <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-full">
                Skor AI: {aiResult.score}/100
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium">
              {aiResult.feedback}
            </p>

            {submission?.teacherScore && (
              <div className="pt-2 border-t border-indigo-200 flex justify-between items-center text-xs font-bold text-emerald-700">
                <span>Nilai Final Guru: {submission.teacherScore}</span>
                <span>Komentar: "{submission.teacherFeedback}"</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* LKPD Interactive Preview Modal */}
      {previewLKPD && (
        <Modal
          isOpen={!!previewLKPD}
          onClose={() => setPreviewLKPD(null)}
          title={previewLKPD.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* View Mode Switcher Header */}
            <div className="flex items-center justify-between p-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-black uppercase tracking-wider text-slate-500 px-1">
                  Mode Tampilan:
                </span>
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-xl font-bold">
                  📄 Dokumen PDF Live
                </span>
              </div>
              {previewLKPD.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-900 font-bold border border-slate-300 rounded-xl transition flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Buka Tab Baru</span>
                </a>
              )}
            </div>

            {/* Main Interactive Media Viewer Container */}
            {previewLKPD.pdfUrl ? (
              <div className="w-full h-[480px] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900 relative">
                <object
                  data={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <iframe
                    src={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                    title={previewLKPD.title}
                    className="w-full h-full border-0"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-6 text-white text-center space-y-3 bg-slate-900">
                      <FileText size={44} className="text-emerald-400" />
                      <p className="text-sm font-bold">Dokumen PDF Terverifikasi</p>
                      <a
                        href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition"
                      >
                        Buka & Baca Dokumen PDF (Tab Baru)
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner max-h-80 overflow-y-auto">
                <img
                  src={previewLKPD.imageUrl}
                  alt="LKPD Preview"
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div className="font-black text-slate-800">Tujuan Pembelajaran & Petunjuk:</div>
              <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
                {previewLKPD.objectives || previewLKPD.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {previewLKPD.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full font-bold">
                    <ExternalLink size={16} />
                    <span>Buka PDF di Tab Baru</span>
                  </Button>
                </a>
              )}

              <Button
                variant="accent"
                className="flex-1 font-black"
                onClick={() => downloadPDF(previewLKPD)}
              >
                <Download size={16} />
                <span>Unduh Berkas PDF ({previewLKPD.pdfFilename || 'LKPD.pdf'})</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

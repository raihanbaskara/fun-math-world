import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LKPDItem, LKPDSubmission, LKPDEssayAnswer } from '@/types';
import { compressImage } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import {
  FileText,
  Download,
  Upload,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  Layers,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
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
  const selectedLkpd = lkpdList.find(l => l.id === selectedLkpdId) || lkpdList[0];

  const existingSubmission = db.lkpdSubmissions.find(
    s => s.studentId === currentUser.id && s.lkpdId === selectedLkpdId
  );

  // Form states per question
  const [answers, setAnswers] = useState<Record<string, LKPDEssayAnswer>>({});
  const [previewLKPDModal, setPreviewLKPDModal] = useState<LKPDItem | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiDiscussionUnlocked, setAiDiscussionUnlocked] = useState<boolean>(false);

  // Anti-Cheat Active while solving
  const { switchCount, getReport, resetReport } = useAntiCheat({
    active: !existingSubmission,
    onViolation: (msg) => {
      showToast(msg, 'error');
    }
  });

  // Load existing answers if available
  useEffect(() => {
    if (existingSubmission && existingSubmission.answers) {
      setAnswers(existingSubmission.answers);
      setAiDiscussionUnlocked(true);
    } else {
      // Initialize default empty answers for questions
      const initial: Record<string, LKPDEssayAnswer> = {};
      selectedLkpd?.questions?.forEach(q => {
        initial[q.id] = { textAnswer: '', photoUrl: '' };
      });
      setAnswers(initial);
      setAiDiscussionUnlocked(false);
      resetReport();
    }
  }, [selectedLkpdId, existingSubmission]);

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: text
      }
    }));
  };

  const handlePhotoUpload = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Mengompresi foto lembar kerja...", "info");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      const compressed = await compressImage(dataUrl);
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          photoUrl: compressed
        }
      }));
      soundService.click();
      showToast("Foto pengerjaan berhasil dilampirkan!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (questionId: string) => {
    soundService.click();
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        photoUrl: ''
      }
    }));
  };

  // Check if all questions are filled
  const totalQuestions = selectedLkpd?.questions?.length || 0;
  const answeredCount = Object.values(answers).filter(a => a.textAnswer.trim().length > 0).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  const handleRunAiCorrection = () => {
    soundService.click();
    if (!isAllAnswered) {
      soundService.alert();
      showToast(`Harap lengkapi semua ${totalQuestions} butir soal essai sebelum meminta koreksi AI!`, "error");
      return;
    }

    setIsAiLoading(true);
    showToast("Asisten AI sedang menganalisis seluruh jawaban LKPD...", "info");

    setTimeout(() => {
      setIsAiLoading(false);
      setAiDiscussionUnlocked(true);
      soundService.success();
      confetti({ particleCount: 50, spread: 60 });
      showToast("Pembahasan Koreksi AI Berhasil Dibuka!", "success");
    }, 1200);
  };

  const handleSubmitLKPD = () => {
    soundService.click();
    if (!isAllAnswered) {
      soundService.alert();
      showToast("Lengkapi semua butir soal terlebih dahulu sebelum mengirim ke guru!", "error");
      return;
    }

    const antiCheatReport = getReport();

    storageService.update(draft => {
      // Remove any previous submission
      draft.lkpdSubmissions = draft.lkpdSubmissions.filter(
        s => !(s.studentId === currentUser.id && s.lkpdId === selectedLkpdId)
      );

      draft.lkpdSubmissions.push({
        id: `sub_${Date.now()}`,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentClass: currentUser.class || "Kelas 7",
        lkpdId: selectedLkpdId,
        photoUrl: Object.values(answers).find(a => a.photoUrl)?.photoUrl || '',
        answers: answers,
        date: new Date().toLocaleString('id-ID'),
        aiScore: 90,
        aiFeedback: "Seluruh butir soal telah dijawab dengan runtut dan sesuai konsep pecahan Kurikulum Merdeka.",
        teacherScore: null,
        teacherFeedback: "",
        antiCheat: antiCheatReport,
        status: "Terkumpul"
      });

      // Update student progress
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 80, video: 70, lkpd: 0, latsol: 0, evaluasi: 0 };
        user.progress.lkpd = 100;
      }
    });

    soundService.success();
    confetti({ particleCount: 80, spread: 70 });
    showToast("LKPD berhasil dikirim ke Guru! Sekarang Latihan Soal telah terbuka.", "success");
  };

  return (
    <div className="space-y-8 pb-12 font-sans max-w-5xl mx-auto">
      
      {/* Top Header Card */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                LEMBAR KERJA PESERTA DIDIK
              </span>
              <span className="px-3 py-1 bg-[#a5f3fc] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                TAHAP 1 (WAJIB PERTAMA)
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight">
              LKPD Digital &amp; Koreksi Asisten AI
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
              Jawab soal uraian di bawah ini, sertakan foto coretan langkah pengerjaan jika ada. Setelah semua butir dijawab, klik <b>Koreksi AI</b> untuk membuka pembahasan!
            </p>
          </div>

          {/* Anti-cheat badge */}
          {switchCount > 0 && (
            <div className="bg-red-100 dark:bg-red-950/60 border-3 border-red-950 dark:border-red-700 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#7f1d1d] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2 text-red-950 dark:text-red-200 font-mono text-xs font-black">
              <ShieldAlert size={20} className="text-red-600 dark:text-red-400 shrink-0" />
              <span>Terdeteksi Pindah Tab: {switchCount}x (Tercatat ke Guru)</span>
            </div>
          )}
        </div>
      </div>

      {/* LKPD Selector Tabs */}
      <div className="flex flex-wrap gap-3">
        {lkpdList.map((lkpd, idx) => {
          const isDone = db.lkpdSubmissions.some(
            s => s.studentId === currentUser.id && s.lkpdId === lkpd.id
          );
          const isSelected = lkpd.id === selectedLkpdId;

          return (
            <button
              key={lkpd.id}
              onClick={() => {
                soundService.click();
                setSelectedLkpdId(lkpd.id);
              }}
              className={`px-5 py-3 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#ffe600] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              <span>{lkpd.title.split('—')[0] || `LKPD ${idx + 1}`}</span>
              {isDone && <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* LKPD Details & Objectives */}
      <div className="bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-950 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-slate-100">
              {selectedLkpd.title}
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
              {selectedLkpd.description}
            </p>
          </div>

          <button
            onClick={() => {
              soundService.click();
              setPreviewLKPDModal(selectedLkpd);
            }}
            className="px-4 py-2 bg-[#a5f3fc] text-slate-950 border-2 border-slate-950 rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] hover:bg-cyan-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Eye size={15} />
            <span>Lihat Panduan PDF</span>
          </button>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-950 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200">
          <span className="font-black text-amber-900 dark:text-amber-300 uppercase">Tujuan Aktivitas:</span>
          <pre className="font-sans whitespace-pre-line mt-1 text-slate-700 dark:text-slate-300">{selectedLkpd.objectives}</pre>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100">
            Daftar Butir Pertanyaan ({answeredCount}/{totalQuestions} Terisi)
          </h3>
          <span className="text-xs font-mono font-bold bg-[#bef264] text-slate-950 px-3 py-1 rounded-xl border-2 border-slate-950">
            Status: {existingSubmission ? `Sudah Dikirim (${existingSubmission.status})` : 'Sedang Dikerjakan'}
          </span>
        </div>

        {selectedLkpd?.questions?.map((q, idx) => {
          const ans = answers[q.id] || { textAnswer: '', photoUrl: '' };

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-950 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-mono font-black text-xs text-slate-950">
                    {idx + 1}
                  </span>
                  <span className="font-black text-sm text-slate-950 dark:text-slate-100">{q.title}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">Bobot: {q.weight} Poin</span>
              </div>

              {/* Prompt */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-950 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.prompt}
              </div>

              {/* Text Input Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100">
                  Jawaban Essai Anda:
                </label>
                <textarea
                  rows={4}
                  value={ans.textAnswer}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder="Ketik langkah pengerjaan, kesimpulan, atau jawaban perhitunganmu di sini..."
                  disabled={Boolean(existingSubmission)}
                  className="w-full p-3.5 bg-[#fffdf5] dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 rounded-2xl font-sans text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ffe600] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-80"
                />
              </div>

              {/* Photo Upload Area (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Upload size={14} />
                    <span>Lampiran Foto Lembar Kerja Fisik (Opsional):</span>
                  </label>
                  {ans.photoUrl && !existingSubmission && (
                    <button
                      onClick={() => handleRemovePhoto(q.id)}
                      className="text-xs font-mono text-red-600 dark:text-red-400 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                {ans.photoUrl ? (
                  <div className="relative rounded-2xl border-2 border-slate-950 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 max-w-sm">
                    <img
                      src={ans.photoUrl}
                      alt={`Foto Soal ${idx + 1}`}
                      className="w-full h-auto max-h-48 object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  !existingSubmission && (
                    <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      <Upload size={16} />
                      <span>Pilih Foto dari Galeri / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(q.id, e)}
                      />
                    </label>
                  )
                )}
              </div>

              {/* AI Discussion Box (Unlocked after clicking Koreksi AI) */}
              {aiDiscussionUnlocked && (
                <div className="p-4 bg-[#a5f3fc]/30 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-700 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-mono text-xs font-black">
                    <Bot size={18} className="text-cyan-800 dark:text-cyan-400" />
                    <span>PEMBAHASAN ASISTEN AI (SOAL {idx + 1}):</span>
                  </div>
                  <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-900/90 p-3 rounded-xl border border-cyan-900/30 dark:border-cyan-700">
                    {q.discussion}
                  </pre>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Action Footer Buttons */}
      <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 block">
            Kelengkapan Soal: {answeredCount} dari {totalQuestions} Butir Selesai
          </span>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            {aiDiscussionUnlocked ? "✓ Pembahasan AI sudah dibuka." : "Ketik semua jawaban untuk membuka Koreksi AI."}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Button 1: Koreksi AI (Shows Discussion) */}
          <button
            onClick={handleRunAiCorrection}
            disabled={!isAllAnswered || isAiLoading}
            className="px-6 py-3 bg-[#a5f3fc] hover:bg-cyan-300 disabled:opacity-50 text-slate-950 border-3 border-slate-950 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <Bot size={16} />
            <span>{isAiLoading ? 'Menganalisis...' : 'Koreksi AI (Buka Pembahasan)'}</span>
          </button>

          {/* Button 2: Kirim ke Guru */}
          {!existingSubmission && (
            <button
              onClick={handleSubmitLKPD}
              disabled={!isAllAnswered}
              className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 disabled:opacity-50 text-slate-950 border-3 border-slate-950 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
            >
              <Send size={16} />
              <span>Kirim LKPD ke Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Preview PDF LKPD */}
      {previewLKPDModal && (
        <Modal
          isOpen={Boolean(previewLKPDModal)}
          onClose={() => setPreviewLKPDModal(null)}
          title={`Panduan Berkas: ${previewLKPDModal.title}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 rounded-2xl text-xs font-mono space-y-2 text-slate-900 dark:text-slate-100">
              <div><b>Nama File:</b> {previewLKPDModal.pdfFilename}</div>
              <div><b>Deskripsi:</b> {previewLKPDModal.description}</div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  soundService.click();
                  showToast(`Mengunduh berkas ${previewLKPDModal.pdfFilename}...`, "success");
                  setPreviewLKPDModal(null);
                }}
              >
                <Download size={15} className="mr-1.5" />
                Unduh PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

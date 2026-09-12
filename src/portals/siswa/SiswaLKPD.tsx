import React, { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LKPDItem, LKPDSubmission, LKPDEssayAnswer } from '@/types';
import { compressImage } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import { evaluateLKPDWithAI, LKPDOverallEvaluation } from '@/services/aiCorrectionService';
import { Modal } from '@/components/ui/modal';
import {
  FileText,
  Upload,
  Bot,
  CheckCircle2,
  Send,
  Trash2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Camera,
  Sparkles,
  Trophy,
  Loader2,
  RefreshCw,
  Eye,
  Download,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SiswaLKPD: React.FC<{
  currentUser: User;
  onNavigate?: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const [db, setDb] = useState(storageService.getState());

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDb(newState);
    });
  }, []);

  const lkpdList = db.lkpdList || [];
  // Selected/active LKPD ID in the accordion (defaults to first LKPD)
  const [selectedLkpdId, setSelectedLkpdId] = useState<string | null>(() => lkpdList[0]?.id || 'lkpd_1');
  const selectedLkpd = lkpdList.find(l => l.id === selectedLkpdId) || null;
  const questions = selectedLkpd?.questions || [];

  const existingSubmission = selectedLkpd
    ? db.lkpdSubmissions.find(s => s.studentId === currentUser.id && s.lkpdId === selectedLkpd.id)
    : null;

  // Solving mode state: false = Intro/PDF/Instructions View; true = Solving Questions View
  const [isSolvingMode, setIsSolvingMode] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Stepper state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, LKPDEssayAnswer>>({});
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiDiscussionUnlocked, setAiDiscussionUnlocked] = useState<boolean>(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<LKPDOverallEvaluation | null>(null);

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

  const handleToggleLkpd = (id: string) => {
    if (selectedLkpdId === id) {
      if (isSolvingMode) {
        if (!window.confirm("Kamu sedang dalam lembar pengerjaan kegiatan. Ingin menutup lembar pengerjaan ini?")) {
          return;
        }
        setIsSolvingMode(false);
      }
      setSelectedLkpdId(prev => (prev === id ? null : id));
    } else {
      if (isSolvingMode) {
        if (!window.confirm("Kamu sedang dalam mode pengerjaan kegiatan. Beralih ke LKPD lain akan menutup lembar pengerjaan saat ini. Lanjutkan?")) {
          return;
        }
        setIsSolvingMode(false);
      }
      soundService.click();
      setSelectedLkpdId(id);
      setActiveQuestionIdx(0);
      setAiDiscussionUnlocked(false);
      setAiEvaluationResult(null);
    }
  };

  // Anti-Cheat Monitor Active while actively solving
  const { switchCount, getReport, resetReport } = useAntiCheat({
    active: !existingSubmission && isSolvingMode && Boolean(selectedLkpdId),
    onViolation: (msg) => {
      showToast(msg, 'error');
    }
  });

  // Load existing answers if available
  useEffect(() => {
    if (!selectedLkpd) return;
    const currentSub = db.lkpdSubmissions.find(
      s => s.studentId === currentUser.id && s.lkpdId === selectedLkpd.id
    );
    if (currentSub && currentSub.answers) {
      setAnswers(currentSub.answers);
      setAiDiscussionUnlocked(false);
    } else {
      const initial: Record<string, LKPDEssayAnswer> = {};
      (selectedLkpd.questions || []).forEach(q => {
        initial[q.id] = { textAnswer: '', photoUrl: '' };
      });
      setAnswers(initial);
      setAiDiscussionUnlocked(false);
      setAiEvaluationResult(null);
      resetReport();
    }
  }, [selectedLkpd?.id, db.lkpdSubmissions, currentUser.id]);

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

    showToast("Mengompresi foto lembar pengerjaan fisik...", "info");
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
    showToast("Foto pengerjaan telah dihapus.", "info");
  };

  const handleRunAiCorrection = async (forceReEvaluate: boolean = false) => {
    if (aiDiscussionUnlocked && !forceReEvaluate) {
      setAiDiscussionUnlocked(false);
      showToast("Pembahasan AI disembunyikan.", "info");
      return;
    }

    if (!forceReEvaluate && aiEvaluationResult) {
      setAiDiscussionUnlocked(true);
      soundService.success();
      showToast("Langkah pembahasan konsep resmi ditampilkan!", "success");
      return;
    }

    const answeredCount = questions.filter(q => (answers[q.id]?.textAnswer || '').trim().length > 0).length;
    if (answeredCount === 0) {
      showToast("Tuliskan minimal 1 jawaban sebelum menjalankan koreksi AI.", "error");
      return;
    }

    setIsAiLoading(true);
    soundService.click();
    showToast("Menghubungi AI untuk menganalisis pemahaman konsep...", "info");

    try {
      const evalResult = await evaluateLKPDWithAI(questions, answers);
      setAiEvaluationResult(evalResult);
      setAiDiscussionUnlocked(true);
      soundService.success();
      showToast("Analisis AI selesai! Langkah pembahasan resmi terbuka.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal memanggil AI: " + (err.message || 'Koneksi bermasalah'), "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRunAiCorrectionForReview = async (forceReEvaluate: boolean = false) => {
    if (aiDiscussionUnlocked && !forceReEvaluate) {
      setAiDiscussionUnlocked(false);
      showToast("Pembahasan konsep disembunyikan.", "info");
      return;
    }

    if (!forceReEvaluate && aiEvaluationResult) {
      setAiDiscussionUnlocked(true);
      soundService.success();
      showToast("Langkah konsep pembahasan resmi ditampilkan!", "success");
      return;
    }

    if (!existingSubmission || !existingSubmission.answers) {
      setAiDiscussionUnlocked(true);
      return;
    }

    setIsAiLoading(true);
    soundService.click();
    showToast("Menghubungi AI untuk menelaah jawabanmu...", "info");

    try {
      const evalResult = await evaluateLKPDWithAI(questions, existingSubmission.answers);
      setAiEvaluationResult(evalResult);
      setAiDiscussionUnlocked(true);
      soundService.success();
      showToast("Analisis AI selesai! Pembahasan konsep resmi siap dipelajari.", "success");
    } catch (err: any) {
      console.error(err);
      setAiDiscussionUnlocked(true);
      showToast("Pembahasan resmi dibuka (AI offline).", "info");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitLKPD = async () => {
    if (!selectedLkpd) return;
    const answeredCount = questions.filter(q => (answers[q.id]?.textAnswer || '').trim().length > 0).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `Kamu baru menjawab ${answeredCount} dari ${questions.length} kegiatan. Yakin ingin mengirim sekarang?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm(
        "Apakah kamu sudah yakin dengan semua jawabanmu? Jawaban akan dikirimkan kepada guru."
      );
      if (!confirmSubmit) return;
    }

    const antiCheatReport = getReport();
    const aiEval = aiEvaluationResult || await evaluateLKPDWithAI(questions, answers);

    const finalAnswers: Record<string, LKPDEssayAnswer> = {};
    questions.forEach(q => {
      const studentAns = answers[q.id] || { textAnswer: '', photoUrl: '' };
      const qEval = aiEval.perQuestion[q.id];
      const diagnosaNote = qEval?.diagnosa ? `${qEval.diagnosa} (${qEval.conceptFeedback})` : qEval?.conceptFeedback || "Jawaban telah diperiksa AI.";
      finalAnswers[q.id] = {
        textAnswer: studentAns.textAnswer,
        photoUrl: studentAns.photoUrl || '',
        aiScore: qEval?.score ?? 0,
        aiFeedback: diagnosaNote
      };
    });

    const photoList = Object.values(answers).map(a => a.photoUrl).filter(Boolean) as string[];

    const newSubmission: LKPDSubmission = {
      id: `sub_${currentUser.id}_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7",
      lkpdId: selectedLkpd.id,
      photoUrl: photoList[0] || '',
      photoUrls: photoList,
      answers: finalAnswers,
      date: new Date().toLocaleString('id-ID'),
      aiScore: aiEval.totalScore,
      aiFeedback: aiEval.overallFeedback,
      teacherScore: null,
      teacherFeedback: "",
      antiCheat: antiCheatReport,
      status: "Terkumpul"
    };

    storageService.update(draft => {
      draft.lkpdSubmissions = draft.lkpdSubmissions.filter(
        s => !(s.studentId === currentUser.id && s.lkpdId === selectedLkpd.id)
      );
      draft.lkpdSubmissions.push(newSubmission);

      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 100, video: 100, lkpd: 0, latsol: 0, evaluasi: 0 };
        user.progress.lkpd = 100;
      }
    });

    soundService.success();
    confetti({ particleCount: 100, spread: 80 });
    setIsSolvingMode(false);
    showToast("LKPD Digital Berhasil Dikirim ke Guru! Tahap Latihan Soal kini terbuka.", "success");
  };

  const renderPdfModal = () => (
    isPdfModalOpen && selectedLkpd ? (
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={`Dokumen PDF: ${selectedLkpd.title}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#ffe600] rounded-2xl border-2 border-slate-950 text-xs font-mono text-slate-950 font-black shadow-[2px_2px_0px_0px_#0f172a]">
            <div className="truncate pr-2">
              <span>Berkas: {selectedLkpd.pdfFilename || 'Dokumen Lembar Kerja.pdf'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedLkpd.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(selectedLkpd.pdfUrl)}
                  download={selectedLkpd.pdfFilename || 'LKPD_Pecahan.pdf'}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 border border-slate-950 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh</span>
                </a>
              )}
              {selectedLkpd.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(selectedLkpd.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Tab Baru</span>
                </a>
              )}
            </div>
          </div>

          {selectedLkpd.pdfUrl ? (
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] bg-slate-900 relative">
              <object
                data={getPdfDisplayUrl(selectedLkpd.pdfUrl)}
                type="application/pdf"
                className="w-full h-full"
              >
                <iframe
                  src={getPdfDisplayUrl(selectedLkpd.pdfUrl)}
                  title={selectedLkpd.title}
                  className="w-full h-full border-0"
                />
              </object>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-950 space-y-2">
              <FileText size={44} className="mx-auto text-amber-500" />
              <h4 className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                {selectedLkpd.pdfFilename || 'Dokumen LKPD Digital'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Berkas PDF standar kurikulum telah disiapkan oleh Guru. Silakan pelajari tujuan pembelajaran dan kerjakan lembar kerja digital.
              </p>
            </div>
          )}
        </div>
      </Modal>
    ) : null
  );

  // 1. SUBMITTED / COMPLETED VIEW INSIDE EXPANDED CARD
  const renderCompletedView = (item: LKPDItem, itemSub: LKPDSubmission) => {
    const itemQuestions = item.questions || [];

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Banner Selesai */}
        <div className="rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a]">
                <Trophy size={28} className="text-amber-500" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-black uppercase bg-white px-3 py-1 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-slate-950">
                  LKPD DIGITAL SELESAI
                </span>
                <h2 className="text-xl font-black font-mono mt-1 text-slate-950">
                  Lembar Kerja Berhasil Dikumpulkan
                </h2>
              </div>
            </div>

            <div className="px-4 py-2 bg-white rounded-2xl border-3 border-slate-950 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a]">
              Status: {itemSub.status === 'Dinilai' ? 'Telah Dinilai Guru' : 'Menunggu Nilai Guru'}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
            Seluruh jawaban kegiatan lembar kerja ini telah tersimpan di sistem dan diserahkan kepada Guru. Di bawah ini kamu dapat meninjau jawabanmu dan mencocokkannya dengan langkah pembahasan konsep resmi.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold pt-1">
            <span className="px-3 py-1.5 bg-white text-slate-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              📅 Tanggal: {itemSub.date}
            </span>
            <span className="px-3 py-1.5 bg-emerald-200 text-emerald-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🛡 Tab Integrity: {itemSub.antiCheat?.switchCount || 0}x Pindah Tab
            </span>
          </div>

          {/* PDF Attachment button in Review */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-800 truncate">
              <FileText size={18} className="text-cyan-800 shrink-0" />
              <span className="truncate">Dokumen PDF Resmi: {item.pdfFilename || 'LKPD.pdf'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-2 border-slate-950 rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Eye size={14} />
              <span>Buka Dokumen PDF</span>
            </button>
          </div>
        </div>

        {/* Review Per-Question Header with Koreksi AI Button */}
        <div className="space-y-4">
          {isAiLoading ? (
            <div className="flex items-center gap-3 p-5 rounded-3xl bg-cyan-100/80 dark:bg-cyan-950/60 border-4 border-cyan-800 dark:border-cyan-600 shadow-[6px_6px_0px_0px_#083344] animate-pulse">
              <Loader2 size={26} className="animate-spin text-cyan-800 dark:text-cyan-300 shrink-0" />
              <div>
                <span className="font-mono text-xs font-black block text-cyan-950 dark:text-cyan-100">
                  ASISTEN AI SEDANG MENELAAH LANGKAH PENGERJAANMU (OPENROUTER)...
                </span>
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                  Menganalisis penalaran konsep pecahan, penyamaan penyebut KPK, dan menyiapkan pembahasan bertahap.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl text-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black font-mono text-slate-950 dark:text-slate-100">
                    Tinjauan Jawaban &amp; Pembahasan Soal
                  </h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {aiDiscussionUnlocked
                      ? 'Langkah konsep pembahasan resmi per soal sedang terbuka.'
                      : 'Klik tombol di samping untuk menelaah jawabanmu dan memunculkan pembahasan konsep resmi.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {aiDiscussionUnlocked && (
                  <button
                    type="button"
                    onClick={() => handleRunAiCorrectionForReview(true)}
                    className="px-3.5 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-slate-950 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    title="Koreksi ulang dengan AI"
                  >
                    <RefreshCw size={14} />
                    <span>Koreksi Ulang</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRunAiCorrectionForReview(false)}
                  className={`px-5 py-3 rounded-2xl font-mono text-xs font-black border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    aiDiscussionUnlocked
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>{aiDiscussionUnlocked ? 'Sembunyikan Pembahasan' : 'Jalankan Koreksi AI (Live)'}</span>
                </button>
              </div>
            </div>
          )}

          {itemQuestions.map((q, idx) => {
            const ans = itemSub.answers?.[q.id] || { textAnswer: '' };
            const photo = ans.photoUrl || (idx === 0 ? itemSub.photoUrl : undefined);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-950 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-mono font-black text-xs text-slate-950">
                      {idx + 1}
                    </span>
                    <span className="font-black text-sm text-slate-950 dark:text-slate-100">{q.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    Bobot: {q.weight} Poin
                  </span>
                </div>

                {/* Prompt */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                  {q.prompt}
                </div>

                {/* Student Answer */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span className="font-black text-amber-900 dark:text-amber-400 font-mono uppercase block mb-1">
                    Jawaban yang Anda Kirim:
                  </span>
                  <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">
                    {ans.textAnswer || "(Tidak ada ketikan jawaban)"}
                  </p>
                </div>

                {/* Photo if attached */}
                {photo && (
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 block">
                      Foto Coretan Fisik yang Anda Lampirkan:
                    </span>
                    <div className="relative rounded-2xl border-2 border-slate-950 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 max-w-xs">
                      <img
                        src={photo}
                        alt={`Foto Soal ${idx + 1}`}
                        className="w-full h-auto max-h-40 object-contain rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Official Step-by-Step Discussion (Only shown if student pressed Koreksi AI button) */}
                {aiDiscussionUnlocked ? (
                  <div className="p-4 bg-[#a5f3fc]/30 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-800 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-mono text-xs font-black">
                      <Bot size={18} className="text-cyan-800 dark:text-cyan-400" />
                      <span>PEMBAHASAN &amp; BIMBINGAN ASISTEN AI (KEGIATAN {idx + 1}):</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono font-black text-cyan-950 dark:text-cyan-200 text-[11px] block">
                        📘 Langkah Pembahasan Konsep Resmi:
                      </span>
                      <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-900/90 p-3.5 rounded-xl border border-cyan-950/20 dark:border-cyan-800/40">
                        {q.discussion}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      🔒 Pembahasan disembunyikan. Tekan tombol <strong className="text-cyan-700 dark:text-cyan-400">"Jalankan Koreksi AI (Live)"</strong> di atas untuk memunculkan langkah konsep resmi.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Next: Latihan Soal */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
          <div>
            <span className="font-mono text-xs font-black text-slate-950 dark:text-slate-100 block">
              Tahap 1 Selesai! Lanjutkan ke Tahap 2
            </span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Latihan Soal Kuis Pilihan Ganda (Quizizz Mode) siap dikerjakan.
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('siswa/latsol')}
              className="px-6 py-3 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Lanjut ke Latihan Soal</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // 2. COVER / INTRO & PDF VIEW INSIDE EXPANDED CARD
  const renderIntroView = (item: LKPDItem) => {
    const itemQuestions = item.questions || [];
    const totalWeight = itemQuestions.reduce((a, q) => a + (q.weight || 0), 0);

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Banner LKPD Cover */}
        <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-3 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a]">
                <BookOpen size={28} className="text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-black uppercase bg-white px-2.5 py-0.5 rounded-lg border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    LEMBAR KERJA PESERTA DIDIK
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase bg-[#a5f3fc] px-2 py-0.5 rounded-lg border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    TAHAP 1
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-mono">
                  {item.title}
                </h2>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-white rounded-2xl border-3 border-slate-950 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a] self-start sm:self-auto">
              {itemQuestions.length} Butir Kegiatan
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed max-w-3xl">
            {item.description || 'Lembar kerja interaktif untuk melatih pemahaman dan kemampuan menganalisis konsep matematika.'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono font-bold pt-1">
            <span className="px-3 py-1 bg-white text-slate-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🎯 Total Bobot: {totalWeight} Poin
            </span>
            <span className="px-3 py-1 bg-sky-200 text-sky-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🛡 Anti-Cheat System
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              Status: Siap Dikerjakan
            </span>
          </div>
        </div>

        {/* Grid 2 Kartu: Tujuan & Berkas PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kartu 1: Tujuan Pembelajaran & Petunjuk */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  LANGKAH 1
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 dark:text-slate-100">
                  Tujuan Pembelajaran &amp; Petunjuk
                </h3>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {item.objectives || 'Pelajari materi operasi pecahan, kerjakan setiap butir kegiatan dengan langkah hitung terperinci, dan unggah foto lembar pengerjaan fisik bila diminta.'}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-900/30 rounded-2xl text-[11px] font-bold text-amber-950 dark:text-amber-300">
              💡 <strong>Instruksi Guru:</strong> Bacalah petunjuk pengerjaan di atas dan pelajari dokumen PDF sebelum mulai menjawab kegiatan.
            </div>
          </div>

          {/* Kartu 2: Berkas Dokumen PDF Resmi Guru */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-sky-200 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  LANGKAH 2
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 dark:text-slate-100">
                  Dokumen Lembar Kerja (PDF)
                </h3>
              </div>

              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                Guru telah menyiapkan berkas dokumen resmi untuk lembar kerja ini. Kamu dapat membaca langsung dokumen di layar atau mengunduhnya.
              </p>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border-2 border-slate-950 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-[#ffe600] border-2 border-slate-950 rounded-xl text-slate-950 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="truncate">
                    <span className="font-mono font-black text-xs block text-slate-950 dark:text-slate-100 truncate">
                      {item.pdfFilename || 'Lembar_Kerja_Peserta_Didik.pdf'}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                      Berkas Resmi Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {item.imageUrl && (
                <div className="rounded-2xl overflow-hidden border-2 border-slate-950 dark:border-slate-800 max-h-36">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="flex-1 px-4 py-2.5 rounded-xl font-mono font-black text-xs bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Eye size={16} />
                <span>Buka Dokumen PDF</span>
              </button>

              {item.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(item.pdfUrl)}
                  download={item.pdfFilename || 'LKPD_Pecahan.pdf'}
                  className="px-4 py-2.5 rounded-xl font-mono font-black text-xs bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tombol CTA Masuk ke Lembar Pengerjaan Kegiatan */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-mono font-black text-base sm:text-lg text-slate-950 dark:text-slate-100">
              Siap Memulai Pengerjaan?
            </h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Klik tombol di samping untuk masuk ke lembar kerja Kegiatan 1 sampai Kegiatan {itemQuestions.length}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundService.click();
              setIsSolvingMode(true);
              setActiveQuestionIdx(0);
            }}
            className="px-6 py-4 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer shrink-0 flex items-center justify-center gap-2.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>🚀 Mulai Kerjakan Kegiatan LKPD</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  // 3. ACTIVE QUIZ-STYLE STEPPER VIEW INSIDE EXPANDED CARD
  const renderSolvingView = (item: LKPDItem) => {
    const itemQuestions = item.questions || [];
    const currentQ = itemQuestions[activeQuestionIdx] || itemQuestions[0];
    const currentAns = answers[currentQ?.id] || { textAnswer: '', photoUrl: '' };
    const answeredCount = itemQuestions.filter(q => (answers[q.id]?.textAnswer || '').trim().length > 0).length;
    const totalQuestions = itemQuestions.length;
    const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Top Solving Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundService.click();
                setIsSolvingMode(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-700 font-mono font-black text-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Petunjuk &amp; PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-2 border-slate-950 font-mono font-black text-xs shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Eye size={14} />
              <span>Lihat Dokumen PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs font-black bg-[#ffe600] px-3 py-1.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-slate-950">
              Progres: {answeredCount}/{totalQuestions} Selesai
            </span>
          </div>
        </div>

        {/* Anti-cheat tab alert */}
        {switchCount > 0 && (
          <div className="bg-red-100 dark:bg-red-950/50 border-3 border-red-950 dark:border-red-800 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#7f1d1d] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3 text-red-950 dark:text-red-200 font-mono text-xs font-black">
            <ShieldAlert size={22} className="text-red-600 dark:text-red-400 shrink-0" />
            <span>Peringatan: Kamu telah berpindah tab sebanyak {switchCount}x. Seluruh perpindahan tab dilaporkan ke Portal Guru.</span>
          </div>
        )}

        {/* Question Stepper Tabs */}
        <div className="flex flex-wrap gap-2">
          {itemQuestions.map((q, idx) => {
            const isFilled = (answers[q.id]?.textAnswer || '').trim().length > 0;
            const isCurrent = activeQuestionIdx === idx;

            return (
              <button
                key={q.id}
                onClick={() => {
                  soundService.click();
                  setActiveQuestionIdx(idx);
                }}
                className={`px-4 py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-800 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-[#ffe600] text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] translate-x-[-1px] translate-y-[-1px]'
                    : isFilled
                    ? 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                <span>Kegiatan #{idx + 1}</span>
                {isFilled && <CheckCircle2 size={14} className="text-emerald-700 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-950 dark:border-slate-800 pb-3">
              <span className="font-mono text-xs font-black bg-[#ffe600] px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-slate-950">
                KEGIATAN {activeQuestionIdx + 1} DARI {totalQuestions}
              </span>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                {currentQ.weight > 0 ? `Bobot: ${currentQ.weight} Poin` : 'Refleksi Mandiri'}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100 mb-2">
                {currentQ.title}
              </h3>

              {/* Prompt / Study Case */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {currentQ.prompt}
              </div>
            </div>

            {/* Text Area for Typing Answer */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-200">
                Ketik Uraian Jawaban &amp; Langkah Hitung Anda:
              </label>
              <textarea
                rows={5}
                value={currentAns.textAnswer}
                onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
                placeholder="Tuliskan langkah-langkah penyelesaian, alasan matematis, penyamaan penyebut KPK, dan kesimpulan akhirmu..."
                className="w-full p-4 bg-[#fffdf5] dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl font-sans text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffe600]"
              />
            </div>

            {/* Photo Attachment Per Question (Choose file) */}
            <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <Camera size={14} />
                  <span>Foto Lembar Coretan / Tulisan Tangan (Opsional):</span>
                </label>
                {currentAns.photoUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(currentQ.id)}
                    className="text-xs font-mono text-red-600 dark:text-red-400 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {currentAns.photoUrl ? (
                <div className="relative rounded-2xl border-2 border-slate-950 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 max-w-sm">
                  <img
                    src={currentAns.photoUrl}
                    alt={`Foto Kegiatan ${activeQuestionIdx + 1}`}
                    className="w-full h-auto max-h-48 object-contain rounded-xl"
                  />
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Upload size={16} />
                  <span>Unggah Foto Lembar Coretan Soal Ini</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(currentQ.id, e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Official Step-by-Step Discussion (Only shown if student pressed Koreksi AI button) */}
            {aiDiscussionUnlocked ? (
              <div className="p-4 bg-[#a5f3fc]/30 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-800 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-mono text-xs font-black">
                  <Bot size={18} className="text-cyan-800 dark:text-cyan-400" />
                  <span>PEMBAHASAN &amp; BIMBINGAN ASISTEN AI (KEGIATAN {activeQuestionIdx + 1}):</span>
                </div>

                <div className="space-y-1">
                  <span className="font-mono font-black text-cyan-950 dark:text-cyan-200 text-[11px] block">
                    📘 Langkah Pembahasan Konsep Resmi:
                  </span>
                  <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-900/90 p-3.5 rounded-xl border border-cyan-950/20 dark:border-cyan-700">
                    {currentQ.discussion}
                  </pre>
                </div>
              </div>
            ) : isAllAnswered ? (
              <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/30 border-2 border-dashed border-cyan-600 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-mono text-xs font-bold">
                  <Bot size={18} className="shrink-0 text-cyan-700 dark:text-cyan-400" />
                  <span>Semua kegiatan telah selesai dijawab! Tekan tombol di samping untuk menelaah jawabanmu secara live.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunAiCorrection(false)}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Jalankan Koreksi AI (Live)</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  🔒 Tombol <strong>Jalankan Koreksi AI (Live)</strong> akan aktif setelah semua ({answeredCount}/{totalQuestions}) kegiatan LKPD selesai dijawab.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000]">
          {/* Stepper navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundService.click();
                setActiveQuestionIdx(prev => Math.max(0, prev - 1));
              }}
              disabled={activeQuestionIdx === 0}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-200 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => {
                soundService.click();
                setActiveQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1));
              }}
              disabled={activeQuestionIdx === totalQuestions - 1}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-200 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Berikutnya</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* AI Correction & Submit Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Koreksi AI Button */}
            {isAllAnswered && (
              <div className="flex items-center gap-2">
                {aiDiscussionUnlocked && (
                  <button
                    type="button"
                    onClick={() => handleRunAiCorrection(true)}
                    disabled={isAiLoading}
                    className="px-3.5 py-3 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 border-3 border-slate-950 rounded-2xl font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    title="Koreksi ulang dengan AI"
                  >
                    <RefreshCw size={14} />
                    <span>Koreksi Ulang</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRunAiCorrection(false)}
                  disabled={isAiLoading}
                  className="px-5 py-3 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-3 border-slate-950 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>
                    {isAiLoading
                      ? 'Menganalisis...'
                      : aiDiscussionUnlocked
                      ? 'Sembunyikan Pembahasan'
                      : 'Jalankan Koreksi AI (Live)'}
                  </span>
                </button>
              </div>
            )}

            {/* Submit to Teacher Button */}
            <button
              onClick={handleSubmitLKPD}
              disabled={!isAllAnswered || isAiLoading}
              className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 disabled:opacity-50 text-slate-950 border-3 border-slate-950 rounded-2xl font-mono text-xs font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
            >
              <Send size={16} />
              <span>Kirim LKPD ke Guru</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-3 border-slate-950 flex items-center justify-center font-mono font-black text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-black uppercase bg-[#a5f3fc] px-2.5 py-0.5 rounded-lg border border-slate-950 text-slate-950 shadow-[1px_1px_0px_0px_#0f172a] inline-block mb-1">
              TAHAP 1: PEMBELAJARAN
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-950 dark:text-slate-100">
              Lembar Kerja Peserta Didik (LKPD)
            </h1>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Pilih lembar kerja di bawah. Dokumen resmi, tujuan pembelajaran, dan butir kegiatan akan terbuka langsung di bawah lembar kerja yang kamu pilih.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-2 bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a] text-slate-950 dark:text-slate-100">
            {lkpdList.length} Tugas LKPD
          </span>
        </div>
      </div>

      {/* Accordion / Vertical Cards Stack */}
      <div className="flex flex-col gap-5">
        {lkpdList.map((item, idx) => {
          const isExpanded = selectedLkpdId === item.id;
          const itemSub = db.lkpdSubmissions.find(s => s.studentId === currentUser.id && s.lkpdId === item.id);
          const isDone = Boolean(itemSub);
          const itemQuestions = item.questions || [];

          return (
            <div
              key={item.id}
              className={`rounded-3xl border-4 border-slate-950 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden transition-all duration-200 ${
                isExpanded ? 'ring-3 ring-[#ffe600]' : ''
              }`}
            >
              {/* Accordion Card Header */}
              <div
                onClick={() => handleToggleLkpd(item.id)}
                className={`p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none transition-colors ${
                  isExpanded
                    ? 'bg-[#ffe600] text-slate-950 border-b-4 border-slate-950 dark:border-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-950 dark:text-slate-100'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`px-3 py-1.5 rounded-xl border-2 border-slate-950 font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#0f172a] shrink-0 ${
                      isExpanded ? 'bg-white text-slate-950' : 'bg-[#ffe600] text-slate-950'
                    }`}
                  >
                    LKPD #{idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-mono font-black text-base sm:text-lg">
                        {item.title}
                      </h3>
                      {isDone ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-mono text-[10px] font-black border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Telah Dikumpulkan</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-lg font-mono text-[10px] font-black border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] ${
                            isExpanded ? 'bg-white text-slate-950' : 'bg-amber-100 text-amber-950'
                          }`}
                        >
                          Belum Dikerjakan
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs font-bold line-clamp-2 max-w-2xl ${
                        isExpanded ? 'text-slate-900' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.description || 'Pelajari tujuan, tinjau berkas dokumen PDF, dan kerjakan seluruh butir kegiatan.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span
                    className={`px-3 py-1 rounded-xl border-2 border-slate-950 font-mono text-xs font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] ${
                      isExpanded ? 'bg-white text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {itemQuestions.length} Kegiatan
                  </span>

                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-white text-slate-950 hover:bg-slate-100'
                        : 'bg-[#a5f3fc] text-slate-950 hover:bg-cyan-300'
                    }`}
                  >
                    <span>{isExpanded ? 'Tutup' : 'Buka Lembar Kerja'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Accordion Body: directly underneath the clicked LKPD! */}
              {isExpanded && (
                <div className="p-5 sm:p-8 bg-[#fffdfa] dark:bg-[#0b1120] space-y-6 animate-in fade-in duration-200">
                  {itemSub
                    ? renderCompletedView(item, itemSub)
                    : !isSolvingMode
                    ? renderIntroView(item)
                    : renderSolvingView(item)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {renderPdfModal()}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LKPDItem, LKPDSubmission, LKPDEssayAnswer } from '@/types';
import { compressImage } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import { evaluateLKPDWithAI, evaluateLKPDWithRubric, LKPDOverallEvaluation } from '@/services/aiCorrectionService';
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
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PdfCanvasViewer } from '@/components/ui/PdfCanvasViewer';
import { DocumentPreviewModal, DocumentPreviewItem } from '@/components/ui/DocumentPreviewModal';

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
  const [selectedLkpdId, setSelectedLkpdId] = useState<string>(() => lkpdList[0]?.id || 'lkpd_1');
  const selectedLkpd = lkpdList.find(l => l.id === selectedLkpdId) || lkpdList[0];
  const questions = selectedLkpd?.questions || [];

  const existingSubmission = db.lkpdSubmissions.find(
    s => s.studentId === currentUser.id && s.lkpdId === selectedLkpd?.id
  );

  // Dropdown selector open/closed state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Solving mode state: false = Intro/PDF/Instructions View; true = Solving Questions View
  const [isSolvingMode, setIsSolvingMode] = useState<boolean>(false);
  const [previewDocItem, setPreviewDocItem] = useState<DocumentPreviewItem | null>(null);

  // Stepper state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, LKPDEssayAnswer>>({});
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiDiscussionUnlocked, setAiDiscussionUnlocked] = useState<boolean>(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<LKPDOverallEvaluation | null>(null);

  // Click-outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSelectLkpd = (id: string) => {
    if (isSolvingMode && id !== (selectedLkpd?.id || selectedLkpdId)) {
      const confirmLeave = window.confirm(
        "Kamu sedang dalam lembar pengerjaan kegiatan. Beralih ke LKPD lain akan menutup pengerjaan ini. Lanjutkan?"
      );
      if (!confirmLeave) return;
    }
    soundService.click();
    setSelectedLkpdId(id);
    setIsDropdownOpen(false);
    setIsSolvingMode(false);
    setActiveQuestionIdx(0);
    setAiDiscussionUnlocked(false);
    setAiEvaluationResult(null);
  };

  // Anti-Cheat Monitor Active while actively solving
  const { switchCount, getReport, resetReport } = useAntiCheat({
    active: !existingSubmission && isSolvingMode,
    onViolation: (msg) => {
      showToast(msg, 'error');
    }
  });

  // Load existing answers if available
  useEffect(() => {
    if (existingSubmission && existingSubmission.answers) {
      const loadedAnswers: Record<string, LKPDEssayAnswer> = { ...existingSubmission.answers };
      const fallbackPhoto = existingSubmission.photoUrl || existingSubmission.photoUrls?.[0] || '';
      questions.forEach((q, idx) => {
        if (!loadedAnswers[q.id]) {
          loadedAnswers[q.id] = { textAnswer: '', photoUrl: '' };
        }
        if (!loadedAnswers[q.id].photoUrl && fallbackPhoto) {
          loadedAnswers[q.id].photoUrl = (idx === 0 ? fallbackPhoto : '') || fallbackPhoto;
        }
      });
      setAnswers(loadedAnswers);
      setAiDiscussionUnlocked(existingSubmission.isAiEvaluated === true);
    } else {
      const initial: Record<string, LKPDEssayAnswer> = {};
      questions.forEach(q => {
        initial[q.id] = { textAnswer: '', photoUrl: '' };
      });
      setAnswers(initial);
      setAiDiscussionUnlocked(false);
      setAiEvaluationResult(null);
      resetReport();
    }
  }, [selectedLkpd?.id, existingSubmission]);

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

    const anyAttachedPhoto = Object.values(answers).find(a => Boolean(a.photoUrl && a.photoUrl.length > 50))?.photoUrl || '';
    const preparedAnswers: Record<string, { textAnswer: string; photoUrl?: string }> = {};
    questions.forEach((q, idx) => {
      const ans = answers[q.id] || { textAnswer: '', photoUrl: '' };
      preparedAnswers[q.id] = {
        textAnswer: ans.textAnswer || '',
        photoUrl: ans.photoUrl || (idx === 0 ? anyAttachedPhoto : '') || anyAttachedPhoto
      };
    });

    const answeredCount = questions.filter(q => {
      const text = (preparedAnswers[q.id]?.textAnswer || '').trim();
      const hasPhoto = Boolean(preparedAnswers[q.id]?.photoUrl && preparedAnswers[q.id].photoUrl!.length > 50);
      return text.length > 0 || hasPhoto;
    }).length;
    if (answeredCount === 0) {
      showToast("Tuliskan jawaban atau lampirkan foto pengerjaan sebelum koreksi AI.", "error");
      return;
    }

    const hasPhotoAttached = questions.some(q => Boolean(preparedAnswers[q.id]?.photoUrl && preparedAnswers[q.id].photoUrl!.length > 50));

    setIsAiLoading(true);
    soundService.click();
    showToast(
      hasPhotoAttached
        ? "AI sedang membaca foto lembar pengerjaan & menganalisis langkahmu..."
        : "Menghubungi AI untuk menganalisis pemahaman konsep...",
      "info"
    );

    try {
      const evalResult = await evaluateLKPDWithAI(questions, preparedAnswers, anyAttachedPhoto);
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

    // Pastikan foto terambil baik dari answers per-soal, photoUrl submission, atau photoUrls
    const fallbackPhoto =
      existingSubmission.photoUrl ||
      existingSubmission.photoUrls?.[0] ||
      Object.values(existingSubmission.answers || {}).find(a => Boolean(a.photoUrl && a.photoUrl.length > 50))?.photoUrl ||
      '';

    const preparedAnswers: Record<string, { textAnswer: string; photoUrl?: string }> = {};
    questions.forEach((q, idx) => {
      const studentAns = existingSubmission.answers?.[q.id] || { textAnswer: '', photoUrl: '' };
      const photo = studentAns.photoUrl || (idx === 0 ? fallbackPhoto : '') || fallbackPhoto;
      preparedAnswers[q.id] = {
        textAnswer: studentAns.textAnswer || '',
        photoUrl: photo
      };
    });

    const hasPhotoAttached = questions.some(q => Boolean(preparedAnswers[q.id]?.photoUrl && preparedAnswers[q.id].photoUrl!.length > 50));

    setIsAiLoading(true);
    soundService.click();
    showToast(
      hasPhotoAttached
        ? "AI sedang membaca foto lembar pengerjaan & mengoreksi langkahmu..."
        : "Menghubungi AI untuk mengoreksi jawabanmu...",
      "info"
    );

    try {
      let evalResult: LKPDOverallEvaluation;
      try {
        evalResult = await evaluateLKPDWithAI(questions, preparedAnswers, fallbackPhoto);
      } catch (e) {
        console.warn("AI service fallback to rubric:", e);
        evalResult = evaluateLKPDWithRubric(questions, preparedAnswers);
      }
      setAiEvaluationResult(evalResult);
      setAiDiscussionUnlocked(true);

      // Persist the updated AI answers, score, and isAiEvaluated flag into storageService
      const updatedAnswers: Record<string, LKPDEssayAnswer> = { ...(existingSubmission.answers || {}) };
      questions.forEach((q, idx) => {
        const qEval = evalResult.perQuestion[q.id];
        const studentAns = updatedAnswers[q.id] || { textAnswer: '', photoUrl: '' };
        const photo = studentAns.photoUrl || (idx === 0 ? fallbackPhoto : '') || fallbackPhoto;
        const diagnosaNote = qEval?.diagnosa ? `${qEval.diagnosa} (${qEval.conceptFeedback})` : (qEval?.conceptFeedback || "Jawaban telah diperiksa AI.");
        updatedAnswers[q.id] = {
          ...studentAns,
          photoUrl: photo,
          aiAnswer: qEval?.aiAnswer || studentAns.aiAnswer,
          aiScore: qEval?.score ?? 0,
          aiFeedback: diagnosaNote
        };
      });

      storageService.update(draft => {
        const target = draft.lkpdSubmissions.find(s => s.id === existingSubmission.id);
        if (target) {
          target.answers = updatedAnswers;
          target.photoUrl = fallbackPhoto || target.photoUrl;
          target.isAiEvaluated = true;
          target.aiScore = evalResult.totalScore;
          target.aiFeedback = evalResult.overallFeedback;
        }
      });
      setAnswers(updatedAnswers);

      soundService.success();
      showToast("Koreksi AI selesai! Pembahasan konsep resmi siap dipelajari.", "success");
    } catch (err: any) {
      console.error(err);
      setAiDiscussionUnlocked(true);
      showToast("Pembahasan resmi dibuka.", "info");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitLKPD = async () => {
    // Ambil laporan integritas anti-cheat sebelum transisi selesai
    const antiCheatReport = getReport();
    setIsSolvingMode(false);
    soundService.click();

    // Jawaban dikirim murni tanpa memanggil AI
    const anyPhoto = Object.values(answers).find(a => Boolean(a.photoUrl && a.photoUrl.length > 50))?.photoUrl || '';
    const finalAnswers: Record<string, LKPDEssayAnswer> = {};
    questions.forEach((q, idx) => {
      const studentAns = answers[q.id] || { textAnswer: '', photoUrl: '' };
      finalAnswers[q.id] = {
        textAnswer: studentAns.textAnswer,
        photoUrl: studentAns.photoUrl || (idx === 0 ? anyPhoto : '') || anyPhoto,
      };
    });

    const photoList = Object.values(answers).map(a => a.photoUrl).filter(Boolean) as string[];

    const newSubmission: LKPDSubmission = {
      id: `sub_${currentUser.id}_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7",
      lkpdId: selectedLkpd?.id || "lkpd_1",
      photoUrl: photoList[0] || '',
      photoUrls: photoList,
      answers: finalAnswers,
      date: new Date().toLocaleString('id-ID'),
      isAiEvaluated: false,
      aiScore: undefined,
      aiFeedback: "",
      teacherScore: null,
      teacherFeedback: "",
      antiCheat: antiCheatReport,
      status: "Terkumpul"
    };

    storageService.update(draft => {
      draft.lkpdSubmissions = draft.lkpdSubmissions.filter(
        s => !(s.studentId === currentUser.id && s.lkpdId === (selectedLkpd?.id || "lkpd_1"))
      );
      draft.lkpdSubmissions.push(newSubmission);

      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 100, video: 100, lkpd: 0, latsol: 0, evaluasi: 0 };
        const totalLkpd = Math.max(draft.lkpdList?.length || 2, 1);
        const mySubCount = draft.lkpdSubmissions.filter(s => s.studentId === currentUser.id).length;
        user.progress.lkpd = Math.min(100, Math.round((mySubCount / totalLkpd) * 100));
        user.progress.materi = 100;
        user.progress.video = 100;
      }
    });

    soundService.success();
    confetti({ particleCount: 100, spread: 80 });
    setAiDiscussionUnlocked(false);
    showToast("Jawaban LKPD berhasil dikirim ke Guru! Klik 'Minta Koreksi AI' jika ingin ditelaah AI.", "success");
  };

  // Modern Minimalist Chevron Dropdown LKPD Selector
  const renderLkpdSelector = () => {
    const currentSub = db.lkpdSubmissions.find(
      s => s.studentId === currentUser.id && s.lkpdId === selectedLkpd?.id
    );
    const isDone = Boolean(currentSub);
    const selectedIdx = lkpdList.findIndex(l => l.id === selectedLkpd?.id);

    return (
      <div className="relative z-30 font-sans" ref={dropdownRef}>
        <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-3.5 sm:px-6 sm:py-4 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] flex flex-row items-center justify-between gap-3">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffe600] border-3 border-slate-950 flex items-center justify-center font-mono font-black text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] shrink-0">
              <BookOpen size={18} />
            </div>
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-100 whitespace-nowrap">
              PILIH TUGAS LKPD:
            </span>
          </div>

          {/* Dropdown Button Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundService.click();
                setIsDropdownOpen(prev => !prev);
              }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 font-mono font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-3 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 ${
                isDropdownOpen
                  ? 'bg-[#ffe600] text-slate-950'
                  : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span className="tracking-wide uppercase font-black whitespace-nowrap">
                LKPD {selectedIdx >= 0 ? selectedIdx + 1 : 1}
              </span>

              {isDone ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-mono font-black border-2 border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Selesai</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 border-2 border-slate-950 text-[10px] font-mono font-black shadow-[1px_1px_0px_0px_#0f172a]">
                  Belum
                </span>
              )}

              {/* Chevron Down Button */}
              <div
                className={`w-7 h-7 rounded-xl bg-[#a5f3fc] border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a] transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 bg-[#ffe600]' : ''
                }`}
              >
                <ChevronDown size={16} className="stroke-[2.5]" />
              </div>
            </button>

            {/* Dropdown Menu Panel (Opens right underneath) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 sm:w-64 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] p-2 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="space-y-1">
                  {lkpdList.map((item, idx) => {
                    const isCurrent = item.id === (selectedLkpd?.id || selectedLkpdId);
                    const sub = db.lkpdSubmissions.find(
                      s => s.studentId === currentUser.id && s.lkpdId === item.id
                    );
                    const itemDone = Boolean(sub);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectLkpd(item.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-[#ffe600] border-slate-950 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-850 border-slate-300 dark:border-slate-700 hover:border-slate-950 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <span className="font-mono font-black text-xs uppercase">
                          LKPD {idx + 1}
                        </span>

                        <div className="shrink-0">
                          {itemDone ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-white font-mono text-[10px] font-black border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              <span>Selesai</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-slate-950 font-mono text-[10px] font-black">
                              Belum
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleOpenPdfPreview = () => {
    if (!selectedLkpd) return;
    soundService.click();
    const lkpdIdx = lkpdList.findIndex(l => l.id === selectedLkpd.id);
    const displayIdx = lkpdIdx >= 0 ? lkpdIdx + 1 : 1;
    setPreviewDocItem({
      title: selectedLkpd.title,
      url: selectedLkpd.pdfUrl || selectedLkpd.imageUrl,
      type: selectedLkpd.pdfUrl ? 'pdf' : 'image',
      name: selectedLkpd.pdfFilename || (selectedLkpd.pdfUrl ? `${selectedLkpd.title}.pdf` : undefined),
      chapterCode: `LKPD ${displayIdx}`,
      badge: 'Lembar Kerja Peserta Didik',
      summary: selectedLkpd.objectives || selectedLkpd.description,
      fileSize: selectedLkpd.pdfUrl ? 'Dokumen PDF' : 'Berkas Gambar'
    });
  };

  const renderPdfModal = () => (
    <DocumentPreviewModal
      item={previewDocItem}
      onClose={() => setPreviewDocItem(null)}
    />
  );

  // 1. COMPLETED SUBMISSION VIEW
  if (existingSubmission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in">
        {renderLkpdSelector()}

        {/* Banner Selesai */}
        <div className="rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a]">
                <Trophy size={32} className="text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-mono font-black uppercase bg-white px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] text-slate-950">
                  LKPD SELESAI
                </span>
                <h1 className="text-2xl font-black font-mono mt-1 text-slate-950">
                  Lembar Kerja Berhasil Dikumpulkan
                </h1>
              </div>
            </div>

            <div className="px-4 py-2 bg-white rounded-2xl border-3 border-slate-950 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a]">
              Status: {existingSubmission.status === 'Dinilai' ? 'Telah Dinilai Guru' : 'Menunggu Nilai Guru'}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
            Seluruh jawaban kegiatan LKPD telah tersimpan di sistem dan diserahkan kepada Guru. Di bawah ini kamu dapat meninjau jawabanmu dan mencocokkannya dengan langkah pembahasan konsep resmi.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold pt-1">
            <span className="px-3 py-1.5 bg-white text-slate-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              📅 Tanggal Pengumpulan: {existingSubmission.date}
            </span>
            <span className="px-3 py-1.5 bg-emerald-200 text-emerald-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🛡 Tab Integrity: {existingSubmission.antiCheat?.switchCount || 0}x Pindah Tab
            </span>
          </div>

          {/* Nilai & Catatan Evaluasi Guru / Status Penilaian */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#1f2937] rounded-2xl border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-700 pb-2.5">
              <div className="flex items-center gap-2 font-mono font-black text-sm text-slate-950 dark:text-slate-100">
                <Trophy size={18} className="text-amber-500" />
                <span>Hasil Penilaian &amp; Catatan Guru</span>
              </div>
              <div className="flex items-center gap-2">
                {existingSubmission.isAiEvaluated ? (
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-950/20">
                    Rekomendasi AI: {existingSubmission.aiScore ?? 0} / 100
                  </span>
                ) : (
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-950/20">
                    AI: Belum Dikoreksi
                  </span>
                )}
                <span className={`text-xs font-mono font-black px-3 py-1 rounded-xl border-2 border-slate-950 ${
                  existingSubmission.teacherScore !== null ? 'bg-[#ffe600] text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {existingSubmission.teacherScore !== null
                    ? `Nilai Guru: ${existingSubmission.teacherScore} / 100`
                    : 'Belum Dinilai Guru'}
                </span>
              </div>
            </div>

            {existingSubmission.teacherFeedback ? (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 rounded-xl border-2 border-amber-400/60 dark:border-amber-700/60 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                <span className="font-mono font-black text-amber-950 dark:text-amber-400 block mb-1">
                  Catatan Evaluasi / Bimbingan Guru:
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {existingSubmission.teacherFeedback}
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                {existingSubmission.teacherScore !== null
                  ? 'Guru telah memberikan nilai final tanpa catatan tambahan.'
                  : 'Guru pengampu sedang memeriksa pengerjaanmu. Nilai final dan feedback bimbingan akan segera muncul di sini dan menu Nilai.'}
              </p>
            )}
          </div>

          {/* PDF Attachment button in Review */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-800 truncate">
              <FileText size={18} className="text-cyan-800 shrink-0" />
              <span className="truncate">Dokumen PDF Resmi: {selectedLkpd?.pdfFilename}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenPdfPreview}
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
                  ASISTEN AI SEDANG MENELAAH LANGKAH PENGERJAANMU...
                </span>
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                  Menganalisis penalaran konsep pecahan, penyamaan penyebut KPK, dan menyiapkan pembahasan bertahap.
                </span>
              </div>
            </div>
          ) : (
            !existingSubmission.isAiEvaluated ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fffdf0] dark:bg-[#18181b] border-4 border-slate-950 dark:border-amber-600 rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-[#ffe600] border-3 border-slate-950 rounded-2xl text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100 flex items-center gap-2">
                      <span>Bimbingan &amp; Solusi Koreksi AI</span>
                      <span className="text-[11px] font-mono font-black bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-950/20">
                        Opsional
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                      Ingin tahu evaluasi langkah hitungmu serta melihat solusi langkah demi langkah versi AI? Klik tombol untuk menjalankan koreksi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAiCorrectionForReview(true)}
                  className="px-6 py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-black border-3 border-slate-950 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                >
                  <Sparkles size={18} />
                  <span>Minta Koreksi AI</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl text-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100">
                      Tinjauan Jawaban &amp; Pembahasan Soal
                    </h2>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {aiDiscussionUnlocked
                        ? 'Langkah konsep pembahasan resmi per soal sedang terbuka.'
                        : 'Pembahasan sedang disembunyikan. Klik tombol di samping untuk membukanya.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRunAiCorrectionForReview(true)}
                    className="px-3.5 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-slate-950 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    title="Koreksi ulang dengan AI"
                  >
                    <RefreshCw size={14} />
                    <span>Koreksi Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiDiscussionUnlocked(!aiDiscussionUnlocked)}
                    className={`px-5 py-3 rounded-2xl font-mono text-xs font-black border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      aiDiscussionUnlocked
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        : 'bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>{aiDiscussionUnlocked ? 'Sembunyikan Pembahasan' : 'Tampilkan Pembahasan'}</span>
                  </button>
                </div>
              </div>
            )
          )}

          {questions.map((q, idx) => {
            const ans = existingSubmission.answers?.[q.id] || { textAnswer: '' };
            const photo = ans.photoUrl || (idx === 0 ? existingSubmission.photoUrl : undefined);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-4"
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

                {/* Official Step-by-Step Discussion & AI Solution Separation */}
                {aiDiscussionUnlocked ? (
                  <div className="space-y-3 animate-in fade-in">
                    {/* Blok Jawaban & Solusi Langkah Versi AI */}
                    {(() => {
                      const aiAnswerText = ans.aiAnswer || evaluateLKPDWithRubric([q], { [q.id]: ans }).perQuestion[q.id]?.aiAnswer || "Langkah penyelesaian pecahan versi AI telah dihitung.";
                      return (
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border-3 border-slate-950 dark:border-purple-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] space-y-2">
                          <div className="flex items-center justify-between text-purple-950 dark:text-purple-300 font-mono text-xs font-black">
                            <div className="flex items-center gap-2">
                              <Bot size={18} className="text-purple-700 dark:text-purple-400" />
                              <span>JAWABAN &amp; SOLUSI LANGKAH VERSI AI (KEGIATAN {idx + 1}):</span>
                            </div>
                            <span className="text-[11px] font-black bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded-md border border-purple-950/20">
                              Skor AI: {ans.aiScore ?? 0} Poin
                            </span>
                          </div>

                          <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-purple-950/20 dark:border-purple-800/40">
                            {aiAnswerText}
                          </pre>

                          {ans.aiFeedback && (
                            <div className="text-[11px] font-mono font-bold text-purple-950 dark:text-purple-300 pt-1.5 border-t border-purple-200 dark:border-purple-800 flex items-start gap-1">
                              <span className="shrink-0 font-black">Diagnosa AI:</span>
                              <span>{ans.aiFeedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Blok Pembahasan Jawaban Guru (Kunci Guru) */}
                    {q.discussion && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-3 border-slate-950 dark:border-emerald-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] space-y-2">
                        <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-300 font-mono text-xs font-black">
                          <BookOpen size={18} className="text-emerald-700 dark:text-emerald-400" />
                          <span>PEMBAHASAN JAWABAN (KUNCI GURU):</span>
                        </div>

                        <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-emerald-950/20 dark:border-emerald-800/40">
                          {q.discussion}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {existingSubmission.isAiEvaluated ? (
                        <>🔒 Langkah konsep &amp; solusi AI disembunyikan. Tekan tombol <strong className="text-cyan-700 dark:text-cyan-400">"Tampilkan Pembahasan"</strong> di atas.</>
                      ) : (
                        <>🔒 Belum dikoreksi AI. Tekan tombol <strong className="text-amber-700 dark:text-amber-400">"Minta Koreksi AI"</strong> di atas jika ingin memunculkan evaluasi dan solusi langkah resmi.</>
                      )}
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
              Latihan Soal Kuis Pilihan Ganda siap dikerjakan.
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('siswa/latsol')}
              className="px-6 py-3 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Lanjut ke Latihan Soal</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {renderPdfModal()}
      </div>
    );
  }

  // 2. COVER / INTRO & PDF VIEW (If student hasn't entered solving mode yet)
  if (!isSolvingMode) {
    const totalPoints = questions.reduce((a, q) => a + (q.weight || 0), 0);

    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in">
        {renderLkpdSelector()}

        {/* Hero Banner LKPD Cover */}
        <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-white border-3 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a]">
                <BookOpen size={30} className="text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-black uppercase bg-white px-3 py-1 rounded-xl border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    LEMBAR KERJA PESERTA DIDIK
                  </span>
                  <span className="text-[11px] font-mono font-black uppercase bg-[#a5f3fc] px-2.5 py-1 rounded-xl border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    TAHAP 1
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight">
                  {selectedLkpd?.title || 'LKPD Digital'}
                </h1>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-white rounded-2xl border-3 border-slate-950 font-mono text-xs font-black shadow-[3px_3px_0px_0px_#0f172a] self-start sm:self-auto">
              {questions.length} Butir Kegiatan
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed max-w-3xl">
            {selectedLkpd?.description || 'Lembar kerja interaktif untuk melatih pemahaman dan kemampuan menganalisis konsep matematika.'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono font-bold pt-1">
            <span className="px-3 py-1 bg-white text-slate-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🎯 Total Bobot: {totalPoints} Poin
            </span>
            <span className="px-3 py-1 bg-sky-200 text-sky-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              🛡 Anti-Cheat System
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-950 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              Status: Siap Dikerjakan
            </span>
          </div>
        </div>

        {/* Bento 2 Kolom: Langkah 1 & Langkah 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kartu 1: Tujuan Pembelajaran & Petunjuk */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  LANGKAH 1
                </span>
                <h3 className="font-mono font-black text-sm text-slate-950 dark:text-slate-100">
                  Tujuan Pembelajaran &amp; Petunjuk
                </h3>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {selectedLkpd?.objectives || 'Pelajari materi operasi pecahan, kerjakan setiap butir kegiatan dengan langkah hitung terperinci, dan unggah foto lembar pengerjaan fisik bila diminta.'}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-900/30 rounded-2xl text-[11px] font-bold text-amber-950 dark:text-amber-300">
              💡 <strong>Instruksi Guru:</strong> Bacalah petunjuk pengerjaan di atas dan pelajari dokumen PDF sebelum mulai menjawab kegiatan.
            </div>
          </div>

          {/* Kartu 2: Berkas Dokumen PDF Resmi Guru */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
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
                      {selectedLkpd?.pdfFilename || 'Lembar_Kerja_Peserta_Didik.pdf'}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                      Berkas Resmi Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {selectedLkpd?.imageUrl && (
                <div className="rounded-2xl overflow-hidden border-2 border-slate-950 dark:border-slate-800 max-h-36">
                  <img src={selectedLkpd.imageUrl} alt={selectedLkpd.title} className="w-full h-36 object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenPdfPreview}
                className="flex-1 px-4 py-2.5 rounded-xl font-mono font-black text-xs bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Eye size={16} />
                <span>Buka Dokumen PDF</span>
              </button>

              {selectedLkpd?.pdfUrl && (
                <a
                  href={getPdfDisplayUrl(selectedLkpd.pdfUrl)}
                  download={selectedLkpd.pdfFilename || 'LKPD_Pecahan.pdf'}
                  className="px-4 py-2.5 rounded-xl font-mono font-black text-xs bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tombol CTA Masuk ke Lembar Pengerjaan Kegiatan (Button-in-Button Architecture) */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-mono font-black text-base sm:text-lg text-slate-950 dark:text-slate-100">
              Siap Memulai Pengerjaan?
            </h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Klik tombol di samping untuk masuk ke lembar kerja Kegiatan 1 sampai Kegiatan {questions.length}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundService.click();
              setIsSolvingMode(true);
              setActiveQuestionIdx(0);
            }}
            className="group px-6 py-4 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer shrink-0 flex items-center justify-center gap-3 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Mulai Kerjakan Kegiatan LKPD</span>
            <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight size={16} />
            </div>
          </button>
        </div>

        {renderPdfModal()}
      </div>
    );
  }

  // 3. ACTIVE QUIZ-STYLE STEPPER VIEW (When isSolvingMode === true)
  const currentQ = questions[activeQuestionIdx] || questions[0];
  const currentAns = answers[currentQ?.id] || { textAnswer: '', photoUrl: '' };
  const answeredCount = questions.filter(q => (answers[q.id]?.textAnswer || '').trim().length > 0).length;
  const totalQuestions = questions.length;
  const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12">
      {renderLkpdSelector()}

      {/* Top Solving Navigation Bar with Linear Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
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
            onClick={handleOpenPdfPreview}
            className="px-3.5 py-2 rounded-xl bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 border-2 border-slate-950 font-mono font-black text-xs shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>Lihat Dokumen PDF</span>
          </button>
        </div>

        {/* Visual Linear Progress Bar */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-28 sm:w-40 bg-slate-200 dark:bg-slate-800 h-3 rounded-full border-2 border-slate-950 overflow-hidden shadow-[1px_1px_0px_0px_#0f172a]">
            <div
              className="bg-[#ffe600] h-full transition-all duration-300 border-r-2 border-slate-950"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="font-mono text-xs font-black bg-[#ffe600] px-3 py-1.5 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-slate-950">
            {answeredCount}/{totalQuestions} Selesai
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
        {questions.map((q, idx) => {
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
            <h2 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100 mb-2">
              {currentQ.title}
            </h2>

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
              <label className="flex items-center justify-center gap-2 p-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300 active:translate-y-0.5">
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
          {aiDiscussionUnlocked && (
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
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-200 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
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
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-200 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Berikutnya</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmitLKPD}
            disabled={!isAllAnswered || isAiLoading}
            className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 disabled:opacity-50 text-slate-950 border-3 border-slate-950 rounded-2xl font-mono text-xs sm:text-sm font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Send size={16} />
            <span>Kirim Jawaban</span>
          </button>
        </div>
      </div>

      {renderPdfModal()}
    </div>
  );
};

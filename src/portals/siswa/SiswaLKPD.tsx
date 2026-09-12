import React, { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LKPDItem, LKPDSubmission, LKPDEssayAnswer } from '@/types';
import { compressImage } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import { evaluateLKPDWithAI, LKPDOverallEvaluation } from '@/services/aiCorrectionService';
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
  HelpCircle,
  Clock,
  Loader2,
  RefreshCw
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
  const selectedLkpd = lkpdList[0]; // Active LKPD Bab Pecahan
  const questions = selectedLkpd?.questions || [];

  const existingSubmission = db.lkpdSubmissions.find(
    s => s.studentId === currentUser.id && s.lkpdId === selectedLkpd?.id
  );

  // Stepper state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, LKPDEssayAnswer>>({});
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiDiscussionUnlocked, setAiDiscussionUnlocked] = useState<boolean>(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<LKPDOverallEvaluation | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Anti-Cheat Monitor Active while solving
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
      setAiDiscussionUnlocked(false);
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
    showToast("Foto berhasil dihapus.", "info");
  };

  // Completion check
  const totalQuestions = questions.length;
  const answeredCount = Object.values(answers).filter(a => (a?.textAnswer || '').trim().length > 0).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  // Live On-Demand AI Evaluation for Student (NO score shown to student)
  const handleRunAiCorrection = async (force: boolean = false) => {
    soundService.click();
    if (!isAllAnswered) {
      soundService.alert();
      showToast(`Harap lengkapi semua ${totalQuestions} butir kegiatan LKPD sebelum meminta koreksi AI!`, "error");
      return;
    }

    // Toggle hide if already unlocked and not forcing re-evaluation
    if (!force && aiDiscussionUnlocked && aiEvaluationResult) {
      setAiDiscussionUnlocked(false);
      return;
    }

    setIsAiLoading(true);
    showToast("Asisten AI sedang menelaah langkah jawaban & lembar coretanmu (OpenRouter)...", "info");

    try {
      const evalResult = await evaluateLKPDWithAI(questions, answers);
      setAiEvaluationResult(evalResult);
      setIsAiLoading(false);
      setAiDiscussionUnlocked(true);
      soundService.success();
      confetti({ particleCount: 70, spread: 80 });
      showToast("Evaluasi AI Live Selesai! Cermati analisis dan langkah pembahasan konsep resmi.", "success");
    } catch {
      setIsAiLoading(false);
      setAiDiscussionUnlocked(true);
      showToast("Langkah pembahasan konsep resmi dibuka.", "info");
    }
  };

  // Live AI Evaluation for Submitted Review View
  const handleRunAiCorrectionForReview = async (force: boolean = false) => {
    soundService.click();

    if (!force && aiDiscussionUnlocked && aiEvaluationResult) {
      setAiDiscussionUnlocked(false);
      return;
    }

    setIsAiLoading(true);
    showToast("Asisten AI sedang menelaah kembali jawaban yang telah dikirim...", "info");

    try {
      const submissionAnswers = existingSubmission?.answers || answers;
      const evalResult = await evaluateLKPDWithAI(questions, submissionAnswers);
      setAiEvaluationResult(evalResult);
      setIsAiLoading(false);
      setAiDiscussionUnlocked(true);
      soundService.success();
      confetti({ particleCount: 60, spread: 70 });
      showToast("Evaluasi AI Live Selesai! Cermati langkah pembahasan konsep resmi.", "success");
    } catch {
      setIsAiLoading(false);
      setAiDiscussionUnlocked(true);
      showToast("Langkah pembahasan konsep resmi dibuka.", "info");
    }
  };

  // Submit LKPD to Teacher
  const handleSubmitLKPD = async () => {
    soundService.click();
    if (!isAllAnswered) {
      soundService.alert();
      showToast("Ketikkan jawaban untuk semua kegiatan sebelum mengirim ke Guru!", "error");
      return;
    }

    showToast("Memproses evaluasi akhir AI dan mengirim ke Guru...", "info");
    const antiCheatReport = getReport();

    // Use cached AI evaluation or compute now with real LLM
    const aiEval = aiEvaluationResult || await evaluateLKPDWithAI(questions, answers);

    // Merge AI question feedbacks and detailed diagnostic into answers record
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
      lkpdId: selectedLkpd?.id || "lkpd_1",
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
        s => !(s.studentId === currentUser.id && s.lkpdId === (selectedLkpd?.id || "lkpd_1"))
      );
      draft.lkpdSubmissions.push(newSubmission);

      // Mark student progress
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 100, video: 100, lkpd: 0, latsol: 0, evaluasi: 0 };
        user.progress.lkpd = 100;
      }
    });

    soundService.success();
    confetti({ particleCount: 100, spread: 80 });
    showToast("LKPD Digital Berhasil Dikirim ke Guru! Tahap Latihan Soal kini terbuka.", "success");
  };

  // 1. COMPLETED SUBMISSION VIEW
  if (existingSubmission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in">
        {/* Banner Selesai */}
        <div className="rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]">
                <Trophy size={32} className="text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-mono font-black uppercase bg-white px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-slate-950">
                  LKPD DIGITAL SELESAI
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
                  <h2 className="text-base sm:text-lg font-black font-mono text-slate-950 dark:text-slate-100">
                    Tinjauan Jawaban &amp; Pembahasan Soal
                  </h2>
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

          {questions.map((q, idx) => {
            const ans = existingSubmission.answers?.[q.id] || { textAnswer: '' };
            const photo = ans.photoUrl || (idx === 0 ? existingSubmission.photoUrl : undefined);
            const liveFeedback = aiEvaluationResult?.perQuestion?.[q.id]?.conceptFeedback || ans.aiFeedback;

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

                {/* Official Step-by-Step Discussion (Only shown if student pressed Koreksi AI button - NO score shown) */}
                {aiDiscussionUnlocked ? (
                  <div className="p-4 bg-[#a5f3fc]/30 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-800 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-mono text-xs font-black">
                      <Bot size={18} className="text-cyan-800 dark:text-cyan-400" />
                      <span>PEMBAHASAN &amp; BIMBINGAN ASISTEN AI (KEGIATAN {idx + 1}):</span>
                    </div>

                    {/* AI Feedback for Student (No score shown) */}
                    {liveFeedback && (
                      <div className="p-3 bg-white/95 dark:bg-slate-900/95 rounded-xl border border-cyan-800/30 text-xs font-bold text-slate-900 dark:text-slate-100 space-y-1">
                        <span className="font-mono font-black text-cyan-900 dark:text-cyan-300 text-[11px] block">
                          💡 Catatan &amp; Diagnosa AI untuk Jawabanmu:
                        </span>
                        <p className="leading-relaxed">
                          {liveFeedback}
                        </p>
                      </div>
                    )}

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
        <div className="flex justify-between items-center bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
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
              className="px-6 py-3 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Lanjut ke Latihan Soal</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ-STYLE STEPPER VIEW
  const currentQ = questions[activeQuestionIdx] || questions[0];
  const currentAns = answers[currentQ?.id] || { textAnswer: '', photoUrl: '' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              LKPD DIGITAL INTERAKTIF
            </span>
            <span className="px-3 py-0.5 bg-[#a5f3fc] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              TAHAP 1 (WAJIB)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-mono">
            Lembar Kerja Peserta Didik: Bab Pecahan
          </h1>
          <p className="text-xs font-bold text-slate-900 mt-1">
            Kerjakan setiap kegiatan secara berurutan. Ketik langkah pengerjaanmu dan lampirkan foto lembar coretan (opsional).
          </p>
        </div>

        {/* Status Counter */}
        <div className="px-4 py-2.5 rounded-2xl border-3 border-slate-950 bg-white font-mono text-xs font-black shadow-[4px_4px_0px_0px_#0f172a] shrink-0">
          Progres: {answeredCount}/{totalQuestions} Selesai
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
              <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <Upload size={16} />
                <span>Pilih Foto Lembar Coretan dari Galeri / Kamera</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(currentQ.id, e)}
                />
              </label>
            )}
          </div>

          {/* AI Discussion Box (Unlocked ONLY after clicking Koreksi AI) - Only shows concept steps & student diagnostic, NO score */}
          {isAiLoading ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-100/80 dark:bg-cyan-950/60 border-3 border-cyan-800 dark:border-cyan-600 shadow-[4px_4px_0px_0px_#083344] animate-pulse">
              <Loader2 size={24} className="animate-spin text-cyan-800 dark:text-cyan-300 shrink-0" />
              <div>
                <span className="font-mono text-xs font-black block text-cyan-950 dark:text-cyan-100">
                  ASISTEN AI SEDANG MENELAAH LANGKAH PENGERJAANMU (OPENROUTER)...
                </span>
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                  Menganalisis penalaran aljabar pecahan, penyamaan penyebut KPK, dan menyiapkan bimbingan bertahap.
                </span>
              </div>
            </div>
          ) : aiDiscussionUnlocked ? (
            <div className="p-4 bg-[#a5f3fc]/30 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-700 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-cyan-950 dark:text-cyan-300 font-mono text-xs font-black border-b border-cyan-950/20 pb-2">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-cyan-800 dark:text-cyan-400" />
                  <span>PEMBAHASAN &amp; BIMBINGAN ASISTEN AI (KEGIATAN {activeQuestionIdx + 1}):</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunAiCorrection(true)}
                    className="text-[11px] font-bold font-mono text-cyan-900 dark:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Koreksi ulang dengan AI"
                  >
                    <RefreshCw size={12} />
                    <span>Koreksi Ulang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiDiscussionUnlocked(false)}
                    className="text-[10px] underline hover:opacity-75 cursor-pointer font-bold"
                  >
                    Tutup Pembahasan
                  </button>
                </div>
              </div>

              {/* Personalized AI Analysis for student's own answer (NO score shown) */}
              {aiEvaluationResult?.perQuestion?.[currentQ.id]?.conceptFeedback && (
                <div className="p-3 bg-white/95 dark:bg-slate-900/95 rounded-xl border-2 border-cyan-950/20 dark:border-cyan-800/40 text-xs font-bold text-slate-900 dark:text-slate-100 space-y-1">
                  <span className="font-mono font-black text-cyan-900 dark:text-cyan-300 text-[11px] block">
                    💡 Catatan &amp; Diagnosa AI untuk Jawabanmu:
                  </span>
                  <p className="leading-relaxed">
                    {aiEvaluationResult.perQuestion[currentQ.id].conceptFeedback}
                  </p>
                </div>
              )}

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
          {/* Koreksi AI Button: Active when all questions are answered */}
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

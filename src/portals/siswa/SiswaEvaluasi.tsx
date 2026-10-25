import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, AntiCheatReport, EvaluationSubmission } from '@/types';
import { compressImage, compressImageFile } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import { evaluateLKPDWithAI, evaluateLKPDWithRubric, type LKPDOverallEvaluation } from '@/services/aiCorrectionService';
import {
  PenTool,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  FileCheck,
  Send,
  Trash2,
  Upload,
  X,
  Maximize2,
  Bot,
  RefreshCw,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

function calculateEvaluasiScore(
  questions: { id: string; weight: number }[],
  answers: Record<string, string>,
  photos: Record<string, string>
): number {
  let totalScore = 0;
  questions.forEach((q, idx) => {
    const w = q.weight || 20;
    const txt = (answers[q.id] || '').trim().toLowerCase();
    const hasP = Boolean(photos[q.id] && photos[q.id].length > 50);

    if (!txt && !hasP) {
      return;
    }

    const isRandom =
      ['jajajdh', 'shshshsh', 'hdhshjaknlns', 'jjj', 'asdf', 'qwerty', 'zzzz'].some(k => txt.includes(k)) ||
      (txt.length > 0 && txt.length < 4 && !/\d/.test(txt));

    if (isRandom && !hasP) {
      return;
    }

    let earnedRatio = 0;

    if (q.id === 'eq_1' || idx === 0) {
      const isCorrect = txt.includes('1 3/20') || txt.includes('23/20') || txt.includes('1.15');
      const hasSteps = txt.includes('20') || txt.includes('kpk') || txt.includes('15/20') || txt.includes('8/20');
      if (isCorrect && hasSteps) earnedRatio = 1.0;
      else if (isCorrect) earnedRatio = 0.90;
      else if (hasSteps && hasP) earnedRatio = 0.85;
      else if (hasSteps) earnedRatio = 0.65;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    } else if (q.id === 'eq_2' || idx === 1) {
      const isCorrect = txt.includes('9') || txt.includes('sembilan');
      const hasSteps = txt.includes('15/2') || txt.includes('6/5') || txt.includes('90/10') || txt.includes(':') || txt.includes('/');
      if (isCorrect && hasSteps) earnedRatio = 1.0;
      else if (isCorrect) earnedRatio = 0.90;
      else if (hasSteps && hasP) earnedRatio = 0.85;
      else if (hasSteps) earnedRatio = 0.65;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    } else if (q.id === 'eq_3' || idx === 2) {
      const isCorrect = txt.includes('70') || txt.includes('tujuh puluh');
      const hasSteps = txt.includes('7/3') || txt.includes('210/3') || txt.includes('30');
      if (isCorrect && hasSteps) earnedRatio = 1.0;
      else if (isCorrect) earnedRatio = 0.90;
      else if (hasSteps && hasP) earnedRatio = 0.85;
      else if (hasSteps) earnedRatio = 0.65;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    } else if (q.id === 'eq_4' || idx === 3) {
      const isCorrect = txt.includes('15') || txt.includes('lima belas');
      const hasSteps = txt.includes('9/2') || txt.includes('10/3') || txt.includes('90/6');
      if (isCorrect && hasSteps) earnedRatio = 1.0;
      else if (isCorrect) earnedRatio = 0.90;
      else if (hasSteps && hasP) earnedRatio = 0.85;
      else if (hasSteps) earnedRatio = 0.65;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    } else if (q.id === 'eq_5' || idx === 4) {
      const hasA = txt.includes('24.000') || txt.includes('24000');
      const hasB = txt.includes('15.000') || txt.includes('15000');
      const hasC = txt.includes('21.000') || txt.includes('21000');
      const count = (hasA ? 1 : 0) + (hasB ? 1 : 0) + (hasC ? 1 : 0);
      if (count === 3) earnedRatio = 1.0;
      else if (count === 2) earnedRatio = 0.85;
      else if (count === 1) earnedRatio = 0.60;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    } else {
      if (txt.length > 25) earnedRatio = 0.70;
      else if (hasP && !isRandom) earnedRatio = 0.40;
    }

    totalScore += Math.round(w * earnedRatio);
  });

  return Math.min(100, Math.max(0, totalScore));
}

export const SiswaEvaluasi: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const [db, setDb] = useState(storageService.getState());

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDb(newState);
    });
  }, []);

  const [bypassPrerequisite, setBypassPrerequisite] = useState<boolean>(false);
  const hasCompletedLKPD = db.lkpdSubmissions.some(s => s.studentId === currentUser.id) || (currentUser.progress?.lkpd || 0) >= 100;
  const hasCompletedLatsol = (db.latsolSubmissions && db.latsolSubmissions.some(s => s.studentId === currentUser.id)) || (currentUser.progress?.latsol || 0) > 0;
  const isPrerequisiteMet = (hasCompletedLKPD && hasCompletedLatsol) || bypassPrerequisite;

  const previousSubmission = [...(db.evaluationSubmissions || [])]
    .filter(s => s.studentId === currentUser.id)
    .sort((a, b) => {
      const timeA = parseInt(a.id?.split('_').pop() || '0') || 0;
      const timeB = parseInt(b.id?.split('_').pop() || '0') || 0;
      return timeB - timeA;
    })[0];

  const questions = db.evaluationQuestions || [];
  const evalDurationMinutes = db.evaluationDurationMinutes || 30;
  const evalDurationSeconds = evalDurationMinutes * 60;

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(evalDurationSeconds);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draftKey = `eval_draft_${currentUser.id}`;
  const draftLoadedRef = useRef<boolean>(false);

  // Restore draft pengerjaan saat mount (Tahan refresh halaman)
  useEffect(() => {
    if (!isPrerequisiteMet || previousSubmission || draftLoadedRef.current) return;
    draftLoadedRef.current = true;

    try {
      const rawDraft = localStorage.getItem(draftKey);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed.textAnswers) setTextAnswers(parsed.textAnswers);
        if (parsed.photos) setPhotos(parsed.photos);
        if (typeof parsed.activeIdx === 'number' && parsed.activeIdx >= 0) {
          setActiveQuestionIdx(parsed.activeIdx);
        }

        // Restore anti-cheat switch count so it NEVER resets to 0 on refresh!
        if (parsed.antiCheat) {
          restoreReport(parsed.antiCheat);
        } else if (typeof parsed.switchCount === 'number') {
          restoreReport({ switchCount: parsed.switchCount, totalLeaveSeconds: 0, log: [] });
        }

        // Hitung sisa waktu berdasarkan deadline timestamp agar timer tidak reset ulang
        if (parsed.deadline) {
          const remaining = Math.max(10, Math.round((parsed.deadline - Date.now()) / 1000));
          setTimeLeft(remaining);
        } else if (typeof parsed.timeLeft === 'number') {
          setTimeLeft(parsed.timeLeft);
        }
        showToast("Draft pengerjaan evaluasi berhasil dipulihkan otomatis!", "info");
      } else {
        // Simpan deadline awal sesuai durasi dinamis dari Guru
        const initialDeadline = Date.now() + evalDurationSeconds * 1000;
        localStorage.setItem(draftKey, JSON.stringify({
          textAnswers: {},
          photos: {},
          deadline: initialDeadline,
          durationMinutes: evalDurationMinutes,
          activeIdx: 0
        }));
      }
    } catch (e) {
      console.warn("Draft restore warning:", e);
    }
  }, [isPrerequisiteMet, previousSubmission, currentUser.id, evalDurationSeconds, evalDurationMinutes]);

  // Auto-save draft setiap ada perubahan jawaban teks, foto, atau posisi soal
  useEffect(() => {
    if (!isPrerequisiteMet || previousSubmission || !draftLoadedRef.current) return;

    try {
      const rawDraft = localStorage.getItem(draftKey);
      let deadline = Date.now() + timeLeft * 1000;
      if (rawDraft) {
        try {
          const p = JSON.parse(rawDraft);
          if (p.deadline) deadline = p.deadline;
        } catch {}
      }

      localStorage.setItem(draftKey, JSON.stringify({
        textAnswers,
        photos,
        deadline,
        activeIdx: activeQuestionIdx,
        switchCount,
        antiCheat: getReport()
      }));
    } catch (e) {
      console.warn("Draft save warning:", e);
    }
  }, [textAnswers, photos, activeQuestionIdx, isPrerequisiteMet, previousSubmission]);

  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showAiDiscussion, setShowAiDiscussion] = useState<boolean>(true);

  // Anti-Cheat Tab Monitor Active while taking exam
  const { switchCount, getReport, resetReport, restoreReport, pauseAntiCheat, markFilePickerOpen, markFilePickerClosed } = useAntiCheat({
    active: isPrerequisiteMet && !previousSubmission && !isSubmitting,
    onViolation: (msg, count) => {
      soundService.alert();
      showToast(msg, 'error');
      const nextCount = count || switchCount + 1;

      // Instantly persist violation to localStorage draft so it survives refresh!
      try {
        const rawDraft = localStorage.getItem(draftKey);
        const currentDraft = rawDraft ? JSON.parse(rawDraft) : {};
        currentDraft.switchCount = nextCount;
        currentDraft.antiCheat = {
          switchCount: nextCount,
          totalLeaveSeconds: currentDraft.antiCheat?.totalLeaveSeconds || 0,
          log: currentDraft.antiCheat?.log || []
        };
        localStorage.setItem(draftKey, JSON.stringify(currentDraft));
      } catch {}
    }
  });

  // Countdown timer
  useEffect(() => {
    if (!isPrerequisiteMet || previousSubmission) return;

    if (timeLeft <= 0) {
      soundService.alert();
      showToast("Waktu evaluasi habis! Mengumpulkan jawaban otomatis...", "info");
      handleAutoSubmitOnTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPrerequisiteMet, previousSubmission, timeLeft]);

  const handleTextChange = (qId: string, text: string) => {
    setTextAnswers(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  const handlePhotoSelect = async (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Mengompresi foto lembar coretan...", "info");
    try {
      // Compress to optimal dimensions and quality: ~35-50KB per photo
      const compressed = await compressImageFile(file, 720, 0.55);
      setPhotos(prev => ({
        ...prev,
        [qId]: compressed
      }));
      soundService.click();
      showToast("Foto lembar coretan soal ini berhasil dilampirkan!", "success");
    } catch (err) {
      console.warn("Photo select err:", err);
      showToast("Gagal memproses foto. Silakan coba lagi.", "error");
    }
    e.target.value = '';
  };

  const handleRemovePhoto = (qId: string) => {
    soundService.click();
    setPhotos(prev => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
    showToast("Foto lembar coretan soal ini telah dihapus.", "info");
  };

  const handleAutoSubmitOnTimeout = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    soundService.click();

    // Clean photos map to only include valid photos for registered questions
    const cleanPhotos: Record<string, string> = {};
    questions.forEach(q => {
      if (photos[q.id] && typeof photos[q.id] === 'string' && photos[q.id].trim().length > 50) {
        cleanPhotos[q.id] = photos[q.id].trim();
      }
    });
    const photoList = Object.values(cleanPhotos).filter(Boolean);
    const hasAnyPhoto = photoList.length > 0;
    const hasAnyText = Object.values(textAnswers).some(t => t.trim().length > 0);

    if (!hasAnyText && !hasAnyPhoto) {
      soundService.alert();
      showToast("Ketik jawaban uraian atau unggah foto pengerjaan terlebih dahulu!", "error");
      return;
    }

    const cheatReport: AntiCheatReport = getReport();
    setIsSubmitting(true);

    // Hitung skor evaluasi instan dari rubrik matematika objektif (0ms, tahan offline, tanpa delay API)
    const calculatedScore = calculateEvaluasiScore(questions, textAnswers, cleanPhotos);

    const newSubmission: EvaluationSubmission = {
      id: `eval_${currentUser.id}_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7",
      date: new Date().toLocaleString('id-ID'),
      score: calculatedScore,
      gradingStatus: 'graded',
      aiEvaluation: undefined, // Dijalankan on-demand saat siswa menekan tombol "Koreksi AI"
      textAnswers: textAnswers,
      photoProof: cleanPhotos[questions[0]?.id] || photoList[0] || "",
      photoProofs: cleanPhotos,
      photoUrls: photoList,
      antiCheat: cheatReport,
      status: "Selesai"
    };

    // Bersihkan draft ujian setelah berhasil dikirim
    try {
      localStorage.removeItem(draftKey);
    } catch {}

    storageService.update(draft => {
      draft.evaluationSubmissions = draft.evaluationSubmissions.filter(
        s => s.studentId !== currentUser.id
      );
      draft.evaluationSubmissions.unshift(newSubmission);

      // Update progress
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 100, video: 100, lkpd: 100, latsol: 100, evaluasi: 0 };
        user.progress.evaluasi = calculatedScore;
      }
    });

    setIsSubmitting(false);
    soundService.success();
    confetti({ particleCount: 120, spread: 80 });
    showToast(`Evaluasi Uraian Berhasil Dikumpulkan! Skor Anda: ${calculatedScore}. Klik 'Koreksi AI' jika ingin ditelaah asisten AI.`, 'success');
  };

  const handleRunAiCorrection = async () => {
    if (!previousSubmission) return;
    soundService.click();
    setIsAiLoading(true);
    showToast("Menghubungi asisten AI untuk menelaah jawaban uraian & bukti coretan...", "info");

    try {
      const cleanPhotos = previousSubmission.photoProofs || {};
      const submissionAnswers = previousSubmission.textAnswers || {};
      const photoAnswers = Object.fromEntries(questions.map(question => [question.id, {
        textAnswer: submissionAnswers[question.id] || '',
        photoUrl: cleanPhotos[question.id] || undefined,
      }]));

      let photoEvaluation: LKPDOverallEvaluation;
      try {
        photoEvaluation = await evaluateLKPDWithAI(questions, photoAnswers);
      } catch (e) {
        console.warn("AI service fallback to rubric:", e);
        photoEvaluation = evaluateLKPDWithRubric(questions, photoAnswers);
      }

      const hasTextContent = Object.values(submissionAnswers).some(t => t.trim().length > 0);
      const isAiPhotoGraded = Boolean(photoEvaluation && photoEvaluation.reviewStatus === 'graded');
      const baseScore = previousSubmission.score;
      const finalScore = isAiPhotoGraded
        ? (photoEvaluation?.totalScore ?? baseScore)
        : baseScore;

      const updatedAiEvaluation = {
        totalScore: finalScore,
        overallFeedback: isAiPhotoGraded
          ? photoEvaluation.overallFeedback
          : (hasTextContent ? 'Evaluasi selesai ditelaah AI dari uraian jawaban teks. Foto coretan fisik tersimpan untuk arsip guru.' : photoEvaluation.overallFeedback),
        perQuestion: Object.fromEntries(Object.entries(photoEvaluation.perQuestion).map(([id, result]) => {
          const hasThisText = Boolean((submissionAnswers[id] || '').trim());
          const isNeedsReview = result.reviewStatus === 'needs_review';
          return [id, {
            score: isAiPhotoGraded ? result.score : Math.round((questions.find(q => q.id === id)?.weight || 20) * (finalScore / 100)),
            maxScore: result.maxScore,
            reviewStatus: hasThisText ? 'graded' : (result.reviewStatus || 'graded'),
            imageStatus: result.imageStatus || 'not_provided',
            imageSummary: result.imageSummary || '',
            diagnosa: (isNeedsReview && hasThisText)
              ? 'Foto coretan terlampir dan tersimpan aman. Nilai otomatis dihitung dari uraian jawaban teksmu (Guru dapat menyesuaikan nilai di Portal Guru).'
              : (result.diagnosa || ''),
            conceptFeedback: result.conceptFeedback || '',
          }];
        })),
      };

      storageService.update(draft => {
        const target = draft.evaluationSubmissions.find(s => s.id === previousSubmission.id || s.studentId === currentUser.id);
        if (target) {
          target.aiEvaluation = updatedAiEvaluation;
          if (isAiPhotoGraded) {
            target.score = finalScore;
          }
        }
        const user = draft.users.find(u => u.id === currentUser.id);
        if (user && user.progress) {
          user.progress.evaluasi = Math.max(user.progress.evaluasi || 0, finalScore);
        }
      });

      setShowAiDiscussion(true);
      soundService.success();
      showToast("Koreksi AI selesai! Telaah konsep dan foto berhasil diperbarui.", "success");
    } catch (err) {
      console.error("AI correction error:", err);
      showToast("Gagal menjalankan koreksi AI. Silakan coba lagi.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 1. PREREQUISITE LOCK SCREEN
  if (!isPrerequisiteMet) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12">
        <div className="rounded-3xl bg-amber-100 dark:bg-amber-950/40 border-4 border-slate-950 dark:border-slate-800 p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 dark:text-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ffe600] border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] text-slate-950">
              <Lock size={28} />
            </div>
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider bg-red-400 px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
                ALUR BERURUTAN (STEP 3 TERKUNCI)
              </span>
              <h2 className="text-2xl font-black font-mono mt-1 text-slate-950 dark:text-slate-100">
                Evaluasi Sumatif Belum Terbuka
              </h2>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-300 leading-relaxed max-w-2xl">
            Sesuai urutan alur belajar matematika: Kamu harus menyelesaikan <b>LKPD (Tahap 1)</b> dan <b>Latihan Soal (Tahap 2)</b> terlebih dahulu sebelum dapat mengerjakan Evaluasi Sumatif.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {!hasCompletedLKPD && (
              <button
                onClick={() => onNavigate('siswa/lkpd')}
                className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Buka LKPD (Tahap 1)</span>
                <ArrowRight size={16} />
              </button>
            )}
            {hasCompletedLKPD && !hasCompletedLatsol && (
              <button
                onClick={() => onNavigate('siswa/latsol')}
                className="px-6 py-3.5 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Buka Latihan Soal (Tahap 2)</span>
                <ArrowRight size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundService.click();
                setBypassPrerequisite(true);
                showToast("Mode Simulasi: Membuka lembar Evaluasi Sumatif langsung.", "info");
              }}
              className="px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-900 dark:text-slate-100 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-700 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] transition-all cursor-pointer flex items-center gap-2"
            >
              <Unlock size={15} className="text-amber-600" />
              <span>Buka Evaluasi Langsung (Mode Simulasi)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPLETED EVALUATION SCREEN (NO RETAKE, SHOWS FULL STEP DISCUSSION)
  if (previousSubmission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in">
        
        {/* Celebration Banner */}
        <div className="rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]">
                <Trophy size={32} className="text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-mono font-black uppercase bg-white px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-slate-950">
                  EVALUASI TELAH SELESAI
                </span>
                <h2 className="text-2xl font-black font-mono mt-1 text-slate-950">
                  Hasil Evaluasi Uraian HOTS
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-black text-slate-700 block">NILAI AKHIR:</span>
              <span className="text-4xl sm:text-5xl font-mono font-black text-slate-950">
                {previousSubmission.gradingStatus === 'needs_review' ? 'Menunggu pemeriksaan guru' : `${previousSubmission.teacherScore ?? previousSubmission.score}/100`}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
            {previousSubmission.gradingStatus === 'needs_review'
              ? 'Foto belum dapat dicocokkan atau dibaca dengan yakin. Nilai otomatis ditahan sampai guru memeriksa jawaban atau foto diunggah ulang.'
              : 'Evaluasi sumatif telah dikumpulkan. Di bawah ini adalah langkah pembahasan untuk memperdalam pemahaman konsep pecahanmu.'}
          </p>

          {/* Anti cheat record summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold pt-1">
            <span className="px-3 py-1.5 bg-white text-slate-950 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
              📅 Tanggal Pengumpulan: {previousSubmission.date}
            </span>
            <span className="px-3 py-1.5 bg-emerald-200 text-emerald-950 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
              🛡 Status Tab Integrity: {previousSubmission.antiCheat?.switchCount || 0}x Pindah Tab
            </span>
          </div>
        </div>

        {/* Review Per-Question Header with Koreksi AI Button (Like LKPD) */}
        <div className="space-y-4">
          {isAiLoading ? (
            <div className="flex items-center gap-3 p-5 rounded-3xl bg-cyan-100/80 dark:bg-cyan-950/60 border-4 border-cyan-800 dark:border-cyan-600 shadow-[6px_6px_0px_0px_#083344] animate-pulse">
              <Loader2 size={26} className="animate-spin text-cyan-800 dark:text-cyan-300 shrink-0" />
              <div>
                <span className="font-mono text-xs font-black block text-cyan-950 dark:text-cyan-100">
                  ASISTEN AI SEDANG MENELAAH LANGKAH EVALUASI &amp; FOTO CORETANMU...
                </span>
                <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                  Menganalisis langkah pecahan, bukti coret-coretan pengerjaan, dan menyiapkan diagnosa konsep.
                </span>
              </div>
            </div>
          ) : (
            !previousSubmission.aiEvaluation ? (
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
                      Ingin menelaah kesesuaian foto coretan fisik serta melihat evaluasi konsep versi AI? Klik tombol untuk menjalankan koreksi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAiCorrection}
                  className="px-6 py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-black border-3 border-slate-950 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                >
                  <Sparkles size={18} />
                  <span>Koreksi AI</span>
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
                      Tinjauan Evaluasi AI &amp; Pembahasan Soal
                    </h2>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {showAiDiscussion
                        ? 'Analisis AI dan pembahasan langkah konsep per butir soal sedang ditampilkan.'
                        : 'Hasil telaah AI sedang disembunyikan. Klik tombol di samping untuk membukanya.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRunAiCorrection}
                    className="px-3.5 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-slate-950 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    title="Koreksi ulang dengan AI"
                  >
                    <RefreshCw size={14} />
                    <span>Koreksi Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiDiscussion(!showAiDiscussion)}
                    className={`px-5 py-3 rounded-2xl font-mono text-xs font-black border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      showAiDiscussion
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        : 'bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>{showAiDiscussion ? 'Sembunyikan Koreksi AI' : 'Koreksi AI'}</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Step-by-Step Questions & Discussion */}
        <div className="space-y-6">
          <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100">
            Langkah Pembahasan Kunci Jawaban:
          </h3>

      {questions.map((q, idx) => {
            const studentText = previousSubmission.textAnswers?.[q.id] || "Jawaban dikumpulkan.";
            const aiQuestionResult = previousSubmission.aiEvaluation?.perQuestion[q.id];

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-4"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-950 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#ffe600] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center font-mono font-black text-xs text-slate-950">
                      {idx + 1}
                    </span>
                    <span className="font-black text-sm text-slate-950 dark:text-slate-100">{q.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">Bobot: {q.weight} Poin</span>
                </div>

                {/* Prompt */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.prompt}
                </div>

                {/* Student's Answer */}
                {(() => {
                  const hasPhotoProofsMap = Boolean(previousSubmission.photoProofs && typeof previousSubmission.photoProofs === 'object');
                  const studentPhoto = hasPhotoProofsMap
                    ? previousSubmission.photoProofs?.[q.id]
                    : (idx === 0 ? previousSubmission.photoProof : undefined);

                  return (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 space-y-3">
                      <div>
                        <span className="font-black text-amber-900 dark:text-amber-400 font-mono uppercase block mb-1">
                          Uraian Jawaban Digital:
                        </span>
                        <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{studentText}</p>
                      </div>

                      {/* Foto Lembar Coretan / Pengerjaan Fisik */}
                      {studentPhoto ? (
                        <div className="pt-2 border-t-2 border-amber-200 dark:border-amber-900/60 space-y-1.5">
                          <span className="text-[11px] font-mono font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Camera size={14} />
                            <span>Foto Lembar Coretan / Tulisan Tangan Terlampir:</span>
                          </span>
                          <div className="relative inline-block border-2 border-slate-950 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_#0f172a] max-w-sm">
                            <img
                              src={studentPhoto}
                              alt={`Bukti Pengerjaan Soal ${idx + 1}`}
                              className="w-full h-auto max-h-52 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => setZoomPhoto(studentPhoto)}
                            />
                            <button
                              type="button"
                              onClick={() => setZoomPhoto(studentPhoto)}
                              className="w-full py-1.5 bg-[#ffe600] text-slate-950 font-mono text-[11px] font-black text-center cursor-pointer hover:bg-yellow-400 border-t-2 border-slate-950 flex items-center justify-center gap-1.5"
                            >
                              <Maximize2 size={13} />
                              <span>Klik untuk Perbesar Foto (Zoom)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 italic">
                          (Pengerjaan murni teks digital tanpa lampiran foto lembar kerja fisik)
                        </div>
                      )}

                      {/* AI Evaluation Box */}
                      {aiQuestionResult && showAiDiscussion && (
                        studentPhoto ? (
                          <div role="status" className="rounded-xl border-2 border-purple-300 bg-purple-50 dark:bg-purple-950/40 p-3 text-xs font-bold text-purple-950 dark:text-purple-200 space-y-1.5 mt-2">
                            <div className="flex items-center gap-1.5 font-black text-[11px]">
                              <Camera size={13} className="text-purple-600 dark:text-purple-400" />
                              <span>Status Pemeriksaan Foto Coretan:</span>
                              <span className={`ml-auto px-2 py-0.5 rounded text-[10px] ${
                                aiQuestionResult.imageStatus === 'matched'
                                  ? 'bg-emerald-200 text-emerald-950'
                                  : studentText && studentText.trim().length > 0 && aiQuestionResult.reviewStatus === 'graded'
                                  ? 'bg-emerald-200 text-emerald-950'
                                  : 'bg-amber-200 text-amber-950'
                              }`}>
                                {aiQuestionResult.imageStatus === 'matched'
                                  ? 'Foto Cocok dengan Soal'
                                  : aiQuestionResult.imageStatus === 'mismatch'
                                  ? 'Foto Tidak Cocok'
                                  : aiQuestionResult.imageStatus === 'unreadable'
                                  ? 'Foto Tidak Terbaca'
                                  : (studentText && studentText.trim().length > 0 && aiQuestionResult.reviewStatus === 'graded'
                                    ? 'Foto Terlampir (Dinilai dari Teks)'
                                    : 'Perlu Diperiksa Guru')}
                              </span>
                            </div>
                            {aiQuestionResult.imageSummary && (
                              <p><span className="font-bold">Terbaca di foto:</span> {aiQuestionResult.imageSummary}</p>
                            )}
                            {aiQuestionResult.diagnosa && (
                              <p><span className="font-bold">Diagnosa AI:</span> {aiQuestionResult.diagnosa}</p>
                            )}
                          </div>
                        ) : (
                          <div role="status" className="rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3 text-xs font-bold text-slate-800 dark:text-slate-200 space-y-1 mt-2">
                            <div className="flex items-center gap-1.5 font-black text-[11px] text-slate-900 dark:text-slate-100">
                              <Sparkles size={13} className="text-amber-500" />
                              <span>Analisis Jawaban Teks AI:</span>
                              <span className="ml-auto px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                                Pengerjaan Teks Digital
                              </span>
                            </div>
                            {aiQuestionResult.diagnosa && (
                              <p><span className="font-bold">Diagnosa:</span> {aiQuestionResult.diagnosa}</p>
                            )}
                            {aiQuestionResult.conceptFeedback && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400"><span className="font-bold">Saran:</span> {aiQuestionResult.conceptFeedback}</p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  );
                })()}

                {/* Step Discussion */}
                <div className="p-4 bg-[#a5f3fc]/40 dark:bg-cyan-950/40 border-3 border-cyan-950 dark:border-cyan-800 rounded-2xl shadow-[3px_3px_0px_0px_#083344] dark:shadow-[3px_3px_0px_0px_#000000] space-y-2">
                  <span className="font-mono text-xs font-black text-cyan-950 dark:text-cyan-300 uppercase block">
                    Langkah Pembahasan Resmi:
                  </span>
                  <pre className="font-sans whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-900/90 p-3 rounded-xl border border-cyan-950/20 dark:border-cyan-800/40">
                    {q.discussion}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Home CTA */}
        <div className="flex justify-between items-center bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
          <button
            onClick={() => onNavigate('siswa')}
            className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Kembali ke Beranda Belajar</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    );
  }

  // 3. ACTIVE EVALUATION EXAM TAKING SCREEN
  const currentQ = questions[activeQuestionIdx] || questions[0];
  const totalQuestions = questions.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12">
      
      {/* Header with Live Countdown Timer & Anti-Cheat Notification */}
      <div className="bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              EVALUASI SUMATIF BAB 1
            </span>
            <span className="px-3 py-0.5 bg-[#a5f3fc] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              TAHAP 3 (FINAL)
            </span>
            <span className="px-3 py-0.5 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5">
              <Clock size={12} className="text-amber-600" />
              <span>Waktu: {evalDurationMinutes} Menit</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-mono">
            Ujian Soal Uraian HOTS Pecahan
          </h1>
          <p className="text-xs font-bold text-slate-900 mt-1">
            Ketik langkah pengerjaan untuk setiap soal. Lampirkan foto coretan jika diperlukan (opsional).
          </p>
        </div>

        {/* Timer Box */}
        <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-3 border-slate-950 dark:border-slate-800 font-mono text-base font-black shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] shrink-0 ${
          timeLeft < 180 ? 'bg-red-300 text-red-950 animate-pulse' : 'bg-white text-slate-950'
        }`}>
          <Clock size={20} />
          <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Anti-cheat tab alert */}
      {switchCount > 0 && (
        <div className="bg-red-100 dark:bg-red-950/50 border-3 border-red-950 dark:border-red-800 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#7f1d1d] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3 text-red-950 dark:text-red-200 font-mono text-xs font-black animate-in fade-in">
          <ShieldAlert size={22} className="text-red-600 dark:text-red-400 shrink-0" />
          <span>Peringatan: Kamu telah berpindah tab sebanyak {switchCount}x. Seluruh durasi keluar dicatat dan dilaporkan ke Portal Guru.</span>
        </div>
      )}

      {/* Question Stepper Tabs */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const hasText = (textAnswers[q.id] || '').trim().length > 0;
          const hasPhoto = Boolean(photos[q.id] && photos[q.id].length > 50);
          const isFilled = hasText || hasPhoto;
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
              <span>Soal #{idx + 1}</span>
              {hasPhoto && (
                <span title="Foto coretan fisik terlampir" className="inline-flex items-center">
                  <Camera size={13} className="text-purple-700 dark:text-purple-300" />
                </span>
              )}
              {hasText && (
                <span title="Jawaban uraian terisi" className="inline-flex items-center">
                  <CheckCircle2 size={14} className="text-emerald-700 dark:text-emerald-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Question Card */}
      {currentQ && (
        <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-950 dark:border-slate-800 pb-3">
            <span className="font-mono text-xs font-black bg-[#ffe600] px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-slate-950">
              SOAL {activeQuestionIdx + 1} DARI {totalQuestions}
            </span>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">Bobot: {currentQ.weight} Poin</span>
          </div>

          {/* Question Text */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-relaxed">
            {currentQ.prompt}
          </div>

          {/* Text Area for Typing Answer */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-200">
              Ketik Uraian Jawaban &amp; Langkah Hitung:
            </label>
            <textarea
              rows={5}
              value={textAnswers[currentQ.id] || ''}
              onChange={(e) => handleTextChange(currentQ.id, e.target.value)}
              placeholder="Tuliskan langkah-langkah pengerjaan, penyamaan penyebut KPK, dan kesimpulan jawaban akhirmu di sini..."
              className="w-full p-4 bg-[#fffdf5] dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl font-sans text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffe600]"
            />
          </div>

          {/* Photo Attachment Per Question (Dual Action: Kamera + Galeri) */}
          <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Camera size={14} />
                <span>Foto Bukti Lembar Coretan Soal Ini (Opsional):</span>
              </label>
              {photos[currentQ.id] && (
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

            {photos[currentQ.id] ? (
              <div className="relative rounded-2xl border-2 border-slate-950 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 max-w-sm">
                <img
                  src={photos[currentQ.id]}
                  alt={`Bukti Coretan Soal ${activeQuestionIdx + 1}`}
                  className="w-full h-auto max-h-48 object-contain rounded-xl cursor-pointer hover:opacity-95"
                  onClick={() => setZoomPhoto(photos[currentQ.id])}
                />
                <button
                  type="button"
                  onClick={() => setZoomPhoto(photos[currentQ.id])}
                  className="mt-1.5 w-full py-1 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[10px] font-bold text-center rounded-lg border border-slate-400 dark:border-slate-700 hover:bg-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Maximize2 size={11} />
                  <span>Perbesar Foto</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Tombol Kamera Langsung */}
                <label
                  htmlFor={`camera_input_${currentQ.id}`}
                  onPointerDown={() => markFilePickerOpen(600000)}
                  onTouchStart={() => markFilePickerOpen(600000)}
                  onMouseDown={() => markFilePickerOpen(600000)}
                  onClick={() => markFilePickerOpen(600000)}
                  className="flex items-center justify-center gap-2 p-3.5 bg-[#ffe600]/25 hover:bg-[#ffe600]/40 dark:bg-yellow-950/30 dark:hover:bg-yellow-900/40 border-2 border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer transition text-xs font-mono font-black text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] active:translate-y-0.5"
                >
                  <Camera size={16} />
                  <span>Ambil Foto Kamera</span>
                  <input
                    key={`camera_${currentQ.id}`}
                    id={`camera_input_${currentQ.id}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      markFilePickerClosed(4000);
                      handlePhotoSelect(currentQ.id, e);
                    }}
                    className="hidden"
                  />
                </label>

                {/* 2. Tombol Galeri / File */}
                <label
                  htmlFor={`gallery_input_${currentQ.id}`}
                  onPointerDown={() => markFilePickerOpen(600000)}
                  onTouchStart={() => markFilePickerOpen(600000)}
                  onMouseDown={() => markFilePickerOpen(600000)}
                  onClick={() => markFilePickerOpen(600000)}
                  className="flex items-center justify-center gap-2 p-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300 active:translate-y-0.5"
                >
                  <Upload size={16} />
                  <span>Pilih dari Galeri / File</span>
                  <input
                    key={`gallery_${currentQ.id}`}
                    id={`gallery_input_${currentQ.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      markFilePickerClosed(4000);
                      handlePhotoSelect(currentQ.id, e);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000]">
        <button
          onClick={() => {
            soundService.click();
            setActiveQuestionIdx(prev => Math.max(0, prev - 1));
          }}
          disabled={activeQuestionIdx === 0}
          className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-200 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer"
        >
          ← Soal Sebelumnya
        </button>

        {activeQuestionIdx < totalQuestions - 1 ? (
          <button
            onClick={() => {
              soundService.click();
              setActiveQuestionIdx(prev => prev + 1);
            }}
            className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Soal Berikutnya</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => {
              soundService.click();
              const cleanPhotos = Object.values(photos).filter(p => Boolean(p && p.trim().length > 50));
              const hasAnyPhoto = cleanPhotos.length > 0;
              const hasAnyText = Object.values(textAnswers).some(t => t.trim().length > 0);

              if (!hasAnyText && !hasAnyPhoto) {
                soundService.alert();
                showToast("Ketik jawaban uraian atau unggah foto pengerjaan terlebih dahulu!", "error");
                return;
              }
              setShowConfirmSubmitModal(true);
            }}
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{isSubmitting ? 'Memeriksa & mengumpulkan...' : 'Kumpulkan Evaluasi Final'}</span>
            {isSubmitting ? <Sparkles size={16} className="animate-pulse" /> : <Send size={16} />}
          </button>
        )}
      </div>

      {/* Confirmation Modal Before Final Evaluation Submission */}
      {showConfirmSubmitModal && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-300 border-3 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] text-slate-950">
                <Send size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 bg-yellow-300 text-yellow-950 border border-slate-950 rounded-lg">
                  KONFIRMASI PENGUMPULAN
                </span>
                <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100 mt-1">
                  Kumpulkan Evaluasi Final?
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Apakah kamu yakin ingin mengumpulkan seluruh lembar jawaban sekarang? Evaluasi sumatif ini akan diserahkan ke Guru dan Asisten AI untuk penilaian.
            </p>

            <div className="bg-slate-100 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs font-bold space-y-1.5 text-slate-800 dark:text-slate-200">
              <div className="flex justify-between">
                <span>Soal Terjawab:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {questions.filter(q => (textAnswers[q.id] || '').trim().length > 0).length} / {questions.length} Soal
                </span>
              </div>
              <div className="flex justify-between">
                <span>Foto Coretan Terlampir:</span>
                <span className="font-black text-blue-600 dark:text-blue-400">
                  {questions.filter(q => Boolean(photos[q.id] && photos[q.id].length > 50)).length} Lembar Foto
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sisa Waktu:</span>
                <span className="font-black text-purple-600 dark:text-purple-400">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
              {switchCount > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Catatan Integritas:</span>
                  <span className="font-black">{switchCount}x Tab Switch</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(false)}
                className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSubmitModal(false);
                  handleSubmitExam();
                }}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setZoomPhoto(null)}
        >
          <div
            className="relative bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 rounded-3xl p-4 max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-mono font-black text-xs text-slate-950 dark:text-slate-100 flex items-center gap-2">
                <Camera size={16} />
                <span>Pratinjau Foto Lembar Coretan / Tulisan Tangan</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-slate-950 dark:text-slate-100 font-bold hover:bg-red-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-2xl p-2">
              <img
                src={zoomPhoto}
                alt="Zoom Lembar Coretan"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

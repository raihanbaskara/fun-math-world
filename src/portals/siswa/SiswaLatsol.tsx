import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LatsolRoom, LatsolSubmission } from '@/types';
import { useAntiCheat } from '@/lib/useAntiCheat';
import {
  Gamepad2,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  RotateCcw,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SiswaLatsol: React.FC<{
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

  const hasCompletedLKPD = db.lkpdSubmissions.some(s => s.studentId === currentUser.id) || (currentUser.progress?.lkpd || 0) >= 100;
  const latsolRooms = db.latsolRooms || [];

  // Active room state
  const [activeRoom, setActiveRoom] = useState<LatsolRoom | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [latestSubmission, setLatestSubmission] = useState<LatsolSubmission | null>(null);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState<boolean>(false);

  const LATSOL_SESSION_KEY = `FMW_LATSOL_SESSION_${currentUser.id}`;

  // Restore in-progress Latsol session upon page refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LATSOL_SESSION_KEY);
      if (!saved) return;
      const session = JSON.parse(saved);
      if (!session || !session.roomId) return;

      const room = latsolRooms.find(r => r.id === session.roomId);
      if (!room) return;

      // Don't restore if already officially submitted
      const alreadySubmitted = db.latsolSubmissions?.some(
        s => s.studentId === currentUser.id && s.roomId === room.id
      );
      if (alreadySubmitted) {
        localStorage.removeItem(LATSOL_SESSION_KEY);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, Math.round((session.targetEndTime - now) / 1000));

      if (remaining <= 0) {
        // Time expired while page was refreshed/closed -> auto submit
        localStorage.removeItem(LATSOL_SESSION_KEY);
        executeFinishQuiz(room, session.userAnswers || {}, 0);
        showToast("Waktu pengerjaan telah habis saat halaman ditutup. Kuis dikumpulkan otomatis.", "info");
      } else {
        // Resume active session
        setActiveRoom(room);
        setCurrentQuestionIndex(session.currentQuestionIndex || 0);
        setUserAnswers(session.userAnswers || {});
        setTimeLeft(remaining);
        setIsQuizCompleted(false);

        // Restore anti-cheat switch count so it NEVER resets to 0 on refresh!
        if (session.antiCheat) {
          restoreReport(session.antiCheat);
        }

        showToast(`Sesi Latihan Soal dipulihkan! Sisa waktu: ${Math.floor(remaining / 60)}m ${remaining % 60}d.`, "info");
      }
    } catch (err) {
      console.warn("Failed to restore Latsol session:", err);
    }
  }, [currentUser.id, latsolRooms.length]);

  // Anti cheat active when in a room and not completed
  const { switchCount, getReport, resetReport, restoreReport } = useAntiCheat({
    active: Boolean(activeRoom) && !isQuizCompleted,
    onViolation: (msg, count) => {
      showToast(msg, 'error');
      const nextCount = count || switchCount + 1;

      // Persist violation count to localStorage session immediately so it survives refresh!
      try {
        const saved = localStorage.getItem(LATSOL_SESSION_KEY);
        if (saved) {
          const session = JSON.parse(saved);
          session.antiCheat = {
            switchCount: nextCount,
            totalLeaveSeconds: 0,
            log: []
          };
          localStorage.setItem(LATSOL_SESSION_KEY, JSON.stringify(session));
        }
      } catch {}
    }
  });

  // Countdown timer for Quizizz
  useEffect(() => {
    if (!activeRoom || isQuizCompleted) return;

    if (timeLeft <= 0) {
      soundService.alert();
      showToast("Waktu pengerjaan habis! Mengumpulkan kuis secara otomatis...", "info");
      handleFinishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRoom, timeLeft, isQuizCompleted]);

  const handleStartRoom = (room: LatsolRoom) => {
    soundService.click();
    if (!hasCompletedLKPD) {
      soundService.alert();
      showToast("Selesaikan tugas LKPD terlebih dahulu untuk membuka Latihan Soal!", "error");
      return;
    }

    if (room.isLockedByTeacher) {
      soundService.alert();
      showToast("Room Latsol ini sedang dikunci oleh Guru. Menunggu akses dibuka guru!", "error");
      return;
    }

    const targetEndTime = Date.now() + (room.durationSeconds || 180) * 1000;
    try {
      localStorage.setItem(LATSOL_SESSION_KEY, JSON.stringify({
        roomId: room.id,
        startedAt: Date.now(),
        targetEndTime,
        durationSeconds: room.durationSeconds || 180,
        currentQuestionIndex: 0,
        userAnswers: {},
        antiCheat: { switchCount: 0, totalLeaveSeconds: 0, log: [] }
      }));
    } catch {}

    setActiveRoom(room);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(room.durationSeconds || 180);
    setIsQuizCompleted(false);
    resetReport();
    soundService.success();
    showToast(`Memulai ${room.title}! Waktu: ${room.durationSeconds} detik.`, "success");
  };

  const handleViewReview = (room: LatsolRoom, sub: LatsolSubmission) => {
    soundService.click();
    setActiveRoom(room);
    setLatestSubmission(sub);
    setIsQuizCompleted(true);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    soundService.click();
    const updated = {
      ...userAnswers,
      [questionId]: optionIndex
    };
    setUserAnswers(updated);

    try {
      const saved = localStorage.getItem(LATSOL_SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        session.userAnswers = updated;
        session.antiCheat = getReport();
        localStorage.setItem(LATSOL_SESSION_KEY, JSON.stringify(session));
      }
    } catch {}
  };

  const handleNavigateQuestion = (newIndex: number) => {
    soundService.click();
    setCurrentQuestionIndex(newIndex);
    try {
      const saved = localStorage.getItem(LATSOL_SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        session.currentQuestionIndex = newIndex;
        session.antiCheat = getReport();
        localStorage.setItem(LATSOL_SESSION_KEY, JSON.stringify(session));
      }
    } catch {}
  };

  const executeFinishQuiz = (room: LatsolRoom, answers: Record<string, number>, finalTimeLeft: number) => {
    try {
      localStorage.removeItem(LATSOL_SESSION_KEY);
    } catch {}

    const questions = room.questions;
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = Math.max(0, (room.durationSeconds || 180) - finalTimeLeft);
    const antiCheatReport = getReport();

    const submission: LatsolSubmission = {
      id: `latsub_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7",
      roomId: room.id,
      roomTitle: room.title,
      score,
      correctCount,
      totalQuestions: questions.length,
      answers,
      timeSpentSeconds: timeSpent,
      date: new Date().toLocaleString('id-ID'),
      antiCheat: antiCheatReport
    };

    storageService.update(draft => {
      if (!draft.latsolSubmissions) draft.latsolSubmissions = [];
      draft.latsolSubmissions = draft.latsolSubmissions.filter(
        s => !(s.studentId === currentUser.id && s.roomId === room.id)
      );
      draft.latsolSubmissions.push(submission);

      // Update student progress
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 85, video: 70, lkpd: 100, latsol: 0, evaluasi: 0 };
        user.progress.latsol = Math.max(user.progress.latsol || 0, score);
      }
    });

    setActiveRoom(room);
    setLatestSubmission(submission);
    setIsQuizCompleted(true);
    soundService.success();
    confetti({ particleCount: 100, spread: 80 });
  };

  const handleFinishQuiz = () => {
    if (!activeRoom) return;
    executeFinishQuiz(activeRoom, userAnswers, timeLeft);
  };

  // PREREQUISITE WARNING BANNER
  if (!hasCompletedLKPD) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        <div className="rounded-3xl bg-amber-100 dark:bg-amber-950/40 border-4 border-slate-950 dark:border-slate-800 p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 dark:text-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ffe600] border-3 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] text-slate-950">
              <Lock size={28} />
            </div>
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider bg-red-400 text-slate-950 px-3 py-1 rounded-xl border-2 border-slate-950">
                ALUR BERURUTAN (STEP 2 TERKUNCI)
              </span>
              <h2 className="text-2xl font-black font-mono mt-1 text-slate-950 dark:text-slate-100">
                Latihan Soal Belum Dapat Diakses
              </h2>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-300 leading-relaxed max-w-2xl">
            Sesuai aturan alur pembelajaran berurutan: Kamu harus menyelesaikan dan mengumpulkan <b>LKPD (Tahap 1)</b> terlebih dahulu sebelum dapat membuka kuis interaktif Latihan Soal.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('siswa/lkpd')}
              className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Kerjakan LKPD Sekarang</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LATIHAN SOAL SUMMARY SCREEN
  if (activeRoom && isQuizCompleted && latestSubmission) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans pb-12 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Celebration Card */}
        <div className="rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950 text-center space-y-4">
          <div className="inline-flex p-4 bg-white border-3 border-slate-950 rounded-3xl shadow-[4px_4px_0px_0px_#0f172a] mb-2">
            <Trophy size={48} className="text-amber-500" />
          </div>

          <span className="font-mono text-xs font-black uppercase px-3 py-1 bg-white rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] inline-block">
            HASIL LATIHAN SOAL — {activeRoom.title}
          </span>

          <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight">
            {latestSubmission.score} <span className="text-3xl text-slate-700">/ 100</span>
          </div>

          <p className="text-sm font-bold text-slate-900 max-w-md mx-auto">
            {latestSubmission.score >= 80
              ? '🎉 Luar biasa! Penguasaan materi pecahanmu sangat hebat!'
              : 'Semangat belajar! Periksa langkah pembahasan di bawah ini untuk belajar lebih mendalam.'}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono font-black pt-2 text-slate-950">
            <span className="px-4 py-2 bg-emerald-300 border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
              ✓ Benar: {latestSubmission.correctCount} Soal
            </span>
            <span className="px-4 py-2 bg-red-300 border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
              ✗ Salah: {latestSubmission.totalQuestions - latestSubmission.correctCount} Soal
            </span>
            <span className="px-4 py-2 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
              ⏱ Waktu: {latestSubmission.timeSpentSeconds} Detik
            </span>
          </div>
        </div>

        {/* Question Discussion List */}
        <div className="space-y-4">
          <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100">
            Pembahasan Jawaban Lengkap:
          </h3>

          {activeRoom.questions.map((q, idx) => {
            const userChosen = latestSubmission.answers[q.id];
            const isCorrect = userChosen === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-3 ${
                  isCorrect ? 'border-l-8 border-l-emerald-500' : 'border-l-8 border-l-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-100 px-3 py-1 rounded-xl border border-slate-950 dark:border-slate-700">
                    Soal #{idx + 1}
                  </span>
                  <span className={`font-mono text-xs font-black px-3 py-1 rounded-xl border-2 border-slate-950 ${isCorrect ? 'bg-emerald-300 text-emerald-950' : 'bg-red-300 text-red-950'}`}>
                    {isCorrect ? '✓ Jawabanmu Benar' : '✗ Jawabanmu Salah'}
                  </span>
                </div>

                <p className="font-bold text-sm text-slate-950 dark:text-slate-100">{q.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold font-sans">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userChosen === oIdx;
                    const isAnswerKey = q.correctIndex === oIdx;

                    let bgClass = "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300";
                    if (isAnswerKey) bgClass = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-950 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300 font-black";
                    else if (isSelected && !isAnswerKey) bgClass = "bg-red-100 dark:bg-red-950/60 border-red-950 dark:border-red-700 text-red-950 dark:text-red-300 line-through";

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border-2 ${bgClass} flex items-center justify-between`}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {isAnswerKey && <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-400 text-emerald-950 rounded border border-emerald-950">Kunci</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-950 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="font-black text-amber-900 dark:text-amber-300 uppercase">Langkah Pembahasan:</span>
                  <p className="mt-0.5">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Return Button */}
        <div className="flex justify-between items-center bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
          <button
            onClick={() => setActiveRoom(null)}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer"
          >
            ← Kembali ke Daftar Room
          </button>

          <button
            onClick={() => onNavigate('siswa/evaluasi')}
            className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Lanjut ke Evaluasi (Tahap 3)</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    );
  }

  // QUIZIZZ ACTIVE QUESTION PLAYING SCREEN
  if (activeRoom && !isQuizCompleted) {
    const currentQ = activeRoom.questions[currentQuestionIndex];
    const totalQ = activeRoom.questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);

    return (
      <div className="space-y-6 max-w-3xl mx-auto font-sans pb-12 animate-in fade-in">
        
        {/* Top Header Bar with Live Countdown & Progress */}
        <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-mono font-black text-sm text-slate-950">
              {currentQuestionIndex + 1}/{totalQ}
            </span>
            <div>
              <div className="font-mono text-xs font-black text-slate-950 dark:text-slate-100 uppercase">{activeRoom.title}</div>
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Jawab tepat untuk skor maksimal</div>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-3 border-slate-950 font-mono text-sm font-black shadow-[3px_3px_0px_0px_#0f172a] ${
            timeLeft < 30 ? 'bg-red-300 text-red-950 animate-pulse' : 'bg-[#a5f3fc] text-slate-950'
          }`}>
            <Clock size={18} />
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full border-2 border-slate-950 dark:border-slate-700 overflow-hidden shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
          <div
            className="bg-[#ffe600] h-full transition-all duration-300 border-r-2 border-slate-950"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Anti-cheat warning alert */}
        {switchCount > 0 && (
          <div className="bg-red-100 dark:bg-red-950/60 border-3 border-red-950 dark:border-red-700 rounded-2xl p-3 shadow-[3px_3px_0px_0px_#7f1d1d] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2 text-red-950 dark:text-red-200 font-mono text-xs font-black">
            <ShieldAlert size={18} className="text-red-600 dark:text-red-400 shrink-0" />
            <span>Peringatan: Kamu berpindah tab sebanyak {switchCount}x. Insiden ini tercatat ke guru.</span>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
          <div className="text-base sm:text-xl font-black text-slate-950 dark:text-slate-100 leading-relaxed font-sans">
            {currentQ.question}
          </div>

          {/* 4 Quizizz Multiple Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((optionText, idx) => {
              const isSelected = userAnswers[currentQ.id] === idx;
              const optionColors = [
                'hover:bg-[#ffe600] dark:hover:text-slate-950',
                'hover:bg-[#a5f3fc] dark:hover:text-slate-950',
                'hover:bg-[#fbcfe8] dark:hover:text-slate-950',
                'hover:bg-[#bef264] dark:hover:text-slate-950'
              ];
              const selectedBg = isSelected
                ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] translate-x-[-1px] translate-y-[-1px]'
                : `bg-[#fffdf5] dark:bg-slate-800/90 text-slate-950 dark:text-slate-100 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] ${optionColors[idx % 4]}`;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`p-4 rounded-2xl border-3 text-left transition-all cursor-pointer font-sans text-xs sm:text-sm font-bold flex items-center gap-3 ${selectedBg}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-mono font-black text-xs text-slate-950 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{optionText}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavigateQuestion(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-950 dark:text-slate-100 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer"
          >
            ← Soal Sebelumnya
          </button>

          {currentQuestionIndex < totalQ - 1 ? (
            <button
              onClick={() => handleNavigateQuestion(currentQuestionIndex + 1)}
              className="px-6 py-3 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Soal Berikutnya</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                soundService.click();
                setShowConfirmSubmitModal(true);
              }}
              className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Selesai &amp; Kumpulkan Kuis</span>
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>

        {/* Confirmation Modal Before Submitting Latsol */}
        {showConfirmSubmitModal && (
          <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-300 border-3 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] text-slate-950">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 bg-yellow-300 text-yellow-950 border border-slate-950 rounded-lg">
                    KONFIRMASI SELESAI
                  </span>
                  <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100 mt-1">
                    Kumpulkan Latihan Soal?
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                Apakah kamu sudah yakin dengan semua pilihan jawabanmu? Setelah kuis dikumpulkan, kuis ini tidak dapat diulang kembali.
              </p>

              <div className="bg-slate-100 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs font-bold space-y-1.5 text-slate-800 dark:text-slate-200">
                <div className="flex justify-between">
                  <span>Soal Terjawab:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {Object.keys(userAnswers).length} / {totalQ} Butir
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Belum Terjawab:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {totalQ - Object.keys(userAnswers).length} Butir
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Waktu:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmitModal(false)}
                  className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                >
                  Lanjut Kuis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmSubmitModal(false);
                    handleFinishQuiz();
                  }}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                >
                  Ya, Kumpulkan
                </button>
              </div>
            </div>
          </div>
        )}



      </div>
    );
  }

  // DEFAULT ROOM SELECTION LIST
  return (
    <div className="space-y-8 pb-12 font-sans max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] text-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                LATIHAN SOAL INTERAKTIF
              </span>
              <span className="px-3 py-1 bg-[#a5f3fc] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                TAHAP 2
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-mono tracking-tight">
              Kuis Cepat Latihan Soal Pecahan
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
              Pilih Room latihan soal di bawah ini. Selesaikan kuis berwaktu untuk menguji kecepatan hitungmu dan membuka akses ke Evaluasi Sumatif.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Gamepad2 size={36} />
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {latsolRooms.map((room, idx) => {
          const isLocked = room.isLockedByTeacher;
          const mySub = db.latsolSubmissions?.find(
            s => s.studentId === currentUser.id && s.roomId === room.id
          );

          return (
            <div
              key={room.id}
              className={`rounded-3xl border-4 border-slate-950 dark:border-slate-800 p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
                isLocked
                  ? 'bg-slate-100 dark:bg-slate-800/40 shadow-[4px_4px_0px_0px_#64748b] dark:shadow-none opacity-90'
                  : 'bg-white dark:bg-[#111827] shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }`}
            >
              <div className="space-y-4">
                {/* Room Header Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 font-mono text-xs font-black rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] ${
                    isLocked ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-300' : 'bg-[#ffe600] text-slate-950'
                  }`}>
                    {room.badge ? room.badge.replace(/\s*\(Menunggu Akses Guru\)/g, '').replace(/Latsol/g, 'Latihan Soal') : `Latihan Soal ${idx + 1}`}
                  </span>

                  {isLocked ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border-2 border-red-950 dark:border-red-700 rounded-xl font-mono text-[11px] font-black">
                      <Lock size={13} />
                      <span>Menunggu Akses Guru</span>
                    </span>
                  ) : mySub ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-2 border-emerald-950 dark:border-emerald-700 rounded-xl font-mono text-xs font-black">
                      <CheckCircle2 size={14} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Skor: {mySub.score}/100</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#bef264] text-slate-950 border-2 border-slate-950 rounded-xl font-mono text-[11px] font-black">
                      <Unlock size={13} />
                      <span>Tersedia</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100">
                    {room.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border-2 border-slate-950 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Durasi: {room.durationSeconds} Detik</span>
                  </div>
                  <div>•</div>
                  <div>{room.questions.length} Butir Soal</div>
                </div>
              </div>

              <div className="pt-6">
                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 transition-all flex items-center justify-center gap-2 bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  >
                    <Lock size={15} />
                    <span>Terkunci (Izin Guru Diperlukan)</span>
                  </button>
                ) : mySub ? (
                  <button
                    onClick={() => handleViewReview(room, mySub)}
                    className="w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 transition-all flex items-center justify-center gap-2 bg-emerald-300 hover:bg-emerald-400 text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Sudah Selesai (Skor: {mySub.score}/100) — Lihat Pembahasan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartRoom(room)}
                    className="w-full py-3.5 rounded-2xl font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 transition-all flex items-center justify-center gap-2 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>Mulai Latihan Soal Ini</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

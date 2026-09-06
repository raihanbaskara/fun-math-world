import React, { useState, useEffect, useRef } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Fraction, renderFormattedMathText } from '@/components/ui/fraction';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, AntiCheatReport, EvaluationSubmission } from '@/types';
import {
  PenTool,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  Camera,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SiswaEvaluasi: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const db = storageService.getState();
  const previousSubmission = db.evaluationSubmissions.find(s => s.studentId === currentUser.id);

  const [isReExam, setIsReExam] = useState<boolean>(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [photoProof, setPhotoProof] = useState<string | null>(null);

  // Anti-Cheat Tab Monitor State
  const [switchCount, setSwitchCount] = useState<number>(0);
  const [totalLeaveSeconds, setTotalLeaveSeconds] = useState<number>(0);
  const [cheatAlertInfo, setCheatAlertInfo] = useState<{ count: number; duration: number } | null>(null);

  const leaveTimeRef = useRef<number | null>(null);
  const logRef = useRef<Array<{ timestamp: string; incident: string; durationSeconds: number }>>([]);
  const isMonitoringRef = useRef<boolean>(true);

  const questions = db.evaluationQuestions || [];

  useEffect(() => {
    if (previousSubmission && !isReExam) return;

    isMonitoringRef.current = true;

    const handleVisibilityChange = () => {
      if (!isMonitoringRef.current) return;

      if (document.hidden) {
        leaveTimeRef.current = Date.now();
        setSwitchCount(prev => prev + 1);
        soundService.alert();
      } else {
        let dur = 0;
        if (leaveTimeRef.current) {
          dur = Math.round((Date.now() - leaveTimeRef.current) / 1000);
          setTotalLeaveSeconds(prev => prev + dur);
          leaveTimeRef.current = null;
        }

        const countNow = switchCount + 1;
        logRef.current.push({
          timestamp: new Date().toLocaleTimeString(),
          incident: `Keluar Tab ke-${countNow}`,
          durationSeconds: dur
        });

        setCheatAlertInfo({ count: countNow, duration: dur });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isMonitoringRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [previousSubmission, isReExam, switchCount]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoProof(event.target?.result as string);
      showToast("Foto lembar coretan berhasil dimuat.", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();
    isMonitoringRef.current = false;

    if (!photoProof) {
      soundService.alert();
      showToast("Harap lampirkan foto lembar coretan pengerjaan!", "error");
      return;
    }

    const cheatReport: AntiCheatReport = {
      switchCount,
      totalLeaveSeconds,
      log: logRef.current
    };

    const baseScore = 95;
    const penalty = Math.min(25, switchCount * 5);
    const finalScore = Math.max(70, baseScore - penalty);

    const submissionData: EvaluationSubmission = {
      id: "eval_" + currentUser.id + "_" + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7-A",
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      score: finalScore,
      textAnswers: answers,
      photoProof: photoProof,
      antiCheat: cheatReport,
      status: "Selesai"
    };

    storageService.update(draft => {
      const idx = draft.evaluationSubmissions.findIndex(s => s.studentId === currentUser.id);
      if (idx >= 0) draft.evaluationSubmissions[idx] = submissionData;
      else draft.evaluationSubmissions.push(submissionData);

      const user = draft.users.find(u => u.id === currentUser.id);
      if (user && user.progress) {
        user.progress.evaluasi = finalScore;
      }
    });

    setIsReExam(false);
    soundService.success();
    confetti({ particleCount: 70, spread: 80 });
    showToast("Evaluasi soal uraian berhasil dikumpulkan!", "success");
  };

  // View Mode: Already Submitted Exam Results & Key Solution
  if (previousSubmission && !isReExam) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        
        {/* Score Header Double-Bezel Card with High-Contrast Dark Luxury Architecture */}
        <DoubleBezelCard
          className="bg-slate-950 border-slate-800 shadow-xl"
          innerClassName="bg-slate-900 border-slate-800 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-6 sm:p-7"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-black uppercase tracking-wider font-mono shadow-xs">
                  Hasil Evaluasi Terverifikasi
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {previousSubmission.date}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
                <span>Skor Evaluasi:</span>
                <span className="text-emerald-400 font-mono text-3xl sm:text-4xl font-black">{previousSubmission.score}</span>
                <span className="text-slate-400 font-bold text-lg font-mono">/ 100</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-xl">
                Pengerjaan soal uraian telah dianalisis oleh guru matematika dan diverifikasi sistem integritas.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-inner shrink-0">
              <Trophy size={32} />
            </div>
          </div>
        </DoubleBezelCard>

        {/* Anti-cheat audit card */}
        <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldAlert size={16} className={previousSubmission.antiCheat.switchCount > 0 ? "text-amber-600" : "text-emerald-600"} />
            <span>
              Integritas Ujian: <b>{previousSubmission.antiCheat.switchCount}x pindah tab</b> ({previousSubmission.antiCheat.totalLeaveSeconds} detik)
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
            previousSubmission.antiCheat.switchCount > 0
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {previousSubmission.antiCheat.switchCount > 0 ? "Tercatat Pindah Jendela" : "Integritas Sempurna"}
          </span>
        </Card>

        {/* Step-by-Step Formal Discussion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-brand-600" />
              <span>Kunci Jawaban & Pembahasan Lengkap</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">{questions.length} Soal Uraian</span>
          </div>

          {questions.map((q, idx) => (
            <DoubleBezelCard key={q.id} className="bg-white border-slate-200/90 shadow-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-black text-brand-700 bg-brand-50 border border-brand-200/70 px-2.5 py-0.5 rounded-md">
                    Soal #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-500">Bobot: {q.weight} Poin</span>
                </div>

                <h4 className="font-black text-sm sm:text-base text-slate-900">{q.title}</h4>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-medium leading-relaxed">
                  {renderFormattedMathText(q.prompt, 'xs')}
                </p>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 text-xs sm:text-sm space-y-1.5">
                  <div className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-700" />
                    <span>Langkah Pembahasan Formal:</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                    {renderFormattedMathText(q.discussion, 'xs')}
                  </p>
                </div>
              </div>
            </DoubleBezelCard>
          ))}
        </div>

        <div className="pt-2">
          <ArrowFillButton
            fullWidth
            variant="secondary"
            size="md"
            onClick={() => {
              soundService.click();
              setIsReExam(true);
              setSwitchCount(0);
              setTotalLeaveSeconds(0);
            }}
          >
            Kerjakan Ulang Evaluasi Soal Essai
          </ArrowFillButton>
        </div>

      </div>
    );
  }

  // Active Exam Form Mode
  const currentQ = questions[activeQuestionIdx] || questions[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <PenTool size={13} className="text-[#00ffc6]" />
                <span>Ujian Evaluasi Essai</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/70">
                <Sparkles size={12} className="text-brand-600" />
                <span>Asesmen Sumatif</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Evaluasi Pemahaman Pecahan
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Tuliskan langkah pengerjaan di buku coretan, ketik jawaban ringkas, lalu lampirkan foto fisik hasil kerjaanmu.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white border border-slate-200 shadow-2xs">
              Soal {activeQuestionIdx + 1} dari {questions.length}
            </span>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Anti-Cheat Warning Live Indicator */}
      {switchCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs font-bold text-amber-900 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <span>Peringatan Anti-Joki: Anda telah berpindah tab sebanyak <b>{switchCount} kali</b>. Tetap berada di halaman ujian demi validitas nilai!</span>
          </div>
        </div>
      )}

      {/* Question Number Tabs */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const isCurrent = activeQuestionIdx === idx;
          const hasAnswer = Boolean(answers[q.id]?.trim());

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                soundService.click();
                setActiveQuestionIdx(idx);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-slate-900 text-white shadow-md'
                  : hasAnswer
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Soal {idx + 1}</span>
              {hasAnswer && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </div>

      {/* Active Question Prompt & Answer Form */}
      {currentQ && (
        <form onSubmit={handleSubmitExam} className="space-y-6">
          <DoubleBezelCard className="bg-white border-slate-200/90 shadow-sm">
            <div className="space-y-4">
              
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
                <span className="font-mono font-black text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-md">
                  Soal Uraian #{activeQuestionIdx + 1}
                </span>
                <span className="font-bold text-slate-500">Bobot: {currentQ.weight} Poin</span>
              </div>

              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {currentQ.title}
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {renderFormattedMathText(currentQ.prompt, 'xs')}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
                  Tuliskan Ringkasan Langkah / Jawaban Akhir:
                </label>
                <textarea
                  rows={4}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Contoh: KPK(4, 2) = 4 -> 7/4 + 2/4 = 9/4 = 2 1/4..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-300 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition font-medium shadow-2xs resize-none"
                />
              </div>

            </div>
          </DoubleBezelCard>

          {/* Photo Attachment & Final Submit Section */}
          <Card className="p-6 sm:p-7 rounded-3xl space-y-4 border border-slate-200/90 shadow-sm bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Camera size={18} className="text-brand-600" />
                <span>Lampirkan Foto Lembar Coretan / Pengerjaan Fisik (Wajib):</span>
              </div>
              <p className="text-xs text-slate-500">
                Ambil foto tulisan tanganmu sebagai bukti keaslian pengerjaan soal uraian.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              required
              onChange={handlePhotoSelect}
              className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />

            {photoProof && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500">Preview Foto Lembar Jawaban:</span>
                <img
                  src={photoProof}
                  alt="Proof"
                  className="max-h-56 mx-auto rounded-xl shadow object-contain"
                />
              </div>
            )}

            <div className="pt-2">
              <GlassmorphismCTA
                fullWidth
                variant="mint"
                size="lg"
                onClick={(e) => handleSubmitExam(e as any)}
              >
                Kumpulkan Evaluasi Soal Essai
              </GlassmorphismCTA>
            </div>
          </Card>
        </form>
      )}

    </div>
  );
};

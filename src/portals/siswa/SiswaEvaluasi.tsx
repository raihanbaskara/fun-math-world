import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, AntiCheatReport, EvaluationSubmission } from '@/types';
import { compressImage } from '@/lib/utils';
import { useAntiCheat } from '@/lib/useAntiCheat';
import {
  PenTool,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Sparkles,
  Lock,
  Clock,
  ArrowRight,
  FileCheck,
  Send,
  Trash2,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const hasCompletedLKPD = db.lkpdSubmissions.some(s => s.studentId === currentUser.id) || (currentUser.progress?.lkpd || 0) >= 100;
  const hasCompletedLatsol = (db.latsolSubmissions && db.latsolSubmissions.some(s => s.studentId === currentUser.id)) || (currentUser.progress?.latsol || 0) > 0;
  const isPrerequisiteMet = hasCompletedLKPD && hasCompletedLatsol;

  const previousSubmission = db.evaluationSubmissions.find(s => s.studentId === currentUser.id);

  const questions = db.evaluationQuestions || [];
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes

  // Anti-Cheat Tab Monitor Active while taking exam
  const { switchCount, getReport } = useAntiCheat({
    active: isPrerequisiteMet && !previousSubmission,
    onViolation: (msg) => {
      showToast(msg, 'error');
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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Mengompresi foto lembar coretan...", "info");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      const compressed = await compressImage(dataUrl);
      setPhotoProof(compressed);
      soundService.click();
      showToast("Foto lembar coretan berhasil dilampirkan (opsional).", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleAutoSubmitOnTimeout = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = () => {
    soundService.click();

    // Check if at least one question has text
    const answeredCount = Object.values(textAnswers).filter(t => t.trim().length > 0).length;
    if (answeredCount === 0) {
      soundService.alert();
      showToast("Ketik jawaban uraian untuk soal evaluasi terlebih dahulu!", "error");
      return;
    }

    const cheatReport: AntiCheatReport = getReport();

    const newSubmission: EvaluationSubmission = {
      id: `eval_${currentUser.id}_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class || "Kelas 7",
      date: new Date().toLocaleString('id-ID'),
      score: 95,
      textAnswers: textAnswers,
      photoProof: photoProof || "",
      antiCheat: cheatReport,
      status: "Selesai"
    };

    storageService.update(draft => {
      draft.evaluationSubmissions = draft.evaluationSubmissions.filter(
        s => s.studentId !== currentUser.id
      );
      draft.evaluationSubmissions.push(newSubmission);

      // Update progress
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.progress) user.progress = { materi: 100, video: 100, lkpd: 100, latsol: 100, evaluasi: 0 };
        user.progress.evaluasi = 95;
      }
    });

    soundService.success();
    confetti({ particleCount: 120, spread: 80 });
    showToast("Evaluasi Uraian Berhasil Dikumpulkan!", "success");
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
            Sesuai urutan alur belajar matematika: Kamu harus menyelesaikan <b>LKPD Digital (Tahap 1)</b> dan <b>Latihan Soal Quizizz (Tahap 2)</b> terlebih dahulu sebelum dapat mengerjakan Evaluasi Sumatif.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {!hasCompletedLKPD && (
              <button
                onClick={() => onNavigate('siswa/lkpd')}
                className="px-6 py-3.5 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Buka LKPD Digital (Tahap 1)</span>
                <ArrowRight size={16} />
              </button>
            )}
            {hasCompletedLKPD && !hasCompletedLatsol && (
              <button
                onClick={() => onNavigate('siswa/latsol')}
                className="px-6 py-3.5 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Buka Latihan Soal Quizizz (Tahap 2)</span>
                <ArrowRight size={16} />
              </button>
            )}
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
                {previousSubmission.score}/100
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
            Evaluasi sumatif telah dikumpulkan secara final. Di bawah ini adalah langkah pembahasan lengkap untuk memperdalam pemahaman konsep pecahanmu.
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

        {/* Step-by-Step Questions & Discussion */}
        <div className="space-y-6">
          <h3 className="text-lg font-black font-mono text-slate-950 dark:text-slate-100">
            Langkah Pembahasan Kunci Jawaban:
          </h3>

          {questions.map((q, idx) => {
            const studentText = previousSubmission.textAnswers?.[q.id] || "Jawaban dikumpulkan.";

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
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-2 border-slate-950 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span className="font-black text-amber-900 dark:text-amber-400 font-mono uppercase block mb-1">
                    Jawaban yang Anda Kirim:
                  </span>
                  <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{studentText}</p>
                </div>

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
        <div className="bg-red-100 dark:bg-red-950/50 border-3 border-red-950 dark:border-red-800 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#7f1d1d] dark:shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3 text-red-950 dark:text-red-200 font-mono text-xs font-black">
          <ShieldAlert size={22} className="text-red-600 dark:text-red-400 shrink-0" />
          <span>Peringatan: Kamu telah berpindah tab sebanyak {switchCount}x. Seluruh durasi keluar dicatat dan dilaporkan ke Portal Guru.</span>
        </div>
      )}

      {/* Question Stepper Tabs */}
      <div className="flex gap-2">
        {questions.map((q, idx) => {
          const isFilled = (textAnswers[q.id] || '').trim().length > 0;
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

          {/* Photo Attachment (Optional) */}
          <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-black uppercase text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Camera size={14} />
                <span>Foto Bukti Lembar Coretan (Opsional):</span>
              </label>
              {photoProof && (
                <button
                  onClick={() => setPhotoProof(null)}
                  className="text-xs font-mono text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>

            {photoProof ? (
              <div className="relative rounded-2xl border-2 border-slate-950 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 p-2 max-w-sm">
                <img
                  src={photoProof}
                  alt="Bukti Coretan Evaluasi"
                  className="w-full h-auto max-h-48 object-contain rounded-xl"
                />
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <Upload size={16} />
                <span>Unggah Foto Lembar Jawaban Fisik (Jika Ada)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
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
            onClick={handleSubmitExam}
            className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Kumpulkan Evaluasi Final</span>
            <Send size={16} />
          </button>
        )}
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { User, LKPDSubmission, LatsolSubmission, EvaluationSubmission } from '@/types';
import {
  Trophy,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  ChevronRight,
  Star,
  Check,
  Target
} from 'lucide-react';

interface SiswaNilaiProps {
  currentUser: User;
  onNavigate?: (route: string) => void;
  showToast?: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const SiswaNilai: React.FC<SiswaNilaiProps> = ({ currentUser, onNavigate, showToast }) => {
  const [db, setDb] = useState(storageService.getState());
  const [selectedTab, setSelectedTab] = useState<'lkpd' | 'latsol' | 'evaluasi'>('lkpd');

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDb(newState);
    });
  }, []);

  // Filter student submissions
  const myLkpdSubmissions = (db.lkpdSubmissions || []).filter(s => s.studentId === currentUser.id);
  const myLatsolSubmissions = (db.latsolSubmissions || []).filter(s => s.studentId === currentUser.id);
  const myEvalSubmissions = (db.evaluationSubmissions || []).filter(s => s.studentId === currentUser.id);

  // Compute Overall Statistics
  const gradedLkpd = myLkpdSubmissions.filter(s => s.teacherScore !== null || s.aiScore !== undefined);
  const lkpdScores = gradedLkpd.map(s => (s.teacherScore !== null && s.teacherScore !== undefined ? s.teacherScore : s.aiScore || 0));
  const latsolScores = myLatsolSubmissions.map(s => s.score || 0);
  const evalScores = myEvalSubmissions.map(s => s.score || 0);

  const allScores = [...lkpdScores, ...latsolScores, ...evalScores];
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const isKkmPassed = avgScore >= 75;

  const totalFeedbackCount = myLkpdSubmissions.filter(s => !!s.teacherFeedback && s.teacherFeedback.trim().length > 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner & Student Identity */}
      <div className="p-1.5 rounded-[2.25rem] bg-slate-900/[0.04] dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 shadow-sm">
        <div className="bg-white dark:bg-slate-900 rounded-[calc(2.25rem-0.375rem)] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/20 via-sky-200/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400/90 text-slate-950 flex items-center justify-center ring-4 ring-amber-400/20 shrink-0 overflow-hidden shadow-sm">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-9 h-9 text-slate-950" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full">
                    Portal Nilai Siswa
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 rounded-full border border-amber-300/40">
                    {currentUser.class || 'Kelas 7'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Laporan Capaian Belajar, Akumulasi Skor &amp; Catatan Langsung Guru Pengampu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl text-right">
                <span className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Standar KKM</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">75 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: KPI Cards with Double-Bezel Precision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rata-Rata Nilai */}
        <div className="p-1 rounded-[1.75rem] bg-slate-900/[0.04] dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 transition-all hover:-translate-y-0.5">
          <div className="bg-white dark:bg-slate-900 rounded-[calc(1.75rem-0.25rem)] p-5 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rata-Rata Capaian</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center border border-amber-300/40">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
                  {allScores.length > 0 ? avgScore : '-'}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <div className="mt-2">
                {isKkmPassed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tuntas KKM (≥75)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-bold border border-amber-200/60 dark:border-amber-900/50">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Perlu Peningkatan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status LKPD */}
        <div className="p-1 rounded-[1.75rem] bg-slate-900/[0.04] dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 transition-all hover:-translate-y-0.5">
          <div className="bg-white dark:bg-slate-900 rounded-[calc(1.75rem-0.25rem)] p-5 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Kelengkapan LKPD</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300 flex items-center justify-center border border-cyan-300/40">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
                  {myLkpdSubmissions.length}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {db.lkpdList.length} Modul</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                {myLkpdSubmissions.length >= db.lkpdList.length ? '✓ Semua tugas terselesaikan' : 'Ada tugas yang belum dikirim'}
              </p>
            </div>
          </div>
        </div>

        {/* Latihan Soal */}
        <div className="p-1 rounded-[1.75rem] bg-slate-900/[0.04] dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 transition-all hover:-translate-y-0.5">
          <div className="bg-white dark:bg-slate-900 rounded-[calc(1.75rem-0.25rem)] p-5 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Latihan Soal</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300 flex items-center justify-center border border-purple-300/40">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
                  {myLatsolSubmissions.length}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {db.latsolRooms.length} Room</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                Uji ketangkasan & pemahaman mandiri
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Guru */}
        <div className="p-1 rounded-[1.75rem] bg-slate-900/[0.04] dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 transition-all hover:-translate-y-0.5">
          <div className="bg-white dark:bg-slate-900 rounded-[calc(1.75rem-0.25rem)] p-5 flex flex-col justify-between h-full space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Evaluasi Guru</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center border border-emerald-300/40">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
                  {totalFeedbackCount}
                </span>
                <span className="text-xs font-bold text-slate-400">Ulasan Masuk</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                Catatan personal langsung dari pengampu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setSelectedTab('lkpd')}
          className={`px-5 py-2.5 rounded-xl border-2 border-slate-950 font-black text-sm transition-all shadow-[2.5px_2.5px_0px_0px_#0f172a] cursor-pointer ${
            selectedTab === 'lkpd'
              ? 'bg-[#ffe600] text-slate-950 translate-x-0.5 translate-y-0.5 shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          LKPD
        </button>
        <button
          onClick={() => setSelectedTab('latsol')}
          className={`px-5 py-2.5 rounded-xl border-2 border-slate-950 font-black text-sm transition-all shadow-[2.5px_2.5px_0px_0px_#0f172a] cursor-pointer ${
            selectedTab === 'latsol'
              ? 'bg-[#ffe600] text-slate-950 translate-x-0.5 translate-y-0.5 shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Latihan Soal
        </button>
        <button
          onClick={() => setSelectedTab('evaluasi')}
          className={`px-5 py-2.5 rounded-xl border-2 border-slate-950 font-black text-sm transition-all shadow-[2.5px_2.5px_0px_0px_#0f172a] cursor-pointer ${
            selectedTab === 'evaluasi'
              ? 'bg-[#ffe600] text-slate-950 translate-x-0.5 translate-y-0.5 shadow-none'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Evaluasi Sumatif
        </button>
      </div>

      {/* Content Section: Detailed Grade Cards */}
      <div className="space-y-8">
        {/* SECTION 1: LKPD GRADES */}
        {selectedTab === 'lkpd' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-slate-950 bg-cyan-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <FileText className="w-4 h-4 text-slate-950" />
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">Nilai LKPD & Feedback Guru</h2>
              </div>
              <button
                onClick={() => onNavigate?.('siswa/lkpd')}
                className="text-xs font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Buka Halaman LKPD <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {db.lkpdList.map(lkpd => {
              const submission = myLkpdSubmissions.find(s => s.lkpdId === lkpd.id);
              const isGraded = submission && (submission.teacherScore !== null || submission.status === 'Dinilai');
              const finalScore = submission ? (submission.teacherScore !== null && submission.teacherScore !== undefined ? submission.teacherScore : submission.aiScore) : null;

              return (
                <div
                  key={lkpd.id}
                  className="p-1.5 rounded-[2rem] bg-slate-900/[0.04] dark:bg-white/[0.04] ring-1 ring-slate-900/10 dark:ring-white/10 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-[calc(2rem-0.375rem)] p-6 sm:p-7 space-y-6 shadow-sm">
                    {/* Header: Title & Grade Capsule */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full">
                            Tugas LKPD
                          </span>
                          {submission ? (
                            isGraded ? (
                              <span className="px-3 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Dinilai Guru
                              </span>
                            ) : (
                              <span className="px-3 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-full border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Menunggu Penilaian Guru
                              </span>
                            )
                          ) : (
                            <span className="px-3 py-0.5 text-xs font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 rounded-full border border-rose-200/60 dark:border-rose-800/40">
                              Belum Dikerjakan
                            </span>
                          )}
                          {submission?.date && (
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                              · Dikirim {submission.date}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-100 tracking-tight">
                          {lkpd.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                          {lkpd.description}
                        </p>
                      </div>

                      {/* Unified Precision Grade Capsule */}
                      <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                        {submission ? (
                          <div className={`flex flex-col items-end px-5 py-3 rounded-2xl border transition-all ${
                            finalScore !== null && finalScore >= 75
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                          }`}>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                                {finalScore !== null ? finalScore : '-'}
                              </span>
                              <span className="text-xs font-bold text-slate-400">/ 100</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-400 mt-0.5">
                              {submission.teacherScore !== null
                                ? 'Nilai Final Guru'
                                : (submission.isAiEvaluated ? `Rekomendasi AI (${submission.aiScore ?? 0})` : 'Belum Dinilai')}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onNavigate?.('siswa/lkpd')}
                            className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-mono font-black tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                          >
                            <span>Kerjakan Sekarang</span>
                            <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-slate-900/20 flex items-center justify-center text-[10px]">↗</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Editorial Feedback Strip & AI Diagnostics */}
                    {submission && (
                      <div className="space-y-3">
                        {/* Teacher Feedback Quote (Primary human input) */}
                        {submission.teacherFeedback ? (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-amber-900 dark:text-amber-400">
                              <MessageSquare size={14} className="text-amber-600" />
                              <span>Catatan & Bimbingan Guru:</span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic pl-2 border-l-2 border-amber-400/80">
                              "{submission.teacherFeedback}"
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span>Lembar pengerjaan telah dikumpulkan. Guru pengampu sedang meninjau dan akan memberikan nilai final beserta catatan bimbingan di sini.</span>
                          </div>
                        )}

                        {/* AI Diagnostic Micro-Telemetry Strip */}
                        {submission.isAiEvaluated && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-900/30 text-xs">
                            <div className="flex items-center gap-2 font-mono font-bold text-purple-950 dark:text-purple-300">
                              <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
                              <span>Verifikasi AI: {submission.aiScore ?? 0}/100</span>
                              {submission.aiFeedback && (
                                <span className="font-sans font-medium text-purple-800/80 dark:text-purple-300/80 line-clamp-1">
                                  · {submission.aiFeedback}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => onNavigate?.('siswa/lkpd')}
                              className="text-[11px] font-mono font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Buka Solusi Lengkap <span>→</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Breakdown Details */}
                    {submission?.answers && Object.keys(submission.answers).length > 0 && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-slate-500 dark:text-slate-400 mb-2.5">
                          <span>Rincian Nilai per Kegiatan LKPD:</span>
                          <button
                            onClick={() => onNavigate?.('siswa/lkpd')}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                          >
                            Tinjau di Halaman LKPD →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {lkpd.questions.map((q, qIdx) => {
                            const ans = submission.answers?.[q.id];
                            const score = ans?.aiScore !== undefined ? ans.aiScore : (q.weight || 0);
                            return (
                              <div key={q.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-slate-600 dark:text-slate-300 truncate mr-2">
                                  Kegiatan {qIdx + 1}
                                </span>
                                <span className="font-mono font-black text-slate-900 dark:text-slate-100 shrink-0">
                                  {ans ? `${score} pt` : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION 2: LATIHAN SOAL */}
        {selectedTab === 'latsol' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-slate-950 bg-purple-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <Target className="w-4 h-4 text-slate-950" />
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">Nilai Latihan Soal</h2>
              </div>
              <button
                onClick={() => onNavigate?.('siswa/latsol')}
                className="text-xs font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Buka Halaman Latihan Soal <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {db.latsolRooms.map(room => {
                const sub = myLatsolSubmissions.find(s => s.roomId === room.id);
                return (
                  <div
                    key={room.id}
                    className="border-4 border-slate-950 bg-white rounded-2xl p-5 shadow-[6px_6px_0px_0px_#0f172a] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-black bg-purple-100 text-purple-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a]">
                          Latihan Soal
                        </span>
                        {sub ? (
                          <span className="px-2 py-0.5 text-[11px] font-black bg-emerald-100 text-emerald-950 border-2 border-slate-950 rounded-lg">
                            Tuntas
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-black bg-slate-100 text-slate-700 border-2 border-slate-950 rounded-lg">
                            Belum Dikerjakan
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-950">{room.title}</h3>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        {room.questions.length} Butir Soal Pilihan Ganda Berwaktu
                      </p>
                    </div>

                    <div className="border-t-2 border-slate-100 pt-4 flex items-center justify-between">
                      {sub ? (
                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-purple-100 border-2 border-slate-950 rounded-xl text-center shadow-[2px_2px_0px_0px_#0f172a]">
                            <span className="block text-[10px] font-black uppercase text-slate-700">Skor Diperoleh</span>
                            <span className="text-2xl font-black font-mono text-purple-950">{sub.score}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">
                              {sub.correctCount} dari {sub.totalQuestions} Soal Benar
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 block">
                              Waktu: {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 italic">Belum ada skor tercatat</span>
                      )}

                      <button
                        onClick={() => onNavigate?.('siswa/latsol')}
                        className="px-3.5 py-2 bg-[#FACC15] hover:bg-[#FDE047] border-2 border-slate-950 rounded-xl font-black text-xs text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        {sub ? 'Coba Lagi' : 'Mulai'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: EVALUASI SUMATIF */}
        {selectedTab === 'evaluasi' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-slate-950 bg-rose-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <Award className="w-4 h-4 text-slate-950" />
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">Nilai Evaluasi Sumatif</h2>
              </div>
              <button
                onClick={() => onNavigate?.('siswa/evaluasi')}
                className="text-xs font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
              >
                Buka Halaman Evaluasi <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {myEvalSubmissions.length > 0 ? (
              myEvalSubmissions.map(evalSub => (
                <div
                  key={evalSub.id}
                  className="border-4 border-slate-950 bg-white rounded-2xl p-6 shadow-[6px_6px_0px_0px_#0f172a] flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-black bg-rose-100 text-rose-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a]">
                        Evaluasi Sumatif HOTS
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-black bg-emerald-100 text-emerald-950 border-2 border-slate-950 rounded-lg">
                        {evalSub.status || 'Terkumpul'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Tanggal: {evalSub.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950">
                      Ujian Capaian Pemahaman & Penalaran Pecahan
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">
                      Pengujian komprehensif konsep pecahan, operasi hitung kontekstual, dan pemecahan masalah.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="px-5 py-3 bg-rose-200 border-4 border-slate-950 rounded-2xl text-center shadow-[4px_4px_0px_0px_#0f172a]">
                      <span className="block text-[11px] font-black uppercase tracking-wider text-slate-950">Skor Evaluasi</span>
                      <span className="text-3xl font-black font-mono text-slate-950">{evalSub.score}</span>
                    </div>
                    <button
                      onClick={() => onNavigate?.('siswa/evaluasi')}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border-2 border-slate-950 rounded-xl font-black text-xs uppercase text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transition-all"
                    >
                      Lihat Lembar Ujian
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-4 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 border-2 border-slate-400 flex items-center justify-center mx-auto text-slate-600">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-800">Evaluasi Sumatif Belum Dikerjakan</h4>
                <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                  Kamu belum menyelesaikan ujian evaluasi sumatif akhir bab. Silakan selesaikan seluruh LKPD dan latihan soal terlebih dahulu.
                </p>
                <button
                  onClick={() => onNavigate?.('siswa/evaluasi')}
                  className="mt-2 px-5 py-2.5 bg-[#FACC15] hover:bg-[#FDE047] border-2 border-slate-950 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] inline-flex items-center gap-2"
                >
                  Buka Halaman Evaluasi <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

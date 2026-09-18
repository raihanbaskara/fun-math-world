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

      {/* Bento Grid: KPI Cards in Neo-Brutalism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rata-Rata Nilai */}
        <div className="border-4 border-slate-950 bg-white rounded-2xl p-5 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Rata-Rata Capaian</span>
            <div className="w-10 h-10 rounded-xl border-2 border-slate-950 bg-yellow-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <TrendingUp className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-slate-950">
                {allScores.length > 0 ? avgScore : '-'}
              </span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-1.5">
              {isKkmPassed ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi Standar KKM
                </span>
              ) : (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Perlu Peningkatan
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status LKPD */}
        <div className="border-4 border-slate-950 bg-white rounded-2xl p-5 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Kelengkapan LKPD</span>
            <div className="w-10 h-10 rounded-xl border-2 border-slate-950 bg-cyan-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <FileText className="w-4 h-4 text-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-slate-950">
                {myLkpdSubmissions.length}
              </span>
              <span className="text-sm font-bold text-slate-500">/ {db.lkpdList.length} Modul</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2">
              {myLkpdSubmissions.length >= db.lkpdList.length ? '✓ Semua tugas terselesaikan' : 'Ada tugas yang belum dikirim'}
            </p>
          </div>
        </div>

        {/* Latihan Soal */}
        <div className="border-4 border-slate-950 bg-white rounded-2xl p-5 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Latihan Soal</span>
            <div className="w-10 h-10 rounded-xl border-2 border-slate-950 bg-purple-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <Target className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-slate-950">
                {myLatsolSubmissions.length}
              </span>
              <span className="text-sm font-bold text-slate-500">/ {db.latsolRooms.length} Room</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2">
              Uji ketangkasan & kecepatan hitung
            </p>
          </div>
        </div>

        {/* Feedback Guru */}
        <div className="border-4 border-slate-950 bg-white rounded-2xl p-5 shadow-[6px_6px_0px_0px_#0f172a] relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Evaluasi Guru</span>
            <div className="w-10 h-10 rounded-xl border-2 border-slate-950 bg-emerald-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <MessageSquare className="w-5 h-5 text-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-slate-950">
                {totalFeedbackCount}
              </span>
              <span className="text-sm font-bold text-slate-500">Ulasan Masuk</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2">
              Catatan personal langsung dari pengampu
            </p>
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
          Evaluasi
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
                  className="border-4 border-slate-950 bg-white rounded-2xl p-6 shadow-[6px_6px_0px_0px_#0f172a] space-y-6 hover:-translate-y-0.5 transition-transform"
                >
                  {/* Card Top: LKPD Meta & Score Badge */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-slate-100 pb-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-black bg-cyan-100 text-cyan-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a]">
                          Tugas LKPD
                        </span>
                        {submission ? (
                          isGraded ? (
                            <span className="px-2.5 py-0.5 text-xs font-black bg-emerald-100 text-emerald-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Selesai Dinilai Guru
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-black bg-amber-100 text-amber-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-700" /> Menunggu Penilaian Guru
                            </span>
                          )
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs font-black bg-rose-100 text-rose-950 border-2 border-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#0f172a]">
                            Belum Dikerjakan
                          </span>
                        )}
                        {submission?.date && (
                          <span className="text-xs font-mono font-bold text-slate-500">
                            Dikirim: {submission.date}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                        {lkpd.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-2xl mt-1 leading-relaxed">
                        {lkpd.description}
                      </p>
                    </div>

                    {/* Neo-Brutalist Score Indicator */}
                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                      {submission ? (
                        <div className={`px-5 py-3 border-4 border-slate-950 rounded-2xl text-center shadow-[4px_4px_0px_0px_#0f172a] ${
                          finalScore !== null && finalScore >= 75 ? 'bg-emerald-300' : 'bg-amber-300'
                        }`}>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-950">
                            {submission.teacherScore !== null
                              ? 'Nilai Final Guru'
                              : (submission.isAiEvaluated ? 'Rekomendasi AI' : 'Belum Dinilai')}
                          </span>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-950">
                              {finalScore !== null ? finalScore : '-'}
                            </span>
                            <span className="text-xs font-black text-slate-700">/ 100</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => onNavigate?.('siswa/lkpd')}
                          className="px-4 py-2.5 bg-[#FACC15] hover:bg-[#FDE047] border-2 border-slate-950 rounded-xl font-black text-xs text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Kerjakan Sekarang</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Teacher Feedback Quote */}
                  {submission && (
                    <div className="space-y-3">
                      {submission.teacherFeedback ? (
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-100 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-950">
                            <MessageSquare size={14} className="text-amber-900" />
                            <span>Catatan & Bimbingan Guru:</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed italic pl-3 border-l-4 border-slate-950">
                            "{submission.teacherFeedback}"
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-100 border-2 border-slate-950 text-xs font-bold text-slate-600 shadow-[2px_2px_0px_0px_#0f172a]">
                          <Clock size={14} className="text-slate-700 shrink-0" />
                          <span>Lembar pengerjaan telah dikumpulkan. Menunggu penilaian dan catatan resmi dari guru pengampu.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Breakdown Details */}
                  {submission?.answers && Object.keys(submission.answers).length > 0 && (
                    <div className="pt-4 border-t-2 border-slate-100">
                      <div className="flex items-center justify-between text-xs font-mono font-black uppercase text-slate-600 mb-3">
                        <span>Rincian Nilai per Kegiatan LKPD:</span>
                        <button
                          onClick={() => onNavigate?.('siswa/lkpd')}
                          className="text-indigo-600 hover:text-indigo-800 font-black hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Tinjau di Halaman LKPD →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {lkpd.questions.map((q, qIdx) => {
                          const ans = submission.answers?.[q.id];
                          const score = ans?.aiScore !== undefined ? ans.aiScore : (q.weight || 0);
                          return (
                            <div key={q.id} className="p-3 rounded-xl bg-slate-100 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-between text-xs">
                              <span className="font-mono font-black text-slate-800 truncate mr-2">
                                Kegiatan {qIdx + 1}
                              </span>
                              <span className="font-mono font-black px-2 py-0.5 rounded bg-white border border-slate-950 text-slate-950 shrink-0">
                                {ans ? `${score} pt` : '-'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

        {/* SECTION 3: EVALUASI */}
        {selectedTab === 'evaluasi' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-slate-950 bg-rose-300 flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
                  <Award className="w-4 h-4 text-slate-950" />
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">Nilai Evaluasi</h2>
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
                        Evaluasi HOTS
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
                <h4 className="text-base font-black text-slate-800">Evaluasi Belum Dikerjakan</h4>
                <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                  Kamu belum menyelesaikan ujian evaluasi akhir bab. Silakan selesaikan seluruh LKPD dan latihan soal terlebih dahulu.
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

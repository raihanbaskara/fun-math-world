import React from 'react';
import { User } from '@/types';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import {
  BookOpen,
  FileText,
  Gamepad2,
  PenTool,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const SiswaHome: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
}> = ({ currentUser, onNavigate }) => {
  const db = storageService.getState();

  const hasLKPD = db.lkpdSubmissions.some(s => s.studentId === currentUser.id) || (currentUser.progress?.lkpd || 0) >= 100;
  const hasLatsol = (db.latsolSubmissions && db.latsolSubmissions.some(s => s.studentId === currentUser.id)) || (currentUser.progress?.latsol || 0) > 0;
  const hasEvaluasi = db.evaluationSubmissions.some(s => s.studentId === currentUser.id) || (currentUser.progress?.evaluasi || 0) > 0;

  const schedules = db.schedules || [];

  const handleAction = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="space-y-8 pb-12 font-sans max-w-6xl mx-auto">
      
      {/* 1. TOP GREETING BANNER (RAMPING & SLEEK NEOBRUTALISM V3) */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tight">
          LEARNING
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              PORTAL SISWA
            </span>
            <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
              {currentUser.class || "Kelas 7-A"} • Kurikulum Merdeka
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
            Selamat Belajar, {currentUser.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
            Ikuti alur pembelajaran berurutan di bawah ini untuk menguasai materi pecahan, menyelesaikan penugasan LKPD digital, kuis latihan soal, dan evaluasi sumatif.
          </p>
        </div>
      </div>

      {/* 2. STRICT 3-STEP SEQUENTIAL LEARNING TRACKER */}
      <div className="bg-white border-4 border-slate-950 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-slate-950 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-[#fbcfe8] text-slate-950 font-mono font-black text-xs uppercase rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                ALUR BELAJAR WAJIB BERURUTAN
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-950 mt-1">
              Tahapan Belajar Matematika Pecahan
            </h2>
          </div>
          <span className="text-xs font-mono font-bold bg-[#fffdf5] px-3 py-1 rounded-xl border-2 border-slate-950 text-slate-700">
            Wajib LKPD → Latihan Soal → Evaluasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* STEP 1: LKPD DIGITAL */}
          <div className={`rounded-2xl border-3 border-slate-950 p-5 flex flex-col justify-between transition-all ${
            hasLKPD ? 'bg-emerald-50 shadow-[4px_4px_0px_0px_#0f172a]' : 'bg-[#fffdf5] shadow-[6px_6px_0px_0px_#0f172a]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#ffe600] border-2 border-slate-950 font-mono font-black text-xs flex items-center justify-center text-slate-950">
                  1
                </span>
                {hasLKPD ? (
                  <span className="px-2.5 py-1 bg-emerald-300 text-emerald-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Selesai
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[#ffe600] text-slate-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950">
                    Tahap Pertama
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-mono font-black text-base text-slate-950">LKPD Digital Soal Essai</h3>
                <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
                  Jawab butir soal uraian dan buka pembahasan otomatis bersama Asisten AI.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <button
                onClick={() => handleAction('siswa/lkpd')}
                className="w-full py-2.5 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{hasLKPD ? 'Lihat Tugas LKPD' : 'Kerjakan LKPD 1'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* STEP 2: LATIHAN SOAL QUIZIZZ */}
          <div className={`rounded-2xl border-3 border-slate-950 p-5 flex flex-col justify-between transition-all ${
            !hasLKPD
              ? 'bg-slate-100 opacity-80 shadow-[2px_2px_0px_0px_#64748b]'
              : hasLatsol
              ? 'bg-emerald-50 shadow-[4px_4px_0px_0px_#0f172a]'
              : 'bg-[#fffdf5] shadow-[6px_6px_0px_0px_#0f172a]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`w-8 h-8 rounded-xl border-2 border-slate-950 font-mono font-black text-xs flex items-center justify-center ${
                  hasLKPD ? 'bg-[#a5f3fc] text-slate-950' : 'bg-slate-300 text-slate-600'
                }`}>
                  2
                </span>
                {!hasLKPD ? (
                  <span className="px-2.5 py-1 bg-slate-300 text-slate-700 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 flex items-center gap-1">
                    <Lock size={12} /> Terkunci
                  </span>
                ) : hasLatsol ? (
                  <span className="px-2.5 py-1 bg-emerald-300 text-emerald-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Selesai
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[#a5f3fc] text-slate-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950">
                    Siap Dikerjakan
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-mono font-black text-base text-slate-950">Latihan Soal (Quizizz)</h3>
                <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
                  Kuis room berwaktu dengan auto-submit dan papan skor instan.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <button
                onClick={() => handleAction('siswa/latsol')}
                disabled={!hasLKPD}
                className={`w-full py-2.5 font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-950 transition-all flex items-center justify-center gap-1.5 ${
                  hasLKPD
                    ? 'bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{hasLatsol ? 'Buka Latihan Soal' : 'Mulai Latihan Soal'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* STEP 3: EVALUASI SUMATIF */}
          <div className={`rounded-2xl border-3 border-slate-950 p-5 flex flex-col justify-between transition-all ${
            !hasLatsol
              ? 'bg-slate-100 opacity-80 shadow-[2px_2px_0px_0px_#64748b]'
              : hasEvaluasi
              ? 'bg-emerald-50 shadow-[4px_4px_0px_0px_#0f172a]'
              : 'bg-[#fffdf5] shadow-[6px_6px_0px_0px_#0f172a]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`w-8 h-8 rounded-xl border-2 border-slate-950 font-mono font-black text-xs flex items-center justify-center ${
                  hasLatsol ? 'bg-[#fbcfe8] text-slate-950' : 'bg-slate-300 text-slate-600'
                }`}>
                  3
                </span>
                {!hasLatsol ? (
                  <span className="px-2.5 py-1 bg-slate-300 text-slate-700 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 flex items-center gap-1">
                    <Lock size={12} /> Terkunci
                  </span>
                ) : hasEvaluasi ? (
                  <span className="px-2.5 py-1 bg-emerald-300 text-emerald-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Selesai
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[#fbcfe8] text-slate-950 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950">
                    Tahap Final
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-mono font-black text-base text-slate-950">Evaluasi Sumatif HOTS</h3>
                <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
                  Ujian akhir bab pecahan dengan pengawasan tab integrity monitor.
                </p>
              </div>
            </div>

            <div className="pt-5">
              <button
                onClick={() => handleAction('siswa/evaluasi')}
                disabled={!hasLatsol}
                className={`w-full py-2.5 font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-950 transition-all flex items-center justify-center gap-1.5 ${
                  hasLatsol
                    ? 'bg-[#fbcfe8] hover:bg-pink-300 text-slate-950 shadow-[3px_3px_0px_0px_#0f172a] cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{hasEvaluasi ? 'Lihat Hasil Evaluasi' : 'Mulai Evaluasi'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. JADWAL PEMBELAJARAN & TUGAS (SCHEDULES FEATURE) */}
      <div className="bg-white border-4 border-slate-950 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-slate-950 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a]">
              <Calendar size={20} className="text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-950">
                Jadwal Materi &amp; Agenda Tugas
              </h2>
              <p className="text-xs font-bold text-slate-600">
                Timeline pelaksanaan pembelajaran semester ganjil
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((sch) => {
            const typeBadgeColors = {
              materi: 'bg-[#ffe600] text-slate-950',
              lkpd: 'bg-[#a5f3fc] text-slate-950',
              latsol: 'bg-[#bef264] text-slate-950',
              evaluasi: 'bg-[#fbcfe8] text-slate-950'
            };

            return (
              <div
                key={sch.id}
                className="p-5 rounded-2xl bg-[#fffdf5] border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 font-mono text-[11px] font-black rounded-lg border-2 border-slate-950 uppercase ${typeBadgeColors[sch.type] || 'bg-slate-200'}`}>
                    {sch.type}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                    <Clock size={13} />
                    <span>{sch.date} • {sch.dueTime}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-black text-sm text-slate-950">{sch.title}</h4>
                  <p className="text-xs font-bold text-slate-600 mt-1">{sch.description}</p>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold">{sch.topic}</span>
                  <span className="font-black text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-950">
                    {sch.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

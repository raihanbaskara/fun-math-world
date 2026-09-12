import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';
import {
  ShieldCheck,
  Edit3,
  LogOut,
  Award,
  BookOpen,
  FileText,
  Trophy,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  UserCheck,
  Zap,
  HelpCircle,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';

export const SiswaProfil: React.FC<{
  currentUser: User;
  onLogout: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onLogout, showToast }) => {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(currentUser.name);

  // Reactive DB subscription
  const [db, setDb] = useState(storageService.getState());
  useEffect(() => {
    const unsub = storageService.subscribe(newDb => {
      setDb({ ...newDb });
    });
    return () => unsub();
  }, []);

  const activeUser = db.users.find(u => u.id === currentUser.id) || currentUser;

  // Real-time submissions by this student
  const lkpdSubmissions = db.lkpdSubmissions.filter(s => s.studentId === activeUser.id);
  const latsolSubmissions = (db.latsolSubmissions || []).filter(s => s.studentId === activeUser.id);
  const evalSubmissions = (db.evaluationSubmissions || []).filter(s => s.studentId === activeUser.id);
  const totalLkpd = Math.max(db.lkpdList?.length || 2, 1);

  // 1. LKPD Score & Progress (% of total available LKPD completed)
  const lkpdDoneCount = lkpdSubmissions.length;
  const lkpdScore = Math.min(100, Math.round((lkpdDoneCount / totalLkpd) * 100));

  // 2. Evaluasi & Latihan Score
  const allQuizScores: number[] = [
    ...latsolSubmissions.map(s => s.score ?? 0),
    ...evalSubmissions.map(s => s.score ?? 0)
  ];
  const evalScore = allQuizScores.length > 0
    ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
    : 0;

  // 3. Materi & Studio Progress (from user.progress if marked, otherwise 0 if nothing done)
  const p = activeUser.progress;
  const materiScore = p?.materi ?? (lkpdDoneCount > 0 ? 100 : 0);
  const videoScore = p?.video ?? (lkpdDoneCount > 0 ? 100 : 0);

  // Overall average progress across all 4 pillars
  const totalAvg = Math.round(
    (materiScore + videoScore + lkpdScore + evalScore) / 4
  );

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!nameInput.trim()) {
      showToast("Nama tidak boleh kosong!", "error");
      return;
    }

    storageService.update(draft => {
      const u = draft.users.find(usr => usr.id === activeUser.id);
      if (u) {
        u.name = nameInput.trim();
      }
    });

    setIsEditOpen(false);
    soundService.success();
    showToast("Nama profil berhasil diperbarui!", "success");
  };

  const competencies = [
    {
      title: 'Materi & Konsep Visual',
      desc: 'Pemahaman materi pecahan & modul teori',
      score: materiScore,
      icon: BookOpen,
      bg: 'bg-[#38bdf8]',
      badge: 'MODUL TEORI'
    },
    {
      title: 'Studio & Video Interaktif',
      desc: 'Eksperimen pizza, balok, & peraga pecahan',
      score: videoScore,
      icon: Layers,
      bg: 'bg-[#a3e635]',
      badge: 'SIMULASI'
    },
    {
      title: 'LKPD Digital AI',
      desc: 'Penyelesaian lembar kerja & koreksi AI per soal',
      score: lkpdScore,
      icon: FileText,
      bg: 'bg-[#ffe600]',
      badge: totalLkpd > 1 ? `LKPD 1 - ${totalLkpd}` : 'LKPD'
    },
    {
      title: 'Evaluasi Sumatif & Latihan',
      desc: 'Kuis Latihan Soal & Evaluasi Essai Kurikulum',
      score: evalScore,
      icon: Trophy,
      bg: 'bg-[#ff94e8]',
      badge: 'UJIAN AKHIR'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO PROFILE IDENTITY CARD (NEOBRUTALISM CANARY YELLOW) */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        {/* Subtle geometric watermark */}
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tighter leading-none">
          {totalAvg}%
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          
          {/* Avatar Frame with Neobrutal Badge */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white dark:bg-slate-900 border-4 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] p-1.5 overflow-hidden flex items-center justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-2.5 -right-2.5 bg-[#38bdf8] text-slate-950 p-2 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center" title="Akun Terverifikasi">
              <ShieldCheck size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Profile Data Info */}
          <div className="text-center sm:text-left flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
                SISWA RESMI
              </span>
              <span className="px-3 py-1 rounded-xl bg-white text-slate-950 font-mono font-black text-xs border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
                {currentUser.class || 'Kelas 7-B'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#a3e635] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
                NIS: {currentUser.username}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight leading-snug">
              {currentUser.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-slate-900 border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-mono font-bold">
                <Lock size={13} className="text-slate-950" />
                <span>Device Auth: Terikat</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ff94e8] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-mono font-black text-slate-950">
                <Flame size={13} />
                <span>Skor Total: {totalAvg}%</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex sm:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={() => {
                soundService.click();
                setIsEditOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit3 size={15} />
              <span>Ubah Nama</span>
            </button>
            <button
              onClick={() => {
                soundService.click();
                onLogout();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. STATS SUMMARY 3-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111827] rounded-3xl border-3 border-slate-950 dark:border-slate-800 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
            <FileText size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
              Tugas LKPD
            </span>
            <span className="text-xl font-black font-mono text-slate-950 dark:text-slate-100">
              {lkpdDoneCount} / {totalLkpd} Selesai ({lkpdScore}%)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl border-3 border-slate-950 dark:border-slate-800 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#38bdf8] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
            <HelpCircle size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
              Latihan Soal
            </span>
            <span className="text-xl font-black font-mono text-slate-950 dark:text-slate-100">
              {latsolSubmissions.length > 0 ? `${latsolSubmissions.length} Kuis (Skor ${latsolSubmissions[0].score})` : '0 Kuis Diikuti'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl border-3 border-slate-950 dark:border-slate-800 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#a3e635] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center shrink-0">
            <Trophy size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
              Evaluasi Sumatif
            </span>
            <span className="text-xl font-black font-mono text-slate-950 dark:text-slate-100">
              {evalSubmissions.length > 0 ? `Selesai (${evalSubmissions[0].score}/100)` : 'Belum Mulai'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAPAIAN BELAJAR 4-PILLAR SECTION */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#38bdf8] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
              <Sparkles size={20} className="text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-slate-100 uppercase tracking-tight">
                Matriks Capaian Belajar Siswa
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Progres penguasaan materi, tugas digital, dan evaluasi kurikulum
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#fffdf5] dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 font-mono font-black text-xs text-slate-900 dark:text-slate-100 w-fit shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
            4 Komponen Kurikulum
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {competencies.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <div
                key={idx}
                className="bg-[#fffdf5] dark:bg-slate-900 rounded-2xl border-3 border-slate-950 dark:border-slate-800 p-4 sm:p-5 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${comp.bg} border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] shrink-0`}>
                      <Icon size={18} className="text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono font-black px-2 py-0.2 rounded bg-slate-950 text-white uppercase border border-slate-950 dark:border-slate-700">
                          {comp.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black font-mono text-slate-950 dark:text-slate-100 leading-tight">
                        {comp.title}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {comp.desc}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 font-mono font-black text-sm text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    {comp.score}%
                  </span>
                </div>

                {/* Neobrutal Progress Bar */}
                <div className="w-full bg-white dark:bg-slate-950 h-3.5 rounded-xl border-2 border-slate-950 dark:border-slate-700 overflow-hidden p-0.5 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#000000]">
                  <div
                    className={`${comp.bg} h-full rounded-lg border border-slate-950 dark:border-slate-700 transition-all duration-700`}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LENCANA PRESTASI & INTEGRITAS */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-5">
        <div className="flex items-center gap-3 border-b-3 border-slate-950 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-[#ff94e8] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
            <Award size={20} className="text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950 dark:text-slate-100 uppercase tracking-tight">
              Lencana & Prestasi Akademik
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Penghargaan atas kedisiplinan dan capaian nilai matematika
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] ${materiScore >= 80 ? 'bg-[#fffdf5] dark:bg-slate-900' : 'bg-slate-100 dark:bg-slate-800 opacity-70'}`}>
            <div className={`w-9 h-9 rounded-xl border-2 border-slate-950 dark:border-slate-800 flex items-center justify-center shrink-0 ${materiScore >= 80 ? 'bg-[#ffe600]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              {materiScore >= 80 ? <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" /> : <Clock size={16} />}
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 dark:text-slate-100 block">Master Pecahan</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {materiScore >= 80 ? 'Modul Teori Tuntas' : 'Pelajari Modul Teori'}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] ${lkpdDoneCount > 0 ? 'bg-[#fffdf5] dark:bg-slate-900' : 'bg-slate-100 dark:bg-slate-800 opacity-70'}`}>
            <div className={`w-9 h-9 rounded-xl border-2 border-slate-950 dark:border-slate-800 flex items-center justify-center shrink-0 ${lkpdDoneCount > 0 ? 'bg-[#38bdf8]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              {lkpdDoneCount > 0 ? <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" /> : <Clock size={16} />}
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 dark:text-slate-100 block">Disiplin LKPD AI</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {lkpdDoneCount > 0 ? `${lkpdDoneCount} LKPD Terkirim` : 'Belum Ada LKPD'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-[#fffdf5] dark:bg-slate-900 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]">
            <div className="w-9 h-9 rounded-xl bg-[#a3e635] border-2 border-slate-950 dark:border-slate-800 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 dark:text-slate-100 block">Anti-Curang 100%</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Fokus Tab Terjaga</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT NAME MODAL (PURE NEOBRUTAL) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Perbarui Nama Profil Siswa"
      >
        <form onSubmit={handleSaveName} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap Siswa:
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 text-sm font-bold font-mono focus:bg-amber-50 dark:focus:bg-slate-900 focus:ring-0 outline-none shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]"
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono font-black text-xs uppercase border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase border-2 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

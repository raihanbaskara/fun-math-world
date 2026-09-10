import React, { useState } from 'react';
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

  const db = storageService.getState();
  const lkpdSubmissions = db.lkpdSubmissions.filter(s => s.studentId === currentUser.id);
  const latsolSubmissions = (db.latsolSubmissions || []).filter(s => s.studentId === currentUser.id);
  const evalSubmissions = (db.evaluationSubmissions || []).filter(s => s.studentId === currentUser.id);

  const p = currentUser.progress || { materi: 85, video: 70, lkpd: 100, evaluasi: 90 };

  // Calculate overall average progress
  const totalAvg = Math.round(
    ((p.materi || 0) + (p.video || 0) + (p.lkpd || 0) + (p.evaluasi || 0)) / 4
  );

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!nameInput.trim()) {
      showToast("Nama tidak boleh kosong!", "error");
      return;
    }

    storageService.update(draft => {
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        user.name = nameInput.trim();
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
      score: p.materi || 85,
      icon: BookOpen,
      bg: 'bg-[#38bdf8]',
      badge: 'MODUL TEORI'
    },
    {
      title: 'Studio & Video Interaktif',
      desc: 'Eksperimen pizza, balok, & peraga pecahan',
      score: p.video || 80,
      icon: Layers,
      bg: 'bg-[#a3e635]',
      badge: 'SIMULASI'
    },
    {
      title: 'LKPD Digital AI',
      desc: 'Penyelesaian lembar kerja & koreksi AI per soal',
      score: p.lkpd || 100,
      icon: FileText,
      bg: 'bg-[#ffe600]',
      badge: 'LKPD 1 & 2'
    },
    {
      title: 'Evaluasi Sumatif & Latihan',
      desc: 'Kuis Latihan Soal & Evaluasi Essai Kurikulum',
      score: p.evaluasi || 90,
      icon: Trophy,
      bg: 'bg-[#ff94e8]',
      badge: 'UJIAN AKHIR'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. HERO PROFILE IDENTITY CARD (NEOBRUTALISM CANARY YELLOW) */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        {/* Subtle geometric watermark */}
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tighter leading-none">
          100%
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          
          {/* Avatar Frame with Neobrutal Badge */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border-4 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] p-1.5 overflow-hidden flex items-center justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-2.5 -right-2.5 bg-[#38bdf8] text-slate-950 p-2 rounded-2xl border-3 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center" title="Akun Terverifikasi">
              <ShieldCheck size={18} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Profile Data Info */}
          <div className="text-center sm:text-left flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                SISWA RESMI
              </span>
              <span className="px-3 py-1 rounded-xl bg-white text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                {currentUser.class || 'Kelas 7-B'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#a3e635] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                NIS: {currentUser.username}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight leading-snug">
              {currentUser.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-xs font-mono font-bold text-slate-900">
                <Lock size={13} className="text-slate-950" />
                <span>Device Auth: Terikat</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ff94e8] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-xs font-mono font-black text-slate-950">
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
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit3 size={15} />
              <span>Ubah Nama</span>
            </button>
            <button
              onClick={() => {
                soundService.click();
                onLogout();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. STATS SUMMARY 3-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border-3 border-slate-950 p-5 shadow-[5px_5px_0px_0px_#0f172a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <FileText size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider block">
              Tugas LKPD
            </span>
            <span className="text-xl font-black font-mono text-slate-950">
              {lkpdSubmissions.length} Selesai
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-3 border-slate-950 p-5 shadow-[5px_5px_0px_0px_#0f172a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#38bdf8] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <HelpCircle size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider block">
              Latihan Soal
            </span>
            <span className="text-xl font-black font-mono text-slate-950">
              {latsolSubmissions.length} Kuis Diikuti
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-3 border-slate-950 p-5 shadow-[5px_5px_0px_0px_#0f172a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#a3e635] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
            <Trophy size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider block">
              Evaluasi Sumatif
            </span>
            <span className="text-xl font-black font-mono text-slate-950">
              {evalSubmissions.length > 0 ? 'Terselesaikan' : 'Belum Mulai'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAPAIAN BELAJAR 4-PILLAR SECTION */}
      <div className="bg-white rounded-3xl border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-slate-950 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#38bdf8] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
              <Sparkles size={20} className="text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950 uppercase tracking-tight">
                Matriks Capaian Belajar Siswa
              </h2>
              <p className="text-xs font-bold text-slate-600">
                Progres penguasaan materi, tugas digital, dan evaluasi kurikulum
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#fffdf5] border-2 border-slate-950 font-mono font-black text-xs text-slate-900 w-fit">
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
                className="bg-[#fffdf5] rounded-2xl border-3 border-slate-950 p-4 sm:p-5 shadow-[4px_4px_0px_0px_#0f172a] space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${comp.bg} border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] shrink-0`}>
                      <Icon size={18} className="text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono font-black px-2 py-0.2 rounded bg-slate-950 text-white uppercase">
                          {comp.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black font-mono text-slate-950 leading-tight">
                        {comp.title}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-600 line-clamp-1 mt-0.5">
                        {comp.desc}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-slate-950 font-mono font-black text-sm text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] shrink-0">
                    {comp.score}%
                  </span>
                </div>

                {/* Neobrutal Progress Bar */}
                <div className="w-full bg-white h-3.5 rounded-xl border-2 border-slate-950 overflow-hidden p-0.5 shadow-[1px_1px_0px_0px_#0f172a]">
                  <div
                    className={`${comp.bg} h-full rounded-lg border border-slate-950 transition-all duration-700`}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LENCANA PRESTASI & INTEGRITAS */}
      <div className="bg-white rounded-3xl border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-5">
        <div className="flex items-center gap-3 border-b-3 border-slate-950 pb-4">
          <div className="p-2.5 rounded-2xl bg-[#ff94e8] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
            <Award size={20} className="text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950 uppercase tracking-tight">
              Lencana & Prestasi Akademik
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Penghargaan atas kedisiplinan dan capaian nilai matematika
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="flex items-center gap-3 p-3.5 bg-[#fffdf5] rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <div className="w-9 h-9 rounded-xl bg-[#ffe600] border-2 border-slate-950 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 block">Master Pecahan</span>
              <span className="text-[10px] font-bold text-slate-600">Modul Teori Tuntas</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-[#fffdf5] rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8] border-2 border-slate-950 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 block">Disiplin LKPD AI</span>
              <span className="text-[10px] font-bold text-slate-600">Koreksi Instan Aktif</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-[#fffdf5] rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <div className="w-9 h-9 rounded-xl bg-[#a3e635] border-2 border-slate-950 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black font-mono text-slate-950 block">Anti-Curang 100%</span>
              <span className="text-[10px] font-bold text-slate-600">Fokus Tab Terjaga</span>
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
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Lengkap Siswa:
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-3 border-slate-950 bg-white text-slate-950 text-sm font-bold font-mono focus:bg-amber-50 focus:ring-0 outline-none shadow-[3px_3px_0px_0px_#0f172a]"
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs uppercase border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

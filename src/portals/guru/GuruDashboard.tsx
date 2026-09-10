import React from 'react';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storageService';
import { User } from '@/types';
import {
  Users,
  FileText,
  HelpCircle,
  PenTool,
  BarChart3,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award
} from 'lucide-react';

export const GuruDashboard: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
}> = ({ currentUser, onNavigate }) => {
  const db = storageService.getState();

  const students = db.users.filter(u => u.role === 'siswa');
  const studentCount = students.length;
  const lkpdSubCount = db.lkpdSubmissions.length;
  const latsolSubCount = db.latsolSubmissions?.length || 0;
  const examSubCount = db.evaluationSubmissions?.length || 0;

  // Aggregate student reflections
  const reflections = db.reflections || [];

  // Aggregate tab switch incidents across all tasks
  const allIncidents: { studentName: string; taskType: string; count: number; seconds: number; date: string }[] = [];
  
  // From Evaluation
  db.evaluationSubmissions?.forEach(sub => {
    if (sub.antiCheat && sub.antiCheat.switchCount > 0) {
      allIncidents.push({
        studentName: sub.studentName,
        taskType: 'Evaluasi Sumatif',
        count: sub.antiCheat.switchCount,
        seconds: sub.antiCheat.totalLeaveSeconds,
        date: sub.date
      });
    }
  });

  // From LKPD
  db.lkpdSubmissions?.forEach(sub => {
    if (sub.antiCheat && sub.antiCheat.switchCount > 0) {
      allIncidents.push({
        studentName: sub.studentName,
        taskType: 'LKPD Digital',
        count: sub.antiCheat.switchCount,
        seconds: sub.antiCheat.totalLeaveSeconds,
        date: sub.date
      });
    }
  });

  // From Latsol
  db.latsolSubmissions?.forEach(sub => {
    if (sub.antiCheat && sub.antiCheat.switchCount > 0) {
      allIncidents.push({
        studentName: sub.studentName,
        taskType: 'Kuis Latsol',
        count: sub.antiCheat.switchCount,
        seconds: sub.antiCheat.totalLeaveSeconds,
        date: sub.date
      });
    }
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          TEACHER
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-950 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000]">
              PORTAL GURU MATEMATIKA
            </span>
            <span className="px-3 py-1 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-200 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold font-mono">
              Kelas 7-A Kurikulum Merdeka
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
            Dasbor Manajemen &amp; Penilaian Guru
          </h1>

          <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
            Kelola materi pecahan, verifikasi pengerjaan LKPD digital siswa dengan validasi Asisten AI, atur waktu ruang kuis Latsol, pantau refleksi diri, serta ekspor rekap nilai format Excel (.xlsx).
          </p>
        </div>
      </div>

      {/* 4-Column Stat Metrics (Neobrutalist Pop Tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        <div
          onClick={() => onNavigate('guru/siswa')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Siswa Terdaftar</span>
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-950 dark:text-slate-100">
            {studentCount}
          </div>
        </div>

        <div
          onClick={() => onNavigate('guru/lkpd')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">LKPD Masuk</span>
            <div className="w-9 h-9 rounded-xl bg-[#a3e635] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-950 dark:text-slate-100">
            {lkpdSubCount}
          </div>
        </div>

        <div
          onClick={() => onNavigate('guru/latsol')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Latihan Soal</span>
            <div className="w-9 h-9 rounded-xl bg-[#ff94e8] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-950 dark:text-slate-100">
            {latsolSubCount}
          </div>
        </div>

        <div
          onClick={() => onNavigate('guru/rekap')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-2 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#0f172a] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Evaluasi Essai</span>
            <div className="w-9 h-9 rounded-xl bg-[#c084fc] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
              <PenTool size={18} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-950 dark:text-slate-100">
            {examSubCount}
          </div>
        </div>

      </div>

      {/* Two-Column Feeds: 1. Refleksi Siswa & 2. Anti-Cheat Monitoring Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Refleksi Siswa Masuk ke Guru */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <HeartHandshake size={20} className="text-pink-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-950 dark:text-slate-100">Refleksi Belajar Siswa</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">Catatan pemahaman &amp; kendala siswa</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-pink-100 text-slate-950 font-mono text-xs font-black border border-slate-950">
              {reflections.length} Catatan
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {reflections.map(ref => (
              <div key={ref.id} className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border-2 border-slate-950 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ref.emoji || '😊'}</span>
                    <span className="font-black text-xs text-slate-950 dark:text-slate-100">{ref.studentName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">{ref.date}</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-emerald-900 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="font-black text-emerald-950 dark:text-emerald-200">Mudah dipahami: </span>
                    <span className="font-medium">{ref.easy}</span>
                  </div>
                  <div className="text-rose-900 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                    <span className="font-black text-rose-950 dark:text-rose-200">Tantangan: </span>
                    <span className="font-medium">{ref.challenge}</span>
                  </div>
                </div>
              </div>
            ))}

            {reflections.length === 0 && (
              <div className="p-6 text-center text-slate-400 font-bold text-xs">
                Belum ada catatan refleksi metakognisi dari siswa.
              </div>
            )}
          </div>
        </div>

        {/* Anti-Cheat Tab Monitor Activity */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <ShieldAlert size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-950 dark:text-slate-100">Audit Integritas Ujian (Anti-Cheat)</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">Deteksi perpindahan tab &amp; jendela saat ujian</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-950 font-mono text-xs font-black border border-slate-950">
              {allIncidents.length} Catatan
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {allIncidents.map((inc, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-slate-950 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-950 dark:text-slate-100">{inc.studentName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-950 font-mono text-[10px] font-black border border-slate-950">
                    {inc.count}x Keluar Tab ({inc.seconds}d)
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Modul: {inc.taskType}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{inc.date}</span>
                </div>
              </div>
            ))}

            {allIncidents.length === 0 && (
              <div className="p-6 text-center text-emerald-700 dark:text-emerald-300 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-slate-950 dark:border-emerald-800">
                <ShieldCheck size={28} className="mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                Semua siswa tertib selama pengerjaan LKPD, Kuis, dan Evaluasi.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Rekap Nilai Card */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#ffe600] border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-black text-base text-slate-950 dark:text-slate-100">Rekap Nilai Excel (.xlsx)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
              Ekspor rekapitulasi nilai per LKPD 1, LKPD 2, Latsol 1, Latsol 2, dan Evaluasi Sumatif.
            </p>
          </div>
          <Button
            variant="cyan"
            size="sm"
            className="w-full font-black text-xs"
            onClick={() => onNavigate('guru/rekap')}
          >
            Buka Rekap Excel
          </Button>
        </div>

        {/* Ruang Latsol Card */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff94e8] border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
              <HelpCircle size={20} />
            </div>
            <h3 className="font-black text-base text-slate-950 dark:text-slate-100">Ruang Latihan Soal</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
              Buka / kunci akses ruang kuis interaktif Quizizz dan atur batas waktu timer pengerjaan.
            </p>
          </div>
          <Button
            variant="purple"
            size="sm"
            className="w-full font-black text-xs"
            onClick={() => onNavigate('guru/latsol')}
          >
            Atur Ruang Kuis
          </Button>
        </div>

        {/* Daftar Siswa Card */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-5 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000] space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#a3e635] border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
              <Users size={20} />
            </div>
            <h3 className="font-black text-base text-slate-950 dark:text-slate-100">Direktori Daftar Siswa</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
              Daftar seluruh siswa terdaftar kelas 7 dengan status ketuntasan LKPD, Kuis, &amp; Evaluasi (Read-Only).
            </p>
          </div>
          <Button
            variant="lime"
            size="sm"
            className="w-full font-black text-xs"
            onClick={() => onNavigate('guru/siswa')}
          >
            Lihat Daftar Siswa
          </Button>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { storageService } from '@/services/storageService';
import { User } from '@/types';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  PenTool,
  ShieldCheck,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const GuruDaftarSiswa: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = () => {
  const db = storageService.getState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const students = db.users.filter(u => u.role === 'siswa');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || (s.class || 'Kelas 7-A') === filterClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(students.map(s => s.class || 'Kelas 7-A')));

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#a3e635] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          SISWA
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                DIREKTORI SISWA KELAS 7
              </span>
              <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                {students.length} Siswa Terdaftar (Read-Only)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Daftar Peserta Didik &amp; Status Belajar
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Pantau status pengerjaan LKPD digital, kuis latihan soal, evaluasi sumatif, dan progres ketuntasan kurikulum seluruh siswa secara real-time.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Users size={36} />
          </div>
        </div>
      </div>

      {/* Roster Controls & Metrics */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[7px_7px_0px_0px_#0f172a] space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa atau NIS/Username..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-950 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 shadow-[2px_2px_0px_0px_#0f172a] outline-none focus:bg-white"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 font-mono">Filter Kelas:</span>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="p-2.5 bg-white text-slate-950 text-xs font-black rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] outline-none"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Read-Only Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#ffe600] border-3 border-slate-950 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">No</th>
                <th className="p-4">Profil Siswa</th>
                <th className="p-4">Kelas</th>
                <th className="p-4 text-center">Status LKPD</th>
                <th className="p-4 text-center">Status Latihan Soal</th>
                <th className="p-4 text-center">Status Evaluasi</th>
                <th className="p-4 text-center">Total Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 bg-white">
              {filteredStudents.map((s, idx) => {
                const lkpdSub = db.lkpdSubmissions.find(sub => sub.studentId === s.id);
                const latsolSub = db.latsolSubmissions?.find(sub => sub.studentId === s.id);
                const evalSub = db.evaluationSubmissions?.find(sub => sub.studentId === s.id);

                const hasLKPD = !!lkpdSub;
                const hasLatsol = !!latsolSub;
                const hasEval = !!evalSub;

                // Overall progress percentage based on 5 components
                const prog = s.progress || { materi: 100, video: 50, lkpd: hasLKPD ? 100 : 0, latsol: hasLatsol ? 100 : 0, evaluasi: hasEval ? 100 : 0 };
                const avgProgress = Math.round((prog.materi + prog.video + (hasLKPD ? 100 : 0) + (hasLatsol ? 100 : 0) + (hasEval ? 100 : 0)) / 5);

                return (
                  <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-4 font-mono font-black text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-10 h-10 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] object-cover bg-amber-100 shrink-0"
                        />
                        <div>
                          <div className="font-black text-slate-950 text-sm">{s.name}</div>
                          <div className="text-[11px] font-mono font-bold text-slate-500">
                            NIS: {s.username} • ID: {s.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-block whitespace-nowrap px-3 py-1 rounded-xl bg-sky-100 text-slate-950 border-2 border-slate-950 text-xs font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        {s.class || 'Kelas 7-A'}
                      </span>
                    </td>

                    {/* Status LKPD */}
                    <td className="p-4 text-center">
                      {hasLKPD ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-lime-100 text-emerald-950 border border-slate-950 text-xs font-black">
                          <CheckCircle2 size={13} className="text-emerald-700" />
                          <span>Selesai ({lkpdSub.teacherScore || lkpdSub.aiScore || 90})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-300 text-xs font-bold">
                          <Clock size={13} />
                          <span>Belum</span>
                        </div>
                      )}
                    </td>

                    {/* Status Latsol */}
                    <td className="p-4 text-center">
                      {hasLatsol ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 text-purple-950 border border-slate-950 text-xs font-black">
                          <CheckCircle2 size={13} className="text-purple-700" />
                          <span>Selesai ({latsolSub.score})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-300 text-xs font-bold">
                          <Clock size={13} />
                          <span>Belum</span>
                        </div>
                      )}
                    </td>

                    {/* Status Evaluasi */}
                    <td className="p-4 text-center">
                      {hasEval ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 border border-slate-950 text-xs font-black">
                          <CheckCircle2 size={13} className="text-amber-700" />
                          <span>Selesai ({evalSub.score})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-300 text-xs font-bold">
                          <Clock size={13} />
                          <span>Belum</span>
                        </div>
                      )}
                    </td>

                    {/* Overall Progress */}
                    <td className="p-4 text-center">
                      <div className="space-y-1 inline-block text-left w-24">
                        <div className="flex justify-between text-[10px] font-mono font-black text-slate-700">
                          <span>Progress</span>
                          <span>{avgProgress}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full border border-slate-950 overflow-hidden">
                          <div
                            className="h-full bg-[#ffe600] border-r border-slate-950"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                    Tidak ditemukan data siswa sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

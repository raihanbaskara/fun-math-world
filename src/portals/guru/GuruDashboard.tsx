import React from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { User } from '@/types';
import {
  Users,
  FileText,
  PenTool,
  BarChart3,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const GuruDashboard: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
}> = ({ currentUser, onNavigate }) => {
  const db = storageService.getState();
  const studentCount = db.users.filter(u => u.role === 'siswa').length;
  const lkpdSubCount = db.lkpdSubmissions.length;
  const examSubCount = db.evaluationSubmissions.length;
  const questionCount = db.evaluationQuestions.length;

  const stats = [
    {
      label: 'Siswa Terdaftar',
      value: studentCount,
      icon: Users,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-200/60'
    },
    {
      label: 'LKPD Masuk',
      value: lkpdSubCount,
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/60'
    },
    {
      label: 'Ujian Essai Masuk',
      value: examSubCount,
      icon: PenTool,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200/60'
    },
    {
      label: 'Bank Soal HOTS',
      value: questionCount,
      icon: BookOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200/60'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Editorial Luxury Header Banner */}
      <DoubleBezelCard
        className="bg-slate-950 border-slate-800 shadow-xl"
        innerClassName="bg-slate-900 border-slate-800/80 text-white p-6 sm:p-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-black uppercase tracking-wider font-mono">
                Portal Pengajar Matematika
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Kurikulum Merdeka Kelas 7 SMP
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Dasbor Manajemen & Penilaian Guru
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Kelola kurikulum materi pecahan, verifikasi pengerjaan LKPD digital siswa dengan validasi Asisten AI, susun bank soal uraian, dan ekspor rekapitulasi nilai format spreadsheet (.xlsx).
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <GraduationCap size={32} />
          </div>
        </div>
      </DoubleBezelCard>

      {/* 4-Column Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${item.bg} border ${item.border}`}>
                  <Icon size={18} className={item.color} />
                </div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                  {item.value}
                </span>
              </div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rekap Nilai Card */}
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-700 flex items-center justify-center shadow-xs">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Rekapitulasi Nilai & Ekspor Excel
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Unduh lembar nilai LKPD, skor essai, dan catatan pelanggaran tab
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem penilaian terintegrasi dengan audit ketuntasan KKM (75) dan log perpindahan jendela ujian untuk menjamin objektivitas evaluasi akademik.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Format Microsoft Excel (.xlsx)</span>
              <ArrowFillButton
                variant="primary"
                size="sm"
                className="h-9 font-bold text-xs"
                onClick={() => onNavigate('guru/rekap')}
              >
                <span>Buka Rekap Nilai</span>
              </ArrowFillButton>
            </div>
          </div>
        </DoubleBezelCard>

        {/* Verifikasi LKPD Card */}
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-xs">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Verifikasi & Penilaian LKPD Digital
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Validasi foto lembar kerja fisik siswa & rekomendasi Asisten AI
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Periksa lampiran foto tugas siswa secara transparan, lakukan penyesuaian skor, dan berikan catatan bimbingan guru secara langsung ke dashboard siswa.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Status Penugasan Terkini</span>
              <ArrowFillButton
                variant="secondary"
                size="sm"
                className="h-9 font-bold text-xs"
                onClick={() => onNavigate('guru/lkpd')}
              >
                <span>Periksa Tugas LKPD</span>
              </ArrowFillButton>
            </div>
          </div>
        </DoubleBezelCard>

      </div>

    </div>
  );
};

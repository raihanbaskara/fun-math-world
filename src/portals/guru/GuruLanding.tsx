import React, { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { soundService } from '@/services/soundService';
import {
  BookOpen,
  FileText,
  BarChart3,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Download,
  Users,
  CheckCircle2,
  PieChart,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Fraction } from '@/components/ui/fraction';

export interface GuruLandingProps {
  onNavigate: (route: string) => void;
}

export const GuruLanding: React.FC<GuruLandingProps> = ({ onNavigate }) => {
  const [modalType, setModalType] = useState<'materi' | 'lkpd' | 'latsol' | 'rekap' | null>(null);

  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#ffe600] selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP FLOATING NEOBRUTAL HEADER */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4 bg-[#fffdf5]/90 backdrop-blur-md border-b-3 border-slate-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" onClick={() => handlePortalNavigate('landing')} />

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePortalNavigate('landing')}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Beranda Utama
            </button>
            <button
              onClick={() => handlePortalNavigate('guru/login')}
              className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Masuk Guru</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16 flex-1 w-full">
        
        {/* Hero Title & Actions */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Dual Neobrutal Eyebrow Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform -rotate-1">
              <GraduationCap size={14} className="text-slate-950" />
              <span>PORTAL GURU MATEMATIKA</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#38bdf8] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform rotate-1">
              <Sparkles size={14} className="text-slate-950" />
              <span>KURIKULUM MERDEKA • FASE D</span>
            </div>
          </div>

          {/* Bold Fluid Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-slate-950 tracking-tight leading-[1.15]">
            Pusat Kendali Pengajaran &amp; <br />
            <span className="bg-[#ffe600] px-3 py-0.5 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] inline-block mt-2">
              Penilaian Pecahan SMP
            </span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Platform komprehensif untuk guru matematika kelas 7 SMP: pantau kemajuan modul siswa, verifikasi tugas LKPD dengan asisten AI, kelola ruang kuis, dan unduh rekap nilai Excel secara instan.
          </p>

          {/* Hero Action CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => handlePortalNavigate('guru/login')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#ffe600] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#ffe600] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-3"
            >
              <span>Buka Dasbor Guru</span>
              <ArrowRight size={16} className="text-[#ffe600]" />
            </button>
            
            <button
              onClick={() => handlePortalNavigate('siswa')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Portal Siswa</span>
            </button>
          </div>
        </div>

        {/* 3. BENTO GRID FITUR GURU (4 PILAR PENDIDIK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Verifikasi LKPD AI */}
          <div
            onClick={() => setModalType('lkpd')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#38bdf8] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#38bdf8] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <FileText size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Validasi LKPD AI</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Periksa lembar kerja tulisan tangan siswa dengan bantuan analisis AI dan berikan umpan balik instan.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-sky-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Ruang Kuis & Anti-Joki */}
          <div
            onClick={() => setModalType('latsol')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#ffe600] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <Clock size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Kuis &amp; Anti-Joki</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Atur durasi pengerjaan, kunci ruangan kuis, dan deteksi kecurangan ganti tab/layar secara otomatis.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-amber-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Modul Teori & Studio Visual */}
          <div
            onClick={() => setModalType('materi')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#a3e635] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#a3e635] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <BookOpen size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Modul &amp; Studio Visual</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                4 bab pecahan Fase D terstruktur lengkap dengan simulasi interaktif pizza fraction dan visual batang.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-lime-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Rekap Nilai Excel */}
          <div
            onClick={() => setModalType('rekap')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#c084fc] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#c084fc] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <BarChart3 size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Rekapitulasi Excel</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Unduh rekap nilai LKPD, Latsol, Evaluasi, dan log kepatuhan siswa dalam format file spreadsheet (.xlsx).
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-purple-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </main>

      {/* 4. MODALS PREVIEW FITUR GURU */}
      <Modal
        isOpen={modalType === 'lkpd'}
        onClose={() => setModalType(null)}
        title="Validasi & Penilaian LKPD AI"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Guru dapat meninjau lampiran foto pengerjaan siswa, melihat analisis koreksi AI, dan memberikan nilai akhir:
          </p>
          <ul className="space-y-2 p-3 bg-sky-100 rounded-xl border-2 border-slate-900">
            <li>[1] Validasi visual foto lembar kerja tulisan tangan</li>
            <li>[2] Rekomendasi skor AI dan catatan koreksi instan</li>
            <li>[3] Nilai otomatis masuk ke rekapitulasi kelas</li>
          </ul>
          <Button
            variant="cyan"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('guru/login'); }}
          >
            Masuk untuk Memeriksa LKPD
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'latsol'}
        onClose={() => setModalType(null)}
        title="Manajemen Kuis & Anti-Cheat Monitor"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Fitur pengawasan ujian real-time untuk menjamin integritas akademik:
          </p>
          <ul className="space-y-2 p-3 bg-amber-100 rounded-xl border-2 border-slate-900">
            <li>[1] Kunci dan buka ruangan kuis sesuai jadwal kelas</li>
            <li>[2] Rekam deteksi ganti tab &amp; durasi keluar layar siswa</li>
            <li>[3] Analisis butir soal HOTS otomatis</li>
          </ul>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('guru/login'); }}
          >
            Masuk Ruang Kuis Guru
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'materi'}
        onClose={() => setModalType(null)}
        title="Modul Teori Pecahan & Studio Visual"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Materi kurikulum merdeka Fase D dengan interaktivitas visual tingkat tinggi:
          </p>
          <ul className="space-y-2 p-3 bg-lime-100 rounded-xl border-2 border-slate-900">
            <li>[1] Konsep dasar pecahan, senilai, dan penyederhanaan FPB</li>
            <li>[2] Operasi hitung penjumlahan, pengurangan, perkalian, pembagian</li>
            <li>[3] Alat simulasi pecahan visual berbasis representasi geometri</li>
          </ul>
          <Button
            variant="lime"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('guru/login'); }}
          >
            Buka Modul Guru
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'rekap'}
        onClose={() => setModalType(null)}
        title="Rekapitulasi Nilai & Ekspor Excel"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Pengelolaan buku nilai siswa lengkap dan terstruktur:
          </p>
          <ul className="space-y-2 p-3 bg-purple-100 rounded-xl border-2 border-slate-900">
            <li>[1] Rangkuman nilai tugas LKPD, Latsol, dan Evaluasi Sumatif</li>
            <li>[2] Ekspor file format .xlsx siap pakai untuk rapor</li>
            <li>[3] Statistik ketuntasan belajar per siswa</li>
          </ul>
          <Button
            variant="purple"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('guru/login'); }}
          >
            Masuk ke Rekapitulasi
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default GuruLanding;

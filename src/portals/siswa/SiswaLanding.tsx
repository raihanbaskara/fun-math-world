import React, { useState } from 'react';
import { NeobrutalMathHero } from '@/components/ui/neobrutal-math-hero';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { soundService } from '@/services/soundService';
import { BookOpen, FileText, PenTool, Sparkles, GraduationCap, ArrowRight, ShieldCheck, Calculator, PieChart, Layers } from 'lucide-react';
import { User } from '@/types';

export interface SiswaLandingProps {
  onNavigate: (route: string) => void;
  currentUser?: User | null;
}

export const SiswaLanding: React.FC<SiswaLandingProps> = ({ onNavigate, currentUser }) => {
  const [modalType, setModalType] = useState<'materi' | 'lkpd' | 'evaluasi' | null>(null);
  const isStudentLoggedIn = currentUser && currentUser.role === 'siswa';

  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#ffe600] selection:text-slate-950">
      
      {/* 1. HERO SECTION: NEOBRUTALISM.DEV MATH HERO */}
      <NeobrutalMathHero
        onNavigate={(target) => {
          if (isStudentLoggedIn && (target === 'siswa/login' || target === 'siswa')) {
            handlePortalNavigate('siswa/home');
          } else {
            handlePortalNavigate(target);
          }
        }}
        onOpenModal={(type) => setModalType(type)}
      />

      {/* Preview Modals */}
      <Modal
        isOpen={modalType === 'materi'}
        onClose={() => setModalType(null)}
        title="Materi Pecahan Kelas 7 SMP"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Modul disusun sesuai Capaian Pembelajaran Kurikulum Merdeka Fase D:
          </p>
          <ul className="space-y-2 p-3 bg-amber-100 rounded-xl border-2 border-slate-900">
            <li>[1] Konsep Notasi Pembilang &amp; Penyebut</li>
            <li>[2] Pecahan Senilai &amp; FPB</li>
            <li>[3] Operasi Hitung Penjumlahan KPK &amp; Perkalian</li>
          </ul>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Masuk untuk Belajar Materi
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'lkpd'}
        onClose={() => setModalType(null)}
        title="LKPD Digital Asisten AI"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Fitur unggah lembar kerja tulisan tangan dengan analisis koreksi otomatis:
          </p>
          <ul className="space-y-2 p-3 bg-sky-100 rounded-xl border-2 border-slate-900">
            <li>[1] Preview PDF LKPD High-Resolution</li>
            <li>[2] Koreksi Otomatis Foto &amp; Penilaian Instan</li>
          </ul>
          <Button
            variant="cyan"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Buka Lembar Kerja Siswa
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'evaluasi'}
        onClose={() => setModalType(null)}
        title="Evaluasi HOTS &amp; Anti-Joki"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Ujian essai terstruktur dengan sistem perlindungan integritas:
          </p>
          <ul className="space-y-2 p-3 bg-purple-100 rounded-xl border-2 border-slate-900">
            <li>[1] Kolom Uraian &amp; Lampiran Foto Langkah</li>
            <li>[2] Deteksi Tab Integrity &amp; Kunci Pembahasan</li>
          </ul>
          <Button
            variant="purple"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Mulai Evaluasi Siswa
          </Button>
        </div>
      </Modal>

    </div>
  );
};

import React, { useState } from 'react';
import { NeobrutalMathHero } from '@/components/ui/neobrutal-math-hero';
import { DoubleBezelCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ArrowUpRight, GraduationCap, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { soundService } from '@/services/soundService';

export interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [modalType, setModalType] = useState<'materi' | 'lkpd' | 'evaluasi' | null>(null);

  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#fffdf5] text-slate-900 selection:bg-[#ffe600] selection:text-slate-950 font-sans">
      
      {/* 1. HERO SECTION: NEOBRUTALISM.DEV MATH HERO */}
      <NeobrutalMathHero
        onNavigate={handlePortalNavigate}
        onOpenModal={(type) => setModalType(type)}
      />

      {/* 3. MODALS FOR HIGHLIGHTS */}
      <Modal
        isOpen={modalType === 'materi'}
        onClose={() => setModalType(null)}
        title="Materi Pembelajaran Pecahan Kelas 7"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-medium leading-relaxed">
            Modul disusun berdasarkan capaian pembelajaran <b>Kurikulum Merdeka Fase D</b> Matematika SMP:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 font-medium">
            <li>Konsep dasar arti pembilang dan penyebut</li>
            <li>Pecahan senilai dan menyederhanakan menggunakan FPB</li>
            <li>Pecahan biasa, campuran, desimal, dan persen</li>
            <li>Operasi penjumlahan, pengurangan, perkalian, dan pembagian</li>
          </ul>
          <Button
            variant="accent"
            className="w-full mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa'); }}
          >
            Masuk Portal Siswa →
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'lkpd'}
        onClose={() => setModalType(null)}
        title="LKPD Digital Berbantuan Asisten AI"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-medium leading-relaxed">
            Inovasi lembar kerja digital yang mendukung penyelidikan mandiri:
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-medium">
            <div>✓ <b>Preview Lembar Kerja:</b> Tampilan visual resolusi tinggi dan unduhan file PDF.</div>
            <div>✓ <b>Koreksi Otomatis AI:</b> Analisis foto tulisan tangan dengan draft skor dan feedback diagnostik instan.</div>
          </div>
          <Button
            variant="primary"
            className="w-full mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa'); }}
          >
            Buka Lembar Kerja Siswa →
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'evaluasi'}
        onClose={() => setModalType(null)}
        title="Evaluasi Soal Essai HOTS & Tab Integrity Monitor"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-medium leading-relaxed">
            Evaluasi soal cerita terstruktur dengan perlindungan integritas ujian:
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-medium">
            <div>✓ Kolom jawaban uraian dan lampiran foto pengerjaan bersusun.</div>
            <div>✓ Sistem pengawas tab ujian otomatis untuk mendeteksi perpindahan jendela.</div>
            <div>✓ Kunci dan langkah pembahasan lengkap setelah ujian selesai.</div>
          </div>
          <Button
            variant="accent"
            className="w-full mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa'); }}
          >
            Mulai Evaluasi Siswa →
          </Button>
        </div>
      </Modal>

      {/* FOOTER */}
      <footer className="border-t border-black/10 py-8 text-center text-xs text-slate-700 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-slate-900">© 2026 Fun Math World</span> — Kelas 7 SMP Kurikulum Merdeka
          </div>
          <div className="flex gap-6 font-bold">
            <button onClick={() => handlePortalNavigate('siswa')} className="hover:text-brand-600 transition cursor-pointer">/siswa</button>
            <button onClick={() => handlePortalNavigate('guru')} className="hover:text-sky-700 transition cursor-pointer">/guru</button>
            <button onClick={() => handlePortalNavigate('admin')} className="hover:text-purple-700 transition cursor-pointer">/admin</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

import React, { useState } from 'react';
import { RobotHero } from '@/components/ui/robot-hero';
import { Modal } from '@/components/ui/modal';
import { GlassmorphismCTA } from '@/components/ui/glass-cta';
import { TubelightNavbar } from '@/components/ui/tubelight-navbar';
import { soundService } from '@/services/soundService';
import { BookOpen, FileText, PenTool, Sparkles, GraduationCap, Settings } from 'lucide-react';

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
    <div className="relative w-full h-screen overflow-hidden bg-[#bebebe] text-slate-900 selection:bg-[#00ffc6] selection:text-slate-950 font-sans">
      
      {/* Top Floating 1-Row Navigation Header (TubelightNavbar on Left + Masuk Belajar on Right) */}
      <header className="fixed top-5 inset-x-0 z-50 pointer-events-none px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Left: 3-Item Tubelight Navbar (Materi Teori, LKPD Digital, Evaluasi Essai) */}
          <TubelightNavbar
            items={[
              { name: "Materi Teori", icon: BookOpen },
              { name: "LKPD Digital", icon: FileText },
              { name: "Evaluasi Essai", icon: PenTool },
            ]}
            onTabChange={(name) => {
              if (name === "Materi Teori") {
                if (isStudentLoggedIn) handlePortalNavigate('siswa/materi');
                else setModalType('materi');
              } else if (name === "LKPD Digital") {
                if (isStudentLoggedIn) handlePortalNavigate('siswa/lkpd');
                else setModalType('lkpd');
              } else if (name === "Evaluasi Essai") {
                if (isStudentLoggedIn) handlePortalNavigate('siswa/evaluasi');
                else setModalType('evaluasi');
              }
            }}
          />

          {/* Right Corner: Masuk Belajar CTA Button */}
          <div className="flex items-center gap-3">
            <GlassmorphismCTA
              onClick={() => handlePortalNavigate(isStudentLoggedIn ? 'siswa/home' : 'siswa/login')}
              variant="mint"
              size="md"
              className="shadow-xl"
            >
              {isStudentLoggedIn ? "Dashboard Siswa" : "Masuk Belajar"}
            </GlassmorphismCTA>
          </div>
        </div>
      </header>

      {/* 1. FULLSCREEN HERO SECTION: 3D ROBOT MASCOT FOR SISWA */}
      <RobotHero
        backgroundText="FUN MATH"
        showNavbar={false}
        ctaText={isStudentLoggedIn ? "Ke Dashboard Siswa" : "Masuk Belajar"}
        onCtaClick={() => handlePortalNavigate(isStudentLoggedIn ? 'siswa/home' : 'siswa/login')}
        pantallaColor="#00ffc6"
        pantallaBrillo={1.4}
        color="#c4c4c4"
      />

      {/* 2. MODALS FOR PREVIEWS (HARMONIZED CARDS + 21ST GLASSMORPHISM CTA) */}
      <Modal
        isOpen={modalType === 'materi'}
        onClose={() => setModalType(null)}
        title="Materi Pembelajaran Pecahan Kelas 7"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-semibold text-slate-600 leading-relaxed">
            Modul disusun berdasarkan capaian pembelajaran <b>Kurikulum Merdeka Fase D</b> Matematika SMP:
          </p>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-medium">
            <div className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span><b>Konsep Dasar Pecahan:</b> Representasi bagian pembilang dan penyebut dengan visual pizza & cokelat.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span><b>Pecahan Senilai:</b> Penyederhanaan dan perbandingan kesetaraan nilai menggunakan FPB.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span><b>Bentuk Pecahan:</b> Pecahan biasa, campuran, representasi desimal, dan persentase.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span><b>Operasi Hitung:</b> Penjumlahan, pengurangan KPK, perkalian, dan pembagian pecahan.</span>
            </div>
          </div>
          <GlassmorphismCTA
            fullWidth
            variant="mint"
            size="md"
            className="mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Masuk untuk Belajar Materi
          </GlassmorphismCTA>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'lkpd'}
        onClose={() => setModalType(null)}
        title="LKPD Digital Berbantuan Asisten AI"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-semibold text-slate-600 leading-relaxed">
            Inovasi lembar kerja digital yang mendukung penyelidikan mandiri siswa:
          </p>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-medium">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><b>Preview Lembar Kerja:</b> Tampilan visual resolusi tinggi dan unduhan file LKPD PDF.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><b>Koreksi Otomatis AI:</b> Analisis foto pengerjaan tulisan tangan dengan draft skor dan diagnostik instan.</span>
            </div>
          </div>
          <GlassmorphismCTA
            fullWidth
            variant="mint"
            size="md"
            className="mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Buka Lembar Kerja Siswa
          </GlassmorphismCTA>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'evaluasi'}
        onClose={() => setModalType(null)}
        title="Evaluasi Soal Essai HOTS & Tab Integrity Monitor"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <p className="font-semibold text-slate-600 leading-relaxed">
            Evaluasi soal cerita terstruktur dengan perlindungan integritas ujian:
          </p>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-medium">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><b>Jawaban Uraian & Lampiran Foto:</b> Kolom jawaban essai dan unggah bukti langkah bersusun.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><b>Pengawas Tab Ujian Otomatis:</b> Deteksi perpindahan jendela peramban untuk kejujuran belajar.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><b>Kunci & Pembahasan Mendalam:</b> Umpan balik diagnostik dan langkah penyelesaian pasca evaluasi.</span>
            </div>
          </div>
          <GlassmorphismCTA
            fullWidth
            variant="mint"
            size="md"
            className="mt-2"
            onClick={() => { setModalType(null); handlePortalNavigate('siswa/login'); }}
          >
            Mulai Evaluasi Siswa
          </GlassmorphismCTA>
        </div>
      </Modal>

    </div>
  );
};

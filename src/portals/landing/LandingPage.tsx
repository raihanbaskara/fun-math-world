import React, { useState } from 'react';
import { RobotHero } from '@/components/ui/robot-hero';
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
    <div className="relative w-full min-h-[100dvh] bg-[#bebebe] text-slate-900 selection:bg-[#00ffc6] selection:text-slate-950 font-sans">
      
      {/* 1. HERO SECTION: 3D ROBOT MASCOT */}
      <RobotHero
        backgroundText="FUN MATH 7"
        navItemsLeft={[
          {
            label: "Materi Teori",
            onClick: () => setModalType('materi'),
          },
          {
            label: "LKPD Digital",
            onClick: () => setModalType('lkpd'),
          },
          {
            label: "Evaluasi Essai",
            onClick: () => setModalType('evaluasi'),
          },
        ]}
        guruText="Portal Guru"
        onGuruClick={() => handlePortalNavigate('guru')}
        adminText="Portal Admin"
        onAdminClick={() => handlePortalNavigate('admin')}
        ctaText="Mulai Belajar (Siswa)"
        onCtaClick={() => handlePortalNavigate('siswa')}
        pantallaColor="#00ffc6"
        pantallaBrillo={1.4}
        color="#c4c4c4"
      />

      {/* 2. THREE DISTINCT PORTALS GRID (GAPLESS BENTO - BRIGHT & CLEAN STUDIO THEME) */}
      <section className="relative z-20 py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-slate-800 text-xs font-mono tracking-widest uppercase shadow-sm">
            <Sparkles size={14} className="text-brand-600" />
            <span>Tiga Portal Akses Terpadu</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Lingkungan Belajar Khusus untuk Setiap Peran.
          </h2>

          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
            Pilih portal sesuai peran Anda untuk mengakses antarmuka mandiri dengan fitur dan hak akses terisolasi.
          </p>
        </div>

        {/* Gapless Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grid-flow-dense">
          
          {/* Siswa Gateway Card */}
          <DoubleBezelCard
            onClick={() => handlePortalNavigate('siswa')}
            className="md:col-span-1"
          >
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00ffc6]/20 border border-[#00ffc6]/50 text-slate-950 flex items-center justify-center text-3xl font-black shadow-sm">
                  <GraduationCap size={28} className="text-brand-600" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-600 font-black">
                    Tautan: /siswa
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Portal Siswa
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Belajar pecahan mandiri dengan 10 modul lengkap, studio eksperimen visual, LKPD digital dengan koreksi Asisten AI, dan evaluasi soal uraian.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">Masuk Portal Siswa</span>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </DoubleBezelCard>

          {/* Guru Gateway Card */}
          <DoubleBezelCard
            onClick={() => handlePortalNavigate('guru')}
            className="md:col-span-1"
          >
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center text-3xl font-black shadow-sm">
                  <UserCheck size={28} className="text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-black">
                    Tautan: /guru
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Portal Guru
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Dashboard pengajar untuk mengelola materi, memvalidasi hasil koreksi AI tugas LKPD, bank soal cerita HOTS, dan mengunduh rekap nilai Excel (.xlsx).
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">Dashboard Pengajar</span>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </DoubleBezelCard>

          {/* Admin Gateway Card */}
          <DoubleBezelCard
            onClick={() => handlePortalNavigate('admin')}
            className="md:col-span-1"
          >
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center text-3xl font-black shadow-sm">
                  <ShieldAlert size={28} className="text-purple-700" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-purple-700 font-black">
                    Tautan: /admin
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Portal Admin
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Panel kontrol sistem untuk manajemen akun pengguna, pengaturan kelas, kontrol keamanan 1 Akun 1 Device, serta ekspor cadangan database JSON.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">Panel Administrator</span>
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 shadow-sm">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </DoubleBezelCard>

        </div>
      </section>

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
            <button onClick={() => handlePortalNavigate('guru')} className="hover:text-emerald-700 transition cursor-pointer">/guru</button>
            <button onClick={() => handlePortalNavigate('admin')} className="hover:text-purple-700 transition cursor-pointer">/admin</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

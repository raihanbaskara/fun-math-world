import React, { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { soundService } from '@/services/soundService';
import {
  Users,
  ShieldCheck,
  Database,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Server,
  Activity,
  HardDrive
} from 'lucide-react';

export interface AdminLandingProps {
  onNavigate: (route: string) => void;
}

export const AdminLanding: React.FC<AdminLandingProps> = ({ onNavigate }) => {
  const [modalType, setModalType] = useState<'users' | 'security' | 'backup' | 'audit' | null>(null);

  const handlePortalNavigate = (route: string) => {
    soundService.click();
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#c084fc] selection:text-slate-950 flex flex-col justify-between">
      
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
              onClick={() => handlePortalNavigate('admin/login')}
              className="px-5 py-2 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Masuk Admin</span>
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
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c084fc] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform -rotate-1">
              <Cpu size={14} className="text-slate-950" />
              <span>PORTAL ADMINISTRATOR SISTEM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#a3e635] text-slate-950 border-2 border-slate-950 shadow-[2.5px_2.5px_0px_0px_#0f172a] font-mono font-black text-xs uppercase tracking-wider transform rotate-1">
              <ShieldCheck size={14} className="text-slate-950" />
              <span>KEAMANAN &amp; TATA KELOLA DATA</span>
            </div>
          </div>

          {/* Bold Fluid Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-slate-950 tracking-tight leading-[1.15]">
            Infrastruktur &amp; Tata Kelola <br />
            <span className="bg-[#c084fc] px-3 py-0.5 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] inline-block mt-2">
              Pembelajaran Digital Terpadu
            </span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Kontrol terpusat untuk akun pengguna (Siswa, Guru, Admin), pengawasan integritas sesi 1-Device Lock, pemeliharaan storage database, dan pencadangan data instan.
          </p>

          {/* Hero Action CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => handlePortalNavigate('admin/login')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#c084fc] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#c084fc] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-3"
            >
              <span>Buka Dasbor Admin</span>
              <ArrowRight size={16} className="text-[#c084fc]" />
            </button>
            
            <button
              onClick={() => handlePortalNavigate('landing')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Halaman Utama</span>
            </button>
          </div>
        </div>

        {/* 3. BENTO GRID FITUR ADMIN (4 PILAR TATA KELOLA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Manajemen Akun Terpadu */}
          <div
            onClick={() => setModalType('users')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#c084fc] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#c084fc] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <Users size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Manajemen Akun</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Tambah, edit data profil, atur kelas siswa 7 SMP, dan reset kata sandi pengguna secara massal.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-purple-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 1-Device Lock & Anti-Cheat */}
          <div
            onClick={() => setModalType('security')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#a3e635] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#a3e635] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">1-Device Lock</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Kunci sesi login hanya untuk 1 gawai siswa saat evaluasi dan fasilitas reset token global satu klik.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-lime-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Database & Backup Storage */}
          <div
            onClick={() => setModalType('backup')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#38bdf8] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#38bdf8] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <Database size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Backup Database</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Unduh salinan cadangan berkas database JSON terenkripsi dan pulihkan konfigurasi data kapan saja.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-sky-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Audit & Status Server */}
          <div
            onClick={() => setModalType('audit')}
            className="group rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#ffe600] transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <Activity size={24} />
              </div>
              <h3 className="font-mono font-black text-lg text-slate-950">Audit &amp; Integritas</h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Pantau kestabilan browser engine, integritas local storage, dan log insiden kepatuhan ujian.
              </p>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-xs font-mono font-black text-slate-950 group-hover:text-amber-600">
              <span>Pelajari Fitur</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </main>

      {/* 4. MODALS PREVIEW FITUR ADMIN */}
      <Modal
        isOpen={modalType === 'users'}
        onClose={() => setModalType(null)}
        title="Manajemen Pengguna Terpadu"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Pengelolaan identitas akun multi-peran dengan kontrol hak akses penuh:
          </p>
          <ul className="space-y-2 p-3 bg-purple-100 rounded-xl border-2 border-slate-900">
            <li>[1] Buat akun siswa baru dengan atribut kelas &amp; NISN</li>
            <li>[2] Kelola hak akses guru mata pelajaran matematika</li>
            <li>[3] Fasilitas hapus dan perbarui sandi instan</li>
          </ul>
          <Button
            variant="purple"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            Masuk ke Manajemen Akun
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'security'}
        onClose={() => setModalType(null)}
        title="Kebijakan Keamanan 1-Device Lock"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Proteksi sistem untuk mencegah joki akun dan login ganda:
          </p>
          <ul className="space-y-2 p-3 bg-lime-100 rounded-xl border-2 border-slate-900">
            <li>[1] Setiap akun terkunci pada 1 token perangkat aktif</li>
            <li>[2] Deteksi pelanggaran otomatis jika login di peramban lain</li>
            <li>[3] Tombol pelepasan kunci sesi darurat oleh admin</li>
          </ul>
          <Button
            variant="lime"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            Buka Panel Keamanan
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'backup'}
        onClose={() => setModalType(null)}
        title="Pencadangan & Pemulihan Database"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Perlindungan integritas data pembelajaran dan riwayat pengerjaan:
          </p>
          <ul className="space-y-2 p-3 bg-sky-100 rounded-xl border-2 border-slate-900">
            <li>[1] Ekspor data JSON lengkap mencakup semua submisi LKPD &amp; nilai</li>
            <li>[2] Unggah berkas JSON untuk pemulihan instan</li>
            <li>[3] Reset factory database jika diperlukan</li>
          </ul>
          <Button
            variant="cyan"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            Buka Alat Cadangan Data
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'audit'}
        onClose={() => setModalType(null)}
        title="Audit Sistem & Pemantauan"
      >
        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="leading-relaxed">
            Metrik kesehatan aplikasi pembelajaran offline &amp; online:
          </p>
          <ul className="space-y-2 p-3 bg-amber-100 rounded-xl border-2 border-slate-900">
            <li>[1] Status engine storage dan kesiapan modul</li>
            <li>[2] Log pelaporan kecurangan evaluasi real-time</li>
            <li>[3] Kompatibilitas browser modern SMP</li>
          </ul>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            Masuk ke Panel Audit
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default AdminLanding;

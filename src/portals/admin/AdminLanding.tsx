import React, { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Modal } from '@/components/ui/modal';
import { soundService } from '@/services/soundService';
import { Cpu, ShieldCheck, ArrowRight, Menu, X, Users, KeyRound, Database } from 'lucide-react';

export interface AdminLandingProps {
  onNavigate: (route: string) => void;
}

export const AdminLanding: React.FC<AdminLandingProps> = ({ onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'users' | 'device' | 'backup' | 'audit' | null>(null);

  const handlePortalNavigate = (route: string) => {
    soundService.click();
    setMenuOpen(false);
    onNavigate(route);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#fffdf5] bg-graph-grid text-slate-950 font-sans selection:bg-[#c084fc] selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. TOP FLOATING NEOBRUTAL HEADER */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 sm:py-4 bg-[#fffdf5]/90 backdrop-blur-md border-b-3 border-slate-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" onClick={() => handlePortalNavigate('landing')} />

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handlePortalNavigate('landing')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
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

          {/* Mobile Hamburger Toggle (Neo-Brutalism Square Button as in Gambar 3) */}
          <button
            onClick={() => {
              soundService.click();
              setMenuOpen(!menuOpen);
            }}
            className="p-2.5 rounded-xl bg-[#c084fc] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] md:hidden cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Drawer (Gambar 3 Neobrutalism Standard - Fitur Admin) */}
        {menuOpen && (
          <div className="mt-3 relative z-50 md:hidden bg-[#fffdf5] border-3 border-slate-950 rounded-3xl p-5 shadow-[8px_8px_0px_0px_#0f172a] flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-950/15">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#c084fc] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-[11px] uppercase tracking-wider">
                <ShieldCheck size={13} className="text-slate-950" />
                <span>Fitur Administrator</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">Pilih Modul</span>
            </div>

            {/* Feature 1: Manajemen Akun Pengguna */}
            <button
              onClick={() => {
                soundService.click();
                setMenuOpen(false);
                setModalType('users');
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#c084fc] shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Manajemen Akun Pengguna</span>
              <Users size={16} />
            </button>

            {/* Feature 2: Keamanan 1-Device Lock */}
            <button
              onClick={() => {
                soundService.click();
                setMenuOpen(false);
                setModalType('device');
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#fbcfe8] shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Keamanan 1-Device Lock</span>
              <KeyRound size={16} />
            </button>

            {/* Feature 3: Pencadangan Database (JSON) */}
            <button
              onClick={() => {
                soundService.click();
                setMenuOpen(false);
                setModalType('backup');
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#a5f3fc] shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Pencadangan Data (JSON)</span>
              <Database size={16} />
            </button>

            {/* Feature 4: Tata Kelola Infrastruktur */}
            <button
              onClick={() => {
                soundService.click();
                setMenuOpen(false);
                setModalType('audit');
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-left border-2 border-slate-950 bg-[#fed7aa] shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Tata Kelola Infrastruktur</span>
              <Cpu size={16} />
            </button>

            <div className="mt-1 pt-3 border-t-2 border-slate-950 flex flex-col gap-2">
              <button
                onClick={() => handlePortalNavigate('admin/login')}
                className="w-full bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs py-3.5 rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-center uppercase tracking-wider flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Masuk Admin (Login)</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => handlePortalNavigate('landing')}
                className="text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 text-center py-1 underline underline-offset-2 cursor-pointer"
              >
                Kembali ke Beranda Utama
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. FLOATING NEOBRUTAL MATH OPERATORS & SYSTEM BADGES (In Wide Open Space Canvas) */}
      {/* Upper Left: MULTIPLY [X] 3D SVG & SIGMA BADGE */}
      <div 
        style={{ '--rot': '-10deg' } as React.CSSProperties}
        className="absolute top-28 sm:top-36 left-4 md:left-8 lg:left-14 xl:left-24 2xl:left-36 hidden md:flex flex-col items-start gap-2.5 z-20 animate-float-slow select-none pointer-events-none"
      >
        <svg width="56" height="56" viewBox="0 0 80 80" fill="none" className="drop-shadow-sm">
          <path d="M16 28L32 44L48 28L58 38L42 54L58 70L48 80L32 64L16 80L6 70L22 54L6 38L16 28Z" fill="#0f172a" />
          <path d="M12 24L28 40L44 24L54 34L38 50L54 66L44 76L28 60L12 76L2 66L18 50L2 34L12 24Z" fill="#c084fc" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
          <line x1="8" y1="66" x2="16" y2="74" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="22" y1="60" x2="30" y2="68" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c084fc] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-3">
          <span>∑ DATA</span>
        </div>
      </div>

      {/* Upper Right: DIVIDE [÷] 3D SVG & PI BADGE */}
      <div 
        style={{ '--rot': '12deg' } as React.CSSProperties}
        className="absolute top-28 sm:top-36 right-4 md:right-8 lg:right-14 xl:right-24 2xl:right-36 hidden md:flex flex-col items-end gap-2.5 z-20 animate-float-reverse select-none pointer-events-none"
      >
        <svg width="58" height="58" viewBox="0 0 90 90" fill="none" className="drop-shadow-sm">
          <circle cx="45" cy="14" r="10" fill="#0f172a" />
          <circle cx="42" cy="11" r="10" fill="#a3e635" stroke="#0f172a" strokeWidth="3.5" />
          <rect x="14" y="38" width="64" height="18" rx="6" fill="#0f172a" />
          <rect x="10" y="34" width="64" height="18" rx="6" fill="#a3e635" stroke="#0f172a" strokeWidth="4" />
          <line x1="16" y1="48" x2="24" y2="40" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="28" y1="48" x2="36" y2="40" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="45" cy="74" r="10" fill="#0f172a" />
          <circle cx="42" cy="71" r="10" fill="#a3e635" stroke="#0f172a" strokeWidth="3.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a3e635] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-3">
          <span>π RAD</span>
        </div>
      </div>

      {/* Lower Left: MINUS [-] 3D SVG & SQUARE ROOT */}
      <div 
        style={{ '--rot': '6deg' } as React.CSSProperties}
        className="absolute bottom-24 sm:bottom-32 left-4 md:left-8 lg:left-14 xl:left-24 2xl:left-36 hidden lg:flex flex-col items-start gap-2.5 z-20 animate-float-reverse select-none pointer-events-none"
      >
        <svg width="56" height="32" viewBox="0 0 84 48" fill="none" className="drop-shadow-sm">
          <rect x="10" y="16" width="66" height="22" rx="6" fill="#0f172a" />
          <rect x="6" y="11" width="66" height="22" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
          <line x1="14" y1="28" x2="22" y2="20" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="26" y1="28" x2="34" y2="20" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#38bdf8] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform -rotate-2">
          <span>√x &gt; 0</span>
        </div>
      </div>

      {/* Lower Right: PLUS [+] 3D SVG & SESSION LOCK BADGE */}
      <div 
        style={{ '--rot': '-7deg' } as React.CSSProperties}
        className="absolute bottom-24 sm:bottom-32 right-4 md:right-8 lg:right-14 xl:right-24 2xl:right-36 hidden lg:flex flex-col items-end gap-2.5 z-20 animate-float-slow select-none pointer-events-none"
      >
        <svg width="56" height="56" viewBox="0 0 80 80" fill="none" className="drop-shadow-sm">
          <path d="M32 10H48V32H70V48H48V70H32V48H10V32H32V10Z" fill="#0f172a" />
          <path d="M28 6H44V28H66V44H44V66H28V44H6V28H28V6Z" fill="#ffe600" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />
          <line x1="12" y1="44" x2="20" y2="52" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="32" y1="64" x2="40" y2="72" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffe600] text-slate-950 font-mono font-black text-xs rounded-xl border-2.5 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] transform rotate-2">
          <span>1/1 Sesi Lock</span>
        </div>
      </div>

      {/* 3. MAIN HERO SECTION (Centered with clean spacing) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex-1 flex flex-col items-center justify-center text-center space-y-7 w-full z-10">
        
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
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-slate-950 tracking-tight leading-[1.15] max-w-3xl">
          Infrastruktur &amp; Tata Kelola <br />
          <span className="bg-[#c084fc] px-3.5 py-1 rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] inline-block mt-2">
            Pembelajaran Digital Terpadu
          </span>
        </h1>

        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Kontrol terpusat untuk akun pengguna (Siswa, Guru, Admin), pengawasan integritas sesi 1-Device Lock, pemeliharaan storage database, dan pencadangan data instan.
        </p>

        {/* Hero Action CTA */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => handlePortalNavigate('admin/login')}
            className="px-8 py-4 rounded-2xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center gap-3"
          >
            <span>Masuk Admin</span>
            <ArrowRight size={16} className="text-slate-950" />
          </button>
        </div>

      </main>

      {/* 4. FOOTER (Gambar 3 Neobrutal Standard) */}
      <footer className="w-full bg-white border-t-2 border-slate-950 py-3.5 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono font-bold text-slate-600 z-10">
        <div>© 2026 Fun Math World — Kurikulum Merdeka Kelas 7 SMP</div>
        <div className="text-slate-500 font-medium">v2.0 Neobrutal Edition</div>
      </footer>

      {/* MODALS UNTUK FITUR ADMIN (Gambar 3 Standard) */}
      <Modal
        isOpen={modalType === 'users'}
        onClose={() => setModalType(null)}
        title="Manajemen Akun Pengguna"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 font-medium">
          <p className="leading-relaxed">
            Kendali terpusat hak akses dan otorisasi seluruh civitas sekolah:
          </p>
          <div className="p-3.5 bg-purple-50 rounded-2xl border-2 border-slate-900 space-y-2 text-xs">
            <div>✓ <b>Kelola Akun Siswa &amp; Guru:</b> Tambah, edit, dan hapus data kredensial login dengan mudah.</div>
            <div>✓ <b>Role-Based Access Control:</b> Pemisahan hak akses mutlak antara siswa, pendidik, dan admin.</div>
            <div>✓ <b>Status Aktivitas:</b> Pantau akun yang sedang aktif dan riwayat aktivitas pembelajaran.</div>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            <span>Masuk Kelola Akun</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'device'}
        onClose={() => setModalType(null)}
        title="Keamanan Sesi 1-Device Lock"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 font-medium">
          <p className="leading-relaxed">
            Perlindungan anti-joki dan pencegahan kebocoran akun saat asesmen:
          </p>
          <div className="p-3.5 bg-pink-50 rounded-2xl border-2 border-slate-900 space-y-2 text-xs">
            <div>✓ <b>Binding Identifier Perangkat:</b> Sesi akun dikunci pada hardware/browser pertama yang digunakan siswa.</div>
            <div>✓ <b>Pencegahan Login Ganda:</b> Upaya login di HP/komputer lain otomatis ditolak sistem.</div>
            <div>✓ <b>Otorisasi Reset Admin:</b> Administrator dapat mereset kunci perangkat siswa jika terjadi kendala teknis.</div>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            <span>Buka Manajemen Kunci Sesi</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'backup'}
        onClose={() => setModalType(null)}
        title="Pencadangan Database & Pemulihan (JSON)"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 font-medium">
          <p className="leading-relaxed">
            Jaminan keamanan data sekolah dengan pencadangan terenkripsi mandiri:
          </p>
          <div className="p-3.5 bg-sky-50 rounded-2xl border-2 border-slate-900 space-y-2 text-xs">
            <div>✓ <b>Backup 1 Klik:</b> Ekspor seluruh master data siswa, materi, soal, dan nilai ke format file JSON aman.</div>
            <div>✓ <b>Pemulihan Cepat (Restore):</b> Unggah file cadangan untuk mengembalikan seluruh kondisi sistem seketika.</div>
            <div>✓ <b>Reset Sanitasi:</b> Opsi pembersihan cache dan reset data uji coba untuk menyambut tahun ajaran baru.</div>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            <span>Buka Pemeliharaan Sistem</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'audit'}
        onClose={() => setModalType(null)}
        title="Tata Kelola Infrastruktur Sistem"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 font-medium">
          <p className="leading-relaxed">
            Arsitektur cloud modern dengan reliabilitas tinggi dan nol biaya server:
          </p>
          <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-slate-900 space-y-2 text-xs">
            <div>✓ <b>Jamstack Edge Deployment:</b> Didistribusikan melalui jaringan Vercel global untuk kecepatan muat sub-detik.</div>
            <div>✓ <b>Proteksi Memori iOS Safari:</b> Mesin penyimpanan V7 dengan auto-sanitasi mencegah QuotaExceededError.</div>
            <div>✓ <b>Zero Maintenance:</b> Sistem beroperasi stabil tanpa memerlukan konfigurasi database server yang rumit.</div>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-[#c084fc] hover:bg-purple-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={() => { setModalType(null); handlePortalNavigate('admin/login'); }}
          >
            <span>Masuk ke Dashboard Admin</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default AdminLanding;

import React from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { User } from '@/types';
import { LayoutDashboard, Users, ShieldCheck, Database, ArrowRight, Settings, ShieldAlert, Cpu } from 'lucide-react';

export const AdminDashboard: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const db = storageService.getState();

  const handleResetAllLocks = () => {
    if (confirm('Lepas seluruh kunci sesi perangkat (Single Device Lock) untuk semua akun?')) {
      storageService.update(draft => {
        draft.users.forEach(u => {
          u.sessionToken = null;
          u.deviceId = null;
        });
      });
      showToast('Seluruh kunci perangkat berhasil di-reset!', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      
      {/* 1. STREAMLINED ADMIN HEADER BANNER */}
      <div className="relative rounded-3xl bg-[#c084fc] text-slate-950 border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tight">
          ADMIN
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              KONTROL ADMINISTRATOR
            </span>
            <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
              System Status: ONLINE (v2.0)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
            Panel Kontrol Administrator Sistem
          </h1>

          <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
            Kelola akun pengguna terpadu (Siswa, Guru, Admin), kontrol kebijakan keamanan 1-Device Lock, cadangkan berkas database terenkripsi, serta pemeliharaan server lokal.
          </p>
        </div>
      </div>

      {/* Admin Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#c084fc] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2.5px_2.5px_0px_0px_#0f172a]">
                <Users size={20} />
              </div>
              <span className="text-3xl font-black font-mono text-slate-950 dark:text-slate-100">
                {db.users.length}
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-950 dark:text-slate-100">Total Akun Sistem</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Terdiri dari akun siswa kelas 7 SMP, guru pengajar matematika, dan administrator aktif.
            </p>
          </div>

          <div className="pt-3 border-t-3 border-slate-950 dark:border-slate-700">
            <Button
              variant="purple"
              size="sm"
              className="w-full font-black"
              onClick={() => onNavigate('admin/users')}
            >
              Kelola Akun Pengguna
            </Button>
          </div>
        </div>

        {/* 1-Device Lock Policy */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#a3e635] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2.5px_2.5px_0px_0px_#0f172a]">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-mono font-black px-2.5 py-1 bg-lime-100 text-slate-950 border-2 border-slate-950 rounded-lg shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                1 DEVICE AKTIF
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-950 dark:text-slate-100">Kebijakan 1 Akun 1 Device</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Mencegah kecurangan login ganda secara bersamaan di perangkat lain oleh siswa.
            </p>
          </div>

          <div className="pt-3 border-t-3 border-slate-950 dark:border-slate-700">
            <Button
              variant="danger"
              size="sm"
              className="w-full font-black"
              onClick={handleResetAllLocks}
            >
              <ShieldAlert size={16} />
              <span>Reset Kunci Sesi Perangkat</span>
            </Button>
          </div>
        </div>

        {/* Database & Maintenance */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2.5px_2.5px_0px_0px_#0f172a]">
                <Database size={20} />
              </div>
              <span className="text-xs font-mono font-black px-2.5 py-1 bg-amber-100 text-slate-950 border-2 border-slate-950 rounded-lg shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                DB v2.0 STABLE
              </span>
            </div>
            <h3 className="font-black text-lg text-slate-950 dark:text-slate-100">Pemeliharaan &amp; Backup DB</h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              Ekspor file cadangan JSON terenkripsi dan pemulihan data sistem.
            </p>
          </div>

          <div className="pt-3 border-t-3 border-slate-950 dark:border-slate-700">
            <Button
              variant="secondary"
              size="sm"
              className="w-full font-black"
              onClick={() => onNavigate('admin/maintenance')}
            >
              Buka Pemeliharaan DB
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};

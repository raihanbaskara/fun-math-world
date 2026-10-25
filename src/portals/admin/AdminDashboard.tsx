import React, { useState, useEffect } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { User } from '@/types';
import { LayoutDashboard, Users, ShieldCheck, Database, ArrowRight, Settings, ShieldAlert, Cpu, Clock, UserCheck } from 'lucide-react';

export const AdminDashboard: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const [db, setDb] = useState(storageService.getState());
  const pendingStudents = (db.users || []).filter(u => u.role === 'siswa' && u.isApproved !== true);
  const pendingCount = pendingStudents.length;

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDb({ ...newState });
    });
  }, []);

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

      {/* PENDING APPROVAL ALERT BANNER */}
      {pendingCount > 0 && (
        <div className="rounded-3xl bg-[#ffe600] text-slate-950 border-4 border-slate-950 p-5 sm:p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-3 border-slate-950 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#0f172a] animate-bounce">
              <Clock size={24} className="text-slate-950" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white font-mono font-black text-[11px] uppercase tracking-wider border-2 border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]">
                  Perlu Tindakan Admin
                </span>
                <span className="font-mono text-xs font-black text-slate-900">
                  {pendingCount} Siswa Baru Terdaftar
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                Ada {pendingCount} akun siswa baru menunggu persetujuan (ACC)!
              </h2>
              <p className="text-xs font-bold text-slate-800">
                Siswa baru belum dapat login ke sistem sebelum diverifikasi dan disetujui oleh Administrator.
              </p>
            </div>
          </div>
          <Button
            variant="purple"
            size="md"
            className="shrink-0 font-mono font-black flex items-center gap-2"
            onClick={() => onNavigate('admin/users')}
          >
            <UserCheck size={18} />
            <span>Tinjau &amp; ACC Siswa ({pendingCount})</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

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
            {pendingCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-500 rounded-xl text-xs font-black font-mono text-rose-950 dark:text-rose-200 shadow-[1.5px_1.5px_0px_0px_#f43f5e]">
                <Clock size={13} className="text-rose-600 shrink-0" />
                <span>{pendingCount} Siswa Menunggu ACC</span>
              </div>
            )}
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

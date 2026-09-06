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
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Editorial Luxury Header Banner */}
      <DoubleBezelCard
        className="bg-slate-950 border-slate-800 shadow-xl"
        innerClassName="bg-slate-900 border-slate-800/80 text-white p-6 sm:p-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full text-[11px] font-black uppercase tracking-wider font-mono">
                Administrator Lab & Server
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Sistem Terpadu SMP Fun Math
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Panel Kontrol Administrator Sistem
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Kelola akun pengguna terpadu (Siswa, Guru, Admin), kontrol kebijakan keamanan 1-Device Lock, cadangkan berkas database terenkripsi, serta pemeliharaan server lokal.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu size={32} />
          </div>
        </div>
      </DoubleBezelCard>

      {/* Admin Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 shadow-2xs">
                  <Users size={20} />
                </div>
                <span className="text-3xl font-black font-mono text-slate-900">
                  {db.users.length}
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">Total Akun Sistem</h3>
              <p className="text-xs text-slate-500">
                Terdiri dari akun siswa, guru pengajar, dan administrator aktif.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <ArrowFillButton
                variant="primary"
                size="sm"
                className="w-full h-9 font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onNavigate('admin/users')}
              >
                <span>Kelola Akun Pengguna</span>
              </ArrowFillButton>
            </div>
          </div>
        </DoubleBezelCard>

        {/* 1-Device Lock Policy */}
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-black font-mono px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                  AKTIF & TERKUNCI
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">Kebijakan 1 Akun 1 Device</h3>
              <p className="text-xs text-slate-500">
                Mencegah kecurangan login ganda secara bersamaan di perangkat lain.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="danger"
                size="sm"
                className="w-full h-9 font-bold text-xs rounded-xl"
                onClick={handleResetAllLocks}
              >
                <ShieldAlert size={14} />
                <span>Lepas Semua Kunci Device</span>
              </Button>
            </div>
          </div>
        </DoubleBezelCard>

        {/* Database & Maintenance */}
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-700 shadow-2xs">
                  <Database size={20} />
                </div>
                <span className="text-sm font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  v2.0 Stable
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900">Pemeliharaan & Backup DB</h3>
              <p className="text-xs text-slate-500">
                Ekspor file cadangan JSON dan pemulihan data sistem.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <ArrowFillButton
                variant="secondary"
                size="sm"
                className="w-full h-9 font-bold text-xs"
                onClick={() => onNavigate('admin/maintenance')}
              >
                <span>Buka Alat Backup</span>
              </ArrowFillButton>
            </div>
          </div>
        </DoubleBezelCard>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';
import {
  ShieldCheck,
  Edit3,
  LogOut,
  Award,
  BookOpen,
  FileText,
  Trophy,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const SiswaProfil: React.FC<{
  currentUser: User;
  onLogout: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onLogout, showToast }) => {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(currentUser.name);

  const p = currentUser.progress || { materi: 85, video: 70, lkpd: 100, evaluasi: 90 };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!nameInput.trim()) {
      showToast("Nama tidak boleh kosong!", "error");
      return;
    }

    storageService.update(draft => {
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        user.name = nameInput.trim();
      }
    });

    setIsEditOpen(false);
    soundService.success();
    showToast("Nama profil berhasil diperbarui!", "success");
  };

  const competencies = [
    {
      title: 'Materi & Konsep Visual',
      desc: 'Pemahaman konsep dasar pecahan & video interaktif',
      score: p.materi,
      icon: BookOpen,
      color: 'text-indigo-600',
      barColor: 'bg-indigo-600',
      bgColor: 'bg-indigo-50/70',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'Studio Eksperimen',
      desc: 'Simulasi geometri pizza & balok komparasi',
      score: p.video || 80,
      icon: Layers,
      color: 'text-amber-600',
      barColor: 'bg-amber-500',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Kelulusan LKPD Digital',
      desc: 'Penyelesaian lembar kerja & penugasan mandiri',
      score: p.lkpd,
      icon: FileText,
      color: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Evaluasi Soal Essai',
      desc: 'Penguasaan analisis matematika & penalaran',
      score: p.evaluasi,
      icon: Trophy,
      color: 'text-purple-600',
      barColor: 'bg-purple-600',
      bgColor: 'bg-purple-50/70',
      borderColor: 'border-purple-100'
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Outer Double Bezel Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-[32px] p-2.5 shadow-sm">
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 sm:p-8 space-y-8">
          
          {/* Header Profile Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-2xl border-2 border-slate-200/80 shadow-md object-cover bg-slate-50"
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl ring-4 ring-white shadow">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                  Siswa Terdaftar
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60">
                  {currentUser.class || 'Kelas 7-A'}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  NIS: {currentUser.username}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentUser.name}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl w-fit">
                <Lock size={12} />
                <span>Sesi 1-Device Terverifikasi Aktif</span>
              </div>
            </div>
          </div>

          {/* 4-Pillar Competency Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Matriks Capaian Belajar Siswa
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">4 Pilar Kurikulum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {competencies.map((comp, idx) => {
                const Icon = comp.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${comp.borderColor} ${comp.bgColor} flex flex-col justify-between space-y-3 transition-all hover:shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white shadow-2xs">
                          <Icon size={16} className={comp.color} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{comp.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{comp.desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black font-mono text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        {comp.score}%
                      </span>
                    </div>

                    <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden border border-slate-200/40 p-0.5">
                      <div
                        className={`${comp.barColor} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lencana Prestasi (Achievement Badges) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Lencana & Prestasi Akademik
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Master Konsep Pecahan</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700">
                <CheckCircle2 size={14} className="text-brand-500" />
                <span>Disiplin LKPD Digital</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700">
                <CheckCircle2 size={14} className="text-purple-500" />
                <span>Integritas Anti-Curang</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <ArrowFillButton
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto h-9 font-bold text-slate-700"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit3 size={14} />
              <span>Edit Nama Profil</span>
            </ArrowFillButton>

            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto h-9 font-bold rounded-xl"
              onClick={onLogout}
            >
              <LogOut size={14} />
              <span>Keluar dari Akun</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Perbarui Identitas Siswa"
      >
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nama Lengkap Siswa:
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setIsEditOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="accent" size="sm" className="rounded-xl font-black">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

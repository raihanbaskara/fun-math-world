import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, Announcement } from '@/types';
import { Bell, Send, Megaphone } from 'lucide-react';

export const GuruPengumuman: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!title.trim() || !content.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi!', 'error');
      return;
    }

    const newAnn: Announcement = {
      id: 'an_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: currentUser.name,
      isImportant: true,
    };

    storageService.update(draft => {
      draft.announcements.unshift(newAnn);
    });

    soundService.success();
    showToast('Pengumuman berhasil disiarkan ke semua siswa!', 'success');
    onNavigate('guru/dashboard');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Bell className="text-brand-600" />
          <span>Publikasi Pengumuman Kelas</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Kirim instruksi penting ke seluruh siswa secara instan pada beranda dashboard siswa.
        </p>
      </div>

      <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Judul Pengumuman:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Pengumpulan Tugas Mandiri LKPD 2"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Isi Pesan Pengumuman:
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tuliskan instruksi atau pesan kepada siswa..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <ArrowFillButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full h-11 font-bold text-sm"
            >
              <Send size={16} />
              <span>Siarkan Pengumuman ke Siswa</span>
            </ArrowFillButton>
          </div>
        </form>
      </DoubleBezelCard>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, Announcement } from '@/types';
import { Bell, Send, Megaphone, Trash2, Calendar, UserCheck } from 'lucide-react';

export const GuruPengumuman: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const announcements = dbState.announcements || [];

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

    setDbState(storageService.getState());
    setTitle('');
    setContent('');
    soundService.success();
    showToast('Pengumuman berhasil disiarkan ke semua siswa!', 'success');
  };

  const handleDeleteAnnouncement = (id: string) => {
    soundService.click();
    storageService.update(draft => {
      draft.announcements = draft.announcements.filter(a => a.id !== id);
    });
    setDbState(storageService.getState());
    soundService.success();
    showToast('Pengumuman berhasil dihapus!', 'info');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#38bdf8] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          BROADCAST
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                PUSAT SIARAN INFORMASI KELAS
              </span>
              <span className="px-3 py-1 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black font-mono shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {announcements.length} Pengumuman Aktif
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Siarkan Pengumuman &amp; Instruksi Belajar
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Kirim instruksi penting, tenggat pengumpulan tugas LKPD, atau jadwal evaluasi secara instan ke beranda dashboard seluruh siswa.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Megaphone size={36} />
          </div>
        </div>
      </div>

      {/* 2. Form Publikasi Neobrutalism */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 sm:p-8 shadow-[7px_7px_0px_0px_#0f172a] space-y-6">
        <div className="flex items-center gap-2 border-b-3 border-slate-950 pb-4">
          <div className="p-2 rounded-xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
            <Bell size={20} className="text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-950 font-mono">
              Tulis Pengumuman Baru
            </h2>
            <p className="text-xs font-bold text-slate-600">
              Pesan ini akan otomatis tampil di layar utama siswa
            </p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950">
              Judul Pengumuman:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Pengumpulan Tugas Mandiri LKPD 2 Pecahan"
              className="w-full p-4 rounded-2xl border-3 border-slate-950 bg-slate-50 text-slate-950 text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] focus:bg-white focus:shadow-[5px_5px_0px_0px_#0f172a] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950">
              Isi Pesan Pengumuman:
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tuliskan instruksi lengkap tugas, petunjuk teknis, atau batas waktu pengerjaan..."
              className="w-full p-4 rounded-2xl border-3 border-slate-950 bg-slate-50 text-slate-950 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] focus:bg-white focus:shadow-[5px_5px_0px_0px_#0f172a] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none leading-relaxed transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <Send size={16} />
              <span>Siarkan Pengumuman ke Seluruh Siswa</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Daftar Pengumuman Aktif */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-950 font-mono flex items-center gap-2">
          <span>Daftar Siaran Aktif</span>
          <span className="text-xs px-2.5 py-0.5 bg-[#ffe600] text-slate-950 rounded-lg border-2 border-slate-950 font-mono font-black">
            {announcements.length}
          </span>
        </h2>

        {announcements.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border-4 border-slate-950 text-center text-slate-500 font-bold shadow-[5px_5px_0px_0px_#0f172a]">
            Belum ada siaran pengumuman aktif saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann, idx) => (
              <div
                key={ann.id || idx}
                className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[5px_5px_0px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#38bdf8] text-slate-950 font-mono font-black text-xs border-2 border-slate-950">
                      PENGUMUMAN #{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-400">
                      <Calendar size={12} />
                      <span>{ann.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-400">
                      <UserCheck size={12} />
                      <span>{ann.author}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-950 font-mono">
                    {ann.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Trash2 size={14} className="text-rose-700" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

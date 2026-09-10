import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';
import {
  Bell,
  CheckCheck,
  Clock,
  Pin,
  Megaphone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const SiswaPengumuman: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'important'>('all');
  const db = storageService.getState();
  const announcements = db.announcements;
  const readList = currentUser.readAnnouncements || [];

  const unreadCount = announcements.filter(a => !readList.includes(a.id)).length;

  const handleMarkAsRead = (id: string) => {
    soundService.click();
    storageService.update(draft => {
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        if (!user.readAnnouncements) user.readAnnouncements = [];
        if (!user.readAnnouncements.includes(id)) {
          user.readAnnouncements.push(id);
        }
      }
    });
    showToast("Pengumuman ditandai sudah dibaca.", "info");
  };

  const handleMarkAllAsRead = () => {
    soundService.click();
    storageService.update(draft => {
      const user = draft.users.find(u => u.id === currentUser.id);
      if (user) {
        user.readAnnouncements = draft.announcements.map(a => a.id);
      }
    });
    soundService.success();
    showToast("Semua pengumuman telah ditandai dibaca.", "success");
  };

  const cleanTitle = (text: string) => {
    return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  };

  const filteredAnnouncements = announcements.filter(a => {
    const isRead = readList.includes(a.id);
    if (activeFilter === 'unread') return !isRead;
    if (activeFilter === 'important') return a.isImportant;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 font-sans">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          INFO
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                PAPAN PENGUMUMAN KELAS 7
              </span>
              <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                {unreadCount > 0 ? `${unreadCount} Belum Dibaca` : 'Semua Sudah Dibaca'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Informasi &amp; Instruksi Guru
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Pemberitahuan resmi mengenai jadwal evaluasi sumatif, penugasan LKPD digital, dan petunjuk kurikulum matematika dari guru pengampu.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <Megaphone size={36} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `Semua (${announcements.length})` },
            { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
            { id: 'important', label: 'Penting' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                soundService.click();
                setActiveFilter(f.id as 'all' | 'unread' | 'important');
              }}
              className={`px-4 py-2 rounded-2xl border-2 border-slate-950 font-mono font-black text-xs transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-slate-950 text-[#ffe600] shadow-[3px_3px_0px_0px_#0f172a] -translate-x-0.5 -translate-y-0.5'
                  : 'bg-white text-slate-800 hover:bg-yellow-100 shadow-[1.5px_1.5px_0px_0px_#0f172a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-2xl bg-[#a3e635] text-slate-950 border-2 border-slate-950 font-mono font-black text-xs shadow-[2px_2px_0px_0px_#0f172a] hover:bg-lime-400 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck size={16} />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {filteredAnnouncements.map((item) => {
          const isRead = readList.includes(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border-4 border-slate-950 p-6 transition-all space-y-3 ${
                isRead
                  ? 'bg-white shadow-[5px_5px_0px_0px_#0f172a]'
                  : 'bg-[#fffdf5] shadow-[8px_8px_0px_0px_#0f172a] border-slate-950 ring-2 ring-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isImportant && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-200 text-rose-950 border border-slate-950 font-mono text-[10px] font-black flex items-center gap-1">
                      <Pin size={11} />
                      <span>PENTING</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-slate-950 border border-slate-950 font-mono text-[10px] font-bold">
                    Oleh: {item.author}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {item.date}
                  </span>
                </div>

                {!isRead ? (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="px-3 py-1 bg-[#ffe600] text-slate-950 font-mono font-black text-[11px] rounded-xl border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer self-start sm:self-auto"
                  >
                    Tandai Dibaca
                  </button>
                ) : (
                  <span className="text-[11px] font-mono font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Sudah Dibaca</span>
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black font-mono text-slate-950">
                {cleanTitle(item.title)}
              </h3>

              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="rounded-3xl bg-white border-4 border-slate-950 p-8 text-center text-slate-500 font-bold shadow-[6px_6px_0px_0px_#0f172a]">
            Tidak ada pengumuman pada kategori ini.
          </div>
        )}
      </div>

    </div>
  );
};

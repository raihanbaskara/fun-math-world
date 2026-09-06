import React, { useState } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
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
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <Megaphone size={13} className="text-[#00ffc6]" />
                <span>Papan Buletin Kelas 7</span>
              </span>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{unreadCount} Belum Dibaca</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Semua Telah Dibaca</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Informasi & Instruksi Guru
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Pemberitahuan resmi mengenai jadwal evaluasi sumatif, penugasan LKPD, dan petunjuk pembelajaran kurikulum matematika.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <ArrowFillButton
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Tandai Semua Dibaca
            </ArrowFillButton>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Filter Tabs Segmented Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('important')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'important'
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Penting ({announcements.filter(a => a.isImportant).length})
          </button>
        </div>

        <span className="text-[11px] font-mono font-bold text-slate-400 hidden sm:inline">
          Menampilkan {filteredAnnouncements.length} pengumuman
        </span>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 opacity-60" />
            <h3 className="text-sm font-black text-slate-900">Tidak Ada Pengumuman</h3>
            <p className="text-xs text-slate-500">
              {activeFilter === 'unread'
                ? 'Luar biasa! Kamu sudah membaca seluruh pengumuman kelas.'
                : 'Belum ada pengumuman dengan kriteria filter yang dipilih.'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((a) => {
            const isRead = readList.includes(a.id);
            const titleText = cleanTitle(a.title);

            return (
              <DoubleBezelCard
                key={a.id}
                className={`transition-all duration-300 ${
                  !isRead
                    ? 'bg-amber-50/40 border-amber-200/80 ring-2 ring-amber-400/20'
                    : 'bg-slate-100/60 border-slate-200/80'
                }`}
              >
                <div className="space-y-3.5">
                  
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        <Clock size={12} />
                        <span>{a.date}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <UserCheck size={13} className="text-brand-600" />
                        <span>{a.author}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.isImportant && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <Pin size={11} className="text-rose-600" />
                          <span>Instruksi Prioritas</span>
                        </span>
                      )}

                      {!isRead ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                          <span>Baru</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Sudah Dibaca</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Body Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{titleText}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line bg-white/80 p-4 rounded-2xl border border-slate-200/80">
                      {a.content}
                    </p>
                  </div>

                  {/* Bottom Action if Unread */}
                  {!isRead && (
                    <div className="pt-1 flex justify-end">
                      <ArrowFillButton
                        variant="mint"
                        size="sm"
                        onClick={() => handleMarkAsRead(a.id)}
                      >
                        Tandai Selesai Membaca
                      </ArrowFillButton>
                    </div>
                  )}

                </div>
              </DoubleBezelCard>
            );
          })
        )}
      </div>

    </div>
  );
};

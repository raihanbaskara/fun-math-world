import React, { useState } from 'react';
import { Card, DoubleBezelCard } from '@/components/ui/card';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { EmojiRating, ratingOptions } from '@/components/ui/emoji-rating';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SiswaRefleksi: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, onNavigate, showToast }) => {
  const db = storageService.getState();
  const pastReflections = db.reflections.filter(r => r.studentName === currentUser.name) || [];

  const [overallRating, setOverallRating] = useState<number>(4);
  const [topicRatings, setTopicRatings] = useState<Record<string, number>>({
    'BAB 1.1: Konsep & Notasi': 4,
    'BAB 1.2: Pecahan Senilai': 4,
    'BAB 1.3: Penjumlahan & Pengurangan': 3,
    'BAB 1.4: Perkalian & Pembagian': 4,
  });

  const [easyTopic, setEasyTopic] = useState('');
  const [challengeTopic, setChallengeTopic] = useState('');

  const handleTopicRatingChange = (topic: string, val: number) => {
    soundService.click();
    setTopicRatings(prev => ({ ...prev, [topic]: val }));
  };

  const handleFullSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    const selectedEmojiObj = ratingOptions[overallRating - 1] || ratingOptions[3];

    storageService.update(draft => {
      draft.reflections.unshift({
        id: 'ref_' + Date.now(),
        studentName: currentUser.name,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        emoji: selectedEmojiObj.emoji,
        easy: easyTopic.trim() || 'Memahami visualisasi pecahan senilai',
        challenge: challengeTopic.trim() || 'Menyamakan penyebut KPK angka besar',
      });
    });

    soundService.success();
    confetti({ particleCount: 70, spread: 80 });
    showToast('Refleksi metakognitif harianmu berhasil disimpan!', 'success');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <DoubleBezelCard className="bg-slate-100/80 border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <Sparkles size={13} className="text-[#00ffc6]" />
                <span>Metakognisi Siswa</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Evaluasi Diri Terstruktur</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Refleksi & Pemahaman Belajar
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Mengevaluasi sejauh mana kamu memahami konsep pecahan, mengidentifikasi materi yang masih menantang, dan menyusun target peningkatan nilai.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-right shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Refleksi</div>
              <div className="text-sm font-black text-slate-900">{pastReflections.length} Catatan</div>
            </div>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Section 1: 21st.dev Emoji Rating (Emotion & Comprehension Index) */}
      <Card className="p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-200/90 shadow-sm bg-white">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-full inline-block">
            Tingkat Kepahaman Hari Ini
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Bagaimana Pemahamanmu Terhadap Bilangan Pecahan?
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Pilih ekspresi yang paling menggambarkan kesiapan dan pemahaman konsepmu.
          </p>
        </div>

        {/* 21st.dev Emoji Rating Component */}
        <EmojiRating
          value={overallRating}
          onChange={(val) => setOverallRating(val)}
          className="pt-2"
        />
      </Card>

      {/* Section 2: Sub-Topic Mastery Self-Assessment */}
      <Card className="p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-200/90 shadow-sm bg-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Capaian Tiap Sub-Topik Pecahan
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Beri rating 1 sampai 5 untuk masing-masing materi
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(topicRatings).map(([topic, val]) => (
            <div
              key={topic}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900">{topic}</span>
                <span className="font-mono font-black text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-md">
                  {val}/5
                </span>
              </div>

              {/* 5-Level Pill Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isSelected = val === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleTopicRatingChange(topic, lvl)}
                      className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 3: Structured Written Reflection Form */}
      <Card className="p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200/90 shadow-sm bg-white">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Catatan Metakognisi & Rencana Mandiri
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Tuangkan hasil analisa belajarmu ke dalam catatan yang tersimpan ke guru
            </p>
          </div>
        </div>

        <form onSubmit={handleFullSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              1. Materi pecahan mana yang paling kamu pahami dengan mudah?
            </label>
            <input
              type="text"
              required
              value={easyTopic}
              onChange={(e) => setEasyTopic(e.target.value)}
              placeholder="Contoh: Menentukan pecahan senilai dan menggunakan visualisasi pizza..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 bg-slate-50/70 text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition font-medium shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              2. Tantangan atau soal apa yang masih membingungkan bagimu?
            </label>
            <textarea
              required
              rows={3}
              value={challengeTopic}
              onChange={(e) => setChallengeTopic(e.target.value)}
              placeholder="Contoh: Operasi pembagian pecahan campuran dan menyamakan penyebut beda KPK..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 bg-slate-50/70 text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition font-medium shadow-2xs resize-none"
            />
          </div>

          <div className="pt-2">
            <ArrowFillButton
              type="submit"
              variant="mint"
              size="lg"
              fullWidth
            >
              <CheckCircle2 size={18} />
              <span>Simpan & Kirimkan Catatan Refleksi</span>
            </ArrowFillButton>
          </div>
        </form>
      </Card>

    </div>
  );
};

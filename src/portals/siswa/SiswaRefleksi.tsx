import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { EmojiRating, ratingOptions } from '@/components/ui/emoji-rating';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Sliders,
  HeartHandshake,
  ArrowRight,
  Send
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
    showToast('Refleksi harianmu berhasil disimpan dan diteruskan ke Guru!', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 font-sans">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#fbcfe8] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          REFLEKSI
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                METAKOGNISI &amp; EVALUASI DIRI
              </span>
              <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                {pastReflections.length} Catatan Tersimpan
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Refleksi &amp; Pemahaman Belajar
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Evaluasi sejauh mana kamu memahami konsep pecahan, ungkapkan materi yang masih menantang, dan sampaikan langsung ke catatan guru.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <HeartHandshake size={36} />
          </div>
        </div>
      </div>

      {/* Section 1: Emoji Rating Card */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 sm:p-8 shadow-[7px_7px_0px_0px_#0f172a] space-y-5 text-center">
        <div className="space-y-1">
          <span className="text-xs font-mono font-black uppercase text-slate-600 bg-amber-100 px-3 py-1 rounded-xl border border-slate-950 inline-block">
            Tingkat Kepahaman Hari Ini
          </span>
          <h2 className="text-lg sm:text-xl font-black font-mono text-slate-950">
            Bagaimana Pemahamanmu Terhadap Bilangan Pecahan?
          </h2>
          <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
            Pilih ekspresi yang paling menggambarkan kesiapan dan pemahaman konsepmu saat ini.
          </p>
        </div>

        <EmojiRating
          value={overallRating}
          onChange={(val) => setOverallRating(val)}
          className="pt-2"
        />
      </div>

      {/* Section 2: Sub-Topic Mastery */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 sm:p-8 shadow-[7px_7px_0px_0px_#0f172a] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8] border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-black font-mono text-slate-950">
                Capaian Tiap Sub-Topik Pecahan
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Beri rating 1 sampai 5 untuk masing-masing materi
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(topicRatings).map(([topic, val]) => (
            <div
              key={topic}
              className="p-4 rounded-2xl bg-[#fffdf5] border-3 border-slate-950 space-y-3 shadow-[3px_3px_0px_0px_#0f172a]"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-black text-slate-950">{topic}</span>
                <span className="font-mono font-black text-slate-950 bg-[#ffe600] px-2 py-0.5 rounded-md border border-slate-950">
                  {val}/5
                </span>
              </div>

              {/* 5-Level Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isSelected = val === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleTopicRatingChange(topic, lvl)}
                      className={`py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 border-slate-950 ${
                        isSelected
                          ? 'bg-slate-950 text-[#ffe600] shadow-[2px_2px_0px_0px_#0f172a] -translate-x-0.5 -translate-y-0.5'
                          : 'bg-white text-slate-700 hover:bg-yellow-100'
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
      </div>

      {/* Section 3: Reflection Form */}
      <form onSubmit={handleFullSubmit} className="rounded-3xl bg-white border-4 border-slate-950 p-6 sm:p-8 shadow-[7px_7px_0px_0px_#0f172a] space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-slate-950">
          <div className="w-9 h-9 rounded-xl bg-[#a3e635] border-2 border-slate-950 text-slate-950 flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#0f172a]">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-base font-black font-mono text-slate-950">
              Catatan Refleksi Mandiri untuk Guru
            </h3>
            <p className="text-xs font-bold text-slate-600">
              Catatan ini akan tersimpan langsung di portal pemantauan guru
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5">
              1. Materi pecahan mana yang paling kamu pahami dengan mudah?
            </label>
            <input
              type="text"
              required
              value={easyTopic}
              onChange={(e) => setEasyTopic(e.target.value)}
              placeholder="Contoh: Menentukan pecahan senilai dan visualisasi pizza..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border-2 border-slate-950 bg-slate-50 text-slate-950 font-bold focus:bg-white outline-none shadow-[2px_2px_0px_0px_#0f172a]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5">
              2. Tantangan atau soal apa yang masih membingungkan bagimu?
            </label>
            <textarea
              required
              rows={3}
              value={challengeTopic}
              onChange={(e) => setChallengeTopic(e.target.value)}
              placeholder="Contoh: Operasi pembagian pecahan campuran dan menyamakan penyebut beda KPK..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border-2 border-slate-950 bg-slate-50 text-slate-950 font-bold focus:bg-white outline-none shadow-[2px_2px_0px_0px_#0f172a] resize-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="w-full font-black text-sm"
            >
              <Send size={18} />
              <span>Simpan &amp; Kirimkan Catatan Refleksi ke Guru</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Past Reflections Stream */}
      {pastReflections.length > 0 && (
        <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[7px_7px_0px_0px_#0f172a] space-y-4">
          <h3 className="font-mono font-black text-base text-slate-950">
            Riwayat Refleksi Belajarmu
          </h3>

          <div className="space-y-3">
            {pastReflections.map(ref => (
              <div key={ref.id} className="p-4 rounded-2xl bg-[#fffdf5] border-2 border-slate-950 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ref.emoji}</span>
                    <span className="font-black text-xs text-slate-950 font-mono">{ref.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-slate-950 font-mono text-[10px] font-black">
                    Tersimpan di Guru
                  </span>
                </div>

                <div className="text-xs space-y-1 font-medium">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                    <span className="font-black">Mudah: </span>{ref.easy}
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                    <span className="font-black">Tantangan: </span>{ref.challenge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

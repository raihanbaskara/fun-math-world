import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { HelpCircle, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

export const GuruSoal: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const db = storageService.getState();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [weight, setWeight] = useState<number>(50);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!title.trim() || !prompt.trim() || !discussion.trim()) {
      showToast('Semua kolom soal essai wajib diisi!', 'error');
      return;
    }

    storageService.update(draft => {
      draft.evaluationQuestions.push({
        id: 'eq_' + Date.now(),
        title: title.trim(),
        prompt: prompt.trim(),
        discussion: discussion.trim(),
        weight: weight,
      });
    });

    setIsAddOpen(false);
    setTitle('');
    setPrompt('');
    setDiscussion('');
    soundService.success();
    showToast('Soal essai baru berhasil disimpan!', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus butir soal evaluasi ini?')) {
      storageService.update(draft => {
        draft.evaluationQuestions = draft.evaluationQuestions.filter(q => q.id !== id);
      });
      soundService.click();
      showToast('Soal dihapus.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <HelpCircle className="text-purple-600" />
            <span>Bank Soal Evaluasi Essai HOTS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola butir soal cerita pemecahan masalah pecahan dan kunci langkah pembahasan runtut.
          </p>
        </div>

        <ArrowFillButton
          variant="primary"
          size="md"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={16} />
          <span>Tambah Soal Essai</span>
        </ArrowFillButton>
      </div>

      <div className="space-y-4">
        {db.evaluationQuestions.map((q, idx) => (
          <DoubleBezelCard key={q.id} className="bg-slate-50 border-slate-200/80">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200/80 font-mono font-bold text-purple-700">
                  Soal #{idx + 1} • Bobot: {q.weight} Poin
                </span>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors text-xs"
                >
                  <Trash2 size={14} />
                  <span>Hapus Soal</span>
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900">{q.title}</h3>
              
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70 font-medium">
                {renderFormattedMathText(q.prompt, 'xs')}
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/70 text-xs sm:text-sm space-y-1.5">
                <div className="font-black text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-purple-600" />
                  <span>Kunci Langkah Pembahasan:</span>
                </div>
                <div className="text-slate-700 leading-relaxed font-medium">
                  {renderFormattedMathText(q.discussion, 'xs')}
                </div>
              </div>
            </div>
          </DoubleBezelCard>
        ))}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Soal Essai Baru"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Judul / Topik Soal:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Soal Cerita — Perbandingan Panjang Pita"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Pertanyaan Cerita / Kasus HOTS:
            </label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Tuliskan teks soal cerita pecahan..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Kunci & Pembahasan Runtut:
            </label>
            <textarea
              required
              rows={3}
              value={discussion}
              onChange={e => setDiscussion(e.target.value)}
              placeholder="Langkah 1: Menentukan pecahan biasa... Langkah 2: Menyamakan penyebut..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Bobot Nilai (Poin):
            </label>
            <input
              type="number"
              min="10"
              max="100"
              required
              value={weight}
              onChange={e => setWeight(parseInt(e.target.value) || 50)}
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setIsAddOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-purple-600 hover:bg-purple-700 text-white">
              Simpan Butir Soal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

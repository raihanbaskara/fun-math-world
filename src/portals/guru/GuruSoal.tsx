import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { EssayQuestion } from '@/types';
import {
  PenTool,
  Plus,
  Trash2,
  CheckCircle2,
  Pencil,
  Sparkles,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export const GuruSoal: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EssayQuestion | null>(null);

  // Form State for Add
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [weight, setWeight] = useState<number>(50);

  // Form State for Edit
  const [editTitle, setEditTitle] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editDiscussion, setEditDiscussion] = useState('');
  const [editWeight, setEditWeight] = useState<number>(50);

  const questions = dbState.evaluationQuestions || [];

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!title.trim() || !prompt.trim() || !discussion.trim()) {
      showToast('Semua kolom butir soal essai wajib diisi!', 'error');
      return;
    }

    const newQuestion: EssayQuestion = {
      id: 'eq_' + Date.now(),
      title: title.trim(),
      prompt: prompt.trim(),
      discussion: discussion.trim(),
      weight: weight || 50,
    };

    storageService.update(draft => {
      draft.evaluationQuestions.push(newQuestion);
    });

    setDbState(storageService.getState());
    setIsAddOpen(false);
    setTitle('');
    setPrompt('');
    setDiscussion('');
    setWeight(50);
    soundService.success();
    showToast('Soal essai baru berhasil ditambahkan ke Bank Soal!', 'success');
  };

  const handleOpenEdit = (q: EssayQuestion) => {
    soundService.click();
    setEditingQuestion(q);
    setEditTitle(q.title);
    setEditPrompt(q.prompt);
    setEditDiscussion(q.discussion);
    setEditWeight(q.weight || 50);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    soundService.click();

    if (!editTitle.trim() || !editPrompt.trim() || !editDiscussion.trim()) {
      showToast('Semua kolom butir soal essai wajib diisi!', 'error');
      return;
    }

    storageService.update(draft => {
      const target = draft.evaluationQuestions.find(q => q.id === editingQuestion.id);
      if (target) {
        target.title = editTitle.trim();
        target.prompt = editPrompt.trim();
        target.discussion = editDiscussion.trim();
        target.weight = editWeight || 50;
      }
    });

    setDbState(storageService.getState());
    setEditingQuestion(null);
    soundService.success();
    showToast('Butir soal evaluasi berhasil diperbarui!', 'success');
  };

  const handleDelete = (id: string) => {
    soundService.click();
    if (confirm('Apakah Anda yakin ingin menghapus butir soal evaluasi ini?')) {
      storageService.update(draft => {
        draft.evaluationQuestions = draft.evaluationQuestions.filter(q => q.id !== id);
      });
      setDbState(storageService.getState());
      soundService.success();
      showToast('Soal evaluasi berhasil dihapus dari Bank Soal.', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ff9838] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          HOTS ESSAY
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-950 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000]">
                BANK SOAL ESSAI HOTS
              </span>
              <span className="px-3 py-1 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-200 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold font-mono">
                {questions.length} Butir Soal Tersedia
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Kelola Bank Soal Evaluasi Essai HOTS
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Buat, sunting, dan kelola butir soal cerita pemecahan masalah pecahan tingkat lanjut serta kunci langkah pembahasan komprehensif.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <PenTool size={36} />
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-100 font-mono">
            Daftar Butir Soal Evaluasi
          </h2>
          <span className="px-2.5 py-0.5 rounded-lg bg-[#38bdf8] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
            {questions.length} Soal
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setIsAddOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          <span>Tambah Soal Essai Baru</span>
        </button>
      </div>

      {/* 3. Question Cards List */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-5"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-slate-950 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  Soal #{idx + 1}
                </span>
                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  Bobot: {q.weight || 50} Poin
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(q)}
                  className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  title="Edit Butir Soal"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  title="Hapus Butir Soal"
                >
                  <Trash2 size={14} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-100 font-mono">
                {q.title}
              </h3>
            </div>

            {/* Prompt Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800/80 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold leading-relaxed space-y-1">
              <div className="text-[11px] font-mono font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
                Teks Soal / Skenario Masalah:
              </div>
              <div>{renderFormattedMathText(q.prompt, 'sm')}</div>
            </div>

            {/* Discussion Box */}
            <div className="p-4 sm:p-5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border-2 border-slate-950 dark:border-purple-800 text-xs sm:text-sm space-y-2">
              <div className="font-black text-purple-950 dark:text-purple-300 font-mono flex items-center gap-2">
                <CheckCircle2 size={16} className="text-purple-700 dark:text-purple-400" />
                <span>Kunci Langkah Pembahasan Runtut:</span>
              </div>
              <div className="text-slate-800 dark:text-purple-100 leading-relaxed font-bold">
                {renderFormattedMathText(q.discussion, 'xs')}
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-12 text-center shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000] space-y-3">
            <BookOpen size={48} className="mx-auto text-slate-400" />
            <div className="text-lg font-black text-slate-950 dark:text-slate-100 font-mono">Bank Soal Essai Kosong</div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Belum ada butir soal evaluasi essai yang dibuat. Klik tombol di atas untuk menambahkan soal baru.
            </p>
          </div>
        )}
      </div>

      {/* 4. Modal Tambah Soal Essai */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Soal Essai HOTS Baru"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
              Judul / Topik Soal:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Soal Cerita — Perbandingan Panjang Pita"
              className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-amber-50 dark:focus:bg-slate-750"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
              Pertanyaan Cerita / Kasus HOTS:
            </label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Tuliskan narasi soal cerita pecahan..."
              className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-amber-50 dark:focus:bg-slate-750 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
              Kunci &amp; Langkah Pembahasan Runtut:
            </label>
            <textarea
              required
              rows={3}
              value={discussion}
              onChange={e => setDiscussion(e.target.value)}
              placeholder="Langkah 1: Menentukan pecahan biasa... Langkah 2: Menyamakan penyebut..."
              className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-purple-50 dark:focus:bg-slate-750 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
              Bobot Nilai (Poin):
            </label>
            <input
              type="number"
              min="10"
              max="100"
              required
              value={weight}
              onChange={e => setWeight(parseInt(e.target.value) || 50)}
              className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-slate-950 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono font-black text-xs border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Simpan Butir Soal
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Modal Edit Soal Essai */}
      {editingQuestion && (
        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title="Edit Butir Soal Essai HOTS"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
                Judul / Topik Soal:
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-amber-50 dark:focus:bg-slate-750"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
                Pertanyaan Cerita / Kasus HOTS:
              </label>
              <textarea
                required
                rows={3}
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-amber-50 dark:focus:bg-slate-750 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
                Kunci &amp; Langkah Pembahasan Runtut:
              </label>
              <textarea
                required
                rows={3}
                value={editDiscussion}
                onChange={e => setEditDiscussion(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-purple-50 dark:focus:bg-slate-750 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-1.5">
                Bobot Nilai (Poin):
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={editWeight}
                onChange={e => setEditWeight(parseInt(e.target.value) || 50)}
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-slate-950 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono font-black text-xs border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Perbarui Soal
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

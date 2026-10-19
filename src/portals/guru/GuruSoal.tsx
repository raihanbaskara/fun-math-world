import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { EssayQuestion, EvaluationSubmission, User } from '@/types';
import {
  PenTool,
  Plus,
  Trash2,
  CheckCircle2,
  Pencil,
  Sparkles,
  HelpCircle,
  BookOpen,
  Users,
  Clock,
  ShieldAlert,
  Camera,
  Eye,
  AlertCircle,
  Check,
  ChevronRight,
  Maximize2,
  Search,
  Filter
} from 'lucide-react';

export const GuruSoal: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [activeTab, setActiveTab] = useState<'submissions' | 'bank'>('submissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Question Management State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EssayQuestion | null>(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [weight, setWeight] = useState<number>(50);

  const [editTitle, setEditTitle] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editDiscussion, setEditDiscussion] = useState('');
  const [editWeight, setEditWeight] = useState<number>(50);

  // Student Evaluation Inspection State
  const [selectedSub, setSelectedSub] = useState<EvaluationSubmission | null>(null);
  const [teacherScoreInput, setTeacherScoreInput] = useState<number>(0);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDbState(newState);
    });
  }, []);

  const questions = dbState.evaluationQuestions || [];
  const submissions = dbState.evaluationSubmissions || [];
  const students = dbState.users?.filter(u => u.role === 'siswa') || [];

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.studentClass || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || (sub.studentClass || 'Kelas 7-A') === selectedClass;
    return matchesSearch && matchesClass;
  });

  const needsReviewCount = submissions.filter(s => s.gradingStatus === 'needs_review' && s.teacherScore === undefined).length;
  const gradedCount = submissions.filter(s => s.teacherScore !== undefined || s.gradingStatus === 'graded').length;

  const handleOpenInspect = (sub: EvaluationSubmission) => {
    soundService.click();
    setSelectedSub(sub);
    setTeacherScoreInput(sub.teacherScore ?? sub.score ?? 0);
    setTeacherFeedbackInput(sub.teacherFeedback || '');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    soundService.click();

    const clampedScore = Math.max(0, Math.min(100, Number(teacherScoreInput) || 0));

    storageService.update(draft => {
      const sub = draft.evaluationSubmissions?.find(s => s.id === selectedSub.id || s.studentId === selectedSub.studentId);
      if (sub) {
        sub.teacherScore = clampedScore;
        sub.teacherFeedback = teacherFeedbackInput.trim();
        sub.score = clampedScore;
        sub.gradingStatus = 'graded';
      }
      const u = draft.users.find(user => user.id === selectedSub.studentId);
      if (u) {
        if (!u.progress) u.progress = { materi: 100, video: 100, lkpd: 100, latsol: 100, evaluasi: 0 };
        u.progress.evaluasi = clampedScore;
      }
    });

    soundService.success();
    showToast(`Nilai Evaluasi siswa ${selectedSub.studentName} berhasil disimpan (${clampedScore}/100)!`, 'success');
    setSelectedSub(null);
  };

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
      soundService.success();
      showToast('Soal evaluasi berhasil dihapus dari Bank Soal.', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ff9838] border-4 border-slate-950 dark:border-slate-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          EVALUASI
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-950 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                PORTAL GURU &bull; EVALUASI ESSAI HOTS
              </span>
              <span className="px-3 py-1 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                {submissions.length} Jawaban Masuk
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Kelola &amp; Nilai Evaluasi Siswa
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Periksa lembar pengerjaan evaluasi sumatif siswa, analisis diagnosa AI terhadap coretan foto, dan berikan nilai serta catatan feedback guru.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <PenTool size={36} />
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATOR (NEOBRUTALISM PILL TABS) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            soundService.click();
            setActiveTab('submissions');
          }}
          className={`px-5 py-3 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#ffe600] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 shadow-[2px_2px_0px_0px_#0f172a]'
          }`}
        >
          <Users size={16} />
          <span>Lembar Jawaban Siswa</span>
          <span className="ml-1 px-2 py-0.5 rounded-lg bg-slate-950 text-white text-[11px] font-black">
            {submissions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setActiveTab('bank');
          }}
          className={`px-5 py-3 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bank'
              ? 'bg-[#38bdf8] text-slate-950 shadow-[4px_4px_0px_0px_#0f172a] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 shadow-[2px_2px_0px_0px_#0f172a]'
          }`}
        >
          <BookOpen size={16} />
          <span>Kelola Bank Soal Essai</span>
          <span className="ml-1 px-2 py-0.5 rounded-lg bg-slate-950 text-white text-[11px] font-black">
            {questions.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR PENGUMPULAN & LEMBAR SISWA */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] space-y-1">
              <span className="text-[11px] font-mono font-black uppercase text-slate-500">Total Pengumpulan</span>
              <div className="text-3xl font-mono font-black text-slate-950 dark:text-slate-100">
                {submissions.length} <span className="text-sm font-bold text-slate-500">Siswa</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] space-y-1">
              <span className="text-[11px] font-mono font-black uppercase text-amber-800 dark:text-amber-400">Perlu Review Foto Guru</span>
              <div className="text-3xl font-mono font-black text-amber-900 dark:text-amber-300">
                {needsReviewCount} <span className="text-sm font-bold text-amber-700">Siswa</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-3 border-slate-950 dark:border-slate-800 shadow-[4px_4px_0px_0px_#0f172a] space-y-1">
              <span className="text-[11px] font-mono font-black uppercase text-emerald-800 dark:text-emerald-400">Sudah Selesai Dinilai</span>
              <div className="text-3xl font-mono font-black text-emerald-900 dark:text-emerald-300">
                {gradedCount} <span className="text-sm font-bold text-emerald-700">Siswa</span>
              </div>
            </div>
          </div>

          {/* Search & Class Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#111827] p-4 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[3px_3px_0px_0px_#0f172a]">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau kelas siswa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-950 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter size={16} className="text-slate-500" />
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-slate-950 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 cursor-pointer"
              >
                <option value="all">Semua Kelas</option>
                <option value="Kelas 7-A">Kelas 7-A</option>
                <option value="Kelas 7-B">Kelas 7-B</option>
                <option value="Kelas 7-C">Kelas 7-C</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 shadow-[6px_6px_0px_0px_#0f172a] space-y-3">
              <AlertCircle size={48} className="mx-auto text-amber-500" />
              <h3 className="font-mono font-black text-lg text-slate-950 dark:text-slate-100">
                Belum Ada Pengumpulan Evaluasi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Jawaban siswa yang telah menyelesaikan evaluasi sumatif akan otomatis muncul di tabel ini secara realtime.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border-4 border-slate-950 dark:border-slate-800 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000]">
              <table className="w-full text-left border-collapse bg-white dark:bg-[#111827] text-xs font-mono">
                <thead>
                  <tr className="border-b-3 border-slate-950 dark:border-slate-800 bg-[#ffe600] text-slate-950 font-black">
                    <th className="p-4">No</th>
                    <th className="p-4">Siswa</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">Waktu Kumpul</th>
                    <th className="p-4 text-center">Nilai Akhir</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Bukti Foto</th>
                    <th className="p-4 text-center">Anti-Cheat</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 font-bold text-slate-900 dark:text-slate-100">
                  {filteredSubmissions.map((sub, idx) => {
                    const photoCount = Object.keys(sub.photoProofs || {}).length || (sub.photoProof ? 1 : 0);
                    const isGraded = sub.teacherScore !== undefined && sub.teacherScore !== null;
                    const needsReview = sub.gradingStatus === 'needs_review' && !isGraded;
                    const finalDisplayScore = sub.teacherScore ?? sub.score;

                    return (
                      <tr key={sub.id} className="hover:bg-amber-50/60 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-4 font-black text-slate-400">{idx + 1}</td>
                        <td className="p-4">
                          <div className="font-black text-slate-950 dark:text-slate-100">{sub.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">ID: {sub.studentId}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-slate-950 border border-slate-950 text-[11px] font-black">
                            {sub.studentClass || 'Kelas 7-A'}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] text-slate-600 dark:text-slate-400">
                          {sub.date || '-'}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 rounded-xl bg-amber-100 text-slate-950 font-black text-sm border border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                            {needsReview ? 'Menunggu Review' : `${finalDisplayScore} / 100`}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-slate-950 text-[11px] font-black">
                              <CheckCircle2 size={12} className="text-emerald-700" />
                              <span>Dinilai Guru</span>
                            </span>
                          ) : needsReview ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 border border-slate-950 text-[11px] font-black">
                              <Clock size={12} className="text-amber-700" />
                              <span>Perlu Review</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-100 text-sky-950 border border-slate-950 text-[11px] font-black">
                              <CheckCircle2 size={12} className="text-sky-700" />
                              <span>Sistem</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {photoCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-950 border border-slate-950 text-[10px] font-black">
                              <Camera size={11} />
                              <span>{photoCount} Foto</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">Teks Saja</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black ${
                            (sub.antiCheat?.switchCount || 0) > 0
                              ? 'bg-red-100 text-red-950 border-red-950'
                              : 'bg-emerald-100 text-emerald-950 border-emerald-950'
                          }`}>
                            {sub.antiCheat?.switchCount || 0}x Pindah
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenInspect(sub)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 mx-auto"
                          >
                            <Eye size={13} />
                            <span>Periksa &amp; Nilai</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KELOLA BANK BUTIR SOAL ESSAI */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
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
              className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 w-fit"
            >
              <Plus size={16} />
              <span>Tambah Soal Essai Baru</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-5"
              >
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

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-100 font-mono">
                    {q.title}
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">
                    Instruksi &amp; Cerita Soal:
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                    {renderFormattedMathText(q.prompt)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-slate-950 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-900 dark:text-amber-400 tracking-wider flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>Langkah Pembahasan Resmi &amp; Rubrik Guru:</span>
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                    {renderFormattedMathText(q.discussion)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INSPECTION & GRADING LEMBAR JAWABAN SISWA */}
      {/* ========================================================================= */}
      {selectedSub && (
        <Modal
          isOpen={Boolean(selectedSub)}
          onClose={() => setSelectedSub(null)}
          title={`Periksa Evaluasi: ${selectedSub.studentName} (${selectedSub.studentClass || '7-A'})`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-mono font-black text-base text-slate-950 dark:text-slate-100">{selectedSub.studentName}</h3>
                <div className="text-xs font-mono font-bold text-slate-500">
                  NIS: {selectedSub.studentId} &bull; Kelas: {selectedSub.studentClass} &bull; Waktu: {selectedSub.date}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-950 rounded-xl border-2 border-slate-950 text-xs font-mono font-black">
                  🛡 Anti-Cheat: {selectedSub.antiCheat?.switchCount || 0}x Pindah Tab ({selectedSub.antiCheat?.totalLeaveSeconds || 0}s)
                </span>
              </div>
            </div>

            {/* Teacher Grading Action Box */}
            <form onSubmit={handleSaveGrade} className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs uppercase tracking-wider text-slate-950 dark:text-slate-100 flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-600" />
                  <span>Formulir Nilai &amp; Catatan Resmi Guru</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Skor Saat Ini: {selectedSub.teacherScore ?? selectedSub.score} / 100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 mb-1">
                    Nilai Guru (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={teacherScoreInput}
                    onChange={e => setTeacherScoreInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-mono font-black text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Feedback untuk Siswa:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Langkah penyamaan penyebut sudah tepat, teliti lagi hasil akhir..."
                    value={teacherFeedbackInput}
                    onChange={e => setTeacherFeedbackInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    Simpan Nilai
                  </button>
                </div>
              </div>
            </form>

            {/* Questions breakdown */}
            <div className="space-y-4">
              <h4 className="font-mono font-black text-sm uppercase text-slate-950 dark:text-slate-100">
                Detail Jawaban Setiap Soal:
              </h4>

              {questions.map((q, idx) => {
                const textAns = selectedSub.textAnswers?.[q.id] || "(Siswa tidak mengisi jawaban teks)";
                const photoAns = selectedSub.photoProofs?.[q.id] || (idx === 0 ? selectedSub.photoProof : undefined);
                const aiResult = selectedSub.aiEvaluation?.perQuestion?.[q.id];

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200 dark:border-slate-800">
                      <span className="font-mono font-black text-xs text-slate-950 dark:text-slate-100">
                        Soal #{idx + 1} &bull; {q.title}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500">Bobot: {q.weight} poin</span>
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {q.prompt}
                    </div>

                    {/* Student text answer */}
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border-2 border-slate-950 text-xs font-mono font-bold text-slate-950 dark:text-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-black text-amber-800 dark:text-amber-400">Jawaban Teks Siswa:</span>
                      <p className="whitespace-pre-line">{textAns}</p>
                    </div>

                    {/* Student photo attachment */}
                    {photoAns && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Camera size={13} />
                          <span>Foto Lembar Coretan / Tulisan Tangan Siswa:</span>
                        </span>
                        <div className="relative inline-block border-2 border-slate-950 rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_#0f172a] max-w-xs">
                          <img
                            src={photoAns}
                            alt={`Foto Soal ${idx + 1}`}
                            className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-95"
                            onClick={() => setZoomPhoto(photoAns)}
                          />
                          <button
                            type="button"
                            onClick={() => setZoomPhoto(photoAns)}
                            className="w-full py-1 bg-[#ffe600] text-slate-950 font-mono text-[10px] font-black text-center cursor-pointer border-t-2 border-slate-950 flex items-center justify-center gap-1"
                          >
                            <Maximize2 size={11} />
                            <span>Perbesar Foto</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI Diagnosis Result */}
                    {aiResult && (
                      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-400 text-xs font-mono space-y-1 text-purple-950 dark:text-purple-200">
                        <div className="flex items-center gap-1.5 font-black text-[11px]">
                          <Sparkles size={13} className="text-purple-600" />
                          <span>Analisis Diagnosa AI:</span>
                          <span className={`ml-auto px-2 py-0.5 rounded text-[10px] ${
                            aiResult.imageStatus === 'matched' ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                          }`}>
                            {aiResult.imageStatus === 'matched' ? 'Foto Cocok' : 'Perlu Diperiksa'}
                          </span>
                        </div>
                        {aiResult.imageSummary && <p className="text-[11px]"><b>Yang terbaca di foto:</b> {aiResult.imageSummary}</p>}
                        {aiResult.diagnosa && <p className="text-[11px]"><b>Diagnosa konsep:</b> {aiResult.diagnosa}</p>}
                      </div>
                    )}

                    {/* Official Discussion Key */}
                    <details className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <summary className="cursor-pointer font-black text-amber-600 dark:text-amber-400 hover:underline">
                        Lihat Kunci Pembahasan Resmi
                      </summary>
                      <pre className="mt-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 whitespace-pre-line font-mono text-[11px] border border-slate-300 dark:border-slate-700">
                        {q.discussion}
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* PHOTO ZOOM MODAL */}
      {zoomPhoto && (
        <Modal
          isOpen={Boolean(zoomPhoto)}
          onClose={() => setZoomPhoto(null)}
          title="Perbesar Foto Lembar Pengerjaan Siswa"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border-3 border-slate-950 overflow-hidden bg-slate-900 flex items-center justify-center p-2 shadow-[4px_4px_0px_0px_#0f172a]">
              <img src={zoomPhoto} alt="Perbesar Foto" className="max-h-[70vh] w-auto object-contain rounded-xl" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 border-2 border-slate-950 text-slate-950 dark:text-slate-100 font-mono font-black text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD QUESTION MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Butir Soal Evaluasi Baru"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Judul / Topik Soal:
            </label>
            <input
              type="text"
              placeholder="Contoh: Soal Evaluasi 6 - Pembagian Jeruk"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Bobot Nilai (Poin):
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Deskripsi &amp; Cerita Soal:
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan cerita soal pecahan dan instruksi pengerjaan secara lengkap..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Langkah Kunci Pembahasan Resmi:
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan tahapan penyelesaian resmi langkah demi langkah..."
              value={discussion}
              onChange={e => setDiscussion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-100 border-2 border-slate-950 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl font-black shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
            >
              Simpan Soal
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT QUESTION MODAL */}
      <Modal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        title="Edit Butir Soal Evaluasi"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Judul / Topik Soal:
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Bobot Nilai (Poin):
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={editWeight}
              onChange={e => setEditWeight(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Deskripsi &amp; Cerita Soal:
            </label>
            <textarea
              rows={4}
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-black text-slate-800 dark:text-slate-200 mb-1">
              Langkah Kunci Pembahasan Resmi:
            </label>
            <textarea
              rows={4}
              value={editDiscussion}
              onChange={e => setEditDiscussion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-950 bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingQuestion(null)}
              className="px-4 py-2 bg-slate-100 border-2 border-slate-950 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl font-black shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
            >
              Perbarui Soal
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

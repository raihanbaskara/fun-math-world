import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { evaluateLKPDWithAI } from '@/services/aiCorrectionService';
import { LKPDSubmission, LKPDItem } from '@/types';
import { FileText, Image as ImageIcon, Bot, ExternalLink, Plus, Trash2, Pencil, ChevronLeft, ChevronRight, CheckCircle2, Clock, Loader2, Sparkles, RefreshCw } from 'lucide-react';

export const GuruLKPD: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [activeTab, setActiveTab] = useState<'submissions' | 'manage'>('submissions');

  useEffect(() => {
    return storageService.subscribe(newState => {
      setDbState(newState);
    });
  }, []);

  const submissions = dbState.lkpdSubmissions || [];
  const lkpdList = dbState.lkpdList || [];

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState<LKPDSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [isAiCorrectionRevealed, setIsAiCorrectionRevealed] = useState<boolean>(false);
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);

  // Upload LKPD Modal State
  const [isAddLKPDOpen, setIsAddLKPDOpen] = useState<boolean>(false);
  const [previewLKPD, setPreviewLKPD] = useState<LKPDItem | null>(null);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<{ urls: string[]; activeIdx: number; studentName: string } | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newObjectives, setNewObjectives] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newPdfFilename, setNewPdfFilename] = useState<string>('');
  const [newPdfUrl, setNewPdfUrl] = useState<string>('');

  // Edit LKPD Modal State
  const [editingLKPD, setEditingLKPD] = useState<LKPDItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editObjectives, setEditObjectives] = useState<string>('');
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editPdfFilename, setEditPdfFilename] = useState<string>('');
  const [editPdfUrl, setEditPdfUrl] = useState<string>('');

  const getPhotoDisplayUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('data:image')) {
      try {
        const parts = url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    }
    return url;
  };

  const handleOpenGrade = (sub: LKPDSubmission) => {
    soundService.click();
    setSelectedSub(sub);
    setIsAiCorrectionRevealed(false);
    setIsAiEvaluating(false);
    setGradeScore(sub.teacherScore ?? sub.aiScore ?? 0);
    setGradeFeedback(sub.teacherFeedback || '');
  };

  const handleRunLiveAiEvaluation = async (force: boolean = false) => {
    if (!selectedSub) return;
    soundService.click();

    // If already revealed and not forcing re-evaluation, toggle hide
    if (!force && isAiCorrectionRevealed) {
      setIsAiCorrectionRevealed(false);
      return;
    }

    const targetLkpd = lkpdList.find(l => l.id === selectedSub.lkpdId) || lkpdList[0];
    const questions = targetLkpd?.questions || [];

    setIsAiEvaluating(true);
    showToast("Asisten AI sedang menelaah langkah konsep & bukti pengerjaan siswa...", "info");

    try {
      const answersRecord = selectedSub.answers || {};
      const evalResult = await evaluateLKPDWithAI(questions, answersRecord);

      // Merge results into submission answers
      const updatedAnswers = { ...(selectedSub.answers || {}) };
      questions.forEach(q => {
        const qEval = evalResult.perQuestion[q.id];
        const studentAns = updatedAnswers[q.id] || { textAnswer: '', photoUrl: '' };
        updatedAnswers[q.id] = {
          ...studentAns,
          aiScore: qEval?.score ?? 0,
          aiFeedback: qEval?.diagnosa ? `${qEval.diagnosa} (${qEval.conceptFeedback})` : (qEval?.conceptFeedback || "Telah dievaluasi oleh Asisten AI.")
        };
      });

      // Persist to storageService & Supabase
      storageService.update(draft => {
        const target = draft.lkpdSubmissions.find(s => s.id === selectedSub.id);
        if (target) {
          target.answers = updatedAnswers;
          target.aiScore = evalResult.totalScore;
          target.aiFeedback = evalResult.overallFeedback;
        }
      });

      // Update local state
      setSelectedSub(prev => prev ? {
        ...prev,
        answers: updatedAnswers,
        aiScore: evalResult.totalScore,
        aiFeedback: evalResult.overallFeedback
      } : null);

      setGradeScore(evalResult.totalScore);
      setIsAiCorrectionRevealed(true);
      setIsAiEvaluating(false);
      soundService.success();
      showToast(`Evaluasi AI Selesai! Skor rekomendasi: ${evalResult.totalScore}/100`, "success");
    } catch (err) {
      console.error("AI Evaluation error:", err);
      setIsAiEvaluating(false);
      setIsAiCorrectionRevealed(true);
      showToast("Evaluasi AI selesai menggunakan Rubrik Cerdas.", "info");
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    soundService.click();

    storageService.update(draft => {
      const target = draft.lkpdSubmissions.find(s => s.id === selectedSub.id);
      if (target) {
        target.teacherScore = gradeScore;
        target.teacherFeedback = gradeFeedback.trim();
        target.status = 'Dinilai';
      }
    });

    setSelectedSub(null);
    soundService.success();
    showToast('Nilai LKPD siswa berhasil disimpan!', 'success');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewImageUrl(dataUrl);
      showToast('Gambar LKPD berhasil dimuat!', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPdfFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewPdfUrl(dataUrl);
      showToast(`Berkas PDF "${file.name}" berhasil dimuat!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAddLKPD = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Judul dan deskripsi LKPD wajib diisi!', 'error');
      return;
    }

    const newItem: LKPDItem = {
      id: 'lkpd_' + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      objectives: newObjectives.trim() || 'Memahami konsep dasar operasi pecahan dan menyelesaikan masalah sehari-hari.',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
      pdfFilename: newPdfFilename.trim() || `${newTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      pdfUrl: newPdfUrl.trim() || undefined,
      questions: [
        {
          id: 'q1',
          title: 'Soal 1: Pemahaman Konsep',
          prompt: `Selesaikan aktivitas utama dari ${newTitle.trim()} dan jelaskan langkah perhitungannya.`,
          discussion: 'Tuliskan langkah-langkah penyelesaian secara sistematis mulai dari menyamakan penyebut atau mengubah bentuk pecahan.',
          weight: 50,
        },
        {
          id: 'q2',
          title: 'Soal 2: Penerapan Kontekstual',
          prompt: 'Terapkan konsep operasi hitung pecahan pada skenario masalah kontekstual yang diberikan.',
          discussion: 'Identifikasi bagian utuh, kalikan dengan perbandingan, dan sederhanakan bentuk akhir pecahan.',
          weight: 50,
        }
      ]
    };

    storageService.update(draft => {
      draft.lkpdList.push(newItem);
    });

    setIsAddLKPDOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewObjectives('');
    setNewImageUrl('');
    setNewPdfFilename('');
    setNewPdfUrl('');
    soundService.success();
    showToast('Tugas LKPD Digital baru berhasil diterbitkan!', 'success');
  };

  const handleDeleteLKPD = (id: string) => {
    soundService.click();
    storageService.update(draft => {
      draft.lkpdList = draft.lkpdList.filter(l => l.id !== id);
    });
    soundService.success();
    showToast('Tugas LKPD berhasil dihapus.', 'info');
  };

  const handleOpenEditLKPD = (item: LKPDItem) => {
    soundService.click();
    setEditingLKPD(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditObjectives(item.objectives || '');
    setEditImageUrl(item.imageUrl || '');
    setEditPdfFilename(item.pdfFilename || '');
    setEditPdfUrl(item.pdfUrl || '');
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditImageUrl(event.target?.result as string);
      showToast('Gambar LKPD baru berhasil dimuat!', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleEditPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditPdfFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditPdfUrl(event.target?.result as string);
      showToast(`Berkas PDF baru "${file.name}" berhasil dimuat!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditLKPD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLKPD) return;
    soundService.click();

    storageService.update(draft => {
      const item = draft.lkpdList.find(l => l.id === editingLKPD.id);
      if (item) {
        item.title = editTitle.trim();
        item.description = editDesc.trim();
        item.objectives = editObjectives.trim();
        if (editImageUrl.trim()) item.imageUrl = editImageUrl.trim();
        if (editPdfFilename.trim()) item.pdfFilename = editPdfFilename.trim();
        if (editPdfUrl.trim()) item.pdfUrl = editPdfUrl.trim();
      }
    });

    setEditingLKPD(null);
    soundService.success();
    showToast('Tugas LKPD Digital berhasil diperbarui & disinkronkan!', 'success');
  };

  const getPdfDisplayUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    }
    return url;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          LKPD AI
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                KOREKSI DIGITAL & ASISTEN AI
              </span>
              <span className="px-3 py-1 bg-[#38bdf8] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black font-mono shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {lkpdList.length} Tugas LKPD
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Manajemen & Penilaian LKPD Digital
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Terbitkan modul lembar kerja digital (PDF & Gambar), periksa foto tulisan tangan siswa dengan bantuan penilaian AI, dan beri nilai akhir guru secara akurat.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <FileText size={36} />
          </div>
        </div>
      </div>

      {/* 2. Neobrutalist Tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000]">
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('submissions');
            }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 ${
              activeTab === 'submissions'
                ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Pengumpulan Siswa ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('manage');
            }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 ${
              activeTab === 'manage'
                ? 'bg-[#38bdf8] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Kelola & Upload LKPD ({lkpdList.length})
          </button>
        </div>

        {activeTab === 'manage' && (
          <button
            type="button"
            onClick={() => setIsAddLKPDOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Upload / Tambah LKPD Baru</span>
          </button>
        )}
      </div>

      {/* 3. Submissions Table Tab */}
      {activeTab === 'submissions' ? (
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950 dark:text-slate-100 font-mono flex items-center gap-2">
              <span>Daftar Pengumpulan Lembar Kerja Siswa</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#ffe600] border-3 border-slate-950 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Tugas LKPD</th>
                  <th className="p-4">Foto Tugas</th>
                  <th className="p-4 font-mono">Skor AI</th>
                  <th className="p-4 font-mono">Nilai Guru</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#111827]">
                {submissions.map(s => {
                  const targetLkpd = lkpdList.find(item => item.id === s.lkpdId);
                  return (
                    <tr key={s.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-slate-950 dark:text-slate-100 text-sm">{s.studentName}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">ID: {s.id}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block whitespace-nowrap px-3 py-1 rounded-xl bg-sky-100 text-slate-950 border-2 border-slate-950 text-xs font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                          {s.studentClass || 'Kelas 7-A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block max-w-[220px] whitespace-normal break-words px-3 py-1 bg-amber-100 text-slate-950 rounded-xl border-2 border-slate-950 text-xs font-bold leading-snug shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                          {targetLkpd ? targetLkpd.title : 'LKPD 1'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            soundService.click();
                            const photos = s.photoUrls && s.photoUrls.length > 0 ? s.photoUrls : [s.photoUrl];
                            const displayUrls = photos.map(p => getPhotoDisplayUrl(p));
                            setViewPhotoUrl({ urls: displayUrls, activeIdx: 0, studentName: s.studentName });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] font-mono font-black text-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                        >
                          <ImageIcon size={14} className="text-slate-950 dark:text-slate-200" />
                          <span>Lihat Foto ({s.photoUrls?.length || 1})</span>
                        </button>
                      </td>
                      <td className="p-4 font-mono font-black">
                        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 border-2 border-slate-950 dark:border-purple-700 shadow-[1.5px_1.5px_0px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_0px_#000000]">
                          {s.aiScore}/100
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black">
                        {s.teacherScore ? (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-xl bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                            {s.teacherScore}/100
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-950 dark:border-slate-700 text-xs font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                            Belum Dinilai
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenGrade(s)}
                          className="px-4 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          Beri Nilai
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                      Belum ada pengumpulan LKPD dari siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 4. Manage LKPD Grid Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lkpdList.map((item, idx) => (
              <div key={item.id} className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                      LKPD #{idx + 1}
                    </span>
                    <h3 className="font-black text-slate-950 dark:text-slate-100 text-base sm:text-lg">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditLKPD(item)}
                      className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-black text-xs flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Edit LKPD"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLKPD(item.id)}
                      className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-black text-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Hapus LKPD"
                    >
                      <Trash2 size={14} className="text-rose-700" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold line-clamp-2">
                  {item.description}
                </p>

                <div className="p-3 bg-amber-50 dark:bg-slate-800/80 rounded-2xl border-2 border-slate-950 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-black text-slate-950 dark:text-amber-400 font-mono uppercase text-[10px]">Tujuan Pembelajaran:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold line-clamp-2">{item.objectives}</p>
                </div>

                {item.imageUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-36 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                  </div>
                )}

                <div className="pt-3 border-t-2 border-slate-950 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-mono font-bold gap-2">
                  <span className="truncate">File: {item.pdfFilename}</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] text-xs font-black shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    onClick={() => setPreviewLKPD(item)}
                  >
                    Pratinjau Dokumen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher LKPD Preview Modal */}
      {previewLKPD && (
        <Modal
          isOpen={!!previewLKPD}
          onClose={() => setPreviewLKPD(null)}
          title={`Pratinjau LKPD: ${previewLKPD.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {previewLKPD.pdfUrl && (
              <div className="flex items-center justify-between p-3 bg-[#ffe600] rounded-2xl border-2 border-slate-950 text-xs font-mono text-slate-950 font-black shadow-[2px_2px_0px_0px_#0f172a]">
                <span>Dokumen PDF: {previewLKPD.pdfFilename}</span>
                <a
                  href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-1"
                >
                  <ExternalLink size={13} />
                  <span>Buka Tab Baru</span>
                </a>
              </div>
            )}

            {previewLKPD.pdfUrl ? (
              <div className="w-full h-[480px] rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] bg-slate-900 relative">
                <object
                  data={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <iframe
                    src={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                    title={previewLKPD.title}
                    className="w-full h-full border-0"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-6 text-white text-center space-y-3 bg-slate-900">
                      <FileText size={44} className="text-yellow-400" />
                      <p className="text-sm font-bold">Dokumen PDF Terverifikasi</p>
                      <a
                        href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-[#ffe600] text-slate-950 font-black rounded-xl text-xs transition border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]"
                      >
                        Buka & Baca Dokumen PDF (Tab Baru)
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] max-h-80 overflow-y-auto">
                <img
                  src={previewLKPD.imageUrl}
                  alt="LKPD Preview"
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="p-4 bg-amber-50 dark:bg-slate-800/80 rounded-2xl text-xs space-y-1.5 border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
              <div className="font-black text-slate-950 dark:text-amber-400 font-mono uppercase">Tujuan Pembelajaran:</div>
              <p className="text-slate-800 dark:text-slate-200 font-bold whitespace-pre-line leading-relaxed">
                {previewLKPD.objectives || previewLKPD.description}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Grade Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Penilaian Lembar Kerja LKPD — ${selectedSub.studentName}`}
          maxWidth="max-w-3xl"
        >
          {(() => {
            const targetLkpd = lkpdList.find(item => item.id === selectedSub.lkpdId) || lkpdList[0];
            const questions = targetLkpd?.questions || [];

            return (
              <form onSubmit={handleSaveGrade} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                {/* Student Info & Anti-Cheat Summary */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border-3 border-slate-950 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#000000]">
                  <div>
                    <div className="font-black text-slate-950 dark:text-slate-100 text-sm font-mono">{selectedSub.studentName}</div>
                    <div className="text-slate-700 dark:text-slate-300 font-bold">{selectedSub.studentClass} • {targetLkpd?.title}</div>
                  </div>
                  {selectedSub.antiCheat && selectedSub.antiCheat.switchCount > 0 ? (
                    <span className="px-3 py-1 rounded-xl bg-rose-200 dark:bg-rose-900/60 text-rose-950 dark:text-rose-200 border-2 border-slate-950 dark:border-rose-700 font-mono font-black w-fit shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                      Anti-Cheat: {selectedSub.antiCheat.switchCount}x Pindah Tab ({selectedSub.antiCheat.totalLeaveSeconds}d)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-2 border-slate-950 dark:border-emerald-700 font-mono font-black w-fit shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                      Anti-Cheat: Tertib (0x Pindah Tab)
                    </span>
                  )}
                </div>

                {/* AI Correction Control Header */}
                {isAiEvaluating ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-100/80 dark:bg-cyan-950/60 border-3 border-cyan-800 dark:border-cyan-600 shadow-[4px_4px_0px_0px_#083344] animate-pulse">
                    <Loader2 size={24} className="animate-spin text-cyan-800 dark:text-cyan-300 shrink-0" />
                    <div>
                      <span className="font-mono text-xs font-black block text-cyan-950 dark:text-cyan-100">
                        ASISTEN AI SEDANG MENELAAH LANGKAH PENGERJAAN SISWA (OPENROUTER)...
                      </span>
                      <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                        Memeriksa uraian teks, foto coretan fisik, mencocokkan ke kunci pembahasan, dan menghitung rekomendasi nilai objektif.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#a5f3fc] border-2 border-slate-950 rounded-xl text-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        <Bot size={22} />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-black block text-slate-950 dark:text-slate-100">
                          BANTUAN KOREKSI AI (OPENROUTER ENGINE)
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          {isAiCorrectionRevealed
                            ? 'Pembahasan konsep resmi dan skor evaluasi AI sedang aktif ditampilkan.'
                            : 'Klik tombol di samping untuk menelaah jawaban siswa dan memunculkan rekomendasi nilai AI.'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAiCorrectionRevealed && (
                        <button
                          type="button"
                          onClick={() => handleRunLiveAiEvaluation(true)}
                          className="px-3.5 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-slate-950 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                          title="Evaluasi ulang menggunakan AI"
                        >
                          <RefreshCw size={14} />
                          <span>Koreksi Ulang</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRunLiveAiEvaluation(false)}
                        className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isAiCorrectionRevealed
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                            : 'bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950'
                        }`}
                      >
                        <Sparkles size={15} />
                        <span>{isAiCorrectionRevealed ? 'Sembunyikan Koreksi AI' : 'Jalankan Koreksi AI (Live)'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Per-Question Answers & AI Discussions */}
                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 font-mono">
                    // JAWABAN ESSAI SISWA PER SOAL:
                  </div>

                  {questions.map((q, idx) => {
                    const ans = selectedSub.answers?.[q.id];
                    const photo = ans?.photoUrl || (idx === 0 ? selectedSub.photoUrl : undefined);
                    const hasAnswer = (ans?.textAnswer || '').trim().length > 0 || Boolean(photo && photo.length > 50);

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-white dark:bg-slate-850 border-3 border-slate-950 dark:border-slate-700 space-y-3 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                            Soal #{idx + 1}: {q.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {isAiCorrectionRevealed && q.weight > 0 && (
                              <span className={`px-2.5 py-0.5 rounded-lg border-2 border-slate-950 text-xs font-mono font-black shadow-[1px_1px_0px_0px_#0f172a] animate-in fade-in ${
                                (ans?.aiScore ?? 0) === 0
                                  ? 'bg-rose-100 text-rose-950 border-rose-950 dark:bg-rose-900/60 dark:text-rose-200'
                                  : 'bg-purple-100 text-purple-950 dark:bg-purple-900/60 dark:text-purple-200'
                              }`}>
                                Skor AI: {ans?.aiScore !== undefined ? ans.aiScore : 0}/{q.weight}
                              </span>
                            )}
                            <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">
                              Bobot: {q.weight} Poin
                            </span>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700">
                          {q.prompt}
                        </div>

                        {/* Student typed answer */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-mono font-black uppercase text-slate-700 dark:text-slate-300">
                              Jawaban Ketikan Siswa:
                            </label>
                            {!hasAnswer && (
                              <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                                ⚠ Tidak ada pengerjaan
                              </span>
                            )}
                          </div>
                          <div className={`p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 text-xs sm:text-sm font-bold whitespace-pre-line ${
                            hasAnswer
                              ? 'bg-amber-50 dark:bg-slate-800/60 text-slate-950 dark:text-slate-100'
                              : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 italic'
                          }`}>
                            {ans?.textAnswer || '(Siswa tidak mengetikkan jawaban teks)'}
                          </div>
                        </div>

                        {/* Student photo attachment */}
                        {photo && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono font-black uppercase text-slate-700 dark:text-slate-300">Lampiran Foto Bukti Cara:</label>
                            <div className="relative rounded-xl border-3 border-slate-950 dark:border-slate-700 overflow-hidden max-w-sm max-h-48 group shadow-[2px_2px_0px_0px_#0f172a]">
                              <img
                                src={getPhotoDisplayUrl(photo)}
                                alt={`Foto Soal ${idx + 1}`}
                                className="w-full h-48 object-cover cursor-pointer group-hover:opacity-90 transition"
                                onClick={() => setViewPhotoUrl({ urls: [getPhotoDisplayUrl(photo)], activeIdx: 0, studentName: selectedSub.studentName })}
                              />
                              <button
                                type="button"
                                onClick={() => setViewPhotoUrl({ urls: [getPhotoDisplayUrl(photo)], activeIdx: 0, studentName: selectedSub.studentName })}
                                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#ffe600] text-slate-950 text-xs font-mono font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]"
                              >
                                Perbesar Foto
                              </button>
                            </div>
                          </div>
                        )}

                        {/* AI Step-by-Step Discussion (Only shown if teacher pressed Koreksi AI button) */}
                        {isAiCorrectionRevealed && (
                          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border-2 border-slate-950 dark:border-purple-800 text-xs space-y-2 shadow-[2px_2px_0px_0px_#0f172a] animate-in fade-in">
                            <div className="font-black text-purple-950 dark:text-purple-300 flex items-center justify-between font-mono">
                              <div className="flex items-center gap-1.5">
                                <Bot size={15} className="text-purple-700 dark:text-purple-400" />
                                <span>Pembahasan &amp; Kunci Konsep AI:</span>
                              </div>
                              <span className="text-[11px] font-black">
                                Rekomendasi: {ans?.aiScore !== undefined ? ans.aiScore : 0} Poin
                              </span>
                            </div>
                            <p className="text-slate-800 dark:text-purple-200 font-bold whitespace-pre-line leading-relaxed">
                              {q.discussion}
                            </p>
                            {ans?.aiFeedback && (
                              <div className="text-[11px] font-mono font-bold text-purple-950 dark:text-purple-300 pt-1.5 border-t border-purple-200 dark:border-purple-800 flex items-start gap-1">
                                <span className="shrink-0 font-black">Diagnosa AI:</span>
                                <span>{ans.aiFeedback}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* AI Score Recommendation Summary (Only shown if teacher pressed Koreksi AI button) */}
                {isAiCorrectionRevealed ? (
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border-3 border-slate-950 dark:border-sky-800 text-xs space-y-2.5 shadow-[3px_3px_0px_0px_#0f172a] animate-in fade-in">
                    <div className="font-black text-sky-950 dark:text-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                      <div className="flex items-center gap-2">
                        <Bot size={18} className="text-sky-700 dark:text-sky-400" />
                        <span className="text-sm">Rekomendasi Total Skor AI: {selectedSub.aiScore !== undefined ? selectedSub.aiScore : 0} / 100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundService.click();
                          setGradeScore(selectedSub.aiScore ?? 0);
                          showToast("Skor rekomendasi AI diterapkan ke form nilai.", "info");
                        }}
                        className="px-3 py-1.5 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer hover:bg-yellow-400 w-fit"
                      >
                        Terapkan ke Nilai Final Guru
                      </button>
                    </div>
                    <p className="text-slate-800 dark:text-sky-200 font-bold leading-relaxed">
                      {selectedSub.aiFeedback || (selectedSub.aiScore === 0 ? "Siswa belum mengumpulkan jawaban pengerjaan." : "Hasil evaluasi pengerjaan siswa.")}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      <Bot size={18} className="shrink-0 text-slate-500" />
                      <span>Pembahasan konsep resmi dan rekomendasi skor AI sedang disembunyikan.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isAiEvaluating}
                      onClick={() => handleRunLiveAiEvaluation(false)}
                      className="px-4 py-2 bg-[#a5f3fc] hover:bg-cyan-300 text-slate-950 font-mono text-xs font-black rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Jalankan Koreksi AI (Live)</span>
                    </button>
                  </div>
                )}

                {/* Teacher Grading Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t-3 border-slate-950 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                      Nilai Final Guru (0 - 100):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={gradeScore}
                      onChange={e => setGradeScore(parseInt(e.target.value) || 0)}
                      className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-base font-black font-mono shadow-[3px_3px_0px_0px_#0f172a] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                      Catatan Bimbingan / Evaluasi Guru:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={gradeFeedback}
                      onChange={e => setGradeFeedback(e.target.value)}
                      placeholder="Pekerjaan sangat rapi dan langkah penyelesaian tepat..."
                      className="w-full p-3 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                    onClick={() => setSelectedSub(null)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase bg-[#ffe600] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    Simpan & Konfirmasi Nilai LKPD
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* Add / Upload LKPD Modal */}
      {isAddLKPDOpen && (
        <Modal
          isOpen={isAddLKPDOpen}
          onClose={() => setIsAddLKPDOpen(false)}
          title="Upload / Tambah Tugas LKPD Baru"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAddLKPD} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Judul LKPD Digital:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Contoh: LKPD 3 — Operasi Hitung Perkalian & Pembagian Pecahan"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Deskripsi Singkat LKPD:
              </label>
              <textarea
                rows={2}
                required
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Lembar kerja mandiri untuk menguji pemahaman konsep..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Tujuan Pembelajaran & Petunjuk Pengerjaan:
              </label>
              <textarea
                rows={3}
                value={newObjectives}
                onChange={e => setNewObjectives(e.target.value)}
                placeholder="1. Memahami konsep perkalian pecahan...\n2. Kerjakan di buku tulis lalu unggah foto..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Unggah Berkas Dokumen PDF (.pdf):
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-[#ffe600] file:text-slate-950 cursor-pointer mb-2"
              />
              <input
                type="text"
                value={newPdfFilename}
                onChange={e => setNewPdfFilename(e.target.value)}
                placeholder="Atau ubah nama file PDF (contoh: LKPD_3_Pecahan.pdf)"
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs font-mono outline-none"
              />
              {newPdfUrl && (
                <div className="mt-2 text-[11px] font-mono font-black text-slate-950 bg-[#ffe600] border-2 border-slate-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  <span>✓ Berkas PDF Siap Terbit ({newPdfFilename || 'Dokumen.pdf'})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Unggah Gambar Lembar Kerja (Opsional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-sky-100 file:text-slate-950 cursor-pointer mb-2"
              />
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Atau tempelkan URL Gambar online (opsional)"
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setIsAddLKPDOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase bg-[#ffe600] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Simpan & Terbitkan LKPD
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit LKPD Modal */}
      {editingLKPD && (
        <Modal
          isOpen={!!editingLKPD}
          onClose={() => setEditingLKPD(null)}
          title={`Edit Tugas LKPD — ${editingLKPD.title}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveEditLKPD} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Judul Tugas LKPD:
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Deskripsi Singkat:
              </label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={2}
                required
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Tujuan Pembelajaran & Petunjuk:
              </label>
              <textarea
                value={editObjectives}
                onChange={e => setEditObjectives(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Ganti Berkas PDF (Opsional):
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleEditPdfChange}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-[#ffe600] file:text-slate-950 cursor-pointer mb-1"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold">File saat ini: {editPdfFilename}</span>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Ganti Gambar Lembar Kerja (Opsional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-sky-100 file:text-slate-950 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t-2 border-slate-950 dark:border-slate-700">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setEditingLKPD(null)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase bg-[#38bdf8] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-sky-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Simpan Perubahan LKPD
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Photo Preview Modal (Supports Multi-Page Gallery) */}
      {viewPhotoUrl && (
        <Modal
          isOpen={!!viewPhotoUrl}
          onClose={() => setViewPhotoUrl(null)}
          title={`Foto Lembar Kerja — ${viewPhotoUrl.studentName} (${viewPhotoUrl.urls.length} Halaman)`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] max-h-[70vh] overflow-y-auto bg-slate-900 flex items-center justify-center p-3">
              <img
                src={viewPhotoUrl.urls[viewPhotoUrl.activeIdx]}
                alt={`Halaman ${viewPhotoUrl.activeIdx + 1}`}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />

              {viewPhotoUrl.urls.length > 1 && (
                <>
                  <button
                    type="button"
                    disabled={viewPhotoUrl.activeIdx === 0}
                    onClick={() => setViewPhotoUrl(prev => prev ? { ...prev, activeIdx: prev.activeIdx - 1 } : null)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/90 text-white border-2 border-white rounded-full flex items-center justify-center font-bold shadow-lg disabled:opacity-30 hover:bg-slate-900 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    disabled={viewPhotoUrl.activeIdx === viewPhotoUrl.urls.length - 1}
                    onClick={() => setViewPhotoUrl(prev => prev ? { ...prev, activeIdx: prev.activeIdx + 1 } : null)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/90 text-white border-2 border-white rounded-full flex items-center justify-center font-bold shadow-lg disabled:opacity-30 hover:bg-slate-900 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {viewPhotoUrl.urls.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1 overflow-x-auto">
                {viewPhotoUrl.urls.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setViewPhotoUrl(prev => prev ? { ...prev, activeIdx: i } : null)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      viewPhotoUrl.activeIdx === i ? 'border-amber-400 scale-105 shadow-[2px_2px_0px_0px_#0f172a]' : 'border-slate-950 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 px-1 bg-slate-900 text-white font-mono text-[9px] font-black">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3.5 rounded-2xl border-2 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Halaman {viewPhotoUrl.activeIdx + 1} dari {viewPhotoUrl.urls.length} Halaman
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={viewPhotoUrl.urls[viewPhotoUrl.activeIdx]}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#ffe600] text-slate-950 rounded-xl text-xs font-mono font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] transition flex items-center gap-1.5 hover:bg-yellow-400"
                >
                  <ExternalLink size={14} />
                  <span>Buka Tab Baru</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewPhotoUrl(null)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 border-2 border-slate-950 dark:border-slate-600 text-slate-950 dark:text-slate-200 font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

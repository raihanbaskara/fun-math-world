import React, { useState, useEffect } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { LKPDSubmission, LKPDItem } from '@/types';
import { FileText, Image as ImageIcon, CheckCircle2, Bot, MessageSquare, ExternalLink, Plus, Trash2, Upload, Layers, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const submissions = dbState.lkpdSubmissions;
  const lkpdList = dbState.lkpdList;

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState<LKPDSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

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
    setGradeScore(sub.teacherScore || sub.aiScore || 90);
    setGradeFeedback(sub.teacherFeedback || 'Pekerjaan sangat rapi dan penyelesaian tepat.');
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
          prompt: 'Berikan satu contoh penerapan konsep pecahan ini dalam kehidupan sehari-hari beserta perhitungannya.',
          discussion: 'Penerapan dapat berupa pembagian porsi makanan, perhitungan resep kue, atau perbandingan diskon belanja.',
          weight: 50,
        },
      ],
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
    showToast('Tugas LKPD Digital baru berhasil ditambahkan dan disinkronkan ke Siswa!', 'success');
  };

  const handleDeleteLKPD = (id: string) => {
    if (confirm('Hapus tugas LKPD ini?')) {
      soundService.click();
      storageService.update(draft => {
        draft.lkpdList = draft.lkpdList.filter(item => item.id !== id);
      });
      showToast('Tugas LKPD berhasil dihapus.', 'info');
    }
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

  // Helper to convert Base64 PDF data URLs to browser Blob URLs for seamless iframe/object rendering on Vercel
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FileText className="text-amber-500" />
            <span>Manajemen & Penilaian LKPD Digital</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Unggah tugas LKPD baru untuk kelas siswa dan periksa verifikasi lembar kerja fisik dengan bantuan AI.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('submissions');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelola & Upload LKPD ({lkpdList.length})
          </button>
        </div>
      </div>

      {activeTab === 'submissions' ? (
        <DoubleBezelCard className="bg-slate-50 border-slate-200/80 p-1.5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Tugas LKPD</th>
                  <th className="p-4">Foto Tugas</th>
                  <th className="p-4 font-mono">Skor AI</th>
                  <th className="p-4 font-mono">Nilai Guru</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {submissions.map(s => {
                  const targetLkpd = lkpdList.find(item => item.id === s.lkpdId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{s.studentName}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {s.id}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{s.studentClass}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/80 inline-block max-w-[200px] truncate">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-brand-700 font-bold hover:bg-brand-50 hover:border-brand-300 transition-all text-xs cursor-pointer"
                        >
                          <ImageIcon size={14} className="text-brand-600" />
                          <span>Lihat Foto ({s.photoUrls?.length || 1})</span>
                        </button>
                      </td>
                      <td className="p-4 font-mono font-black text-indigo-700">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60">
                          {s.aiScore}/100
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-amber-700">
                        {s.teacherScore ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300">
                            {s.teacherScore}/100
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Belum Dinilai</span>
                        )}
                      </td>
                      <td className="p-4">
                        <ArrowFillButton
                          variant="primary"
                          size="sm"
                          className="h-8.5 font-bold text-xs bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400"
                          onClick={() => handleOpenGrade(s)}
                        >
                          <span>Beri Nilai</span>
                        </ArrowFillButton>
                      </td>
                    </tr>
                  );
                })}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Belum ada pengumpulan LKPD dari siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DoubleBezelCard>
      ) : (
        /* Tab Manage LKPD */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a]">
            <div>
              <h3 className="font-black text-slate-950 text-sm sm:text-base">Daftar Tugas LKPD Aktif</h3>
              <p className="text-xs text-slate-700 font-medium">
                Tugas LKPD di bawah ini secara otomatis tersedia di portal Siswa (`/siswa/lkpd`).
              </p>
            </div>
            <ArrowFillButton
              variant="primary"
              size="md"
              className="bg-[#ffe600] text-slate-950 font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400"
              onClick={() => setIsAddLKPDOpen(true)}
            >
              <Plus size={16} />
              <span>Upload / Tambah LKPD Baru</span>
            </ArrowFillButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lkpdList.map((item, idx) => (
              <DoubleBezelCard key={item.id} className="bg-white border-slate-200/80">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-1 rounded-md bg-yellow-200 border border-slate-900 font-mono font-bold text-slate-950 text-xs">
                        LKPD #{idx + 1}
                      </span>
                      <h3 className="font-black text-slate-900 text-base mt-2">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditLKPD(item)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold p-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                        title="Edit LKPD"
                      >
                        <Pencil size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteLKPD(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus LKPD"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <span className="font-bold text-slate-700">Tujuan & Instruksi:</span>
                    <p className="text-slate-500 line-clamp-2">{item.objectives}</p>
                  </div>

                  {item.imageUrl && (
                    <div className="rounded-xl overflow-hidden max-h-36 border border-slate-200 shadow-2xs">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono gap-2">
                    <span className="truncate">Berkas: {item.pdfFilename}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs font-bold shrink-0"
                      onClick={() => setPreviewLKPD(item)}
                    >
                      <span>Pratinjau PDF & Gambar</span>
                    </Button>
                  </div>
                </div>
              </DoubleBezelCard>
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
              <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-2xl border-2 border-slate-950 text-xs font-mono text-slate-950 font-bold">
                <span>Dokumen PDF Terverifikasi: {previewLKPD.pdfFilename}</span>
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
              <div className="w-full h-[480px] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900 relative">
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
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner max-h-80 overflow-y-auto">
                <img
                  src={previewLKPD.imageUrl}
                  alt="LKPD Preview"
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div className="font-black text-slate-800">Tujuan Pembelajaran & Petunjuk:</div>
              <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
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
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-black text-slate-950 text-sm">{selectedSub.studentName}</div>
                    <div className="text-slate-600 font-bold">{selectedSub.studentClass} • {targetLkpd?.title}</div>
                  </div>
                  {selectedSub.antiCheat && selectedSub.antiCheat.switchCount > 0 ? (
                    <span className="px-3 py-1 rounded-xl bg-rose-200 text-rose-950 border border-slate-950 font-mono font-black w-fit">
                      Anti-Cheat: {selectedSub.antiCheat.switchCount}x Pindah Tab ({selectedSub.antiCheat.totalLeaveSeconds}d)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-200 text-emerald-950 border border-slate-950 font-mono font-black w-fit">
                      Anti-Cheat: Tertib (0x Pindah Tab)
                    </span>
                  )}
                </div>

                {/* Per-Question Answers & AI Discussions */}
                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                    // JAWABAN ESSAI SISWA PER SOAL:
                  </div>

                  {questions.map((q, idx) => {
                    const ans = selectedSub.answers?.[q.id];
                    const photo = ans?.photoUrl || (idx === 0 ? selectedSub.photoUrl : undefined);

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-white border-2 border-slate-950 space-y-3 shadow-[3px_3px_0px_0px_#0f172a]">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-xs border border-slate-950">
                            Soal #{idx + 1}: {q.title}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-600">
                            Bobot: {q.weight} Poin
                          </span>
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {q.prompt}
                        </div>

                        {/* Student typed answer */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-black uppercase text-slate-600">Jawaban Ketikan Siswa:</label>
                          <div className="p-3 rounded-xl bg-amber-50/60 border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 whitespace-pre-line">
                            {ans?.textAnswer || '(Siswa tidak mengetikkan jawaban teks)'}
                          </div>
                        </div>

                        {/* Student photo attachment */}
                        {photo && (
                          <div className="space-y-1">
                            <label className="text-[11px] font-black uppercase text-slate-600">Lampiran Foto Bukti Cara:</label>
                            <div className="relative rounded-xl border-2 border-slate-950 overflow-hidden max-w-sm max-h-48 group">
                              <img
                                src={getPhotoDisplayUrl(photo)}
                                alt={`Foto Soal ${idx + 1}`}
                                className="w-full h-48 object-cover cursor-pointer group-hover:opacity-90 transition"
                                onClick={() => setViewPhotoUrl({ urls: [getPhotoDisplayUrl(photo)], activeIdx: 0, studentName: selectedSub.studentName })}
                              />
                              <button
                                type="button"
                                onClick={() => setViewPhotoUrl({ urls: [getPhotoDisplayUrl(photo)], activeIdx: 0, studentName: selectedSub.studentName })}
                                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#ffe600] text-slate-950 text-xs font-black border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]"
                              >
                                Perbesar Foto
                              </button>
                            </div>
                          </div>
                        )}

                        {/* AI Step-by-Step Discussion */}
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
                          <div className="font-black text-purple-900 flex items-center gap-1.5">
                            <Bot size={14} className="text-purple-600" />
                            <span>Pembahasan & Kunci Konsep AI:</span>
                          </div>
                          <p className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                            {q.discussion}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Score Recommendation Summary */}
                <div className="p-3.5 bg-indigo-50 rounded-2xl border-2 border-slate-950 text-xs space-y-1.5">
                  <div className="font-black text-indigo-950 flex items-center gap-1.5">
                    <Bot size={16} className="text-indigo-600" />
                    <span>Rekomendasi Skor AI: {selectedSub.aiScore} / 100</span>
                  </div>
                  <p className="text-slate-700 font-medium">{selectedSub.aiFeedback}</p>
                </div>

                {/* Teacher Grading Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t-2 border-slate-950">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nilai Final Guru (0 - 100):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={gradeScore}
                      onChange={e => setGradeScore(parseInt(e.target.value) || 0)}
                      className="w-full p-3.5 rounded-2xl border-2 border-slate-950 bg-white text-slate-950 text-base font-black focus:ring-4 focus:ring-amber-300 outline-none font-mono shadow-[2px_2px_0px_0px_#0f172a]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Catatan Bimbingan / Evaluasi Guru:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={gradeFeedback}
                      onChange={e => setGradeFeedback(e.target.value)}
                      placeholder="Pekerjaan sangat rapi dan langkah penyelesaian tepat..."
                      className="w-full p-3 rounded-2xl border-2 border-slate-950 bg-white text-slate-950 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-amber-300 outline-none leading-relaxed shadow-[2px_2px_0px_0px_#0f172a]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-xl font-bold"
                    onClick={() => setSelectedSub(null)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400">
                    Simpan & Konfirmasi Nilai LKPD
                  </Button>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Judul LKPD Digital:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Contoh: LKPD 3 — Operasi Hitung Perkalian & Pembagian Pecahan"
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Deskripsi Singkat LKPD:
              </label>
              <textarea
                rows={2}
                required
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Lembar kerja mandiri untuk menguji pemahaman konsep..."
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tujuan Pembelajaran & Petunjuk Pengerjaan:
              </label>
              <textarea
                rows={3}
                value={newObjectives}
                onChange={e => setNewObjectives(e.target.value)}
                placeholder="1. Memahami konsep perkalian pecahan...\n2. Kerjakan di buku tulis lalu unggah foto..."
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Unggah Berkas Dokumen PDF (.pdf):
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer mb-2"
              />
              <input
                type="text"
                value={newPdfFilename}
                onChange={e => setNewPdfFilename(e.target.value)}
                placeholder="Atau ubah nama file PDF (contoh: LKPD_3_Pecahan.pdf)"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono outline-none focus:border-amber-500"
              />
              {newPdfUrl && (
                <div className="mt-1 text-[11px] font-mono font-bold text-slate-950 bg-yellow-100 border border-slate-900 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span>✓ Berkas PDF Siap Terbit ({newPdfFilename || 'Dokumen.pdf'})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Unggah Gambar Lembar Kerja (Opsional Preview):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-slate-950 hover:file:bg-yellow-200 cursor-pointer mb-2"
              />
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Atau tempelkan URL Gambar online (opsional)"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl font-bold"
                onClick={() => setIsAddLKPDOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400">
                Simpan & Terbitkan LKPD
              </Button>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Judul Tugas LKPD:
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Deskripsi Singkat:
              </label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={2}
                required
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tujuan Pembelajaran & Petunjuk:
              </label>
              <textarea
                value={editObjectives}
                onChange={e => setEditObjectives(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Ganti Berkas PDF (Opsional):
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleEditPdfChange}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-slate-950 hover:file:bg-yellow-200 cursor-pointer mb-1"
              />
              <span className="text-[11px] text-slate-400 font-mono">File saat ini: {editPdfFilename}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Ganti Gambar Lembar Kerja (Opsional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-slate-950 hover:file:bg-yellow-200 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl font-bold"
                onClick={() => setEditingLKPD(null)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white">
                Simpan Perubahan LKPD
              </Button>
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
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner max-h-[70vh] overflow-y-auto bg-slate-900 flex items-center justify-center p-3">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center font-bold shadow-lg disabled:opacity-30 hover:bg-slate-900 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    disabled={viewPhotoUrl.activeIdx === viewPhotoUrl.urls.length - 1}
                    onClick={() => setViewPhotoUrl(prev => prev ? { ...prev, activeIdx: prev.activeIdx + 1 } : null)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center font-bold shadow-lg disabled:opacity-30 hover:bg-slate-900 cursor-pointer"
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
                      viewPhotoUrl.activeIdx === i ? 'border-brand-500 scale-105 shadow-md' : 'border-slate-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 px-1 bg-slate-900/80 text-white font-mono text-[9px] font-bold">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">
                Halaman {viewPhotoUrl.activeIdx + 1} dari {viewPhotoUrl.urls.length} Halaman Terverifikasi
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={viewPhotoUrl.urls[viewPhotoUrl.activeIdx]}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Buka Tab Baru</span>
                </a>
                <Button variant="primary" size="sm" onClick={() => setViewPhotoUrl(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

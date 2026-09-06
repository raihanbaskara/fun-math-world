import React, { useState, useEffect } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { LKPDSubmission, LKPDItem } from '@/types';
import { FileText, Image as ImageIcon, CheckCircle2, Bot, MessageSquare, ExternalLink, Plus, Trash2, Upload, Layers } from 'lucide-react';

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
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newObjectives, setNewObjectives] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newPdfFilename, setNewPdfFilename] = useState<string>('');
  const [newPdfUrl, setNewPdfUrl] = useState<string>('');

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
            <FileText className="text-emerald-600" />
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
                        <a
                          href={s.photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-brand-700 font-bold hover:bg-brand-50 hover:border-brand-300 transition-all text-xs"
                        >
                          <ImageIcon size={14} className="text-brand-600" />
                          <span>Lihat Foto</span>
                          <ExternalLink size={12} className="text-slate-400" />
                        </a>
                      </td>
                      <td className="p-4 font-mono font-black text-indigo-700">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60">
                          {s.aiScore}/100
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-emerald-700">
                        {s.teacherScore ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60">
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
                          className="h-8.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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
          <div className="flex justify-between items-center bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80">
            <div>
              <h3 className="font-black text-emerald-950 text-sm sm:text-base">Daftar Tugas LKPD Aktif</h3>
              <p className="text-xs text-emerald-800 font-medium">
                Tugas LKPD di bawah ini secara otomatis tersedia di portal Siswa (`/siswa/lkpd`).
              </p>
            </div>
            <ArrowFillButton
              variant="primary"
              size="md"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 font-mono font-bold text-emerald-700 text-xs">
                        LKPD #{idx + 1}
                      </span>
                      <h3 className="font-black text-slate-900 text-base mt-2">{item.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteLKPD(item.id)}
                      className="text-red-500 hover:text-red-700 font-bold p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus LKPD"
                    >
                      <Trash2 size={16} />
                    </button>
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
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono text-emerald-900 font-bold">
                <span>📄 Dokumen PDF Terverifikasi: {previewLKPD.pdfFilename}</span>
                <a
                  href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1"
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
                      <FileText size={44} className="text-emerald-400" />
                      <p className="text-sm font-bold">Dokumen PDF Terverifikasi</p>
                      <a
                        href={getPdfDisplayUrl(previewLKPD.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition"
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
          title={`Penilaian LKPD — ${selectedSub.studentName}`}
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 text-xs space-y-1">
              <div className="font-black text-indigo-900 flex items-center gap-1.5">
                <Bot size={16} className="text-indigo-600" />
                <span>Rekomendasi Skor AI: {selectedSub.aiScore} / 100</span>
              </div>
              <p className="text-slate-600 font-medium">{selectedSub.aiFeedback}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Nilai Final Guru (0 - 100):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={gradeScore}
                onChange={e => setGradeScore(parseInt(e.target.value) || 0)}
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Catatan Bimbingan / Evaluasi Guru:
              </label>
              <textarea
                rows={3}
                required
                value={gradeFeedback}
                onChange={e => setGradeFeedback(e.target.value)}
                placeholder="Pekerjaan sangat rapi dan langkah penyelesaian tepat..."
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
              />
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
              <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan & Konfirmasi Nilai
              </Button>
            </div>
          </form>
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
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none"
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
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none"
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
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none"
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
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono outline-none focus:border-emerald-500"
              />
              {newPdfUrl && (
                <div className="mt-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
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
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer mb-2"
              />
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Atau tempelkan URL Gambar online (opsional)"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-emerald-500"
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
              <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white">
                Simpan & Terbitkan LKPD
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

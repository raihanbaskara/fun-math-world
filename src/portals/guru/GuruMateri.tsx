import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { BookOpen, Video, Plus, Trash2, Clock, FileText } from 'lucide-react';

function formatYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  return trimmed;
}

export const GuruMateri: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [db, setDb] = useState(storageService.getState());
  const [activeTab, setActiveTab] = useState<'materi' | 'video'>('materi');

  // Materi state
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialBadge, setMaterialBadge] = useState('Operasi Hitung');
  const [materialContent, setMaterialContent] = useState('');
  const [materialFile, setMaterialFile] = useState<{ name: string; url: string; type: string } | null>(null);

  // Video state
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('12');
  const [videoDesc, setVideoDesc] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMaterialFile({
        name: file.name,
        url: dataUrl,
        type: file.type || 'application/octet-stream',
      });
      showToast(`Berkas "${file.name}" berhasil diunggah!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!materialTitle.trim()) {
      showToast('Judul materi wajib diisi!', 'error');
      return;
    }

    storageService.update(draft => {
      draft.materials.push({
        id: 'm_' + Date.now(),
        title: materialTitle.trim(),
        badge: materialBadge.trim(),
        content: materialContent.trim() || `Modul berkas lampiran materi: ${materialFile?.name || 'Dokumen Pelengkap'}`,
        fraction: [1, 2],
        fileName: materialFile?.name,
        fileUrl: materialFile?.url,
        fileType: materialFile?.type,
      });
    });

    setDb(storageService.getState());
    setIsAddMaterialOpen(false);
    setMaterialTitle('');
    setMaterialContent('');
    setMaterialFile(null);
    soundService.success();
    showToast('Subbab materi / berkas baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteMaterial = (id: string) => {
    soundService.click();
    storageService.update(draft => {
      draft.materials = draft.materials.filter(m => m.id !== id);
    });
    setDb(storageService.getState());
    soundService.success();
    showToast('Materi berhasil dihapus.', 'info');
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!videoTitle.trim() || !videoUrl.trim()) {
      showToast('Judul dan Link YouTube wajib diisi!', 'error');
      return;
    }

    const embedUrl = formatYouTubeEmbedUrl(videoUrl);

    storageService.update(draft => {
      if (!draft.videos) draft.videos = [];
      draft.videos.push({
        id: 'v_' + Date.now(),
        title: videoTitle.trim(),
        duration: videoDuration.trim() || '10',
        url: embedUrl,
        desc: videoDesc.trim(),
      });
    });

    setDb(storageService.getState());
    setIsAddVideoOpen(false);
    setVideoTitle('');
    setVideoUrl('');
    setVideoDuration('12');
    setVideoDesc('');
    soundService.success();
    showToast('Video pembelajaran berhasil ditambahkan!', 'success');
  };

  const handleDeleteVideo = (id: string) => {
    soundService.click();
    storageService.update(draft => {
      draft.videos = (draft.videos || []).filter(v => v.id !== id);
    });
    setDb(storageService.getState());
    soundService.success();
    showToast('Video berhasil dihapus.', 'info');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#a3e635] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          THEORY
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                KURIKULUM MERDEKA FASE D
              </span>
              <span className="px-3 py-1 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black font-mono shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {db.materials.length} Modul Teori • {db.videos?.length || 0} Video
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Kelola Modul Teori &amp; Video Interaktif
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Perbarui subbab modul teori bacaan, unggah berkas rangkuman PDF, dan kelola tautan video interaktif untuk siswa kelas 7 SMP.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <BookOpen size={36} />
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
              setActiveTab('materi');
            }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
              activeTab === 'materi'
                ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Materi Teori ({db.materials.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('video');
            }}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-[#38bdf8] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Video size={14} />
            <span>Video YouTube ({db.videos?.length || 0})</span>
          </button>
        </div>

        {activeTab === 'materi' ? (
          <button
            type="button"
            onClick={() => setIsAddMaterialOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Tambah Subbab Materi</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddVideoOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Tambah Video YouTube</span>
          </button>
        )}
      </div>

      {/* 3. TAB MATERI TEORI */}
      {activeTab === 'materi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {db.materials.map((m, idx) => (
            <div key={m.id} className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 border-2 border-slate-950 font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    {m.badge}
                  </span>
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Trash2 size={13} className="text-rose-700" />
                    <span>Hapus</span>
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 font-mono">{m.title}</h3>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                  {renderFormattedMathText(m.content, 'xs')}
                </div>

                {m.fileName && (
                  <div className="pt-2">
                    <a
                      href={m.fileUrl || '#'}
                      download={m.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-slate-950 dark:text-sky-200 border-2 border-slate-950 dark:border-sky-700 font-mono text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] hover:bg-sky-200 transition"
                    >
                      <FileText size={14} className="text-slate-950 dark:text-sky-200" />
                      <span>Unduh Berkas: {m.fileName}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. TAB VIDEO PEMBELAJARAN YOUTUBE */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(db.videos || []).map(v => (
            <div key={v.id} className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000]">
                <iframe
                  className="w-full h-full"
                  src={v.url}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-slate-950 bg-amber-100 border-2 border-slate-950 px-2.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    <Clock size={13} />
                    <span>{v.duration} Menit</span>
                  </span>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Trash2 size={13} className="text-rose-700" />
                    <span>Hapus</span>
                  </button>
                </div>

                <h3 className="font-black text-base sm:text-lg text-slate-950 dark:text-slate-100 font-mono">{v.title}</h3>
                {v.desc && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    {v.desc}
                  </p>
                )}
              </div>
            </div>
          ))}

          {(db.videos || []).length === 0 && (
            <div className="col-span-2 p-12 text-center text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a] dark:shadow-[5px_5px_0px_0px_#000000]">
              Belum ada video pembelajaran. Klik tombol "Tambah Video YouTube" di atas untuk menambahkan.
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah Subbab Materi */}
      {isAddMaterialOpen && (
        <Modal
          isOpen={isAddMaterialOpen}
          onClose={() => setIsAddMaterialOpen(false)}
          title="Tambah Subbab Materi Baru"
        >
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Judul Subbab Materi:
              </label>
              <input
                type="text"
                required
                value={materialTitle}
                onChange={e => setMaterialTitle(e.target.value)}
                placeholder="Contoh: Operasi Penjumlahan Pecahan Campuran"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Kategori / Badge:
              </label>
              <input
                type="text"
                required
                value={materialBadge}
                onChange={e => setMaterialBadge(e.target.value)}
                placeholder="Contoh: Operasi Hitung"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Isi Penjelasan Singkat Materi:
              </label>
              <textarea
                rows={3}
                value={materialContent}
                onChange={e => setMaterialContent(e.target.value)}
                placeholder="Tuliskan ringkasan materi atau biarkan kosong jika hanya upload berkas dokumen..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Unggah Dokumen Berkas Materi (PDF / PPT / DOCX / Gambar):
              </label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-[#ffe600] file:text-slate-950 hover:file:bg-yellow-400 cursor-pointer"
              />
              {materialFile && (
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 block">
                  ✓ Berkas terpilih: {materialFile.name}
                </span>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setIsAddMaterialOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase bg-[#ffe600] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Simpan Subbab Materi / Berkas
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Tambah Video YouTube */}
      {isAddVideoOpen && (
        <Modal
          isOpen={isAddVideoOpen}
          onClose={() => setIsAddVideoOpen(false)}
          title="Tambah Video Pembelajaran YouTube"
        >
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Judul Video:
              </label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                placeholder="Contoh: Konsep Pecahan Senilai & Geometri Pizza"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Tautan / URL Video YouTube:
              </label>
              <input
                type="text"
                required
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-mono shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Durasi Video (Menit):
              </label>
              <input
                type="text"
                required
                value={videoDuration}
                onChange={e => setVideoDuration(e.target.value)}
                placeholder="Contoh: 12"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-mono font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Deskripsi Singkat Video:
              </label>
              <textarea
                rows={3}
                value={videoDesc}
                onChange={e => setVideoDesc(e.target.value)}
                placeholder="Penjelasan ringkas poin materi yang dibahas dalam video..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setIsAddVideoOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase bg-[#38bdf8] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-sky-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Tambahkan Video ke Portal Siswa
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

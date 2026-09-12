import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import {
  BookOpen,
  Video,
  Plus,
  Trash2,
  Clock,
  FileText,
  Image as ImageIcon,
  Upload,
  Eye,
  Download,
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Material } from '@/types';

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

function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const GuruMateri: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [db, setDb] = useState(storageService.getState());
  const [activeTab, setActiveTab] = useState<'materi' | 'video'>('materi');

  // Materi Form State
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialBadge, setMaterialBadge] = useState('Modul PDF');
  const [materialContent, setMaterialContent] = useState('');
  const [materialFile, setMaterialFile] = useState<{
    name: string;
    url: string;
    type: string;
    size?: string;
  } | null>(null);

  // Video Form State
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('12');
  const [videoDesc, setVideoDesc] = useState('');

  // Preview Modal State (for viewing image or PDF)
  const [previewItem, setPreviewItem] = useState<{
    title: string;
    url: string;
    type: string;
    name?: string;
  } | null>(null);

  const badgePresets = [
    'Modul PDF',
    'Infografis Gambar',
    'Rangkuman Teori',
    'Lembar Kerja Tambahan',
    'Fondasi Pecahan',
    'Operasi Hitung'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = formatFileSize(file.size);
    const fileType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMaterialFile({
        name: file.name,
        url: dataUrl,
        type: fileType,
        size: formattedSize,
      });

      // Auto-adjust badge if user hasn't changed it
      if (fileType.includes('pdf')) {
        setMaterialBadge('Modul PDF');
      } else if (fileType.startsWith('image/')) {
        setMaterialBadge('Infografis Gambar');
      }

      showToast(`Berkas "${file.name}" (${formattedSize}) siap diunggah!`, 'success');
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
      if (!draft.materials) draft.materials = [];
      draft.materials.push({
        id: 'm_' + Date.now(),
        title: materialTitle.trim(),
        badge: materialBadge.trim() || 'Modul Pembelajaran',
        content: materialContent.trim() || `Modul berkas materi: ${materialFile?.name || materialTitle}`,
        fraction: [1, 2],
        fileName: materialFile?.name,
        fileUrl: materialFile?.url,
        fileType: materialFile?.type,
        fileSize: materialFile?.size,
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
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-16">
      
      {/* 1. Header Banner Pure Neobrutalism */}
      <div className="relative rounded-3xl bg-[#a3e635] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-black text-8xl pointer-events-none select-none">
          THEORY
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#0f172a]">
                KURIKULUM MERDEKA FASE D
              </span>
              <span className="px-3 py-1 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                {db.materials.length} Modul Teori • {db.videos?.length || 0} Video
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 leading-tight">
              Kelola Modul Teori, Berkas PDF &amp; Media Guru
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Unggah modul rangkuman PDF, infografis gambar pecahan, serta kelola video YouTube interaktif untuk diakses seluruh siswa kelas 7 SMP.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <BookOpen size={34} />
          </div>
        </div>
      </div>

      {/* 2. Tab Switcher & Action Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#111827] border-3 border-slate-950 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000]">
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('materi');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 flex items-center gap-2 ${
              activeTab === 'materi'
                ? 'bg-[#ffe600] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <BookOpen size={15} />
            <span>Modul &amp; Berkas ({db.materials.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setActiveTab('video');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 flex items-center gap-2 ${
              activeTab === 'video'
                ? 'bg-[#38bdf8] text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Video size={15} />
            <span>Video YouTube ({db.videos?.length || 0})</span>
          </button>
        </div>

        {activeTab === 'materi' ? (
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setIsAddMaterialOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Unggah Modul / Berkas Baru</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              soundService.click();
              setIsAddVideoOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#38bdf8] hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Tambah Video YouTube</span>
          </button>
        )}
      </div>

      {/* 3. TAB MATERI / BERKAS */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {db.materials.map((m: Material) => {
              const isPdf = m.fileType?.includes('pdf') || m.fileName?.endsWith('.pdf');
              const isImage = m.fileType?.startsWith('image/') || m.fileName?.match(/\.(png|jpe?g|webp|svg)$/i);

              return (
                <div
                  key={m.id}
                  className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="space-y-3.5">
                    {/* Top Badges & Actions */}
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-[#ffe600] text-slate-950 border-2 border-slate-950 text-[11px] font-black shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                          {m.badge}
                        </span>
                        {isPdf && (
                          <span className="px-2.5 py-1 rounded-xl bg-rose-200 text-rose-950 border-2 border-slate-950 text-[11px] font-black flex items-center gap-1">
                            <FileText size={12} /> PDF
                          </span>
                        )}
                        {isImage && (
                          <span className="px-2.5 py-1 rounded-xl bg-sky-200 text-sky-950 border-2 border-slate-950 text-[11px] font-black flex items-center gap-1">
                            <ImageIcon size={12} /> GAMBAR
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="p-1.5 px-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] text-xs font-black flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <Trash2 size={13} className="text-rose-700" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-slate-100 leading-snug">
                      {m.title}
                    </h3>

                    {/* Content text */}
                    {m.content && (
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border-2 border-slate-950/20 dark:border-slate-700">
                        {renderFormattedMathText(m.content, 'xs')}
                      </div>
                    )}

                    {/* Image Preview Thumbnail if attached */}
                    {isImage && m.fileUrl && (
                      <div
                        onClick={() => setPreviewItem({ title: m.title, url: m.fileUrl!, type: 'image', name: m.fileName })}
                        className="relative rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group cursor-pointer shadow-[3px_3px_0px_0px_#0f172a]"
                      >
                        <img
                          src={m.fileUrl}
                          alt={m.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-black text-xs">
                          <Eye size={16} />
                          <span>Klik untuk Zoom Pratinjau</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Attachment Footer */}
                  {m.fileName && (
                    <div className="pt-3 border-t-2 border-slate-950/10 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-200 border-2 border-slate-950 flex items-center justify-center shrink-0">
                          {isPdf ? <FileText size={16} className="text-slate-950" /> : <ImageIcon size={16} className="text-slate-950" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                            {m.fileName}
                          </p>
                          {m.fileSize && (
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {m.fileSize}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.fileUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewItem({
                              title: m.title,
                              url: m.fileUrl!,
                              type: isPdf ? 'pdf' : 'image',
                              name: m.fileName
                            })}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 border-2 border-slate-950 dark:border-slate-600 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Lihat</span>
                          </button>
                        )}

                        <a
                          href={m.fileUrl || '#'}
                          download={m.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 text-xs font-black shadow-[2px_2px_0px_0px_#0f172a] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Unduh</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {db.materials.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-700 shadow-[6px_6px_0px_0px_#0f172a]">
              Belum ada materi atau berkas yang diunggah. Klik tombol "Unggah Modul / Berkas Baru" di atas.
            </div>
          )}
        </div>
      )}

      {/* 4. TAB VIDEO YOUTUBE */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(db.videos || []).map(v => (
            <div
              key={v.id}
              className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4"
            >
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
                  <span className="inline-flex items-center gap-1 text-xs font-black text-slate-950 bg-amber-100 border-2 border-slate-950 px-2.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                    <Clock size={13} />
                    <span>{v.duration} Menit</span>
                  </span>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-black text-xs flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Trash2 size={13} className="text-rose-700" />
                    <span>Hapus</span>
                  </button>
                </div>

                <h3 className="font-black text-base sm:text-lg text-slate-950 dark:text-slate-100">{v.title}</h3>
                {v.desc && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    {v.desc}
                  </p>
                )}
              </div>
            </div>
          ))}

          {(db.videos || []).length === 0 && (
            <div className="col-span-2 p-12 text-center text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-[#111827] rounded-3xl border-4 border-slate-950 dark:border-slate-700 shadow-[5px_5px_0px_0px_#0f172a]">
              Belum ada video pembelajaran. Klik tombol "Tambah Video YouTube" di atas.
            </div>
          )}
        </div>
      )}

      {/* Modal Tambah Subbab Materi / Upload PDF & Gambar */}
      {isAddMaterialOpen && (
        <Modal
          isOpen={isAddMaterialOpen}
          onClose={() => setIsAddMaterialOpen(false)}
          title="Unggah Modul / Berkas Materi Baru"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleAddMaterial} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Judul Modul / Materi:
              </label>
              <input
                type="text"
                required
                value={materialTitle}
                onChange={e => setMaterialTitle(e.target.value)}
                placeholder="Contoh: Modul Rangkuman Operasi Pecahan HOTS"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Kategori / Badge:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {badgePresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMaterialBadge(preset)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-slate-950 transition-all cursor-pointer ${
                      materialBadge === preset
                        ? 'bg-[#ffe600] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={materialBadge}
                onChange={e => setMaterialBadge(e.target.value)}
                placeholder="Atau ketik kategori kustom..."
                className="w-full p-3 rounded-xl border-2 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs font-bold shadow-[1.5px_1.5px_0px_0px_#0f172a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Catatan / Ringkasan Penjelasan (Opsional):
              </label>
              <textarea
                rows={3}
                value={materialContent}
                onChange={e => setMaterialContent(e.target.value)}
                placeholder="Tuliskan catatan arahan guru atau poin penting untuk siswa..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none leading-relaxed"
              />
            </div>

            {/* Drag & Drop File Upload Box (PDF / Image) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Unggah Berkas PDF / Gambar / Dokumen:
              </label>
              <div className="relative border-3 border-dashed border-slate-950 dark:border-slate-700 rounded-2xl p-4 bg-amber-50/60 dark:bg-slate-800/60 text-center hover:bg-amber-100/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.ppt,.pptx,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {!materialFile ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-3 text-slate-700 dark:text-slate-300">
                    <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950 dark:text-slate-100">
                        Klik atau seret file PDF / Gambar ke sini
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        Mendukung format PDF, PNG, JPG, JPEG, WebP, DOCX
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border-2 border-slate-950 dark:border-slate-700 text-left relative z-20">
                    <div className="flex items-center gap-3">
                      {materialFile.type.startsWith('image/') ? (
                        <img
                          src={materialFile.url}
                          alt="preview"
                          className="w-12 h-12 object-cover rounded-lg border-2 border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-rose-200 border-2 border-slate-950 flex items-center justify-center text-rose-950 font-black text-xs">
                          <FileText size={22} />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black text-slate-950 dark:text-slate-100 truncate max-w-[240px] sm:max-w-xs">
                          {materialFile.name}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileCheck2 size={13} /> {materialFile.size || 'Berkas Terlampir'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaterialFile(null);
                      }}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-950 border border-slate-950 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setIsAddMaterialOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase bg-[#ffe600] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Simpan Modul / Berkas</span>
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
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
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
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Tautan / URL Video YouTube:
              </label>
              <input
                type="text"
                required
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
                Durasi Video (Menit):
              </label>
              <input
                type="text"
                required
                value={videoDuration}
                onChange={e => setVideoDuration(e.target.value)}
                placeholder="Contoh: 12"
                className="w-full p-3.5 rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-slate-100 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] focus:bg-white dark:focus:bg-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-200 mb-1.5">
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
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 text-slate-950 dark:text-slate-200 cursor-pointer"
                onClick={() => setIsAddVideoOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase bg-[#38bdf8] text-slate-950 border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-sky-400 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Tambahkan Video ke Portal Siswa
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lightbox / Preview Modal for PDF and Images */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`Pratinjau: ${previewItem.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {previewItem.type === 'image' ? (
              <div className="rounded-2xl overflow-hidden border-3 border-slate-950 dark:border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={previewItem.url}
                  alt={previewItem.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-rose-600" />
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {previewItem.name || 'Dokumen PDF'}
                    </span>
                  </div>
                  <a
                    href={previewItem.url}
                    download={previewItem.name || 'modul-materi.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#ffe600] text-slate-950 font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400 flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Buka / Unduh File Penuh</span>
                  </a>
                </div>
                <iframe
                  src={previewItem.url}
                  title={previewItem.title}
                  className="w-full h-[65vh] rounded-2xl border-3 border-slate-950 dark:border-slate-700 bg-white"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white font-black text-xs border-2 border-slate-950 cursor-pointer hover:bg-slate-800"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};


import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { BookOpen, Video, Plus, Trash2, Clock, ExternalLink, Play } from 'lucide-react';

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
  const db = storageService.getState();
  const [activeTab, setActiveTab] = useState<'materi' | 'video'>('materi');

  // Materi state
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialBadge, setMaterialBadge] = useState('Operasi Hitung');
  const [materialContent, setMaterialContent] = useState('');

  // Video state
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('12');
  const [videoDesc, setVideoDesc] = useState('');

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!materialTitle.trim() || !materialContent.trim()) {
      showToast('Judul dan isi materi wajib diisi!', 'error');
      return;
    }

    storageService.update(draft => {
      draft.materials.push({
        id: 'm_' + Date.now(),
        title: materialTitle.trim(),
        badge: materialBadge.trim(),
        content: materialContent.trim(),
        fraction: [1, 2],
      });
    });

    setIsAddMaterialOpen(false);
    setMaterialTitle('');
    setMaterialContent('');
    soundService.success();
    showToast('Subbab materi baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Hapus subbab materi ini?')) {
      storageService.update(draft => {
        draft.materials = draft.materials.filter(m => m.id !== id);
      });
      soundService.click();
      showToast('Materi dihapus.', 'info');
    }
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

    setIsAddVideoOpen(false);
    setVideoTitle('');
    setVideoUrl('');
    setVideoDuration('12');
    setVideoDesc('');
    soundService.success();
    showToast('Video pembelajaran berhasil ditambahkan & langsung muncul di portal Siswa!', 'success');
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Hapus video pembelajaran ini?')) {
      storageService.update(draft => {
        draft.videos = (draft.videos || []).filter(v => v.id !== id);
      });
      soundService.click();
      showToast('Video dihapus.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="text-emerald-600" />
            <span>Kelola Materi & Video Pembelajaran</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Perbarui subbab teori bacaan dan unggah tautan video YouTube interaktif untuk siswa kelas 7 SMP.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'materi'
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Materi Teori ({db.materials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video size={14} />
            <span>Video YouTube ({db.videos?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* 1. TAB MATERI TEORI */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Daftar Modul Teori Aktif</span>
            <ArrowFillButton
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9"
              onClick={() => setIsAddMaterialOpen(true)}
            >
              <Plus size={15} />
              <span>Tambah Subbab Materi</span>
            </ArrowFillButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.materials.map(m => (
              <DoubleBezelCard key={m.id} className="bg-slate-50 border-slate-200/80">
                <div className="space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[10px]">
                        {m.badge}
                      </span>
                      <button
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <h3 className="text-base font-black text-slate-900">{m.title}</h3>
                    <div className="text-xs text-slate-600 leading-relaxed font-medium">
                      {renderFormattedMathText(m.content, 'xs')}
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>
            ))}
          </div>
        </div>
      )}

      {/* 2. TAB VIDEO PEMBELAJARAN YOUTUBE */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Daftar Video Pembelajaran YouTube di Portal Siswa</span>
            <ArrowFillButton
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9"
              onClick={() => setIsAddVideoOpen(true)}
            >
              <Plus size={15} />
              <span>Tambah Video YouTube</span>
            </ArrowFillButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(db.videos || []).map(v => (
              <DoubleBezelCard key={v.id} className="bg-slate-50 border-slate-200/80">
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-slate-200">
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
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <Clock size={12} />
                        <span>{v.duration} Menit</span>
                      </span>
                      <button
                        onClick={() => handleDeleteVideo(v.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <h3 className="font-black text-base text-slate-900">{v.title}</h3>
                    {v.desc && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {v.desc}
                      </p>
                    )}
                  </div>
                </div>
              </DoubleBezelCard>
            ))}
            {(db.videos || []).length === 0 && (
              <div className="col-span-2 p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
                Belum ada video pembelajaran. Klik tombol "Tambah Video YouTube" di atas untuk menambahkan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Subbab Materi */}
      <Modal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        title="Tambah Subbab Materi Baru"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Judul Subbab Materi:
            </label>
            <input
              type="text"
              required
              value={materialTitle}
              onChange={e => setMaterialTitle(e.target.value)}
              placeholder="Contoh: Operasi Penjumlahan Pecahan Campuran"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Kategori / Badge:
            </label>
            <input
              type="text"
              required
              value={materialBadge}
              onChange={e => setMaterialBadge(e.target.value)}
              placeholder="Contoh: Operasi Hitung"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Isi Penjelasan Materi:
            </label>
            <textarea
              required
              rows={4}
              value={materialContent}
              onChange={e => setMaterialContent(e.target.value)}
              placeholder="Tuliskan materi konsep pecahan..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setIsAddMaterialOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white">
              Simpan Subbab Materi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Video YouTube */}
      <Modal
        isOpen={isAddVideoOpen}
        onClose={() => setIsAddVideoOpen(false)}
        title="Tambah Video Pembelajaran YouTube"
      >
        <form onSubmit={handleAddVideo} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Judul Video:
            </label>
            <input
              type="text"
              required
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              placeholder="Contoh: Konsep Pecahan Senilai & Geometri Pizza"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tautan / URL Video YouTube:
            </label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-mono focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Format link standar youtube.com atau youtu.be akan dikonversi otomatis menjadi embed.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Durasi Video (Menit):
            </label>
            <input
              type="text"
              required
              value={videoDuration}
              onChange={e => setVideoDuration(e.target.value)}
              placeholder="Contoh: 12"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-mono font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Deskripsi Singkat Video:
            </label>
            <textarea
              rows={3}
              value={videoDesc}
              onChange={e => setVideoDesc(e.target.value)}
              placeholder="Penjelasan ringkas poin materi yang dibahas dalam video..."
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setIsAddVideoOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-amber-600 hover:bg-amber-700 text-white">
              Tambahkan Video ke Portal Siswa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, LatsolRoom, LatsolQuestion, LatsolSubmission } from '@/types';
import {
  HelpCircle,
  Lock,
  Unlock,
  Clock,
  Trophy,
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Check,
  BookOpen
} from 'lucide-react';

export const GuruLatsol: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [selectedRoom, setSelectedRoom] = useState<LatsolRoom | null>(null);
  const [viewDetailSub, setViewDetailSub] = useState<LatsolSubmission | null>(null);
  const [filterRoomId, setFilterRoomId] = useState<string>('all');

  // Add Room Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomBadge, setNewRoomBadge] = useState('');
  const [newRoomDuration, setNewRoomDuration] = useState<number>(10);

  // Edit Room & Questions Modal State
  const [editingRoom, setEditingRoom] = useState<LatsolRoom | null>(null);
  const [editRoomTitle, setEditRoomTitle] = useState('');
  const [editRoomTopic, setEditRoomTopic] = useState('');
  const [editRoomBadge, setEditRoomBadge] = useState('');
  const [editRoomQuestions, setEditRoomQuestions] = useState<LatsolQuestion[]>([]);

  // Add Question to Editing Room State
  const [isAddingQuestionToRoom, setIsAddingQuestionToRoom] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrectIdx, setNewQCorrectIdx] = useState<number>(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQPoints, setNewQPoints] = useState<number>(20);

  // Edit Single Question in Modal
  const [editingQId, setEditingQId] = useState<string | null>(null);

  const rooms = dbState.latsolRooms || [];
  const submissions = dbState.latsolSubmissions || [];

  const handleToggleRoomLock = (roomId: string) => {
    soundService.click();
    storageService.update(draft => {
      const target = draft.latsolRooms?.find(r => r.id === roomId);
      if (target) {
        target.isLockedByTeacher = !target.isLockedByTeacher;
      }
    });
    const updated = storageService.getState().latsolRooms?.find(r => r.id === roomId);
    setDbState(storageService.getState());
    soundService.success();
    showToast(
      updated?.isLockedByTeacher
        ? 'Akses ruangan Kuis berhasil DIKUNCI untuk siswa.'
        : 'Akses ruangan Kuis berhasil DIBUKA untuk siswa!',
      'success'
    );
  };

  const handleUpdateDuration = (roomId: string, newDurationMinutes: number) => {
    soundService.click();
    const durationSeconds = Math.max(1, newDurationMinutes) * 60;
    storageService.update(draft => {
      const target = draft.latsolRooms?.find(r => r.id === roomId);
      if (target) {
        target.durationSeconds = durationSeconds;
      }
    });
    setDbState(storageService.getState());
    soundService.success();
    showToast(`Durasi waktu pengerjaan diubah menjadi ${newDurationMinutes} menit!`, 'success');
  };

  // Add Room Submit
  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!newRoomTitle.trim() || !newRoomTopic.trim()) {
      showToast('Judul dan topik ruangan kuis wajib diisi!', 'error');
      return;
    }

    const roomId = 'room_' + Date.now();
    const badgeText = newRoomBadge.trim() || `Latihan Soal ${rooms.length + 1}`;
    const initialQuestion: LatsolQuestion = {
      id: `${roomId}_q1`,
      question: `Soal 1: Perhatikan konsep materi ${newRoomTopic.trim()}. Berapakah nilai pecahan paling sederhananya?`,
      options: ['1/2', '2/3', '3/4', '4/5'],
      correctIndex: 0,
      explanation: 'Sederhanakan pecahan dengan membagi pembilang dan penyebut dengan FPB.',
      points: 20
    };

    const newRoom: LatsolRoom = {
      id: roomId,
      title: newRoomTitle.trim(),
      topic: newRoomTopic.trim(),
      badge: badgeText,
      durationSeconds: Math.max(1, newRoomDuration) * 60,
      isLockedByTeacher: false,
      questions: [initialQuestion]
    };

    storageService.update(draft => {
      if (!draft.latsolRooms) draft.latsolRooms = [];
      draft.latsolRooms.push(newRoom);
    });

    setDbState(storageService.getState());
    setIsAddRoomOpen(false);
    setNewRoomTitle('');
    setNewRoomTopic('');
    setNewRoomBadge('');
    setNewRoomDuration(10);
    soundService.success();
    showToast('Ruang Latihan Soal baru berhasil dibuat!', 'success');
  };

  // Open Edit Room Modal
  const handleOpenEditRoom = (room: LatsolRoom) => {
    soundService.click();
    setEditingRoom(room);
    setEditRoomTitle(room.title);
    setEditRoomTopic(room.topic);
    setEditRoomBadge(room.badge);
    setEditRoomQuestions([...room.questions]);
    setIsAddingQuestionToRoom(false);
    setEditingQId(null);
  };

  // Add Question into Editing Room
  const handleAddQuestionToEditingRoom = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!newQText.trim() || !newQOptA.trim() || !newQOptB.trim()) {
      showToast('Teks pertanyaan dan opsi A & B wajib diisi!', 'error');
      return;
    }

    const newQuestion: LatsolQuestion = {
      id: `${editingRoom?.id || 'room'}_q_${Date.now()}`,
      question: newQText.trim(),
      options: [
        newQOptA.trim(),
        newQOptB.trim(),
        newQOptC.trim() || 'Tidak ada',
        newQOptD.trim() || 'Tidak ada'
      ],
      correctIndex: newQCorrectIdx,
      explanation: newQExplanation.trim() || 'Langkah penyelesaian pecahan secara sistematis.',
      points: newQPoints || 20
    };

    setEditRoomQuestions(prev => [...prev, newQuestion]);
    setIsAddingQuestionToRoom(false);
    setNewQText('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQCorrectIdx(0);
    setNewQExplanation('');
    setNewQPoints(20);
    soundService.success();
    showToast('Butir soal berhasil ditambahkan ke daftar!', 'info');
  };

  // Delete Question from Editing Room
  const handleDeleteQuestionFromRoom = (qId: string) => {
    soundService.click();
    if (editRoomQuestions.length <= 1) {
      showToast('Ruangan harus memiliki minimal 1 butir soal!', 'error');
      return;
    }
    setEditRoomQuestions(prev => prev.filter(q => q.id !== qId));
    showToast('Soal dihapus dari daftar.', 'info');
  };

  // Save All Changes to Room
  const handleSaveRoomChanges = () => {
    if (!editingRoom) return;
    soundService.click();

    if (!editRoomTitle.trim() || !editRoomTopic.trim()) {
      showToast('Judul dan topik ruangan wajib diisi!', 'error');
      return;
    }

    if (editRoomQuestions.length === 0) {
      showToast('Ruangan harus memiliki minimal 1 butir soal!', 'error');
      return;
    }

    storageService.update(draft => {
      const target = draft.latsolRooms?.find(r => r.id === editingRoom.id);
      if (target) {
        target.title = editRoomTitle.trim();
        target.topic = editRoomTopic.trim();
        target.badge = editRoomBadge.trim() || target.badge;
        target.questions = editRoomQuestions;
      }
    });

    setDbState(storageService.getState());
    setEditingRoom(null);
    soundService.success();
    showToast('Perubahan ruang kuis dan butir soal berhasil disimpan!', 'success');
  };

  // Delete Room
  const handleDeleteRoom = (roomId: string) => {
    soundService.click();
    if (confirm('Apakah Anda yakin ingin menghapus ruang latihan soal ini beserta seluruh soalnya?')) {
      storageService.update(draft => {
        draft.latsolRooms = draft.latsolRooms?.filter(r => r.id !== roomId) || [];
      });
      setDbState(storageService.getState());
      if (editingRoom?.id === roomId) setEditingRoom(null);
      soundService.success();
      showToast('Ruang latihan soal berhasil dihapus.', 'info');
    }
  };

  const filteredSubmissions = filterRoomId === 'all'
    ? submissions
    : submissions.filter(s => s.roomId === filterRoomId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ff94e8] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          QUIZ ROOMS
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                KONTROL RUANG KUIS (QUIZIZZ MODE)
              </span>
              <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                {rooms.length} Ruang Kuis Interaktif
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Kelola Latihan Soal &amp; Pengaturan Waktu
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Buka atau kunci akses ruangan kuis latihan soal, atur durasi pengerjaan timer, tambah &amp; edit butir soal pilihan ganda, serta pantau skor langsung siswa.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0f172a]">
            <HelpCircle size={36} />
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 font-mono">
            Daftar Ruang Latihan Soal
          </h2>
          <span className="px-2.5 py-0.5 rounded-lg bg-[#a3e635] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
            {rooms.length} Ruang
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setIsAddRoomOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          <span>Tambah Ruang Kuis Baru</span>
        </button>
      </div>

      {/* 3. Room Control Grid Cards (Sejajar dengan Flex Col + Justify Between) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {rooms.map((room, idx) => {
          const isLocked = room.isLockedByTeacher;
          const durationMins = Math.round(room.durationSeconds / 60);
          const roomSubs = submissions.filter(s => s.roomId === room.id);
          const avgScore = roomSubs.length > 0
            ? Math.round(roomSubs.reduce((acc, curr) => acc + curr.score, 0) / roomSubs.length)
            : 0;

          return (
            <div
              key={room.id}
              className={`rounded-3xl border-4 border-slate-950 p-6 shadow-[6px_6px_0px_0px_#0f172a] transition-all flex flex-col justify-between h-full ${
                isLocked ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              {/* Card Body (Top Portion) */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        Ruang #{idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#38bdf8] text-slate-950 font-mono font-bold text-xs border-2 border-slate-950">
                        {room.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-950 text-lg leading-snug">{room.title}</h3>
                    <p className="text-xs font-bold text-slate-600">{room.topic}</p>
                  </div>

                  {/* Lock/Unlock Badge */}
                  <div className={`px-3 py-1.5 rounded-xl border-2 border-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0f172a] shrink-0 ${
                    isLocked ? 'bg-rose-300 text-slate-950' : 'bg-lime-300 text-slate-950'
                  }`}>
                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    <span>{isLocked ? 'Terkunci' : 'Terbuka'}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 border-2 border-slate-950 text-center">
                    <div className="text-[10px] font-mono font-bold text-slate-600">Soal</div>
                    <div className="text-sm font-black font-mono text-slate-950">{room.questions.length} Butir</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 border-2 border-slate-950 text-center">
                    <div className="text-[10px] font-mono font-bold text-slate-600">Dikerjakan</div>
                    <div className="text-sm font-black font-mono text-slate-950">{roomSubs.length} Siswa</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 border-2 border-slate-950 text-center">
                    <div className="text-[10px] font-mono font-bold text-slate-600">Rata-rata</div>
                    <div className="text-sm font-black font-mono text-purple-700">{avgScore}/100</div>
                  </div>
                </div>

                {/* Duration Configurator */}
                <div className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-950 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-950" />
                      <span>Setel Durasi Pengerjaan:</span>
                    </span>
                    <span className="font-mono font-black text-slate-950 bg-white px-2 py-0.5 rounded-md border border-slate-950">
                      {durationMins} Menit
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 15, 20, 30].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleUpdateDuration(room.id, mins)}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-black transition-all cursor-pointer border-2 border-slate-950 ${
                          durationMins === mins
                            ? 'bg-[#ffe600] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                            : 'bg-white text-slate-800 hover:bg-yellow-100'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions (Sejajar di Bawah dengan mt-5 pt-4 border-t-2) */}
              <div className="mt-5 pt-4 border-t-2 border-slate-950 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="font-black text-xs"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <Eye size={14} />
                    <span>Lihat {room.questions.length} Soal</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditRoom(room)}
                    className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title="Edit Ruang & Soal"
                  >
                    <Pencil size={14} />
                    <span>Edit Soal</span>
                  </button>
                </div>

                <Button
                  variant={isLocked ? 'lime' : 'danger'}
                  size="sm"
                  className="font-black text-xs"
                  onClick={() => handleToggleRoomLock(room.id)}
                >
                  {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                  <span>{isLocked ? 'Buka Kuis untuk Siswa' : 'Kunci Kuis'}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Submissions & Leaderboard Table */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[7px_7px_0px_0px_#0f172a] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950 font-mono flex items-center gap-2">
              <Trophy className="text-amber-500" />
              <span>Hasil Pengerjaan Kuis Siswa (Quizizz Scores)</span>
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              Skor langsung, durasi pengerjaan, dan audit keluar tab ujian.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700">Filter Ruang:</span>
            <select
              value={filterRoomId}
              onChange={e => setFilterRoomId(e.target.value)}
              className="p-2 bg-white text-slate-950 text-xs font-black rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] outline-none"
            >
              <option value="all">Semua Ruang ({submissions.length})</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#ffe600] border-3 border-slate-950 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Peringkat</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Ruang Kuis</th>
                <th className="p-3.5 font-mono">Skor Akhir</th>
                <th className="p-3.5">Benar / Total</th>
                <th className="p-3.5">Durasi</th>
                <th className="p-3.5">Audit Tab</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 bg-white">
              {filteredSubmissions
                .sort((a, b) => b.score - a.score)
                .map((sub, idx) => {
                  const switchCount = sub.antiCheat?.switchCount || 0;
                  const leaveSec = sub.antiCheat?.totalLeaveSeconds || 0;

                  return (
                    <tr key={sub.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-black text-slate-950">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl border-2 border-slate-950 font-mono font-black ${
                          idx === 0 ? 'bg-[#ffe600] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]' :
                          idx === 1 ? 'bg-slate-200 text-slate-950' :
                          idx === 2 ? 'bg-amber-200 text-slate-950' : 'bg-white text-slate-700'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-slate-950">{sub.studentName}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-500">{sub.studentClass} • ID: {sub.studentId}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-sky-100 text-slate-950 border-2 border-slate-950 text-xs font-bold leading-snug shadow-[1.5px_1.5px_0px_0px_#0f172a] max-w-[240px]">
                          {sub.roomTitle}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-lg text-slate-950">
                        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-xl bg-purple-100 border-2 border-slate-950 text-purple-900 shadow-[2px_2px_0px_0px_#0f172a]">
                          {sub.score}/100
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {sub.correctCount} / {sub.totalQuestions} Soal
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-600">
                        {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                      </td>
                      <td className="p-3.5">
                        {switchCount > 0 ? (
                          <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-900 border border-slate-950 text-[11px] font-mono font-black flex items-center gap-1 w-fit">
                            <ShieldAlert size={13} className="text-rose-600" />
                            <span>{switchCount}x ({leaveSec}d)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-slate-950 text-[11px] font-mono font-black flex items-center gap-1 w-fit">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>Aman (0x)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs font-black"
                          onClick={() => setViewDetailSub(sub)}
                        >
                          Rincian
                        </Button>
                      </td>
                    </tr>
                  );
                })}

              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                    Belum ada siswa yang menyelesaikan kuis pada ruang ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Tambah Ruang Kuis Baru */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Tambah Ruang Latihan Soal Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddRoomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Judul Ruangan Kuis:
            </label>
            <input
              type="text"
              required
              value={newRoomTitle}
              onChange={e => setNewRoomTitle(e.target.value)}
              placeholder="Contoh: Latihan Soal 3: Perkalian Pecahan"
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] outline-none focus:bg-amber-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Topik Pembahasan:
            </label>
            <input
              type="text"
              required
              value={newRoomTopic}
              onChange={e => setNewRoomTopic(e.target.value)}
              placeholder="Contoh: Perkalian & Pembagian Pecahan Biasa / Campuran"
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] outline-none focus:bg-amber-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
                Badge / Label Ruangan:
              </label>
              <input
                type="text"
                value={newRoomBadge}
                onChange={e => setNewRoomBadge(e.target.value)}
                placeholder={`Contoh: Latihan Soal ${rooms.length + 1}`}
                className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
                Durasi Timer (Menit):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={newRoomDuration}
                onChange={e => setNewRoomDuration(parseInt(e.target.value) || 10)}
                className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] outline-none font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-slate-950 text-xs text-slate-800 font-bold space-y-1">
            <span className="font-black text-slate-950">Catatan Guru:</span>
            <p>Ruangan kuis baru akan otomatis dibuat dengan 1 butir soal awal yang dapat Anda sunting atau tambahkan soal lainnya setelah ruangan dibuat.</p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-slate-950">
            <button
              type="button"
              onClick={() => setIsAddRoomOpen(false)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Buat Ruang Kuis
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Modal Edit Ruang & Butir Soal */}
      {editingRoom && (
        <Modal
          isOpen={!!editingRoom}
          onClose={() => setEditingRoom(null)}
          title={`Edit Ruang & Soal — ${editingRoom.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            
            {/* Ruang Metadata Inputs */}
            <div className="p-4 rounded-2xl bg-[#fffdf5] border-2 border-slate-950 space-y-3 shadow-[2px_2px_0px_0px_#0f172a]">
              <div className="text-xs font-mono font-black text-slate-950 uppercase tracking-wider flex items-center justify-between">
                <span>Informasi Ruangan Kuis:</span>
                <button
                  type="button"
                  onClick={() => handleDeleteRoom(editingRoom.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Hapus Ruangan Ini</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Judul Ruangan:</label>
                  <input
                    type="text"
                    value={editRoomTitle}
                    onChange={e => setEditRoomTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Topik Pembahasan:</label>
                  <input
                    type="text"
                    value={editRoomTopic}
                    onChange={e => setEditRoomTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Questions Header & Add Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-950 font-mono">
                  Daftar Soal di Ruangan Ini ({editRoomQuestions.length} Butir)
                </h4>
              </div>

              {!isAddingQuestionToRoom && (
                <button
                  type="button"
                  onClick={() => setIsAddingQuestionToRoom(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Tambah Soal Baru</span>
                </button>
              )}
            </div>

            {/* Form Tambah Soal Baru ke Ruangan */}
            {isAddingQuestionToRoom && (
              <form onSubmit={handleAddQuestionToEditingRoom} className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-3 border-slate-950 space-y-3.5 shadow-[4px_4px_0px_0px_#0f172a]">
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-950">
                  <span className="font-mono font-black text-xs text-slate-950 uppercase">
                    Buat Butir Soal Pilihan Ganda Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestionToRoom(false)}
                    className="text-xs font-mono font-bold text-slate-600 hover:text-slate-950"
                  >
                    Batal
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Pertanyaan / Kasus:</label>
                  <textarea
                    rows={2}
                    required
                    value={newQText}
                    onChange={e => setNewQText(e.target.value)}
                    placeholder="Contoh: Hasil dari 2/3 + 1/4 adalah..."
                    className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Opsi A:</label>
                    <input
                      type="text"
                      required
                      value={newQOptA}
                      onChange={e => setNewQOptA(e.target.value)}
                      placeholder="Jawaban A"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Opsi B:</label>
                    <input
                      type="text"
                      required
                      value={newQOptB}
                      onChange={e => setNewQOptB(e.target.value)}
                      placeholder="Jawaban B"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Opsi C:</label>
                    <input
                      type="text"
                      value={newQOptC}
                      onChange={e => setNewQOptC(e.target.value)}
                      placeholder="Jawaban C"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Opsi D:</label>
                    <input
                      type="text"
                      value={newQOptD}
                      onChange={e => setNewQOptD(e.target.value)}
                      placeholder="Jawaban D"
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Kunci Jawaban Benar:</label>
                    <select
                      value={newQCorrectIdx}
                      onChange={e => setNewQCorrectIdx(parseInt(e.target.value))}
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-black outline-none font-mono"
                    >
                      <option value={0}>Opsi A (Pilihan Pertama)</option>
                      <option value={1}>Opsi B (Pilihan Kedua)</option>
                      <option value={2}>Opsi C (Pilihan Ketiga)</option>
                      <option value={3}>Opsi D (Pilihan Keempat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Bobot Poin Soal:</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={newQPoints}
                      onChange={e => setNewQPoints(parseInt(e.target.value) || 20)}
                      className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-black outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Penjelasan Pembahasan:</label>
                  <textarea
                    rows={2}
                    value={newQExplanation}
                    onChange={e => setNewQExplanation(e.target.value)}
                    placeholder="Langkah penyelesaian sistematis..."
                    className="w-full p-2.5 rounded-xl border-2 border-slate-950 bg-white text-xs font-bold outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-lime-300 hover:bg-lime-400 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Simpan Soal ke Daftar
                  </button>
                </div>
              </form>
            )}

            {/* List of Questions */}
            <div className="space-y-3">
              {editRoomQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white border-2 border-slate-950 space-y-3 shadow-[2px_2px_0px_0px_#0f172a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#ffe600] text-slate-950 font-mono font-black text-xs border border-slate-950">
                        Soal #{qIdx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        Bobot: {q.points} Poin
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestionFromRoom(q.id)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Soal Ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-black text-slate-950">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs font-bold border-2 ${
                            isCorrect
                              ? 'bg-lime-100 border-slate-950 text-slate-950 font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-mono mr-1.5 font-black">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                          {isCorrect && <span className="ml-1 text-emerald-800 font-mono font-black">(Kunci)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                    <span className="font-black text-slate-950">Pembahasan: </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Save All Buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t-2 border-slate-950">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRoomChanges}
                className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Simpan Semua Perubahan
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* 7. Modal Preview Questions in Room */}
      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title={`Daftar Soal — ${selectedRoom.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-slate-950 text-xs font-bold space-y-1">
              <div className="font-black text-slate-950 font-mono">Informasi Ruang Kuis:</div>
              <p>Topik: {selectedRoom.topic} • Durasi Timer: {Math.round(selectedRoom.durationSeconds / 60)} Menit • Status: {selectedRoom.isLockedByTeacher ? 'Terkunci' : 'Terbuka'}</p>
            </div>

            <div className="space-y-3">
              {selectedRoom.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white border-2 border-slate-950 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#ffe600] text-slate-950 font-mono font-black text-xs border border-slate-950">
                      Soal #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      Bobot: {q.points} Poin
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-black text-slate-950 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs font-bold border-2 ${
                            isCorrect
                              ? 'bg-lime-100 border-slate-950 text-slate-950 font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-mono mr-1.5 font-black">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                          {isCorrect && <span className="ml-1 text-emerald-700 font-mono font-black">(Kunci)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                    <span className="font-black text-slate-950">Pembahasan: </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Modal Detail Student Submission */}
      {viewDetailSub && (
        <Modal
          isOpen={!!viewDetailSub}
          onClose={() => setViewDetailSub(null)}
          title={`Detail Hasil Kuis — ${viewDetailSub.studentName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-2xl border-2 border-slate-950">
                <div className="text-xs font-bold text-slate-600">Skor Quizizz</div>
                <div className="text-2xl font-black font-mono text-purple-900">{viewDetailSub.score}/100</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-950">
                <div className="text-xs font-bold text-slate-600">Durasi Pengerjaan</div>
                <div className="text-xl font-black font-mono text-slate-950">
                  {Math.floor(viewDetailSub.timeSpentSeconds / 60)}m {viewDetailSub.timeSpentSeconds % 60}s
                </div>
              </div>
            </div>

            {/* Anti Cheat Log */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-950 space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5 text-slate-950">
                  <ShieldAlert size={14} className="text-amber-600" />
                  <span>Log Aktivitas Perpindahan Jendela / Tab:</span>
                </span>
                <span className="font-mono text-rose-700">
                  {viewDetailSub.antiCheat?.switchCount || 0} Kali Terdeteksi
                </span>
              </div>

              {viewDetailSub.antiCheat?.log && viewDetailSub.antiCheat.log.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {viewDetailSub.antiCheat.log.map((rec, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white border border-slate-300 text-[11px] font-mono flex items-center justify-between">
                      <span className="text-slate-800 font-bold">{rec.incident} ({rec.durationSeconds} detik)</span>
                      <span className="text-slate-400">{rec.timestamp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  Siswa tertib selama pengerjaan kuis, tidak ada aktivitas meninggalkan tab kuis.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="font-black"
                onClick={() => setViewDetailSub(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

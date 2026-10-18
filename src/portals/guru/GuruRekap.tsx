import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { renderFormattedMathText } from '@/components/ui/fraction';
import { User, EvaluationSubmission, LKPDSubmission } from '@/types';
import {
  BarChart3,
  Download,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Trophy,
  Eye,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  X,
  Save,
  Check,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const GuruRekap: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const [db, setDb] = useState(storageService.getState());
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'evaluasi' | 'lkpd'>('evaluasi');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Teacher Grade & Feedback State
  const [teacherScoreInput, setTeacherScoreInput] = useState<number>(0);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');
  const [revealedDiscussions, setRevealedDiscussions] = useState<Record<string, boolean>>({});

  // Sync db updates
  React.useEffect(() => {
    return storageService.subscribe(newState => {
      setDb(newState);
    });
  }, []);

  const students = db.users.filter(u => u.role === 'siswa');
  const lkpdList = db.lkpdList || [];
  const latsolRooms = db.latsolRooms || [];

  const handleOpenInspection = (student: User, initialTab: 'evaluasi' | 'lkpd' = 'evaluasi') => {
    soundService.click();
    setSelectedStudent(student);
    setActiveTab(initialTab);

    const evalSub = db.evaluationSubmissions?.find(s => s.studentId === student.id);
    if (evalSub) {
      setTeacherScoreInput(evalSub.teacherScore ?? evalSub.score ?? 0);
      setTeacherFeedbackInput(evalSub.teacherFeedback || '');
    } else {
      setTeacherScoreInput(0);
      setTeacherFeedbackInput('');
    }
  };

  const handleSaveTeacherEvaluationGrade = () => {
    if (!selectedStudent) return;
    soundService.click();

    const clampedScore = Math.max(0, Math.min(100, Number(teacherScoreInput) || 0));

    storageService.update(draft => {
      const sub = draft.evaluationSubmissions?.find(s => s.studentId === selectedStudent.id);
      if (sub) {
        sub.teacherScore = clampedScore;
        sub.teacherFeedback = teacherFeedbackInput.trim();
        sub.score = clampedScore;
        sub.gradingStatus = 'graded';
      }
      const u = draft.users.find(user => user.id === selectedStudent.id);
      if (u && u.progress) {
        u.progress.evaluasi = clampedScore;
      }
    });

    soundService.success();
    showToast(`Nilai Evaluasi siswa ${selectedStudent.name} berhasil disimpan! (${clampedScore}/100)`, 'success');
  };

  const toggleDiscussion = (qId: string) => {
    soundService.click();
    setRevealedDiscussions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleExportExcel = () => {
    soundService.click();

    const excelRows = students.map((s, idx) => {
      // Per LKPD score
      const lkpd1Sub = db.lkpdSubmissions.find(sub => sub.studentId === s.id && (sub.lkpdId === 'lkpd_1' || sub.lkpdId === lkpdList[0]?.id));
      const lkpd2Sub = db.lkpdSubmissions.find(sub => sub.studentId === s.id && (sub.lkpdId === 'lkpd_2' || sub.lkpdId === lkpdList[1]?.id));

      const lkpd1Score = lkpd1Sub ? (lkpd1Sub.teacherScore ?? lkpd1Sub.aiScore ?? 0) : 0;
      const lkpd2Score = lkpd2Sub ? (lkpd2Sub.teacherScore ?? lkpd2Sub.aiScore ?? 0) : 0;

      // Per Latsol score
      const latsol1Sub = db.latsolSubmissions?.find(sub => sub.studentId === s.id && (sub.roomId === 'room_1' || sub.roomId === latsolRooms[0]?.id));
      const latsol2Sub = db.latsolSubmissions?.find(sub => sub.studentId === s.id && (sub.roomId === 'room_2' || sub.roomId === latsolRooms[1]?.id));

      const latsol1Score = latsol1Sub ? latsol1Sub.score : 0;
      const latsol2Score = latsol2Sub ? latsol2Sub.score : 0;

      // Evaluasi score
      const evalSub = db.evaluationSubmissions?.find(sub => sub.studentId === s.id);
      const evalNeedsReview = evalSub?.gradingStatus === 'needs_review' && (evalSub.teacherScore === null || evalSub.teacherScore === undefined);
      const evalScore = evalSub ? (evalNeedsReview ? 0 : (evalSub.teacherScore ?? evalSub.score ?? 0)) : 0;

      // Tab Switches total
      const tabSwitch = (evalSub?.antiCheat?.switchCount || 0) + (lkpd1Sub?.antiCheat?.switchCount || 0) + (latsol1Sub?.antiCheat?.switchCount || 0);
      const tabDuration = (evalSub?.antiCheat?.totalLeaveSeconds || 0) + (lkpd1Sub?.antiCheat?.totalLeaveSeconds || 0) + (latsol1Sub?.antiCheat?.totalLeaveSeconds || 0);

      // Final Grade (Weighted Average)
      const validScores = [lkpd1Score, lkpd2Score, latsol1Score, latsol2Score, evalScore].filter(sc => sc > 0);
      const finalScore = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      return {
        "No": idx + 1,
        "NIS / Username": s.username,
        "Nama Lengkap Siswa": s.name,
        "Kelas": s.class || "Kelas 7-A",
        "Nilai LKPD 1": lkpd1Sub ? lkpd1Score : "Belum",
        "Nilai LKPD 2": lkpd2Sub ? lkpd2Score : "Belum",
        "Nilai Latsol 1": latsol1Sub ? latsol1Score : "Belum",
        "Nilai Latsol 2": latsol2Sub ? latsol2Score : "Belum",
        "Nilai Evaluasi Sumatif": evalSub ? (evalNeedsReview ? 'Menunggu pemeriksaan guru' : evalScore) : "Belum",
        "Rata-Rata Nilai Akhir": finalScore,
        "Total Keluar Tab (Anti-Cheat)": `${tabSwitch}x (${tabDuration} detik)`,
        "Status Ketuntasan": finalScore >= 75 ? "TUNTAS (KKM 75)" : "PERLU REMEDIAL"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Detail Per LKPD & Kuis");

    XLSX.writeFile(workbook, `Rekap_Nilai_Pecahan_Per_LKPD_SMP7_${new Date().toISOString().slice(0, 10)}.xlsx`);

    soundService.success();
    showToast("File Microsoft Excel (.xlsx) Rekap Per LKPD berhasil diunduh!", "success");
  };

  const selectedEvalSub = selectedStudent
    ? db.evaluationSubmissions?.find(sub => sub.studentId === selectedStudent.id)
    : null;

  const selectedLkpdSubs = selectedStudent
    ? db.lkpdSubmissions.filter(sub => sub.studentId === selectedStudent.id)
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          REKAP
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
                REKAPITULASI NILAI PER TUGAS
              </span>
              <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
                Standar KKM: 75
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
              Rekap Nilai &amp; Lembar Jawaban Siswa
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Pantau rincian nilai, periksa lembar pengerjaan tulisan tangan &amp; foto coretan evaluasi siswa, serta unduh rekap nilai lengkap ke spreadsheet Excel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <ArrowFillButton
              variant="primary"
              size="lg"
              onClick={handleExportExcel}
              className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 font-black border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] hover:bg-yellow-100 shrink-0"
            >
              <FileSpreadsheet size={20} />
              <span>Unduh Excel (.xlsx)</span>
            </ArrowFillButton>
          </div>
        </div>
      </div>

      {/* Recap Table with Detailed Breakdown */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 shadow-[7px_7px_0px_0px_#0f172a] dark:shadow-[7px_7px_0px_0px_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-black text-slate-950 dark:text-slate-100 font-mono flex items-center gap-2">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
            <span>Tabel Rincian Nilai Per Siswa</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            Total Siswa Terdaftar: {students.length} Orang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#ffe600] border-3 border-slate-950 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas</th>
                <th className="p-3 font-mono text-center">LKPD 1</th>
                <th className="p-3 font-mono text-center">LKPD 2</th>
                <th className="p-3 font-mono text-center">Latsol 1</th>
                <th className="p-3 font-mono text-center">Latsol 2</th>
                <th className="p-3 font-mono text-center">Evaluasi</th>
                <th className="p-3 font-mono text-center">Nilai Akhir</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#111827]">
              {students.map((s, idx) => {
                const lkpd1Sub = db.lkpdSubmissions.find(sub => sub.studentId === s.id && (sub.lkpdId === 'lkpd_1' || sub.lkpdId === lkpdList[0]?.id));
                const lkpd2Sub = db.lkpdSubmissions.find(sub => sub.studentId === s.id && (sub.lkpdId === 'lkpd_2' || sub.lkpdId === lkpdList[1]?.id));

                const lkpd1Score = lkpd1Sub ? (lkpd1Sub.teacherScore ?? lkpd1Sub.aiScore ?? 0) : null;
                const lkpd2Score = lkpd2Sub ? (lkpd2Sub.teacherScore ?? lkpd2Sub.aiScore ?? 0) : null;

                const latsol1Sub = db.latsolSubmissions?.find(sub => sub.studentId === s.id && (sub.roomId === 'room_1' || sub.roomId === latsolRooms[0]?.id));
                const latsol2Sub = db.latsolSubmissions?.find(sub => sub.studentId === s.id && (sub.roomId === 'room_2' || sub.roomId === latsolRooms[1]?.id));

                const latsol1Score = latsol1Sub ? latsol1Sub.score : null;
                const latsol2Score = latsol2Sub ? latsol2Sub.score : null;

                const evalSub = db.evaluationSubmissions?.find(sub => sub.studentId === s.id);
                const evalScore = evalSub
                  ? evalSub.gradingStatus === 'needs_review' && (evalSub.teacherScore === null || evalSub.teacherScore === undefined)
                    ? null
                    : (evalSub.teacherScore ?? evalSub.score ?? 0)
                  : null;

                const scoreArray = [lkpd1Score, lkpd2Score, latsol1Score, latsol2Score, evalScore].filter((sc): sc is number => typeof sc === 'number');
                const avg = scoreArray.length > 0
                  ? Math.round(scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length)
                  : 0;

                const isPassed = avg >= 75;

                return (
                  <tr key={s.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-mono font-black text-slate-400 dark:text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-black text-slate-950 dark:text-slate-100">{s.name}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">NIS: {s.username}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{s.class || '7-A'}</td>

                    {/* LKPD 1 */}
                    <td className="p-3 font-mono font-black text-center">
                      {lkpd1Score !== null ? (
                        <button
                          type="button"
                          onClick={() => handleOpenInspection(s, 'lkpd')}
                          className="px-2.5 py-0.5 rounded-lg bg-lime-100 hover:bg-lime-200 dark:bg-lime-950/70 text-lime-900 dark:text-lime-200 border border-slate-950 dark:border-lime-700 cursor-pointer font-bold transition-transform active:scale-95"
                          title="Klik untuk periksa pengerjaan LKPD"
                        >
                          {lkpd1Score}
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* LKPD 2 */}
                    <td className="p-3 font-mono font-black text-center">
                      {lkpd2Score !== null ? (
                        <button
                          type="button"
                          onClick={() => handleOpenInspection(s, 'lkpd')}
                          className="px-2.5 py-0.5 rounded-lg bg-lime-100 hover:bg-lime-200 dark:bg-lime-950/70 text-lime-900 dark:text-lime-200 border border-slate-950 dark:border-lime-700 cursor-pointer font-bold transition-transform active:scale-95"
                          title="Klik untuk periksa pengerjaan LKPD"
                        >
                          {lkpd2Score}
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Latsol 1 */}
                    <td className="p-3 font-mono font-black text-center">
                      {latsol1Score !== null ? (
                        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border border-slate-950 dark:border-purple-700">
                          {latsol1Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Latsol 2 */}
                    <td className="p-3 font-mono font-black text-center">
                      {latsol2Score !== null ? (
                        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border border-slate-950 dark:border-purple-700">
                          {latsol2Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Evaluasi */}
                    <td className="p-3 font-mono font-black text-center">
                      {evalScore !== null ? (
                        <button
                          type="button"
                          onClick={() => handleOpenInspection(s, 'evaluasi')}
                          className="px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-slate-950 dark:border-amber-700 cursor-pointer font-bold transition-transform active:scale-95 shadow-[1px_1px_0px_0px_#0f172a]"
                          title="Klik untuk melihat lembar jawaban & foto pengerjaan"
                        >
                          {evalScore}
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Rata-rata */}
                    <td className="p-3 font-mono font-black text-center text-sm">
                      <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-950 dark:bg-slate-800 text-[#ffe600] border border-slate-950 dark:border-slate-700 shadow-[1.5px_1.5px_0px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_0px_#000000]">
                        {avg}/100
                      </span>
                    </td>

                    {/* Status Ketuntasan */}
                    <td className="p-3 text-center">
                      <span className={`inline-flex whitespace-nowrap px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono items-center gap-1 border-2 border-slate-950 dark:border-slate-700 ${
                        isPassed
                          ? 'bg-[#a3e635] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                          : 'bg-rose-200 dark:bg-rose-900/70 text-rose-950 dark:text-rose-200'
                      }`}>
                        {isPassed ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        <span>{isPassed ? 'TUNTAS' : 'REMEDIAL'}</span>
                      </span>
                    </td>

                    {/* Action Inspection Button */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenInspection(s, 'evaluasi')}
                        className="px-3 py-1.5 rounded-xl bg-sky-200 hover:bg-sky-300 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs inline-flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                        title="Periksa Lembar Jawaban & Foto Coretan Siswa"
                      >
                        <Eye size={13} />
                        <span>Periksa</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT SUBMISSION INSPECTION MODAL */}
      <Modal
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title={`Lembar Pengerjaan: ${selectedStudent?.name || ''} (${selectedStudent?.class || '7-A'})`}
      >
        {selectedStudent && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            
            {/* Student Header Summary Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#fffdf5] dark:bg-slate-800 border-3 border-slate-950 dark:border-slate-700 shadow-[3px_3px_0px_0px_#0f172a]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedStudent.username}`}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-xl bg-yellow-100 border-2 border-slate-950 shrink-0"
                />
                <div>
                  <h3 className="font-mono font-black text-base text-slate-950 dark:text-slate-100">
                    {selectedStudent.name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    NIS: {selectedStudent.username} &bull; Kelas: {selectedStudent.class || '7-A'}
                  </div>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setActiveTab('evaluasi');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs border-2 border-slate-950 transition-all ${
                    activeTab === 'evaluasi'
                      ? 'bg-[#ffe600] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Evaluasi Sumatif
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setActiveTab('lkpd');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs border-2 border-slate-950 transition-all ${
                    activeTab === 'lkpd'
                      ? 'bg-[#38bdf8] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Tugas LKPD
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: EVALUASI SUMATIF */}
            {activeTab === 'evaluasi' && (
              <div className="space-y-6">
                {!selectedEvalSub ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                    <AlertCircle size={36} className="mx-auto text-amber-500" />
                    <h4 className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      Siswa Belum Mengirimkan Evaluasi
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedStudent.name} belum menyelesaikan atau mengunggah lembar pengerjaan evaluasi sumatif.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Evaluasi Score & Anti-Cheat Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-950 text-slate-950 dark:text-amber-100 shadow-[2px_2px_0px_0px_#0f172a]">
                        <div className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 uppercase">
                          Nilai Otomatis Sistem
                        </div>
                        <div className="text-2xl font-black font-mono">
                          {selectedEvalSub.gradingStatus === 'needs_review' ? 'Menunggu pemeriksaan guru' : `${selectedEvalSub.teacherScore ?? selectedEvalSub.score} / 100`}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-slate-950 text-slate-950 dark:text-purple-100 shadow-[2px_2px_0px_0px_#0f172a]">
                        <div className="text-[10px] font-mono font-bold text-purple-800 dark:text-purple-400 uppercase">
                          Pengawasan Anti-Cheat
                        </div>
                        <div className="text-sm font-black font-mono mt-1">
                          {selectedEvalSub.antiCheat?.switchCount || 0}x Keluar Tab
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Total durasi: {selectedEvalSub.antiCheat?.totalLeaveSeconds || 0} detik
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-lime-50 dark:bg-lime-950/40 border-2 border-slate-950 text-slate-950 dark:text-lime-100 shadow-[2px_2px_0px_0px_#0f172a]">
                        <div className="text-[10px] font-mono font-bold text-lime-800 dark:text-lime-400 uppercase">
                          Waktu Pengumpulan
                        </div>
                        <div className="text-xs font-mono font-bold mt-1">
                          {selectedEvalSub.date || 'Selesai'}
                        </div>
                        <div className="text-[10px] text-lime-700 dark:text-lime-400 font-bold">
                          Status: {selectedEvalSub.status || 'Terkirim'}
                        </div>
                      </div>
                    </div>

                    {/* Teacher Official Grading Card */}
                    <div className="p-5 rounded-2xl bg-[#fffdf5] dark:bg-slate-800 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs uppercase tracking-wider text-slate-950 dark:text-slate-100 flex items-center gap-1.5">
                          <Check size={16} className="text-emerald-600" />
                          <span>Penilaian Resmi &amp; Catatan Guru</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          Guru dapat mengoreksi &amp; memberi feedback
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                        {selectedEvalSub.gradingStatus === 'needs_review' && (
                          <div role="status" className="sm:col-span-4 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs font-bold text-amber-950 dark:text-amber-200">
                            Nilai otomatis ditahan karena setidaknya satu foto belum cocok atau belum terbaca. Periksa foto tiap soal di bawah sebelum menetapkan nilai guru.
                            {selectedEvalSub.aiEvaluation?.overallFeedback && <p className="mt-1">{selectedEvalSub.aiEvaluation.overallFeedback}</p>}
                          </div>
                        )}
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 mb-1">
                            Nilai Guru (0-100):
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={teacherScoreInput}
                            onChange={(e) => setTeacherScoreInput(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 font-mono font-black text-base text-center text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 mb-1">
                            Catatan Masukan / Koreksi untuk Siswa:
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Langkah penyamaan penyebut sudah runtut, tingkatkan ketelitian pada soal nomor 4."
                            value={teacherFeedbackInput}
                            onChange={(e) => setTeacherFeedbackInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 font-sans text-xs text-slate-950 dark:text-slate-100 shadow-[2px_2px_0px_0px_#0f172a]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveTeacherEvaluationGrade}
                          className="px-5 py-2.5 rounded-xl bg-[#a3e635] hover:bg-lime-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save size={15} />
                          <span>Simpan Nilai &amp; Masukan Guru</span>
                        </button>
                      </div>
                    </div>

                    {/* Question by Question Inspection */}
                    <div className="space-y-4">
                      <h4 className="font-mono font-black text-sm text-slate-950 dark:text-slate-100 flex items-center gap-2">
                        <FileText size={16} className="text-amber-500" />
                        <span>Rincian Jawaban Siswa Per Butir Soal ({db.evaluationQuestions.length} Soal)</span>
                      </h4>

                      {db.evaluationQuestions.map((q, idx) => {
                        const studentAnswer = selectedEvalSub.textAnswers?.[q.id] || '';
                        // Support per-question photo (new) or legacy single photo proof (fallback for q1)
                        const studentPhoto =
                          selectedEvalSub.photoProofs?.[q.id] ||
                          (idx === 0 && !selectedEvalSub.photoProofs ? selectedEvalSub.photoProof : '');

                        const isDiscussionOpen = Boolean(revealedDiscussions[q.id]);

                        return (
                          <div
                            key={q.id}
                            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] space-y-3"
                          >
                            {/* Question Title & Weight */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-slate-100 dark:border-slate-800">
                              <span className="font-mono font-black text-xs text-slate-950 dark:text-slate-100">
                                Soal #{idx + 1}: {q.title}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-slate-950 font-mono font-black text-[11px]">
                                Bobot: {q.weight || 20} Poin
                              </span>
                            </div>

                            {/* Question Prompt */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                              {renderFormattedMathText(q.prompt, 'xs')}
                            </div>

                            {/* Student Typed Answer */}
                            <div className="space-y-1">
                              <div className="text-[11px] font-mono font-black text-slate-600 dark:text-slate-400">
                                Jawaban Ketik Siswa:
                              </div>
                              <div className="p-3 rounded-xl bg-[#fffdf5] dark:bg-slate-800 border-2 border-slate-950 text-xs font-mono font-bold whitespace-pre-wrap text-slate-950 dark:text-slate-100">
                                {studentAnswer.trim() ? studentAnswer : (
                                  <span className="text-slate-400 italic">Siswa tidak mengetik jawaban untuk soal ini.</span>
                                )}
                              </div>
                            </div>

                            {/* Student Uploaded Photo Proof for this Question */}
                            <div className="space-y-1 pt-1">
                              <div className="text-[11px] font-mono font-black text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                <ImageIcon size={14} className="text-indigo-500" />
                                <span>Foto Lembar Coretan / Pengerjaan Tulisan Tangan:</span>
                              </div>

                              {studentPhoto ? (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 flex flex-col sm:flex-row items-center gap-4">
                                  <div className="relative group cursor-pointer" onClick={() => setZoomedImage(studentPhoto)}>
                                    <img
                                      src={studentPhoto}
                                      alt={`Foto Jawaban Soal #${idx + 1}`}
                                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono font-black">
                                      <ZoomIn size={20} />
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-center sm:text-left">
                                    <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                      Lembar pengerjaan soal #{idx + 1} berhasil diunggah siswa.
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setZoomedImage(studentPhoto)}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] font-mono font-black text-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                                    >
                                      <ZoomIn size={14} />
                                      <span>Perbesar Foto Lembar Coretan</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-400 italic">
                                  Siswa tidak mengunggah foto coretan untuk butir soal ini.
                                </div>
                              )}
                            </div>

                            {selectedEvalSub.aiEvaluation?.perQuestion[q.id] && (
                              <div role="status" className="rounded-xl border-2 border-purple-300 bg-purple-50 dark:bg-purple-950/30 p-3 text-xs font-bold text-purple-950 dark:text-purple-200 space-y-1">
                                <p><b>Status foto:</b> {selectedEvalSub.aiEvaluation.perQuestion[q.id].imageStatus === 'matched' ? 'Cocok dengan soal' : selectedEvalSub.aiEvaluation.perQuestion[q.id].imageStatus === 'mismatch' ? 'Tidak cocok dengan soal' : selectedEvalSub.aiEvaluation.perQuestion[q.id].imageStatus === 'unreadable' ? 'Tidak terbaca' : selectedEvalSub.aiEvaluation.perQuestion[q.id].reviewStatus === 'needs_review' ? 'Perlu diperiksa guru' : 'Tidak ada foto'}</p>
                                {selectedEvalSub.aiEvaluation.perQuestion[q.id].imageSummary && <p><b>Yang terbaca:</b> {selectedEvalSub.aiEvaluation.perQuestion[q.id].imageSummary}</p>}
                                {selectedEvalSub.aiEvaluation.perQuestion[q.id].diagnosa && <p>{selectedEvalSub.aiEvaluation.perQuestion[q.id].diagnosa}</p>}
                              </div>
                            )}

                            {/* Discussion Toggle */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleDiscussion(q.id)}
                                className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                              >
                                {isDiscussionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                <span>{isDiscussionOpen ? 'Sembunyikan Kunci Pembahasan' : 'Lihat Kunci Langkah Pembahasan'}</span>
                              </button>

                              {isDiscussionOpen && (
                                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border-2 border-purple-300 dark:border-purple-800 text-xs text-purple-950 dark:text-purple-200 leading-relaxed font-bold animate-in fade-in">
                                  {renderFormattedMathText(q.discussion, 'xs')}
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: TUGAS LKPD */}
            {activeTab === 'lkpd' && (
              <div className="space-y-4">
                {selectedLkpdSubs.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                    <AlertCircle size={36} className="mx-auto text-sky-500" />
                    <h4 className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      Belum Ada Pengumpulan LKPD
                    </h4>
                    <p className="text-xs text-slate-500">
                      Siswa belum mengunggah lembar kerja LKPD digital.
                    </p>
                  </div>
                ) : (
                  selectedLkpdSubs.map((sub, sIdx) => {
                    const lkpdMeta = lkpdList.find(l => l.id === sub.lkpdId) || lkpdList[sIdx] || { title: `LKPD #${sIdx + 1}` };
                    return (
                      <div
                        key={sub.id || sIdx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-3 border-slate-950 dark:border-slate-700 shadow-[4px_4px_0px_0px_#0f172a] space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-mono font-black text-sm text-slate-950 dark:text-slate-100">
                              {lkpdMeta.title}
                            </span>
                            <div className="text-[10px] font-mono text-slate-500">
                              Dikumpulkan: {sub.date || 'Selesai'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-lime-100 text-lime-950 border border-slate-950 font-mono font-black text-xs">
                              Nilai AI: {sub.aiScore ?? '-'}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-[#ffe600] text-slate-950 border border-slate-950 font-mono font-black text-xs shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                              Nilai Guru: {sub.teacherScore ?? sub.aiScore ?? '-'}
                            </span>
                          </div>
                        </div>

                        {/* Per-Question Answers in LKPD */}
                        {sub.answers && typeof sub.answers === 'object' && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-mono font-black text-slate-600 dark:text-slate-400">
                              Jawaban &amp; Coretan Per Soal:
                            </div>
                            {Object.entries(sub.answers).map(([qKey, aVal], qIdx) => {
                              const ansObj = typeof aVal === 'object' && aVal !== null ? aVal : { textAnswer: String(aVal || '') };
                              return (
                                <div key={qKey} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                                  <div className="font-mono font-black text-[11px] text-slate-700 dark:text-slate-300">
                                    Butir #{qIdx + 1} ({qKey}):
                                  </div>
                                  <div className="font-bold whitespace-pre-wrap text-slate-950 dark:text-slate-100">
                                    {ansObj.textAnswer || '(Jawaban ketik kosong)'}
                                  </div>
                                  {ansObj.photoUrl && (
                                    <div className="pt-1 flex items-center gap-3">
                                      <img
                                        src={ansObj.photoUrl}
                                        alt={`Bukti LKPD #${qIdx + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-slate-950 cursor-pointer hover:opacity-90"
                                        onClick={() => setZoomedImage(ansObj.photoUrl || null)}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setZoomedImage(ansObj.photoUrl || null)}
                                        className="px-2.5 py-1 rounded-lg bg-sky-200 hover:bg-sky-300 text-slate-950 border border-slate-950 text-xs font-mono font-bold flex items-center gap-1"
                                      >
                                        <ZoomIn size={12} />
                                        <span>Perbesar Foto</span>
                                      </button>
                                    </div>
                                  )}
                                  {ansObj.aiFeedback && (
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                                      <span className="font-bold">Analisis AI:</span> {ansObj.aiFeedback}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* FULL RESOLUTION LIGHTBOX PHOTO VIEWER */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border-4 border-slate-950 rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-yellow-400 cursor-pointer"
              title="Tutup Pratinjau Foto"
            >
              <X size={20} />
            </button>

            <img
              src={zoomedImage}
              alt="Foto Coretan Lembar Pengerjaan Siswa"
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl border-2 border-slate-700"
            />

            <div className="pt-2 text-center text-xs font-mono font-bold text-slate-300">
              Pratinjau Lembar Coretan Tulisan Tangan Siswa (Resolusi Penuh)
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

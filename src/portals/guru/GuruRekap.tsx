import React from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { BarChart3, Download, ShieldAlert, ShieldCheck, CheckCircle2, FileSpreadsheet, Trophy } from 'lucide-react';
import * as XLSX from 'xlsx';

export const GuruRekap: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const db = storageService.getState();
  const students = db.users.filter(u => u.role === 'siswa');
  const lkpdList = db.lkpdList || [];
  const latsolRooms = db.latsolRooms || [];

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
      const evalScore = evalSub ? evalSub.score : 0;

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
        "Nilai Latsol 1 (Quizizz)": latsol1Sub ? latsol1Score : "Belum",
        "Nilai Latsol 2 (Quizizz)": latsol2Sub ? latsol2Score : "Belum",
        "Nilai Evaluasi Sumatif": evalSub ? evalScore : "Belum",
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#ffe600] border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden text-slate-950">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none">
          EXCEL
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
              Rekap Nilai Siswa (Per LKPD, Latsol &amp; Evaluasi)
            </h1>

            <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
              Rincian transparan nilai LKPD 1, LKPD 2, Kuis Latsol 1, Latsol 2, Evaluasi Uraian, serta audit pengawas tab anti-cheat dalam format spreadsheet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <ArrowFillButton
              variant="primary"
              size="lg"
              onClick={handleExportExcel}
              className="bg-white text-slate-950 font-black border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] hover:bg-yellow-100 shrink-0"
            >
              <FileSpreadsheet size={20} />
              <span>Unduh Excel (.xlsx)</span>
            </ArrowFillButton>
          </div>
        </div>
      </div>

      {/* Recap Table with Detailed Breakdown */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[7px_7px_0px_0px_#0f172a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-black text-slate-950 font-mono flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            <span>Tabel Rincian Nilai Per Aktivitas Belajar</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500">
            Total Siswa: {students.length} Orang
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
                <th className="p-3 font-mono text-center">Latihan Soal 1</th>
                <th className="p-3 font-mono text-center">Latihan Soal 2</th>
                <th className="p-3 font-mono text-center">Evaluasi</th>
                <th className="p-3 font-mono text-center">Nilai Akhir</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 bg-white">
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
                const evalScore = evalSub ? evalSub.score : null;

                const scoreArray = [lkpd1Score, lkpd2Score, latsol1Score, latsol2Score, evalScore].filter((sc): sc is number => typeof sc === 'number');
                const avg = scoreArray.length > 0
                  ? Math.round(scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length)
                  : 0;

                const isPassed = avg >= 75;

                return (
                  <tr key={s.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-3 font-mono font-black text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-black text-slate-950">{s.name}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-500">NIS: {s.username}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{s.class || '7-A'}</td>

                    {/* LKPD 1 */}
                    <td className="p-3 font-mono font-black text-center">
                      {lkpd1Score !== null ? (
                        <span className="px-2 py-0.5 rounded-lg bg-lime-100 text-lime-900 border border-slate-950">
                          {lkpd1Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* LKPD 2 */}
                    <td className="p-3 font-mono font-black text-center">
                      {lkpd2Score !== null ? (
                        <span className="px-2 py-0.5 rounded-lg bg-lime-100 text-lime-900 border border-slate-950">
                          {lkpd2Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Latsol 1 */}
                    <td className="p-3 font-mono font-black text-center">
                      {latsol1Score !== null ? (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 border border-slate-950">
                          {latsol1Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Latsol 2 */}
                    <td className="p-3 font-mono font-black text-center">
                      {latsol2Score !== null ? (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 border border-slate-950">
                          {latsol2Score}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Evaluasi */}
                    <td className="p-3 font-mono font-black text-center">
                      {evalScore !== null ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-slate-950">
                          {evalScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    {/* Rata-rata */}
                    <td className="p-3 font-mono font-black text-center text-sm">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-[#ffe600] border border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        {avg}/100
                      </span>
                    </td>

                    {/* Status Ketuntasan */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono inline-flex items-center gap-1 border-2 border-slate-950 ${
                        isPassed
                          ? 'bg-[#a3e635] text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                          : 'bg-rose-200 text-rose-950'
                      }`}>
                        {isPassed ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                        <span>{isPassed ? 'TUNTAS' : 'REMEDIAL'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

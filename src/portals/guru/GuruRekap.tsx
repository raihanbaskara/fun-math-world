import React from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { BarChart3, Download, ShieldAlert, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export const GuruRekap: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const db = storageService.getState();
  const students = db.users.filter(u => u.role === 'siswa');

  const handleExportExcel = () => {
    soundService.click();

    const excelRows = students.map((s, idx) => {
      const lkpd = db.lkpdSubmissions.find(sub => sub.studentId === s.id);
      const evalSub = db.evaluationSubmissions.find(sub => sub.studentId === s.id);

      const lkpdScore = lkpd ? (lkpd.teacherScore || lkpd.aiScore || 0) : 0;
      const evalScore = evalSub ? evalSub.score : 0;
      const tabSwitch = evalSub ? evalSub.antiCheat.switchCount : 0;
      const tabDuration = evalSub ? evalSub.antiCheat.totalLeaveSeconds : 0;

      return {
        "No": idx + 1,
        "NIS / Username": s.username,
        "Nama Lengkap Siswa": s.name,
        "Kelas": s.class || "Kelas 7",
        "Nilai LKPD": lkpdScore,
        "Nilai Evaluasi Essai": evalScore,
        "Jumlah Pindah Tab": tabSwitch,
        "Durasi di Luar Tab (detik)": tabDuration,
        "Status Ketuntasan": evalScore >= 75 ? "TUNTAS" : "BELUM TUNTAS"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai Siswa");

    XLSX.writeFile(workbook, `Rekap_Nilai_Pecahan_SMP7_${new Date().toISOString().slice(0, 10)}.xlsx`);

    soundService.success();
    showToast("File Microsoft Excel (.xlsx) berhasil diunduh!", "success");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="text-brand-600" />
            <span>Rekapitulasi Nilai Siswa</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Rangkuman nilai LKPD, evaluasi soal essai, serta audit integritas perpindahan tab ujian siswa.
          </p>
        </div>

        {/* Download Excel Button */}
        <ArrowFillButton
          variant="primary"
          size="md"
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          <FileSpreadsheet size={18} />
          <span>Ekspor Rekap Excel (.xlsx)</span>
        </ArrowFillButton>
      </div>

      {/* Recap Table */}
      <DoubleBezelCard className="bg-slate-50 border-slate-200/80 p-1.5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4 font-mono">No</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Kelas</th>
                <th className="p-4 font-mono">Nilai LKPD</th>
                <th className="p-4 font-mono">Nilai Evaluasi</th>
                <th className="p-4">Integritas Ujian</th>
                <th className="p-4">Status Ketuntasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((s, idx) => {
                const lkpd = db.lkpdSubmissions.find(sub => sub.studentId === s.id);
                const evalSub = db.evaluationSubmissions.find(sub => sub.studentId === s.id);

                const lkpdScore = lkpd ? (lkpd.teacherScore || lkpd.aiScore || '-') : 'Belum';
                const evalScore = evalSub ? evalSub.score : 'Belum';
                const tabCheat = evalSub ? `${evalSub.antiCheat.switchCount}x (${evalSub.antiCheat.totalLeaveSeconds}d)` : '-';
                const isPassed = typeof evalScore === 'number' && evalScore >= 75;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">NIS: {s.username}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{s.class || '7-A'}</td>
                    <td className="p-4 font-mono font-black text-brand-700">
                      {typeof lkpdScore === 'number' ? `${lkpdScore}/100` : lkpdScore}
                    </td>
                    <td className="p-4 font-mono font-black text-purple-700">
                      {typeof evalScore === 'number' ? `${evalScore}/100` : evalScore}
                    </td>
                    <td className="p-4 text-xs font-mono">
                      {evalSub && evalSub.antiCheat.switchCount > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          {tabCheat}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          Terverifikasi
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono inline-flex items-center gap-1 ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isPassed ? <CheckCircle2 size={12} className="text-emerald-600" /> : <ShieldAlert size={12} className="text-amber-600" />}
                        <span>{isPassed ? "Tuntas (KKM 75)" : "Perlu Remedial"}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DoubleBezelCard>
    </div>
  );
};

import React from 'react';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { Database, Download, Upload, AlertTriangle, RefreshCw, FileJson, HardDriveDownload, ShieldAlert } from 'lucide-react';

export const AdminMaintenance: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
  const db = storageService.getState();

  const handleExportJSON = () => {
    soundService.click();
    const data = storageService.getState();
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonString);
    dlAnchor.setAttribute("download", `Backup_FunMathWorld_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    soundService.success();
    showToast("File backup database JSON berhasil diekspor & diunduh!", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.users && parsed.materials) {
          storageService.update(draft => {
            Object.assign(draft, parsed);
          });
          soundService.success();
          showToast("Database berhasil dipulihkan dari cadangan JSON!", "success");
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast("Format JSON tidak sesuai dengan skema aplikasi Fun Math World!", "error");
        }
      } catch {
        showToast("Gagal membaca berkas JSON! Pastikan berkas valid.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    soundService.click();
    if (confirm("PERINGATAN SISTEM: Apakah Anda yakin ingin mengembalikan seluruh data pengguna, tugas, dan nilai ke setelan awal pabrik?")) {
      storageService.reset();
      sessionStorage.clear();
      soundService.alert();
      showToast("Sistem telah di-reset ke kondisi awal pabrik.", "info");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#38bdf8] text-slate-950 border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tight">
          DATABASE
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              PEMELIHARAAN SISTEM
            </span>
            <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
              Engine: Local Storage Encrypted
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
            Pemeliharaan Basis Data &amp; Cadangan Sistem
          </h1>

          <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
            Cadangkan seluruh rekaman akun, tugas LKPD, hasil kuis, dan materi pembelajaran ke berkas JSON atau pulihkan data cadangan kapan saja.
          </p>
        </div>
      </div>

      {/* 2. Maintenance Action Cards */}
      <div className="space-y-6">
        
        {/* Card 1: Backup Database */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  LANGKAH 1
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-950 font-mono font-black text-xs border-2 border-slate-950">
                  Format JSON
                </span>
              </div>
              <h3 className="font-black text-slate-950 dark:text-slate-100 text-lg sm:text-xl font-mono">
                Cadangkan Basis Data (Export JSON)
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#ffe600] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#0f172a]">
              <Download size={24} />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
            Unduh seluruh berkas snapshot data (akun siswa, guru, materi, modul video, pengumuman, dan riwayat pengerjaan soal) ke komputer Anda.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <HardDriveDownload size={18} />
              <span>Ekspor &amp; Unduh Cadangan JSON</span>
            </button>
          </div>
        </div>

        {/* Card 2: Restore Database */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-700 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#38bdf8] text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  LANGKAH 2
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-slate-950 font-mono font-black text-xs border-2 border-slate-950">
                  Pemulihan Data
                </span>
              </div>
              <h3 className="font-black text-slate-950 dark:text-slate-100 text-lg sm:text-xl font-mono">
                Pulihkan Database dari Berkas (Import JSON)
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#38bdf8] border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#0f172a]">
              <Upload size={24} />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
            Pilih berkas JSON cadangan yang valid untuk menimpa dan memulihkan seluruh struktur data aplikasi ke kondisi sebelumnya.
          </p>

          <div className="p-4 rounded-2xl bg-[#fffdf5] dark:bg-slate-800 border-3 border-slate-950 dark:border-slate-700 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="w-full text-xs font-mono font-bold text-slate-700 dark:text-slate-200 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-2 file:border-slate-950 file:text-xs file:font-mono file:font-black file:bg-[#ffe600] file:text-slate-950 hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer"
            />
          </div>
        </div>

        {/* Card 3: Critical Zone / Factory Reset */}
        <div className="rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border-4 border-slate-950 dark:border-rose-800 p-6 sm:p-7 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-300 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                  ZONA KRITIS
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-mono font-black text-xs border-2 border-slate-950 dark:border-rose-700">
                  Tindakan Berbahaya
                </span>
              </div>
              <h3 className="font-black text-rose-950 dark:text-rose-200 text-lg sm:text-xl font-mono">
                Reset Semua Data ke Setelan Awal Pabrik
              </h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-rose-300 border-3 border-slate-950 text-slate-950 flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#0f172a]">
              <AlertTriangle size={24} />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-300 leading-relaxed">
            Tindakan ini akan menghapus semua pengguna tambahan, tugas LKPD yang dikumpulkan, nilai kuis siswa, dan mengembalikan seluruh database ke kondisi awal instalasi.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleFactoryReset}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-400 hover:bg-rose-500 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <AlertTriangle size={18} />
              <span>Reset Sistem ke Setelan Awal Pabrik</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

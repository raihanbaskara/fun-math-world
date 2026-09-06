import React from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { Database, Download, Upload, AlertTriangle, RefreshCw, FileJson, HardDriveDownload } from 'lucide-react';

export const AdminMaintenance: React.FC<{
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ showToast }) => {
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
    showToast("File backup JSON berhasil diekspor!", "success");
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
        } else {
          showToast("Format JSON tidak sesuai struktur aplikasi!", "error");
        }
      } catch {
        showToast("Gagal membaca berkas JSON!", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm("PERINGATAN SISTEM: Apakah Anda yakin ingin mengembalikan seluruh data pengguna, tugas, dan nilai ke setelan awal pabrik?")) {
      storageService.reset();
      sessionStorage.clear();
      soundService.alert();
      showToast("Sistem telah di-reset ke kondisi awal pabrik.", "info");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Database className="text-purple-600" />
          <span>Pemeliharaan Sistem & Database</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Cadangkan seluruh berkas sistem, pulihkan rekaman data siswa, atau bersihkan basis data.
        </p>
      </div>

      <DoubleBezelCard className="bg-slate-50 border-slate-200/80">
        <div className="space-y-6">
          
          {/* Backup */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                1. Cadangkan Basis Data (Backup JSON)
              </label>
              <span className="text-[10px] font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                Format .json
              </span>
            </div>
            <ArrowFillButton
              variant="purple"
              size="md"
              fullWidth
              onClick={handleExportJSON}
            >
              <Download size={16} />
              <span>Ekspor File Cadangan Database</span>
            </ArrowFillButton>
          </div>

          {/* Restore */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              2. Pulihkan Database (Import JSON)
            </label>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-red-600 block">
              3. Tindakan Berbahaya (Zona Kritis)
            </label>
            <Button
              variant="danger"
              size="md"
              className="w-full h-11 font-bold text-xs rounded-2xl"
              onClick={handleFactoryReset}
            >
              <AlertTriangle size={16} />
              <span>Reset Semua Data ke Setelan Awal Pabrik</span>
            </Button>
          </div>

        </div>
      </DoubleBezelCard>
    </div>
  );
};

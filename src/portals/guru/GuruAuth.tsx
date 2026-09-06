import React, { useState } from 'react';
import { ArrowLeft, UserCheck, KeyRound, User as UserIcon, CheckCircle2, Eye, EyeOff, Sparkles, Award } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User } from '@/types';

export interface GuruAuthProps {
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const GuruAuth: React.FC<GuruAuthProps> = ({
  onLoginSuccess,
  onBackToLanding,
  showToast,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    const db = storageService.getState();
    const user = db.users.find(
      u => u.username === username.trim() && u.password === password.trim() && u.role === 'guru'
    );

    if (!user) {
      soundService.alert();
      showToast('Kredensial Guru Matematika tidak sesuai!', 'error');
      return;
    }

    const newSessionToken = "sess_guru_" + Math.random().toString(36).substring(2) + "_" + Date.now();
    storageService.update(draft => {
      const target = draft.users.find(u => u.id === user.id);
      if (target) {
        target.sessionToken = newSessionToken;
      }
    });

    const updatedUser: User = {
      ...user,
      sessionToken: newSessionToken,
    };

    storageService.setCurrentSessionUser(updatedUser, newSessionToken);
    soundService.success();
    showToast(`Selamat datang, ${updatedUser.name}!`, 'success');
    onLoginSuccess(updatedUser);
  };

  const handleQuickDemo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const db = storageService.getState();
    const user = db.users.find(u => u.username === 'guru' && u.role === 'guru');
    if (user) {
      const newSessionToken = "sess_guru_" + Date.now();
      storageService.update(draft => {
        const target = draft.users.find(u => u.id === user.id);
        if (target) target.sessionToken = newSessionToken;
      });
      const updatedUser: User = {
        ...user,
        sessionToken: newSessionToken,
      };
      storageService.setCurrentSessionUser(updatedUser, newSessionToken);
      soundService.success();
      showToast(`Login demo guru berhasil sebagai ${updatedUser.name}!`, 'success');
      onLoginSuccess(updatedUser);
    }
  };

  return (
    <div className="auth-wrapper select-none">
      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #cecbcb 0%, #bebebe 50%, #dcdcdc 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }

        .auth-card-container-guru {
          position: relative;
          width: 100%;
          max-width: 960px;
          min-height: 580px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .auth-input-field {
          width: 100%;
          background-color: #f1f5f9;
          margin: 7px 0;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          position: relative;
          transition: 0.25s ease;
          border: 1px solid #e2e8f0;
        }

        .auth-input-field:focus-within {
          background-color: #ffffff;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        }

        .auth-input-field .icon {
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .auth-input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 700;
          font-size: 0.875rem;
          color: #0f172a;
          width: 100%;
        }

        .auth-input-field input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        @media (max-width: 870px) {
          .auth-card-container-guru {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .guru-visual-panel {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Floating Back Button */}
      <button
        onClick={onBackToLanding}
        className="fixed top-6 left-6 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 z-50"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Beranda Guru</span>
      </button>

      {/* Main Luxury Auth Card */}
      <div className="auth-card-container-guru max-w-4xl w-full">
        
        {/* Left Visual Panel */}
        <div className="guru-visual-panel bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-wider text-emerald-300 font-mono">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Portal Pendidik Matematika</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Manajemen Kelas & Koreksi Nilai Digital
            </h2>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Pantau pengerjaan LKPD siswa, verifikasi skor evaluasi HOTS berbantuan AI, dan unduh rekapan nilai format Excel.
            </p>
          </div>

          <div className="space-y-2.5 my-auto py-6 relative z-10">
            {[
              'Kelola Materi Teori & Video YouTube',
              'Upload & Distribusi Tugas LKPD Digital',
              'Validasi Hasil Analisis Koreksi AI',
              'Ekspor Rekapitulasi Nilai ke Excel (.xlsx)'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-white shadow-xs backdrop-blur-md">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-3 relative z-10">
            <Award size={18} className="text-emerald-400 shrink-0" />
            <span>Hak Akses Guru Pengajar SMP • Kurikulum Merdeka</span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black mx-auto shadow-sm ring-4 ring-emerald-500/20">
                <UserCheck size={26} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Masuk Akun Guru
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Gunakan NIP / Username Pengajar Matematika
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="auth-input-field">
                <span className="icon"><UserIcon size={18} /></span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="NIP / Username Guru"
                />
              </div>

              <div className="auth-input-field">
                <span className="icon"><KeyRound size={18} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Kata Sandi (Password)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer pl-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="pt-2">
                <InteractiveHoverButton
                  type="submit"
                  fullWidth
                  text="Masuk ke Portal Guru"
                  dotColor="bg-emerald-500"
                />
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

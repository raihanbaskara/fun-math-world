import React, { useState } from 'react';
import { ArrowLeft, UserCheck, KeyRound, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handleQuickDemoGuru = () => {
    setUsername('guru');
    setPassword('guru123');
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
    <div className="min-h-screen w-full bg-[#fffdf5] bg-graph-grid flex flex-col items-center justify-center p-4 relative font-sans text-slate-950 select-none">
      
      {/* Top Floating Back Button */}
      <button
        onClick={() => {
          soundService.click();
          onBackToLanding();
        }}
        className="fixed top-6 left-6 px-4 py-2 rounded-full bg-white border-2 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] text-slate-950 font-black text-xs hover:bg-[#ffe600] transition-all flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none z-50"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Beranda</span>
      </button>

      {/* Main Neobrutal Guru Card */}
      <div className="w-full max-w-md bg-white border-4 border-slate-950 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-6 relative my-12">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b-3 border-slate-950">
          <div className="w-11 h-11 rounded-2xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-[#ffe600] text-slate-950 font-mono font-black text-[10px] rounded border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]">
              PORTAL PENGAJAR
            </span>
            <h2 className="text-xl font-black text-slate-950 font-mono mt-0.5">
              Masuk Akun Guru
            </h2>
          </div>
        </div>

        {/* Demo Sticker */}
        <div className="p-3 bg-amber-100/80 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono font-black text-slate-950">
            <span>⚡ DEMO AKUN GURU:</span>
            <span className="text-[10px] text-slate-700">1 Klik Autologin</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoGuru}
            className="w-full py-2 bg-white text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-[#ffe600] transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
          >
            <KeyRound size={14} />
            <span>Guru: guru (PW: guru123)</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
              NIP / Username Guru:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: guru"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
              Kata Sandi (Password):
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-700 hover:text-slate-950 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-black mt-2"
          >
            Masuk ke Portal Guru
          </Button>
        </form>

      </div>
    </div>
  );
};

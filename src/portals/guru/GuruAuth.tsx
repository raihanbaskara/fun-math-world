import React, { useState } from 'react';
import { ArrowLeft, UserCheck, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#fffdf5] dark:bg-[#090d16] flex flex-col items-center justify-center p-4 relative font-sans text-slate-950 dark:text-slate-100">
      
      {/* Back Button */}
      <button
        onClick={() => {
          soundService.click();
          onBackToLanding();
        }}
        className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] cursor-pointer flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Beranda</span>
      </button>

      {/* Main Neobrutal Guru Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6 relative my-12">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b-3 border-slate-950 dark:border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-[#ffe600] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center font-black text-slate-950">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-[#ffe600] text-slate-950 font-mono font-black text-[10px] rounded border border-slate-950 dark:border-slate-800 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#000000]">
              PORTAL PENGAJAR
            </span>
            <h2 className="text-xl font-black text-slate-950 dark:text-slate-100 font-mono mt-0.5">
              Masuk Akun Guru
            </h2>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              NIP / Username Guru:
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan NIP atau username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi (Password):
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
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

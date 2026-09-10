import React, { useState } from "react";
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, Sparkles, BookOpen, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageService } from "@/services/storageService";
import { soundService } from "@/services/soundService";
import { User } from "@/types";

export interface SiswaAuthProps {
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export default function SiswaAuthSwitch({
  onLoginSuccess,
  onBackToLanding,
  showToast,
}: SiswaAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In State
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regClass, setRegClass] = useState("7-A");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    const db = storageService.getState();
    const user = db.users.find(
      (u) =>
        u.username === signInUsername.trim() &&
        u.password === signInPassword.trim() &&
        u.role === "siswa"
    );

    if (!user) {
      soundService.alert();
      showToast("NIS / Username atau Kata Sandi siswa tidak sesuai!", "error");
      return;
    }

    const newSessionToken = "sess_" + Math.random().toString(36).substring(2) + "_" + Date.now();
    const deviceId = "dev_" + (navigator.userAgent.replace(/\D/g, "").slice(0, 8) || "web");

    storageService.update((draft) => {
      const target = draft.users.find((u) => u.id === user.id);
      if (target) {
        target.sessionToken = newSessionToken;
        target.deviceId = deviceId;
      }
    });

    const updatedUser: User = {
      ...user,
      sessionToken: newSessionToken,
      deviceId: deviceId,
    };

    storageService.setCurrentSessionUser(updatedUser, newSessionToken);
    soundService.success();
    showToast(`Selamat datang, ${updatedUser.name}! Semangat belajar!`, "success");
    onLoginSuccess(updatedUser);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      showToast("Mohon lengkapi semua data pendaftaran!", "error");
      return;
    }

    const db = storageService.getState();
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (existing) {
      showToast("Username / NIS sudah terdaftar! Gunakan username lain.", "error");
      return;
    }

    const newId = "siswa_" + Date.now();
    const newSessionToken = "sess_" + Math.random().toString(36).substring(2) + "_" + Date.now();
    const deviceId = "dev_" + (navigator.userAgent.replace(/\D/g, "").slice(0, 8) || "web");

    const newUser: User = {
      id: newId,
      username: regUsername.trim(),
      password: regPassword.trim(),
      name: regName.trim(),
      role: "siswa",
      class: regClass,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(regName.trim()),
      sessionToken: newSessionToken,
      deviceId: deviceId,
      progress: { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 },
    };

    storageService.update((draft) => {
      draft.users.push(newUser);
    });

    storageService.setCurrentSessionUser(newUser, newSessionToken);
    soundService.success();
    showToast(`Pendaftaran berhasil! Selamat datang, ${newUser.name}!`, "success");
    onLoginSuccess(newUser);
  };

  const handleQuickDemoSiswa = () => {
    setSignInUsername("Baskara99");
    setSignInPassword("12345678");
    handleSignInDirect("Baskara99", "12345678");
  };

  const handleSignInDirect = (uname: string, pass: string) => {
    const db = storageService.getState();
    const user = db.users.find(
      (u) => u.username === uname && u.password === pass && u.role === "siswa"
    );
    if (user) {
      const newSessionToken = "sess_" + Math.random().toString(36).substring(2) + "_" + Date.now();
      const deviceId = "dev_" + (navigator.userAgent.replace(/\D/g, "").slice(0, 8) || "web");

      storageService.update((draft) => {
        const target = draft.users.find((u) => u.id === user.id);
        if (target) {
          target.sessionToken = newSessionToken;
          target.deviceId = deviceId;
        }
      });

      const updatedUser: User = {
        ...user,
        sessionToken: newSessionToken,
        deviceId: deviceId,
      };

      storageService.setCurrentSessionUser(updatedUser, newSessionToken);
      soundService.success();
      showToast(`Login demo siswa berhasil (${updatedUser.name})!`, "success");
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

      {/* Main Neobrutal Login Card */}
      <div className="w-full max-w-md bg-white border-4 border-slate-950 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] space-y-6 relative my-12">
        
        {/* Card Header Tag */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ffe600] border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center font-black">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-[#ffe600] text-slate-950 font-mono font-black text-[10px] rounded border border-slate-950 shadow-[1px_1px_0px_0px_#0f172a]">
                SISWA KELAS 7 SMP
              </span>
              <h2 className="text-xl font-black text-slate-950 font-mono mt-0.5">
                {isSignUp ? "Daftar Akun Baru" : "Masuk Akun Siswa"}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-amber-50 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]">
          <button
            type="button"
            onClick={() => { soundService.click(); setIsSignUp(false); }}
            className={`py-2 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
              !isSignUp ? 'bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { soundService.click(); setIsSignUp(true); }}
            className={`py-2 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
              isSignUp ? 'bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a]' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Quick Demo Login Sticker Button */}
        {!isSignUp && (
          <div className="p-3 bg-amber-100/80 rounded-2xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-black text-slate-950">
              <span>⚡ DEMO AKUN SISWA:</span>
              <span className="text-[10px] text-slate-700">1 Klik Autologin</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoSiswa}
              className="w-full py-2 bg-white text-slate-950 font-mono font-black text-xs rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] hover:bg-[#ffe600] transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
            >
              <KeyRound size={14} />
              <span>Baskara99 (PW: 12345678)</span>
            </button>
          </div>
        )}

        {/* Forms Container */}
        {!isSignUp ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                NIS / Username Siswa:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Baskara99"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                Kata Sandi (Password):
              </label>
              <div className="relative flex items-center">
                <input
                  type={showSignInPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-black mt-2"
            >
              Masuk ke Portal Siswa
            </Button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                Nama Lengkap Siswa:
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Baskara Putra"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                NIS / Username Baru:
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Baskara99"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                Pilih Kelas:
              </label>
              <select
                value={regClass}
                onChange={(e) => setRegClass(e.target.value)}
                className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 outline-none cursor-pointer shadow-[2px_2px_0px_0px_#0f172a]"
              >
                <option value="7-A">Kelas 7-A (SMP)</option>
                <option value="7-B">Kelas 7-B (SMP)</option>
                <option value="7-C">Kelas 7-C (SMP)</option>
                <option value="7-D">Kelas 7-D (SMP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 mb-1">
                Buat Kata Sandi:
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 border-2 border-slate-950 rounded-xl text-xs font-bold text-slate-950 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-black mt-2"
            >
              Daftar &amp; Mulai Belajar
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}

export { SiswaAuthSwitch as SiswaAuth };

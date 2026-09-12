import React, { useState } from "react";
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, Sparkles, BookOpen } from "lucide-react";
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
    const cleanUsername = signInUsername.trim().toLowerCase();
    const cleanPassword = signInPassword.trim();

    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername &&
        u.password.trim() === cleanPassword &&
        u.role === "siswa"
    );

    if (!user) {
      soundService.alert();
      showToast("NIS / Username atau Kata Sandi siswa tidak sesuai!", "error");
      return;
    }

    const newSessionToken = "sess_" + Math.random().toString(36).substring(2) + "_" + Date.now();
    const deviceId = "dev_" + (navigator.userAgent.replace(/\D/g, "").slice(0, 8) || "web");

    const updatedUser: User = {
      ...user,
      sessionToken: newSessionToken,
      deviceId: deviceId,
    };

    // 1. Immediately store in session storage to ensure active session is recognized
    storageService.setCurrentSessionUser(updatedUser, newSessionToken);

    // 2. Update DB and broadcast
    storageService.update((draft) => {
      const target = draft.users.find((u) => u.id === user.id);
      if (target) {
        target.sessionToken = newSessionToken;
        target.deviceId = deviceId;
      }
    });

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

      {/* Main Neobrutal Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-6 relative my-12">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffe600] border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center font-black text-slate-950">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-[#ffe600] text-slate-950 font-mono font-black text-[10px] rounded border border-slate-950 dark:border-slate-800 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#000000]">
                SISWA KELAS 7 SMP
              </span>
              <h2 className="text-xl font-black text-slate-950 dark:text-slate-100 font-mono mt-0.5">
                {isSignUp ? "Daftar Akun Baru" : "Masuk Akun Siswa"}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-amber-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]">
          <button
            type="button"
            onClick={() => { soundService.click(); setIsSignUp(false); }}
            className={`py-2 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
              !isSignUp ? 'bg-[#ffe600] text-slate-950 border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { soundService.click(); setIsSignUp(true); }}
            className={`py-2 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
              isSignUp ? 'bg-[#ffe600] text-slate-950 border-2 border-slate-950 dark:border-slate-800 shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]' : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Forms Container */}
        {!isSignUp ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                NIS / Username Siswa:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck={false}
                  placeholder="Masukkan NIS atau username"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi (Password):
              </label>
              <div className="relative flex items-center">
                <input
                  type={showSignInPassword ? "text" : "password"}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="current-password"
                  spellCheck={false}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
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

            {/* Quick Fill Demo Badges for Phone / Easy Testing */}
            <div className="pt-3 border-t-2 border-slate-950/20 dark:border-slate-800 text-xs">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 font-mono">
                Pilihan Akun Siswa (Klik untuk Isi Otomatis):
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setSignInUsername('siswa1');
                    setSignInPassword('siswa123');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-950 text-[11px] font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  Aisyah (siswa1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setSignInUsername('budi');
                    setSignInPassword('budi123');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-950 text-[11px] font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  Budi (budi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundService.click();
                    setSignInUsername('citra');
                    setSignInPassword('citra123');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-slate-800 text-slate-950 dark:text-slate-200 border border-slate-950 text-[11px] font-mono font-black shadow-[1.5px_1.5px_0px_0px_#0f172a] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  Citra (citra)
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Siswa:
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap siswa"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                NIS / Username Baru:
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan NIS atau username baru"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Pilih Kelas:
              </label>
              <select
                value={regClass}
                onChange={(e) => setRegClass(e.target.value)}
                className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 outline-none cursor-pointer shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000]"
              >
                <option value="7-A" className="dark:bg-slate-900">Kelas 7-A (SMP)</option>
                <option value="7-B" className="dark:bg-slate-900">Kelas 7-B (SMP)</option>
                <option value="7-C" className="dark:bg-slate-900">Kelas 7-C (SMP)</option>
                <option value="7-D" className="dark:bg-slate-900">Kelas 7-D (SMP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Buat Kata Sandi:
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full p-3 bg-amber-50/50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 outline-none shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#000000] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
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

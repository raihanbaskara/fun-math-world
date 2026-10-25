import React, { useState } from "react";
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, Sparkles, BookOpen, Clock, UserCheck, ShieldAlert } from "lucide-react";
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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingApprovalUser, setPendingApprovalUser] = useState<{ name: string; username: string } | null>(null);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    try {
      const db = storageService.getState();
      const cleanUsername = signInUsername.trim().toLowerCase();
      const cleanPassword = signInPassword.trim();

      let user = db.users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername &&
          u.password.trim() === cleanPassword &&
          u.role === "siswa"
      );

      if (!user) {
        // Quick cloud pull in case account was just created from another device
        const remoteUsers = await storageService.pullRemoteUsers();
        user = remoteUsers.find(
          (u) =>
            u.username.toLowerCase() === cleanUsername &&
            u.password.trim() === cleanPassword &&
            u.role === "siswa"
        );
      }

      if (!user) {
        soundService.alert();
        showToast("NIS / Username atau Kata Sandi siswa tidak sesuai!", "error");
        return;
      }

      // Check if student account is approved by admin (unapproved accounts are blocked)
      if (user.role === "siswa" && user.isApproved !== true) {
        soundService.alert();
        setPendingApprovalUser({ name: user.name, username: user.username });
        setShowApprovalModal(true);
        return;
      }

      const now = Date.now();
      const newSessionToken = "sess_" + Math.random().toString(36).substring(2) + "_" + now;
      const deviceId = "dev_" + (navigator.userAgent.replace(/\D/g, "").slice(0, 8) || "web");

      const updatedUser: User = {
        ...user,
        sessionToken: newSessionToken,
        deviceId: deviceId,
        sessionUpdatedAt: now,
      };

      // 1. Immediately store in session storage to ensure active session is recognized
      try {
        storageService.setCurrentSessionUser(updatedUser, newSessionToken);
      } catch (sessionErr) {
        console.warn("Session storage save warning:", sessionErr);
      }

      // 2. Update DB and broadcast
      try {
        storageService.update((draft) => {
          const target = draft.users.find((u) => u.id === user.id);
          if (target) {
            target.sessionToken = newSessionToken;
            target.deviceId = deviceId;
            target.sessionUpdatedAt = now;
          }
        });
      } catch (updateErr) {
        console.warn("Storage update warning:", updateErr);
      }

      // 3. Realtime instant broadcast to kick any older active sessions across browsers
      storageService.broadcastLogin(user.id, newSessionToken, deviceId, now);
      storageService.pushUserSessionDirect(user.id, newSessionToken, deviceId, now);

      soundService.success();
      showToast(`Selamat datang, ${updatedUser.name}! Semangat belajar!`, "success");
      onLoginSuccess(updatedUser);
    } catch (globalErr) {
      console.error("Critical login error:", globalErr);
      showToast("Terjadi kendala saat masuk. Silakan coba lagi.", "error");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    try {
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

      const now = Date.now();
      const newId = "siswa_" + now;

      const newUser: User = {
        id: newId,
        username: regUsername.trim(),
        password: regPassword.trim(),
        name: regName.trim(),
        role: "siswa",
        class: regClass,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(regName.trim()),
        sessionToken: null,
        deviceId: null,
        sessionUpdatedAt: 0,
        isApproved: false, // Menunggu persetujuan (ACC) dari Admin
        progress: { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 },
      };

      try {
        storageService.update((draft) => {
          draft.users.push(newUser);
        });
      } catch (updateErr) {
        console.warn("Storage update warning on register:", updateErr);
      }

      storageService.broadcastUserCreated(newUser);

      soundService.success();
      // Pre-fill login username and switch back to sign in view
      setSignInUsername(regUsername.trim());
      setSignInPassword("");
      setIsSignUp(false);
      setPendingApprovalUser({ name: newUser.name, username: newUser.username });
      setShowApprovalModal(true);
      showToast(`Pendaftaran berhasil! Akun ${newUser.name} sedang menunggu ACC Admin.`, "info");
    } catch (globalErr) {
      console.error("Critical register error:", globalErr);
      showToast("Terjadi kendala saat mendaftar. Silakan coba lagi.", "error");
    }
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

      {/* Approval Pending Modal - High End Neo-Brutalist Architecture */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] border-4 border-slate-950 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#0f172a] dark:shadow-[8px_8px_0px_0px_#000000] space-y-5 text-center">
            
            {/* Double-Bezel Header Icon */}
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 border-3 border-slate-950 dark:border-slate-700 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-[4px_4px_0px_0px_#0f172a]">
              <Clock size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-3 py-1 bg-[#ffe600] text-slate-950 border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#0f172a] inline-block">
                STATUS PENDAFTARAN SISWA
              </span>
              <h3 className="text-xl font-black font-mono text-slate-950 dark:text-slate-100 mt-2">
                Menunggu Persetujuan Admin
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed text-left">
                Akun siswa {pendingApprovalUser?.name ? <b>{pendingApprovalUser.name}</b> : 'Anda'} telah berhasil dicatat ke dalam sistem. Demi integritas pembelajaran dan keamanan data kelas, akun baru harus disetujui (di-ACC) oleh Guru / Admin Lab sebelum dapat masuk.
              </p>
            </div>

            {/* Stepper info */}
            <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-4 font-mono text-xs text-left space-y-2 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_0px_#0f172a]">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-300 text-emerald-950 font-black flex items-center justify-center shrink-0 border border-slate-950 text-[10px]">
                  1
                </span>
                <span className="font-bold">Data pendaftaran telah terkirim ke Portal Admin.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#ffe600] text-slate-950 font-black flex items-center justify-center shrink-0 border border-slate-950 text-[10px]">
                  2
                </span>
                <span className="font-bold">Sampaikan kepada Guru Matematika / Admin sekolah untuk menyetujui akunmu.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-lg bg-cyan-300 text-cyan-950 font-black flex items-center justify-center shrink-0 border border-slate-950 text-[10px]">
                  3
                </span>
                <span className="font-bold">Setelah di-ACC, silakan masuk dengan Username &amp; Password yang didaftarkan.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  soundService.click();
                  setShowApprovalModal(false);
                }}
                className="w-full py-3.5 bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono text-xs font-black rounded-2xl border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-[4px_4px_0px_0px_#000000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Saya Mengerti &amp; Kembali ke Halaman Masuk
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export { SiswaAuthSwitch as SiswaAuth };

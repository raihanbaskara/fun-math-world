import React, { useState } from "react";
import { ArrowLeft, User as UserIcon, Lock, GraduationCap, ShieldCheck, Eye, EyeOff, Sparkles, BookOpen } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
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
    showToast(`Selamat datang, ${updatedUser.name}! Semangat belajar 🚀`, "success");
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
      progress: { materi: 0, video: 0, lkpd: 0, evaluasi: 0 },
    };

    storageService.update((draft) => {
      draft.users.push(newUser);
    });

    storageService.setCurrentSessionUser(newUser, newSessionToken);
    soundService.success();
    showToast(`Pendaftaran berhasil! Selamat datang, ${newUser.name} 🎉`, "success");
    onLoginSuccess(newUser);
  };

  const handleQuickLogin = (uname: string, pass: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSignInUsername(uname);
    setSignInPassword(pass);
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
      showToast(`Login demo berhasil sebagai ${updatedUser.name}! 🚀`, "success");
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

        .auth-card-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          min-height: 620px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6);
          overflow: hidden;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        form.auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          width: 100%;
        }

        form.sign-up-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        form.sign-in-form {
          z-index: 2;
        }

        .auth-title {
          font-size: 1.85rem;
          color: #0f172a;
          margin-bottom: 6px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .auth-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
        }

        .auth-input-field {
          max-width: 380px;
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
          border-color: #00ffc6;
          box-shadow: 0 0 0 3px rgba(0, 255, 198, 0.25);
        }

        .auth-input-field .icon {
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .auth-input-field input, .auth-input-field select {
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

        .auth-btn {
          width: 100%;
          max-width: 380px;
          background: #00ffc6;
          border: none;
          outline: none;
          height: 48px;
          border-radius: 16px;
          color: #090d16;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: 0.05em;
          margin: 14px 0 6px 0;
          cursor: pointer;
          transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 0.825rem;
          box-shadow: 0 8px 20px -4px rgba(0, 255, 198, 0.4);
        }

        .auth-btn:hover {
          background: #00e5b2;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -4px rgba(0, 255, 198, 0.5);
        }

        .auth-btn:active {
          transform: translateY(0);
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
          padding: 3rem 14%;
        }

        .left-panel {
          pointer-events: all;
        }

        .right-panel {
          pointer-events: none;
        }

        .panel .content {
          color: #0f172a;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .panel h3 {
          font-weight: 900;
          line-height: 1.15;
          font-size: 1.65rem;
          margin-bottom: 12px;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .panel p {
          font-size: 0.825rem;
          line-height: 1.6;
          color: #334155;
          margin-bottom: 24px;
          max-width: 320px;
          font-weight: 500;
        }

        .auth-btn-transparent {
          background: #ffffff;
          border: 2px solid #0f172a;
          padding: 0 28px;
          height: 44px;
          border-radius: 14px;
          color: #0f172a;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .auth-btn-transparent:hover {
          background: #0f172a;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        /* Animated Circular Studio Curtain matching 3D robot background */
        .auth-card-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #e2e8f0 0%, #cecbcb 40%, #bebebe 100%);
          transition: 1.8s cubic-bezier(0.77, 0, 0.175, 1);
          border-radius: 50%;
          z-index: 6;
          box-shadow: inset 0 0 80px rgba(0,0,0,0.05);
        }

        .auth-card-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-card-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-card-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-card-container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
          pointer-events: all;
        }

        .auth-card-container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        .auth-card-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-card-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-card-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        @media (max-width: 870px) {
          .auth-card-container {
            min-height: 760px;
          }
          .signin-signup {
            width: 100%;
            top: 92%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-card-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 0;
          }
          .auth-card-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-card-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-card-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-card-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-card-container.sign-up-mode .signin-signup {
            top: 10%;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Top Floating Back Button */}
      <button
        onClick={onBackToLanding}
        className="fixed top-6 left-6 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 border border-white shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 z-50"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Beranda Siswa</span>
      </button>

      {/* Main 21st.dev Auth Switch Container */}
      <div className={`auth-card-container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            
            {/* 1. SIGN IN FORM */}
            <form className="auth-form sign-in-form" onSubmit={handleSignIn}>
              <div className="w-12 h-12 rounded-2xl bg-[#00ffc6] flex items-center justify-center text-slate-950 font-black mb-3 shadow-sm ring-4 ring-[#00ffc6]/20">
                <GraduationCap size={26} />
              </div>
              <h2 className="auth-title">Masuk Akun Siswa</h2>
              <p className="auth-subtitle">Gunakan NIS / Username siswa yang terdaftar</p>

              {/* Username Input */}
              <div className="auth-input-field">
                <span className="icon"><UserIcon size={18} /></span>
                <input
                  type="text"
                  placeholder="NIS / Username Siswa"
                  required
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="auth-input-field">
                <span className="icon"><Lock size={18} /></span>
                <input
                  type={showSignInPassword ? "text" : "password"}
                  placeholder="Kata Sandi (Password)"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer pl-2"
                >
                  {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="w-full max-w-[380px] mt-3">
                <InteractiveHoverButton
                  type="submit"
                  fullWidth
                  text="Masuk ke Portal Siswa"
                  dotColor="bg-[#00ffc6]"
                />
              </div>
            </form>

            {/* 2. SIGN UP FORM */}
            <form className="auth-form sign-up-form" onSubmit={handleSignUp}>
              <div className="w-12 h-12 rounded-2xl bg-[#00ffc6] flex items-center justify-center text-slate-950 font-black mb-3 shadow-sm ring-4 ring-[#00ffc6]/20">
                <BookOpen size={24} />
              </div>
              <h2 className="auth-title">Daftar Siswa Baru</h2>
              <p className="auth-subtitle">Lengkapi identitas untuk mulai belajar matematika</p>

              {/* Full Name */}
              <div className="auth-input-field">
                <span className="icon"><UserIcon size={18} /></span>
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              {/* Username NIS */}
              <div className="auth-input-field">
                <span className="icon"><Sparkles size={18} /></span>
                <input
                  type="text"
                  placeholder="NIS / Username Baru"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>

              {/* Class Select */}
              <div className="auth-input-field">
                <span className="icon"><GraduationCap size={18} /></span>
                <select
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="cursor-pointer font-bold text-slate-900"
                >
                  <option value="7-A">Kelas 7-A (SMP)</option>
                  <option value="7-B">Kelas 7-B (SMP)</option>
                  <option value="7-C">Kelas 7-C (SMP)</option>
                  <option value="7-D">Kelas 7-D (SMP)</option>
                </select>
              </div>

              {/* Password */}
              <div className="auth-input-field">
                <span className="icon"><Lock size={18} /></span>
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Buat Kata Sandi"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer pl-2"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="w-full max-w-[380px] mt-3">
                <InteractiveHoverButton
                  type="submit"
                  fullWidth
                  text="Daftar & Mulai Belajar"
                  dotColor="bg-[#00ffc6]"
                />
              </div>
            </form>

          </div>
        </div>

        {/* Sliding Curtains / Panels */}
        <div className="panels-container">
          
          {/* Left Panel: Invites User to Sign Up */}
          <div className="panel left-panel">
            <div className="content">
              <div className="w-16 h-16 rounded-3xl bg-white/90 border border-white shadow-md flex items-center justify-center text-brand-600 mb-4">
                <Sparkles size={32} />
              </div>
              <h3>Belum Punya Akun Siswa</h3>
              <p>
                Bergabunglah bersama teman-temanmu di Fun Math. Jelajahi studio pecahan 3D, kalkulator pintar, dan kerjakan LKPD digital!
              </p>
              <button
                type="button"
                className="auth-btn-transparent"
                onClick={() => {
                  soundService.click();
                  setIsSignUp(true);
                }}
              >
                Daftar Siswa Baru
              </button>
            </div>
          </div>

          {/* Right Panel: Invites User to Sign In */}
          <div className="panel right-panel">
            <div className="content">
              <div className="w-16 h-16 rounded-3xl bg-white/90 border border-white shadow-md flex items-center justify-center text-emerald-600 mb-4">
                <GraduationCap size={32} />
              </div>
              <h3>Sudah Punya Akun</h3>
              <p>
                Selamat datang kembali! Masuk sekarang untuk melanjutkan progres belajar pecahan dan melihat hasil evaluasimu.
              </p>
              <button
                type="button"
                className="auth-btn-transparent"
                onClick={() => {
                  soundService.click();
                  setIsSignUp(false);
                }}
              >
                Masuk ke Akun
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export { SiswaAuthSwitch as SiswaAuth };

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { storageService, getSessionTimestamp } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, DatabaseState } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

// Dedicated Landing Portals (3D Robot Hero + Cards)
import { SiswaLanding } from '@/portals/siswa/SiswaLanding';
import { GuruLanding } from '@/portals/guru/GuruLanding';
import { AdminLanding } from '@/portals/admin/AdminLanding';

// Dedicated Login Portals
import { SiswaAuth } from '@/portals/siswa/SiswaAuth';
import { GuruAuth } from '@/portals/guru/GuruAuth';
import { AdminAuth } from '@/portals/admin/AdminAuth';

// Siswa Modules
import { SiswaHome } from '@/portals/siswa/SiswaHome';
import { SiswaMateri } from '@/portals/siswa/SiswaMateri';
import { SiswaVideo } from '@/portals/siswa/SiswaVideo';
import { SiswaStudio } from '@/portals/siswa/SiswaStudio';
import { SiswaKalkulator } from '@/portals/siswa/SiswaKalkulator';
import { SiswaLKPD } from '@/portals/siswa/SiswaLKPD';
import { SiswaLatsol } from '@/portals/siswa/SiswaLatsol';
import { SiswaEvaluasi } from '@/portals/siswa/SiswaEvaluasi';
import { SiswaRefleksi } from '@/portals/siswa/SiswaRefleksi';
import { SiswaPengumuman } from '@/portals/siswa/SiswaPengumuman';
import { SiswaProfil } from '@/portals/siswa/SiswaProfil';
import { SiswaNilai } from '@/portals/siswa/SiswaNilai';

// Guru Modules
import { GuruDashboard } from '@/portals/guru/GuruDashboard';
import { GuruDaftarSiswa } from '@/portals/guru/GuruDaftarSiswa';
import { GuruMateri } from '@/portals/guru/GuruMateri';
import { GuruLKPD } from '@/portals/guru/GuruLKPD';
import { GuruLatsol } from '@/portals/guru/GuruLatsol';
import { GuruSoal } from '@/portals/guru/GuruSoal';
import { GuruRekap } from '@/portals/guru/GuruRekap';
import { GuruPengumuman } from '@/portals/guru/GuruPengumuman';

// Admin Modules
import { AdminDashboard } from '@/portals/admin/AdminDashboard';
import { AdminUsers } from '@/portals/admin/AdminUsers';
import { AdminMaintenance } from '@/portals/admin/AdminMaintenance';

interface Toast {
  id: string;
  msg: string;
  type: 'info' | 'success' | 'error';
}

export function App() {
  const [db, setDb] = useState<DatabaseState>(storageService.getState());
  const [currentUser, setCurrentUser] = useState<User | null>(storageService.getCurrentSessionUser());
  const [currentRoute, setCurrentRoute] = useState<string>('siswa');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // System Modals
  const [modalType, setModalType] = useState<'about' | 'security' | 'policy' | 'sessionKicked' | null>(null);

  // Synchronous ref to prevent stale closures in navigation & event listeners
  const currentUserRef = useRef<User | null>(currentUser);
  const isInternalNavRef = useRef<boolean>(false);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storageService.subscribe(newState => {
      setDb({ ...newState });
      const sessUser = storageService.getCurrentSessionUser();
      setCurrentUser(sessUser);
      currentUserRef.current = sessUser;
    });
    return () => unsub();
  }, []);

  // Theme synchronization: enforce light mode by default
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    if (db.settings.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [db.settings.darkMode]);

  const navigateTo = useCallback((route: string, updateHash = true, userOverride?: User | null) => {
    // Authoritative user resolution: userOverride > ref > session storage
    const activeUser = userOverride !== undefined
      ? userOverride
      : (currentUserRef.current || storageService.getCurrentSessionUser());

    // Route guarding for authenticated pages
    if (route.startsWith('siswa/') && route !== 'siswa/login') {
      if (!activeUser || activeUser.role !== 'siswa') {
        route = 'siswa/login';
      }
    } else if (route.startsWith('guru/') && route !== 'guru/login') {
      if (!activeUser || activeUser.role !== 'guru') {
        route = 'guru/login';
      }
    } else if (route.startsWith('admin/') && route !== 'admin/login') {
      if (!activeUser || activeUser.role !== 'admin') {
        route = 'admin/login';
      }
    }

    if (activeUser) {
      setCurrentUser(activeUser);
      currentUserRef.current = activeUser;
    }

    setCurrentRoute(route);
    setIsMobileSidebarOpen(false);

    if (updateHash) {
      isInternalNavRef.current = true;
      window.location.hash = `#/${route}`;
      setTimeout(() => {
        isInternalNavRef.current = false;
      }, 300);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // URL hash & pathname sync
  useEffect(() => {
    const handleHash = () => {
      if (isInternalNavRef.current) return;
      let targetRoute = window.location.hash.replace(/^#\/?/, '').trim();
      
      // Fallback to pathname if hash is empty (e.g. user accessed /admin or /guru)
      if (!targetRoute) {
        const path = window.location.pathname.replace(/^\//, '').trim();
        if (path && path !== 'index.html') {
          targetRoute = path;
        }
      }

      if (!targetRoute || targetRoute === 'landing') {
        targetRoute = 'siswa';
      }

      // Avoid re-navigating to the same route and risking bouncing on mobile
      if (targetRoute === currentRoute) return;

      const activeUser = currentUserRef.current || storageService.getCurrentSessionUser();
      navigateTo(targetRoute, false, activeUser);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigateTo, currentRoute]);

  // 1 Akun 1 Device Liveness Watcher (Triple Redundancy: Realtime Broadcast + Cloud Poll + Local State)
  useEffect(() => {
    let isChecking = false;

    const checkTokenKick = (dbUser?: User, localToken?: string | null): boolean => {
      if (!dbUser || !dbUser.sessionToken || !localToken) return false;
      if (dbUser.sessionToken === localToken) return false;

      const localTs = getSessionTimestamp(localToken);
      const cloudTs = getSessionTimestamp(dbUser.sessionToken);

      // If cloud/DB has a NEWER token than our local session, kick immediately!
      return cloudTs > localTs;
    };

    const triggerKick = (role?: string) => {
      storageService.clearCurrentSession();
      setCurrentUser(null);
      currentUserRef.current = null;
      setModalType('sessionKicked');
      soundService.alert();
      const targetRole = (role === 'guru' ? 'guru' : role === 'admin' ? 'admin' : 'siswa') as 'siswa' | 'guru' | 'admin';
      navigateTo(targetRole, true, null);
    };

    const checkSessionLiveness = async () => {
      if (isChecking) return;
      isChecking = true;

      try {
        let stored: string | null = null;
        try {
          stored = sessionStorage.getItem("FMW_CURRENT_USER") || localStorage.getItem("FMW_CURRENT_USER");
        } catch {}

        if (!stored) {
          isChecking = false;
          return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed || !parsed.id || !parsed.sessionToken) {
          isChecking = false;
          return;
        }

        // 1. Check local state (updated instantaneously by Realtime broadcast or sync)
        const currentInDb = storageService.getState().users.find(u => u.id === parsed.id);
        if (checkTokenKick(currentInDb, parsed.sessionToken)) {
          triggerKick(parsed.role);
          isChecking = false;
          return;
        }

        // 2. Active Cloud Poll (fetches 14KB users in ~200ms)
        const remoteUsers = await storageService.pullRemoteUsers();
        const latestInDb = remoteUsers.find(u => u.id === parsed.id);
        if (checkTokenKick(latestInDb, parsed.sessionToken)) {
          triggerKick(parsed.role);
          isChecking = false;
          return;
        }
      } catch (err) {
        console.warn('[Liveness] Session check error:', err);
      } finally {
        isChecking = false;
      }
    };

    // Fast reactive listener to storage state changes
    const unsubscribe = storageService.subscribe((state) => {
      let stored: string | null = null;
      try {
        stored = sessionStorage.getItem("FMW_CURRENT_USER") || localStorage.getItem("FMW_CURRENT_USER");
      } catch {}
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.sessionToken) {
          const dbUser = state.users.find(u => u.id === parsed.id);
          if (checkTokenKick(dbUser, parsed.sessionToken)) {
            triggerKick(parsed.role);
          }
        }
      } catch {}
    });

    // Native HTML5 BroadcastChannel for instantaneous (0ms) kick between tabs in the same browser profile
    let localBc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        localBc = new BroadcastChannel('fmw_session_sync');
        localBc.onmessage = (event) => {
          const data = event.data;
          if (!data || !data.userId || !data.sessionToken) return;
          let stored: string | null = null;
          try {
            stored = sessionStorage.getItem("FMW_CURRENT_USER") || localStorage.getItem("FMW_CURRENT_USER");
          } catch {}
          if (!stored) return;
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.id === data.userId && parsed?.sessionToken !== data.sessionToken) {
              const localTs = getSessionTimestamp(parsed.sessionToken);
              const incomingTs = data.timestamp || getSessionTimestamp(data.sessionToken);
              if (incomingTs > localTs) {
                triggerKick(parsed.role);
              }
            }
          } catch {}
        };
      }
    } catch {}

    // Storage event listener: fires immediately on all other tabs in the same browser when localStorage updates
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'FMW_CURRENT_USER' && e.newValue) {
        try {
          const incoming = JSON.parse(e.newValue);
          let currentStored = sessionStorage.getItem("FMW_CURRENT_USER");
          if (currentStored) {
            const myParsed = JSON.parse(currentStored);
            if (myParsed.id === incoming.id && myParsed.sessionToken !== incoming.sessionToken) {
              const localTs = getSessionTimestamp(myParsed.sessionToken);
              const incomingTs = getSessionTimestamp(incoming.sessionToken);
              if (incomingTs > localTs) {
                triggerKick(myParsed.role);
              }
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Run check every 3500ms
    const interval = setInterval(checkSessionLiveness, 3500);

    // Also run immediately on focus or when tab visibility changes
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        checkSessionLiveness();
      }
    };
    window.addEventListener('visibilitychange', onFocusOrVisible);
    window.addEventListener('focus', onFocusOrVisible);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onFocusOrVisible);
      window.removeEventListener('focus', onFocusOrVisible);
      window.removeEventListener('storage', handleStorageEvent);
      if (localBc) {
        try {
          localBc.close();
        } catch {}
      }
    };
  }, [navigateTo]);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = "t_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const handleLogout = (role: 'siswa' | 'guru' | 'admin' = 'siswa') => {
    if (currentUser) {
      storageService.update(draft => {
        const user = draft.users.find(u => u.id === currentUser.id);
        if (user) {
          user.sessionToken = null;
          user.sessionUpdatedAt = Date.now();
        }
      });
    }
    storageService.clearCurrentSession();
    setCurrentUser(null);
    showToast("Berhasil keluar dari akun.", "info");
    navigateTo(role);
  };

  // Compute Unread Announcements for student
  const unreadCount = currentUser?.role === 'siswa'
    ? db.announcements.filter(a => !(currentUser.readAnnouncements || []).includes(a.id)).length
    : 0;

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextMode = !db.settings.darkMode;
    storageService.update(draft => {
      draft.settings.darkMode = nextMode;
    });
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast(nextMode ? "🌙 Mode Gelap Aktif" : "☀️ Mode Terang Aktif", "info");
  };

  // Toggle Sound
  const handleToggleSound = () => {
    storageService.update(draft => {
      draft.settings.soundEnabled = !draft.settings.soundEnabled;
    });
    showToast(db.settings.soundEnabled ? "🔇 Suara Dimatikan" : "🔊 Suara Diaktifkan", "info");
  };

  // Sidebar responsive toggle
  const handleToggleSidebar = () => {
    soundService.click();
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  // Determine which unauthenticated / landing view to show
  const isLandingView = currentRoute === 'siswa' || currentRoute === 'guru' || currentRoute === 'admin';
  const isAuthView = currentRoute === 'siswa/login' || currentRoute === 'guru/login' || currentRoute === 'admin/login';
  const isAuthenticatedDashboard = !isLandingView && !isAuthView && currentUser;

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf5] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* Toast Notification Stack - Front & Center with supreme z-index (z-[100000]) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-[100000] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3.5 sm:p-4 rounded-2xl border-3 border-slate-950 dark:border-slate-800 shadow-[6px_6px_0px_0px_#0f172a] dark:shadow-[6px_6px_0px_0px_#000000] text-xs sm:text-sm font-mono font-black flex items-center justify-between gap-3 pointer-events-auto transform transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
              t.type === 'error'
                ? 'bg-red-500 text-white ring-4 ring-red-200 dark:ring-red-900/50'
                : t.type === 'success'
                ? 'bg-[#ffe600] text-slate-950 ring-4 ring-yellow-200 dark:ring-yellow-900/50'
                : 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 ring-4 ring-slate-200 dark:ring-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === 'error' && <ShieldAlert size={18} className="shrink-0 text-white" />}
              {t.type === 'success' && <CheckCircle2 size={18} className="shrink-0 text-slate-950" />}
              {t.type === 'info' && <Info size={18} className="shrink-0 text-amber-500 dark:text-amber-400" />}
              <span className="break-words leading-snug">{t.msg}</span>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className={`p-1 rounded-lg hover:bg-black/15 dark:hover:bg-white/15 transition cursor-pointer shrink-0 ${
                t.type === 'error' ? 'text-white/90 hover:text-white' : 'text-slate-950 dark:text-slate-100'
              }`}
              title="Tutup Notifikasi"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* 1. ROUTE: /siswa (Landing Page Siswa with 3D Robot Mascot) */}
      {currentRoute === 'siswa' && (
        <SiswaLanding
          currentUser={currentUser}
          onNavigate={(target) => {
            const u = currentUserRef.current || storageService.getCurrentSessionUser();
            if (u && u.role === 'siswa') {
              if (target === 'siswa/login' || target === 'siswa/home') {
                navigateTo('siswa/home', true, u);
                return;
              }
            }
            navigateTo(target);
          }}
        />
      )}

      {/* 2. ROUTE: /guru (Landing Page Guru with 3D Robot Mascot) */}
      {currentRoute === 'guru' && (
        <GuruLanding
          onNavigate={(target) => {
            const u = currentUserRef.current || storageService.getCurrentSessionUser();
            if (target === 'guru/login' && u && u.role === 'guru') {
              navigateTo('guru/dashboard', true, u);
            } else {
              navigateTo(target);
            }
          }}
        />
      )}

      {/* 3. ROUTE: /admin (Landing Page Admin with 3D Robot Mascot) */}
      {currentRoute === 'admin' && (
        <AdminLanding
          onNavigate={(target) => {
            const u = currentUserRef.current || storageService.getCurrentSessionUser();
            if (target === 'admin/login' && u && u.role === 'admin') {
              navigateTo('admin/dashboard', true, u);
            } else {
              navigateTo(target);
            }
          }}
        />
      )}

      {/* 4. ROUTE: /siswa/login (Dedicated Login & Register Siswa) */}
      {currentRoute === 'siswa/login' && (
        <SiswaAuth
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            currentUserRef.current = user;
            navigateTo('siswa/home', true, user);
          }}
          onBackToLanding={() => navigateTo('siswa')}
          showToast={showToast}
        />
      )}

      {/* 5. ROUTE: /guru/login (Dedicated Login Guru) */}
      {currentRoute === 'guru/login' && (
        <GuruAuth
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            currentUserRef.current = user;
            navigateTo('guru/dashboard', true, user);
          }}
          onBackToLanding={() => navigateTo('guru')}
          showToast={showToast}
        />
      )}

      {/* 6. ROUTE: /admin/login (Dedicated Login Admin) */}
      {currentRoute === 'admin/login' && (
        <AdminAuth
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            currentUserRef.current = user;
            navigateTo('admin/dashboard', true, user);
          }}
          onBackToLanding={() => navigateTo('admin')}
          showToast={showToast}
        />
      )}

      {/* 7. AUTHENTICATED DASHBOARD COCKPIT */}
      {isAuthenticatedDashboard && (
        <>
          <Navbar
            currentUser={currentUser}
            onLogout={() => handleLogout(currentUser.role)}
            onToggleSidebar={handleToggleSidebar}
            onNavigateLanding={() => {
              const u = currentUserRef.current || storageService.getCurrentSessionUser();
              if (u) {
                if (u.role === 'siswa') navigateTo('siswa/home');
                else if (u.role === 'guru') navigateTo('guru/dashboard');
                else if (u.role === 'admin') navigateTo('admin/dashboard');
              } else {
                navigateTo('siswa');
              }
            }}
            darkMode={db.settings.darkMode}
            onToggleDarkMode={handleToggleTheme}
            soundEnabled={db.settings.soundEnabled}
            onToggleSound={handleToggleSound}
          />

          <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
            
            {/* Desktop Sidebar (Collapsible with smooth transition) */}
            <div
              className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 ${
                isSidebarOpen
                  ? 'w-68 opacity-100'
                  : 'w-0 opacity-0 overflow-hidden -mr-6 pointer-events-none'
              }`}
            >
              <Sidebar
                currentRoute={currentRoute}
                onNavigate={(route) => navigateTo(route)}
                currentUser={currentUser}
                unreadCount={unreadCount}
                onLogout={() => handleLogout(currentUser.role)}
              />
            </div>

            {/* Mobile Sidebar (Off-canvas Drawer with Backdrop) */}
            {isMobileSidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
                <div
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white p-3 shadow-2xl overflow-y-auto">
                  <Sidebar
                    currentRoute={currentRoute}
                    onNavigate={(route) => {
                      navigateTo(route);
                      setIsMobileSidebarOpen(false);
                    }}
                    currentUser={currentUser}
                    unreadCount={unreadCount}
                    onLogout={() => handleLogout(currentUser.role)}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 transition-all duration-300">
              {/* Siswa Portals */}
              {currentRoute === 'siswa/home' && <SiswaHome currentUser={currentUser} onNavigate={navigateTo} />}
              {currentRoute === 'siswa/materi' && <SiswaMateri onNavigate={navigateTo} />}
              {currentRoute === 'siswa/video' && <SiswaVideo />}
              {currentRoute === 'siswa/studio' && <SiswaStudio />}
              {currentRoute === 'siswa/kalkulator' && <SiswaKalkulator showToast={showToast} />}
              {currentRoute === 'siswa/lkpd' && <SiswaLKPD currentUser={currentUser} showToast={showToast} />}
              {currentRoute === 'siswa/latsol' && <SiswaLatsol currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}
              {currentRoute === 'siswa/evaluasi' && <SiswaEvaluasi currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}
              {currentRoute === 'siswa/refleksi' && <SiswaRefleksi currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}
              {currentRoute === 'siswa/pengumuman' && <SiswaPengumuman currentUser={currentUser} showToast={showToast} />}
              {currentRoute === 'siswa/profil' && <SiswaProfil currentUser={currentUser} onLogout={() => handleLogout('siswa')} showToast={showToast} />}
              {currentRoute === 'siswa/nilai' && <SiswaNilai currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}

              {/* Guru Portals */}
              {currentRoute === 'guru/dashboard' && <GuruDashboard currentUser={currentUser} onNavigate={navigateTo} />}
              {currentRoute === 'guru/siswa' && <GuruDaftarSiswa currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}
              {currentRoute === 'guru/materi' && <GuruMateri showToast={showToast} />}
              {currentRoute === 'guru/lkpd' && <GuruLKPD showToast={showToast} />}
              {currentRoute === 'guru/latsol' && <GuruLatsol currentUser={currentUser} showToast={showToast} />}
              {currentRoute === 'guru/soal' && <GuruSoal showToast={showToast} />}
              {currentRoute === 'guru/rekap' && <GuruRekap showToast={showToast} />}
              {currentRoute === 'guru/pengumuman' && <GuruPengumuman currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}

              {/* Admin Portals */}
              {currentRoute === 'admin/dashboard' && <AdminDashboard currentUser={currentUser} onNavigate={navigateTo} showToast={showToast} />}
              {currentRoute === 'admin/users' && <AdminUsers currentUser={currentUser} showToast={showToast} />}
              {currentRoute === 'admin/maintenance' && <AdminMaintenance showToast={showToast} />}
            </main>

          </div>

          <Footer
            onAboutClick={() => setModalType('about')}
            onSecurityClick={() => setModalType('security')}
            onDataPolicyClick={() => setModalType('policy')}
          />
        </>
      )}

      {/* System Modals */}
      <Modal
        isOpen={modalType === 'about'}
        onClose={() => setModalType(null)}
        title="Tentang Fun Math v2.0"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            Aplikasi Pembelajaran Matematika Bilangan Pecahan untuk <b>Kelas 7 SMP Kurikulum Merdeka</b> berbasis Web Interaktif 3D Robot Mascot.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-1.5 font-bold text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2"><span className="text-brand-600">✓</span><span>Hak Akses 3 Peran Terisolasi (Siswa, Guru, Admin)</span></div>
            <div className="flex items-center gap-2"><span className="text-brand-600">✓</span><span>Kebijakan Keamanan 1 Akun 1 Device (Single Device Policy)</span></div>
            <div className="flex items-center gap-2"><span className="text-brand-600">✓</span><span>Asisten Koreksi AI pada LKPD Tulisan Tangan</span></div>
            <div className="flex items-center gap-2"><span className="text-brand-600">✓</span><span>Evaluasi Soal Uraian HOTS dengan Pengawas Tab Terintegrasi</span></div>
            <div className="flex items-center gap-2"><span className="text-brand-600">✓</span><span>Rekapitulasi Nilai Otomatis Siap Ekspor ke Format Excel (.xlsx)</span></div>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setModalType(null)}>
            Tutup
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'security'}
        onClose={() => setModalType(null)}
        title="🔒 Kebijakan Keamanan 1 Akun 1 Perangkat"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center">
          <p>
            Untuk menjamin integritas dan kejujuran belajar siswa, sistem secara otomatis mengunci sesi aktif ke satu peramban/perangkat. Jika akun siswa login di gawai lain, sesi lama akan diputus secara otomatis.
          </p>
          <Button variant="accent" className="w-full" onClick={() => setModalType(null)}>
            Saya Mengerti
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'policy'}
        onClose={() => setModalType(null)}
        title="💾 Database & Kesiapan Backend"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            Sistem saat ini berjalan dengan <b>Modular Reactive Storage Engine</b> yang terstruktur rapi. Seluruh entitas data (User, Materi, LKPD, Soal Essai, Nilai, Pengumuman) siap dihubungkan langsung ke backend <b>PHP & MySQL</b> di kemudian hari.
          </p>
          <Button variant="primary" className="w-full" onClick={() => setModalType(null)}>
            Tutup
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'sessionKicked'}
        onClose={() => setModalType(null)}
        title="⚠️ Sesi Akun Terputus!"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center">
          <p>
            Akun Anda baru saja terdeteksi login di perangkat atau jendela peramban lain. Sesuai kebijakan <b>1 Akun 1 Perangkat</b>, sesi pada jendela ini dinonaktifkan secara otomatis.
          </p>
          <Button variant="primary" className="w-full" onClick={() => setModalType(null)}>
            Mengerti & Masuk Kembali
          </Button>
        </div>
      </Modal>

    </div>
  );
}

export default App;

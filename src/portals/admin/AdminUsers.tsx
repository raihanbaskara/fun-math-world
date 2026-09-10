import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, UserRole } from '@/types';
import {
  Users,
  Plus,
  ShieldCheck,
  Trash2,
  KeyRound,
  Unlock,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search
} from 'lucide-react';

export const AdminUsers: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const [dbState, setDbState] = useState(storageService.getState());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  // Form State
  const [role, setRole] = useState<UserRole>('siswa');
  const [name, setName] = useState('');
  const [userClass, setUserClass] = useState('Kelas 7-A');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility state & copy state
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [passwordVisibilityMap, setPasswordVisibilityMap] = useState<{ [userId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const users = dbState.users || [];

  const togglePasswordVisibility = (userId: string) => {
    soundService.click();
    setPasswordVisibilityMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const toggleAllPasswords = () => {
    soundService.click();
    const nextState = !showAllPasswords;
    setShowAllPasswords(nextState);
    const newMap: { [key: string]: boolean } = {};
    users.forEach(u => {
      newMap[u.id] = nextState;
    });
    setPasswordVisibilityMap(newMap);
  };

  const handleCopyCredentials = (u: User) => {
    soundService.click();
    const text = `Username: ${u.username}\nPassword: ${u.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    showToast(`Kredensial login ${u.name} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.click();

    if (!name.trim() || !username.trim() || !password.trim()) {
      showToast('Nama, username, dan password wajib diisi!', 'error');
      return;
    }

    const exists = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) {
      showToast('Username sudah terdaftar! Gunakan username lain.', 'error');
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      role: role,
      class: role === 'siswa' ? userClass.trim() : (role === 'guru' ? 'Guru Matematika' : 'Administrator Lab'),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim()}`,
      sessionToken: null,
      deviceId: null,
      progress: { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 },
      readAnnouncements: [],
    };

    storageService.update(draft => {
      draft.users.push(newUser);
    });

    setDbState(storageService.getState());
    setIsAddOpen(false);
    setName('');
    setUsername('');
    setPassword('');
    soundService.success();
    showToast('Akun pengguna baru berhasil didaftarkan!', 'success');
  };

  const handleResetDevice = (userId: string) => {
    soundService.click();
    storageService.update(draft => {
      const target = draft.users.find(u => u.id === userId);
      if (target) {
        target.sessionToken = null;
        target.deviceId = null;
      }
    });
    setDbState(storageService.getState());
    soundService.success();
    showToast('Kunci sesi perangkat akun berhasil dilepas (Bebas Login).', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    soundService.click();
    if (confirm('Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen dari sistem?')) {
      storageService.update(draft => {
        draft.users = draft.users.filter(u => u.id !== userId);
      });
      setDbState(storageService.getState());
      soundService.success();
      showToast('Akun pengguna berhasil dihapus.', 'info');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.class && u.class.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      
      {/* 1. Header Banner Pure Neobrutalism V3 */}
      <div className="relative rounded-3xl bg-[#c084fc] text-slate-950 border-4 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden">
        <div className="absolute right-4 bottom-0 text-slate-950/10 font-mono text-8xl font-black pointer-events-none select-none tracking-tight">
          ACCOUNTS
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white text-slate-950 border-2 border-slate-950 rounded-xl text-xs font-mono font-black shadow-[2px_2px_0px_0px_#0f172a]">
              MANAJEMEN PENGGUNA
            </span>
            <span className="px-3 py-1 bg-white/80 text-slate-900 border-2 border-slate-950 rounded-xl text-xs font-bold font-mono">
              Total {users.length} Akun Terdaftar
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono leading-tight">
            Manajemen Akun Siswa, Guru, &amp; Admin
          </h1>

          <p className="text-xs sm:text-sm text-slate-950 max-w-2xl leading-relaxed font-bold">
            Kelola data autentikasi seluruh akun, audit kata sandi, salin kredensial login, dan reset kunci sesi perangkat 1-Device Policy.
          </p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            <Search size={16} className="text-slate-950" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama / username..."
              className="text-xs font-bold text-slate-950 outline-none w-36 sm:w-48 bg-transparent"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a]">
            {(['all', 'siswa', 'guru', 'admin'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  soundService.click();
                  setFilterRole(r);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                  filterRole === r
                    ? 'bg-[#ffe600] text-slate-950 border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a]'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {r === 'all' ? 'Semua' : r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundService.click();
            setIsAddOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-3 border-slate-950 shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 w-fit"
        >
          <UserPlus size={16} />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* 3. Users Table Pure Neo-Brutalism */}
      <div className="rounded-3xl bg-white border-4 border-slate-950 p-6 shadow-[7px_7px_0px_0px_#0f172a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-slate-950">
          <h2 className="text-lg font-black text-slate-950 font-mono flex items-center gap-2">
            <Users size={20} className="text-purple-700" />
            <span>Daftar Kredensial Pengguna Sistem</span>
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500">
            Menampilkan {filteredUsers.length} dari {users.length} Akun
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#ffe600] border-3 border-slate-950 text-slate-950 font-mono text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Pengguna</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5 font-mono">Username / NIS</th>
                <th className="p-3.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span>Kata Sandi</span>
                    <button
                      type="button"
                      onClick={toggleAllPasswords}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black text-slate-950 bg-white border-2 border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] transition cursor-pointer normal-case"
                      title="Tampilkan / Sembunyikan Semua Password"
                    >
                      {showAllPasswords ? 'Tutup Semua' : 'Buka Semua'}
                    </button>
                  </div>
                </th>
                <th className="p-3.5">Kelas / Jabatan</th>
                <th className="p-3.5">Status Device</th>
                <th className="p-3.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 bg-white">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-xl border-2 border-slate-950 bg-slate-50 object-cover shrink-0 shadow-[1.5px_1.5px_0px_0px_#0f172a]"
                      />
                      <div>
                        <div className="font-black text-slate-950 text-sm">{u.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-500">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider font-mono border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#0f172a] ${
                      u.role === 'siswa'
                        ? 'bg-[#38bdf8] text-slate-950'
                        : u.role === 'guru'
                        ? 'bg-[#ffe600] text-slate-950'
                        : 'bg-[#c084fc] text-slate-950'
                    }`}>
                      {u.role === 'siswa' ? 'Siswa' : u.role === 'guru' ? 'Guru' : 'Admin'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="inline-block whitespace-nowrap font-black text-slate-950 bg-slate-100 border-2 border-slate-950 px-2.5 py-1 rounded-xl text-xs shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                      {u.username}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-purple-950 bg-purple-100 border-2 border-slate-950 px-2.5 py-1 rounded-xl text-xs min-w-[90px] text-center inline-block shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        {passwordVisibilityMap[u.id] ? u.password : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-purple-100 border-2 border-slate-950 text-slate-950 transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#0f172a]"
                        title={passwordVisibilityMap[u.id] ? "Sembunyikan Password" : "Lihat Password"}
                      >
                        {passwordVisibilityMap[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(u)}
                        className="p-1.5 rounded-lg bg-white hover:bg-amber-100 border-2 border-slate-950 text-slate-950 transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#0f172a]"
                        title="Salin Username & Password"
                      >
                        {copiedId === u.id ? <Check size={14} className="text-emerald-700 font-bold" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{u.class || '-'}</td>
                  <td className="p-3.5">
                    {u.sessionToken ? (
                      <span className="inline-flex whitespace-nowrap text-slate-950 bg-rose-200 border-2 border-slate-950 px-2.5 py-1 rounded-xl font-black text-xs items-center gap-1 font-mono shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        <Lock size={12} /> Terkunci
                      </span>
                    ) : (
                      <span className="inline-flex whitespace-nowrap text-slate-950 bg-lime-200 border-2 border-slate-950 px-2.5 py-1 rounded-xl font-black text-xs items-center gap-1 font-mono shadow-[1.5px_1.5px_0px_0px_#0f172a]">
                        <Unlock size={12} /> Bebas
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetDevice(u.id)}
                        className="text-xs font-mono font-black text-slate-950 bg-amber-100 hover:bg-amber-200 border-2 border-slate-950 px-3 py-1.5 rounded-xl transition-all shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                        title="Lepas Kunci Sesi Perangkat"
                      >
                        <Unlock size={13} />
                        <span>Reset Kunci</span>
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-xs font-mono font-black text-rose-950 bg-rose-100 hover:bg-rose-200 border-2 border-slate-950 px-2.5 py-1.5 rounded-xl transition-all shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                          title="Hapus Akun"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                    Tidak ada akun pengguna yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Tambah Pengguna Baru */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Daftarkan Akun Pengguna Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Peran Pengguna (Role):
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-xs sm:text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] outline-none font-mono"
            >
              <option value="siswa">Siswa SMP</option>
              <option value="guru">Guru Matematika</option>
              <option value="admin">Administrator Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Nama Lengkap:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Dimas Aditya"
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] outline-none focus:bg-amber-50"
            />
          </div>

          {role === 'siswa' && (
            <div>
              <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
                Rombel / Kelas Siswa:
              </label>
              <input
                type="text"
                required
                value={userClass}
                onChange={e => setUserClass(e.target.value)}
                placeholder="Contoh: Kelas 7-A"
                className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-bold shadow-[2px_2px_0px_0px_#0f172a] outline-none focus:bg-amber-50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Username / NIS:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Contoh: siswa_dimas atau 102938"
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-900 mb-1.5">
              Kata Sandi (Password):
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border-2 border-slate-950 bg-white text-slate-900 text-sm font-black shadow-[2px_2px_0px_0px_#0f172a] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-slate-950">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-mono font-black text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-950 shadow-[2px_2px_0px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Daftarkan Akun
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

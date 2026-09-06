import React, { useState } from 'react';
import { DoubleBezelCard, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowFillButton } from '@/components/ui/arrow-fill-button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/services/storageService';
import { soundService } from '@/services/soundService';
import { User, UserRole } from '@/types';
import { Users, Plus, ShieldCheck, Trash2, KeyRound, Unlock, Lock, UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react';

export const AdminUsers: React.FC<{
  currentUser: User;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ currentUser, showToast }) => {
  const db = storageService.getState();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [role, setRole] = useState<UserRole>('siswa');
  const [name, setName] = useState('');
  const [userClass, setUserClass] = useState('Kelas 7-A');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility state & copy state
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [passwordVisibilityMap, setPasswordVisibilityMap] = useState<{ [userId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    db.users.forEach(u => {
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

    const exists = db.users.find(u => u.username === username.trim());
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
      class: role === 'siswa' ? userClass.trim() : (role === 'guru' ? 'Guru Matematika' : 'Administrator'),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim()}`,
      sessionToken: null,
      deviceId: null,
      progress: { materi: 0, video: 0, lkpd: 0, evaluasi: 0 },
      readAnnouncements: [],
    };

    storageService.update(draft => {
      draft.users.push(newUser);
    });

    setIsAddOpen(false);
    setName('');
    setUsername('');
    setPassword('');
    soundService.success();
    showToast('Akun pengguna baru berhasil didaftarkan!', 'success');
  };

  const handleResetDevice = (userId: string) => {
    storageService.update(draft => {
      const target = draft.users.find(u => u.id === userId);
      if (target) {
        target.sessionToken = null;
        target.deviceId = null;
      }
    });
    soundService.click();
    showToast('Kunci perangkat akun berhasil dilepas.', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Hapus akun pengguna ini dari sistem?')) {
      storageService.update(draft => {
        draft.users = draft.users.filter(u => u.id !== userId);
      });
      soundService.click();
      showToast('Akun berhasil dihapus.', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="text-purple-600" />
            <span>Manajemen Akun Pengguna</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola daftar siswa, guru pengajar, dan administrator serta lihat username dan kata sandi akun.
          </p>
        </div>

        <ArrowFillButton
          variant="purple"
          size="md"
          onClick={() => setIsAddOpen(true)}
        >
          <UserPlus size={16} />
          <span>Tambah Akun Baru</span>
        </ArrowFillButton>
      </div>

      <DoubleBezelCard className="bg-slate-50 border-slate-200/80 p-1.5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Identitas Pengguna</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4 font-mono">Username / NIS</th>
                <th className="p-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span>Kata Sandi (Password)</span>
                    <button
                      onClick={toggleAllPasswords}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition cursor-pointer normal-case tracking-normal"
                      title="Tampilkan / Sembunyikan Semua Password"
                    >
                      {showAllPasswords ? 'Sembunyikan Semua' : 'Tampilkan Semua'}
                    </button>
                  </div>
                </th>
                <th className="p-4">Kelas / Jabatan</th>
                <th className="p-4">Status Device</th>
                <th className="p-4">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {db.users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 object-cover"
                      />
                      <div className="font-bold text-slate-900">{u.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono border ${
                      u.role === 'siswa'
                        ? 'bg-brand-50 text-brand-700 border-brand-200/70'
                        : u.role === 'guru'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                        : 'bg-purple-50 text-purple-700 border-purple-200/70'
                    }`}>
                      {u.role === 'siswa' ? 'Siswa' : u.role === 'guru' ? 'Guru' : 'Administrator'}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs">
                      {u.username}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-950 bg-purple-50 border border-purple-200/90 px-2.5 py-1 rounded-lg text-xs min-w-[90px] text-center inline-block">
                        {passwordVisibilityMap[u.id] ? u.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="p-1 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                        title={passwordVisibilityMap[u.id] ? "Sembunyikan Password" : "Lihat Password"}
                      >
                        {passwordVisibilityMap[u.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleCopyCredentials(u)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Salin Username & Password"
                      >
                        {copiedId === u.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{u.class || '-'}</td>
                  <td className="p-4">
                    {u.sessionToken ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-xs inline-flex items-center gap-1 font-mono">
                        <Lock size={12} /> Terkunci
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs font-mono">Bebas</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetDevice(u.id)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                        title="Lepas Kunci Sesi Perangkat"
                      >
                        <Unlock size={13} />
                        <span>Reset Kunci</span>
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-colors"
                          title="Hapus Akun"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DoubleBezelCard>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Daftarkan Akun Pengguna Baru"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Peran Pengguna (Role):
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            >
              <option value="siswa">Siswa SMP</option>
              <option value="guru">Guru Matematika</option>
              <option value="admin">Administrator Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nama Lengkap:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Dimas Aditya"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          {role === 'siswa' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rombel / Kelas Siswa:
              </label>
              <input
                type="text"
                required
                value={userClass}
                onChange={e => setUserClass(e.target.value)}
                placeholder="Contoh: Kelas 7-A"
                className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Username / NIS:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Contoh: siswa_dimas atau 102938"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Kata Sandi (Password):
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-xl font-bold"
              onClick={() => setIsAddOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-xl font-black bg-purple-600 hover:bg-purple-700 text-white">
              Daftarkan Akun
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

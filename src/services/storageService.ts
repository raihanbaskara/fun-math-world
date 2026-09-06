import { DatabaseState, User } from '@/types';

const STORAGE_KEY = "FUN_MATH_WORLD_SMP7_DB_V2";

export const defaultDatabaseState: DatabaseState = {
  system: {
    version: "2.0.0",
    appName: "Fun Math World SMP 7",
    school: "SMP Negeri Malang",
    subject: "Matematika (Bilangan Pecahan)"
  },
  settings: {
    soundEnabled: true,
    darkMode: false
  },
  users: [
    {
      id: "std_1",
      username: "siswa1",
      password: "siswa123",
      name: "Aisyah Putri",
      role: "siswa",
      class: "Kelas 7-A",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aisyah",
      sessionToken: null,
      deviceId: null,
      progress: { materi: 85, video: 70, lkpd: 100, evaluasi: 90 },
      readAnnouncements: []
    },
    {
      id: "std_2",
      username: "budi",
      password: "budi123",
      name: "Budi Santoso",
      role: "siswa",
      class: "Kelas 7-A",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Budi",
      sessionToken: null,
      deviceId: null,
      progress: { materi: 60, video: 50, lkpd: 0, evaluasi: 0 },
      readAnnouncements: []
    },
    {
      id: "std_3",
      username: "citra",
      password: "citra123",
      name: "Citra Dewi",
      role: "siswa",
      class: "Kelas 7-B",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Citra",
      sessionToken: null,
      deviceId: null,
      progress: { materi: 100, video: 100, lkpd: 100, evaluasi: 95 },
      readAnnouncements: []
    },
    {
      id: "tch_1",
      username: "guru",
      password: "guru123",
      name: "Ibu Rahmawati, S.Pd.",
      role: "guru",
      class: "Guru Matematika Kelas 7",
      nip: "198503152010012003",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahmawati",
      sessionToken: null,
      deviceId: null
    },
    {
      id: "adm_1",
      username: "admin",
      password: "admin123",
      name: "Bpk. Toni Hidayat (Admin)",
      role: "admin",
      class: "Administrator Lab & Sistem",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminToni",
      sessionToken: null,
      deviceId: null
    }
  ],
  materials: [
    {
      id: "m1",
      title: "1. Konsep Dasar & Arti Pecahan",
      badge: "Fondasi",
      content: "Pecahan adalah bilangan yang merepresentasikan bagian dari keseluruhan atau perbandingan bagian terhadap himpunan utuh. Pada bentuk pecahan a/b:\n- a disebut Pembilang (banyak bagian yang diambil)\n- b disebut Penyebut (total bagian sama rata keseluruhan, dengan syarat b ≠ 0).\n\nContoh konkret: Jika 1 loyang pizza dipotong menjadi 8 bagian sama besar dan kamu memakan 3 potong, maka bagian pizza yang kamu makan adalah 3/8.",
      fraction: [3, 8]
    },
    {
      id: "m2",
      title: "2. Jenis-Jenis Pecahan di Kelas 7",
      badge: "Klasifikasi",
      content: "1. Pecahan Biasa: Pembilang lebih kecil dari penyebut (contoh: 2/5, 3/7).\n2. Pecahan Tidak Murni / Campuran: Pembilang lebih besar dari penyebut. Dapat diubah menjadi pecahan campuran yang memuat bilangan bulat dan pecahan murni (contoh: 7/4 = 1 3/4).\n3. Pecahan Desimal: Pecahan dengan sistem nilai tempat persepuluhan, perseratusan, dst (contoh: 0,75).\n4. Persen: Pecahan dengan penyebut seratus (lambang %, contoh: 50% = 50/100).",
      fraction: [7, 4]
    },
    {
      id: "m3",
      title: "3. Pecahan Senilai & Menyederhanakan",
      badge: "Penting",
      content: "Pecahan senilai adalah pecahan yang memiliki nilai perbandingan yang sama meskipun lambang bilangannya berbeda. Pecahan senilai diperoleh dengan mengalikan atau membagi pembilang dan penyebut dengan bilangan bulat yang sama (k ≠ 0).\nContoh: 2/3 = (2×2)/(3×2) = 4/6 = (2×4)/(3×4) = 8/12.\n\nMenyederhanakan pecahan dilakukan dengan membagi pembilang dan penyebut menggunakan FPB keduanya.",
      fraction: [4, 6]
    },
    {
      id: "m4",
      title: "4. Operasi Penjumlahan & Pengurangan Pecahan",
      badge: "Operasi",
      content: "Kunci utama penjumlahan dan pengurangan pecahan:\n1. Jika penyebut sudah sama: Jumlahkan atau kurangkan pembilang langsung, penyebut tetap sama. a/c + b/c = (a+b)/c.\n2. Jika penyebut berbeda: Cari KPK dari kedua penyebut untuk menyamakan penyebut terlebih dahulu, kalikan pembilang dengan faktor pengali yang sesuai, lalu operasikan.",
      fraction: [5, 6]
    }
  ],
  videos: [
    {
      id: "v1",
      title: "Konsep Pecahan & Pecahan Senilai Kelas 7 SMP",
      duration: "08:24",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      desc: "Visualisasi animasi pembagian kue dan luas daerah pecahan."
    },
    {
      id: "v2",
      title: "Trik Penjumlahan & Pengurangan Pecahan Berbeda Penyebut",
      duration: "11:10",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      desc: "Metode cepat KPK dan perkalian silang kupu-kupu untuk menyelesaikan soal."
    }
  ],
  lkpdList: [
    {
      id: "lkpd_1",
      title: "LKPD 1 — Eksplorasi Visual Pecahan Senilai & Model Konkrit",
      description: "Peserta didik melakukan pemodelan pembagian kue dan petak sawah untuk menemukan pola pecahan senilai.",
      imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
      pdfFilename: "LKPD_01_Pecahan_Senilai_SMP7.pdf",
      objectives: "1. Siswa mampu memodelkan pecahan 1/2, 2/4, dan 4/8.\n2. Siswa mampu menyimpulkan aturan perkalian pecahan senilai."
    },
    {
      id: "lkpd_2",
      title: "LKPD 2 — Pemecahan Masalah Penjumlahan Pecahan dalam Kehidupan Sehari-hari",
      description: "Menganalisis resep kue bolu dan pembagian pita hiasan menggunakan operasi hitung pecahan.",
      imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
      pdfFilename: "LKPD_02_Operasi_Pecahan_SMP7.pdf",
      objectives: "1. Siswa mampu menyelesaikan soal kontekstual resep masakan.\n2. Siswa mampu menyamakan penyebut menggunakan KPK."
    }
  ],
  lkpdSubmissions: [
    {
      id: "sub_1",
      studentId: "std_1",
      studentName: "Aisyah Putri",
      studentClass: "Kelas 7-A",
      lkpdId: "lkpd_1",
      photoUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80",
      date: "2026-09-02 09:15",
      aiScore: 92,
      aiFeedback: "Model pecahan senilai (2/4 = 4/8) digambar dengan sangat rapi dan proporsional. Langkah penyamaan pembilang dan penyebut tepat.",
      teacherScore: 95,
      teacherFeedback: "Pekerjaan luar biasa Aisyah! Penjelasan langkah sangat sistematis.",
      status: "Dinilai"
    }
  ],
  evaluationQuestions: [
    {
      id: "eq_1",
      title: "Soal Essai 1 — Pembagian Lahan Sawah",
      prompt: "Pak Ahmad memiliki sebidang tanah sawah seluas 3/4 hektar. Dari luas tanah tersebut, 1/3 bagian akan ditanami padi dan 1/4 bagian akan ditanami jagung, sedangkan sisanya dibuat kolam ikan. Berapakah bagian lahan yang digunakan untuk kolam ikan? Tuliskan langkah perhitungannya dengan runtut!",
      sampleAnswer: "Total bagian = 3/4 hektar.\nBagian ditanami = 1/3 + 1/4 = 4/12 + 3/12 = 7/12.\nSisa untuk kolam = 3/4 - 7/12 = 9/12 - 7/12 = 2/12 = 1/6 hektar.",
      discussion: "Langkah-langkah:\n1. Samakan penyebut pecahan yang ditanami (KPK dari 3 dan 4 adalah 12) -> 4/12 + 3/12 = 7/12.\n2. Samakan penyebut lahan mula-mula dengan total tanaman -> 3/4 = 9/12.\n3. Kurangkan: 9/12 - 7/12 = 2/12.\n4. Sederhanakan dengan membagi FPB 2: 2/12 = 1/6 hektar.",
      weight: 50
    },
    {
      id: "eq_2",
      title: "Soal Essai 2 — Resep Membuat Kue Bolu",
      prompt: "Ibu memiliki persediaan tepung terigu sebanyak 2 1/2 kg. Ibu menggunakan 1 3/4 kg untuk membuat kue bolu. Keesokan harinya, paman membawakan lagi tepung terigu sebanyak 3/4 kg. Berapa total persediaan tepung terigu ibu sekarang dalam bentuk pecahan campuran? Jelaskan caramu!",
      sampleAnswer: "Persediaan awal = 2 1/2 kg = 5/2 kg.\nDigunakan = 1 3/4 kg = 7/4 kg.\nSisa = 5/2 - 7/4 = 10/4 - 7/4 = 3/4 kg.\nDitambah paman = 3/4 + 3/4 = 6/4 kg = 3/2 kg = 1 1/2 kg.",
      discussion: "Langkah-langkah:\n1. Ubah ke pecahan biasa atau operasikan bilangan bulat: (2 - 1) + (1/2 - 3/4) = 1 + (2/4 - 3/4) = 4/4 + (-1/4) = 3/4 kg.\n2. Ditambah dari paman: 3/4 + 3/4 = 6/4 kg.\n3. Sederhanakan: 6/4 = 3/2 kg.\n4. Bentuk pecahan campuran: 3 dibagi 2 dapat 1 sisa 1 -> 1 1/2 kg.",
      weight: 50
    }
  ],
  evaluationSubmissions: [
    {
      id: "eval_std_1",
      studentId: "std_1",
      studentName: "Aisyah Putri",
      studentClass: "Kelas 7-A",
      date: "2026-09-02 11:20",
      score: 95,
      textAnswers: {
        eq_1: "Sisa lahan kolam ikan adalah 1/6 hektar dengan menyamakan penyebut ke 12.",
        eq_2: "Total tepung ibu sekarang adalah 1 1/2 kg."
      },
      photoProof: "https://images.unsplash.com/photo-1456735190829-80ab37a75842?auto=format&fit=crop&w=600&q=80",
      antiCheat: {
        switchCount: 0,
        totalLeaveSeconds: 0,
        log: []
      },
      status: "Selesai"
    }
  ],
  announcements: [
    {
      id: "an_1",
      title: "Evaluasi Bab Pecahan Telah Dibuka",
      date: "2026-09-02",
      author: "Ibu Rahmawati, S.Pd.",
      content: "Halo anak-anak kelas 7! Modul Evaluasi Soal Essai telah aktif. Pastikan membaca soal dengan teliti, kerjakan langkah hitungan di lembar kertas bergaris, lalu foto dan unggah sebagai bukti pengerjaan.",
      isImportant: true
    },
    {
      id: "an_2",
      title: "Pengumpulan Tugas LKPD 1",
      date: "2026-09-01",
      author: "Ibu Rahmawati, S.Pd.",
      content: "Bagi siswa yang belum mengunggah hasil lembar kerja LKPD 1, silakan unduh berkasnya melalui menu LKPD Digital dan gunakan fitur Koreksi AI untuk mengecek hasil kerja mandiri.",
      isImportant: false
    }
  ],
  reflections: []
};

type Listener = (state: DatabaseState) => void;

class StorageService {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.load();
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  public load(): DatabaseState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabaseState));
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
    try {
      const parsed: DatabaseState = JSON.parse(raw);
      // Enforce bright light mode studio theme as requested by user
      if (parsed.settings) {
        parsed.settings.darkMode = false;
      }
      return parsed;
    } catch {
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
  }

  public save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  public update(updater: (draft: DatabaseState) => void): void {
    updater(this.state);
    this.save();
  }

  public reset(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabaseState));
    this.state = JSON.parse(JSON.stringify(defaultDatabaseState));
    this.notify();
  }

  public getCurrentSessionUser(): User | null {
    const stored = sessionStorage.getItem("FMW_CURRENT_USER");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      const found = this.state.users.find(u => u.id === parsed.id);
      if (found && found.sessionToken === parsed.sessionToken) {
        return found;
      }
      return null;
    } catch {
      return null;
    }
  }

  public setCurrentSessionUser(user: User, token: string): void {
    sessionStorage.setItem("FMW_CURRENT_USER", JSON.stringify({ id: user.id, sessionToken: token }));
  }

  public clearCurrentSession(): void {
    sessionStorage.removeItem("FMW_CURRENT_USER");
  }
}

export const storageService = new StorageService();

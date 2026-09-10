import { DatabaseState, User } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
      progress: { materi: 85, video: 70, lkpd: 100, latsol: 90, evaluasi: 90 },
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
      progress: { materi: 60, video: 50, lkpd: 0, latsol: 0, evaluasi: 0 },
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
      progress: { materi: 100, video: 100, lkpd: 100, latsol: 100, evaluasi: 95 },
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
      objectives: "1. Siswa mampu memodelkan pecahan 1/2, 2/4, dan 4/8.\n2. Siswa mampu menyimpulkan aturan perkalian pecahan senilai.",
      questions: [
        {
          id: "lkpd1_q1",
          title: "Aktivitas 1: Pemodelan Pizza Pecahan Senilai",
          prompt: "Dua loyang pizza berukuran sama dibagi dengan cara berbeda. Pizza A dipotong menjadi 4 bagian sama besar dan dimakan 2 potong (2/4). Pizza B dipotong menjadi 8 bagian sama besar dan dimakan 4 potong (4/8). Apakah jumlah pizza yang dimakan pada kedua loyang tersebut sama banyak? Jelaskan dengan konsep pecahan senilai dan FPB!",
          discussion: "Langkah Pembahasan:\n1. Pecahan Pizza A = 2/4, Pizza B = 4/8.\n2. Bentuk paling sederhana dari 2/4 (dibagi FPB 2) = 1/2.\n3. Bentuk paling sederhana dari 4/8 (dibagi FPB 4) = 1/2.\n4. Kesimpulan: Keduanya senilai (2/4 = 4/8 = 1/2), sehingga jumlah pizza yang dimakan sama banyak.",
          weight: 50
        },
        {
          id: "lkpd1_q2",
          title: "Aktivitas 2: Menentukan Pecahan Senilai",
          prompt: "Tentukan 3 pecahan yang senilai dengan 3/5 dengan cara mengalikan pembilang dan penyebut dengan bilangan bulat yang sama! Tuliskan langkah perhitungannya!",
          discussion: "Langkah Pembahasan:\n1. Kalikan 2: (3×2)/(5×2) = 6/10.\n2. Kalikan 3: (3×3)/(5×3) = 9/15.\n3. Kalikan 4: (3×4)/(5×4) = 12/20.\nPecahan senilai: 6/10, 9/15, dan 12/20.",
          weight: 50
        }
      ]
    },
    {
      id: "lkpd_2",
      title: "LKPD 2 — Pemecahan Masalah Operasi Penjumlahan Pecahan",
      description: "Menganalisis resep masakan dan pembagian pita hiasan menggunakan operasi hitung pecahan.",
      imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
      pdfFilename: "LKPD_02_Operasi_Pecahan_SMP7.pdf",
      objectives: "1. Siswa mampu menyelesaikan soal kontekstual resep masakan.\n2. Siswa mampu menyamakan penyebut menggunakan KPK.",
      questions: [
        {
          id: "lkpd2_q1",
          title: "Aktivitas 1: Resep Adonan Roti",
          prompt: "Siti mencampurkan 2/3 kg tepung gandum dan 1/4 kg tepung beras untuk membuat adonan roti. Berapa kg total berat tepung yang dicampurkan Siti? Tuliskan langkah penyamaan penyebut menggunakan KPK!",
          discussion: "Langkah Pembahasan:\n1. Cari KPK dari penyebut 3 dan 4, yaitu 12.\n2. Ubah pecahan: 2/3 = 8/12 dan 1/4 = 3/12.\n3. Jumlahkan pembilang: 8/12 + 3/12 = 11/12 kg.\nTotal berat tepung adalah 11/12 kg.",
          weight: 50
        },
        {
          id: "lkpd2_q2",
          title: "Aktivitas 2: Pita Prakarya",
          prompt: "Budi memiliki pita sepanjang 5/6 meter. Ia memberikan 1/3 meter pita kepada adiknya. Berapakah sisa pita yang dimiliki Budi sekarang?",
          discussion: "Langkah Pembahasan:\n1. Samakan penyebut: 1/3 = 2/6.\n2. Kurangkan: 5/6 - 2/6 = 3/6.\n3. Sederhanakan dengan FPB 3: 3/6 = 1/2 meter.\nSisa pita Budi adalah 1/2 meter.",
          weight: 50
        }
      ]
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
      answers: {
        lkpd1_q1: {
          textAnswer: "Kedua loyang pizza sama banyak karena 2/4 jika disederhanakan menjadi 1/2 dan 4/8 juga disederhanakan menjadi 1/2."
        },
        lkpd1_q2: {
          textAnswer: "Pecahan senilai dari 3/5 adalah 6/10, 9/15, dan 12/20 dengan mengalikan pembilang dan penyebut dengan bilangan 2, 3, dan 4."
        }
      },
      date: "2026-09-02 09:15",
      aiScore: 92,
      aiFeedback: "Jawaban sangat sistematis. Konsep pecahan senilai dan penyederhanaan menggunakan FPB sudah tepat.",
      teacherScore: 95,
      teacherFeedback: "Pekerjaan luar biasa Aisyah! Penjelasan langkah sangat sistematis.",
      status: "Dinilai"
    }
  ],
  latsolRooms: [
    {
      id: "room_1",
      title: "Latihan Soal 1: Pecahan Senilai & Desimal",
      topic: "Konsep Dasar, Pecahan Senilai, dan Konversi Desimal",
      badge: "Latihan Soal 1",
      durationSeconds: 180,
      isLockedByTeacher: false,
      questions: [
        {
          id: "ls1_q1",
          question: "Bentuk pecahan paling sederhana dari 18/24 adalah...",
          options: ["3/4", "2/3", "4/6", "3/8"],
          correctIndex: 0,
          explanation: "Bagi pembilang dan penyebut dengan FPB(18, 24) = 6. Maka 18/6 = 3 dan 24/6 = 4 -> 3/4.",
          points: 20
        },
        {
          id: "ls1_q2",
          question: "Pecahan desimal dari 3/5 adalah...",
          options: ["0.35", "0.6", "0.65", "0.53"],
          correctIndex: 1,
          explanation: "Kalikan pembilang dan penyebut dengan 2: 3/5 = 6/10 = 0.6.",
          points: 20
        },
        {
          id: "ls1_q3",
          question: "Pecahan berikut yang SENILAI dengan 2/3 adalah...",
          options: ["4/9", "6/9", "8/15", "5/6"],
          correctIndex: 1,
          explanation: "Kalikan pembilang dan penyebut dengan 3: (2×3)/(3×3) = 6/9.",
          points: 20
        },
        {
          id: "ls1_q4",
          question: "Bentuk persen dari 7/20 adalah...",
          options: ["35%", "70%", "28%", "14%"],
          correctIndex: 0,
          explanation: "7/20 = (7×5)/(20×5) = 35/100 = 35%.",
          points: 20
        },
        {
          id: "ls1_q5",
          question: "Urutan pecahan 1/2, 3/4, 2/5 dari yang TERKECIL adalah...",
          options: ["2/5, 1/2, 3/4", "1/2, 2/5, 3/4", "3/4, 1/2, 2/5", "2/5, 3/4, 1/2"],
          correctIndex: 0,
          explanation: "Ubah ke desimal: 2/5 = 0.4, 1/2 = 0.5, 3/4 = 0.75. Urutan terkecil: 2/5, 1/2, 3/4.",
          points: 20
        }
      ]
    },
    {
      id: "room_2",
      title: "Latihan Soal 2: Operasi Campuran Penjumlahan & Pengurangan",
      topic: "Operasi Hitung Pecahan Beda Penyebut (KPK)",
      badge: "Latihan Soal 2",
      durationSeconds: 240,
      isLockedByTeacher: true,
      questions: [
        {
          id: "ls2_q1",
          question: "Hasil dari 1/3 + 1/4 adalah...",
          options: ["2/7", "7/12", "5/12", "1/12"],
          correctIndex: 1,
          explanation: "KPK dari 3 dan 4 adalah 12. 1/3 = 4/12, 1/4 = 3/12. 4/12 + 3/12 = 7/12.",
          points: 20
        },
        {
          id: "ls2_q2",
          question: "Hasil dari 5/6 - 1/2 adalah...",
          options: ["4/4", "2/6", "1/3", "2/3"],
          correctIndex: 2,
          explanation: "1/2 = 3/6. 5/6 - 3/6 = 2/6 = 1/3.",
          points: 20
        },
        {
          id: "ls2_q3",
          question: "Hasil dari 2 1/3 + 1 1/2 adalah...",
          options: ["3 2/5", "3 5/6", "4 1/6", "3 1/6"],
          correctIndex: 1,
          explanation: "(2+1) + (2/6 + 3/6) = 3 + 5/6 = 3 5/6.",
          points: 20
        },
        {
          id: "ls2_q4",
          question: "Ibu membeli 3/4 kg gula, dipakai 1/3 kg. Berapa kg sisa gula?",
          options: ["5/12 kg", "2/12 kg", "1/4 kg", "7/12 kg"],
          correctIndex: 0,
          explanation: "3/4 - 1/3 = 9/12 - 4/12 = 5/12 kg.",
          points: 20
        },
        {
          id: "ls2_q5",
          question: "Hasil dari 3/4 - 1/2 + 2/3 adalah...",
          options: ["11/12", "7/12", "5/12", "9/12"],
          correctIndex: 0,
          explanation: "KPK 12: 9/12 - 6/12 + 8/12 = 11/12.",
          points: 20
        }
      ]
    }
  ],
  latsolSubmissions: [
    {
      id: "latsub_1",
      studentId: "std_1",
      studentName: "Aisyah Putri",
      studentClass: "Kelas 7-A",
      roomId: "room_1",
      roomTitle: "Latihan Soal 1: Pecahan Senilai & Desimal",
      score: 100,
      correctCount: 5,
      totalQuestions: 5,
      answers: { ls1_q1: 0, ls1_q2: 1, ls1_q3: 1, ls1_q4: 0, ls1_q5: 0 },
      timeSpentSeconds: 65,
      date: "2026-09-02 10:30"
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
  reflections: [
    {
      id: "ref_1",
      studentId: "std_1",
      studentName: "Aisyah Putri",
      studentClass: "Kelas 7-A",
      date: "2026-09-02 12:00",
      emoji: "🤩",
      easy: "Visualisasi pizza di Studio Visual sangat membantu memahami kenapa 2/4 sama dengan 1/2.",
      challenge: "Kadang masih perlu teliti saat menyamakan penyebut 3 pecahan berbeda dengan KPK."
    }
  ],
  schedules: [
    {
      id: "sch_1",
      title: "Modul Teori: Fondasi & Notasi Pecahan",
      type: "materi",
      topic: "Bab 1.1 Pecahan Senilai & Desimal",
      date: "02 Sep 2026",
      dueTime: "08:00 WIB",
      status: "Tersedia",
      description: "Pelajari konsep pembilang, penyebut, dan pemodelan luas daerah pecahan."
    },
    {
      id: "sch_2",
      title: "Tugas LKPD 1: Eksplorasi Model Konkrit",
      type: "lkpd",
      topic: "LKPD Digital Soal Essai",
      date: "04 Sep 2026",
      dueTime: "23:59 WIB",
      status: "Tersedia",
      description: "Kerjakan 2 butir soal uraian dan unggah lembar kerja tulisan tangan."
    },
    {
      id: "sch_3",
      title: "Latihan Soal Quizizz: Room 1 & 2",
      type: "latsol",
      topic: "Game Interaktif Berwaktu",
      date: "07 Sep 2026",
      dueTime: "10:00 WIB",
      status: "Tersedia",
      description: "Uji kecepatan hitung pecahan berwaktu dengan auto-submit Quizizz."
    },
    {
      id: "sch_4",
      title: "Evaluasi Sumatif: Ujian Uraian HOTS",
      type: "evaluasi",
      topic: "Penilaian Capaian Bab 1",
      date: "09 Sep 2026",
      dueTime: "12:00 WIB",
      status: "Segera",
      description: "Penyelesaian soal cerita kontekstual dengan pengawasan tab integrity monitor."
    }
  ]
};

type Listener = (state: DatabaseState) => void;

class StorageService {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();
  private syncTimeout: number | null = null;

  constructor() {
    this.state = this.load();
    this.initSupabaseSync();
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

  private async initSupabaseSync() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Fetch current cloud state
      const { data, error } = await supabase
        .from('app_state')
        .select('data')
        .eq('id', 'main')
        .maybeSingle();

      if (data && data.data) {
        this.state = {
          ...defaultDatabaseState,
          ...data.data,
          latsolRooms: data.data.latsolRooms || defaultDatabaseState.latsolRooms,
          latsolSubmissions: data.data.latsolSubmissions || defaultDatabaseState.latsolSubmissions,
          schedules: data.data.schedules || defaultDatabaseState.schedules,
          reflections: data.data.reflections || defaultDatabaseState.reflections,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
      } else {
        // Row doesn't exist yet, insert current local state to cloud
        const res = await supabase.from('app_state').upsert({ id: 'main', data: this.state, updated_at: new Date().toISOString() });
        if (res.error) {
          console.error('[Supabase RLS Error]', res.error.message);
        }
      }

      // 2. Real-time subscription for live sync between Teacher & Student devices!
      supabase
        .channel('public:app_state')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.main' },
          (payload) => {
            if (payload.new && (payload.new as { data?: DatabaseState }).data) {
              const remoteState = (payload.new as { data: DatabaseState }).data;
              this.state = {
                ...defaultDatabaseState,
                ...remoteState,
                latsolRooms: remoteState.latsolRooms || defaultDatabaseState.latsolRooms,
                latsolSubmissions: remoteState.latsolSubmissions || defaultDatabaseState.latsolSubmissions,
                schedules: remoteState.schedules || defaultDatabaseState.schedules,
                reflections: remoteState.reflections || defaultDatabaseState.reflections,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
              this.notify();
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase sync initialization warning:', err);
    }
  }

  public load(): DatabaseState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabaseState));
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
    try {
      const parsed: DatabaseState = JSON.parse(raw);
      // Merge with defaultDatabaseState to ensure all new keys (latsolRooms, schedules, etc.) exist
      const merged: DatabaseState = {
        ...defaultDatabaseState,
        ...parsed,
        latsolRooms: parsed.latsolRooms?.length ? parsed.latsolRooms : defaultDatabaseState.latsolRooms,
        latsolSubmissions: parsed.latsolSubmissions || defaultDatabaseState.latsolSubmissions,
        schedules: parsed.schedules?.length ? parsed.schedules : defaultDatabaseState.schedules,
        reflections: parsed.reflections?.length ? parsed.reflections : defaultDatabaseState.reflections,
        lkpdList: parsed.lkpdList?.length && parsed.lkpdList[0].questions ? parsed.lkpdList : defaultDatabaseState.lkpdList
      };
      return merged;
    } catch {
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
  }

  public save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();

    // Async save to Supabase cloud
    if (isSupabaseConfigured && supabase) {
      if (this.syncTimeout) window.clearTimeout(this.syncTimeout);
      this.syncTimeout = window.setTimeout(async () => {
        try {
          await supabase!
            .from('app_state')
            .upsert({ id: 'main', data: this.state, updated_at: new Date().toISOString() });
        } catch (err) {
          console.error('Failed to sync state to Supabase:', err);
        }
      }, 300);
    }
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

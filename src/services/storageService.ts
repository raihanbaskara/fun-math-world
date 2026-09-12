import { DatabaseState, User, Material } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateChapterPdfDataUri } from '@/utils/pdfUtils';

const STORAGE_KEY = "FUN_MATH_WORLD_SMP7_DB_V6";

export const defaultDatabaseState: DatabaseState = {
  system: {
    version: "2.2.0",
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
      progress: { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 },
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
      chapterCode: "BAB 1.1",
      title: "Konsep Dasar & Arti Pecahan",
      badge: "Fondasi",
      summary: "Pecahan merepresentasikan bagian dari keseluruhan atau perbandingan bagian terhadap himpunan utuh dengan syarat penyebut b ≠ 0.",
      content: "Pecahan adalah bilangan yang merepresentasikan bagian dari keseluruhan atau perbandingan bagian terhadap himpunan utuh.\nPada bentuk pecahan a/b:\n- a disebut Pembilang (banyak bagian yang diambil / diarsir)\n- b disebut Penyebut (total bagian sama rata keseluruhan, dengan syarat b ≠ 0).",
      formula: "Bentuk Umum: a/b (a = Pembilang, b = Penyebut, b ≠ 0)",
      exampleCase: "Jika 1 loyang pizza dipotong menjadi 8 bagian sama besar dan kamu memakan 3 potong, maka bagian pizza yang kamu makan adalah 3/8 bagian.",
      fraction: [3, 8],
      fileName: "Modul_1_Konsep_Dasar_Pecahan.pdf",
      fileType: "application/pdf",
      fileSize: "1.2 MB",
      fileUrl: generateChapterPdfDataUri({
        title: "Konsep Dasar & Arti Pecahan",
        chapterCode: "BAB 1.1",
        badge: "Fondasi",
        summary: "Pecahan merepresentasikan bagian dari keseluruhan atau perbandingan bagian terhadap himpunan utuh dengan syarat penyebut b ≠ 0.",
        content: "Pecahan adalah bilangan yang merepresentasikan bagian dari keseluruhan atau perbandingan bagian terhadap himpunan utuh. Pada pecahan a/b: a = Pembilang, b = Penyebut (b ≠ 0).",
        formula: "Bentuk Umum: a/b (a = Pembilang, b = Penyebut, b ≠ 0)",
        exampleCase: "Jika 1 loyang pizza dipotong menjadi 8 bagian dan dimakan 3 potong, maka bagian pizza yang dimakan adalah 3/8 bagian."
      })
    },
    {
      id: "m2",
      chapterCode: "BAB 1.2",
      title: "Jenis-Jenis Pecahan di Kelas 7",
      badge: "Klasifikasi",
      summary: "Mengenal ragam bentuk pecahan biasa, pecahan campuran, bilangan desimal persepuluhan/perseratusan, dan persentase.",
      content: "Klasifikasi ragam pecahan:\n1. Pecahan Biasa: Pembilang lebih kecil dari penyebut (contoh: 2/5, 3/7).\n2. Pecahan Campuran: Pembilang lebih besar dari penyebut sehingga memuat bilangan bulat dan pecahan murni (contoh: 7/4 = 1 3/4).\n3. Desimal: Sistem nilai tempat persepuluhan atau perseratusan (contoh: 0,75).\n4. Persen: Pecahan dengan penyebut seratus (contoh: 50% = 50/100).",
      formula: "Pecahan Campuran: w n/d = (w × d + n)/d | Persen: P% = P/100",
      exampleCase: "Pecahan 7/4 diubah menjadi bentuk campuran: 7 dibagi 4 menghasilkan 1 dengan sisa 3, sehingga menjadi 1 3/4 = 1,75 = 175%.",
      fraction: [7, 4],
      fileName: "Infografis_Klasifikasi_Pecahan.png",
      fileType: "image/png",
      fileSize: "840 KB",
      fileUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "m3",
      chapterCode: "BAB 1.3",
      title: "Pecahan Senilai & Menyederhanakan",
      badge: "Penyederhanaan",
      summary: "Pecahan senilai memiliki rasio perbandingan yang setara melalui perkalian atau pembagian faktor pengali yang sama.",
      content: "Pecahan senilai diperoleh dengan mengalikan atau membagi pembilang dan penyebut dengan bilangan bulat yang sama (k ≠ 0).\nMenyederhanakan pecahan dilakukan dengan membagi pembilang dan penyebut menggunakan FPB (Faktor Persekutuan Terbesar) keduanya hingga tidak dapat dibagi lagi.",
      formula: "Pecahan Senilai: (a × k) / (b × k) = a / b (k ≠ 0)",
      exampleCase: "Pecahan 2/3 dikalikan 2/2 menjadi 4/6, atau dikalikan 4/4 menjadi 8/12. Semua pecahan ini memiliki nilai yang setara.",
      fraction: [4, 6],
      fileName: "Rangkuman_Pecahan_Senilai_FPB.pdf",
      fileType: "application/pdf",
      fileSize: "950 KB",
      fileUrl: generateChapterPdfDataUri({
        title: "Pecahan Senilai & Menyederhanakan",
        chapterCode: "BAB 1.3",
        badge: "Penyederhanaan",
        summary: "Pecahan senilai memiliki rasio perbandingan yang setara melalui perkalian atau pembagian faktor pengali yang sama.",
        content: "Pecahan senilai diperoleh dengan mengalikan atau membagi pembilang dan penyebut dengan k ≠ 0. Menyederhanakan pecahan dilakukan membagi dengan FPB.",
        formula: "Pecahan Senilai: (a × k) / (b × k) = a / b (k ≠ 0)",
        exampleCase: "2/3 = 4/6 = 8/12 (hasil pengali 2 dan 4)."
      })
    },
    {
      id: "m4",
      chapterCode: "BAB 1.4",
      title: "Operasi Penjumlahan & Pengurangan Pecahan",
      badge: "Operasi Hitung",
      summary: "Menyamakan penyebut berbeda menggunakan Kelipatan Persekutuan Terkecil (KPK) sebelum menjumlahkan/mengurangkan pembilang.",
      content: "Kaidah operasi hitung pecahan:\n1. Jika penyebut sudah sama: Langsung operasikan pembilang, penyebut tetap sama. a/c ± b/c = (a ± b)/c.\n2. Jika penyebut berbeda: Cari KPK dari kedua penyebut untuk menyamakan penyebut, kalikan pembilang dengan faktor pengali yang sesuai, lalu operasikan.",
      formula: "a/c ± b/d = (a × k₁ ± b × k₂) / KPK(c, d)",
      exampleCase: "Hitung 1/2 + 1/3: KPK(2, 3) = 6. Ubah 1/2 = 3/6 dan 1/3 = 2/6. Maka 3/6 + 2/6 = 5/6.",
      fraction: [5, 6],
      fileName: "Panduan_Operasi_Hitung_KPK.pdf",
      fileType: "application/pdf",
      fileSize: "1.5 MB",
      fileUrl: generateChapterPdfDataUri({
        title: "Operasi Penjumlahan & Pengurangan Pecahan",
        chapterCode: "BAB 1.4",
        badge: "Operasi Hitung",
        summary: "Menyamakan penyebut berbeda menggunakan KPK sebelum menjumlahkan atau mengurangkan pembilang pecahan.",
        content: "Jika penyebut sama: a/c ± b/c = (a ± b)/c. Jika penyebut berbeda: samakan menggunakan KPK penyebut terlebih dahulu.",
        formula: "a/c ± b/d = (a × k₁ ± b × k₂) / KPK(c, d)",
        exampleCase: "1/2 + 1/3 = 3/6 + 2/6 = 5/6."
      })
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
      title: "LKPD 1 — Operasi Pecahan: Menerapkan, Menganalisis & Mengevaluasi (HOTS)",
      description: "Memecahkan masalah kontekstual tepung terigu, analisis sisa sirup Rani, dan evaluasi dua metode pengurangan pita Dina.",
      imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
      pdfFilename: "LEMBAR_KERJA_PESERTA_DIDIK_Pecahan_elearning.docx",
      objectives: "1. Menerapkan konsep dan operasi pecahan dalam menyelesaikan permasalahan sehari-hari.\n2. Menganalisis permasalahan yang berkaitan dengan operasi pecahan.\n3. Mengevaluasi kebenaran suatu penyelesaian masalah pecahan.\n4. Menjelaskan langkah dan alasan penyelesaian secara logis.",
      questions: [
        {
          id: "lkpd_c3",
          title: "Kegiatan 1: C3 — Menerapkan (Permasalahan Tepung Kue Ibu)",
          prompt: "Perhatikan permasalahan berikut!\nIbu mempunyai 3/4 kg tepung. Untuk membuat kue pertama digunakan 1/4 kg tepung, sedangkan untuk membuat kue kedua digunakan 2/8 kg tepung.\n\nSoal:\na. Berapa kilogram tepung yang telah digunakan Ibu seluruhnya?\nb. Berapa kilogram tepung yang masih tersisa?\nc. Nyatakan sisa tepung dalam bentuk pecahan paling sederhana!\n\n(Tuliskan langkah-langkah penyelesaian, bukan hanya jawabannya!)",
          discussion: "Langkah Pembahasan Resmi:\n1. Tepung Digunakan Seluruhnya:\nOperasikan: 1/4 + 2/8\nSederhanakan 2/8 = 1/4 (atau samakan penyebut 1/4 = 2/8).\nMaka: 1/4 + 1/4 = 2/4 = 1/2 kg tepung telah digunakan Ibu.\n\n2. Sisa Tepung Ibu:\nKurangkan tepung mula-mula dengan yang terpakai: 3/4 - 1/2\nSamakan penyebut: 1/2 = 2/4\nMaka: 3/4 - 2/4 = 1/4 kg tepung tersisa.\n\n3. Bentuk Pecahan Paling Sederhana:\nSisa tepung adalah 1/4 kg (sudah merupakan bentuk paling sederhana).",
          weight: 30
        },
        {
          id: "lkpd_c4",
          title: "Kegiatan 2: C4 — Menganalisis HOTS (Permasalahan Sirup Rani)",
          prompt: "Perhatikan permasalahan berikut!\nRani memiliki 2/3 liter sirup. Ia menuangkan 1/4 liter sirup ke dalam gelas pertama dan 1/6 liter ke dalam gelas kedua.\nRani mengatakan: \"Sirup yang tersisa adalah 1/4 liter karena 2/3 - 1/4 - 1/6 = 1/4.\"\n\nSoal:\na. Analisislah apakah pernyataan Rani benar atau salah. Jelaskan alasanmu!\nb. Jika pernyataan Rani salah, tunjukkan letak kesalahannya!\nc. Tentukan jumlah sirup yang sebenarnya masih tersisa!\nd. Jelaskan langkah yang seharusnya dilakukan agar perhitungan Rani menjadi benar!",
          discussion: "Langkah Pembahasan Resmi:\n1. Menyamakan Penyebut:\nPenyebut adalah 3, 4, dan 6. Cari KPK(3, 4, 6) = 12.\n- 2/3 = (2×4)/(3×4) = 8/12 liter\n- 1/4 = (1×3)/(4×3) = 3/12 liter\n- 1/6 = (1×2)/(6×2) = 2/12 liter\n\n2. Menghitung Sisa Sirup Sebenarnya:\nSisa = 8/12 - 3/12 - 2/12 = (8 - 3 - 2)/12 = 3/12 liter.\nSederhanakan dengan FPB 3: 3/12 = 1/4 liter.\n\n3. Kesimpulan Analisis:\na. Pernyataan Rani BENAR secara hasil akhir numerik (1/4 liter).\nb. Hasil numerik Rani benar, namun langkah perhitungan matematis harus dibuktikan melalui penyamaan penyebut ber-KPK 12.\nc. Jumlah sirup yang sebenarnya tersisa memang 1/4 liter (atau 3/12 liter).\nd. Rani harus mencari KPK dari ketiga penyebut (12), mengubah menjadi pecahan senilai, lalu mengurangkan pembilang.",
          weight: 35
        },
        {
          id: "lkpd_c5",
          title: "Kegiatan 3: C5 — Mengevaluasi HOTS (Evaluasi Dua Cara Pengurangan Pita Dina)",
          prompt: "Perhatikan dua cara penyelesaian berikut!\nDina mempunyai 5/6 meter pita. Ia menggunakan 1/3 meter untuk menghias sebuah buku.\n\nCara A: 5/6 - 1/3 = (5 - 1)/(6 - 3) = 4/3 meter\nCara B: 5/6 - 1/3 = 5/6 - 2/6 = 3/6 meter = 1/2 meter\n\nSoal:\na. Menurutmu, cara penyelesaian mana yang benar? Jelaskan alasanmu!\nb. Evaluasilah kesalahan pada cara penyelesaian yang salah!\nc. Dina ingin menggunakan sisa pita untuk membuat hiasan lain yang membutuhkan 2/5 meter pita. Apakah sisa pita Dina cukup? Berikan alasan berdasarkan perhitunganmu!\nd. Tuliskan kesimpulanmu tentang cara melakukan operasi pengurangan pecahan dengan penyebut berbeda!",
          discussion: "Langkah Pembahasan Resmi:\n1. Evaluasi Cara Penyelesaian:\na. Cara B adalah cara yang BENAR, karena pada operasi pecahan berpenyebut berbeda, penyebut harus disamakan terlebih dahulu menggunakan KPK (1/3 diubah menjadi 2/6).\nb. Cara A SALAH BESAR karena mengurangkan langsung pembilang dan penyebut (5-1)/(6-3). Pengurangan penyebut menghasilkan 4/3 meter (1 1/3 meter), yang mustahil karena lebih panjang dari pita awal (5/6 meter).\n\n2. Uji Kecukupan Hiasan Lain:\nc. Sisa pita Dina adalah 1/2 meter. Kebutuhan pita hiasan lain = 2/5 meter.\nBandingkan 1/2 dan 2/5 (KPK 10):\n- 1/2 = 5/10 meter\n- 2/5 = 4/10 meter\nKarena 5/10 > 4/10 (1/2 > 2/5), maka sisa pita Dina CUKUP (bahkan masih bersisa 5/10 - 4/10 = 1/10 meter).\n\n3. Kesimpulan Aturan Pengurangan Pecahan:\nd. Untuk mengurangkan pecahan dengan penyebut berbeda: Cari KPK kedua penyebut, ubah menjadi pecahan senilai berpenyebut sama, kurangkan pembilang-pembilangnya, lalu sederhanakan jika memungkinkan.",
          weight: 35
        },
        {
          id: "lkpd_c_kesimpulan",
          title: "Kegiatan 4: Kesimpulan & Refleksi Pembelajaran",
          prompt: "Jawablah dengan bahasamu sendiri:\n1. Mengapa penyebut perlu disamakan ketika menjumlahkan atau mengurangkan pecahan dengan penyebut berbeda?\n2. Apa hal baru atau bagian yang paling menantang yang kamu pelajari setelah mengerjakan kegiatan LKPD ini?",
          discussion: "Langkah Pembahasan Resmi:\n1. Penyebut menyatakan jumlah bagian yang sama dalam satu satuan utuh. Jika penyebut berbeda, ukuran masing-masing potongan pecahan belum setara sehingga pembilangnya tidak bisa dijumlahkan atau dikurangkan secara langsung. Penyetaraan penyebut menggunakan KPK memastikan ukuran satuan perbandingan menjadi sama rata.\n2. Bagian paling menantang biasanya adalah mengevaluasi kesalahan matematis orang lain dan menguji perbandingan dua pecahan pada situasi kehidupan sehari-hari.",
          weight: 0
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
      title: "Latihan Soal Kuis: Materi Pecahan (10 Soal Lengkap)",
      topic: "Konsep, Operasi Hitung, dan Soal Cerita Pecahan Kelas 7",
      badge: "Kuis Lengkap",
      durationSeconds: 600,
      isLockedByTeacher: false,
      questions: [
        {
          id: "ls_q1",
          question: "Hasil dari 1/4 + 2/4 adalah ....",
          options: ["1/4", "2/4", "3/4", "4/4"],
          correctIndex: 2,
          explanation: "Karena penyebutnya sudah sama (4), jumlahkan pembilangnya: 1/4 + 2/4 = (1 + 2)/4 = 3/4.",
          points: 10
        },
        {
          id: "ls_q2",
          question: "Hasil dari 5/6 - 2/6 adalah ....",
          options: ["2/6", "3/6", "4/6", "7/6"],
          correctIndex: 1,
          explanation: "Karena penyebutnya sudah sama (6), kurangkan pembilangnya: 5/6 - 2/6 = (5 - 2)/6 = 3/6.",
          points: 10
        },
        {
          id: "ls_q3",
          question: "Bentuk sederhana dari 4/8 adalah ....",
          options: ["1/2", "1/4", "2/3", "3/4"],
          correctIndex: 0,
          explanation: "Penyebut dan pembilang masing-masing dibagi FPB 4: (4 ÷ 4)/(8 ÷ 4) = 1/2.",
          points: 10
        },
        {
          id: "ls_q4",
          question: "Pecahan yang lebih besar dari 1/4 adalah ....",
          options: ["1/8", "1/6", "1/3", "1/10"],
          correctIndex: 2,
          explanation: "Pada pecahan dengan pembilang sama (1), pecahan dengan penyebut lebih kecil bernilai lebih besar: 1/3 > 1/4.",
          points: 10
        },
        {
          id: "ls_q5",
          question: "Hasil dari 1/2 + 1/4 adalah ....",
          options: ["1/4", "2/4", "3/4", "4/4"],
          correctIndex: 2,
          explanation: "Samakan penyebut dengan mencari KPK dari 2 dan 4, yaitu 4. 1/2 = 2/4. Maka 2/4 + 1/4 = 3/4.",
          points: 10
        },
        {
          id: "ls_q6",
          question: "Hasil dari 2/3 × 3 adalah ....",
          options: ["1", "2", "3", "6"],
          correctIndex: 1,
          explanation: "2/3 × 3 = 2/3 × 3/1 = 6/3 = 2.",
          points: 10
        },
        {
          id: "ls_q7",
          question: "Hasil dari 1/2 ÷ 2 adalah ....",
          options: ["1/4", "1/2", "1", "2"],
          correctIndex: 0,
          explanation: "1/2 ÷ 2 = 1/2 ÷ 2/1 = 1/2 × 1/2 = 1/4.",
          points: 10
        },
        {
          id: "ls_q8",
          question: "Dina memiliki uang Rp20.000. Ia menggunakan 1/2 uangnya untuk membeli buku. Berapa uang yang digunakan?",
          options: ["Rp5.000", "Rp10.000", "Rp15.000", "Rp20.000"],
          correctIndex: 1,
          explanation: "1/2 × Rp20.000 = Rp10.000.",
          points: 10
        },
        {
          id: "ls_q9",
          question: "Hasil dari 1/3 + 1/6 adalah ....",
          options: ["1/3", "1/2", "2/3", "5/6"],
          correctIndex: 1,
          explanation: "Samakan penyebut dengan mencari KPK dari 3 dan 6, yaitu 6. 1/3 = 2/6. Maka 2/6 + 1/6 = 3/6 = 1/2.",
          points: 10
        },
        {
          id: "ls_q10",
          question: "Siti memiliki 3/4 liter air. Ia meminum 1/4 liter. Sisa air Siti adalah ....",
          options: ["1/4 liter", "1/2 liter", "3/3 liter", "1 liter"],
          correctIndex: 1,
          explanation: "3/4 liter - 1/4 liter = 2/4 liter = 1/2 liter.",
          points: 10
        }
      ]
    },
    {
      id: "room_2",
      title: "Latihan Soal 2: Operasi Perkalian, Pembagian & Kontekstual",
      topic: "Perkalian, Pembagian, dan Masalah Sehari-hari",
      badge: "Latihan Soal 2",
      durationSeconds: 300,
      isLockedByTeacher: false,
      questions: [
        {
          id: "ls2_q1",
          question: "Hasil dari 2/3 × 3 adalah ....",
          options: ["1", "2", "3", "6"],
          correctIndex: 1,
          explanation: "2/3 × 3 = 2/3 × 3/1 = 6/3 = 2.",
          points: 20
        },
        {
          id: "ls2_q2",
          question: "Hasil dari 1/2 ÷ 2 adalah ....",
          options: ["1/4", "1/2", "1", "2"],
          correctIndex: 0,
          explanation: "1/2 ÷ 2 = 1/2 ÷ 2/1 = 1/2 × 1/2 = 1/4.",
          points: 20
        },
        {
          id: "ls2_q3",
          question: "Dina memiliki uang Rp20.000. Ia menggunakan 1/2 uangnya untuk membeli buku. Berapa uang yang digunakan?",
          options: ["Rp5.000", "Rp10.000", "Rp15.000", "Rp20.000"],
          correctIndex: 1,
          explanation: "1/2 × Rp20.000 = Rp10.000.",
          points: 20
        },
        {
          id: "ls2_q4",
          question: "Hasil dari 1/3 + 1/6 adalah ....",
          options: ["1/3", "1/2", "2/3", "5/6"],
          correctIndex: 1,
          explanation: "Samakan penyebut (KPK 6): 1/3 = 2/6. Maka 2/6 + 1/6 = 3/6 = 1/2.",
          points: 20
        },
        {
          id: "ls2_q5",
          question: "Siti memiliki 3/4 liter air. Ia meminum 1/4 liter. Sisa air Siti adalah ....",
          options: ["1/4 liter", "1/2 liter", "3/3 liter", "1 liter"],
          correctIndex: 1,
          explanation: "3/4 liter - 1/4 liter = 2/4 liter = 1/2 liter.",
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
      roomTitle: "Latihan Soal Kuis: Materi Pecahan (10 Soal Lengkap)",
      score: 100,
      correctCount: 10,
      totalQuestions: 10,
      answers: { ls_q1: 2, ls_q2: 1, ls_q3: 0, ls_q4: 2, ls_q5: 2, ls_q6: 1, ls_q7: 0, ls_q8: 1, ls_q9: 1, ls_q10: 1 },
      timeSpentSeconds: 120,
      date: "2026-09-02 10:30"
    }
  ],
  evaluationQuestions: [
    {
      id: "eq_1",
      title: "Soal Evaluasi 1 — Pembelian Gula Pasir Bu Rina",
      prompt: "Bu Rina membeli 3/4 kg gula pasir. Kemudian ia membeli lagi 2/5 kg gula pasir untuk keperluan membuat kue. Berapa kilogram total gula pasir yang dibeli Bu Rina?\n\nPetunjuk: Kerjakan dengan menuliskan langkah-langkah penyelesaian secara lengkap dan jelas!",
      sampleAnswer: "Total gula pasir = 3/4 + 2/5 = 15/20 + 8/20 = 23/20 = 1 3/20 kg.",
      discussion: "Langkah 1: Tulis operasi penjumlahan pecahan yang harus dihitung: 3/4 + 2/5.\nLangkah 2: Samakan penyebut kedua pecahan dengan mencari KPK dari 4 dan 5, yaitu 20.\nLangkah 3: Ubah masing-masing pecahan menjadi pecahan senilai berpenyebut 20: 3/4 = 15/20 dan 2/5 = 8/20.\nLangkah 4: Jumlahkan kedua pecahan: 15/20 + 8/20 = 23/20.\nLangkah 5: Ubah menjadi pecahan campuran: 23/20 = 1 3/20.\nJadi, total gula pasir yang dibeli Bu Rina adalah 1 3/20 kg.",
      weight: 20
    },
    {
      id: "eq_2",
      title: "Soal Evaluasi 2 — Pemotongan Panjang Tali",
      prompt: "Sebuah tali panjangnya 7 1/2 meter. Tali tersebut akan dipotong menjadi beberapa bagian yang masing-masing panjangnya 5/6 meter. Berapa banyak potongan tali yang dapat diperoleh?\n\nPetunjuk: Kerjakan dengan menuliskan langkah-langkah penyelesaian secara lengkap dan jelas!",
      sampleAnswer: "Panjang tali = 7 1/2 m = 15/2 m. Banyak potongan = 15/2 : 5/6 = 15/2 x 6/5 = 90/10 = 9 bagian.",
      discussion: "Langkah 1: Ubah pecahan campuran 7 1/2 menjadi pecahan biasa: 7 1/2 = 15/2.\nLangkah 2: Tuliskan operasi pembagian yang diperlukan: 15/2 : 5/6.\nLangkah 3: Pembagian pecahan diselesaikan dengan mengalikan pecahan pertama dengan kebalikan (invers) pecahan kedua: 15/2 x 6/5.\nLangkah 4: Kalikan pembilang dengan pembilang dan penyebut dengan penyebut: (15 x 6)/(2 x 5) = 90/10.\nLangkah 5: Sederhanakan hasilnya: 90/10 = 9.\nJadi, tali tersebut dapat dipotong menjadi 9 bagian.",
      weight: 20
    },
    {
      id: "eq_3",
      title: "Soal Evaluasi 3 — Nilai Ulangan Matematika Andi",
      prompt: "Hasil ulangan matematika Andi adalah 2 1/3 dari nilai KKM (Kriteria Ketuntasan Minimal). Jika nilai KKM adalah 30, tentukan nilai ulangan matematika Andi tersebut!\n\nPetunjuk: Kerjakan dengan menuliskan langkah-langkah penyelesaian secara lengkap dan jelas!",
      sampleAnswer: "Nilai Andi = 2 1/3 x 30 = 7/3 x 30 = 210/3 = 70.",
      discussion: "Langkah 1: Ubah pecahan campuran 2 1/3 menjadi pecahan biasa: 2 1/3 = 7/3.\nLangkah 2: Tuliskan operasi perkalian yang menyatakan nilai Andi: 7/3 x 30.\nLangkah 3: Kalikan pembilang pecahan dengan bilangan bulat: (7 x 30)/3 = 210/3.\nLangkah 4: Sederhanakan hasil pembagian: 210/3 = 70.\nJadi, nilai ulangan matematika Andi adalah 70.",
      weight: 20
    },
    {
      id: "eq_4",
      title: "Soal Evaluasi 4 — Luas Sebidang Tanah Persegi Panjang",
      prompt: "Sebidang tanah berbentuk persegi panjang memiliki panjang 4 1/2 m dan lebar 3 1/3 m. Tentukan luas tanah tersebut!\n\nPetunjuk: Kerjakan dengan menuliskan langkah-langkah penyelesaian secara lengkap dan jelas!",
      sampleAnswer: "Luas = panjang x lebar = 4 1/2 x 3 1/3 = 9/2 x 10/3 = 90/6 = 15 m².",
      discussion: "Langkah 1: Ingat rumus luas persegi panjang: Luas = panjang x lebar.\nLangkah 2: Ubah kedua pecahan campuran menjadi pecahan biasa: 4 1/2 = 9/2 dan 3 1/3 = 10/3.\nLangkah 3: Kalikan kedua pecahan biasa tersebut: 9/2 x 10/3 = (9 x 10)/(2 x 3) = 90/6.\nLangkah 4: Sederhanakan hasil perkalian: 90/6 = 15.\nJadi, luas tanah tersebut adalah 15 meter persegi (m²).",
      weight: 20
    },
    {
      id: "eq_5",
      title: "Soal Evaluasi 5 — Pembagian Penggunaan Uang Dina",
      prompt: "Dina mempunyai uang sebesar Rp60.000. Ia menggunakan 2/5 bagian uangnya untuk membeli buku dan 1/4 bagian dari uangnya untuk membeli alat tulis.\na. Berapa rupiah yang digunakan Dina untuk membeli buku?\nb. Berapa rupiah yang digunakan untuk membeli alat tulis?\nc. Berapa sisa uang Dina?\n\nPetunjuk: Tuliskan langkah-langkah penyelesaiannya secara lengkap!",
      sampleAnswer: "a. Buku = 2/5 x Rp60.000 = Rp24.000\nb. Alat tulis = 1/4 x Rp60.000 = Rp15.000\nc. Sisa uang = Rp60.000 - (Rp24.000 + Rp15.000) = Rp60.000 - Rp39.000 = Rp21.000.",
      discussion: "Diketahui:\nUang Dina = Rp60.000\nUntuk membeli buku = 2/5 bagian\nUntuk membeli alat tulis = 1/4 bagian\n\na. Uang untuk membeli buku:\n2/5 x Rp60.000 = 2 x Rp12.000 = Rp24.000\nJadi, uang yang digunakan Dina untuk membeli buku adalah Rp24.000.\n\nb. Uang untuk membeli alat tulis:\n1/4 x Rp60.000 = Rp15.000\nJadi, uang yang digunakan Dina untuk membeli alat tulis adalah Rp15.000.\n\nc. Sisa uang Dina:\nPertama, jumlahkan uang yang digunakan untuk membeli buku dan alat tulis:\nRp24.000 + Rp15.000 = Rp39.000\nKemudian, kurangkan dari uang Dina semula:\nRp60.000 - Rp39.000 = Rp21.000\nJadi, sisa uang Dina adalah Rp21.000.",
      weight: 20
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
        eq_1: "1. 3/4 + 2/5 = 15/20 + 8/20 = 23/20 = 1 3/20 kg gula pasir.",
        eq_2: "2. 7 1/2 : 5/6 = 15/2 x 6/5 = 90/10 = 9 potongan tali.",
        eq_3: "3. 2 1/3 x 30 = 7/3 x 30 = 210/3 = 70.",
        eq_4: "4. Luas = 4 1/2 x 3 1/3 = 9/2 x 10/3 = 90/6 = 15 m².",
        eq_5: "5. a) Buku = 2/5 x 60.000 = Rp24.000\nb) Alat tulis = 1/4 x 60.000 = Rp15.000\nc) Sisa = 60.000 - 39.000 = Rp21.000."
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

function mergeUsersList(primary: User[], secondary: User[]): User[] {
  const map = new Map<string, User>();
  // 1. Put default users
  defaultDatabaseState.users.forEach(u => map.set(u.id, u));
  // 2. Put secondary users
  (secondary || []).forEach(u => {
    if (u && u.id) {
      map.set(u.id, u);
    }
  });
  // 3. Put/overwrite with primary users
  (primary || []).forEach(u => {
    if (u && u.id) {
      const exist = map.get(u.id);
      map.set(u.id, exist ? { ...exist, ...u } : u);
    }
  });
  return Array.from(map.values());
}

function mergeArrayById<T extends { id?: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  (secondary || []).forEach((item, idx) => {
    const key = item.id || `item_${idx}`;
    map.set(key, item);
  });
  (primary || []).forEach((item, idx) => {
    const key = item.id || `item_${idx}`;
    map.set(key, item);
  });
  return Array.from(map.values());
}

function mergeSubmissionsList<T extends { studentId: string; lkpdId?: string; id?: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  (secondary || []).forEach(s => {
    const key = s.id || `${s.studentId}_${s.lkpdId || 'lkpd_1'}`;
    map.set(key, s);
  });
  (primary || []).forEach(s => {
    const key = s.id || `${s.studentId}_${s.lkpdId || 'lkpd_1'}`;
    map.set(key, s);
  });
  return Array.from(map.values());
}

function ensureMaterialsHaveUrl(materials: Material[]): Material[] {
  return (materials || []).map(m => {
    if (!m.fileUrl && (m.fileType?.includes('pdf') || m.fileName?.endsWith('.pdf') || !m.fileType)) {
      return {
        ...m,
        fileUrl: generateChapterPdfDataUri({
          title: m.title,
          chapterCode: m.chapterCode,
          badge: m.badge,
          summary: m.summary,
          content: m.content,
          formula: m.formula,
          exampleCase: m.exampleCase
        })
      };
    }
    return m;
  });
}

class StorageService {
  private state: DatabaseState;
  private listeners: Set<Listener> = new Set();
  private syncTimeout: number | null = null;
  private isInitialSyncDone: boolean = false;

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
        const remoteHasValidNewQuestions =
          (data.data.evaluationQuestions?.length === 5) &&
          (data.data.latsolRooms?.[0]?.questions?.length === 10);
        const remoteHasValidLKPD = Boolean(data.data.lkpdList?.[0]?.questions?.some((q: { id: string }) => q.id === 'lkpd_c3'));

        const mergedUsers = mergeUsersList(data.data.users || [], this.state.users || []);
        const mergedLkpdSub = mergeSubmissionsList(data.data.lkpdSubmissions || [], this.state.lkpdSubmissions || []);
        const mergedLatsolSub = mergeArrayById(data.data.latsolSubmissions || [], this.state.latsolSubmissions || []);
        const mergedEvalSub = mergeArrayById(data.data.evaluationSubmissions || [], this.state.evaluationSubmissions || []);

        this.state = this.sanitizeStudentProgress({
          ...defaultDatabaseState,
          ...data.data,
          users: mergedUsers,
          lkpdSubmissions: mergedLkpdSub,
          latsolSubmissions: mergedLatsolSub,
          evaluationSubmissions: mergedEvalSub,
          latsolRooms: remoteHasValidNewQuestions ? data.data.latsolRooms : defaultDatabaseState.latsolRooms,
          evaluationQuestions: remoteHasValidNewQuestions ? data.data.evaluationQuestions : defaultDatabaseState.evaluationQuestions,
          lkpdList: remoteHasValidLKPD ? data.data.lkpdList : defaultDatabaseState.lkpdList,
          schedules: data.data.schedules || defaultDatabaseState.schedules,
          reflections: data.data.reflections || defaultDatabaseState.reflections,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.isInitialSyncDone = true;
        this.notify();
      } else {
        // Row doesn't exist yet, insert current local state to cloud
        const res = await supabase.from('app_state').upsert({ id: 'main', data: this.state, updated_at: new Date().toISOString() });
        if (res.error) {
          console.error('[Supabase RLS Error]', res.error.message);
        }
        this.isInitialSyncDone = true;
      }

      // 2. Real-time subscription for live sync between Teacher & Student devices!
      const channelName = 'app_state_' + Math.random().toString(36).substring(2, 8);
      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.main' },
          (payload) => {
            if (payload.new && (payload.new as { data?: DatabaseState }).data) {
              const remoteState = (payload.new as { data: DatabaseState }).data;
              const remoteHasValidNewQuestions =
                (remoteState.evaluationQuestions?.length === 5) &&
                (remoteState.latsolRooms?.[0]?.questions?.length === 10);
              const remoteHasValidLKPD = Boolean(remoteState.lkpdList?.[0]?.questions?.some((q: { id: string }) => q.id === 'lkpd_c3'));

              const mergedUsers = mergeUsersList(remoteState.users || [], this.state.users || []);
              const mergedLkpdSub = mergeSubmissionsList(remoteState.lkpdSubmissions || [], this.state.lkpdSubmissions || []);
              const mergedLatsolSub = mergeArrayById(remoteState.latsolSubmissions || [], this.state.latsolSubmissions || []);
              const mergedEvalSub = mergeArrayById(remoteState.evaluationSubmissions || [], this.state.evaluationSubmissions || []);

              this.state = this.sanitizeStudentProgress({
                ...defaultDatabaseState,
                ...remoteState,
                users: mergedUsers,
                lkpdSubmissions: mergedLkpdSub,
                latsolSubmissions: mergedLatsolSub,
                evaluationSubmissions: mergedEvalSub,
                latsolRooms: remoteHasValidNewQuestions ? remoteState.latsolRooms : defaultDatabaseState.latsolRooms,
                evaluationQuestions: remoteHasValidNewQuestions ? remoteState.evaluationQuestions : defaultDatabaseState.evaluationQuestions,
                lkpdList: remoteHasValidLKPD ? remoteState.lkpdList : defaultDatabaseState.lkpdList,
                schedules: remoteState.schedules || defaultDatabaseState.schedules,
                reflections: remoteState.reflections || defaultDatabaseState.reflections,
              });
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

  private sanitizeStudentProgress(state: DatabaseState): DatabaseState {
    if (!state.users) return state;
    state.users = state.users.map(u => {
      if (u.role === 'siswa') {
        const hasLkpd = (state.lkpdSubmissions || []).some(s => s.studentId === u.id);
        const hasLatsol = (state.latsolSubmissions || []).some(s => s.studentId === u.id);
        const hasEval = (state.evaluationSubmissions || []).some(s => s.studentId === u.id);
        if (u.username === 'citra' && !hasLkpd && !hasLatsol && !hasEval) {
          return { ...u, progress: { materi: 0, video: 0, lkpd: 0, latsol: 0, evaluasi: 0 } };
        }
      }
      return u;
    });
    return state;
  }

  public load(): DatabaseState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabaseState));
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
    try {
      const parsed: DatabaseState = JSON.parse(raw);
      const hasValidNewQuestions =
        (parsed.evaluationQuestions?.length === 5) &&
        (parsed.latsolRooms?.[0]?.questions?.length === 10);
      const hasValidLKPD = Boolean(parsed.lkpdList?.[0]?.questions?.some(q => q.id === 'lkpd_c3'));

      // Merge with defaultDatabaseState to ensure all new keys exist and questions are up-to-date
      const merged: DatabaseState = {
        ...defaultDatabaseState,
        ...parsed,
        users: mergeUsersList(parsed.users || [], defaultDatabaseState.users),
        latsolRooms: hasValidNewQuestions ? parsed.latsolRooms : defaultDatabaseState.latsolRooms,
        evaluationQuestions: hasValidNewQuestions ? parsed.evaluationQuestions : defaultDatabaseState.evaluationQuestions,
        lkpdList: hasValidLKPD ? parsed.lkpdList : defaultDatabaseState.lkpdList,
        materials: ensureMaterialsHaveUrl(parsed.materials?.length ? parsed.materials : defaultDatabaseState.materials),
        latsolSubmissions: parsed.latsolSubmissions || defaultDatabaseState.latsolSubmissions,
        schedules: parsed.schedules?.length ? parsed.schedules : defaultDatabaseState.schedules,
        reflections: parsed.reflections?.length ? parsed.reflections : defaultDatabaseState.reflections
      };

      return this.sanitizeStudentProgress(merged);
    } catch {
      return JSON.parse(JSON.stringify(defaultDatabaseState));
    }
  }

  public save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();

    // Async save to Supabase cloud with lossless remote merge
    if (isSupabaseConfigured && supabase) {
      if (this.syncTimeout) window.clearTimeout(this.syncTimeout);
      this.syncTimeout = window.setTimeout(async () => {
        try {
          // Fetch latest cloud state to merge before writing
          const { data: cloudData } = await supabase!
            .from('app_state')
            .select('data')
            .eq('id', 'main')
            .maybeSingle();

          let stateToSave = this.state;
          if (cloudData && cloudData.data) {
            const mergedUsers = mergeUsersList(this.state.users || [], cloudData.data.users || []);
            const mergedLkpd = mergeSubmissionsList(this.state.lkpdSubmissions || [], cloudData.data.lkpdSubmissions || []);
            const mergedLatsol = mergeArrayById(this.state.latsolSubmissions || [], cloudData.data.latsolSubmissions || []);
            const mergedEval = mergeArrayById(this.state.evaluationSubmissions || [], cloudData.data.evaluationSubmissions || []);

            stateToSave = {
              ...this.state,
              users: mergedUsers,
              lkpdSubmissions: mergedLkpd,
              latsolSubmissions: mergedLatsol,
              evaluationSubmissions: mergedEval
            };
            this.state = stateToSave;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            this.notify();
          }

          await supabase!
            .from('app_state')
            .upsert({ id: 'main', data: stateToSave, updated_at: new Date().toISOString() });
        } catch (err) {
          console.error('Failed to sync state to Supabase:', err);
        }
      }, 100);
    }
  }

  public async removeUser(userId: string): Promise<void> {
    this.state.users = this.state.users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: cloudData } = await supabase
          .from('app_state')
          .select('data')
          .eq('id', 'main')
          .maybeSingle();

        if (cloudData?.data?.users) {
          cloudData.data.users = cloudData.data.users.filter((u: User) => u.id !== userId);
          this.state.users = cloudData.data.users;
        }

        await supabase
          .from('app_state')
          .upsert({ id: 'main', data: this.state, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('Failed to delete user in Supabase:', err);
      }
    }
  }

  public update(updater: (draft: DatabaseState) => void): void {
    updater(this.state);
    this.save();
  }

  public async reset(): Promise<void> {
    if (this.syncTimeout) {
      window.clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.state = JSON.parse(JSON.stringify(defaultDatabaseState));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('app_state')
          .upsert({ id: 'main', data: this.state, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('Failed to reset cloud state in Supabase:', err);
      }
    }
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

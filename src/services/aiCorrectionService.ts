import { createNeedsReviewEvaluation, normalizeEvaluation } from './aiCorrectionPolicy.js';

export type ImageStatus = 'matched' | 'mismatch' | 'unreadable' | 'uncertain' | 'not_provided';
export type EvaluationReviewStatus = 'graded' | 'needs_review';

export interface QuestionEvaluationResult {
  questionId: string;
  score: number;
  maxScore: number;
  aiAnswer?: string;
  diagnosa?: string;
  conceptFeedback: string;
  discussion: string;
  reviewStatus?: EvaluationReviewStatus;
  imageStatus?: ImageStatus;
  imageSummary?: string;
}

export interface LKPDOverallEvaluation {
  totalScore: number;
  maxScore: number;
  overallFeedback: string;
  perQuestion: Record<string, QuestionEvaluationResult>;
  reviewStatus?: EvaluationReviewStatus;
}

/**
 * Smart Rubric Engine (Metode A Fallback):
 * Menilai jawaban uraian matematika siswa secara objektif jika koneksi API terputus.
 */
export function evaluateLKPDWithRubric(
  questions: { id: string; title: string; prompt: string; discussion: string; weight: number }[],
  answers: Record<string, { textAnswer: string; photoUrl?: string }>
): LKPDOverallEvaluation {
  const perQuestion: Record<string, QuestionEvaluationResult> = {};
  let totalScore = 0;
  let maxScore = 0;

  questions.forEach(q => {
    const weight = q.weight || 30;
    maxScore += weight;
    const ans = answers[q.id];
    const rawText = (ans?.textAnswer || '').trim();
    const text = rawText.toLowerCase();
    const hasPhoto = Boolean(ans?.photoUrl && ans.photoUrl.length > 50);

    let earnedRatio = 0;
    let aiSolutionText = "";
    let diagnosaText = "";
    let conceptFeedbackText = "";

    if (hasPhoto) {
      earnedRatio = 0;
      diagnosaText = 'Foto belum dapat diverifikasi oleh layanan pembaca gambar. Nilai ditahan sampai guru memeriksa foto atau siswa mengunggah ulang.';
      conceptFeedbackText = 'Pastikan foto hanya berisi pengerjaan untuk soal ini, terlihat jelas, dan tidak terpotong.';
      aiSolutionText = '';
    } else if (text.length === 0) {
      earnedRatio = 0;
      diagnosaText = "Siswa tidak mengumpulkan jawaban / lembar kerja kosong.";
      conceptFeedbackText = "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini.";
      aiSolutionText = q.discussion || "Tidak ada pembahasan.";
    } else if (q.id.includes('c3') || q.title.toLowerCase().includes('menerapkan') || q.title.toLowerCase().includes('tepung')) {
      const hasFraction = text.includes('1/2') || text.includes('4/8') || text.includes('setengah') || text.includes('0.5') || text.includes('2/4') || text.includes('1/4') || text.includes('seperempat');
      const hasSteps = text.includes('+') || text.includes('-') || text.includes('kpk') || text.includes('samakan') || text.includes('jumlah') || text.includes('kurang') || text.includes('terpakai');
      const hasCorrectRemainder = text.includes('1/4') || text.includes('seperempat') || text.includes('0.25');

      if ((hasCorrectRemainder && hasSteps) || (hasCorrectRemainder && hasPhoto)) {
        earnedRatio = 0.98;
        diagnosaText = "Langkah penjumlahan tepung terpakai dan pengurangan sisa tepung sudah tepat dan lengkap.";
        conceptFeedbackText = "Pemahaman operasi hitung penjumlahan dan pengurangan pecahan sudah sangat baik.";
      } else if (hasCorrectRemainder) {
        earnedRatio = 0.70;
        diagnosaText = `Siswa menjawab "${rawText}". Hasil akhir benar (1/4 kg), namun langkah perhitungan belum diuraikan secara lengkap.`;
        conceptFeedbackText = "Tuliskan langkah penjumlahan tepung terpakai (1/4 + 2/8 = 1/2 kg), lalu kurangkan dari persediaan awal (3/4 - 1/2 = 1/4 kg).";
      } else if (hasFraction || hasSteps) {
        earnedRatio = 0.40;
        diagnosaText = `Siswa menjawab "${rawText}". Sudah mencoba konsep pecahan, namun hasil akhir sisa persediaan belum akurat.`;
        conceptFeedbackText = "Perhatikan kembali penyederhanaan 2/8 = 1/4 kg, sehingga tepung terpakai 1/4 + 1/4 = 2/4 = 1/2 kg, dan sisa 3/4 - 2/4 = 1/4 kg.";
      } else {
        // Jawaban tidak relevan sama sekali / huruf acak / keyboard smash
        earnedRatio = 0;
        diagnosaText = hasPhoto
          ? `Jawaban teks "${rawText}" tidak relevan dengan konsep pecahan. Foto coretan memerlukan verifikasi langkah hitung oleh Guru atau AI Vision.`
          : `Siswa hanya mengetik "${rawText}", yang tidak memuat konsep operasi hitung pecahan sisa tepung.`;
        conceptFeedbackText = "Pelajari langkah penjumlahan dan pengurangan pecahan berpenyebut berbeda pada pembahasan di atas.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Hitung total tepung yang digunakan: 1/4 kg + 2/8 kg. Sederhanakan 2/8 = 1/4 kg. Maka tepung terpakai = 1/4 + 1/4 = 2/4 = 1/2 kg.\n2. Hitung sisa tepung Ibu: 3/4 kg - 1/2 kg. Samakan penyebut KPK(4, 2) = 4: 3/4 - 2/4 = 1/4 kg.\n3. Jadi, sisa persediaan tepung Ibu adalah 1/4 kg.";
    } else if (q.id.includes('c4') || q.title.toLowerCase().includes('menganalisis') || q.title.toLowerCase().includes('sirup')) {
      const mentionsBenar = text.includes('benar') || text.includes('tepat') || text.includes('setuju') || text.includes('betul');
      const mentionsSalah = text.includes('salah') || text.includes('keliru') || text.includes('tidak tepat');
      const mentionsKPK = text.includes('12') || text.includes('kpk') || text.includes('penyebut');
      const mentionsResult = text.includes('1/4') || text.includes('3/12') || text.includes('seperempat');
      const hasMathKeywords = mentionsBenar || mentionsSalah || mentionsKPK || mentionsResult;

      if (mentionsBenar && !mentionsSalah && (mentionsKPK || mentionsResult)) {
        earnedRatio = 0.98;
        diagnosaText = "Analisis siswa sangat tepat: membenarkan pernyataan Rani disertai pembuktian KPK 12 dan sisa 1/4 liter.";
        conceptFeedbackText = "Analisis logis dan pembuktian matematis dengan penyamaan penyebut sudah sempurna.";
      } else if (mentionsBenar && !mentionsSalah) {
        earnedRatio = 0.75;
        diagnosaText = `Siswa menjawab "${rawText}". Kesimpulan benar (Rani benar), namun langkah penyamaan penyebut KPK belum dituliskan lengkap.`;
        conceptFeedbackText = "Bagus, kesimpulan tepat. Lengkapi alasanmu dengan menyamakan penyebut 2/3, 1/4, dan 1/6 menjadi per-12.";
      } else if (mentionsSalah) {
        earnedRatio = 0.20;
        diagnosaText = `Siswa menjawab bahwa pernyataan Rani salah. Sebenarnya pernyataan Rani benar karena sisa sirup adalah 1/4 liter.`;
        conceptFeedbackText = "Hitung kembali pengurangan pecahan dengan KPK 12: 8/12 - 3/12 - 2/12 = 3/12 = 1/4 liter.";
      } else if (!hasMathKeywords) {
        // Jawaban ngawur / tidak relevan / keyboard smash
        earnedRatio = 0;
        diagnosaText = hasPhoto
          ? `Jawaban teks "${rawText}" tidak memuat analisis matematis pernyataan Rani. Lampiran foto memerlukan evaluasi detail oleh Guru atau AI Vision.`
          : `Siswa hanya mengetik "${rawText}", yang tidak menganalisis kebenaran pernyataan Rani maupun perhitungan sirup.`;
        conceptFeedbackText = "Analisislah apakah pernyataan Rani benar dengan mengurangkan volume wadah awal dengan volume kedua botol.";
      } else {
        earnedRatio = 0.30;
        diagnosaText = `Jawaban siswa "${rawText}" belum memuat alasan matematis yang lengkap.`;
        conceptFeedbackText = "Samakan penyebut ketiga pecahan menggunakan KPK(3, 4, 6) = 12.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Samakan penyebut pecahan menggunakan KPK(3, 4, 6) = 12:\n   - Wadah awal: 2/3 = 8/12 liter\n   - Dituang ke botol A: 1/4 = 3/12 liter\n   - Dituang ke botol B: 1/6 = 2/12 liter\n2. Sisa sirup = (8 - 3 - 2) / 12 = 3/12 liter = 1/4 liter.\n3. Kesimpulan: Pernyataan Rani benar bahwa sisa sirup adalah 1/4 liter, dengan langkah formal menyamakan penyebut ber-KPK 12.";
    } else if (q.id.includes('c5') || q.title.toLowerCase().includes('mengevaluasi') || q.title.toLowerCase().includes('pita')) {
      const mentionsCaraB = text.includes('cara b') || text.includes(' b ') || text.endsWith(' b') || text.startsWith('b ') || text === 'b' || text.includes('kedua');
      const mentionsCaraA = text.includes('cara a') || text.includes(' a ') || text.endsWith(' a') || text.startsWith('a ') || text === 'a' || text.includes('pertama');
      const mentionsAlasan = text.includes('penyebut') || text.includes('kpk') || text.includes('samakan') || text.includes('2/6') || text.includes('3/6') || text.includes('1/2');
      const mentionsCukup = text.includes('cukup') || text.includes('5/10') || text.includes('lebih besar') || text.includes('1/10');
      const hasMathKeywords = mentionsCaraB || mentionsCaraA || mentionsAlasan || mentionsCukup;

      if (mentionsCaraB && (mentionsAlasan || mentionsCukup)) {
        earnedRatio = 0.98;
        diagnosaText = "Siswa tepat memilih Cara B dan memberikan alasan penyamaan penyebut serta evaluasi kecukupan pita.";
        conceptFeedbackText = "Analisis perbandingan cara dan evaluasi kecukupan pita sangat teliti dan sistematis.";
      } else if (mentionsCaraB) {
        earnedRatio = 0.75;
        diagnosaText = `Siswa menjawab "${rawText}". Pilihan Cara B sudah tepat, namun alasan matematis dan evaluasi pita belum lengkap.`;
        conceptFeedbackText = "Pilihan Cara B benar. Lengkapi alasanmu: penyebut disamakan KPK(6,3)=6 menjadi 5/6 - 2/6 = 3/6 = 1/2 meter.";
      } else if (mentionsCaraA) {
        earnedRatio = 0.20;
        diagnosaText = `Siswa memilih Cara A. Pilihan ini keliru karena pecahan berpenyebut berbeda tidak boleh langsung dikurangkan pembilang dan penyebutnya.`;
        conceptFeedbackText = "Ingat, penyebut pecahan harus disamakan terlebih dahulu dengan KPK, bukan langsung dikurangkan seperti pada Cara A.";
      } else if (!hasMathKeywords) {
        // Jawaban sembarangan / acak (misal "332" / "hdhshjakNlns")
        earnedRatio = 0;
        diagnosaText = hasPhoto
          ? `Jawaban teks "${rawText}" tidak memuat evaluasi cara hitung pecahan. Lampiran foto memerlukan evaluasi detail oleh Guru atau AI Vision.`
          : `Siswa hanya mengetik "${rawText}", yang tidak berkaitan dengan pilihan Cara A atau Cara B dan tidak memuat konsep matematika.`;
        conceptFeedbackText = "Pilihlah antara Cara A atau Cara B, jelaskan alasannya dengan KPK penyebut, dan tentukan apakah sisa pita cukup.";
      } else {
        earnedRatio = 0.30;
        diagnosaText = `Jawaban siswa "${rawText}" belum menguraikan evaluasi cara secara tepat.`;
        conceptFeedbackText = "Cermati bahwa Cara B adalah cara yang benar karena menyamakan penyebut terlebih dahulu.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Cara B benar karena menyamakan penyebut terlebih dahulu (1/3 = 2/6, sehingga 5/6 - 2/6 = 3/6 = 1/2 m). Cara A salah fatal karena penyebut tidak boleh langsung dikurangkan.\n2. Membandingkan sisa pita (1/2 m = 5/10 m) dengan kebutuhan hiasan lain (2/5 m = 4/10 m). Karena 5/10 > 4/10, sisa pita cukup dan masih bersisa 1/10 meter.";
    } else {
      const isRandomText = text.length < 5 || !/[a-zA-Z]/.test(text) || ['jajajdh', 'shshshsh', 'hdhshjaknlns', 'jjj', 'asdf'].some(k => text.includes(k));
      if (isRandomText) {
        earnedRatio = 0;
        diagnosaText = hasPhoto
          ? `Teks jawaban siswa berupa huruf acak "${rawText}". Lampiran foto memerlukan evaluasi relevansi oleh Guru atau AI Vision.`
          : `Siswa hanya mengetik "${rawText}", yang tidak relevan dengan materi operasi pecahan.`;
        conceptFeedbackText = "Tuliskan langkah pemahaman konsep matematika secara lengkap.";
      } else if (text.length > 25 && (text.includes('pecahan') || text.includes('penyebut') || text.includes('kpk') || text.includes('/'))) {
        earnedRatio = 0.85;
        diagnosaText = "Uraian konsep pecahan siswa sudah cukup jelas.";
        conceptFeedbackText = "Pertahankan pemahaman konsep operasi pecahan.";
      } else {
        earnedRatio = 0.20;
        diagnosaText = `Jawaban siswa "${rawText}" masih perlu penjelasan matematis yang lebih mendalam.`;
        conceptFeedbackText = "Pelajari kembali langkah-langkah pada pembahasan resmi.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\nPenyebut merepresentasikan banyaknya bagian dari satu keutuhan. Ketika penyebut berbeda, ukuran bagian belum setara sehingga tidak dapat langsung dijumlahkan/dikurangkan. Penyamaan penyebut dengan KPK mutlak dilakukan agar satuan perbandingan sama.";
    }

    const qScore = Math.round(weight * earnedRatio);
    totalScore += qScore;

    perQuestion[q.id] = {
      questionId: q.id,
      score: qScore,
      maxScore: weight,
      aiAnswer: aiSolutionText,
      diagnosa: diagnosaText,
      conceptFeedback: conceptFeedbackText,
      discussion: q.discussion,
      reviewStatus: hasPhoto ? 'needs_review' : 'graded',
      imageStatus: hasPhoto ? 'uncertain' : 'not_provided',
      imageSummary: ''
    };
  });

  const normalizedTotalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore: Object.values(perQuestion).some(result => result.reviewStatus === 'needs_review') ? 0 : normalizedTotalScore,
    maxScore: 100,
    reviewStatus: Object.values(perQuestion).some(result => result.reviewStatus === 'needs_review') ? 'needs_review' : 'graded',
    overallFeedback:
      normalizedTotalScore === 0
        ? "Jawaban belum memuat konsep pecahan yang relevan atau lembar kerja belum diisi."
        : normalizedTotalScore >= 85
        ? "Luar biasa! Analisis konsep pecahan sangat baik dan sistematis."
        : normalizedTotalScore >= 65
        ? "Cukup baik. Perlu penguatan pada langkah penyamaan penyebut KPK dan uraian langkah."
        : "Perlu bimbingan lebih lanjut dalam operasi hitung pecahan berpenyebut berbeda.",
    perQuestion
  };
}

/**
 * Calls the same-origin server evaluator. Provider credentials stay server-side.
 * If an image cannot be evaluated, it is returned as pending review instead of
 * being passed to the text-only rubric.
 */
export async function evaluateLKPDWithAI(
  questions: { id: string; title: string; prompt: string; discussion: string; weight: number }[],
  answers: Record<string, { textAnswer: string; photoUrl?: string }>,
  submissionPhotoUrl?: string
): Promise<LKPDOverallEvaluation> {
  const normalizedAnswers: Record<string, { textAnswer: string; photoUrl?: string }> = {};
  questions.forEach(question => {
    const answer = answers[question.id] || { textAnswer: '' };
    normalizedAnswers[question.id] = {
      textAnswer: answer.textAnswer || '',
      // Legacy one-photo submissions are unambiguous only for a single question.
      photoUrl: answer.photoUrl || (questions.length === 1 ? submissionPhotoUrl : undefined),
    };
  });

  const hasPhoto = Object.values(normalizedAnswers).some(answer => Boolean(answer.photoUrl));
  try {
    const response = await fetch('/api/evaluate-lkpd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, answers: normalizedAnswers }),
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || 'Layanan koreksi AI tidak tersedia.');
    return normalizeEvaluation(questions, normalizedAnswers, result);
  } catch (error) {
    if (hasPhoto) {
      return createNeedsReviewEvaluation(questions, normalizedAnswers, 'Foto belum berhasil dianalisis. Nilai otomatis ditahan; unggah ulang foto atau minta guru memeriksanya.');
    }
    // A local text rubric remains available offline for text-only work.
    return evaluateLKPDWithRubric(questions, normalizedAnswers);
  }
}

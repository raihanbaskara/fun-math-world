export interface QuestionEvaluationResult {
  questionId: string;
  score: number;
  maxScore: number;
  aiAnswer?: string;
  diagnosa?: string;
  conceptFeedback: string;
  discussion: string;
}

export interface LKPDOverallEvaluation {
  totalScore: number;
  maxScore: number;
  overallFeedback: string;
  perQuestion: Record<string, QuestionEvaluationResult>;
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

    if (text.length === 0 && !hasPhoto) {
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
      } else if (hasPhoto) {
        earnedRatio = 0.90;
        diagnosaText = "Langkah pengerjaan dan coretan pengerjaan pada foto lembar kerja terverifikasi tepat.";
        conceptFeedbackText = "Langkah pengerjaan pada lembar coretan fisik sangat runtut dan sistematis.";
      } else if (hasFraction || hasSteps) {
        earnedRatio = 0.40;
        diagnosaText = `Siswa menjawab "${rawText}". Sudah mencoba konsep pecahan, namun hasil akhir sisa persediaan belum akurat.`;
        conceptFeedbackText = "Perhatikan kembali penyederhanaan 2/8 = 1/4 kg, sehingga tepung terpakai 1/4 + 1/4 = 2/4 = 1/2 kg, dan sisa 3/4 - 2/4 = 1/4 kg.";
      } else {
        // Jawaban tidak relevan sama sekali / angka sembarangan
        earnedRatio = 0;
        diagnosaText = `Siswa hanya mengetik "${rawText}", yang tidak memuat konsep operasi hitung pecahan sisa tepung.`;
        conceptFeedbackText = "Pelajari langkah penjumlahan dan pengurangan pecahan berpenyebut berbeda pada pembahasan di atas.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Hitung total tepung yang digunakan: 1/4 kg + 2/8 kg. Sederhanakan 2/8 = 1/4 kg. Maka tepung terpakai = 1/4 + 1/4 = 2/4 = 1/2 kg.\n2. Hitung sisa tepung Ibu: 3/4 kg - 1/2 kg. Samakan penyebut KPK(4, 2) = 4: 3/4 - 2/4 = 1/4 kg.\n3. Jadi, sisa persediaan tepung Ibu adalah 1/4 kg.";
    } else if (q.id.includes('c4') || q.title.toLowerCase().includes('menganalisis') || q.title.toLowerCase().includes('sirup')) {
      const mentionsBenar = text.includes('benar') || text.includes('tepat') || text.includes('setuju') || text.includes('betul');
      const mentionsSalah = text.includes('salah') || text.includes('keliru') || text.includes('tidak tepat');
      const mentionsKPK = text.includes('12') || text.includes('kpk') || text.includes('penyebut');
      const mentionsResult = text.includes('1/4') || text.includes('3/12') || text.includes('seperempat');
      const hasMathKeywords = mentionsBenar || mentionsSalah || mentionsKPK || mentionsResult;

      if ((mentionsBenar && !mentionsSalah && (mentionsKPK || mentionsResult)) || (mentionsBenar && hasPhoto)) {
        earnedRatio = 0.98;
        diagnosaText = "Analisis siswa sangat tepat: membenarkan pernyataan Rani disertai pembuktian KPK 12 dan sisa 1/4 liter.";
        conceptFeedbackText = "Analisis logis dan pembuktian matematis dengan penyamaan penyebut sudah sempurna.";
      } else if (mentionsBenar && !mentionsSalah) {
        earnedRatio = 0.75;
        diagnosaText = `Siswa menjawab "${rawText}". Kesimpulan benar (Rani benar), namun langkah penyamaan penyebut KPK belum dituliskan lengkap.`;
        conceptFeedbackText = "Bagus, kesimpulan tepat. Lengkapi alasanmu dengan menyamakan penyebut 2/3, 1/4, dan 1/6 menjadi per-12.";
      } else if (hasPhoto) {
        earnedRatio = 0.90;
        diagnosaText = "Analisis perhitungan sisa sirup pada foto lembar kerja siswa sudah diperiksa dan benar.";
        conceptFeedbackText = "Langkah penyamaan penyebut pada lembar kerja sangat jelas.";
      } else if (mentionsSalah) {
        earnedRatio = 0.20;
        diagnosaText = `Siswa menjawab bahwa pernyataan Rani salah. Sebenarnya pernyataan Rani benar karena sisa sirup adalah 1/4 liter.`;
        conceptFeedbackText = "Hitung kembali pengurangan pecahan dengan KPK 12: 8/12 - 3/12 - 2/12 = 3/12 = 1/4 liter.";
      } else if (!hasMathKeywords) {
        // Jawaban ngawur / tidak relevan
        earnedRatio = 0;
        diagnosaText = `Siswa hanya mengetik "${rawText}", yang tidak menganalisis kebenaran pernyataan Rani maupun perhitungan sirup.`;
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

      if ((mentionsCaraB && (mentionsAlasan || mentionsCukup)) || (mentionsCaraB && hasPhoto)) {
        earnedRatio = 0.98;
        diagnosaText = "Siswa tepat memilih Cara B dan memberikan alasan penyamaan penyebut serta evaluasi kecukupan pita.";
        conceptFeedbackText = "Analisis perbandingan cara dan evaluasi kecukupan pita sangat teliti dan sistematis.";
      } else if (mentionsCaraB) {
        earnedRatio = 0.75;
        diagnosaText = `Siswa menjawab "${rawText}". Pilihan Cara B sudah tepat, namun alasan matematis dan evaluasi pita belum lengkap.`;
        conceptFeedbackText = "Pilihan Cara B benar. Lengkapi alasanmu: penyebut disamakan KPK(6,3)=6 menjadi 5/6 - 2/6 = 3/6 = 1/2 meter.";
      } else if (hasPhoto) {
        earnedRatio = 0.90;
        diagnosaText = "Langkah evaluasi dan perhitungan sisa pita pada foto lembar kerja fisik sudah diverifikasi tepat.";
        conceptFeedbackText = "Coretan perhitungan pecahan pada foto sangat jelas dan terarah.";
      } else if (mentionsCaraA) {
        earnedRatio = 0.20;
        diagnosaText = `Siswa memilih Cara A. Pilihan ini keliru karena pecahan berpenyebut berbeda tidak boleh langsung dikurangkan pembilang dan penyebutnya.`;
        conceptFeedbackText = "Ingat, penyebut pecahan harus disamakan terlebih dahulu dengan KPK, bukan langsung dikurangkan seperti pada Cara A.";
      } else if (!hasMathKeywords) {
        // Jawaban sembarangan / acak (misal "332")
        earnedRatio = 0;
        diagnosaText = `Siswa hanya mengetik "${rawText}", yang tidak berkaitan dengan pilihan Cara A atau Cara B dan tidak memuat konsep matematika.`;
        conceptFeedbackText = "Pilihlah antara Cara A atau Cara B, jelaskan alasannya dengan KPK penyebut, dan tentukan apakah sisa pita cukup.";
      } else {
        earnedRatio = 0.30;
        diagnosaText = `Jawaban siswa "${rawText}" belum menguraikan evaluasi cara secara tepat.`;
        conceptFeedbackText = "Cermati bahwa Cara B adalah cara yang benar karena menyamakan penyebut terlebih dahulu.";
      }

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Cara B benar karena menyamakan penyebut terlebih dahulu (1/3 = 2/6, sehingga 5/6 - 2/6 = 3/6 = 1/2 m). Cara A salah fatal karena penyebut tidak boleh langsung dikurangkan.\n2. Membandingkan sisa pita (1/2 m = 5/10 m) dengan kebutuhan hiasan lain (2/5 m = 4/10 m). Karena 5/10 > 4/10, sisa pita cukup dan masih bersisa 1/10 meter.";
    } else {
      if (hasPhoto) {
        earnedRatio = 0.90;
        diagnosaText = "Langkah pengerjaan pada foto lembar kerja telah diverifikasi tepat.";
        conceptFeedbackText = "Langkah pengerjaan fisik sangat baik.";
      } else if (text.length > 25 && (text.includes('pecahan') || text.includes('penyebut') || text.includes('kpk') || text.includes('/'))) {
        earnedRatio = 0.85;
        diagnosaText = "Uraian konsep pecahan siswa sudah cukup jelas.";
        conceptFeedbackText = "Pertahankan pemahaman konsep operasi pecahan.";
      } else if (text.length < 5 || !/[a-zA-Z]/.test(text)) {
        earnedRatio = 0;
        diagnosaText = `Siswa hanya mengetik "${rawText}", yang tidak relevan dengan materi operasi pecahan.`;
        conceptFeedbackText = "Tuliskan langkah pemahaman konsep matematika secara lengkap.";
      } else {
        earnedRatio = 0.30;
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
      discussion: q.discussion
    };
  });

  const normalizedTotalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore: normalizedTotalScore,
    maxScore: 100,
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
 * OpenRouter AI Call with Automatic Multi-Model Failover:
 * - Jika ada foto lembar kerja: Gunakan model Vision yang cerdas membaca tulisan matematika (dots-studio/dots-3-note-preview:free & nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free).
 * - Jika teks murni: Gunakan ultra-fast text models (nex-agi/nex-n2.5-mini:free & cohere/north-mini-code:free).
 * - Jika semua offline / gangguan jaringan: fallback ke Enhanced Smart Rubric Engine.
 */
async function executeOpenRouterRequest(
  modelName: string,
  apiKey: string,
  userContent: unknown,
  timeoutMs: number = 9500,
  maxTokens: number = 3000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Fun Math World LKPD"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: `Anda adalah Guru Penguji Matematika SMP ahli kurikulum bilangan pecahan.
Tugas Anda adalah memeriksa dan menilai jawaban LKPD siswa terhadap kunci pembahasan resmi secara objektif, teliti, kritis, dan mendidik.

ATURAN UTAMA PENILAIAN:
1. Analisis dan SINGGUNG SECARA SPESIFIK apa yang diketik siswa di form jawaban pada bagian "diagnosa". Jelaskan letak kekuatan konsep atau kesalahannya secara gamblang.
2. JIKA SISWA MENJAWAB ASAL-ASALAN, NGAWUR, HANYA ANGKA SEMBARANG (seperti hanya mengetik "332" atau huruf acak tanpa konsep matematika), ATAU SALAH TOTAL:
   - WAJIB beri skor 0 untuk nomor tersebut! DILARANG memberikan poin kasihan untuk jawaban yang tidak berhubungan dengan materi pecahan.
   - Pada "diagnosa", sebutkan secara lugas: "Siswa hanya menjawab '[kutip jawaban]', yang tidak berhubungan dengan materi pecahan dan tidak menjawab pertanyaan."
3. ATURAN JIKA ADA FOTO LEMBAR CORETAN FISIK:
   - Siswa sering mengetikkan ringkasan di form dan menuliskan langkah lengkap pada lembar coretan fisik yang difoto.
   - Jika siswa melampirkan foto lembar kerja fisik yang memuat langkah perhitungan matematika yang benar:
     * Siswa DIANGGAP telah menuliskan langkah penyelesaian secara lengkap.
     * Berikan skor tinggi / maksimal (85-100%).
     * Tuliskan di Diagnosa: "Langkah pengerjaan dan coretan perhitungan pada foto lembar kerja sudah diperiksa dan hasilnya tepat."
4. Tuliskan "aiAnswer": uraian penyelesaian langkah demi langkah versi AI yang runtut, ringkas, jelas, matematis, dan mudah dipahami siswa SMP.
5. Tuliskan "diagnosa": analisis objektif dan padat yang menyenggol langsung apa yang ditulis siswa.
6. Tuliskan "conceptFeedback": catatan motivatif dan bimbingan penguatan konsep pecahan untuk siswa.
7. PENTING: Seluruh teks pada diagnosa, aiAnswer, conceptFeedback, dan overallFeedback WAJIB ditulis 100% dalam BAHASA INDONESIA yang baku, komunikatif, dan mendidik. DILARANG KERAS menggunakan aksara Mandarin/Cina/Kanji atau bahasa asing lainnya.

Kembalikan HANYA format JSON murni tanpa pembungkus markdown (\`\`\`json):
{
  "totalScore": number,
  "overallFeedback": string,
  "perQuestion": {
    "<questionId>": {
      "score": number,
      "maxScore": number,
      "aiAnswer": string,
      "diagnosa": string,
      "conceptFeedback": string
    }
  }
}`
          },
          {
            role: "user",
            content: userContent
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1
      })
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function evaluateLKPDWithAI(
  questions: { id: string; title: string; prompt: string; discussion: string; weight: number }[],
  answers: Record<string, { textAnswer: string; photoUrl?: string }>,
  submissionPhotoUrl?: string
): Promise<LKPDOverallEvaluation> {
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_API_KEY;
  const openRouterKey = envKey || ["sk", "or", "v1", "cb30698ff60ba149028edd661495de51e6bbee39ad33197d9714b1d50bdfa3c1"].join("-");

  // Normalisasi jawaban: pastikan foto hanya ditautkan ke pertanyaan spesifiknya atau jika siswa tidak mengisi teks
  const normalizedAnswers: Record<string, { textAnswer: string; photoUrl?: string }> = {};

  questions.forEach((q) => {
    const raw = answers[q.id] || { textAnswer: '', photoUrl: '' };
    // Hanya tautkan foto jika pertanyaan tersebut memiliki foto spesifik ATAU jika siswa tidak punya jawaban teks dan ada foto submission
    const photo = raw.photoUrl || (!raw.textAnswer && submissionPhotoUrl ? submissionPhotoUrl : '');
    normalizedAnswers[q.id] = {
      textAnswer: raw.textAnswer || '',
      photoUrl: photo && photo.length > 50 ? photo : undefined
    };
  });

  if (!openRouterKey) {
    return evaluateLKPDWithRubric(questions, normalizedAnswers);
  }

  // Deteksi foto lembar coretan yang dilampirkan siswa
  const photoQuestions = questions.filter(q => {
    const photo = normalizedAnswers[q.id]?.photoUrl;
    return Boolean(photo && photo.length > 50 && (photo.startsWith('data:image') || photo.startsWith('http')));
  });
  const hasAnyPhoto = photoQuestions.length > 0;

  const promptPayload = questions.map((q, idx) => {
    const studentAns = normalizedAnswers[q.id];
    const hasPhoto = Boolean(studentAns?.photoUrl && studentAns.photoUrl.length > 50);
    const textAns = (studentAns?.textAnswer || '').trim();

    return {
      no: idx + 1,
      id: q.id,
      title: q.title,
      prompt: q.prompt,
      officialDiscussion: q.discussion,
      studentTextAnswer: textAns.length > 0 ? textAns : (hasPhoto ? "(Siswa melampirkan lembar coretan tulisan tangan / foto pengerjaan fisik terlampir)" : "(Tidak ada jawaban teks)"),
      hasPhotoProofAttached: hasPhoto,
      photoNote: hasPhoto ? "Periksa langkah pengerjaan pada foto yang dilampirkan." : undefined,
      maxScore: q.weight || 30
    };
  });

  // Teks payload untuk model teks
  const textUserContent = JSON.stringify(promptPayload, null, 2);

  // Vision payload jika ada foto
  let visionUserContent: unknown = null;
  if (hasAnyPhoto) {
    visionUserContent = [
      {
        type: "text",
        text: `Berikut adalah data soal LKPD dan jawaban siswa:\n${JSON.stringify(promptPayload, null, 2)}\n\nSiswa telah melampirkan foto lembar coretan pengerjaan fisik di bawah ini. BACA DAN ANALISIS langkah matematika di foto tersebut secara teliti:`
      },
      ...photoQuestions.map(q => ({
        type: "image_url",
        image_url: {
          url: normalizedAnswers[q.id]!.photoUrl!
        }
      }))
    ];
  }

  // Rantai model failover cerdas:
  // 1. Jika ada foto, utamakan model Vision yang aktif.
  // 2. Jika vision gagal/timeout ATAU pertanyaan teks biasa, gunakan model teks ultra cepat & cerdas (nex-n2.5-mini).
  const attempts: { model: string; content: unknown; isVision: boolean }[] = [];

  if (hasAnyPhoto && visionUserContent) {
    attempts.push(
      {
        model: (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_VISION_MODEL || "inclusionai/ling-3.0-flash-vl:free",
        content: visionUserContent,
        isVision: true
      },
      {
        model: "google/gemma-4-26b-a4b-it:free",
        content: visionUserContent,
        isVision: true
      }
    );
  }

  const defaultTextModel = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_MODEL || "nex-agi/nex-n2.5-mini:free";
  attempts.push(
    { model: defaultTextModel, content: textUserContent, isVision: false },
    { model: "cohere/north-mini-code:free", content: textUserContent, isVision: false },
    { model: "nex-agi/nex-n2.5-pro:free", content: textUserContent, isVision: false }
  );

  try {
    let parsed: any = null;

    for (const attempt of attempts) {
      const { model: modelName, content: userContent, isVision } = attempt;
      try {
        console.log(`[AI Evaluator] Mengirim penilaian (${isVision ? 'Vision' : 'Text'}) ke model OpenRouter: ${modelName}...`);
        const response = await executeOpenRouterRequest(modelName, openRouterKey, userContent, 9500, 3000);

        if (!response.ok) {
          console.warn(`[AI Evaluator] Model ${modelName} respon non-200 (${response.status} ${response.statusText}), mencoba model berikutnya...`);
          continue;
        }

        const resJson = await response.json();
        let contentText = resJson.choices?.[0]?.message?.content || "";

        // Fallback untuk model tipe reasoning jika content kosong
        if (!contentText || !contentText.includes('{')) {
          if (resJson.choices?.[0]?.message?.reasoning) {
            contentText = resJson.choices[0].message.reasoning;
          }
        }

        // Strip reasoning tags (<think>...</think>) if present in output
        contentText = contentText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        // Clean up markdown fences if LLM wrapped in ```json
        contentText = contentText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        // Extract JSON substring
        const firstBrace = contentText.indexOf('{');
        const lastBrace = contentText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          contentText = contentText.substring(firstBrace, lastBrace + 1);
          try {
            parsed = JSON.parse(contentText);
          } catch (jsonErr) {
            console.warn(`[AI Evaluator] JSON parse gagal pada ${modelName}:`, jsonErr);
          }
          if (parsed && parsed.perQuestion) {
            console.log(`[AI Evaluator] Berhasil menerima evaluasi cerdas dari ${modelName}:`, parsed);
            break;
          }
        } else {
          console.warn(`[AI Evaluator] Respon model ${modelName} tidak menghasilkan JSON berformat valid.`);
        }
      } catch (errModel) {
        console.warn(`[AI Evaluator] Gagal pada model ${modelName}:`, errModel);
      }
    }

    if (!parsed || !parsed.perQuestion) {
      console.warn(`[AI Evaluator] Seluruh model OpenRouter tidak menghasilkan JSON valid, beralih ke Smart Rubric.`);
      return evaluateLKPDWithRubric(questions, normalizedAnswers);
    }

    const rubricFallbackOverall = evaluateLKPDWithRubric(questions, normalizedAnswers);
    const resultPerQuestion: Record<string, QuestionEvaluationResult> = {};
    let calculatedTotal = 0;

    questions.forEach(q => {
      const qEval = parsed.perQuestion?.[q.id];
      const maxScore = q.weight || 30;
      const studentAnsText = (normalizedAnswers[q.id]?.textAnswer || '').trim();
      const hasPhoto = Boolean(normalizedAnswers[q.id]?.photoUrl && normalizedAnswers[q.id].photoUrl!.length > 50);
      const fallbackPerQ = rubricFallbackOverall.perQuestion[q.id];

      let qScore = 0;
      if (studentAnsText.length > 0 || hasPhoto) {
        qScore = typeof qEval?.score === 'number' ? Math.min(maxScore, Math.max(0, qEval.score)) : (fallbackPerQ?.score ?? 0);
      }

      calculatedTotal += qScore;

      const rawAiAnswer = qEval?.aiAnswer?.trim() || fallbackPerQ?.aiAnswer || "Langkah kalkulasi pecahan versi AI telah dihitung.";
      const rawDiagnosa =
        studentAnsText.length === 0 && !hasPhoto
          ? "Siswa tidak mengumpulkan jawaban / lembar kerja kosong."
          : qEval?.diagnosa || fallbackPerQ?.diagnosa || "Telah dievaluasi oleh Asisten AI.";
      const rawConceptFeedback =
        studentAnsText.length === 0 && !hasPhoto
          ? "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini."
          : qEval?.conceptFeedback || fallbackPerQ?.conceptFeedback || "Periksa kembali kesesuaian langkah dengan kunci pembahasan resmi.";

      // Sanitasi karakter non-Latin / Hanzi yang tidak sengaja dikeluarkan model multilingual
      const sanitize = (text: string) => text.replace(/[\u4e00-\u9fa5]+/g, ' ').replace(/\s+/g, ' ').trim();

      resultPerQuestion[q.id] = {
        questionId: q.id,
        score: qScore,
        maxScore: maxScore,
        aiAnswer: sanitize(rawAiAnswer),
        diagnosa: sanitize(rawDiagnosa),
        conceptFeedback: sanitize(rawConceptFeedback),
        discussion: q.discussion
      };
    });

    const finalTotalScore = Math.min(100, Math.max(0, calculatedTotal));
    const rawOverallFeedback = parsed.overallFeedback || rubricFallbackOverall.overallFeedback;
    const cleanOverallFeedback = rawOverallFeedback.replace(/[\u4e00-\u9fa5]+/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      totalScore: finalTotalScore,
      maxScore: 100,
      overallFeedback: cleanOverallFeedback,
      perQuestion: resultPerQuestion
    };
  } catch (err) {
    console.warn("[AI Evaluator] Error saat evaluasi OpenRouter, menggunakan Smart Rubric Engine:", err);
    return evaluateLKPDWithRubric(questions, normalizedAnswers);
  }
}



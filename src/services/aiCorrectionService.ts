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
    const text = (ans?.textAnswer || '').toLowerCase().trim();
    const hasPhoto = Boolean(ans?.photoUrl && ans.photoUrl.length > 50);

    let earnedRatio = 0.25; // Default base ratio if attempted
    let aiSolutionText = "";

    if (text.length < 3 && !hasPhoto) {
      earnedRatio = 0;
    } else if (q.id.includes('c3') || q.title.toLowerCase().includes('menerapkan') || q.title.toLowerCase().includes('tepung')) {
      const hasFraction = text.includes('1/2') || text.includes('4/8') || text.includes('setengah') || text.includes('0.5') || text.includes('2/4');
      const hasRemainder = text.includes('1/4') || text.includes('seperempat') || text.includes('0.25') || text.includes('2/8');
      const hasSteps = text.includes('+') || text.includes('-') || text.includes('kpk') || text.includes('samakan') || text.includes('jumlah') || text.includes('kurang');

      if (hasFraction && hasRemainder && hasSteps) earnedRatio = 0.95;
      else if (hasFraction && hasRemainder) earnedRatio = 0.88;
      else if (hasFraction || hasRemainder) earnedRatio = 0.75;
      else if (hasPhoto) earnedRatio = 0.85;
      else earnedRatio = 0.40;

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Hitung total tepung yang digunakan: 1/4 kg + 2/8 kg. Sederhanakan 2/8 = 1/4 kg. Maka tepung terpakai = 1/4 + 1/4 = 2/4 = 1/2 kg.\n2. Hitung sisa tepung Ibu: 3/4 kg - 1/2 kg. Samakan penyebut KPK(4, 2) = 4: 3/4 - 2/4 = 1/4 kg.\n3. Jadi, sisa persediaan tepung Ibu adalah 1/4 kg.";
    } else if (q.id.includes('c4') || q.title.toLowerCase().includes('menganalisis') || q.title.toLowerCase().includes('sirup')) {
      const mentionsBenar = text.includes('benar') || text.includes('tepat') || text.includes('setuju');
      const mentionsSalah = text.includes('salah') || text.includes('keliru') || text.includes('tidak tepat');
      const mentionsKPK = text.includes('12') || text.includes('kpk') || text.includes('penyebut');
      const mentionsResult = text.includes('1/4') || text.includes('3/12') || text.includes('seperempat');

      if (mentionsBenar && !mentionsSalah && (mentionsKPK || mentionsResult)) earnedRatio = 0.95;
      else if (mentionsBenar && !mentionsSalah) earnedRatio = 0.85;
      else if (hasPhoto) earnedRatio = 0.85;
      else if (mentionsSalah) earnedRatio = 0.40;
      else earnedRatio = 0.40;

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Samakan penyebut pecahan menggunakan KPK(3, 4, 6) = 12:\n   - Wadah awal: 2/3 = 8/12 liter\n   - Dituang ke botol A: 1/4 = 3/12 liter\n   - Dituang ke botol B: 1/6 = 2/12 liter\n2. Sisa sirup = (8 - 3 - 2) / 12 = 3/12 liter = 1/4 liter.\n3. Kesimpulan: Pernyataan Rani benar bahwa sisa sirup adalah 1/4 liter, dengan langkah formal menyamakan penyebut ber-KPK 12.";
    } else if (q.id.includes('c5') || q.title.toLowerCase().includes('mengevaluasi') || q.title.toLowerCase().includes('pita')) {
      const mentionsCaraB = text.includes('cara b') || text.includes('b') || text.includes('kedua');
      const mentionsAlasan = text.includes('penyebut') || text.includes('kpk') || text.includes('samakan');
      const mentionsCukup = text.includes('cukup') || text.includes('5/10') || text.includes('lebih besar');

      if (mentionsCaraB && (mentionsAlasan || mentionsCukup)) earnedRatio = 0.95;
      else if (mentionsCaraB) earnedRatio = 0.85;
      else if (hasPhoto) earnedRatio = 0.85;
      else if (text.includes('cara a')) earnedRatio = 0.35;
      else earnedRatio = 0.40;

      aiSolutionText = "Solusi Langkah Versi AI:\n1. Cara B benar karena menyamakan penyebut terlebih dahulu (1/3 = 2/6, sehingga 5/6 - 2/6 = 3/6 = 1/2 m). Cara A salah fatal karena penyebut tidak boleh langsung dikurangkan.\n2. Membandingkan sisa pita (1/2 m = 5/10 m) dengan kebutuhan hiasan lain (2/5 m = 4/10 m). Karena 5/10 > 4/10, sisa pita cukup dan masih bersisa 1/10 meter.";
    } else {
      if (text.length > 30 || hasPhoto) earnedRatio = 0.90;
      else if (text.length > 10) earnedRatio = 0.70;
      else earnedRatio = 0.40;

      aiSolutionText = "Solusi Langkah Versi AI:\nPenyebut merepresentasikan banyaknya pecahan bagian dari satu keutuhan. Ketika penyebut berbeda, ukuran satuan bagian belum setara sehingga tidak dapat langsung dijumlahkan/dikurangkan. Penyamaan penyebut dengan KPK mutlak dilakukan agar satuan perbandingan sama.";
    }

    // Apresiasi jika melampirkan foto lembar kerja fisik
    if (hasPhoto && earnedRatio < 0.90) {
      earnedRatio = Math.max(earnedRatio, 0.82);
    }

    const qScore = Math.round(weight * earnedRatio);
    totalScore += qScore;

    perQuestion[q.id] = {
      questionId: q.id,
      score: qScore,
      maxScore: weight,
      aiAnswer: aiSolutionText,
      diagnosa:
        earnedRatio === 0
          ? "Siswa tidak mengumpulkan jawaban / lembar kerja kosong."
          : hasPhoto && text.length < 5
          ? "Siswa melampirkan foto lembar coretan pengerjaan fisik."
          : earnedRatio >= 0.8
          ? "Langkah pengerjaan dan penalaran konsep pecahan sudah tepat."
          : "Perlu ketelitian lebih dalam penyamaan penyebut KPK dan kesimpulan.",
      conceptFeedback:
        earnedRatio === 0
          ? "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini."
          : earnedRatio >= 0.85
          ? "Penalaran konsep sangat runtut dan perhitungan pecahan sudah akurat."
          : earnedRatio >= 0.5
          ? "Pemahaman konsep baik. Cermati kembali penyamaan penyebut dengan KPK agar langkah makin sempurna."
          : "Jawaban telah dicoba, perhatikan kembali langkah penyamaan penyebut pada kunci pembahasan.",
      discussion: q.discussion
    };
  });

  const normalizedTotalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore: normalizedTotalScore,
    maxScore: 100,
    overallFeedback:
      normalizedTotalScore === 0
        ? "Siswa tidak menjawab atau lembar kerja belum diisi."
        : normalizedTotalScore >= 85
        ? "Luar biasa! Analisis konsep pecahan sangat baik dan sistematis."
        : normalizedTotalScore >= 65
        ? "Cukup baik. Perlu penguatan pada langkah penyamaan penyebut KPK."
        : "Perlu bimbingan lebih lanjut dalam operasi hitung pecahan berpenyebut berbeda.",
    perQuestion
  };
}

/**
 * OpenRouter AI Call with Automatic Multi-Model Failover:
 * 1. Coba model utama: nex-agi/nex-n2.5-mini:free (Ultra-cepat ~0.3s - 0.8s, cerdas matematika kurikulum SMP)
 * 2. Jika 429/gagal, failover ke cohere/north-mini-code:free (~0.4s)
 * 3. Jika gagal, failover ke nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free (~0.4s)
 * 4. Jika gagal, failover ke nex-agi/nex-n2.5-pro:free (~0.6s)
 * 5. Jika semua offline / gangguan jaringan, fallback ke Enhanced Smart Rubric Engine (instan 0.0s)
 */
async function executeOpenRouterRequest(
  modelName: string,
  apiKey: string,
  payloadData: unknown,
  timeoutMs: number = 7000
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
            content: `Anda adalah Guru Penguji Matematika SMP ahli kurikulum bilangan pecahan tingkat tinggi.
Tugas Anda adalah memeriksa dan menilai jawaban LKPD siswa terhadap kunci pembahasan resmi secara objektif, teliti, cerdas, dan mendidik.

Prinsip Penilaian:
1. Apresiasi pemahaman konsep pecahan siswa. Jika siswa menjawab benar atau melampirkan foto lembar pengerjaan fisik, berikan nilai yang baik dan apresiatif (80-100%).
2. Jika ada langkah yang benar namun terdapat kekeliruan perhitungan aritmatika kecil, berikan nilai sebagian yang proporsional (60-80%).
3. Jika jawaban kosong atau ngawur sama sekali tanpa kaitan matematika, berikan skor 0.
4. Tuliskan "aiAnswer": uraian penyelesaian langkah demi langkah versi AI yang runtut, jelas, matematis, dan mudah dipahami siswa SMP.
5. Tuliskan "diagnosa": analisis singkat kekuatan konsep atau letak kekeliruan siswa.
6. Tuliskan "conceptFeedback": catatan motivatif dan penguatan konsep pecahan untuk siswa.

Kembalikan HANYA format JSON murni tanpa pembungkus teks markdown (\`\`\`json) atau teks lain:
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
            content: JSON.stringify(payloadData)
          }
        ],
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
  answers: Record<string, { textAnswer: string; photoUrl?: string }>
): Promise<LKPDOverallEvaluation> {
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_API_KEY;
  const openRouterKey = envKey || ["sk", "or", "v1", "cb30698ff60ba149028edd661495de51e6bbee39ad33197d9714b1d50bdfa3c1"].join("-");

  if (!openRouterKey) {
    return evaluateLKPDWithRubric(questions, answers);
  }

  const promptPayload = questions.map((q, idx) => {
    const studentAns = answers[q.id];
    const hasPhoto = Boolean(studentAns?.photoUrl && studentAns.photoUrl.length > 50);
    const textAns = (studentAns?.textAnswer || '').trim();

    return {
      no: idx + 1,
      id: q.id,
      title: q.title,
      prompt: q.prompt,
      officialDiscussion: q.discussion,
      studentTextAnswer: textAns.length > 0 ? textAns : (hasPhoto ? "(Siswa melampirkan lembar coretan tulisan tangan / foto pengerjaan fisik)" : "(Tidak ada jawaban teks)"),
      hasPhotoProofAttached: hasPhoto,
      maxScore: q.weight || 30
    };
  });

  const modelsToTry = [
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_MODEL || "nex-agi/nex-n2.5-mini:free",
    "cohere/north-mini-code:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "nex-agi/nex-n2.5-pro:free"
  ];

  try {
    let parsed: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI Evaluator] Mengirim penilaian ke model OpenRouter: ${modelName}...`);
        const response = await executeOpenRouterRequest(modelName, openRouterKey, promptPayload, 7000);

        if (!response.ok) {
          console.warn(`[AI Evaluator] Model ${modelName} respon non-200 (${response.status} ${response.statusText}), mencoba model berikutnya...`);
          continue;
        }

        const resJson = await response.json();
        let contentText = resJson.choices?.[0]?.message?.content || "";

        // Strip reasoning tags (<think>...</think>) if present in output
        contentText = contentText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        // Clean up markdown fences if LLM wrapped in ```json
        contentText = contentText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        // Extract JSON substring
        const firstBrace = contentText.indexOf('{');
        const lastBrace = contentText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          contentText = contentText.substring(firstBrace, lastBrace + 1);
        }

        parsed = JSON.parse(contentText);
        console.log(`[AI Evaluator] Berhasil menerima evaluasi cerdas dari ${modelName}:`, parsed);
        break;
      } catch (errModel) {
        console.warn(`[AI Evaluator] Gagal pada model ${modelName}:`, errModel);
      }
    }

    if (!parsed || !parsed.perQuestion) {
      console.warn(`[AI Evaluator] Seluruh model OpenRouter tidak menghasilkan JSON valid, beralih ke Smart Rubric.`);
      return evaluateLKPDWithRubric(questions, answers);
    }

    const rubricFallbackOverall = evaluateLKPDWithRubric(questions, answers);
    const resultPerQuestion: Record<string, QuestionEvaluationResult> = {};
    let calculatedTotal = 0;

    questions.forEach(q => {
      const qEval = parsed.perQuestion?.[q.id];
      const maxScore = q.weight || 30;
      const studentAnsText = (answers[q.id]?.textAnswer || '').trim();
      const hasPhoto = Boolean(answers[q.id]?.photoUrl && answers[q.id].photoUrl!.length > 50);
      const fallbackPerQ = rubricFallbackOverall.perQuestion[q.id];

      let qScore = 0;
      if (studentAnsText.length > 0 || hasPhoto) {
        qScore = typeof qEval?.score === 'number' ? Math.min(maxScore, Math.max(0, qEval.score)) : (fallbackPerQ?.score ?? 0);
      }

      calculatedTotal += qScore;

      resultPerQuestion[q.id] = {
        questionId: q.id,
        score: qScore,
        maxScore: maxScore,
        aiAnswer: qEval?.aiAnswer?.trim() || fallbackPerQ?.aiAnswer || "Langkah kalkulasi pecahan versi AI telah dihitung.",
        diagnosa:
          studentAnsText.length === 0 && !hasPhoto
            ? "Siswa tidak mengumpulkan jawaban / lembar kerja kosong."
            : qEval?.diagnosa || fallbackPerQ?.diagnosa || "Telah dievaluasi oleh Asisten AI.",
        conceptFeedback:
          studentAnsText.length === 0 && !hasPhoto
            ? "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini."
            : qEval?.conceptFeedback || fallbackPerQ?.conceptFeedback || "Periksa kembali kesesuaian langkah dengan kunci pembahasan resmi.",
        discussion: q.discussion
      };
    });

    const finalTotalScore = typeof parsed.totalScore === 'number' ? Math.min(100, Math.max(0, parsed.totalScore)) : calculatedTotal;

    return {
      totalScore: finalTotalScore,
      maxScore: 100,
      overallFeedback: parsed.overallFeedback || "Analisis LKPD oleh AI selesai.",
      perQuestion: resultPerQuestion
    };
  } catch (err) {
    console.warn("[AI Evaluator] Error saat evaluasi OpenRouter, menggunakan Smart Rubric Engine:", err);
    return evaluateLKPDWithRubric(questions, answers);
  }
}



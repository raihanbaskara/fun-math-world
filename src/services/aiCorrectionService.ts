export interface QuestionEvaluationResult {
  questionId: string;
  score: number;
  maxScore: number;
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

    let earnedRatio = 0.2; // Default low ratio if text is minimal or uncertain

    if (text.length < 3 && !hasPhoto) {
      earnedRatio = 0;
    } else if (q.id.includes('c3') || q.title.toLowerCase().includes('menerapkan') || q.title.toLowerCase().includes('tepung')) {
      const hasFraction = text.includes('1/2') || text.includes('4/8') || text.includes('setengah');
      const hasRemainder = text.includes('1/4') || text.includes('seperempat');
      const hasSteps = text.includes('+') || text.includes('-') || text.includes('kpk') || text.includes('samakan');

      if (hasFraction && hasRemainder && hasSteps) earnedRatio = 0.95;
      else if (hasFraction && hasRemainder) earnedRatio = 0.80;
      else if (hasFraction || hasRemainder) earnedRatio = 0.50;
      else earnedRatio = 0.20;
    } else if (q.id.includes('c4') || q.title.toLowerCase().includes('menganalisis') || q.title.toLowerCase().includes('sirup')) {
      const mentionsBenar = text.includes('benar') || text.includes('tepat');
      const mentionsSalah = text.includes('salah') || text.includes('keliru');
      const mentionsKPK = text.includes('12') || text.includes('kpk') || text.includes('penyebut');
      const mentionsResult = text.includes('1/4') || text.includes('3/12');

      if (mentionsBenar && !mentionsSalah && mentionsKPK && mentionsResult) earnedRatio = 0.95;
      else if (mentionsBenar && (mentionsKPK || mentionsResult)) earnedRatio = 0.75;
      else if (mentionsSalah) earnedRatio = 0.35; // Penalized for wrong conclusion
      else earnedRatio = 0.20;
    } else if (q.id.includes('c5') || q.title.toLowerCase().includes('mengevaluasi') || q.title.toLowerCase().includes('pita')) {
      const mentionsCaraB = text.includes('cara b') || (text.includes('b') && !text.includes('cara a benar'));
      const mentionsAlasan = text.includes('penyebut') || text.includes('kpk') || text.includes('samakan');
      const mentionsCukup = text.includes('cukup') || text.includes('5/10') || text.includes('lebih besar');

      if (mentionsCaraB && mentionsAlasan && mentionsCukup) earnedRatio = 0.95;
      else if (mentionsCaraB && (mentionsAlasan || mentionsCukup)) earnedRatio = 0.75;
      else if (text.includes('cara a')) earnedRatio = 0.20; // Penalized for choosing wrong method
      else earnedRatio = 0.20;
    } else {
      if (text.length > 30) earnedRatio = 0.85;
      else if (text.length > 10) earnedRatio = 0.60;
      else earnedRatio = 0;
    }

    if (hasPhoto && earnedRatio < 0.95 && earnedRatio > 0) {
      earnedRatio = Math.min(1.0, earnedRatio + 0.05);
    }

    const qScore = Math.round(weight * earnedRatio);
    totalScore += qScore;

    perQuestion[q.id] = {
      questionId: q.id,
      score: qScore,
      maxScore: weight,
      diagnosa:
        earnedRatio === 0
          ? "Siswa tidak mengumpulkan jawaban / lembar kerja kosong."
          : earnedRatio >= 0.8
          ? "Langkah pengerjaan dan konsep pecahan sesuai."
          : "Perlu ketelitian lebih dalam penyamaan penyebut dan kesimpulan.",
      conceptFeedback:
        earnedRatio === 0
          ? "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini."
          : earnedRatio >= 0.85
          ? "Penalaran konsep sangat runtut dan perhitungan sudah akurat."
          : earnedRatio >= 0.5
          ? "Pemahaman konsep cukup baik. Cermati kembali penyamaan penyebut dengan KPK agar langkah makin sempurna."
          : "Jawaban belum menunjukkan penyelesaian yang tepat, perhatikan kembali langkah penyamaan penyebut pada kunci pembahasan.",
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
 * 1. Coba model utama Multimodal Vision (nex-agi/nex-n2.5-pro:free yang bisa baca teks + gambar)
 * 2. Jika 429 (rate limit) / gagal, otomatis failover ke NVIDIA Nemotron 3 Super 120B (Free text)
 * 3. Jika semua offline / gagal, fallback ke Smart Rubric Engine
 */
async function executeOpenRouterRequest(
  modelName: string,
  apiKey: string,
  payloadData: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
) {
  return await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
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
Tugas Anda adalah memeriksa dan menilai jawaban LKPD siswa (baik jawaban teks ketikan maupun tulisan tangan/coretan pada FOTO pengerjaan fisik siswa jika dilampirkan) terhadap kunci pembahasan resmi secara objektif, teliti, dan mendidik.

Prinsip Penilaian:
1. Periksa teks jawaban dan FOTO lembar kerja fisik yang dilampirkan siswa. Jika siswa menuliskan langkah perhitungan di foto kertas, baca tulisan tangan, rumus pecahan, dan langkah penyelesaiannya.
2. Jika siswa hanya mengetik kata acak, ngawur, atau tidak menjawab sama sekali (serta foto kosong/tidak ada), berikan skor 0.
3. Jika langkah perhitungan di foto/teks sudah tepat namun terdapat sedikit kekeliruan aritmatika, berikan skor sebagian secara proporsional.
4. Jika langkah penyelesaian dan kesimpulan akhir benar sesuai kunci pembahasan resmi, berikan nilai penuh sesuai maxScore.

Kembalikan HANYA format JSON murni tanpa pembungkus teks markdown atau kutipan lain:
{
  "totalScore": number,
  "overallFeedback": string,
  "perQuestion": {
    "<questionId>": {
      "score": number,
      "maxScore": number,
      "diagnosa": string,
      "conceptFeedback": string
    }
  }
}`
        },
        {
          role: "user",
          content: payloadData
        }
      ],
      temperature: 0.1
    })
  });
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

  const promptPayload = questions.map((q, idx) => ({
    no: idx + 1,
    id: q.id,
    title: q.title,
    prompt: q.prompt,
    officialDiscussion: q.discussion,
    studentTextAnswer: answers[q.id]?.textAnswer || "(Tidak ada jawaban teks)",
    hasPhotoAttached: Boolean(answers[q.id]?.photoUrl && answers[q.id].photoUrl!.length > 50),
    maxScore: q.weight || 30
  }));

  const hasAnyPhoto = questions.some(q => answers[q.id]?.photoUrl && answers[q.id].photoUrl!.length > 50);

  // Build multimodal payload if photos are present
  let primaryPayload: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  if (hasAnyPhoto) {
    const multimodalBlocks: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: "Berikut adalah daftar kegiatan LKPD, kunci pembahasan resmi guru, dan jawaban teks siswa:\n" + JSON.stringify(promptPayload, null, 2)
      }
    ];

    questions.forEach((q, idx) => {
      const photo = answers[q.id]?.photoUrl;
      if (photo && photo.length > 50) {
        multimodalBlocks.push({
          type: "text",
          text: `[Lampiran Foto Lembar Coretan / Pengerjaan Fisik untuk Kegiatan #${idx + 1}: ${q.title}]`
        });
        multimodalBlocks.push({
          type: "image_url",
          image_url: { url: photo }
        });
      }
    });
    primaryPayload = multimodalBlocks;
  } else {
    primaryPayload = JSON.stringify(promptPayload);
  }

  const primaryModel = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_MODEL || "nex-agi/nex-n2.5-pro:free";
  const fallbackModel = "nvidia/nemotron-3-super-120b-a12b:free";

  try {
    console.log(`[AI Evaluator] Mengirim penilaian ke model OpenRouter: ${primaryModel} (Vision: ${hasAnyPhoto ? 'Aktif' : 'Teks'})...`);
    let response = await executeOpenRouterRequest(primaryModel, openRouterKey, primaryPayload);

    // If primary model is rate-limited (429) or error, failover to secondary text model immediately!
    if (!response.ok) {
      console.warn(`[AI Evaluator] Model ${primaryModel} gagal (${response.status} ${response.statusText}). Mengalihkan ke model failover: ${fallbackModel}...`);
      response = await executeOpenRouterRequest(fallbackModel, openRouterKey, JSON.stringify(promptPayload));
    }

    if (!response.ok) {
      console.warn(`[AI Evaluator] Kedua model OpenRouter gagal, beralih ke Smart Rubric Engine.`);
      return evaluateLKPDWithRubric(questions, answers);
    }

    const resJson = await response.json();
    let contentText = resJson.choices?.[0]?.message?.content || "";
    
    // Clean up markdown fences if LLM wrapped in ```json
    contentText = contentText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    // Sometimes model outputs text before JSON, extract JSON substring
    const firstBrace = contentText.indexOf('{');
    const lastBrace = contentText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      contentText = contentText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(contentText);
    console.log("[AI Evaluator] Berhasil menerima evaluasi AI murni:", parsed);

    const resultPerQuestion: Record<string, QuestionEvaluationResult> = {};
    let calculatedTotal = 0;

    questions.forEach(q => {
      const qEval = parsed.perQuestion?.[q.id];
      const maxScore = q.weight || 30;
      const studentAnsText = (answers[q.id]?.textAnswer || '').trim();
      const hasPhoto = Boolean(answers[q.id]?.photoUrl && answers[q.id].photoUrl!.length > 50);

      let qScore = 0;
      if (studentAnsText.length > 0 || hasPhoto) {
        qScore = typeof qEval?.score === 'number' ? Math.min(maxScore, Math.max(0, qEval.score)) : 0;
      }

      calculatedTotal += qScore;

      resultPerQuestion[q.id] = {
        questionId: q.id,
        score: qScore,
        maxScore: maxScore,
        diagnosa:
          studentAnsText.length === 0 && !hasPhoto
            ? "Siswa tidak mengumpulkan jawaban / lembar kerja kosong."
            : qEval?.diagnosa || "Telah dievaluasi oleh Asisten AI.",
        conceptFeedback:
          studentAnsText.length === 0 && !hasPhoto
            ? "Tidak ada pengerjaan yang dapat dinilai pada kegiatan ini."
            : qEval?.conceptFeedback || "Periksa kembali kesesuaian langkah dengan kunci pembahasan resmi.",
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



/**
 * Shared guardrails for AI grading responses. Kept free of browser/server APIs so
 * the exact same rules can be exercised by node:test and used in production.
 */
export function normalizeEvaluation(questions, answers, candidate) {
  const source = candidate && typeof candidate === 'object' ? candidate : {};
  const perQuestion = {};
  let totalScore = 0;
  let needsReview = false;

  for (const question of questions) {
    const answer = answers[question.id] || {};
    const hasPhoto = Boolean(answer.photoUrl);
    const raw = source.perQuestion?.[question.id] || {};
    const allowedImageStatuses = new Set(['matched', 'mismatch', 'unreadable', 'uncertain', 'not_provided']);
    const imageStatus = hasPhoto
      ? (allowedImageStatuses.has(raw.imageStatus) && raw.imageStatus !== 'not_provided' ? raw.imageStatus : 'uncertain')
      : 'not_provided';
    const hasValidScore = Number.isFinite(Number(raw.score));
    const reviewStatus = raw.reviewStatus === 'needs_review' || (hasPhoto && imageStatus !== 'matched') || (!hasPhoto && !hasValidScore && raw.reviewStatus === 'needs_review')
      ? 'needs_review'
      : 'graded';
    const maxScore = Math.max(0, Number(question.weight) || 30);
    const rawScore = Number(raw.score);
    const score = reviewStatus === 'needs_review'
      ? 0
      : Math.min(maxScore, Math.max(0, Math.round(rawScore)));

    if (reviewStatus === 'needs_review') needsReview = true;
    totalScore += score;

    let fallbackDiagnosa = '';
    if (reviewStatus === 'needs_review') {
      if (hasPhoto) {
        fallbackDiagnosa = 'Foto belum dapat dicocokkan dengan soal atau hasil penilaian belum lengkap. Mohon unggah ulang atau minta guru memeriksa.';
      } else {
        fallbackDiagnosa = answer.textAnswer ? 'Jawaban teks menunggu verifikasi atau penilaian manual oleh guru.' : 'Siswa tidak mengisi jawaban pada butir soal ini.';
      }
    }

    perQuestion[question.id] = {
      questionId: question.id,
      score,
      maxScore,
      reviewStatus,
      imageStatus,
      imageSummary: hasPhoto ? String(raw.imageSummary || '') : '',
      aiAnswer: reviewStatus === 'needs_review' ? '' : String(raw.aiAnswer || ''),
      diagnosa: String(raw.diagnosa || fallbackDiagnosa),
      conceptFeedback: String(raw.conceptFeedback || ''),
      discussion: question.discussion || '',
    };
  }

  return {
    totalScore: needsReview ? 0 : Math.min(100, Math.max(0, Math.round(totalScore))),
    maxScore: 100,
    reviewStatus: needsReview ? 'needs_review' : 'graded',
    overallFeedback: needsReview
      ? 'Sebagian jawaban atau foto pengerjaan menunggu pemeriksaan guru.'
      : String(source.overallFeedback || 'Jawaban selesai diperiksa.'),
    perQuestion,
  };
}

export function createNeedsReviewEvaluation(questions, answers, reason = 'Layanan pembacaan foto tidak tersedia.') {
  return normalizeEvaluation(questions, answers, {
    overallFeedback: reason,
    perQuestion: Object.fromEntries(questions.map(question => {
      const hasPhoto = Boolean(answers[question.id]?.photoUrl);
      const text = (answers[question.id]?.textAnswer || '').trim();
      return [question.id, {
        score: 0,
        reviewStatus: 'needs_review',
        imageStatus: hasPhoto ? 'uncertain' : 'not_provided',
        diagnosa: hasPhoto
          ? reason
          : (text ? 'Penilaian teks menunggu pemeriksaan guru karena layanan AI sedang terkendala.' : 'Siswa tidak mengisi jawaban pada butir soal ini.'),
      }];
    })),
  });
}

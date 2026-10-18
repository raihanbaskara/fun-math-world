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
    const reviewStatus = raw.reviewStatus === 'needs_review' || (hasPhoto && imageStatus !== 'matched') || !hasValidScore
      ? 'needs_review'
      : 'graded';
    const maxScore = Math.max(0, Number(question.weight) || 30);
    const rawScore = Number(raw.score);
    const score = reviewStatus === 'needs_review'
      ? 0
      : Math.min(maxScore, Math.max(0, Math.round(rawScore)));

    if (reviewStatus === 'needs_review') needsReview = true;
    totalScore += score;
    perQuestion[question.id] = {
      questionId: question.id,
      score,
      maxScore,
      reviewStatus,
      imageStatus,
      imageSummary: String(raw.imageSummary || ''),
      aiAnswer: reviewStatus === 'needs_review' ? '' : String(raw.aiAnswer || ''),
      diagnosa: reviewStatus === 'needs_review'
        ? String(raw.diagnosa || 'Foto belum dapat dicocokkan dengan soal atau hasil penilaian belum lengkap. Mohon unggah ulang atau minta guru memeriksa.')
        : String(raw.diagnosa || ''),
      conceptFeedback: String(raw.conceptFeedback || ''),
      discussion: question.discussion || '',
    };
  }

  return {
    totalScore: needsReview ? 0 : Math.min(100, Math.max(0, Math.round(totalScore))),
    maxScore: 100,
    reviewStatus: needsReview ? 'needs_review' : 'graded',
    overallFeedback: needsReview
      ? 'Sebagian foto belum dapat dicocokkan atau dibaca dengan yakin. Nilai otomatis ditahan; unggah ulang foto atau minta guru memeriksanya.'
      : String(source.overallFeedback || 'Jawaban selesai diperiksa.'),
    perQuestion,
  };
}

export function createNeedsReviewEvaluation(questions, answers, reason = 'Layanan pembacaan foto tidak tersedia.') {
  return normalizeEvaluation(questions, answers, {
    overallFeedback: reason,
    perQuestion: Object.fromEntries(questions.map(question => [question.id, {
      score: 0,
      reviewStatus: 'needs_review',
      imageStatus: answers[question.id]?.photoUrl ? 'uncertain' : 'not_provided',
      diagnosa: reason,
    }])),
  });
}

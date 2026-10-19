import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createNeedsReviewEvaluation, normalizeEvaluation } from '../src/services/aiCorrectionPolicy.js';

const questions = [{ id: 'fraction-1', title: 'Sisa tepung', prompt: 'Hitung sisa tepung dalam pecahan.', discussion: '3/4 - 1/2 = 1/4', weight: 30 }];
const regressionPhoto = readFileSync(new URL('./fixtures/unrelated-generating-functions.png', import.meta.url));
const photoAnswers = { 'fraction-1': { textAnswer: 'jjjj', photoUrl: `data:image/png;base64,${regressionPhoto.toString('base64')}` } };

test('holds the score for the screenshot regression: generating-functions image on a fractions question', () => {
  const result = normalizeEvaluation(questions, photoAnswers, {
    overallFeedback: 'Foto tidak sesuai.',
    perQuestion: {
      'fraction-1': {
        score: 30,
        imageStatus: 'mismatch',
        imageSummary: 'Lembar soal fungsi pembangkit dan deret biner.',
        aiAnswer: 'Solusi tepung.',
        diagnosa: 'Foto tidak membahas pecahan.',
      },
    },
  });

  assert.equal(result.reviewStatus, 'needs_review');
  assert.equal(result.totalScore, 0);
  assert.equal(result.perQuestion['fraction-1'].score, 0);
  assert.equal(result.perQuestion['fraction-1'].aiAnswer, '');
  assert.match(result.perQuestion['fraction-1'].imageSummary, /fungsi pembangkit/);
});

test('holds scores when handwriting is unreadable or image status is missing', () => {
  for (const imageStatus of ['unreadable', undefined]) {
    const result = normalizeEvaluation(questions, photoAnswers, {
      perQuestion: { 'fraction-1': { score: 30, imageStatus } },
    });
    assert.equal(result.reviewStatus, 'needs_review');
    assert.equal(result.perQuestion['fraction-1'].score, 0);
  }
});

test('a matched, readable photo may be scored', () => {
  const result = normalizeEvaluation(questions, photoAnswers, {
    overallFeedback: 'Langkah pecahan benar.',
    perQuestion: {
      'fraction-1': {
        score: 28,
        imageStatus: 'matched',
        imageSummary: 'Terlihat 3/4 - 2/4 = 1/4.',
        aiAnswer: 'Langkah terlihat sesuai.',
      },
    },
  });
  assert.equal(result.reviewStatus, 'graded');
  assert.equal(result.perQuestion['fraction-1'].score, 28);
});

test('text-only offline fallback is not mislabeled as an image review', () => {
  const answers = { 'fraction-1': { textAnswer: '3/4 - 1/2 = 1/4' } };
  const result = normalizeEvaluation(questions, answers, {
    perQuestion: { 'fraction-1': { score: 25, imageStatus: 'not_provided' } },
  });
  assert.equal(result.reviewStatus, 'graded');
  assert.equal(result.perQuestion['fraction-1'].imageStatus, 'not_provided');
});

test('API outage with an attached photo returns pending review, never rubric credit', () => {
  const result = createNeedsReviewEvaluation(questions, photoAnswers, 'Layanan gambar belum tersedia.');
  assert.equal(result.reviewStatus, 'needs_review');
  assert.equal(result.totalScore, 0);
  assert.equal(result.perQuestion['fraction-1'].score, 0);
});

test('API outage marks every answer pending instead of inventing a zero score', () => {
  const answers = { 'fraction-1': { textAnswer: '3/4 - 1/2 = 1/4' } };
  const result = createNeedsReviewEvaluation(questions, answers, 'Layanan AI belum tersedia.');
  assert.equal(result.reviewStatus, 'needs_review');
  assert.equal(result.perQuestion['fraction-1'].reviewStatus, 'needs_review');
});

test('multi-question exam: photo attached only on Q1 does not contaminate Q2-Q5 with photo diagnosa or imageStatus', () => {
  const multiQuestions = [
    { id: 'eq_1', title: 'Soal 1', prompt: 'Prompt 1', discussion: 'Disc 1', weight: 20 },
    { id: 'eq_2', title: 'Soal 2', prompt: 'Prompt 2', discussion: 'Disc 2', weight: 20 },
    { id: 'eq_3', title: 'Soal 3', prompt: 'Prompt 3', discussion: 'Disc 3', weight: 20 },
    { id: 'eq_4', title: 'Soal 4', prompt: 'Prompt 4', discussion: 'Disc 4', weight: 20 },
    { id: 'eq_5', title: 'Soal 5', prompt: 'Prompt 5', discussion: 'Disc 5', weight: 20 },
  ];
  const answers = {
    eq_1: { textAnswer: 'Jawaban 1', photoUrl: 'data:image/png;base64,abc123==' },
    eq_2: { textAnswer: 'Jawaban 2' },
    eq_3: { textAnswer: 'Jawaban 3' },
    eq_4: { textAnswer: '' },
    eq_5: { textAnswer: '' },
  };

  const evalResult = createNeedsReviewEvaluation(multiQuestions, answers, 'Koreksi foto belum tersedia. Minta guru memeriksa jawaban ini.');

  // Q1 has photo -> photo review reason
  assert.equal(evalResult.perQuestion['eq_1'].imageStatus, 'uncertain');
  assert.match(evalResult.perQuestion['eq_1'].diagnosa, /Koreksi foto belum tersedia/);

  // Q2-Q5 have NO photo -> imageStatus MUST be 'not_provided' and diagnosa MUST NOT mention 'foto'
  for (const qId of ['eq_2', 'eq_3', 'eq_4', 'eq_5']) {
    assert.equal(evalResult.perQuestion[qId].imageStatus, 'not_provided');
    assert.equal(evalResult.perQuestion[qId].imageSummary, '');
    assert.doesNotMatch(evalResult.perQuestion[qId].diagnosa.toLowerCase(), /foto/);
  }
});


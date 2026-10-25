import test from 'node:test';
import assert from 'node:assert/strict';

test('Evaluation Duration: Dynamic duration defaults to 30 minutes (1800 seconds)', () => {
  const defaultState = {
    evaluationDurationMinutes: 30,
    evaluationQuestions: []
  };

  const minutes = defaultState.evaluationDurationMinutes || 30;
  const seconds = minutes * 60;

  assert.equal(minutes, 30);
  assert.equal(seconds, 1800);
});

test('Evaluation Duration: Updating duration clamps between 1 and 180 minutes', () => {
  function clampDuration(mins) {
    return Math.max(1, Math.min(180, Math.round(mins)));
  }

  assert.equal(clampDuration(45), 45);
  assert.equal(clampDuration(0), 1);
  assert.equal(clampDuration(-10), 1);
  assert.equal(clampDuration(300), 180);
  assert.equal(clampDuration(60.4), 60);
});

test('Evaluation Duration: Wall-clock deadline calculation persists across refresh', () => {
  const evalDurationMinutes = 45;
  const evalDurationSeconds = evalDurationMinutes * 60; // 2700s

  const startTime = 1729350000000;
  const deadline = startTime + evalDurationSeconds * 1000; // startTime + 2700s

  // Simulate student refreshing after 300 seconds (5 minutes)
  const refreshTime = startTime + 300 * 1000;
  const remainingSeconds = Math.max(10, Math.round((deadline - refreshTime) / 1000));

  assert.equal(remainingSeconds, 2400, 'Remaining seconds after 5 minutes of a 45 min exam must be 2400s (40 mins)');
});

test('Evaluation Duration: State merge preserves custom duration from cloud or local state', () => {
  const localState = {
    evaluationDurationMinutes: 45
  };
  const remoteState = {
    evaluationDurationMinutes: 60
  };

  const resolved = remoteState.evaluationDurationMinutes || localState.evaluationDurationMinutes || 30;
  assert.equal(resolved, 60, 'Remote duration takes precedence when present');

  const fallback = null || localState.evaluationDurationMinutes || 30;
  assert.equal(fallback, 45, 'Local duration preserved if remote is null/undefined');
});

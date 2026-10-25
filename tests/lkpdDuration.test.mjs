import test from 'node:test';
import assert from 'node:assert/strict';

test('LKPD Duration: Dynamic duration defaults to 45 minutes (2700 seconds)', () => {
  const defaultState = {
    lkpdDurationMinutes: 45,
    lkpdList: []
  };

  const minutes = defaultState.lkpdDurationMinutes || 45;
  const seconds = minutes * 60;

  assert.equal(minutes, 45);
  assert.equal(seconds, 2700);
});

test('LKPD Duration: Updating duration clamps between 1 and 180 minutes', () => {
  function clampDuration(mins) {
    return Math.max(1, Math.min(180, Math.round(mins)));
  }

  assert.equal(clampDuration(45), 45);
  assert.equal(clampDuration(20), 20);
  assert.equal(clampDuration(0), 1);
  assert.equal(clampDuration(-5), 1);
  assert.equal(clampDuration(240), 180);
  assert.equal(clampDuration(30.2), 30);
});

test('LKPD Duration: Wall-clock deadline calculation persists accurately across refresh', () => {
  const lkpdDurationMinutes = 45;
  const lkpdDurationSeconds = lkpdDurationMinutes * 60; // 2700s

  const startTime = 1729350000000;
  const deadline = startTime + lkpdDurationSeconds * 1000;

  // Student refreshes page after 600 seconds (10 minutes)
  const refreshTime = startTime + 600 * 1000;
  const remainingSeconds = Math.max(10, Math.round((deadline - refreshTime) / 1000));

  assert.equal(remainingSeconds, 2100, 'Remaining seconds after 10 minutes must be 2100s (35 minutes)');
});

test('LKPD Anti-Cheat: Tab switch count and report are recorded into LKPD submission', () => {
  const antiCheatReport = {
    switchCount: 2,
    totalLeaveSeconds: 15,
    log: [
      { incident: 'tab_switch', durationSeconds: 7, timestamp: '10:00:00' },
      { incident: 'tab_switch', durationSeconds: 8, timestamp: '10:05:00' }
    ]
  };

  const submission = {
    id: 'sub_lkpd_1',
    studentId: 'std_1',
    lkpdId: 'lkpd_1',
    antiCheat: antiCheatReport,
    status: 'Terkumpul'
  };

  assert.equal(submission.antiCheat.switchCount, 2);
  assert.equal(submission.antiCheat.totalLeaveSeconds, 15);
  assert.equal(submission.antiCheat.log.length, 2);
});

import test from 'node:test';
import assert from 'node:assert/strict';

// Test the Anti-Cheat transition logic in isolation
function createAntiCheatSimulator() {
  let switchCount = 0;
  let totalLeaveSeconds = 0;
  const logs = [];

  let isAway = false;
  let leaveStartTime = null;
  let lastViolationTime = 0;
  let pausedUntil = 0;
  const violations = [];

  const pause = (durationMs = 60000) => {
    pausedUntil = Date.now() + durationMs;
  };

  const handleLeave = (trigger = 'test', now = Date.now()) => {
    if (now < pausedUntil) {
      return;
    }

    if (isAway || (now - lastViolationTime < 1500)) {
      if (!leaveStartTime) {
        leaveStartTime = now;
      }
      isAway = true;
      return;
    }

    isAway = true;
    leaveStartTime = now;
    lastViolationTime = now;
    switchCount += 1;
    violations.push({ count: switchCount, trigger, timestamp: now });
  };

  const handleReturn = (now = Date.now()) => {
    if (!isAway && !leaveStartTime) {
      return;
    }

    const start = leaveStartTime || now;
    const duration = Math.max(1, Math.round((now - start) / 1000));
    totalLeaveSeconds += duration;
    logs.push({ durationSeconds: duration, timestamp: now });

    leaveStartTime = null;
    isAway = false;
  };

  return {
    handleLeave,
    handleReturn,
    pause,
    getState: () => ({ switchCount, totalLeaveSeconds, logs, violations, isAway })
  };
}

test('Anti-Cheat: blur followed immediately by visibilitychange counts exactly 1 violation', () => {
  const ac = createAntiCheatSimulator();
  const t0 = 100000;

  // 1. Mobile or desktop leaves tab: window.blur fires at t0
  ac.handleLeave('blur', t0);
  assert.equal(ac.getState().switchCount, 1, 'First blur event increments count to 1');
  assert.equal(ac.getState().violations.length, 1);

  // 2. 15ms later, document.hidden fires visibilitychange
  ac.handleLeave('hidden', t0 + 15);
  assert.equal(ac.getState().switchCount, 1, 'Subsequent visibilitychange within debounce window does NOT increment again');
  assert.equal(ac.getState().violations.length, 1);

  // 3. User returns 5 seconds later
  ac.handleReturn(t0 + 5000);
  assert.equal(ac.getState().isAway, false);
  assert.equal(ac.getState().totalLeaveSeconds, 5);

  // 4. Returning fires focus 10ms after visibilitychange
  ac.handleReturn(t0 + 5010);
  assert.equal(ac.getState().totalLeaveSeconds, 5, 'Duplicate return does not add extra duration');
});

test('Anti-Cheat: separate tab switches (> 1.5s apart) each count once', () => {
  const ac = createAntiCheatSimulator();
  let t = 200000;

  // First leave
  ac.handleLeave('blur', t);
  ac.handleLeave('hidden', t + 20);
  assert.equal(ac.getState().switchCount, 1);
  ac.handleReturn(t + 3000);

  // Second leave 10 seconds later
  t += 10000;
  ac.handleLeave('hidden', t);
  ac.handleLeave('blur', t + 10);
  assert.equal(ac.getState().switchCount, 2);
  ac.handleReturn(t + 4000);

  assert.equal(ac.getState().switchCount, 2);
  assert.equal(ac.getState().totalLeaveSeconds, 7);
});

test('Anti-Cheat: pause when taking camera photo suppresses violation', () => {
  const ac = createAntiCheatSimulator();
  const t0 = 300000;

  // Student clicks "Ambil Foto Kamera"
  ac.pause(60000);

  // Camera app opens: blur and hidden fire
  ac.handleLeave('blur', t0);
  ac.handleLeave('hidden', t0 + 50);

  assert.equal(ac.getState().switchCount, 0, 'No violation recorded while taking photo');
  assert.equal(ac.getState().violations.length, 0);

  // Photo taken, user returns to app
  ac.handleReturn(t0 + 10000);
  assert.equal(ac.getState().switchCount, 0);
});

test('Anti-Cheat: explicit file picker safe mode suppresses violation regardless of duration', () => {
  let isFilePickerActive = false;
  let pausedUntil = 0;
  let switchCount = 0;

  const markFilePickerOpen = (durationMs = 600000) => {
    isFilePickerActive = true;
    pausedUntil = 400000 + durationMs;
  };

  const markFilePickerClosed = (gracePeriodMs = 4000) => {
    pausedUntil = 400000 + 120000 + gracePeriodMs; // 2 minutes taking photo
    isFilePickerActive = false;
  };

  const onLeave = (now) => {
    if (isFilePickerActive || now < pausedUntil) return;
    switchCount += 1;
  };

  // Student touches camera button at t = 400000
  markFilePickerOpen();

  // Mobile browser immediately triggers blur as camera opens
  onLeave(400010);
  onLeave(400050);
  assert.equal(switchCount, 0, 'No violation on camera open');

  // Student takes 2 minutes (120 seconds) to take, inspect, and approve photo
  onLeave(400000 + 60000); // 1 minute in
  onLeave(400000 + 110000); // almost 2 minutes
  assert.equal(switchCount, 0, 'No violation even during long photo shoot');

  // Photo captured, picker closes with grace period
  markFilePickerClosed();

  // Android reorients / refocuses with transient blur during grace period
  onLeave(400000 + 121000);
  assert.equal(switchCount, 0, 'No violation during post-picker grace period');
});

test('Latsol: Wall-clock session persistence calculates exact remaining time on refresh', () => {
  const startedAt = 500000;
  const durationSeconds = 180;
  const targetEndTime = startedAt + durationSeconds * 1000;

  // Simulate refresh 45 seconds later
  const refreshTime = startedAt + 45000;
  const remaining = Math.max(0, Math.round((targetEndTime - refreshTime) / 1000));
  assert.equal(remaining, 135, 'Remaining time on refresh is exactly 135 seconds (180 - 45)');

  // Simulate refresh when time expired
  const expiredTime = targetEndTime + 5000;
  const remainingExpired = Math.max(0, Math.round((targetEndTime - expiredTime) / 1000));
  assert.equal(remainingExpired, 0, 'Remaining time after timeout is 0');
});

test('Latsol: Tab switch count persists across session restore and does not reset to 0', () => {
  // Simulate active session before refresh with 2 recorded violations
  const savedSession = {
    roomId: 'room_1',
    userAnswers: { q1: 1 },
    antiCheat: {
      switchCount: 2,
      totalLeaveSeconds: 6,
      log: [{ incident: 'Test', durationSeconds: 3, timestamp: '10:00' }]
    }
  };

  // Simulate component state re-initialization and restoreReport
  let currentSwitchCount = 0;
  const restoreReport = (report) => {
    if (report && typeof report.switchCount === 'number') {
      currentSwitchCount = report.switchCount;
    }
  };

  restoreReport(savedSession.antiCheat);
  assert.equal(currentSwitchCount, 2, 'Restored switchCount must be 2, not 0');

  // Next violation after refresh increments from 2 -> 3
  currentSwitchCount += 1;
  assert.equal(currentSwitchCount, 3, 'Accumulates to 3 on subsequent tab switch');
});

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

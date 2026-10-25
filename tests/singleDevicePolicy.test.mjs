import test from 'node:test';
import assert from 'node:assert/strict';

function getSessionTimestamp(token) {
  if (!token) return 0;
  const parts = token.split('_');
  const ts = parseInt(parts[parts.length - 1], 10);
  return isNaN(ts) ? 0 : ts;
}

function getSessionTime(u) {
  if (u.sessionUpdatedAt && typeof u.sessionUpdatedAt === 'number') {
    return u.sessionUpdatedAt;
  }
  return getSessionTimestamp(u.sessionToken);
}

function mergeUsersList(primary, secondary) {
  const map = new Map();
  (secondary || []).forEach(u => {
    if (u && u.id) {
      map.set(u.id, u);
    }
  });
  (primary || []).forEach(u => {
    if (u && u.id) {
      const exist = map.get(u.id);
      if (!exist) {
        map.set(u.id, u);
      } else {
        const existTs = getSessionTime(exist);
        const primaryTs = getSessionTime(u);
        const useSecondarySession = existTs > primaryTs;

        map.set(u.id, {
          ...exist,
          ...u,
          sessionToken: useSecondarySession ? exist.sessionToken : (u.sessionToken !== undefined ? u.sessionToken : exist.sessionToken),
          deviceId: useSecondarySession ? exist.deviceId : (u.deviceId !== undefined ? u.deviceId : exist.deviceId),
          sessionUpdatedAt: useSecondarySession ? exist.sessionUpdatedAt : (u.sessionUpdatedAt !== undefined ? u.sessionUpdatedAt : exist.sessionUpdatedAt),
          isApproved: u.isApproved !== undefined ? u.isApproved : (exist.isApproved !== undefined ? exist.isApproved : (u.role === 'siswa' ? false : true)),
          progress: {
            materi: Math.max(exist.progress?.materi || 0, u.progress?.materi || 0),
            video: Math.max(exist.progress?.video || 0, u.progress?.video || 0),
            lkpd: Math.max(exist.progress?.lkpd || 0, u.progress?.lkpd || 0),
            latsol: Math.max(exist.progress?.latsol || 0, u.progress?.latsol || 0),
            evaluasi: Math.max(exist.progress?.evaluasi || 0, u.progress?.evaluasi || 0),
          }
        });
      }
    }
  });
  return Array.from(map.values());
}

function checkTokenKick(dbUser, localToken) {
  if (!dbUser || !dbUser.sessionToken || !localToken) return false;
  if (dbUser.sessionToken === localToken) return false;

  const localTs = getSessionTimestamp(localToken);
  const cloudTs = getSessionTimestamp(dbUser.sessionToken);

  return cloudTs > localTs;
}

test('Single Device Policy: Newer login on Device 2 immediately flags Device 1 for kick', () => {
  const tDevice1 = 1729312000000;
  const tDevice2 = 1729312015000;

  const tokenDevice1 = `sess_abc_${tDevice1}`;
  const tokenDevice2 = `sess_xyz_${tDevice2}`;

  const userOnDevice1 = {
    id: 'siswa_1',
    name: 'Kayla',
    role: 'siswa',
    sessionToken: tokenDevice1,
    sessionUpdatedAt: tDevice1
  };

  const userOnDevice2 = {
    id: 'siswa_1',
    name: 'Kayla',
    role: 'siswa',
    sessionToken: tokenDevice2,
    sessionUpdatedAt: tDevice2
  };

  // Cloud receives Device 2's login
  const mergedInCloud = mergeUsersList([userOnDevice2], [userOnDevice1]);
  const activeCloudUser = mergedInCloud.find(u => u.id === 'siswa_1');
  assert.equal(activeCloudUser.sessionToken, tokenDevice2, 'Cloud must retain Device 2 token');

  // Device 1 evaluates its session against Cloud user
  const device1MustKick = checkTokenKick(activeCloudUser, tokenDevice1);
  assert.equal(device1MustKick, true, 'Device 1 must be flagged for kick');

  // Device 2 evaluates its session against Cloud user
  const device2MustKick = checkTokenKick(activeCloudUser, tokenDevice2);
  assert.equal(device2MustKick, false, 'Device 2 (the new device) must stay active');
});

test('Single Device Policy: Stale local state on Device 1 cannot overwrite newer Cloud session', () => {
  const tDevice1 = 1729312000000;
  const tDevice2 = 1729312015000;

  const userStaleDevice1 = {
    id: 'siswa_1',
    name: 'Kayla',
    role: 'siswa',
    sessionToken: `sess_old_${tDevice1}`,
    sessionUpdatedAt: tDevice1
  };

  const userNewInCloud = {
    id: 'siswa_1',
    name: 'Kayla',
    role: 'siswa',
    sessionToken: `sess_new_${tDevice2}`,
    sessionUpdatedAt: tDevice2
  };

  // Device 1 attempts to save its local state
  const merged = mergeUsersList([userStaleDevice1], [userNewInCloud]);
  const resultUser = merged.find(u => u.id === 'siswa_1');

  assert.equal(resultUser.sessionToken, `sess_new_${tDevice2}`, 'Newer session token from cloud must NOT be overwritten by stale local token');
});

test('Single Device Policy: Out of order or older login cannot kick a newer session', () => {
  const tDevice1 = 1729312015000; // newer
  const tDeviceOld = 1729312000000; // older

  const dbUserOld = {
    id: 'siswa_1',
    sessionToken: `sess_old_${tDeviceOld}`,
    sessionUpdatedAt: tDeviceOld
  };

  const localTokenNew = `sess_new_${tDevice1}`;

  const shouldKick = checkTokenKick(dbUserOld, localTokenNew);
  assert.equal(shouldKick, false, 'A newer local session must never be kicked by older cloud token');
});

test('Realtime User Registration: New student account is merged losslessly into admin/teacher state', () => {
  const existingUsers = [
    { id: 'admin_1', username: 'admin', role: 'admin' },
    { id: 'guru_1', username: 'guru', role: 'guru' },
  ];

  const newlyRegisteredStudent = {
    id: 'siswa_999',
    username: 'budi_baru',
    name: 'Budi Baru',
    role: 'siswa',
    class: 'Kelas 7-B',
    sessionToken: 'sess_budi_1729312020000',
    sessionUpdatedAt: 1729312020000
  };

  const merged = mergeUsersList([newlyRegisteredStudent], existingUsers);
  assert.equal(merged.length, 3, 'Must contain admin, guru, and newly registered student');
  const found = merged.find(u => u.id === 'siswa_999');
  assert.ok(found, 'Newly registered student must be present in the merged list');
  assert.equal(found.username, 'budi_baru');
});

function mergeEvaluationSubmissionsList(primary, secondary) {
  const map = new Map();
  (secondary || []).forEach(s => {
    if (!s) return;
    const key = s.studentId || s.id;
    if (key) map.set(key, s);
  });
  (primary || []).forEach(s => {
    if (!s) return;
    const key = s.studentId || s.id;
    if (!key) return;
    const existing = map.get(key);
    if (existing) {
      const existingTime = parseInt(existing.id?.split('_').pop() || '0') || 0;
      const primaryTime = parseInt(s.id?.split('_').pop() || '0') || 0;
      const isPrimaryNewer = primaryTime >= existingTime;

      const base = isPrimaryNewer ? existing : s;
      const newer = isPrimaryNewer ? s : existing;

      const merged = { ...base, ...newer };
      const mergedProofs = {
        ...(base.photoProofs || {}),
        ...(newer.photoProofs || {})
      };
      for (const [k, v] of Object.entries(mergedProofs)) {
        if (!v || typeof v !== 'string' || !v.trim()) {
          delete mergedProofs[k];
        }
      }
      merged.photoProofs = mergedProofs;
      map.set(key, merged);
    } else {
      map.set(key, s);
    }
  });
  return Array.from(map.values());
}

test('Evaluation Submissions Sync: Multiple photos from different questions are merged losslessly and never deleted', () => {
  const oldCloudSubmission = {
    id: 'eval_std_1_1729350000',
    studentId: 'std_1',
    photoProofs: { eq_1: 'data:image/jpeg;base64,photo1==' }
  };

  const newLocalSubmission = {
    id: 'eval_std_1_1729360000',
    studentId: 'std_1',
    photoProofs: { eq_2: 'data:image/jpeg;base64,photo2==' }
  };

  const merged = mergeEvaluationSubmissionsList([newLocalSubmission], [oldCloudSubmission]);

  // Exactly 1 submission for this student (no duplicates)
  assert.equal(merged.length, 1);
  assert.equal(merged[0].studentId, 'std_1');

  // Both photos for eq_1 and eq_2 are preserved losslessly!
  assert.ok(merged[0].photoProofs['eq_1']);
  assert.ok(merged[0].photoProofs['eq_2']);
});


test('Admin Approval Policy: Newly registered student requires admin approval before being able to log in', () => {
  // New student registered by SiswaAuth
  const newStudent = {
    id: 'siswa_pending_1',
    username: 'rudi_santoso',
    name: 'Rudi Santoso',
    role: 'siswa',
    isApproved: false,
    sessionToken: null,
    deviceId: null
  };

  // Login verification function simulating SiswaAuth handleSignIn
  function attemptLogin(user) {
    if (user.role === 'siswa' && user.isApproved !== true) {
      return { success: false, reason: 'PENDING_APPROVAL' };
    }
    return { success: true, token: 'sess_' + user.id + '_' + Date.now() };
  }

  // Attempt login before approval -> BLOCKED
  const preApprovalResult = attemptLogin(newStudent);
  assert.equal(preApprovalResult.success, false);
  assert.equal(preApprovalResult.reason, 'PENDING_APPROVAL');

  // Admin approves account
  const approvedStudent = {
    ...newStudent,
    isApproved: true
  };

  // Merge sync in cloud/database
  const merged = mergeUsersList([approvedStudent], [newStudent]);
  const userInDb = merged.find(u => u.id === 'siswa_pending_1');
  assert.equal(userInDb.isApproved, true);

  // Attempt login after approval -> SUCCESS
  const postApprovalResult = attemptLogin(userInDb);
  assert.equal(postApprovalResult.success, true);
  assert.ok(postApprovalResult.token.startsWith('sess_siswa_pending_1_'));
});

test('Admin Approval Policy: Default system users and approved students have isApproved: true and login immediately', () => {
  const defaultStudent = {
    id: 'std_1',
    username: 'siswa1',
    name: 'Aisyah Putri',
    role: 'siswa',
    isApproved: true
  };

  function attemptLogin(user) {
    if (user.role === 'siswa' && user.isApproved !== true) {
      return { success: false, reason: 'PENDING_APPROVAL' };
    }
    return { success: true };
  }

  // Pre-approved default students can log in immediately
  const loginResult = attemptLogin(defaultStudent);
  assert.equal(loginResult.success, true);

  // Unapproved or undefined student is blocked
  const unapprovedStudent = {
    id: 'siswa_new_2',
    username: 'siswa_baru',
    name: 'Siswa Baru',
    role: 'siswa'
  };
  const blockedResult = attemptLogin(unapprovedStudent);
  assert.equal(blockedResult.success, false);
  assert.equal(blockedResult.reason, 'PENDING_APPROVAL');
});

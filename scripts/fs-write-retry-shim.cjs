'use strict';
// fs-write-retry-shim.cjs - preloaded via NODE_OPTIONS by SHIP-GYM.ps1.
// Windows scanners/indexers briefly hold or map freshly written files; a later
// rewrite then dies with UNKNOWN (errno -4094, e.g. ERROR_USER_MAPPED_FILE).
// The write is valid and the lock is transient, so retry instead of killing a
// 37-step build. Grown from .internal-docs/codex-write-retry.cjs (the loop's
// own diagnosis of the same failure).
const fs = require('fs');
const TRANSIENT = new Set(['UNKNOWN', 'EBUSY', 'EPERM', 'EACCES']);
const ATTEMPTS = 40;
const sleep = (ms) => {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (_) { const end = Date.now() + ms; while (Date.now() < end) {} }
};
for (const name of ['writeFileSync', 'appendFileSync', 'copyFileSync', 'renameSync']) {
  const orig = fs[name];
  fs[name] = function (...args) {
    let lastError;
    for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
      try { return orig.apply(this, args); }
      catch (error) {
        if (!error || !TRANSIENT.has(error.code)) throw error;
        lastError = error;
        sleep(Math.min(50 + attempt * 25, 300));
      }
    }
    throw lastError;
  };
}

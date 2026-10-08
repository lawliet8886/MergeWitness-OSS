import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// A runner that calls either public incident a merge-only conflict, or accepts
// the broken version as repaired, must fail this acceptance test.
for (const caseId of ['public-dataloader-cached-batching', 'public-dataloader-primed-error']) {
  test(`corpus replays and repairs ${caseId} without fabricating a merge witness`, { timeout: 180_000 }, () => {
    const out = mkdtempSync(join(tmpdir(), 'mergewitness-corpus-test-'));
    try {
      const result = spawnSync(process.execPath, ['scripts/run-corpus.mjs', '--case', caseId, '--out', out, '--repetitions', '1'], { encoding: 'utf8', timeout: 150_000 });
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout);
      assert.equal(summary.passed, true);
      assert.equal(summary.cases.length, 1);
      assert.equal(summary.cases[0].classification, 'preexisting_violation');
      assert.equal(summary.cases[0].repairPassed, true);
      assert.equal(summary.cases[0].retentionVerified, true);
    } finally { rmSync(out, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
  });
}

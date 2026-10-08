import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// A runner that calls either public incident a merge-only conflict, or accepts
// the broken version as repaired, must fail this acceptance test.
for (const caseId of ['public-dataloader-cached-batching', 'public-dataloader-primed-error', 'public-lru-stale-clear', 'public-fastq-pause-resume']) {
  test(`corpus replays and repairs ${caseId} without fabricating a merge witness`, { timeout: 180_000 }, () => {
    const out = mkdtempSync(join(tmpdir(), 'mergewitness-corpus-test-'));
    try {
      const result = spawnSync(process.execPath, ['scripts/run-corpus.mjs', '--case', caseId, '--out', out, '--repetitions', '1'], { encoding: 'utf8', timeout: 150_000,
        env: {...process.env,GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'core.autocrlf',GIT_CONFIG_VALUE_0:'true'},
      });
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout);
      assert.equal(summary.passed, true);
      assert.equal(summary.cases.length, 1);
      assert.equal(summary.cases[0].classification, 'preexisting_violation');
      assert.equal(summary.cases[0].repairPassed, true);
      assert.equal(summary.cases[0].retentionVerified, true);
      assert.equal(summary.cases[0].sourceIntegrity?.verified, true, 'Executed snapshots/candidate must retain the admitted published bytes under autocrlf=true.');
      assert.equal(summary.cases[0].sourceIntegrity.snapshots.length, 4);
      assert.ok(summary.cases[0].sourceIntegrity.snapshots.every(snapshot=>snapshot.files.every(file=>file.actualSha256===file.expectedSha256)));
      assert.ok(summary.cases[0].sourceIntegrity.candidate.files.every(file=>file.actualSha256===file.expectedSha256));
      assert.deepEqual(summary.cases[0].observedRepetitions, {base:1,branchA:1,branchB:1,merged:1});
    } finally { rmSync(out, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
  });
}

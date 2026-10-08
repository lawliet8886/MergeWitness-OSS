import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../src/cli/mergewitness.mjs', import.meta.url));

test('tenant-cache demo writes portable v2 evidence into a unique user output directory', () => {
  const output = mkdtempSync(join(tmpdir(), 'mergewitness-demo-'));
  try {
    const result = spawnSync(process.execPath, [cli, 'demo', 'tenant-cache', '--out', output], { encoding: 'utf8', timeout: 120_000 });
    assert.equal(result.status, 0, result.stderr);
    const response = JSON.parse(result.stdout);
    assert.equal(response.passed, true);
    assert.equal(response.retentionVerified, true);
    assert.equal(response.retentionCoverage.branchA, true);
    assert.equal(response.retentionCoverage.branchB, true);
    assert.notEqual(response.outputDir, output);
    assert.ok(existsSync(join(response.outputDir, 'evaluation.public.json')));
    assert.ok(existsSync(join(response.outputDir, 'repair.public.json')));
    const publicEvaluation = readFileSync(join(response.outputDir, 'evaluation.public.json'), 'utf8');
    const publicRepair = readFileSync(join(response.outputDir, 'repair.public.json'), 'utf8');
    const cache = JSON.parse(publicEvaluation).requirements.find(entry => entry.id === 'sku-cache');
    const proxyBytes = readFileSync(new URL('../src/bob-probes/sku-cache.proxy.check.mjs', import.meta.url));
    assert.equal(cache.sha256, createHash('sha256').update(proxyBytes).digest('hex'));
    assert.match(publicEvaluation, /"version": 2/);
    assert.match(publicRepair, /"retentionVerified": true/);
    assert.doesNotMatch(publicEvaluation + publicRepair, /[A-Z]:\\\\|\/tmp\/|mergewitness-/i);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});

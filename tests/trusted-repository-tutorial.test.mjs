import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const helper = fileURLToPath(new URL('../examples/trusted-repository/tutorial.mjs', import.meta.url));
const cli = fileURLToPath(new URL('../src/cli/mergewitness.mjs', import.meta.url));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
function assertOrdinaryTests(result, label, passes = true) {
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /node:test run\(\) is being called recursively|skipping running files/, `${label}: ordinary tests were skipped`);
  assert.ok(result.stdout.trim().length > 0, `${label}: ordinary tests produced no output`);
  assert.match(result.stdout, /returns the global price/, `${label}: expected fixture test was not executed`);
  assert.equal(result.signal, null, `${label}: ordinary tests were signaled`);
  assert.equal(result.error, null, `${label}: ordinary tests could not execute`);
  assert.equal(result.timedOut, false, `${label}: ordinary tests timed out`);
  if (passes) assert.equal(result.exitCode, 0, `${label}: ordinary tests failed`);
  else assert.ok(Number.isInteger(result.exitCode) && result.exitCode > 0, `${label}: removed cache must fail ordinary tests`);
}
function assertSnapshotTests(prepared, scenario) {
  for (const [snapshot, result] of Object.entries(prepared.normalTests)) assertOrdinaryTests(result, `${scenario}/${snapshot}`);
}
function run(script, args, expected = 0) {
  const childEnv = { ...process.env };
  // The CLI is a separate workflow, not a nested node:test test file.
  delete childEnv.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 120_000, env: childEnv });
  assert.equal(result.status, expected, result.stderr || result.stdout);
  return result;
}
function digestTree(root) {
  const hash = createHash('sha256');
  function visit(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else hash.update(path.slice(root.length)).update(readFileSync(path));
    }
  }
  visit(root);
  return hash.digest('hex');
}
test('copyable CLI tutorial retains features, rejects removal, preserves sources and prior outputs', () => {
  const evidenceRoot = process.env.MW_TUTORIAL_EVIDENCE_DIR;
  if (evidenceRoot) mkdirSync(evidenceRoot, { recursive: true });
  const parent = mkdtempSync(join(evidenceRoot || tmpdir(), 'mw tutorial spaces '));
  const preparedAnalyses = [];
  let primaryFailure;
  try {
    const old = join(parent, 'previous output'); mkdirSync(old); writeFileSync(join(old, 'receipt.json'), '{"keep":true}\n');
    const oldDigest = digestTree(old);
    const area = join(parent, 'interaction run');
    run(helper, ['init', area]);
    run(helper, ['init', area], 1);
    const config = json(join(area, 'tutorial.json'));
    const sourceDigest = digestTree(config.repoPath);
    run(cli, ['prepare', join(area, 'prepare.request.json'), join(area, 'prepared.json')]);
    const prepared = json(join(area, 'prepared.json'));
    preparedAnalyses.push(prepared);
    assertSnapshotTests(prepared, 'interaction');
    run(helper, ['requests', area]);
    run(cli, ['evaluate', join(area, 'evaluate.request.json'), join(area, 'evaluated.json')]);
    run(helper, ['save', area, 'evaluation']);
    const evaluated = json(join(area, 'evaluated.json'));
    assert.equal(evaluated.classification, 'interaction_witness');
    assert.deepEqual(Object.values(evaluated.matrix).map(entry => entry.kind), ['pass', 'pass', 'pass', 'fail']);
    assert.equal(evaluated.probeManifest.length, 2);
    assert.ok(evaluated.requirements.every(entry => entry.calibration.kind === 'pass'));
    assertSnapshotTests(evaluated, 'evaluated interaction');
    const savedEvaluation = readFileSync(join(area, 'saved', 'evaluation.json'));
    run(helper, ['repair', area, 'good']);
    run(cli, ['verify-repair', join(area, 'verify.request.json'), join(area, 'good.json')]);
    run(helper, ['save', area, 'good']);
    const good = json(join(area, 'good.json'));
    assert.equal(good.passed, true); assert.equal(good.retentionVerified, true);
    assertOrdinaryTests(good.normalTests, 'good repair');
    run(helper, ['repair', area, 'bad']);
    run(cli, ['verify-repair', join(area, 'verify.request.json'), join(area, 'bad.json')], 1);
    run(helper, ['save', area, 'bad']);
    const bad = json(join(area, 'bad.json'));
    assert.equal(bad.passed, false); assert.equal(bad.probe.kind, 'pass'); assert.equal(bad.retentionVerified, false);
    assert.equal(bad.requirementResults.find(entry => entry.id === 'sku-cache').result.kind, 'fail');
    assertOrdinaryTests(bad.normalTests, 'bad repair', false);
    assert.match(bad.normalTests.stdout, /caches repeated SKU lookups/, 'bad repair: cache test must execute');
    assert.notEqual(good.reportPath, bad.reportPath);
    for (const repair of ['good', 'bad']) {
      run(cli, ['report', join(area, 'saved', 'evaluation.json'), '--repair', join(area, 'saved', `${repair}.json`), '--out', join(area, `html ${repair}`)]);
    }
    run(cli, ['dispose', join(area, 'dispose.request.json'), join(area, 'disposed.json')]);
    assert.equal(existsSync(prepared.statePath), false);
    assert.deepEqual(readFileSync(join(area, 'saved', 'evaluation.json')), savedEvaluation);
    assert.equal(digestTree(config.repoPath), sourceDigest);
    const completedDigest = digestTree(area);
    for (const scenario of ['inconclusive', 'preexisting']) {
      const second = join(parent, `${scenario} run`);
      run(helper, ['init', second, scenario]);
      run(cli, ['prepare', join(second, 'prepare.request.json'), join(second, 'prepared.json')]);
      const controlPrepared = json(join(second, 'prepared.json'));
      preparedAnalyses.push(controlPrepared);
      assertSnapshotTests(controlPrepared, scenario);
      run(helper, ['requests', second]);
      run(cli, ['evaluate', join(second, 'evaluate.request.json'), join(second, 'evaluated.json')]);
      run(helper, ['save', second, 'evaluation']);
      assert.equal(json(join(second, 'evaluated.json')).classification, scenario === 'preexisting' ? 'preexisting_violation' : 'inconclusive');
      assertSnapshotTests(json(join(second, 'evaluated.json')), `evaluated ${scenario}`);
      run(cli, ['report', join(second, 'saved', 'evaluation.json'), '--out', join(second, 'html')]);
      run(cli, ['dispose', join(second, 'dispose.request.json'), join(second, 'disposed.json')]);
    }
    assert.equal(digestTree(area), completedDigest);
    assert.equal(digestTree(old), oldDigest);
    if (evidenceRoot) writeFileSync(join(parent, 'acceptance.json'), `${JSON.stringify({
      runtime: process.version, platform: process.platform, parent, sourcePath: config.repoPath,
      sourceBefore: sourceDigest, sourceAfter: digestTree(config.repoPath),
      previousOutputBefore: oldDigest, previousOutputAfter: digestTree(old),
      completedRunBefore: completedDigest, completedRunAfter: digestTree(area),
      prepared: { analysisId: prepared.analysisId, statePath: prepared.statePath, paths: prepared.paths },
      classification: evaluated.classification, matrix: Object.fromEntries(Object.entries(evaluated.matrix).map(([key, value]) => [key, value.kind])),
      good: { passed: good.passed, retentionVerified: good.retentionVerified, reportPath: good.reportPath },
      bad: { passed: bad.passed, retentionVerified: bad.retentionVerified, probeKind: bad.probe.kind, reportPath: bad.reportPath },
      ordinaryTests: {
        snapshots: Object.fromEntries(preparedAnalyses.map((analysis, index) => [index, Object.fromEntries(Object.entries(analysis.normalTests).map(([snapshot, result]) => [snapshot, { exitCode: result.exitCode, stdoutLength: result.stdout.length, recursiveSkip: /skipping running files/.test(result.stderr) }]))])),
        good: { exitCode: good.normalTests.exitCode, stdoutLength: good.normalTests.stdout.length, recursiveSkip: /skipping running files/.test(good.normalTests.stderr) },
        bad: { exitCode: bad.normalTests.exitCode, stdoutLength: bad.normalTests.stdout.length, recursiveSkip: /skipping running files/.test(bad.normalTests.stderr) },
      },
      controls: { inconclusive: 'inconclusive', preexisting: 'preexisting_violation' }, disposed: !existsSync(prepared.statePath),
    }, null, 2)}\n`);
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    const cleanupErrors = [];
    for (const analysis of preparedAnalyses) {
      if (!existsSync(analysis.statePath)) continue;
      try {
        const request = join(parent, `cleanup-${analysis.analysisId}.request.json`);
        writeFileSync(request, JSON.stringify({ analysisId: analysis.analysisId, statePath: analysis.statePath }), { flag: 'wx' });
        run(cli, ['dispose', request, join(parent, `cleanup-${analysis.analysisId}.response.json`)]);
      } catch (error) { cleanupErrors.push(error); }
    }
    if (!evidenceRoot) {
      try { rmSync(parent, { recursive: true, force: true }); }
      catch (error) { cleanupErrors.push(error); }
    }
    if (cleanupErrors.length && primaryFailure) process.stderr.write(`Tutorial cleanup errors (original failure preserved): ${cleanupErrors.map(error => error.message).join('; ')}\n`);
    else if (cleanupErrors.length) throw new AggregateError(cleanupErrors, 'Tutorial cleanup failed');
  }
});

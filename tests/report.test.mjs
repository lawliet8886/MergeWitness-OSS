import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { canonicalEvaluation, canonicalRepair } from './support/report-fixtures.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = join(root, 'src/cli/mergewitness.mjs');
const sha = value => createHash('sha256').update(value).digest('hex');
const pass = () => ({ kind: 'pass', consistent: true, evidence: [{ price: 100 }] });
const ordinary = () => ({ exitCode: 0, signal: null, timedOut: false });

// Literal contract fixture: the observed combined price is wrong; the repaired price is 100.
function evaluation() {
  return {
    version: 2, evaluationId: 'evaluation-one', runtime: { node: 'v24.14.0', platform: 'win32', arch: 'x64' },
    source: { refs: { baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache' }, commits: { base: '1'.repeat(40), branchA: '2'.repeat(40), branchB: '3'.repeat(40), merged: '4'.repeat(40) }, trees: { base: '5'.repeat(40), branchA: '6'.repeat(40), branchB: '7'.repeat(40), merged: '8'.repeat(40) } },
    classification: 'interaction_witness', merge: { clean: true },
    probe: { sha256: 'f'.repeat(64), files: [{ name: 'sequence.mjs', sha256: 'f'.repeat(64) }] },
    normalTests: { base: ordinary(), branchA: ordinary(), branchB: ordinary(), merged: ordinary() },
    matrix: { base: pass(), branchA: pass(), branchB: pass(), merged: { kind: 'fail', consistent: true, evidence: [{ tenant: 'Beta', expected: 100, observed: 90 }] } },
    requirements: [
      { id: 'tenant-pricing', origin: 'branchA', sha256: 'a'.repeat(64), calibration: pass() },
      { id: 'sku-cache', origin: 'branchB', sha256: 'b'.repeat(64), calibration: pass() },
    ],
  };
}
function repair() {
  return {
    version: 2, evaluationId: 'evaluation-one', verificationId: 'verification-one',
    runtime: { node: 'v24.14.0', platform: 'win32', arch: 'x64' },
    sourceMergedTree: '8'.repeat(40), candidateTree: '9'.repeat(40), frozenProbeHash: 'f'.repeat(64),
    normalTests: ordinary(), probe: pass(), passed: true, retentionVerified: true,
    retentionCoverage: { branchA: true, branchB: true },
    requirementResults: [
      { id: 'tenant-pricing', origin: 'branchA', sha256: 'a'.repeat(64), result: pass() },
      { id: 'sku-cache', origin: 'branchB', sha256: 'b'.repeat(64), result: pass() },
    ],
  };
}
function inputs(ev = evaluation(), rep = repair()) {
  const parent = join(root, 'artifacts', 'report-tests'); mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(join(parent, 'case-'));
  const evaluationPath = join(dir, 'evaluation.json');
  const bytes = `${JSON.stringify(ev, null, 2)}\n`; writeFileSync(evaluationPath, bytes);
  let repairPath;
  if (rep) {
    repairPath = join(dir, 'repair.json');
    if (ev.source) rep.evaluationPublicReportSha256 ??= sha(bytes);
    writeFileSync(repairPath, `${JSON.stringify(rep, null, 2)}\n`);
  }
  return { evaluationPath, ...(repairPath ? { repairPath } : {}), out: join(dir, 'reports'), dir };
}
async function create(input) {
  const { createReport } = await import('../src/report/report.mjs');
  return createReport(input);
}

test('report presents a portable evaluation and its bound repair as offline readable evidence', async () => {
  const input = inputs(); const result = await create(input);
  const html = readFileSync(result.reportPath, 'utf8');
  assert.equal(result.evaluationId, 'evaluation-one');
  assert.equal(result.verificationId, 'verification-one');
  assert.equal(dirname(result.reportPath), result.outputDir);
  assert.match(html, /Interaction witness found/);
  assert.match(html, /Declared checks passed/);
  assert.match(html, /tenant-pricing/); assert.match(html, /sku-cache/);
  assert.match(html, /Beta/); assert.match(html, /100/); assert.match(html, /90/);
  assert.doesNotMatch(html, /<script\b|<iframe\b|<link\b|\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i);
});

test('two report executions preserve both input bytes and earlier output', async () => {
  const input = inputs();
  const before = [sha(readFileSync(input.evaluationPath)), sha(readFileSync(input.repairPath))];
  const one = await create(input); const earlier = readFileSync(one.reportPath);
  const two = await create(input);
  assert.notEqual(one.outputDir, two.outputDir);
  assert.deepEqual(readFileSync(one.reportPath), earlier);
  assert.deepEqual([sha(readFileSync(input.evaluationPath)), sha(readFileSync(input.repairPath))], before);
});

test('canonical core reports bind analysis identity and are accepted without a portable byte digest', async () => {
  const result = await create(inputs(canonicalEvaluation(), canonicalRepair()));
  assert.match(readFileSync(result.reportPath, 'utf8'), /Declared checks passed/);
});

for (const [field, value, reason] of [
  ['evaluationId', 'different-evaluation', /evaluation/i],
  ['frozenProbeHash', '0'.repeat(64), /probe/i],
  ['sourceMergedTree', '0'.repeat(40), /tree/i],
  ['evaluationPublicReportSha256', '0'.repeat(64), /digest|bytes|sha/i],
]) {
  test(`report rejects repair with mismatched ${field}`, async () => {
    const rep = repair(); rep[field] = value;
    const input = inputs(evaluation(), rep);
    await assert.rejects(() => create(input), reason);
    assert.equal(readdirSync(input.dir).includes('reports'), false);
  });
}

test('canonical pair with different analysis identities cannot be displayed as one execution', async () => {
  const rep = canonicalRepair(); rep.analysisId = 'another-analysis';
  await assert.rejects(() => create(inputs(canonicalEvaluation(), rep)), /analysis/i);
});

test('portable repair must contain exact evaluation-byte binding', async () => {
  const input = inputs(); const rep = JSON.parse(readFileSync(input.repairPath)); delete rep.evaluationPublicReportSha256;
  writeFileSync(input.repairPath, JSON.stringify(rep));
  await assert.rejects(() => create(input), /digest|bytes|sha/i);
});

test('historical v1 and malformed input are rejected without writing a result', async () => {
  const ev = evaluation(); ev.version = 1; const historical = inputs(ev, null);
  await assert.rejects(() => create(historical), /version|v2/i);
  const invalid = inputs(evaluation(), null); writeFileSync(invalid.evaluationPath, '{broken');
  await assert.rejects(() => create(invalid), /JSON/i);
});

test('inconclusive observations never appear as an approved correction', async () => {
  const ev = evaluation(); ev.classification = 'inconclusive';
  ev.matrix.merged = { kind: 'inconclusive', consistent: false, evidence: [null] };
  const rep = repair(); rep.passed = false; rep.probe = ev.matrix.merged;
  const result = await create(inputs(ev, rep)); const html = readFileSync(result.reportPath, 'utf8');
  assert.match(html, /Inconclusive/); assert.match(html, /Correction not approved/);
  assert.doesNotMatch(html, /Declared checks passed/);
});

test('a no-witness observation and absent verification are not a safety certificate', async () => {
  const ev = evaluation(); ev.classification = 'no_witness_found'; ev.matrix.merged = pass();
  const result = await create(inputs(ev, null)); const html = readFileSync(result.reportPath, 'utf8');
  assert.match(html, /No interaction witness found/); assert.match(html, /Correction not provided/);
  assert.match(html, /does not certify/i); assert.doesNotMatch(html, /Declared checks passed/);
});

test('claimed passing repair with absent branch coverage is rejected', async () => {
  const rep = repair(); rep.retentionCoverage.branchB = false;
  await assert.rejects(() => create(inputs(evaluation(), rep)), /coverage|passing/i);
});

test('changed retention check cannot be presented as matching the frozen requirement', async () => {
  const rep = repair(); rep.requirementResults[0].sha256 = 'c'.repeat(64);
  await assert.rejects(() => create(inputs(evaluation(), rep)), /requirement|frozen/i);
});

test('report escapes HTML from refs, identifiers and observed evidence', async () => {
  const ev = evaluation(); ev.source.refs.branchARef = '</h2><script>BADREF</script>';
  ev.matrix.merged.evidence = [{ note: '<img src=x onerror="BADEVIDENCE">' }];
  ev.requirements[0].id = '<svg onload="BADID">';
  const rep = repair(); rep.requirementResults[0].id = ev.requirements[0].id;
  const result = await create(inputs(ev, rep)); const html = readFileSync(result.reportPath, 'utf8');
  assert.match(html, /&lt;script&gt;BADREF/); assert.match(html, /&lt;img/); assert.match(html, /&lt;svg/);
  assert.doesNotMatch(html, /<script\b|<img\b|<svg\s+onload/i);
});

test('CLI report handles paths with spaces and accents and prints its generated path as JSON', () => {
  const input = inputs(); const out = join(input.dir, 'relatórios locais');
  const result = spawnSync(process.execPath, [cli, 'report', input.evaluationPath, '--repair', input.repairPath, '--out', out], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(result.stdout); assert.match(readFileSync(receipt.reportPath, 'utf8'), /Declared checks passed/);
  assert.equal(dirname(receipt.outputDir), out);
});

test('CLI rejects unknown inherited option names without creating output', () => {
  const input = inputs();
  const result = spawnSync(process.execPath, [cli, 'report', input.evaluationPath, 'toString', 'ignored', '--out', input.out], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
  assert.equal(readdirSync(input.dir).includes('reports'), false);
});

test('malformed null requirements produce an actionable validation error', async () => {
  const ev = evaluation(); ev.requirements.push(null);
  await assert.rejects(() => create(inputs(ev, null)), /Invalid.*requirement/i);
  const rep = repair(); rep.requirementResults.push(null);
  await assert.rejects(() => create(inputs(evaluation(), rep)), /requirement.*match/i);
});

test('verified retention cannot conceal a failed calibration even when that branch has another passing check', async () => {
  const ev = evaluation();
  ev.requirements.push({ id: 'extra-pricing', origin: 'branchA', sha256: 'c'.repeat(64), calibration: { kind: 'fail', consistent: true, evidence: [] } });
  const rep = repair(); rep.passed = false;
  rep.requirementResults.push({ id: 'extra-pricing', origin: 'branchA', sha256: 'c'.repeat(64), result: pass() });
  await assert.rejects(() => create(inputs(ev, rep)), /retention|coverage|calibration/i);
});

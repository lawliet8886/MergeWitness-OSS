import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { createReport } from '../src/report/report.mjs';
import { addLegacy, canonicalEvaluation, canonicalRepair } from './support/report-fixtures.mjs';

function inputs(ev, rep) {
  const parent = join(import.meta.dirname, '../artifacts/report-review-tests'); mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(join(parent, 'case-'));
  const evaluationPath = join(dir, 'evaluation.json'), repairPath = join(dir, 'repair.json');
  writeFileSync(evaluationPath, JSON.stringify(ev)); writeFileSync(repairPath, JSON.stringify(rep));
  return { evaluationPath, repairPath, out: join(dir, 'html') };
}
function rejects(ev, rep, reason) {
  const input = inputs(ev, rep);
  assert.throws(() => createReport(input), reason);
  assert.equal(existsSync(input.out), false);
}

test('canonical legacy rejection shows the actual failing check and keeps the correction unapproved', () => {
  const ev = canonicalEvaluation(); addLegacy(ev); const rep = canonicalRepair(ev);
  rep.featureChecks.at(-1).result.kind = 'fail';
  for (const run of rep.featureChecks.at(-1).result.runs) { run.probe.kind = 'fail'; run.probe.payload.status = 'fail'; run.stdout = JSON.stringify(run.probe.payload); }
  rep.passed = false;
  const html = readFileSync(createReport(inputs(ev, rep)).reportPath, 'utf8');
  assert.match(html, /legacy-extra\.check\.mjs/); assert.match(html, /Correction not approved/);
  assert.match(html, /Additional frozen checks/); assert.doesNotMatch(html, /Declared checks passed/);
});

test('canonical passing claim cannot conceal a failed legacy check', () => {
  const ev = canonicalEvaluation(); addLegacy(ev); const rep = canonicalRepair(ev);
  rep.featureChecks.at(-1).result.kind = 'fail';
  for (const run of rep.featureChecks.at(-1).result.runs) { run.probe.kind = 'fail'; run.probe.payload.status = 'fail'; run.stdout = JSON.stringify(run.probe.payload); }
  rejects(ev, rep, /passing|feature|legacy/i);
});

for (const change of ['missing', 'hash', 'manifest']) {
  test(`canonical legacy frozen record rejects a ${change} result`, () => {
    const ev = canonicalEvaluation(); addLegacy(ev); const rep = canonicalRepair(ev);
    if (change === 'missing') rep.featureChecks.pop();
    if (change === 'hash') rep.featureChecks.at(-1).hash = 'd'.repeat(64);
    if (change === 'manifest') rep.featureChecks.at(-1).manifest[0].hash = 'd'.repeat(64);
    rejects(ev, rep, /frozen|feature|manifest/i);
  });
}

for (const change of ['timeout', 'empty', 'count', 'different-evidence']) {
  test(`canonical passing observation rejects ${change} execution records`, () => {
    const ev = canonicalEvaluation(), rep = canonicalRepair(ev);
    if (change === 'timeout') rep.probe.runs[0] = { exitCode: null, signal: 'SIGTERM', error: null, timedOut: true, stdout: '', stderr: 'RECORDED_TIMEOUT', probe: { kind: 'inconclusive', reason: 'timeout' } };
    if (change === 'empty') rep.probe.runs = [];
    if (change === 'count') rep.probe.runs.pop();
    if (change === 'different-evidence') { rep.probe.runs[1].probe.payload.evidence.price = 99; rep.probe.runs[1].stdout = JSON.stringify(rep.probe.runs[1].probe.payload); }
    rejects(ev, rep, /observation|run|consisten|repetition/i);
  });
}

test('honest canonical inconclusive report preserves timeout diagnostics without approval', () => {
  const ev = canonicalEvaluation(), rep = canonicalRepair(ev);
  rep.probe = { kind: 'inconclusive', consistent: true, runs: Array.from({ length: 2 }, () => ({ exitCode: null, signal: 'SIGTERM', error: null, timedOut: true, stdout: '', stderr: 'RECORDED_TIMEOUT', probe: { kind: 'inconclusive', reason: 'timeout' } })) };
  rep.passed = false;
  const html = readFileSync(createReport(inputs(ev, rep)).reportPath, 'utf8');
  assert.match(html, /RECORDED_TIMEOUT/); assert.match(html, /SIGTERM/); assert.match(html, /Correction not approved/);
});

for (const change of ['eligibility', 'coverage', 'nested-id', 'nested-requirement', 'classification', 'source-commit', 'duplicate-result']) {
  test(`canonical pair rejects contradictory ${change} metadata`, () => {
    const ev = canonicalEvaluation(), rep = canonicalRepair(ev);
    if (change === 'eligibility') ev.probe.strictEligible = false;
    if (change === 'coverage') { ev.retentionCoverage.branchA = false; ev.probe.retentionCoverage.branchA = false; }
    if (change === 'nested-id') ev.probe.evaluationId = 'another-evaluation';
    if (change === 'nested-requirement') ev.probe.requirements[0].hash = 'e'.repeat(64);
    if (change === 'classification') rep.evaluationClassification = 'no_witness_found';
    if (change === 'source-commit') rep.sourceMergedCommit = 'e'.repeat(40);
    if (change === 'duplicate-result') rep.featureChecks[0].result = structuredClone(ev.probe.matrix.merged);
    rejects(ev, rep, /eligib|coverage|identity|evaluation|requirement|classif|commit|result|frozen/i);
  });
}

test('canonical report displays the actual base and branch references from the producer', () => {
  const ev = canonicalEvaluation(), rep = canonicalRepair(ev);
  ev.refs.branchARef = 'pricing-reference-visible'; ev.refs.branchBRef = 'cache-reference-visible';
  const html = readFileSync(createReport(inputs(ev, rep)).reportPath, 'utf8');
  assert.match(html, /pricing-reference-visible/); assert.match(html, /cache-reference-visible/);
});

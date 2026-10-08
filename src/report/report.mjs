import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const revisions = ['base', 'branchA', 'branchB', 'merged'];
const labels = { base: 'Base', branchA: 'Change A', branchB: 'Change B', merged: 'Combination' };
const classifications = {
  interaction_witness: ['Interaction witness found', 'fail', 'The supplied check passed in Base and both changes, then failed in their combination.'],
  no_witness_found: ['No interaction witness found', 'neutral', 'The supplied check did not expose a failure. This does not certify every behavior or every merge as safe.'],
  preexisting_violation: ['Preexisting violation', 'fail', 'The observation already fails in Base. This is not evidence of a merge-specific interaction.'],
  branch_violation: ['Change already violates the check', 'fail', 'At least one individual change fails the observation. The failure is not exclusive to the combination.'],
  ordinary_test_failure: ['Existing tests failed', 'fail', 'Existing tests failed in at least one revision. Inspect those failures before drawing a behavioral conclusion.'],
  inconclusive: ['Inconclusive', 'unknown', 'An execution failed or observations were not reproducible. No passing conclusion follows.'],
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const present = value => typeof value === 'string' && value.length > 0;
const hash = value => typeof value === 'string' && /^[a-f\d]{64}$/i.test(value);
const isPass = value => value?.kind === 'pass' && value.consistent === true;
const ordinaryPass = value => object(value) && value.exitCode === 0 && !value.signal && !value.error && !value.timedOut;

function recordedProbe(run) {
  if (run.timedOut) return { kind: 'inconclusive', reason: 'timeout' };
  if (run.signal) return { kind: 'inconclusive', reason: 'signal' };
  if (run.error || run.exitCode === null || run.exitCode !== 0) return { kind: 'inconclusive', reason: 'nonzero_exit' };
  const last = run.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!last) return { kind: 'inconclusive', reason: 'missing_structured_result' };
  try {
    const payload = JSON.parse(last);
    return ['pass', 'fail'].includes(payload?.status) ? { kind: payload.status, payload } : { kind: 'inconclusive', reason: 'invalid_status' };
  } catch { return { kind: 'inconclusive', reason: 'invalid_json' }; }
}
function observation(value, name, repetitions) {
  requireValue(object(value) && ['pass', 'fail', 'inconclusive'].includes(value.kind) && typeof value.consistent === 'boolean', `Invalid observation: ${name}.`);
  requireValue(value.kind === 'inconclusive' || value.consistent, `Inconsistent observation must be inconclusive: ${name}.`);
  if (repetitions === undefined) {
    requireValue(Array.isArray(value.evidence), `Portable observation is missing evidence: ${name}.`);
    return { kind: value.kind, consistent: value.consistent, evidence: value.evidence };
  }
  requireValue(Array.isArray(value.runs) && value.runs.length === repetitions && repetitions > 0, `Canonical observation has missing runs or wrong repetition count: ${name}.`);
  const probes = value.runs.map(run => {
    requireValue(object(run) && (run.exitCode === null || Number.isInteger(run.exitCode)) && typeof run.stdout === 'string' && typeof run.stderr === 'string' && typeof run.timedOut === 'boolean', `Invalid canonical observation run: ${name}.`);
    const probe = recordedProbe(run);
    requireValue(isDeepStrictEqual(run.probe, probe), `Recorded observation contradicts its execution: ${name}.`);
    return probe;
  });
  const consistent = new Set(probes.map(probe => JSON.stringify(probe))).size === 1;
  const kind = consistent ? probes[0].kind : 'inconclusive';
  requireValue(value.consistent === consistent && value.kind === kind, `Observation summary contradicts recorded runs or consistency: ${name}.`);
  return { kind, consistent, evidence: probes.map(probe => probe.payload?.evidence ?? null), executions: value.runs };
}
function frozenRecord(record) {
  requireValue(object(record) && ['requirement', 'legacy'].includes(record.sourceType) && hash(record.hash) && present(record.source) && present(record.frozen) && Array.isArray(record.manifest) && record.manifest.length > 0, 'Invalid canonical frozen feature check.');
  requireValue(record.manifest.every(entry => object(entry) && present(entry.source) && present(entry.frozen) && hash(entry.hash)) && record.manifest[0].frozen === record.frozen && record.manifest[0].hash === record.hash, 'Canonical frozen feature manifest contradicts its primary check.');
  return record.sourceType === 'requirement' ? `requirement:${record.id}` : `legacy:${record.frozen}`;
}
function coverageFor(requirements, results) {
  return Object.fromEntries(['branchA', 'branchB'].map(origin => {
    const entries = requirements.filter(item => item.origin === origin);
    return [origin, entries.length > 0 && entries.every(item => isPass(item.calibration) && (!results || isPass(results.find(result => result.id === item.id)?.result)))];
  }));
}
function checkCoverage(actual, expected, name) {
  requireValue(object(actual) && ['branchA', 'branchB'].every(origin => typeof actual[origin] === 'boolean' && actual[origin] === expected[origin]), `Declared ${name} coverage contradicts its recorded requirements.`);
}
function classify(normalTests, matrix) {
  if (revisions.some(key => !object(normalTests[key]) || normalTests[key].signal || normalTests[key].error || normalTests[key].timedOut || normalTests[key].exitCode == null)) return 'inconclusive';
  if (revisions.some(key => normalTests[key].exitCode !== 0)) return 'ordinary_test_failure';
  if (revisions.some(key => matrix[key].kind === 'inconclusive')) return 'inconclusive';
  if (matrix.base.kind === 'fail') return 'preexisting_violation';
  if (matrix.branchA.kind === 'fail' || matrix.branchB.kind === 'fail') return 'branch_violation';
  return matrix.merged.kind === 'fail' ? 'interaction_witness' : 'no_witness_found';
}

function normalizeEvaluation(data) {
  requireValue(object(data) && data.version === 2, 'Only supported v2 evaluation reports are accepted.');
  const portable = object(data.source);
  requireValue(!portable || (!data.refs && !data.trees && !data.commits), 'Ambiguous evaluation report format.');
  const source = portable ? data.source : data;
  const probe = portable ? data : data.probe;
  const probeHash = portable ? data.probe?.sha256 : data.probe?.probeHash;
  requireValue(present(data.evaluationId) && object(source.refs) && object(source.trees) && object(source.commits) && hash(probeHash), 'Invalid v2 evaluation identity, source or probe hash.');
  requireValue(['baseRef', 'branchARef', 'branchBRef'].every(key => present(source.refs[key])), 'Evaluation is missing its actual source reference names.');
  let repetitions;
  if (!portable) {
    requireValue(present(data.analysisId) && data.probe?.version === 2, 'Canonical evaluation requires its v2 probe and analysis identity.');
    repetitions = data.probe.repetitions;
    requireValue(Number.isInteger(repetitions) && repetitions >= 1 && repetitions <= 10, 'Invalid canonical probe repetition count.');
    requireValue(data.probe.evaluationId === data.evaluationId && isDeepStrictEqual(data.probe.runtime, data.runtime), 'Canonical nested evaluation identity/runtime contradicts its report.');
    requireValue(isDeepStrictEqual(data.probe.requirements, data.requirements), 'Canonical nested frozen requirements contradict the evaluation.');
  }
  requireValue(object(probe?.matrix) && object(data.normalTests) && Array.isArray(data.requirements), 'Evaluation is missing its observation matrix, tests or declared requirements.');
  const matrix = Object.fromEntries(revisions.map(key => {
    requireValue(present(source.commits[key]) && present(source.trees[key]), `Evaluation is missing source commit/tree: ${key}.`);
    requireValue(object(data.normalTests[key]), `Evaluation is missing existing tests: ${key}.`);
    return [key, observation(probe.matrix[key], key, repetitions)];
  }));
  const classification = probe.classification;
  requireValue(Object.hasOwn(classifications, classification), 'Unsupported evaluation classification.');
  requireValue(classify(data.normalTests, matrix) === classification, 'Evaluation classification contradicts its recorded tests or observations.');
  const ids = new Set();
  const requirements = data.requirements.map(item => {
    requireValue(object(item), 'Invalid frozen requirement.');
    const digest = portable ? item.sha256 : item.hash;
    requireValue(object(item) && present(item.id) && !ids.has(item.id) && ['branchA', 'branchB'].includes(item.origin) && hash(digest), 'Invalid or duplicate frozen requirement.');
    if (!portable) requireValue(item.sourceType === 'requirement' && frozenRecord(item) === `requirement:${item.id}`, 'Invalid canonical frozen requirement.');
    ids.add(item.id);
    return { id: item.id, origin: item.origin, hash: digest, calibration: observation(item.calibration, `requirement ${item.id}`, repetitions) };
  });
  const coverage = coverageFor(requirements);
  let strictEligible, frozenChecks = [];
  if (!portable) {
    checkCoverage(data.retentionCoverage, coverage, 'evaluation');
    checkCoverage(data.probe.retentionCoverage, coverage, 'nested evaluation');
    strictEligible = requirements.length > 0 && revisions.every(key => matrix[key].kind !== 'inconclusive' && ordinaryPass(data.normalTests[key])) && coverage.branchA && coverage.branchB;
    requireValue(data.probe.strictEligible === strictEligible, 'Canonical strict eligibility contradicts its observations, tests or coverage.');
    requireValue(Array.isArray(data.probe.featureChecks), 'Canonical evaluation is missing frozen feature checks.');
    const keys = new Set();
    frozenChecks = data.probe.featureChecks.map(record => {
      const key = frozenRecord(record);
      requireValue(!keys.has(key), 'Duplicate canonical frozen feature check.'); keys.add(key);
      if (record.sourceType === 'requirement') requireValue(isDeepStrictEqual(record, data.requirements.find(item => item.id === record.id)), 'Frozen feature requirement contradicts its declared requirement.');
      return { key, record };
    });
    requireValue(requirements.every(item => keys.has(`requirement:${item.id}`)), 'Canonical frozen feature checks omit a declared requirement.');
    requireValue(Array.isArray(data.probe.manifest) && data.probe.manifest.length > 0 && data.probe.manifest.every(entry => object(entry) && present(entry.source) && present(entry.frozen) && hash(entry.hash)) && data.probe.manifest[0].hash === probeHash && data.probe.manifest[0].frozen === data.probe.probePath, 'Canonical frozen probe manifest contradicts its identity.');
  }
  return { portable, analysisId: data.analysisId, evaluationId: data.evaluationId, runtime: data.runtime, source, probeHash, matrix, normalTests: data.normalTests, requirements, classification, repetitions, strictEligible, frozenChecks };
}

function normalizeRepair(data, evaluation, evaluationBytes) {
  requireValue(object(data) && data.version === 2 && present(data.verificationId), 'Only supported v2 repair reports are accepted.');
  requireValue(data.evaluationId === evaluation.evaluationId, 'Repair belongs to a different evaluation.');
  if (!evaluation.portable) requireValue(data.analysisId === evaluation.analysisId, 'Repair belongs to a different analysis.');
  requireValue(data.frozenProbeHash === evaluation.probeHash, 'Repair does not match the frozen probe hash.');
  requireValue(data.sourceMergedTree === evaluation.source.trees.merged, 'Repair does not match the evaluated source tree.');
  if (!evaluation.portable) {
    requireValue(data.sourceMergedCommit === evaluation.source.commits.merged, 'Repair does not match the evaluated source commit.');
    requireValue(data.evaluationClassification === evaluation.classification, 'Repair evaluation classification contradicts its paired evaluation.');
  }
  if (evaluation.portable) {
    requireValue(hash(data.evaluationPublicReportSha256) && data.evaluationPublicReportSha256 === createHash('sha256').update(evaluationBytes).digest('hex'), 'Portable repair requires the exact evaluation-byte SHA-256 digest.');
  }
  requireValue(typeof data.passed === 'boolean' && typeof data.retentionVerified === 'boolean' && object(data.retentionCoverage) && typeof data.retentionCoverage.branchA === 'boolean' && typeof data.retentionCoverage.branchB === 'boolean' && object(data.normalTests) && present(data.candidateTree) && Array.isArray(data.requirementResults), 'Invalid repair outcome, coverage or candidate identity.');
  const probe = observation(data.probe, 'repair probe', evaluation.repetitions);
  const ids = new Set();
  const results = data.requirementResults.map(item => {
    requireValue(object(item), 'Repair requirement does not match a unique frozen requirement.');
    const digest = evaluation.portable ? item.sha256 : item.hash;
    const original = evaluation.requirements.find(entry => entry.id === item.id);
    requireValue(object(item) && original && !ids.has(item.id) && item.origin === original.origin && digest === original.hash, 'Repair requirement does not match a unique frozen requirement.');
    ids.add(item.id);
    return { id: item.id, origin: item.origin, result: observation(item.result, `repair requirement ${item.id}`, evaluation.repetitions) };
  });
  requireValue(results.length === evaluation.requirements.length, 'Repair is missing a frozen requirement result.');
  const coverage = coverageFor(evaluation.requirements, results);
  checkCoverage(data.retentionCoverage, coverage, 'repair');
  requireValue(data.retentionVerified === (coverage.branchA && coverage.branchB), 'Claimed verified retention contradicts the recorded coverage or requirements.');
  let featureResults = [];
  if (!evaluation.portable) {
    requireValue(Array.isArray(data.featureChecks) && data.featureChecks.length === evaluation.frozenChecks.length, 'Repair is missing a frozen feature check result.');
    const seen = new Set();
    featureResults = data.featureChecks.map(item => {
      const key = frozenRecord(item), original = evaluation.frozenChecks.find(entry => entry.key === key);
      const { result, ...record } = item;
      requireValue(original && !seen.has(key) && isDeepStrictEqual(record, original.record), 'Repair feature check does not match a unique frozen record/manifest.'); seen.add(key);
      if (item.sourceType === 'requirement') requireValue(isDeepStrictEqual(item, data.requirementResults.find(entry => entry.id === item.id)), 'Duplicated frozen requirement result contradicts the feature check result.');
      return { key, sourceType: item.sourceType, name: item.source.replaceAll('\\', '/').split('/').at(-1), hash: item.hash,
        result: observation(result, `feature check ${key}`, item.sourceType === 'legacy' ? 1 : evaluation.repetitions) };
    });
  }
  if (data.passed) requireValue(revisions.every(key => ordinaryPass(evaluation.normalTests[key])) && data.retentionVerified && evaluation.requirements.every(item => isPass(item.calibration)) && revisions.every(key => evaluation.matrix[key].kind !== 'inconclusive') && ordinaryPass(data.normalTests) && isPass(probe) && featureResults.every(item => isPass(item.result)) && (evaluation.portable || evaluation.strictEligible), 'Claimed passing repair contradicts recorded tests, probe, feature checks or coverage.');
  return { ...data, probe, results, featureResults };
}

const badge = value => `<span class="badge ${value === 'pass' ? 'good' : value === 'fail' ? 'bad' : 'unknown'}">${escape(value === 'inconclusive' ? 'inconclusive' : value)}</span>`;
const pretty = value => escape(JSON.stringify(value, null, 2));
const observed = value => value.executions ? { evidence: value.evidence, executions: value.executions } : value.evidence;
function render(evaluation, repair, digest) {
  const [heading, tone, explanation] = classifications[evaluation.classification];
  const packageVersion = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;
  const refKeys = { base: 'baseRef', branchA: 'branchARef', branchB: 'branchBRef' };
  const revisionCards = revisions.map(key => `<article class="revision"><div class="row"><h3>${labels[key]}</h3>${badge(evaluation.matrix[key].kind)}</div><p class="ref">${escape(key === 'merged' ? 'Combined revision' : evaluation.source.refs[refKeys[key]])}</p><span class="small">Commit</span><code>${escape(evaluation.source.commits[key])}</code><span class="small">Recorded observations: ${evaluation.matrix[key].evidence.length} · ${evaluation.matrix[key].consistent ? 'consistent' : 'inconsistent'}</span></article>`).join('');
  const requirementRows = evaluation.requirements.map(item => `<tr><td><strong>${escape(item.id)}</strong><code>${escape(item.hash)}</code></td><td>${labels[item.origin]}</td><td>${badge(item.calibration.kind)}</td><td>${repair ? badge(repair.results.find(entry => entry.id === item.id).result.kind) : '<span class="small">Not provided</span>'}</td></tr>`).join('');
  const repairTitle = repair ? repair.passed ? 'Declared checks passed' : 'Correction not approved' : 'Correction not provided';
  const evidence = revisions.map(key => `<details><summary>${labels[key]} observations ${badge(evaluation.matrix[key].kind)}</summary><pre>${pretty(observed(evaluation.matrix[key]))}</pre></details>`).join('');
  const additional = evaluation.frozenChecks.filter(entry => entry.record.sourceType === 'legacy').map(entry => ({ ...entry, name: entry.record.source.replaceAll('\\', '/').split('/').at(-1), result: repair?.featureResults.find(result => result.key === entry.key)?.result }));
  const additionalSection = additional.length ? `<section><h2>Additional frozen checks</h2><p class="section-note">Legacy checks also constrain approval. They do not establish coverage for either branch origin.</p><div class="table-wrap"><table><thead><tr><th>Check</th><th>Frozen SHA-256</th><th>Correction</th></tr></thead><tbody>${additional.map(entry => `<tr><td>${escape(entry.name)}</td><td><code>${escape(entry.record.hash)}</code></td><td>${entry.result ? badge(entry.result.kind) : 'Not provided'}</td></tr>`).join('')}</tbody></table></div>${additional.map(entry => entry.result ? `<details><summary>Additional check: ${escape(entry.name)} ${badge(entry.result.kind)}</summary><pre>${pretty(observed(entry.result))}</pre></details>` : '').join('')}</section>` : '';
  const requirementEvidence = evaluation.requirements.map(entry => `<details><summary>Required check: ${escape(entry.id)}</summary><pre>${pretty({ calibration: observed(entry.calibration), ...(repair ? { correction: observed(repair.results.find(result => result.id === entry.id).result) } : {}) })}</pre></details>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>MergeWitness — ${escape(heading)}</title><style>
:root{--ink:#17332f;--muted:#526862;--paper:#f5f7f2;--line:#d7e0d7;--teal:#116a59;--good:#256447;--bad:#9b392d;--unknown:#665221}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}a{color:var(--teal)}a:focus-visible,summary:focus-visible{outline:3px solid #087b68;outline-offset:4px}.wrap{max-width:1180px;margin:auto;padding:0 28px}header{border-bottom:1px solid var(--line)}.nav{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-size:21px;font-weight:750;letter-spacing:-.8px}.brand span{color:var(--teal)}.eyebrow{font:700 11px/1.5 ui-monospace,monospace;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}main{padding:54px 0 36px}.intro{display:grid;grid-template-columns:1.8fr 1fr;gap:36px;align-items:start;margin-bottom:36px}h1{font-size:clamp(30px,4vw,48px);line-height:1.14;letter-spacing:-1.7px;margin:16px 0 18px;max-width:720px}h2{font-size:24px;letter-spacing:-.6px;line-height:1.3;margin:0 0 18px}h3{font-size:16px;margin:0}.lede{max-width:690px;color:var(--muted);font-size:18px}.status{border:1px solid var(--line);border-top:4px solid var(--teal);background:#fff;padding:24px;border-radius:12px}.status.bad{border-top-color:var(--bad)}.status.unknown{border-top-color:var(--unknown)}.status h2{font-size:23px;margin:12px 0}.status p{font-size:14px;color:var(--muted);margin-bottom:0}.row{display:flex;align-items:center;justify-content:space-between;gap:12px}.badge{display:inline-block;padding:3px 9px;border-radius:6px;line-height:1.6;font:600 11px/1.7 ui-monospace,monospace;text-transform:uppercase;white-space:nowrap}.good{background:#e6f1e8;color:var(--good)}.bad{background:#f9eae4;color:var(--bad)}.unknown{background:#f3edd9;color:var(--unknown)}.neutral{color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.revision{background:#fff;border:1px solid var(--line);border-radius:10px;padding:20px;min-width:0}.ref{font-size:14px;margin:13px 0;overflow-wrap:anywhere;min-height:44px}code{display:block;font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere;color:var(--muted)}.small{display:block;font-size:12px;color:var(--muted);margin-top:10px}section{margin-top:42px}.section-note{color:var(--muted);font-size:14px;margin:-6px 0 18px}.table-wrap{border:1px solid var(--line);border-radius:10px;background:#fff;overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}th{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:14px 18px;background:#eff3ed}td{padding:18px;border-top:1px solid var(--line);font-size:14px;min-width:115px}td:first-child{min-width:210px}td code{max-width:370px;margin-top:5px}details{border:1px solid var(--line);border-radius:8px;background:#fff;margin:10px 0}summary{cursor:pointer;padding:17px 20px;font-size:14px;font-weight:650}summary .badge{margin-left:8px}pre{font:13px/1.6 ui-monospace,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;max-height:480px;overflow:auto;margin:0;padding:4px 20px 22px;color:var(--muted)}.limits{padding:25px;border-left:3px solid #8ca494;background:#eaf0e7;border-radius:0 8px 8px 0}.limits p{font-size:14px;margin:10px 0;color:var(--muted)}.identity{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}.identity>div{min-width:0}.identity code{font-size:11px}footer{border-top:1px solid var(--line);padding:24px 0 36px;font-size:12px;color:var(--muted)}.skip{position:absolute;left:20px;top:-80px;background:white;padding:12px;z-index:2}.skip:focus{top:10px}@media(max-width:860px){.intro{grid-template-columns:1fr;gap:22px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.wrap{padding:0 18px}.nav{align-items:flex-start;padding:20px 0;flex-direction:column;gap:5px}main{padding-top:32px}.grid,.identity{grid-template-columns:1fr}.ref{min-height:0}.revision{padding:17px}section{margin-top:32px}h1{letter-spacing:-1px}.status{padding:20px}td,th{padding:13px}}
</style></head><body><a class="skip" href="#main">Skip to report</a><header><div class="wrap nav"><div class="brand">Merge<span>Witness</span></div><div class="eyebrow">Local report · Format v2 · ${escape(packageVersion)}</div></div></header><div class="wrap"><main id="main"><div class="intro"><div><div class="eyebrow">Recorded behavioral evidence</div><h1>${escape(heading)}</h1><p class="lede">${escape(explanation)}</p><a href="#observations">Inspect the operation observations ↓</a></div><aside class="status ${repair ? repair.passed ? '' : 'bad' : 'unknown'}"><div class="eyebrow">Correction / declared coverage</div><h2>${repairTitle}</h2><p>${repair ? repair.passed ? 'The report records passing verification against the frozen observation and the declared checks for both changes.' : 'The supplied verification does not approve this candidate. Inspect its probe, tests and feature checks below.' : 'This view contains an evaluation only. A verified correction must be supplied separately.'}</p></aside></div><section aria-labelledby="revisions-heading"><h2 id="revisions-heading">Four revisions. One observation.</h2><p class="section-note">Results read from the supplied report. Opening this page executes no repository code.</p><div class="grid">${revisionCards}</div></section><section aria-labelledby="requirements-heading"><h2 id="requirements-heading">Keep the necessary behaviors.</h2><p class="section-note">Each check is authored by the caller and calibrated on its declared change. These checks define the coverage shown here.</p>${requirementRows ? `<div class="table-wrap"><table><thead><tr><th>Frozen requirement</th><th>Origin</th><th>Calibration</th><th>Correction</th></tr></thead><tbody>${requirementRows}</tbody></table></div>` : '<div class="limits"><p>No feature requirements were declared. Feature retention is not verified.</p></div>'}</section>${additionalSection}<section id="observations" aria-labelledby="observations-heading"><h2 id="observations-heading">Inspect the recorded sequence.</h2><p class="section-note">Structured observations for each repetition, exactly as supplied in the JSON. Missing observations are not invented.</p>${evidence}${repair ? `<details><summary>Correction observation ${badge(repair.probe.kind)}</summary><pre>${pretty(observed(repair.probe))}</pre></details>` : ''}${requirementEvidence}<details><summary>Existing test results</summary><pre>${pretty({ revisions: evaluation.normalTests, ...(repair ? { correction: repair.normalTests } : {}) })}</pre></details></section><section class="limits" aria-labelledby="limits-heading"><h2 id="limits-heading">What this evidence covers.</h2><p>A passing recorded check does not certify every behavior, dependency or environment. Requirements and operation sequences are supplied by the caller. QuietClash and mumei overlap with parts of this approach.</p><p>This page reads supplied v2 JSON; it does not re-run verification or authenticate the report's author. The input pair was checked for matching identities, frozen checks and source tree${evaluation.portable && repair ? ', including the exact evaluation-file digest' : ''}. Keep the original JSON alongside this view. Review reports before sharing them.</p><div class="identity"><div><span class="eyebrow">Evaluation / verification</span><code>${escape(evaluation.evaluationId)}</code><code>${escape(repair?.verificationId ?? 'No verification supplied')}</code></div><div><span class="eyebrow">Evaluation file SHA-256</span><code>${escape(digest)}</code><span class="small">Runtime: ${escape(evaluation.runtime?.node ?? 'not recorded')} · ${escape(evaluation.runtime?.platform ?? 'not recorded')}</span></div></div></section></main><footer>MergeWitness ${escape(packageVersion)} · MIT · © 2026 Signal Foundry · Independent evolution of the IBM Bob competition prototype.</footer></div></body></html>\n`;
}

function readJson(path, name) {
  const bytes = readFileSync(resolve(path));
  try { return { bytes, data: JSON.parse(bytes.toString('utf8')) }; }
  catch { throw new Error(`Invalid JSON in ${name}.`); }
}

/** Generate a read-only offline view of existing v2 evidence, preserving its inputs. */
export function createReport({ evaluationPath, repairPath, out } = {}) {
  requireValue(present(evaluationPath) && present(out), 'report requires an evaluation JSON file and --out <directory>.');
  const input = readJson(evaluationPath, 'evaluation');
  const evaluation = normalizeEvaluation(input.data);
  const repair = repairPath ? normalizeRepair(readJson(repairPath, 'repair').data, evaluation, input.bytes) : undefined;
  const digest = createHash('sha256').update(input.bytes).digest('hex');
  const html = render(evaluation, repair, digest);
  const parent = resolve(out); mkdirSync(parent, { recursive: true });
  const outputDir = mkdtempSync(join(parent, 'report-'));
  const reportPath = join(outputDir, 'index.html');
  writeFileSync(reportPath, html, { flag: 'wx' });
  return { outputDir, reportPath, evaluationId: evaluation.evaluationId, ...(repair ? { verificationId: repair.verificationId } : {}) };
}

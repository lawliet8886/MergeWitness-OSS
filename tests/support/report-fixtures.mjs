// Literal canonical v2 contract, checked against the core producer and archived SDK reports.
export function canonicalObservation(kind = 'pass', evidence = { price: 100 }, repetitions = 2) {
  const payload = { status: kind, evidence };
  return { kind, consistent: true, runs: Array.from({ length: repetitions }, () => ({
    exitCode: 0, signal: null, error: null, timedOut: false,
    stdout: `${JSON.stringify(payload)}\n`, stderr: '', probe: { kind, payload: structuredClone(payload) },
  })) };
}
function frozen(id, origin, hash) {
  const source = `/checks/${id}.mjs`, path = `/frozen/${id}.mjs`;
  return { id, origin, sourceType: 'requirement', source, frozen: path, hash,
    manifest: [{ source, frozen: path, hash }], calibration: canonicalObservation() };
}
export function canonicalEvaluation() {
  const requirements = [frozen('tenant-pricing', 'branchA', 'a'.repeat(64)), frozen('sku-cache', 'branchB', 'b'.repeat(64))];
  const retentionCoverage = { branchA: true, branchB: true };
  const runtime = { node: 'v24.14.0', platform: 'win32', arch: 'x64' };
  return {
    version: 2, analysisId: 'analysis-one', evaluationId: 'evaluation-one', runtime,
    refs: { baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache' },
    commits: { base: '1'.repeat(40), branchA: '2'.repeat(40), branchB: '3'.repeat(40), merged: '4'.repeat(40) },
    trees: { base: '5'.repeat(40), branchA: '6'.repeat(40), branchB: '7'.repeat(40), merged: '8'.repeat(40) },
    merge: { clean: true },
    normalTests: Object.fromEntries(['base', 'branchA', 'branchB', 'merged'].map(key => [key, { exitCode: 0, signal: null, error: null, timedOut: false }])),
    probe: { version: 2, probeHash: 'f'.repeat(64), probePath: '/frozen/sequence.mjs',
      manifest: [{ source: '/checks/sequence.mjs', frozen: '/frozen/sequence.mjs', hash: 'f'.repeat(64) }],
      repetitions: 2, classification: 'interaction_witness',
      matrix: { base: canonicalObservation(), branchA: canonicalObservation(), branchB: canonicalObservation(), merged: canonicalObservation('fail', { expected: 100, observed: 90 }) },
      strictEligible: true, requirements: structuredClone(requirements), featureChecks: structuredClone(requirements),
      retentionCoverage: structuredClone(retentionCoverage), evaluationId: 'evaluation-one', runtime,
    },
    requirements, retentionCoverage,
  };
}
export function canonicalRepair(ev = canonicalEvaluation()) {
  const featureChecks = ev.probe.featureChecks.map(entry => ({ ...structuredClone(entry), result: canonicalObservation('pass', { price: 100 }, entry.sourceType === 'legacy' ? 1 : ev.probe.repetitions) }));
  return {
    version: 2, analysisId: ev.analysisId, evaluationId: ev.evaluationId, verificationId: 'verification-one', runtime: ev.runtime,
    sourceMergedCommit: ev.commits.merged, sourceMergedTree: ev.trees.merged, candidateHead: '0'.repeat(40), candidateTree: '9'.repeat(40),
    evaluationClassification: ev.probe.classification, frozenProbeHash: ev.probe.probeHash,
    normalTests: { exitCode: 0, signal: null, error: null, timedOut: false }, probe: canonicalObservation(),
    featureChecks, requirementResults: structuredClone(featureChecks.filter(entry => entry.sourceType === 'requirement')),
    retentionCoverage: { branchA: true, branchB: true }, retentionVerified: true, passed: true,
  };
}
export function addLegacy(ev) {
  const source = '/checks/legacy-extra.check.mjs', frozenPath = '/frozen/legacy-extra.check.mjs', hash = 'c'.repeat(64);
  ev.probe.featureChecks.push({ sourceType: 'legacy', source, frozen: frozenPath, hash,
    manifest: [{ source, frozen: frozenPath, hash }] });
}

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { basename, join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { dispose, evaluate, prepare, verifyRepair } from '../core/mergeWitness.mjs';

const generator = fileURLToPath(new URL('../../fixtures/create-fixtures.mjs', import.meta.url));
const interactionProbe = fileURLToPath(new URL('../bob-probes/tenant-cache.shared-fresh.probe.mjs', import.meta.url));
const pricingCheck = fileURLToPath(new URL('../bob-probes/tenant-pricing.check.mjs', import.meta.url));
const cacheCheck = fileURLToPath(new URL('../bob-probes/sku-cache.proxy.check.mjs', import.meta.url));
const repair = fileURLToPath(new URL('../bob-repairs/tenant-cache/catalog.fixed.js', import.meta.url));

function run(command, args, options) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: false, ...options });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${(result.stderr || result.stdout).trim()}`);
}
function portableEvaluation(evaluated) {
  return {
    version: 2, evaluationId: evaluated.report.evaluationId,
    runtime: evaluated.report.runtime,
    source: { refs: evaluated.report.refs, commits: evaluated.report.commits, trees: evaluated.report.trees },
    classification: evaluated.classification,
    merge: { clean: evaluated.report.merge.clean },
    probe: { sha256: evaluated.probeHash, files: evaluated.probeManifest.map(entry => ({ name: basename(entry.frozen), sha256: entry.hash })) },
    normalTests: Object.fromEntries(Object.entries(evaluated.normalTests).map(([key, value]) => [key, { exitCode: value.exitCode, signal: value.signal, timedOut: value.timedOut }])),
    matrix: Object.fromEntries(Object.entries(evaluated.matrix).map(([key, value]) => [key, portableObservation(value)])),
    requirements: evaluated.requirements.map(entry => ({ id: entry.id, origin: entry.origin, sha256: entry.hash, files: entry.manifest.map(file => ({ name: basename(file.frozen), sha256: file.hash })), calibration: portableObservation(entry.calibration) })),
  };
}
function portableObservation(result) {
  return { kind: result.kind, consistent: result.consistent, evidence: result.runs.map(run => run.probe.payload?.evidence ?? null) };
}
function portableRepair(verified) {
  return {
    version: 2, evaluationId: verified.evaluationId, verificationId: verified.verificationId, runtime: verified.runtime,
    passed: verified.passed, retentionVerified: verified.retentionVerified, retentionCoverage: verified.retentionCoverage,
    sourceMergedTree: verified.sourceMergedTree, candidateTree: verified.candidateTree, frozenProbeHash: verified.frozenProbeHash,
    normalTests: { exitCode: verified.normalTests.exitCode, signal: verified.normalTests.signal, timedOut: verified.normalTests.timedOut },
    probe: portableObservation(verified.probe),
    requirementResults: verified.requirementResults.map(entry => ({ id: entry.id, origin: entry.origin, sha256: entry.hash, result: portableObservation(entry.result) })),
  };
}
/** Runs a self-contained synthetic tenant-cache repair demonstration. */
export function runTenantCacheDemo({ out }) {
  if (!out) throw new Error('demo tenant-cache requires --out <directory>.');
  const parent = resolve(out); mkdirSync(parent, { recursive: true });
  const outputDir = join(parent, `tenant-cache-${randomUUID()}`); const runRoot = join(outputDir, 'run'); mkdirSync(runRoot, { recursive: true });
  let analysis;
  try {
    const historyRelative = join('fixtures', '.generated', 'tenant-cache-history');
    run(process.execPath, [generator, historyRelative], { cwd: runRoot });
    analysis = prepare({ repoPath: join(runRoot, historyRelative), baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache', protectedTestPaths: ['test'] });
    const evaluated = evaluate({ analysisId: analysis.analysisId, statePath: analysis.statePath, probePath: interactionProbe, repetitions: 2, requirements: [{ id: 'tenant-pricing', origin: 'branchA', checkPath: pricingCheck, dependencies: [] }, { id: 'sku-cache', origin: 'branchB', checkPath: cacheCheck, dependencies: [] }] });
    copyFileSync(repair, join(analysis.paths.merged, 'src', 'catalog.js'));
    run('git', ['add', '--', 'src/catalog.js'], { cwd: analysis.paths.merged });
    run('git', ['-c', 'user.name=MergeWitness Demo', '-c', 'user.email=demo@example.invalid', 'commit', '-m', 'Repair tenant-aware cache'], { cwd: analysis.paths.merged });
    const verified = verifyRepair({ analysisId: analysis.analysisId, statePath: analysis.statePath, candidatePath: analysis.paths.merged });
    const evaluationBytes = `${JSON.stringify(portableEvaluation(evaluated), null, 2)}\n`;
    const repairReport = { ...portableRepair(verified), evaluationPublicReportSha256: createHash('sha256').update(evaluationBytes).digest('hex') };
    writeFileSync(join(outputDir, 'evaluation.public.json'), evaluationBytes);
    writeFileSync(join(outputDir, 'repair.public.json'), `${JSON.stringify(repairReport, null, 2)}\n`);
    return { outputDir, passed: verified.passed, retentionVerified: verified.retentionVerified, retentionCoverage: verified.retentionCoverage };
  } finally { if (analysis) dispose({ analysisId: analysis.analysisId, statePath: analysis.statePath }); }
}

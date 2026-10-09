import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { observe } from '../fixtures/cases/fastq-drain-check.mjs';

const frozenDrainExpected=JSON.parse(readFileSync(new URL('../fixtures/cases/fastq-drain-expected.json',import.meta.url),'utf8'));
const completeRetention=()=>({outcome:'completed',...structuredClone(frozenDrainExpected.retentionA),queueContract:structuredClone(frozenDrainExpected.retentionB)});
function suppliedObservation(mode, value, exitCode=0) {
  const out=mkdtempSync(join(tmpdir(),'mw-drain-envelope-'));
  const library=join(out,'library.cjs');
  try {
    // A reviewed local fixture emits one chosen worker envelope before queue execution.
    writeFileSync(library,`console.log(${JSON.stringify(JSON.stringify(value))}); process.exit(${exitCode});\n`);
    return observe(mode,library);
  } finally {
    const path=resolve(out);
    assert.ok(path.startsWith(resolve(tmpdir())+sep)&&path.includes('mw-drain-envelope-'));
    rmSync(path,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
}

for(const mode of ['incident','retentionA','retentionB']) {
  test(`normalizer returns structured inconclusive for JSON null in ${mode}`,()=>{
    assert.equal(suppliedObservation(mode,null).status,'inconclusive');
  });
}
test('normalizer retentionA rejects an incomplete queue contract before projection',()=>{
  const observed=completeRetention(); observed.queueContract={};
  assert.equal(suppliedObservation('retentionA',observed).status,'inconclusive');
});
test('normalizer retentionB rejects incomplete timing sections before projection',()=>{
  const observed=completeRetention();
  for(const key of Object.keys(frozenDrainExpected.retentionA)) observed[key]={};
  assert.equal(suppliedObservation('retentionB',observed).status,'inconclusive');
});
test('normalizer rejects nonobject envelopes and wrongly typed full-envelope fields',()=>{
  for(const [mode,value] of [['incident',[]],['retentionA',42],['retentionB','completed']]) {
    assert.equal(suppliedObservation(mode,value).status,'inconclusive');
  }
  const missing=completeRetention(); delete missing.before.running;
  const wrongType=completeRetention(); wrongType.queueContract.workerContexts=['true'];
  const queuedType=completeRetention(); queuedType.middle.queued=[42];
  assert.equal(suppliedObservation('retentionB',missing).status,'inconclusive');
  assert.equal(suppliedObservation('retentionA',wrongType).status,'inconclusive');
  assert.equal(suppliedObservation('retentionB',queuedType).status,'inconclusive');
});
test('normalizer treats observed array content and cardinality violations as semantic failures',()=>{
  const wrongFifo=completeRetention(); wrongFifo.queueContract.started=['B','A','C'];
  const shortResults=completeRetention(); shortResults.queueContract.values=['A-result'];
  const shortContexts=completeRetention(); shortContexts.queueContract.workerContexts=[];
  for(const observed of [wrongFifo,shortResults,shortContexts]) assert.equal(suppliedObservation('retentionB',observed).status,'fail');
});
test('normalizer preserves complete stable incident and retention evidence',()=>{
  const diagnostics={beforeReleaseSettled:0,elapsedMs:1,node:'diagnostic-runtime'};
  const completed={...frozenDrainExpected.intended,...diagnostics};
  const old={...frozenDrainExpected.expectedOld,...diagnostics,errorMessage:'diagnostic message'};
  const positive=suppliedObservation('incident',completed);
  const negative=suppliedObservation('incident',old,1);
  assert.equal(positive.status,'pass'); assert.deepEqual(positive.evidence,frozenDrainExpected.intended);
  assert.equal(negative.status,'fail'); assert.deepEqual(negative.evidence,frozenDrainExpected.expectedOld);
  assert.equal(suppliedObservation('retentionA',completeRetention()).status,'pass');
  assert.equal(suppliedObservation('retentionB',completeRetention()).status,'pass');
  for(const key of ['beforeReleaseSettled','idle','elapsedMs','node','value']) {
    const partial={...completed}; delete partial[key];
    assert.equal(suppliedObservation('incident',partial).status,'inconclusive');
  }
});
test('normalizer keeps independent semantic retention projections after envelope validation',()=>{
  const wrongFifo=completeRetention(); wrongFifo.queueContract.started=['B','A','C'];
  assert.equal(suppliedObservation('retentionA',wrongFifo).status,'pass');
  assert.equal(suppliedObservation('retentionB',wrongFifo).status,'fail');
  const immediate=completeRetention(); immediate.before.settled=2; immediate.middle.settled=2;
  immediate.laterBefore.laterSettled=true;
  assert.equal(suppliedObservation('retentionA',immediate).status,'fail');
  assert.equal(suppliedObservation('retentionB',immediate).status,'pass');
});

test('unknown, partial and malformed worker observations remain inconclusive', () => {
  const out=mkdtempSync(join(tmpdir(),'mw-drain-unknown-'));
  const library=join(out,'library.cjs');
  try {
    writeFileSync(library,'module.exports = {};\n');
    assert.equal(observe('incident',library).status,'inconclusive');
    writeFileSync(library,"console.log('unstructured output'); module.exports = {};\n");
    assert.equal(observe('incident',library).status,'inconclusive');
    writeFileSync(library,"module.exports.promise = () => ({ push: value => Promise.resolve(value), drained: () => Promise.resolve(), idle: () => undefined });\n");
    assert.equal(observe('incident',library).status,'inconclusive');
  } finally {
    const path=resolve(out);
    assert.ok(path.startsWith(resolve(tmpdir())+sep)&&path.includes('mw-drain-unknown-'));
    rmSync(path,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
});

test('bounded concurrent drain replay accepts pinned PR and rejects immediate-wait false repair', { timeout: 240_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), 'mw-drain-acceptance-'));
  const env = { ...process.env, GIT_CONFIG_COUNT:'1', GIT_CONFIG_KEY_0:'core.autocrlf', GIT_CONFIG_VALUE_0:'true' };
  // node:test marks its descendants; inheriting this would suppress ordinary test discovery.
  delete env.NODE_TEST_CONTEXT;
  try {
    const result = spawnSync(process.execPath, ['scripts/run-corpus.mjs','--case','public-fastq-drain-waiters','--repetitions','1','--out',out], {
      env, shell:false, encoding:'utf8', timeout:210_000, maxBuffer:4*1024*1024,
    });
    assert.equal(result.status,0,result.stderr);
    const summary=JSON.parse(result.stdout), row=summary.cases[0];
    assert.equal(summary.passed,true);
    assert.equal(row.classification,'preexisting_violation');
    assert.deepEqual(row.matrix,{base:'fail',branchA:'fail',branchB:'fail',merged:'fail'});
    assert.equal(row.repairPassed,true);
    assert.equal(row.retentionVerified,true);
    assert.equal(row.falseCandidateRejected,true);
    assert.equal(row.sourceIntegrity.verified,true);
    for(const snapshot of [...row.sourceIntegrity.snapshots,row.sourceIntegrity.candidate,row.falseCandidateIntegrity]) {
      assert.ok(snapshot.files.every(file=>file.actualSha256===file.expectedSha256));
    }
    assert.deepEqual(row.observedRepetitions,{base:1,branchA:1,branchB:1,merged:1});
    assert.equal(summary.cleanup.length,1);
    const cleanup=summary.cleanup[0];
    assert.equal(cleanup.disposed,true);
    assert.equal(existsSync(cleanup.statePath),false);
    for(const report of cleanup.reports) assert.equal(createHash('sha256').update(readFileSync(report.path)).digest('hex'),report.sha256);
    const evidence=join(resolve(summary.reportPath,'..'),'evidence','public-fastq-drain-waiters');
    const evaluation=JSON.parse(readFileSync(join(evidence,'evaluation.private.json'),'utf8'));
    const positive=JSON.parse(readFileSync(join(evidence,'repair.private.json'),'utf8'));
    const falseRepair=JSON.parse(readFileSync(join(evidence,'false-repair.private.json'),'utf8'));
    for(const normal of [...Object.values(evaluation.normalTests),positive.normalTests,falseRepair.normalTests]) {
      assert.equal(normal.exitCode,0);
      assert.match(normal.stdout,/ordinary queue callback and configured context/);
      assert.match(normal.stdout,/ordinary promise queue values and errors/);
      assert.match(normal.stdout,/(?:#|ℹ) pass 2(?:\s|$)/);
    }
    assert.equal(falseRepair.probe.kind,'pass');
    assert.equal(falseRepair.passed,false);
    assert.equal(falseRepair.retentionCoverage.branchA,false);
    assert.equal(falseRepair.retentionCoverage.branchB,true);
    assert.deepEqual(positive.requirementResults.map(check=>check.result.kind),['pass','pass']);
  } finally {
    const path=resolve(out);
    assert.ok(path.startsWith(resolve(tmpdir())+sep)&&path.includes('mw-drain-acceptance-'));
    rmSync(path,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
});

test('new drain admission preserves previous vendor/oracle admission and all thirteen labels', () => {
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  const admission=JSON.parse(readFileSync('fixtures/cases/fastq-drain-admission.json','utf8'));
  const current=JSON.parse(readFileSync('fixtures/cases/vendor-manifest.json','utf8'));
  assert.equal(hash(readFileSync('fixtures/cases/vendor-manifest.json')),admission.previousAdmissionSha256);
  const manifest=JSON.parse(readFileSync('fixtures/cases/manifest.json','utf8'));
  assert.equal(hash(JSON.stringify(manifest.cases.slice(0,12))),admission.previousCasesSha256);
  assert.equal(manifest.cases.length,13);
  assert.equal(manifest.cases[12].heldOut,false);
  for(const source of [...current.sources,...admission.sources]) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'),source.sha256,source.path);
});

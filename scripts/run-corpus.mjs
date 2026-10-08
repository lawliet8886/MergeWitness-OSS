#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { prepare, evaluate, verifyRepair, dispose } from '../src/core/mergeWitness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const repetitions = Number(option('--repetitions', 3));
const manifest = JSON.parse(readFileSync(join(root, 'fixtures/cases/manifest.json'), 'utf8'));
const selected = option('--case');
const cases = selected ? manifest.cases.filter((entry) => entry.id === selected) : manifest.cases;
if (!cases.length || !Number.isInteger(repetitions) || repetitions < 1 || repetitions > 10) throw new Error('Unknown case or invalid repetitions.');
const out = resolve(option('--out', join(root, 'artifacts/corpus')));
mkdirSync(out, { recursive: true });
const runRoot = mkdtempSync(join(out, 'run-'));
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const invoke = (command, argv, cwd) => {
  const result = spawnSync(command, argv, { cwd, encoding: 'utf8', shell: false, timeout: 60_000 });
  if (result.status !== 0 || result.signal || result.error) throw new Error(`${command} failed: ${result.error?.message ?? result.stderr}`);
  return result.stdout.trim();
};
const git = (cwd, ...argv) => invoke('git', argv, cwd);
const put = (directory, name, content) => { const path = join(directory, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); return path; };
const commit = (directory, message) => {
  git(directory, 'add', '.');
  git(directory, '-c', 'user.name=MergeWitness Corpus', '-c', 'user.email=corpus@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', message);
};
const analyses = [];
const retained = [];
const resultRows = [];
let generated;
let tenant;

function syntheticHistories() {
  if (!generated) {
    invoke(process.execPath, [join(root, 'fixtures/create-fixtures.mjs')], runRoot);
    generated = join(runRoot, 'fixtures/.generated');
  }
  return generated;
}

function publishedBytes(directory, name, files) {
  const records = Object.entries(files).map(([path, bytes]) => ({path,
    expectedSha256:createHash('sha256').update(bytes).digest('hex'),actualSha256:hash(join(directory,path))}));
  const changed = records.filter(file => file.actualSha256 !== file.expectedSha256);
  if(changed.length) throw new Error(`Published source bytes changed in ${name}: ${JSON.stringify(changed)}`);
  return {name,files:records};
}

function analyze(repoPath, refs, probePath, requirements, dependencies = [], count = repetitions, publishedSources = null) {
  const prepared = prepare({ repoPath, baseRef: refs[0], branchARef: refs[1], branchBRef: refs[2] });
  analyses.push(prepared);
  const sourceIntegrity = publishedSources ? {snapshots:['base','branchA','branchB','merged'].map(name=>publishedBytes(prepared.paths[name],name,publishedSources))} : null;
  const evaluated = evaluate({ analysisId: prepared.analysisId, probePath, probeDependencies: dependencies, requirements, repetitions: count });
  if(publishedSources) for(const name of ['base','branchA','branchB','merged']) publishedBytes(prepared.paths[name],name,publishedSources);
  return { prepared, evaluated, sourceIntegrity };
}

function repaired(context, name, files, publishedSources = null) {
  const { prepared } = context;
  const candidate = join(dirname(prepared.paths.merged), name);
  git(prepared.paths.merged, 'worktree', 'add', '--detach', candidate, prepared.commits.merged);
  for (const [path, contents] of Object.entries(files)) put(candidate, path, contents);
  commit(candidate, `Corpus candidate ${name}`);
  if(publishedSources) publishedBytes(candidate,'candidate-before-verification',publishedSources);
  const verification=verifyRepair({ analysisId: prepared.analysisId, candidatePath: candidate });
  if(publishedSources) context.sourceIntegrity={...context.sourceIntegrity,candidate:publishedBytes(candidate,'candidate-after-verification',publishedSources),verified:true};
  return verification;
}

function tenantContext() {
  if (!tenant) {
    const probes = join(root, 'src/bob-probes');
    tenant = analyze(join(syntheticHistories(), 'tenant-cache-history'), ['base', 'tenant-pricing', 'sku-cache'], join(probes, 'tenant-cache.shared-fresh.probe.mjs'), [
      { id: 'tenant-pricing', origin: 'branchA', checkPath: join(probes, 'tenant-pricing.check.mjs'), dependencies: [] },
      { id: 'sku-cache', origin: 'branchB', checkPath: join(probes, 'sku-cache.proxy.check.mjs'), dependencies: [] },
    ]);
  }
  return tenant;
}

function runTenant(entry) {
  const context = tenantContext();
  let files;
  if (entry.mutation === 'remove-cache') files = { 'src/catalog.js': git(context.prepared.paths.branchA, 'show', 'HEAD:src/catalog.js') + '\n' };
  else if (entry.mutation === 'remove-pricing') files = { 'src/pricing.js': git(context.prepared.paths.base, 'show', 'HEAD:src/pricing.js') + '\n' };
  else files = { 'src/catalog.js': readFileSync(join(root, 'src/bob-repairs/tenant-cache/catalog.fixed.js'), 'utf8') };
  const verification = repaired(context, entry.id, files);
  return { context, verification };
}

function controlContext(entry) {
  const directory = join(runRoot, entry.id);
  mkdirSync(directory);
  git(directory, 'init', '-b', 'base');
  put(directory, 'package.json', '{"type":"module"}\n');
  put(directory, 'src/value.mjs', 'export function value(input) { return input; }\n');
  put(directory, 'test/value.test.mjs', "import test from 'node:test'; import assert from 'node:assert/strict'; import {value} from '../src/value.mjs'; test('preserves value',()=>assert.equal(value(7),7));\n");
  commit(directory, 'base value');
  git(directory, 'checkout', '-b', 'a');
  if (entry.variant === 'refactor') put(directory, 'src/value.mjs', 'export const value = (input) => input;\n');
  else put(directory, 'src/feature-a.mjs', 'export const featureA = () => 11;\n');
  commit(directory, 'change A');
  git(directory, 'checkout', 'base'); git(directory, 'checkout', '-b', 'b');
  put(directory, 'src/feature-b.mjs', 'export const featureB = () => 22;\n'); commit(directory, 'change B');
  const checks = join(runRoot, 'checks', entry.id);
  const probe = put(checks, 'probe.mjs', entry.variant === 'unobservable' ? "console.log('no structured observation');\n" : "import {pathToFileURL} from 'node:url'; import {join} from 'node:path'; const {value}=await import(pathToFileURL(join(process.cwd(),'src/value.mjs')).href); console.log(JSON.stringify({status:value(7)===7?'pass':'fail',evidence:{observed:value(7)}}));\n");
  const a = put(checks, 'a.mjs', entry.variant === 'refactor' ? "import {pathToFileURL} from 'node:url'; import {join} from 'node:path'; const {value}=await import(pathToFileURL(join(process.cwd(),'src/value.mjs')).href); console.log(JSON.stringify({status:value(7)===7?'pass':'fail'}));\n" : "import {pathToFileURL} from 'node:url'; import {join} from 'node:path'; const {featureA}=await import(pathToFileURL(join(process.cwd(),'src/feature-a.mjs')).href); console.log(JSON.stringify({status:featureA()===11?'pass':'fail'}));\n");
  const b = put(checks, 'b.mjs', "import {pathToFileURL} from 'node:url'; import {join} from 'node:path'; const {featureB}=await import(pathToFileURL(join(process.cwd(),'src/feature-b.mjs')).href); console.log(JSON.stringify({status:featureB()===22?'pass':'fail'}));\n");
  return analyze(directory, ['base', 'a', 'b'], probe, [{ id: 'feature-a', origin: 'branchA', checkPath: a }, { id: 'feature-b', origin: 'branchB', checkPath: b }]);
}

function publicContext(entry) {
  if (entry.library) return publicLibraryContext(entry);
  const directory = join(runRoot, entry.id);
  mkdirSync(directory);
  git(directory, 'init', '-b', 'before');
  put(directory, '.gitattributes', '* -text\n');
  put(directory, 'package.json', '{"type":"module"}\n');
  put(directory, 'src/dataloader.cjs', readFileSync(join(root, 'fixtures/cases/vendor/dataloader-1.4.0/index.cjs')));
  put(directory, 'LICENSE.dataloader', readFileSync(join(root, 'fixtures/cases/vendor/dataloader-1.4.0/LICENSE')));
  put(directory, 'test/load.test.mjs', "import test from 'node:test'; import assert from 'node:assert/strict'; import DataLoader from '../src/dataloader.cjs'; test('loads values',async()=>{ const loader=new DataLoader(async keys=>keys); assert.deepEqual(await loader.loadMany([1,2]),[1,2]); });\n");
  commit(directory, 'DataLoader 1.4.0 published module in minimal harness');
  const checks = join(runRoot, 'checks', entry.id);
  const helper = put(checks, 'observations.mjs', readFileSync(join(root, 'fixtures/cases/dataloader-observations.mjs')));
  const prefix = "import {pathToFileURL} from 'node:url'; import {join} from 'node:path'; import {observeCachedBatching,observePrimedError,observeLoads,observeMemoization} from './observations.mjs'; const {default:DataLoader}=await import(pathToFileURL(join(process.cwd(),'src/dataloader.cjs')).href);\n";
  const observation = entry.id.endsWith('cached-batching') ? "const evidence=await observeCachedBatching(DataLoader); const pass=evidence.beforeDispatch.cachedResolved===false && evidence.beforeDispatch.freshResolved===false && JSON.stringify(evidence.values)==='[1,2]' && JSON.stringify(evidence.batches)==='[[2]]';" : "const evidence=await observePrimedError(DataLoader); const pass=evidence.primingUnhandledCount===0 && evidence.loadedUnhandledCount===1;";
  const probe = put(checks, 'probe.mjs', prefix + observation + " console.log(JSON.stringify({status:pass?'pass':'fail',evidence}));\n");
  const loadCheck = put(checks, 'loads.mjs', prefix + "const evidence=await observeLoads(DataLoader); console.log(JSON.stringify({status:JSON.stringify(evidence.values)==='[2,4]'?'pass':'fail',evidence}));\n");
  const memoCheck = put(checks, 'memo.mjs', prefix + "const evidence=await observeMemoization(DataLoader); console.log(JSON.stringify({status:evidence.first===1&&evidence.second===1&&evidence.reads===1?'pass':'fail',evidence}));\n");
  const context = analyze(directory, ['before','before','before'], probe, [
    { id:'loads',origin:'branchA',checkPath:loadCheck,dependencies:[helper] },
    { id:'memoization',origin:'branchB',checkPath:memoCheck,dependencies:[helper] },
  ], [helper], repetitions, {'src/dataloader.cjs':readFileSync(join(root,'fixtures/cases/vendor/dataloader-1.4.0/index.cjs')),'LICENSE.dataloader':readFileSync(join(root,'fixtures/cases/vendor/dataloader-1.4.0/LICENSE'))});
  const fixedFiles={ 'src/dataloader.cjs': readFileSync(join(root, 'fixtures/cases/vendor/dataloader-2.0.0/index.cjs')), 'LICENSE.dataloader': readFileSync(join(root, 'fixtures/cases/vendor/dataloader-2.0.0/LICENSE')) };
  const verification = repaired(context, 'after', fixedFiles, fixedFiles);
  return { context, verification };
}

function publicLibraryContext(entry) {
  const directory = join(runRoot, entry.id);
  mkdirSync(directory);
  git(directory, 'init', '-b', 'before');
  put(directory, '.gitattributes', '* -text\n');
  put(directory, 'package.json', '{"type":"module"}\n');
  const isLRU = entry.library === 'lru-cache';
  const oldVersion = isLRU ? '7.4.0' : '1.16.0';
  const newVersion = isLRU ? '7.4.1' : '1.17.0';
  const vendor = join(root, 'fixtures/cases/vendor');
  const bytes = (version, name) => readFileSync(join(vendor, `${entry.library}-${version}`, name));
  put(directory, 'src/library.cjs', bytes(oldVersion, 'index.cjs'));
  put(directory, 'LICENSE.library', bytes(oldVersion, 'LICENSE'));
  const oldFiles={'src/library.cjs':bytes(oldVersion,'index.cjs'),'LICENSE.library':bytes(oldVersion,'LICENSE')};
  if (!isLRU) {
    for (const name of ['reusify.js', 'package.json', 'LICENSE']) {
      const path=`src/node_modules/reusify/${name}`;
      oldFiles[path]=readFileSync(join(vendor,'reusify-1.0.4',name));
      put(directory,path,oldFiles[path]);
    }
  }
  const ordinary = isLRU
    ? "import Library from '../src/library.cjs'; test('ordinary cache set/get',()=>{ const cache=new Library({max:2}); cache.set('key',42); assert.equal(cache.get('key'),42); });"
    : "import Library from '../src/library.cjs'; test('ordinary queue callback',()=>{ let answer; const queue=Library((value,done)=>done(null,value*2),1); queue.push(21,(error,value)=>{assert.equal(error,null);answer=value;}); assert.equal(answer,42); });";
  put(directory, 'test/library.test.mjs', "import test from 'node:test'; import assert from 'node:assert/strict'; " + ordinary + '\n');
  commit(directory, `${entry.library} ${oldVersion} published bytes in a minimal harness`);
  const checks = join(runRoot, 'checks', entry.id);
  const helperName = isLRU ? 'observations.mjs' : 'observations.cjs';
  const helper = put(checks, helperName, readFileSync(join(root, `fixtures/cases/${isLRU ? 'lru-observations.mjs' : 'fastq-observations.cjs'}`)));
  const oracle = put(checks, 'expected.json', readFileSync(join(root, 'fixtures/cases', entry.oracle)));
  const common = "import {join} from 'node:path'; import {readFileSync} from 'node:fs'; import {isDeepStrictEqual} from 'node:util'; const expected=JSON.parse(readFileSync(new URL('./expected.json',import.meta.url),'utf8'));\n";
  let probeBody, checkABody, checkBBody;
  if (isLRU) {
    const setup = common + "import {loadWithClock,observeStaleClear,observeLRU,observeIdentityAndClear} from './observations.mjs'; const {LRU,advance}=loadWithClock(join(process.cwd(),'src/library.cjs'));\n";
    probeBody = setup + "const evidence=observeStaleClear(LRU,advance); const pass=isDeepStrictEqual(evidence,expected.intended);";
    checkABody = setup + "const evidence=observeLRU(LRU); const pass=isDeepStrictEqual(evidence,{first:1,bAbsent:true,a:1,c:3,size:2});";
    checkBBody = setup + "const evidence=observeIdentityAndClear(LRU); const pass=isDeepStrictEqual(evidence,{firstIdentity:true,secondIdentity:true,events:[['first','x','set'],['second','x','delete']],size:0});";
  } else {
    const setup = common + "import {pathToFileURL} from 'node:url'; import observations from './observations.cjs'; const {default:Library}=await import(pathToFileURL(join(process.cwd(),'src/library.cjs')).href);\n";
    const observation = name => setup + `const evidence=observations.${name}(Library); const pass=isDeepStrictEqual(evidence,expected.checks.${name}.intended);`;
    probeBody = observation('active_pause_resume_regression');
    checkABody = observation('retained_fifo_serial_completion');
    checkBBody = observation('retained_callback_success_error');
  }
  const emit = " console.log(JSON.stringify({status:pass?'pass':'fail',evidence}));\n";
  const probe = put(checks, 'probe.mjs', probeBody + emit);
  const a = put(checks, 'a.mjs', checkABody + emit);
  const b = put(checks, 'b.mjs', checkBBody + emit);
  const context = analyze(directory, ['before', 'before', 'before'], probe, [
    {id:isLRU?'lru-eviction':'fifo-completion',origin:'branchA',checkPath:a,dependencies:[helper,oracle]},
    {id:isLRU?'identity-clear':'callback-contract',origin:'branchB',checkPath:b,dependencies:[helper,oracle]},
  ], [helper,oracle], repetitions, oldFiles);
  const fixedFiles={'src/library.cjs':bytes(newVersion,'index.cjs'),'LICENSE.library':bytes(newVersion,'LICENSE')};
  const verification = repaired(context, 'after', fixedFiles, {...oldFiles,...fixedFiles});
  return {context,verification};
}

try {
  for (const entry of cases) {
    const start = performance.now();
    let context, verification;
    if (entry.kind === 'tenant') ({ context, verification } = runTenant(entry));
    else if (entry.kind === 'public') ({ context, verification } = publicContext(entry));
    else if (entry.kind === 'control') context = controlContext(entry);
    else {
      const probes = join(root, 'src/bob-probes');
      context = analyze(join(syntheticHistories(), 'priority-cursor-history'), ['base','priority-order','id-cursor'], join(probes,'priority-cursor.probe.mjs'), [
        {id:'priority-order',origin:'branchA',checkPath:join(probes,'priority-order.check.mjs')},
        {id:'id-cursor',origin:'branchB',checkPath:join(probes,'id-cursor.check.mjs')},
      ]);
    }
    const classification = context.evaluated.classification;
    const repairPassed = verification?.passed ?? null;
    const matched = classification === entry.label && (entry.expectedRepair == null || repairPassed === entry.expectedRepair);
    const row = { caseId:entry.id,provenance:entry.provenance,heldOut:entry.heldOut??false,classification,expectedClassification:entry.label,repairPassed,expectedRepair:entry.expectedRepair??null,retentionVerified:verification?.retentionVerified??false,matched,durationMs:Math.round(performance.now()-start),matrix:Object.fromEntries(Object.entries(context.evaluated.matrix).map(([key,value])=>[key,value.kind])),observedRepetitions:Object.fromEntries(Object.entries(context.evaluated.matrix).map(([key,value])=>[key,value.runs.length])),sourceIntegrity:context.sourceIntegrity };
    resultRows.push(row);
    // Durable copied reports remain after disposing the private analysis.
    const evidenceDir = join(runRoot,'evidence',entry.id); mkdirSync(evidenceDir,{recursive:true});
    copyFileSync(context.evaluated.reportPath,join(evidenceDir,'evaluation.private.json'));
    if(verification) copyFileSync(verification.reportPath,join(evidenceDir,'repair.private.json'));
    retained.push({caseId:entry.id,probeHash:context.evaluated.probeHash});
  }
} finally {
  for (const analysis of analyses) dispose({analysisId:analysis.analysisId,statePath:analysis.statePath});
}
const summary = { version:2,generatedAt:new Date().toISOString(),runtime:{node:process.version,platform:process.platform},passed:resultRows.every(entry=>entry.matched),corpusSha256:hash(join(root,'fixtures/cases/manifest.json')),cases:resultRows,retained,limitation:manifest.scope,reportPath:join(runRoot,'summary.json') };
writeFileSync(summary.reportPath,JSON.stringify(summary,null,2)+'\n');
process.stdout.write(JSON.stringify(summary,null,2)+'\n');
process.exitCode = summary.passed ? 0 : 1;

import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, win32 } from 'node:path';
import { __testing, dispose, evaluate, prepare, verifyRepair } from '../src/core/mergeWitness.mjs';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';

function invoke(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function put(root, name, content) { const file=join(root,name); mkdirSync(dirname(file),{recursive:true}); writeFileSync(file,content); return file; }
function commit(root) { invoke(root,'add','.'); invoke(root,'-c','user.name=MergeWitness Review','-c','user.email=review@example.invalid','-c','commit.gpgsign=false','commit','-m','review fixture'); }
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'mergewitness-review-'));
  const repo=join(root,'repository'); mkdirSync(repo); invoke(repo,'init','-b','base');
  put(repo,'package.json','{"type":"module"}\n');
  put(repo,'src/value.mjs','export const value=()=>1;\n');
  put(repo,'harness/oracle.mjs',"import assert from 'node:assert/strict'; export const check=actual=>assert.equal(actual,1);\n");
  put(repo,'test/value.test.mjs',"import test from 'node:test'; import {value} from '../src/value.mjs'; import {check} from '../harness/oracle.mjs'; test('value',()=>check(value()));\n");
  commit(repo);
  const probe=put(root,'checks/probe.mjs',"console.log(JSON.stringify({status:'pass',evidence:1}));\n");
  const requirements=[{id:'a',origin:'branchA',checkPath:probe},{id:'b',origin:'branchB',checkPath:probe}];
  return {root,repo,probe,requirements};
}
function prepareFixture(f, extra={}) { return prepare({repoPath:f.repo,baseRef:'base',branchARef:'base',branchBRef:'base',...extra}); }
function freeze(a,f) { return evaluate({analysisId:a.analysisId,probePath:f.probe,requirements:f.requirements,repetitions:1}); }
function clean(a,f) { if(a) dispose({analysisId:a.analysisId,statePath:a.statePath}); rmSync(f.root,{recursive:true,force:true,maxRetries:3,retryDelay:100}); }

for(const directory of ['harness/','./harness/./']) {
  test(`declared directory ${directory} rejects a weakened oracle`,()=>{
    const f=fixture(); let a;
    try {
      a=prepareFixture(f,{protectedTestPaths:[directory]}); freeze(a,f);
      put(a.paths.merged,'src/value.mjs','export const value=()=>2;\n');
      put(a.paths.merged,'harness/oracle.mjs','export const check=()=>{};\n'); commit(a.paths.merged);
      assert.throws(()=>verifyRepair({analysisId:a.analysisId,candidatePath:a.paths.merged}),/protected test.*oracle/);
    } finally { clean(a,f); }
  });
}

test('legacy state cannot acquire v2 attestation through re-evaluation',()=>{
  const f=fixture(); let a;
  try {
    a=prepareFixture(f); const original=readFileSync(a.statePath);
    for(const version of [undefined,1]) {
      const legacy=JSON.parse(original); if(version===undefined) delete legacy.version; else legacy.version=version;
      legacy.normalTests.base={exitCode:0,timedOut:true,stdout:'',stderr:''};
      const bytes=Buffer.from(JSON.stringify(legacy)); writeFileSync(a.statePath,bytes);
      assert.throws(()=>evaluate({analysisId:a.analysisId,statePath:a.statePath,probePath:f.probe,requirements:f.requirements,repetitions:1}),/version.*prepare|prepare.*version/i);
      assert.deepEqual(readFileSync(a.statePath),bytes);
    }
    writeFileSync(a.statePath,original);
  } finally { if(a) { const state=JSON.parse(readFileSync(a.statePath)); state.version=2; writeFileSync(a.statePath,JSON.stringify(state)); } clean(a,f); }
});

test('Windows containment rejects a candidate on another drive and a sibling directory',()=>{
  assert.equal(__testing.isStrictDescendant?.('C:\\Temp\\clone','D:\\candidate',win32),false);
  assert.equal(__testing.isStrictDescendant?.('C:\\Temp\\clone','C:\\Temp\\clone-extra',win32),false);
  assert.equal(__testing.isStrictDescendant?.('C:\\Temp\\clone','C:\\Temp\\clone\\snapshots\\candidate',win32),true);
});

test('candidate junction cannot point outside the disposable analysis',()=>{
  const f=fixture(); let a;
  try {
    a=prepareFixture(f); freeze(a,f);
    const outside=join(f.root,'external'); invoke(f.root,'clone','--no-hardlinks',a.paths.merged,outside);
    const link=join(dirname(a.paths.merged),'linked-outside'); symlinkSync(outside,link,'junction');
    assert.throws(()=>verifyRepair({analysisId:a.analysisId,candidatePath:link}),/inside this analysis clone|worktree.*analysis/i);
  } finally { clean(a,f); }
});

test('Node checks use the calling executable even when PATH has no Node',()=>{
  const root=mkdtempSync(join(tmpdir(),'mergewitness-runtime-binding-'));
  const key=Object.keys(process.env).find(name=>name.toLowerCase()==='path')??'PATH'; const previous=process.env[key];
  try {
    const probe=put(root,'probe.mjs',"console.log(JSON.stringify({status:'pass',evidence:process.version}));\n");
    put(root,'test/runtime.test.mjs',"import test from 'node:test'; test('runtime executes',()=>{});\n");
    process.env[key]='';
    const ordinary=__testing.testSnapshot?.(root,['node','--test']);
    const observed=__testing.probeSnapshot?.(root,probe,1);
    assert.equal(ordinary?.exitCode,0); assert.equal(ordinary.command[0],process.execPath);
    assert.equal(observed?.kind,'pass'); assert.equal(observed.runs[0].command[0],process.execPath);
    assert.equal(observed.runs[0].probe.payload.evidence,process.version);
  } finally { if(previous===undefined) delete process.env[key]; else process.env[key]=previous; rmSync(root,{recursive:true,force:true,maxRetries:3,retryDelay:100}); }
});

test('state persistence failure does not register an orphaned analysis',()=>{
  const f=fixture(); const before=new Set(__testing.analyses.keys()); const original=fs.writeFileSync;
  try {
    fs.writeFileSync=(file,...args)=>{ if(String(file).includes('analysis-state.json')) throw new Error('forced state persistence failure'); return original(file,...args); };
    syncBuiltinESMExports();
    assert.throws(()=>prepareFixture(f),/forced state persistence failure/);
    assert.deepEqual(new Set(__testing.analyses.keys()),before);
  } finally {
    fs.writeFileSync=original; syncBuiltinESMExports();
    for(const id of __testing.analyses.keys()) if(!before.has(id)) __testing.analyses.delete(id);
    rmSync(f.root,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
});

test('abnormal ordinary execution is inconclusive rather than an assertion failure',()=>{
  const matrix=Object.fromEntries(['base','branchA','branchB','merged'].map(key=>[key,{kind:'pass'}]));
  const analysis={normalTests:{base:{exitCode:null,signal:'SIGTERM',error:null,timedOut:false}}};
  assert.equal(__testing.classify?.(analysis,matrix),'inconclusive');
});

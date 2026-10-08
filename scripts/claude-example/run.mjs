#!/usr/bin/env node
// Explicit opt-in controller for a trusted synthetic example; never runs during npm install/tests.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { assertReplaySeal, assertWebProvenance, extractCandidate, subscriptionArgs, withTerminalCleanup } from './evidence.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const {positionals,values} = parseArgs({allowPositionals:true,options:{out:{type:'string'},run:{type:'string'},package:{type:'string'},'acknowledge-subscription':{type:'boolean'},'reviewed-candidate':{type:'boolean'},'local-controller':{type:'boolean'}}});
const phase = positionals[0];
assert.ok(['setup','local-prepare','negative-control','propose','verify','replay'].includes(phase), 'Choose setup, local-prepare, negative-control, propose, verify or replay.');
const json = file => JSON.parse(readFileSync(file,'utf8'));
const put = (file,data) => writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const writeOnce = (file,bytes) => writeFileSync(file,bytes,{flag:'wx'});
const runRoot = resolve(values.run ?? values.out ?? '');
assert.ok((values.run || values.out) && runRoot.startsWith(root+ '\\artifacts\\') || ((values.run || values.out) && runRoot.startsWith(root+'/artifacts/')), 'Use a new ignored artifacts directory inside this checkout.');
const commandLog = join(runRoot,'commands.jsonl');
function local(command,args,cwd=runRoot) {
  const result = spawnSync(command,args,{cwd,encoding:'utf8',shell:false,windowsHide:true,maxBuffer:16*1024*1024});
  writeFileSync(commandLog,JSON.stringify({time:new Date().toISOString(),command,args,cwd,exitCode:result.status,stdout:result.stdout,stderr:result.stderr})+'\n',{flag:'a'});
  if(result.error) throw result.error;
  assert.equal(result.status,0,`${command} failed: ${(result.stderr||result.stdout).slice(-1200)}`);
  return result.stdout;
}
const hashFiles = dir => Object.fromEntries(readdirSync(dir).filter(name=>name.endsWith('.mjs')).map(name=>[name,sha(join(dir,name))]));
const scopeFile = join(runRoot,'scope.json');
let scope;
function configAndPrompt(stage,allowed,prompt) {
  scope.phase=stage;
  scope.receipts=join(runRoot,`${stage}-receipts`);
  mkdirSync(scope.receipts,{recursive:true});
  put(scopeFile,scope);
  put(join(runRoot,`${stage}-mcp.json`),{mcpServers:{mergewitness:{command:process.execPath,args:[join(root,'scripts/claude-example/observe-mcp.mjs'),scopeFile]}}});
  writeOnce(join(runRoot,`${stage}-prompt.txt`),prompt);
  return allowed.map(name=>`mcp__mergewitness__${name}`).join(',');
}
async function claude(stage,allowed,schema) {
  assert.equal(values['acknowledge-subscription'],true,'Model execution requires explicit --acknowledge-subscription.');
  const authRaw = spawnSync('claude',['auth','status'],{encoding:'utf8',shell:false});
  const auth = JSON.parse(authRaw.stdout);
  assert.ok(authRaw.status===0 && auth.loggedIn && auth.authMethod==='claude.ai','Use an existing authenticated Claude subscription, not API billing.');
  const env={...process.env};
  for(const name of ['ANTHROPIC_API_KEY','ANTHROPIC_AUTH_TOKEN','ANTHROPIC_BASE_URL','ANTHROPIC_CUSTOM_HEADERS','CLAUDE_CODE_USE_BEDROCK','CLAUDE_CODE_USE_VERTEX','CLAUDE_CODE_USE_FOUNDRY']) delete env[name];
  env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC='1';
  const args=subscriptionArgs(join(runRoot,`${stage}-mcp.json`),allowed,schema);
  put(join(runRoot,`${stage}-invocation.json`),{clientVersion:spawnSync('claude',['--version'],{encoding:'utf8'}).stdout.trim(),authMethod:auth.authMethod,subscriptionType:auth.subscriptionType,apiKeyRouteRemoved:true,globalSettingsChanged:false,args,startedAt:new Date().toISOString()});
  console.log(JSON.stringify({phase:stage,status:'RUNNING',runRoot}));
  const child=spawn('claude',args,{cwd:scope.workspace,env,stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});
  let stdout='',stderr='';
  child.stdout.on('data',bytes=>{stdout+=bytes;writeFileSync(join(runRoot,`${stage}-stdout.json`),bytes,{flag:'a'});});
  child.stderr.on('data',bytes=>{stderr+=bytes;writeFileSync(join(runRoot,`${stage}-stderr.log`),bytes,{flag:'a'});});
  const timer=setTimeout(()=>child.kill(),600000);
  child.stdin.end(readFileSync(join(runRoot,`${stage}-prompt.txt`)));
  const exitCode=await new Promise((accept,reject)=>{child.once('error',reject);child.once('exit',accept);});
  clearTimeout(timer);
  put(join(runRoot,`${stage}-completion.json`),{exitCode,finishedAt:new Date().toISOString(),stdoutSha256:sha(join(runRoot,`${stage}-stdout.json`)),stderrTail:stderr.slice(-1500)});
  assert.equal(exitCode,0,`Claude ended without success; inspect retained ${stage} output.`);
  return JSON.parse(stdout);
}
const receipts = stage => readdirSync(join(runRoot,`${stage}-receipts`)).filter(name=>/^\d+-/.test(name)).map(name=>json(join(runRoot,`${stage}-receipts`,name)));
function snapshotCatalog(path,source,label) {
  writeFileSync(join(path,'src/catalog.js'),source);
  local(process.execPath,['--check',join(path,'src/catalog.js')]);
  local('git',['add','--','src/catalog.js'],path);
  local('git',['-c','user.name=MergeWitness Example','-c','user.email=example@example.invalid','commit','-m',label],path);
  assert.equal(local('git',['status','--porcelain'],path).trim(),'','Candidate must be committed and clean.');
}
function negativeSnapshot(prepared) {
  const path=join(dirname(prepared.paths.merged),'negative-control');
  const source=local('git',['show','base:src/catalog.js'],scope.fixture);
  if(!existsSync(path)) {
    local('git',['worktree','add','--detach',path,prepared.merge.commit],prepared.paths.merged);
    snapshotCatalog(path,source,'Negative control removes caching');
  } else {
    assert.equal(readFileSync(join(path,'src/catalog.js'),'utf8'),source,'Existing control source must match the declared no-cache control.');
    assert.equal(local('git',['status','--porcelain'],path).trim(),'','Existing control must be clean.');
  }
  return path;
}

if(phase==='setup') {
  assert.ok(!existsSync(runRoot),'Setup never overwrites a previous run.');
  mkdirSync(runRoot,{recursive:true});
  const packagePath=resolve(values.package ?? join(root,'artifacts/releases/0.3.0/candidate-002/mergewitness-core-0.3.0.tgz'));
  assert.equal(sha(packagePath),'848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688');
  const workspace=join(runRoot,'workspace');mkdirSync(workspace);
  const npmCli=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
  assert.ok(existsSync(npmCli),'Use the npm CLI associated with this Node installation.');
  local(process.execPath,[npmCli,'install','--offline','--ignore-scripts','--no-audit','--no-fund','--prefix',join(workspace,'tools'),packagePath]);
  const packageRoot=join(workspace,'tools/node_modules/mergewitness-core');
  local(process.execPath,[join(packageRoot,'fixtures/create-fixtures.mjs'),'fixtures/.generated/tenant-cache-history'],workspace);
  const checksDir=join(workspace,'checks');mkdirSync(checksDir);
  const sourcePaths={probe:'tenant-cache.shared-fresh.probe.mjs',pricing:'tenant-pricing.check.mjs',cache:'sku-cache.proxy.check.mjs'};
  const checks={};
  for(const [key,name] of Object.entries(sourcePaths)) {checks[key]=join(checksDir,name);copyFileSync(join(packageRoot,'src/bob-probes',name),checks[key]);}
  const fixture=join(workspace,'fixtures/.generated/tenant-cache-history');
  scope={phase:'proposal',workspace,fixture,checks,server:join(packageRoot,'src/mcp/server.mjs'),prepared:null,candidates:[],receipts:join(runRoot,'proposal-receipts')};
  put(scopeFile,scope);
  put(join(runRoot,'input-seal.json'),{packageSha256:sha(packagePath),coreSha256:sha(join(packageRoot,'src/core/mergeWitness.mjs')),checks:hashFiles(checksDir),fixtureHead:local('git',['rev-parse','HEAD'],fixture).trim(),fixtureStatus:local('git',['status','--porcelain'],fixture),setupAt:new Date().toISOString()});
  console.log(JSON.stringify({phase,status:'READY',runRoot,version:json(join(packageRoot,'package.json')).version}));
} else {
  scope=json(scopeFile);
  if(phase==='local-prepare') {
    assert.ok(!scope.prepared,'An analysis is already prepared.');
    const api=await import(pathToFileURL(join(scope.workspace,'tools/node_modules/mergewitness-core/src/core/mergeWitness.mjs')));
    const prepared=api.prepare({repoPath:scope.fixture,baseRef:'base',branchARef:'tenant-pricing',branchBRef:'sku-cache',protectedTestPaths:['test']});
    scope.prepared=prepared;scope.client='claude-web-with-local-api-controller';put(scopeFile,scope);
    const evaluated=api.evaluate({analysisId:prepared.analysisId,statePath:prepared.statePath,probePath:scope.checks.probe,repetitions:2,requirements:[{id:'tenant-pricing',origin:'branchA',checkPath:scope.checks.pricing,dependencies:[]},{id:'sku-cache',origin:'branchB',checkPath:scope.checks.cache,dependencies:[]}]});
    put(join(runRoot,'local-preparation.json'),prepared);
    put(join(runRoot,'evaluation.json'),evaluated.report);
    const prompt=`You are helping propose a candidate repair for MergeWitness, an MIT-licensed local tool. This is a synthetic case, not customer code. The local controller already prepared Base/A/B/Combined revisions, ran the existing tests and froze the sequence and both feature checks before this request. It recorded classification ${evaluated.classification}. The sequence calls alpha then beta for the same notebook SKU in a shared catalog; beta must match its result from a fresh catalog (100). The combined observation was 90 instead of 100. Alpha's configured price is 90. Keep tenant-specific prices and repeated-lookup caching, including getSourceCalls. Modify ONLY src/catalog.js. Do not change the production pricing module, tests, probe, requirements or expected results. No supplied historical correction is included. The local controller will inspect, apply and commit your proposed module, then run MergeWitness verification and a fresh replay. Passing covers only these declared checks.\n\nActual combined src/catalog.js:\n${readFileSync(join(prepared.paths.merged,'src/catalog.js'),'utf8')}\nActual combined src/pricing.js:\n${readFileSync(join(prepared.paths.merged,'src/pricing.js'),'utf8')}\nFrozen interaction probe:\n${readFileSync(scope.checks.probe,'utf8')}\nFrozen tenant-pricing requirement (calibrated in A):\n${readFileSync(scope.checks.pricing,'utf8')}\nFrozen cache requirement (calibrated in B):\n${readFileSync(scope.checks.cache,'utf8')}\n\nReply with a short explanation and one JavaScript code block containing the complete candidate src/catalog.js. Do not claim to have run this local tool or independently verified the correction.`;
    writeOnce(join(runRoot,'context-for-claude-web.txt'),prompt);
    assert.equal(evaluated.classification,'interaction_witness');
    console.log(JSON.stringify({phase,status:'READY_FOR_WEB_PROPOSAL',runRoot,classification:evaluated.classification,modelCalls:0,frozenBeforeModel:true}));
  } else if(phase==='negative-control') {
    assert.ok(scope.prepared?.paths?.merged,'Prepare before checking a control.');
    const api=await import(pathToFileURL(join(scope.workspace,'tools/node_modules/mergewitness-core/src/core/mergeWitness.mjs')));
    const candidatePath=negativeSnapshot(scope.prepared);
    const result=api.verifyRepair({analysisId:scope.prepared.analysisId,statePath:scope.prepared.statePath,candidatePath});
    put(join(runRoot,'negative.json'),result);
    assert.equal(result.passed,false);
    assert.equal(result.retentionVerified,false);
    assert.equal(result.probe.kind,'pass');
    assert.equal(result.requirementResults.find(r=>r.id==='tenant-pricing').result.kind,'pass');
    assert.equal(result.requirementResults.find(r=>r.id==='sku-cache').result.kind,'fail');
    assert.deepEqual(hashFiles(dirname(scope.checks.probe)),json(join(runRoot,'input-seal.json')).checks);
    console.log(JSON.stringify({phase,status:'PASS',runRoot,control:'provided-no-cache-control',modelCalls:0,repairPassed:false,pricing:'pass',cache:'fail',probe:'pass',checksUnchanged:true}));
  } else if(phase==='propose') {
    const catalog=local('git',['show','sku-cache:src/catalog.js'],scope.fixture);
    const pricing=local('git',['show','tenant-pricing:src/pricing.js'],scope.fixture);
    const prompt=`This is an explicitly authorized, trusted synthetic local MergeWitness integration example. Use only the four MCP tools, not shell/edit/network tools. Do not dispose yet. First call prepare with ${JSON.stringify({repoPath:scope.fixture,baseRef:'base',branchARef:'tenant-pricing',branchBRef:'sku-cache',protectedTestPaths:['test']})}. Then use the returned analysisId and statePath to call evaluate with probePath ${JSON.stringify(scope.checks.probe)}, repetitions 2 and requirements ${JSON.stringify([{id:'tenant-pricing',origin:'branchA',checkPath:scope.checks.pricing,dependencies:[]},{id:'sku-cache',origin:'branchB',checkPath:scope.checks.cache,dependencies:[]}])}. Wait for actual results before proposing a candidate. The clean combined source uses this catalog module from branch B:\n${catalog}\nAnd this pricing module from branch A:\n${pricing}\nThe existing operation sequence observes beta after alpha in a shared catalog versus beta in a fresh catalog (expected 100, alpha override 90). Keep tenant-specific pricing, repeated-lookup caching, createCatalog/getPrice/getSourceCalls interfaces, ordinary tests and both frozen requirements. Propose only the full source of src/catalog.js. No provided historical repair is included. Your proposal will be reviewed/applied/committed by a separate local controller, then verified. Return catalogSource and explanation in the required structured output. Passing these checks will not establish arbitrary repair correctness.`;
    const allowed=configAndPrompt('proposal',['prepare','evaluate'],prompt);
    const output=await claude('proposal',allowed,{type:'object',required:['catalogSource','explanation'],properties:{catalogSource:{type:'string'},explanation:{type:'string'}},additionalProperties:false});
    const candidate=extractCandidate(output);
    writeOnce(join(runRoot,'model-catalog.js'),candidate.catalogSource);
    writeOnce(join(runRoot,'model-explanation.txt'),candidate.explanation+'\n');
    console.log(JSON.stringify({phase,status:'CANDIDATE_AWAITING_LOCAL_REVIEW',runRoot,sourceSha256:sha(join(runRoot,'model-catalog.js')),models:Object.keys(output.modelUsage ?? {})}));
  } else if(phase==='verify') {
    assert.equal(values['reviewed-candidate'],true,'Inspect the entire candidate before --reviewed-candidate.');
    const prepared=scope.prepared;
    assert.ok(prepared?.paths?.merged,'A recorded preparation is necessary.');
    const api=await import(pathToFileURL(join(scope.workspace,'tools/node_modules/mergewitness-core/src/core/mergeWitness.mjs')));
    let negativeResult,repaired,disposed,candidateSourceSha256;
    await withTerminalCleanup(async () => {
    if(!values['local-controller']) {
      const evaluation=receipts('proposal').find(row=>row.request.params.name==='evaluate').data;
      put(join(runRoot,'evaluation.json'),evaluation.report);
    } else {
      assert.equal(scope.client,'claude-web-with-local-api-controller');
      const origin=json(join(runRoot,'provider-source.json'));
      assertWebProvenance(origin,readFileSync(join(runRoot,'model-catalog.js'),'utf8'),readFileSync(join(runRoot,'claude-response.md'),'utf8'));
    }
    const negative=negativeSnapshot(prepared);
    snapshotCatalog(prepared.paths.merged,readFileSync(join(runRoot,'model-catalog.js'),'utf8'),'Apply the reviewed Claude proposal');
    writeOnce(join(runRoot,'candidate.patch'),local('git',['diff',`${prepared.merge.commit}..HEAD`,'--','src/catalog.js'],prepared.paths.merged));
    local('git',['bundle','create',join(runRoot,'candidate.bundle'),'HEAD'],prepared.paths.merged);
    candidateSourceSha256=sha(join(prepared.paths.merged,'src/catalog.js'));
    assert.equal(candidateSourceSha256,sha(join(runRoot,'model-catalog.js')));
    scope.candidates=[negative,prepared.paths.merged];
    if(values['local-controller']) {
      negativeResult=api.verifyRepair({analysisId:prepared.analysisId,statePath:prepared.statePath,candidatePath:negative});
      put(join(runRoot,'negative.json'),negativeResult);
      repaired=api.verifyRepair({analysisId:prepared.analysisId,statePath:prepared.statePath,candidatePath:prepared.paths.merged});
      put(join(runRoot,'repair.json'),repaired);
    } else {
      const prompt=`This is the verification phase of the reviewed synthetic example. The local controller applied and committed the original model proposal unchanged. Call verifyRepair sequentially for negative control ${JSON.stringify(negative)} and actual Claude candidate ${JSON.stringify(prepared.paths.merged)}, using analysisId ${JSON.stringify(prepared.analysisId)} and statePath ${JSON.stringify(prepared.statePath)} in each call. The negative control deliberately removes caching: record its rejection. Read actual candidate results; do not claim PASS for errors, timeouts, missing coverage or failed checks. Finally call dispose with that same analysisId/statePath. Return negativePassed, candidatePassed, retentionVerified and a short factual summary in the required structured output. Only the frozen declared checks are covered, not arbitrary code correctness. Do not call prepare/evaluate in this phase.`;
      const allowed=configAndPrompt('verify',['verifyRepair','dispose'],prompt);
      await claude('verify',allowed,{type:'object',required:['negativePassed','candidatePassed','retentionVerified','summary'],properties:{negativePassed:{type:'boolean'},candidatePassed:{type:'boolean'},retentionVerified:{type:'boolean'},summary:{type:'string'}},additionalProperties:false});
      const operations=receipts('verify');
      const repairs=operations.filter(row=>row.request.params.name==='verifyRepair');
      negativeResult=repairs.find(row=>resolve(row.request.params.arguments.candidatePath)===resolve(negative)).data;
      repaired=repairs.find(row=>resolve(row.request.params.arguments.candidatePath)===resolve(prepared.paths.merged)).data;
      disposed=operations.find(row=>row.request.params.name==='dispose')?.data;
    }
    put(join(runRoot,'negative.json'),negativeResult);
    put(join(runRoot,'repair.json'),repaired);
    assert.equal(negativeResult.passed,false);
    assert.equal(negativeResult.retentionVerified,false);
    assert.equal(repaired.passed,true);
    assert.equal(repaired.retentionVerified,true);
    }, () => {
      if(existsSync(prepared.paths.merged)) disposed=api.dispose({analysisId:prepared.analysisId,statePath:prepared.statePath});
      else disposed ??= {disposed:true,alreadyAbsent:true};
      put(join(runRoot,'local-disposal.json'),disposed);
      assert.equal(disposed.disposed,true);
      assert.equal(existsSync(prepared.paths.merged),false);
      return disposed;
    }, receipt => put(join(runRoot,'verify-lifecycle.json'),receipt));
    writeOnce(join(runRoot,'verification-seal.json'),JSON.stringify({status:'PASS',reviewed:true,client:scope.client ?? 'claude-code',candidateSourceSha256,repairReportSha256:sha(join(runRoot,'repair.json')),responseEvidenceSha256:values['local-controller'] ? sha(join(runRoot,'claude-response.md')) : null},null,2)+'\n');
    console.log(JSON.stringify({phase,status:'PASS',runRoot,negativePassed:false,candidatePassed:true,retentionVerified:true,candidateSourceSha256,cloneDisposed:true}));
  } else if(phase==='replay') {
    assert.ok(existsSync(join(runRoot,'verification-seal.json')),'A successful prior verification seal is required before replay.');
    const seal=json(join(runRoot,'verification-seal.json'));
    const source=readFileSync(join(runRoot,'model-catalog.js'),'utf8');
    assertReplaySeal(seal,source);
    assert.equal(seal.repairReportSha256,sha(join(runRoot,'repair.json')),'Use the previously verified repair receipt.');
    if(scope.client==='claude-web-with-local-api-controller') {
      assertWebProvenance(json(join(runRoot,'provider-source.json')),source,readFileSync(join(runRoot,'claude-response.md'),'utf8'));
      assert.equal(seal.responseEvidenceSha256,sha(join(runRoot,'claude-response.md')),'Use the original forwarded response.');
    }
    assert.ok(!existsSync(join(runRoot,'replay-evaluation.json')),'Replay never overwrites an earlier replay; use a fresh run.');
    const packageRoot=join(scope.workspace,'tools/node_modules/mergewitness-core');
    const api=await import(pathToFileURL(join(packageRoot,'src/core/mergeWitness.mjs')));
    let prepared;
    try {
      prepared=api.prepare({repoPath:scope.fixture,baseRef:'base',branchARef:'tenant-pricing',branchBRef:'sku-cache',protectedTestPaths:['test']});
      const evaluated=api.evaluate({analysisId:prepared.analysisId,statePath:prepared.statePath,probePath:scope.checks.probe,repetitions:2,requirements:[{id:'tenant-pricing',origin:'branchA',checkPath:scope.checks.pricing,dependencies:[]},{id:'sku-cache',origin:'branchB',checkPath:scope.checks.cache,dependencies:[]}]});
      snapshotCatalog(prepared.paths.merged,source,'Replay the recorded Claude proposal');
      const repaired=api.verifyRepair({analysisId:prepared.analysisId,statePath:prepared.statePath,candidatePath:prepared.paths.merged});
      put(join(runRoot,'replay-evaluation.json'),evaluated.report);
      put(join(runRoot,'replay-repair.json'),repaired);
      assert.equal(evaluated.classification,'interaction_witness');
      assert.equal(repaired.passed,true);assert.equal(repaired.retentionVerified,true);
      assert.deepEqual(hashFiles(dirname(scope.checks.probe)),json(join(runRoot,'input-seal.json')).checks);
      assert.equal(local('git',['status','--porcelain'],scope.fixture),'');
      console.log(JSON.stringify({phase,status:'PASS',runRoot,checkSourcesUnchanged:true,fixtureUnchanged:true,modelGeneratedAgain:false}));
    } finally {if(prepared) put(join(runRoot,'replay-disposal.json'),api.dispose({analysisId:prepared.analysisId,statePath:prepared.statePath}));}
  }
}

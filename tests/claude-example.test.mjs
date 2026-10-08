import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const lab = await import('../scripts/claude-example/evidence.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const scope = {
  phase: 'proposal', fixture: '/lab/fixture', checks: {probe: '/lab/checks/probe.mjs', pricing: '/lab/checks/pricing.mjs', cache: '/lab/checks/cache.mjs'},
  prepared: {analysisId: 'case-1', statePath: '/lab/private/state.json'}, candidates: ['/lab/private/negative', '/lab/private/candidate'],
};
const call = (name, args) => ({method: 'tools/call', params: {name, arguments: args}});

test('rejects a preparation outside the explicitly selected fixture', () => {
  assert.equal(typeof lab.assertScopedCall, 'function');
  assert.throws(() => lab.assertScopedCall(call('prepare', {repoPath: '/another/repo', baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache'}), {...scope,prepared:null}), /declared fixture/);
  assert.doesNotThrow(() => lab.assertScopedCall(call('prepare', {repoPath: '/lab/fixture', baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache', protectedTestPaths: ['test']}), {...scope,prepared:null}));
  assert.throws(() => lab.assertScopedCall(call('prepare', {}), scope), /already been prepared/);
});

test('replay requires a successful reviewed seal and rejects changed source', () => {
  assert.equal(typeof lab.assertReplaySeal,'function');
  const source='export const value = 1;\n';
  const seal={status:'PASS',reviewed:true,candidateSourceSha256:createHash('sha256').update(source).digest('hex')};
  assert.doesNotThrow(()=>lab.assertReplaySeal(seal,source));
  assert.throws(()=>lab.assertReplaySeal(null,source),/verification/);
  assert.throws(()=>lab.assertReplaySeal({...seal,status:'FAIL'},source),/verification/);
  assert.throws(()=>lab.assertReplaySeal(seal,source+'// changed\n'),/reviewed source/);
});

test('terminal application and client failures retain the original error and run cleanup', async () => {
  assert.equal(typeof lab.withTerminalCleanup,'function');
  for(const message of ['syntax/application failed','client failed']) {
    let cleanups=0,receipt;
    await assert.rejects(lab.withTerminalCleanup(()=>{throw new Error(message);},()=>{cleanups++;return {disposed:true};},r=>{receipt=r;}),new RegExp(message));
    assert.equal(cleanups,1);assert.equal(receipt.operationSucceeded,false);
    assert.equal(receipt.originalError,message);assert.equal(receipt.disposal.disposed,true);
  }
  let receipt;
  await assert.rejects(lab.withTerminalCleanup(()=>{throw new Error('original failure');},()=>{throw new Error('cleanup failure');},r=>{receipt=r;}),error=>error instanceof AggregateError && error.errors.map(e=>e.message).join(',')==='original failure,cleanup failure');
  assert.equal(receipt.originalError,'original failure');assert.equal(receipt.cleanupError,'cleanup failure');
});
test('rejects substituted probe, requirement origin and repetition count', () => {
  assert.equal(typeof lab.assertScopedCall, 'function');
  const args = {analysisId:'case-1', statePath:'/lab/private/state.json', probePath:'/lab/checks/probe.mjs', repetitions:2, requirements:[{id:'tenant-pricing',origin:'branchA',checkPath:'/lab/checks/pricing.mjs',dependencies:[]},{id:'sku-cache',origin:'branchB',checkPath:'/lab/checks/cache.mjs',dependencies:[]}]};
  assert.doesNotThrow(() => lab.assertScopedCall(call('evaluate', args), scope));
  for (const changed of [{...args, probePath:'/elsewhere/probe.mjs'}, {...args,repetitions:1}, {...args, requirements:[{...args.requirements[0],origin:'branchB'},args.requirements[1]]}]) {
    assert.throws(() => lab.assertScopedCall(call('evaluate', changed), scope), /frozen|repetitions|requirements/);
  }
});
test('rejects verification outside the current candidate and early disposal', () => {
  assert.equal(typeof lab.assertScopedCall, 'function');
  const verify = {...scope, phase:'verify'};
  assert.throws(() => lab.assertScopedCall(call('verifyRepair',{analysisId:'case-1',statePath:'/lab/private/state.json',candidatePath:'/other'}),verify), /candidate/);
  assert.doesNotThrow(() => lab.assertScopedCall(call('verifyRepair',{analysisId:'case-1',statePath:'/lab/private/state.json',candidatePath:'/lab/private/candidate'}),verify));
  assert.throws(() => lab.assertScopedCall(call('dispose',{analysisId:'case-1'}),scope), /phase/);
});
test('reads the actual structured model candidate and rejects missing code', () => {
  assert.equal(typeof lab.extractCandidate, 'function');
  assert.equal(lab.extractCandidate({structured_output:{catalogSource:'export const value = 1;\n', explanation:'Example'}}).catalogSource, 'export const value = 1;\n');
  assert.throws(() => lab.extractCandidate({structured_output:{explanation:'No candidate'}}), /candidate/);
  assert.throws(() => lab.extractCandidate({is_error:true, structured_output:{catalogSource:'export const value = 1;'}}), /error/);
});

test('subscription invocation retains saved OAuth while restricting session customizations', () => {
  assert.equal(typeof lab.subscriptionArgs, 'function');
  const args = lab.subscriptionArgs('/lab/mcp.json','mcp__mergewitness__prepare',{type:'object'});
  assert.equal(args.includes('--bare'),false);
  assert.equal(args.includes('--dangerously-skip-permissions'),false);
  assert.equal(args[args.indexOf('--tools')+1],'');
  assert.equal(args[args.indexOf('--strict-mcp-config')+1],'--mcp-config');
  assert.equal(JSON.parse(args[args.indexOf('--settings')+1]).disableAllHooks,true);
});

test('web provenance binds the retained response and exact reviewed source', () => {
  assert.equal(typeof lab.assertWebProvenance, 'function');
  const source = 'export const value = 1;\n';
  const response = 'A proposed module.\n```javascript\n' + source + '```\nNot executed.';
  const hash = text => createHash('sha256').update(text).digest('hex');
  const origin = {client:'claude.ai web',candidateSourceSha256:hash(source),responseEvidenceSha256:hash(response)};
  assert.doesNotThrow(() => lab.assertWebProvenance(origin, source, response));
  assert.throws(() => lab.assertWebProvenance(origin, source, response + ' changed'), /response/);
  assert.throws(() => lab.assertWebProvenance(origin, source + '// changed\n', response), /candidate/);
  const differentResponse = response.replace('value = 1','value = 2');
  assert.throws(() => lab.assertWebProvenance({...origin,responseEvidenceSha256:hash(differentResponse)}, source, differentResponse), /source/);
});

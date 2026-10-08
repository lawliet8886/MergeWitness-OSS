import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const samePath = (left, right) => typeof left === 'string' && resolve(left) === resolve(right);

/** Restricts this example's model calls, not the public MergeWitness API. */
export function assertScopedCall(request, scope) {
  if (request.method !== 'tools/call') return;
  const {name, arguments: args = {}} = request.params ?? {};
  const allowed = scope.phase === 'proposal' ? ['prepare', 'evaluate'] : ['verifyRepair', 'dispose'];
  assert.ok(allowed.includes(name), `Tool ${name} is not allowed in this phase.`);
  if (name === 'prepare') {
    assert.ok(!scope.prepared, 'The fixture has already been prepared in this session.');
    assert.ok(samePath(args.repoPath, scope.fixture), 'prepare must use the declared fixture.');
    assert.deepEqual([args.baseRef,args.branchARef,args.branchBRef], ['base','tenant-pricing','sku-cache']);
    assert.deepEqual(args.protectedTestPaths, ['test']);
    if (args.testCommand) assert.deepEqual(args.testCommand, ['node','--test']);
    return;
  }
  assert.equal(args.analysisId, scope.prepared?.analysisId, 'Use the current analysisId.');
  assert.ok(samePath(args.statePath, scope.prepared.statePath), 'Use the recorded private statePath.');
  if (name === 'evaluate') {
    assert.ok(samePath(args.probePath,scope.checks.probe), 'Use the frozen probe source.');
    assert.equal(args.repetitions, 2, 'Use exactly two repetitions.');
    assert.ok(!args.probeDependencies?.length && !args.featureCheckPaths?.length, 'No substituted frozen check dependencies.');
    assert.equal(args.requirements?.length, 2, 'Both frozen requirements are necessary.');
    const byId = new Map(args.requirements.map(item => [item.id,item]));
    for (const [id,origin,path] of [['tenant-pricing','branchA',scope.checks.pricing],['sku-cache','branchB',scope.checks.cache]]) {
      const entry = byId.get(id);
      assert.ok(entry && entry.origin === origin && samePath(entry.checkPath,path) && !entry.dependencies?.length, 'Use the declared frozen requirements and origins.');
    }
  } else if (name === 'verifyRepair') {
    assert.ok(scope.candidates.some(path => samePath(args.candidatePath,path)), 'Use only a reviewed candidate from this analysis.');
  }
}

export function extractCandidate(output) {
  assert.ok(output && !output.is_error, 'Claude returned an error; no candidate is accepted.');
  const candidate = output.structured_output;
  assert.ok(candidate && typeof candidate.catalogSource === 'string' && candidate.catalogSource.trim().length > 0 && candidate.catalogSource.length <= 16000, 'A bounded structured model candidate is required.');
  assert.ok(!candidate.catalogSource.trim().startsWith('```'), 'The candidate must contain source, not a Markdown fence.');
  return {catalogSource:candidate.catalogSource, explanation:typeof candidate.explanation === 'string' ? candidate.explanation : ''};
}

/** Binds operator-forwarded evidence; it does not authenticate provider identity. */
export function assertWebProvenance(origin, candidateSource, responseEvidence) {
  const hash = text => createHash('sha256').update(text).digest('hex');
  assert.equal(origin.client, 'claude.ai web');
  assert.equal(origin.candidateSourceSha256, hash(candidateSource), 'The candidate hash must match the reviewed source.');
  assert.equal(origin.responseEvidenceSha256, hash(responseEvidence), 'The response hash must match the retained response.');
  const blocks = [...responseEvidence.matchAll(/```(?:javascript|js)\r?\n([\s\S]*?)\r?\n```/g)];
  assert.equal(blocks.length, 1, 'Retain one unambiguous complete JavaScript source block.');
  assert.equal(blocks[0][1].trim(), candidateSource.trim(), 'The candidate source must match the retained response.');
}

export function assertReplaySeal(seal, candidateSource) {
  assert.ok(seal?.status === 'PASS' && seal.reviewed === true, 'A successful prior reviewed verification is required.');
  assert.equal(seal.candidateSourceSha256, createHash('sha256').update(candidateSource).digest('hex'), 'Replay must use the previously reviewed source.');
}

/** Cleanup covers the whole terminal attempt, including application/client errors. */
export async function withTerminalCleanup(operation, cleanup, record) {
  let result, originalError, cleanupError, disposal;
  try { result = await operation(); } catch (error) { originalError = error; }
  try { disposal = await cleanup(); } catch (error) { cleanupError = error; }
  const receipt = {operationSucceeded: !originalError, originalError: originalError?.message ?? null, disposal: disposal ?? null, cleanupError: cleanupError?.message ?? null};
  try { record(receipt); } catch (error) {
    throw new AggregateError([originalError, cleanupError, error].filter(Boolean), 'Unable to retain the terminal lifecycle receipt.');
  }
  if (originalError && cleanupError) throw new AggregateError([originalError, cleanupError], 'Operation and cleanup failed; inspect the lifecycle receipt.');
  if (originalError) throw originalError;
  if (cleanupError) throw cleanupError;
  return result;
}

export function subscriptionArgs(config,allowed,schema) {
  return ['--no-chrome','--disable-slash-commands','--no-session-persistence','--setting-sources','user','--settings',JSON.stringify({disableAllHooks:true,autoMemoryEnabled:false} ),'-p','--output-format','json','--strict-mcp-config','--mcp-config',config,'--tools','','--allowedTools',allowed,'--max-turns','6','--json-schema',JSON.stringify(schema)];
}

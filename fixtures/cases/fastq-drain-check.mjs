import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const boolean = value => typeof value === 'boolean';
const string = value => typeof value === 'string';
const count = value => Number.isSafeInteger(value) && value >= 0;
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const array = item => value => Array.isArray(value) && value.every(item);
const fields = schema => value => object(value) && Object.entries(schema).every(([key, valid]) =>
  Object.hasOwn(value,key) && valid(value[key]));
const queueState = fields({settled:count,drainCalls:count,running:count,queued:array(string),idle:boolean});
const retentionEnvelope = fields({
  outcome:string, before:queueState, middle:queueState, after:queueState,
  laterBefore:fields({laterSettled:boolean,drainCalls:count}),
  laterAfter:fields({laterSettled:boolean,drainCalls:count}),
  idleWait:fields({noHook:boolean,idle:boolean}),
  queueContract:fields({started:array(string),values:array(string),maxRunning:count,
    workerContexts:array(boolean),ok:string,errorMessage:string,errors:array(array(string)),errorIdle:boolean}),
});
const incidentEnvelope = fields({outcome:string,count:count,settled:count,drainCalls:count,
  workSettled:boolean,beforeReleaseSettled:count,idle:boolean,elapsedMs:finite,node:string});

// Fresh bounded workers observe trusted queue bytes; the heap limit is not an RSS limit or sandbox.
export function observe(mode, library = join(process.cwd(), 'src/library.cjs')) {
  if (!['incident', 'retentionA', 'retentionB'].includes(mode)) throw new Error('Unknown observation mode');
  const expected = JSON.parse(readFileSync(new URL('./fastq-drain-expected.json', import.meta.url), 'utf8'));
  const worker = fileURLToPath(new URL(mode === 'incident' ? './fastq-drain-burst.cjs' : './fastq-drain-retention.cjs', import.meta.url));
  const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--max-old-space-size=256', worker, library, String(expected.count)], {
    cwd: process.cwd(), env, shell: false, encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024,
  });
  const diagnostic = { exitCode: result.status, signal: result.signal, error: result.error?.message ?? null, stderr: result.stderr };
  let observed;
  try {
    const lines = result.stdout.trim().split(/\r?\n/);
    if (lines.length !== 1) throw new Error('Expected one complete observation');
    observed = JSON.parse(lines[0]);
  } catch { return { status: 'inconclusive', evidence: { reason: 'missing, partial or malformed observation' }, diagnostic }; }
  diagnostic.observation = observed;
  if (result.error || result.signal) return { status: 'inconclusive', evidence: { reason: 'worker termination' }, diagnostic };
  if (!object(observed)) return {status:'inconclusive',evidence:{reason:'nonobject worker observation'},diagnostic};
  if (mode === 'incident') {
    if (!incidentEnvelope(observed) || (observed.outcome === 'completed' && !string(observed.value)) ||
        (observed.outcome === 'queue-drain-error' && (!string(observed.errorName) || !string(observed.errorMessage)))) {
      return {status:'inconclusive',evidence:{reason:'partial or wrongly typed incident observation'},diagnostic};
    }
    const { elapsedMs, node, errorMessage, beforeReleaseSettled, ...evidence } = observed;
    // The captured known failure must have the complete expected structured shape.
    if (result.status === 1 && isDeepStrictEqual(evidence, expected.expectedOld)) return { status: 'fail', evidence, diagnostic };
    if (result.status === 0 && isDeepStrictEqual(evidence, expected.intended)) return { status: 'pass', evidence, diagnostic };
    return { status: 'inconclusive', evidence: { reason: 'unknown incident outcome' }, diagnostic };
  }
  // Validate the entire worker envelope before choosing either independent evidence projection.
  // Array membership and cardinality belong to semantic comparison, never schema validation.
  if (result.status !== 0 || observed.outcome !== 'completed' || !retentionEnvelope(observed)) {
    return { status: 'inconclusive', evidence: { reason: 'unknown retention outcome' }, diagnostic };
  }
  const evidence = mode === 'retentionB' ? observed.queueContract : Object.fromEntries(
    ['before','middle','after','laterBefore','laterAfter','idleWait'].map(key => [key, observed[key]]));
  return { status: isDeepStrictEqual(evidence, expected[mode]) ? 'pass' : 'fail', evidence, diagnostic };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { diagnostic, ...stable } = observe(process.argv[2], process.argv[3]);
  // Diagnostics remain separate from the repeated stable oracle evidence.
  process.stdout.write(JSON.stringify(stable) + '\n');
  process.stderr.write(JSON.stringify(diagnostic) + '\n');
}

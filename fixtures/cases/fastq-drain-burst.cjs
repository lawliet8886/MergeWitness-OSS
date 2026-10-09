'use strict';
// A finite, local variant: many callers wait for one explicitly held queue cycle.
const { resolve } = require('node:path');
const { performance } = require('node:perf_hooks');
const build = require(resolve(process.argv[2]));
const count = Number(process.argv[3] || 8);
if (!Number.isSafeInteger(count) || count < 1 || count > 14000) throw new Error('Invalid bounded waiter count');
const start = performance.now();
let settled = 0, drainCalls = 0, workSettled = false, beforeReleaseSettled = null;
let queue;
let finished = false;
function finish(outcome, extra = {}, exitCode = 0) {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  console.log(JSON.stringify({ outcome, count, settled, drainCalls, workSettled, beforeReleaseSettled,
    idle: queue?.idle(), elapsedMs: performance.now() - start, node: process.version, ...extra }));
  process.exitCode = exitCode;
}
const timer = setTimeout(() => { finish('inconclusive', { reason: 'observation deadline' }, 2); process.exit(2); }, 3000);
process.once('unhandledRejection', error => {
  finish(error?.name === 'RangeError' ? 'queue-drain-error' : 'unexpected-error',
    { errorName: error?.name, errorMessage: error?.message }, 1);
  process.exit(1);
});
(async () => {
  let release;
  queue = build.promise(value => new Promise(done => { release = () => done(value); }), 1);
  queue.drain = () => { drainCalls++; };
  const work = queue.push('held').then(value => { workSettled = true; return value; });
  const waits = Array.from({length:count}, () => queue.drained().then(() => { settled++; }));
  await Promise.resolve();
  beforeReleaseSettled = settled;
  release();
  const [value] = await Promise.all([work, ...waits]);
  finish('completed', { value });
})().catch(error => { finish('unexpected-error', { errorName:error.name,errorMessage:error.message }, 2); });

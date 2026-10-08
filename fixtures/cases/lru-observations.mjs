// Newly authored observations of node-lru-cache issue #203. Upstream bytes stay intact.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// The published module captures this object at require-time. A deterministic clock
// avoids a wall-clock sleep; only this isolated probe process sees the substitution.
export function loadWithClock(path) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'performance');
  let now = 100;
  Object.defineProperty(globalThis, 'performance', { value: { now: () => now }, configurable: true });
  try {
    const LRU = require(path);
    return { LRU, advance: (value) => { now = value; } };
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'performance', descriptor);
    else delete globalThis.performance;
  }
}

export function observeStaleClear(LRU, advance) {
  const events = [];
  const cache = new LRU({ max: 2, ttl: 10, ttlResolution: 0,
    dispose: (value, key, reason) => events.push(['dispose', value, key, reason]),
    disposeAfter: (value, key, reason) => events.push(['disposeAfter', value, key, reason]),
  });
  cache.set('resource-key', 'resource');
  advance(200);
  cache.clear();
  const firstCount = events.length;
  cache.clear();
  return { events, size: cache.size, keyAbsent: !cache.has('resource-key'), duplicateDisposals: events.length - firstCount };
}

export function observeLRU(LRU) {
  const cache = new LRU({ max: 2 });
  cache.set('a', 1); cache.set('b', 2);
  const first = cache.get('a');
  cache.set('c', 3);
  return { first, bAbsent: !cache.has('b'), a: cache.get('a'), c: cache.get('c'), size: cache.size };
}

export function observeIdentityAndClear(LRU) {
  const first = { token: 'first' }; const second = { token: 'second' };
  const events = [];
  const cache = new LRU({ max: 2, dispose: (value, key, reason) => events.push([value.token, key, reason]) });
  cache.set('x', first);
  const firstIdentity = cache.get('x') === first;
  cache.set('x', second);
  const secondIdentity = cache.get('x') === second;
  cache.clear(); cache.clear();
  return { firstIdentity, secondIdentity, events, size: cache.size };
}

import test from 'node:test';

// The independent core is JavaScript. The preserved historical web adapter is
// TypeScript and is exercised on the runtimes that natively load that syntax.
const [major, minor] = process.versions.node.split('.').map(Number);
const supportsNativeTypes = major >= 24 || (major === 23 && minor >= 6) || (major === 22 && minor >= 18);
if (supportsNativeTypes) {
  await import('../web/tests/workerRun.test.mjs');
} else {
  test('historical TypeScript browser adapter is checked on Node 24', {
    skip: 'This Node runtime does not load TypeScript; all independent core, CLI and installed-package checks still run.',
  }, () => {});
}

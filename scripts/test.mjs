#!/usr/bin/env node
// Explicit test discovery avoids shell glob differences and generated histories.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = readdirSync(join(root, 'tests')).filter(name => name.endsWith('.test.mjs')).sort().map(name => join('tests', name));
const options = process.argv.slice(2);
// Concurrent Git-heavy fixtures on Windows can starve bounded subprocesses.
const scheduling = process.platform === 'win32' && !options.some(arg => arg.startsWith('--test-concurrency')) ? ['--test-concurrency=1'] : [];
const result = spawnSync(process.execPath, ['--test', ...scheduling, ...options, ...files], { cwd: root, stdio: 'inherit', shell: false });
process.exitCode = result.status === 0 && !result.signal && !result.error ? 0 : 1;

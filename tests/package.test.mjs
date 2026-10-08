import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
function npmCliPath() {
  const executableDirectory = dirname(process.execPath);
  const candidates = [
    process.env.MERGEWITNESS_NPM_CLI,
    process.env.npm_execpath,
    join(executableDirectory, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(executableDirectory, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].filter(Boolean).map((entry) => resolve(entry));
  const found = candidates.find(existsSync);
  if (!found) throw new Error(`Unable to locate npm-cli.js for ${process.execPath}. Set MERGEWITNESS_NPM_CLI to override.`);
  return found;
}

function installedBin(binary, args, options) {
  return spawnSync(binary, args, { encoding: 'utf8', shell: process.platform === 'win32', ...options });
}

function contentHashes(directory) {
  return Object.fromEntries(readdirSync(directory, { recursive: true }).sort()
    .filter(entry => statSync(join(directory, entry)).isFile())
    .map(entry => [entry, createHash('sha256').update(readFileSync(join(directory, entry))).digest('hex')]));
}

function stagePackSource(temp) {
  const source = join(temp, 'source');
  mkdirSync(source);
  for (const entry of ['package.json', 'package-lock.json', 'LICENSE', 'README.md', 'package-core.json', ...manifest.files]) {
    const from = join(root, entry);
    if (!existsSync(from)) continue;
    cpSync(from, join(source, entry), { recursive: true });
  }
  return source;
}

test('package exposes the private Node 22 core and both executable entrypoints', () => {
  assert.equal(manifest.name, 'mergewitness-core');
  assert.equal(manifest.version, '0.3.0');
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.engines.node, '>=22');
  assert.equal(manifest.exports['.'], './src/core/mergeWitness.mjs');
  assert.equal(manifest.bin.mergewitness, './src/cli/mergewitness.mjs');
  assert.equal(manifest.bin['mergewitness-mcp'], './src/mcp/server.mjs');
  assert.deepEqual(manifest.dependencies ?? {}, {});
});

test('packed installation runs help, two isolated demos and offline reports without mutating installed file bytes', () => {
  const temp = mkdtempSync(join(tmpdir(), 'mergewitness-packed-'));
  try {
    const npmCli = npmCliPath();
    const packDirectory = join(temp, 'tarballs');
    mkdirSync(packDirectory);
    const packed = spawnSync(process.execPath, [npmCli, 'pack', '--json', '--ignore-scripts', '--pack-destination', packDirectory], { cwd: stagePackSource(temp), encoding: 'utf8', timeout: 60_000 });
    assert.equal(packed.status, 0, packed.stderr);
    const tarball = join(packDirectory, JSON.parse(packed.stdout)[0].filename);
    const installed = join(temp, 'installed');
    const install = spawnSync(process.execPath, [npmCli, 'install', '--prefix', installed, '--offline', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { encoding: 'utf8' });
    assert.equal(install.status, 0, install.stderr);
    const binary = join(installed, 'node_modules', '.bin', process.platform === 'win32' ? 'mergewitness.cmd' : 'mergewitness');
    assert.equal(readFileSync(binary, 'utf8').includes('mergewitness'), true);
    const help = installedBin(binary, ['--help']);
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /report <evaluation.json>/);
    const installedPackage = join(installed, 'node_modules', 'mergewitness-core');
    const before = contentHashes(installedPackage);
    const output = join(temp, 'output');
    const first = installedBin(binary, ['demo', 'tenant-cache', '--out', output], { timeout: 180_000 });
    const second = installedBin(binary, ['demo', 'tenant-cache', '--out', output], { timeout: 180_000 });
    assert.equal(first.status, 0, first.stderr);
    assert.equal(second.status, 0, second.stderr);
    const one = JSON.parse(first.stdout); const two = JSON.parse(second.stdout);
    assert.notEqual(one.outputDir, two.outputDir);
    assert.equal(one.passed && two.passed, true);
    const reports = [one, two].map(demo => {
      const result = installedBin(binary, ['report', join(demo.outputDir, 'evaluation.public.json'), '--repair', join(demo.outputDir, 'repair.public.json'), '--out', join(temp, 'reports')]);
      assert.equal(result.status, 0, result.stderr);
      const receipt = JSON.parse(result.stdout);
      assert.match(readFileSync(receipt.reportPath, 'utf8'), /Declared checks passed/);
      return receipt;
    });
    assert.notEqual(reports[0].reportPath, reports[1].reportPath);
    assert.deepEqual(contentHashes(installedPackage), before);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

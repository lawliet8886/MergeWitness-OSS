import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../src/cli/mergewitness.mjs', import.meta.url));
const mcp = fileURLToPath(new URL('../src/mcp/server.mjs', import.meta.url));

test('CLI exposes help and version without JSON request files', () => {
  const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /mergewitness.*prepare/i);
  const version = spawnSync(process.execPath, [cli, '--version'], { encoding: 'utf8' });
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), '0.3.0');
});

test('MCP lists state-backed v2 inputs and rejects inherited handler names', () => {
  const input = [
    { jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2024-11-05' } },
    { jsonrpc: '2.0', id: 1, method: 'tools/list' },
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'toString', arguments: {} } },
  ].map(JSON.stringify).join('\n') + '\n';
  const result = spawnSync(process.execPath, [mcp], { encoding: 'utf8', input });
  assert.equal(result.status, 0, result.stderr);
  const [initialized, listed, rejected] = result.stdout.trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(initialized.result.serverInfo.version, '0.3.0');
  const prepare = listed.result.tools.find((entry) => entry.name === 'prepare');
  const evaluate = listed.result.tools.find((entry) => entry.name === 'evaluate');
  const verify = listed.result.tools.find((entry) => entry.name === 'verifyRepair');
  assert.ok(prepare.inputSchema.properties.protectedTestPaths);
  assert.ok(evaluate.inputSchema.properties.statePath);
  assert.ok(evaluate.inputSchema.properties.requirements);
  assert.ok(verify.inputSchema.properties.statePath);
  assert.equal(rejected.error.code, -32603);
  assert.match(rejected.error.message, /unknown tool/i);
});

test('MCP responds to a client health-check ping with an empty result', () => {
  const input = [
    { jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2025-11-25' } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 1, method: 'ping' },
  ].map(JSON.stringify).join('\n') + '\n';
  const result = spawnSync(process.execPath, [mcp], { encoding: 'utf8', input });
  assert.equal(result.status, 0, result.stderr);
  const replies = result.stdout.trim().split(/\r?\n/).map(JSON.parse);
  const ping = replies.find(entry => entry.id === 1);
  assert.deepEqual(ping, { jsonrpc: '2.0', id: 1, result: {} });
});

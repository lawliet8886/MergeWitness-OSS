#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dispose, evaluate, prepare, verifyRepair } from '../core/mergeWitness.mjs';
import { runTenantCacheDemo } from '../demo/tenantCache.mjs';

const version = '0.2.0';
const handlers = new Map([['prepare', prepare], ['evaluate', evaluate], ['verify-repair', verifyRepair], ['dispose', dispose]]);
const usage = () => 'Usage:\n  mergewitness <prepare|evaluate|verify-repair|dispose> <request.json> [response.json]\n  mergewitness workflow <request.json> [response.json]\n  mergewitness demo tenant-cache --out <directory>\n  mergewitness --help | --version\n';
const args = process.argv.slice(2);
if (args[0] === '--help' || args[0] === '-h') process.stdout.write(usage());
else if (args[0] === '--version' || args[0] === '-v') process.stdout.write(`${version}\n`);
else if (args[0] === 'demo') {
  try {
    if (args[1] !== 'tenant-cache' || args[2] !== '--out' || !args[3] || args.length !== 4) throw new Error('Usage: mergewitness demo tenant-cache --out <directory>');
    const result = runTenantCacheDemo({ out: args[3] });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.passed) process.exitCode = 1;
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
} else {
  const [operation, requestFile, responseFile] = args;
  try {
    if (!operation || !requestFile) throw new Error(usage().trim());
    const request = JSON.parse(readFileSync(requestFile, 'utf8'));
    let result;
    if (operation === 'workflow') {
      const prepared = prepare(request.prepare);
      const evaluated = evaluate({ analysisId: prepared.analysisId, statePath: prepared.statePath, ...request.evaluate });
      const verified = request.verifyRepair ? verifyRepair({ analysisId: prepared.analysisId, statePath: prepared.statePath, ...request.verifyRepair }) : undefined;
      result = { prepared, evaluated, ...(verified ? { verified } : {}) };
    } else {
      const handler = handlers.get(operation);
      if (!handler) throw new Error(`Unknown operation: ${operation}`);
      result = handler(request);
    }
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (responseFile) writeFileSync(responseFile, text);
    else process.stdout.write(text);
    if (operation === 'verify-repair' && result.passed === false) process.exitCode = 1;
    if (operation === 'workflow' && result.verified?.passed === false) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

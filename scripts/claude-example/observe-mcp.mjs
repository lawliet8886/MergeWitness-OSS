#!/usr/bin/env node
// Transparent recorder for this reviewed example. Credentials never enter its configuration.
import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import readline from 'node:readline';
import { assertScopedCall } from './evidence.mjs';

const scopeFile = process.argv[2];
const scope = JSON.parse(readFileSync(scopeFile,'utf8'));
mkdirSync(scope.receipts,{recursive:true});
const pending = new Map();
let sequence = 0;
const record = (direction,message) => appendFileSync(join(scope.receipts,'wire.jsonl'),JSON.stringify({time:new Date().toISOString(),direction,message})+'\n');
const child = spawn(process.execPath,[scope.server],{cwd:scope.workspace,stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});
child.stderr.on('data',bytes => appendFileSync(join(scope.receipts,'server.stderr.log'),bytes));
const outgoing = readline.createInterface({input:child.stdout});
outgoing.on('line',line => {
  const response = JSON.parse(line);
  record('server-to-client',response);
  const request = pending.get(response.id);
  if (request?.params?.name && response.result) {
    const data = response.result.structuredContent ?? JSON.parse(response.result.content[0].text);
    const filename = `${String(++sequence).padStart(2,'0')}-${request.params.name}.json`;
    writeFileSync(join(scope.receipts,filename),JSON.stringify({request,response,data},null,2)+'\n',{flag:'wx'});
    if (request.params.name === 'prepare') {
      scope.prepared = data;
      writeFileSync(scopeFile,JSON.stringify(scope,null,2)+'\n');
    }
  }
  pending.delete(response.id);
  process.stdout.write(line+'\n');
});
const incoming = readline.createInterface({input:process.stdin});
incoming.on('line',line => {
  const request = JSON.parse(line);
  record('client-to-server',request);
  try {
    assertScopedCall(request,scope);
    if (request.id !== undefined) pending.set(request.id,request);
    child.stdin.write(line+'\n');
  } catch (error) {
    const response = {jsonrpc:'2.0',id:request.id,error:{code:-32602,message:error.message}};
    record('scope-rejection',response);
    process.stdout.write(JSON.stringify(response)+'\n');
  }
});
incoming.on('close',() => child.stdin.end());
child.on('error',error => { process.stderr.write(error.message+'\n'); process.exitCode=1; });
child.on('exit',code => { incoming.close(); process.exitCode=code ?? 1; });
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => {child.kill(); incoming.close();});

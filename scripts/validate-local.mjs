#!/usr/bin/env node
// Task-local validation against downloaded official runtimes; no global setup.
import { spawn } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [runtime, stage = 'suite'] = process.argv.slice(2);
if (!['windows22','windows24','linux22','linux24'].includes(runtime) || !['suite','corpus'].includes(stage)) throw new Error('Usage: node scripts/validate-local.mjs <windows22|windows24|linux22|linux24> [suite|corpus]');
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const destination = join(root, 'artifacts', 'validation', `${runtime}-${stage}-${stamp}`);
mkdirSync(destination, { recursive:true });
const logPath = join(destination,'output.log');
const descriptor = openSync(logPath, 'wx');
const script = stage==='suite'?'scripts/test.mjs':'scripts/run-corpus.mjs';
let executable, argv, env={...process.env};
if (runtime.startsWith('linux')) {
  const version=runtime==='linux22'?'22.0.0':'24.14.0';
  executable='wsl.exe';
  const wslRoot=root.replace(/^([A-Za-z]):[\\/]/,(_,drive)=>`/mnt/${drive.toLowerCase()}/`).replaceAll('\\','/');
  argv=['-d','Ubuntu-24.04','--exec','/bin/bash',`${wslRoot}/artifacts/bootstrap-linux.sh`,version,script];
} else {
  executable=runtime==='windows22'?join(root,'artifacts/runtime/node-v22.0.0-win-x64/node.exe'):process.execPath;
  for(const key of Object.keys(env)) if(key.toLowerCase()==='path') delete env[key];
  env.Path=dirname(executable)+delimiter+(process.env.PATH??process.env.Path??'');
  argv=[script];
}
const startedAt=new Date().toISOString();
console.log(JSON.stringify({runtime,stage,startedAt,logPath}));
const child=spawn(executable,argv,{cwd:root,env,stdio:['ignore',descriptor,descriptor],shell:false});
const receipt={runtime,stage,startedAt,command:[executable,...argv],logPath,pid:child.pid};
writeFileSync(join(destination,'status.json'),JSON.stringify({...receipt,status:'running'},null,2)+'\n');
child.once('error',error=>{receipt.error=error.message;});
child.once('close',(exitCode,signal)=>{
  closeSync(descriptor);
  const output=readFileSync(logPath,'utf8');
  const passMatch=output.match(/(?:ℹ |# )?pass (\d+)/);
  const failMatch=output.match(/(?:ℹ |# )?fail (\d+)/);
  const passed=exitCode===0&&!signal&&!receipt.error;
  const result={...receipt,status:passed?'passed':'failed',exitCode,signal,finishedAt:new Date().toISOString(),testsPassed:passMatch?Number(passMatch[1]):null,testsFailed:failMatch?Number(failMatch[1]):null,logSha256:createHash('sha256').update(output).digest('hex')};
  writeFileSync(join(destination,'status.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
  console.log(output.split(/\r?\n/).slice(-24).join('\n'));
  process.exitCode=passed?0:1;
});

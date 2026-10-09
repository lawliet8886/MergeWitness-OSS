import test from 'node:test';
import assert from 'node:assert/strict';
const module = await import('../scripts/run-installed-example.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});

test('installed example refuses a different version before executing the demo',()=>{
  assert.equal(typeof module.runInstalledExample,'function');
  let calls=0;
  assert.throws(()=>module.runInstalledExample({cwd:'/example',execute:()=>{calls++;return '0.2.1\n';}}),/0.3.1/);
  assert.equal(calls,1);
});

test('installed example refuses missing retention and uses the real returned directory',()=>{
  assert.equal(typeof module.runInstalledExample,'function');
  const calls=[];
  const execute=(_node,args)=>{calls.push(args);if(args.at(-1)==='--version')return '0.3.1';if(args.includes('demo'))return JSON.stringify({outputDir:'/actual/unique-run',passed:true,retentionVerified:true});return JSON.stringify({reportPath:'/actual/report/index.html'});};
  assert.equal(module.runInstalledExample({cwd:'/example',execute}).reportPath,'/actual/report/index.html');
  assert.match(calls.at(-1).find(arg=>arg.endsWith('evaluation.public.json')),/unique-run[/\\]evaluation\.public\.json$/);
  let index=0;
  assert.throws(()=>module.runInstalledExample({cwd:'/example',execute:()=>++index===1?'0.3.1':JSON.stringify({outputDir:'/actual',passed:true})}),/retention/);
});

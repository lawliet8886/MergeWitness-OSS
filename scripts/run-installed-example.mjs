// Source/download companion to the accepted package; no install hooks or model calls.
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function runInstalledExample({cwd=process.cwd(),execute=execFileSync}={}) {
  const cli=resolve(cwd,'mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs');
  const call=args=>execute(process.execPath,[cli,...args],{cwd,encoding:'utf8',windowsHide:true});
  if(call(['--version']).trim()!=='0.3.1')throw new Error('This example requires the exact reviewed 0.3.1 package.');
  const demo=JSON.parse(call(['demo','tenant-cache','--out','./mw-demo']));
  if(demo.passed!==true||demo.retentionVerified!==true||typeof demo.outputDir!=='string')throw new Error('Demo did not verify the repair and retention; inspect the actual output.');
  const report=JSON.parse(call(['report',join(demo.outputDir,'evaluation.public.json'),'--repair',join(demo.outputDir,'repair.public.json'),'--out','./mw-reports']));
  if(typeof report.reportPath!=='string'||!report.reportPath)throw new Error('The actual HTML report path is missing.');
  return {caseKind:'synthetic demo with supplied repair',version:'0.3.1',passed:demo.passed,retentionVerified:demo.retentionVerified,outputDir:demo.outputDir,reportPath:report.reportPath};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {console.log(JSON.stringify(runInstalledExample(),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}

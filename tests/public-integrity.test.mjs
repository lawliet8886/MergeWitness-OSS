import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Changing vendored bytes while retaining an unchanged-upstream provenance claim
// must fail, even when the modified library happens to pass the operation probe.
test('new public replay assets match the admitted immutable source and oracle hashes', () => {
  const manifest = JSON.parse(readFileSync(new URL('../fixtures/cases/vendor-manifest.json', import.meta.url), 'utf8'));
  for (const source of manifest.sources) {
    const bytes = readFileSync(new URL('../' + source.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.path);
  }
  for (const name of ['lru','fastq']) {
    const bytes = readFileSync(new URL(`../fixtures/cases/${name}-expected.json`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.oracles[name]);
  }
});

// Git must not normalize the reserved CRLF oracle and invalidate its admitted
// hash when a contributor makes a fresh checkout on either platform policy.
test('Git round trips preserve admitted replay assets with LF and CRLF checkout settings', () => {
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const temp=mkdtempSync(join(tmpdir(),'mw-public-integrity-'));
  const git=(cwd,...args)=>{
    const result=spawnSync('git',args,{cwd,encoding:'utf8',shell:false,timeout:30_000});
    assert.equal(result.status,0,result.stderr); return result.stdout.trim();
  };
  try {
    const source=join(temp,'source'); mkdirSync(source);
    cpSync(join(root,'.gitattributes'),join(source,'.gitattributes'));
    const manifest=JSON.parse(readFileSync(join(root,'fixtures/cases/vendor-manifest.json'),'utf8'));
    for(const entry of manifest.sources) {
      mkdirSync(dirname(join(source,entry.path)),{recursive:true});
      cpSync(join(root,entry.path),join(source,entry.path));
    }
    git(source,'init','-b','freeze');
    git(source,'add','.');
    git(source,'-c','user.name=MergeWitness integrity test','-c','user.email=integrity@example.invalid','-c','commit.gpgsign=false','commit','-m','admitted source snapshot');
    for(const policy of ['false','true']) {
      const clone=join(temp,`checkout-${policy}`);
      git(temp,'-c',`core.autocrlf=${policy}`,'clone','--local','--no-hardlinks',source,clone);
      for(const entry of manifest.sources) {
        const bytes=readFileSync(join(clone,entry.path));
        assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,`${policy}:${entry.path}`);
      }
    }
  } finally {
    const absolute=resolve(temp);
    assert.ok(absolute.startsWith(resolve(tmpdir())+sep)&&absolute.includes('mw-public-integrity-'));
    rmSync(absolute,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
});

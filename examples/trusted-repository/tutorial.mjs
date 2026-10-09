// Educational source-checkout glue, not a public MergeWitness CLI or API.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
function run(command, args, cwd) {
  const output = spawnSync(command, args, { cwd, encoding: 'utf8', shell: false, timeout: 120_000 });
  if (output.status !== 0 || output.signal || output.error) throw new Error(output.stderr || output.stdout || String(output.error));
  return output.stdout;
}
function configuration(area) {
  const config = read(join(area, 'tutorial.json'));
  if (config.kind !== 'mergewitness-trusted-tutorial-v1' || config.area !== area || config.repoPath !== join(area, 'workspace', 'fixtures', '.generated', 'tenant-cache-history')) {
    throw new Error('Expected an unmodified area created by this tutorial.');
  }
  return config;
}
try {
  const [command, target, option, ...extra] = process.argv.slice(2);
  if (!target || extra.length) throw new Error('Usage: node tutorial.mjs <init|requests|repair|save> <area> [interaction|inconclusive|preexisting|good|bad|evaluation]');
  const area = resolve(target);
  if (command === 'init') {
    const scenario = option ?? 'interaction';
    if (!['interaction', 'inconclusive', 'preexisting'].includes(scenario)) throw new Error('Unknown tutorial scenario.');
    if (existsSync(area)) throw new Error('Tutorial area already exists. Choose a new path; existing outputs are never overwritten.');
    mkdirSync(dirname(area), { recursive: true });
    mkdirSync(area); // Fail if another process created it after the existence check.
    const workspace = join(area, 'workspace'); mkdirSync(workspace);
    // Generator deletion is confined to this newly created tutorial workspace.
    const fixture = JSON.parse(run(process.execPath, [join(root, 'fixtures/create-fixtures.mjs')], workspace));
    const repoPath = fixture.tenantCache.repo;
    const checks = join(area, 'checks'); mkdirSync(checks);
    for (const file of readdirSync(join(here, 'checks'))) copyFileSync(join(here, 'checks', file), join(checks, file));
    write(join(area, 'tutorial.json'), { kind: 'mergewitness-trusted-tutorial-v1', area, repoPath, scenario });
    write(join(area, 'prepare.request.json'), { repoPath, baseRef: 'base', branchARef: 'tenant-pricing', branchBRef: 'sku-cache', testCommand: ['node', '--test'], protectedTestPaths: ['test'] });
    process.stdout.write(`${JSON.stringify({ area, repoPath, prepareRequest: join(area, 'prepare.request.json') }, null, 2)}\n`);
  } else {
    const config = configuration(area);
    const prepared = read(join(area, 'prepared.json'));
    if (prepared.source !== config.repoPath) throw new Error('Preparation does not belong to this fixture.');
    const identity = { analysisId: prepared.analysisId, statePath: prepared.statePath };
    if (command === 'requests' && !option) {
      const checks = join(area, 'checks');
      const helper = join(checks, 'observations.mjs');
      write(join(area, 'evaluate.request.json'), {
        ...identity, probePath: join(checks, config.scenario === 'interaction' ? 'sequence.mjs' : `${config.scenario}.mjs`),
        probeDependencies: config.scenario === 'interaction' ? [helper] : [], repetitions: 3,
        requirements: [
          { id: 'tenant-pricing', origin: 'branchA', checkPath: join(checks, 'tenant-pricing.mjs'), dependencies: [helper] },
          { id: 'sku-cache', origin: 'branchB', checkPath: join(checks, 'sku-cache.mjs'), dependencies: [helper] },
        ],
      });
      write(join(area, 'verify.request.json'), { ...identity, candidatePath: prepared.paths.merged });
      write(join(area, 'dispose.request.json'), identity);
      process.stdout.write(`${JSON.stringify({ ...identity, candidatePath: prepared.paths.merged }, null, 2)}\n`);
    } else if (command === 'repair' && ['good', 'bad'].includes(option)) {
      const state = read(prepared.statePath);
      if (state.id !== prepared.analysisId || state.paths.merged !== prepared.paths.merged || config.scenario !== 'interaction') throw new Error('Expected the active interaction tutorial candidate.');
      const candidate = prepared.paths.merged;
      if (run('git', ['status', '--porcelain'], candidate).trim()) throw new Error('Candidate must be clean before applying a tutorial repair.');
      copyFileSync(option === 'good' ? join(root, 'src/bob-repairs/tenant-cache/catalog.fixed.js') : join(here, 'catalog.no-cache.js'), join(candidate, 'src/catalog.js'));
      run('git', ['add', '--', 'src/catalog.js'], candidate);
      run('git', ['-c', 'user.name=MergeWitness Tutorial', '-c', 'user.email=tutorial@example.invalid', 'commit', '-m', `Tutorial ${option} repair`], candidate);
      process.stdout.write(`${JSON.stringify({ candidatePath: candidate, candidateHead: run('git', ['rev-parse', 'HEAD'], candidate).trim(), repair: option }, null, 2)}\n`);
    } else if (command === 'save' && ['evaluation', 'good', 'bad'].includes(option)) {
      const response = read(join(area, option === 'evaluation' ? 'evaluated.json' : `${option}.json`));
      if (response.analysisId !== prepared.analysisId || !response.reportPath) throw new Error('Response lacks a report for this analysis.');
      const saved = join(area, 'saved'); mkdirSync(saved, { recursive: true });
      const savedReportPath = join(saved, `${option}.json`);
      // Preserve canonical report bytes, rather than rewriting a response wrapper.
      writeFileSync(savedReportPath, readFileSync(response.reportPath), { flag: 'wx' });
      process.stdout.write(`${JSON.stringify({ originalReportPath: response.reportPath, savedReportPath }, null, 2)}\n`);
    } else throw new Error('Unknown tutorial command or option.');
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}

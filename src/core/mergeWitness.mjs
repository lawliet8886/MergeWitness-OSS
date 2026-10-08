import { createHash, randomUUID } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
} from "node:path";
import { spawnSync } from "node:child_process";
import * as pathOperations from "node:path";

const analyses = new Map();
const snapshots = ["base", "branchA", "branchB", "merged"];
const origins = new Set(["branchA", "branchB"]);
const temporaryPrefix = "mergewitness-";
const sha256 = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const safeRemove = (path) => {
  if (path && existsSync(path)) rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
};

function isStrictDescendant(parent, target, paths = pathOperations) {
  const rel = paths.relative(parent, target);
  return rel !== '' && !paths.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + paths.sep);
}

const commandSucceeded = result => result.exitCode === 0 && !result.signal && !result.error && !result.timedOut;
const runtimeMetadata = () => ({ node: process.version, executable: process.execPath, platform: process.platform, arch: process.arch });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    shell: false,
    timeout: options.timeoutMs ?? 30_000,
    killSignal: "SIGKILL",
    env: { ...process.env, ...options.env },
  });
  return {
    command: [command, ...args],
    exitCode: result.status,
    signal: result.signal ?? null,
    error: result.error
      ? { code: result.error.code ?? null, message: result.error.message }
      : null,
    stdout: result.stdout ?? "",
    stderr: result.stderr || result.error?.message || "",
    timedOut: result.error?.code === "ETIMEDOUT",
  };
}
function gitRaw(cwd, ...args) {
  const result = run("git", args, { cwd });
  if (!commandSucceeded(result))
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout;
}
const git = (cwd, ...args) => gitRaw(cwd, ...args).trim();
const treeId = (path, commit) => git(path, "rev-parse", `${commit}^{tree}`);
function assertTrustedDirectory(path) {
  if (!path || !existsSync(path))
    throw new Error("A trusted local repository path is required.");
  if (git(path, "rev-parse", "--is-inside-work-tree") !== "true")
    throw new Error("repoPath must be a local Git work tree.");
}
function assertSupportedTestCommand(command) {
  if (
    !Array.isArray(command) ||
    command.length !== 2 ||
    command[0] !== "node" ||
    command[1] !== "--test"
  )
    throw new Error(
      'Unsupported testCommand: only ["node", "--test"] is supported. Custom runners cannot yet be protected during repair verification.',
    );
}
function normalRelativePath(path, label) {
  if (typeof path !== "string" || !path || isAbsolute(path))
    throw new Error(`${label} must be a repository-relative path.`);
  const slashes = path.replace(/\\/g, "/");
  if (slashes.split("/").includes("..") || posix.isAbsolute(slashes) || /^[A-Za-z]:/.test(slashes))
    throw new Error(`${label} must not escape the repository.`);
  const normalized = posix.normalize(slashes).replace(/\/$/, '');
  if (normalized === '.' || !normalized) throw new Error(`${label} must identify a repository path.`);
  return normalized;
}
function publicAnalysis(a) {
  return {
    analysisId: a.id,
    source: a.source,
    refs: a.refs,
    commits: a.commits,
    paths: a.paths,
    normalTests: a.normalTests,
    merge: a.merge,
    statePath: a.statePath,
    protectedTestPaths: a.protectedTestPaths,
    runtime: a.runtime,
  };
}
function saveState(a) {
  a.statePath ??= join(a.root, "analysis-state.json");
  const data = {
    version: 2,
    id: a.id,
    source: a.source,
    root: a.root,
    clonePath: a.clonePath,
    refs: a.refs,
    commits: a.commits,
    paths: a.paths,
    merge: a.merge,
    normalTests: a.normalTests,
    testCommand: a.testCommand,
    trees: a.trees,
    protectedTestPaths: a.protectedTestPaths,
    runtime: a.runtime,
    frozen: a.frozen ?? null,
    statePath: a.statePath,
  };
  const pending = `${a.statePath}.${randomUUID()}.tmp`;
  try {
    writeFileSync(pending, `${JSON.stringify(data, null, 2)}\n`);
    renameSync(pending, a.statePath);
  } finally {
    rmSync(pending, { force: true });
  }
}
function getAnalysis(id) {
  const analysis = analyses.get(id);
  if (!analysis)
    throw new Error(
      `Unknown analysisId ${id}. Analyses are local to this process.`,
    );
  return analysis;
}
function loadAnalysis(id, statePath) {
  if (!statePath) {
    const analysis = getAnalysis(id);
    if (analysis.version !== 2) throw new Error('Analysis state version requires a fresh prepare using v2.');
    return analysis;
  }
  const path = resolve(statePath);
  if (!existsSync(path))
    throw new Error(`Analysis state does not exist: ${path}`);
  const analysis = JSON.parse(readFileSync(path, "utf8"));
  if (analysis.version !== 2) throw new Error('Analysis state version requires a fresh prepare using v2.');
  if (analysis.id !== id)
    throw new Error("analysisId does not match the supplied statePath.");
  if (!existsSync(analysis.clonePath))
    throw new Error("Disposable analysis clone is no longer available.");
  analysis.protectedTestPaths ??= [];
  analyses.set(id, analysis);
  return analysis;
}
const testSnapshot = (path, command) =>
  run(process.execPath, command.slice(1), { cwd: path });

function mergeIn(worktree, commit, label) {
  const result = run(
    "git",
    [
      "-c",
      "user.name=MergeWitness",
      "-c",
      "user.email=merge@example.invalid",
      "merge",
      "--no-ff",
      "--no-commit",
      commit,
    ],
    { cwd: worktree },
  );
  if (!commandSucceeded(result)) {
    if (git(worktree, "ls-files", "-u"))
      return { clean: false, stage: label, kind: "conflict", ...result };
    throw new Error(
      `Operational git merge error at ${label}: ${result.stderr.trim()}`,
    );
  }
  if (
    run("git", ["rev-parse", "-q", "--verify", "MERGE_HEAD"], { cwd: worktree })
      .exitCode === 0
  ) {
    const committed = run(
      "git",
      [
        "-c",
        "user.name=MergeWitness",
        "-c",
        "user.email=merge@example.invalid",
        "commit",
        "-m",
        `MergeWitness snapshot ${label}`,
      ],
      { cwd: worktree },
    );
    if (committed.exitCode !== 0)
      throw new Error(
        `Could not commit disposable ${label} snapshot: ${committed.stderr.trim()}`,
      );
  }
  return { clean: true };
}

export function prepare({
  repoPath,
  baseRef,
  branchARef,
  branchBRef,
  testCommand = ["node", "--test"],
  protectedTestPaths = [],
}) {
  assertSupportedTestCommand(testCommand);
  if (!Array.isArray(protectedTestPaths))
    throw new Error("protectedTestPaths must be an array.");
  const source = resolve(repoPath);
  assertTrustedDirectory(source);
  const protectedPaths = [
    ...new Set(
      protectedTestPaths.map((path) =>
        normalRelativePath(path, "protectedTestPaths entry"),
      ),
    ),
  ];
  const root = mkdtempSync(join(tmpdir(), temporaryPrefix));
  try {
    const commits = {
      base: git(source, "rev-parse", `${baseRef}^{commit}`),
      branchA: git(source, "rev-parse", `${branchARef}^{commit}`),
      branchB: git(source, "rev-parse", `${branchBRef}^{commit}`),
    };
    const clonePath = join(root, "clone");
    const clone = run("git", [
      "clone",
      "--no-local",
      "--no-hardlinks",
      source,
      clonePath,
    ]);
    if (!commandSucceeded(clone))
      throw new Error(
        `Could not create isolated clone: ${clone.stderr.trim()}`,
      );
    mkdirSync(join(clonePath, "snapshots"));
    const paths = {
      base: join(clonePath, "snapshots", "base"),
      branchA: join(clonePath, "snapshots", "branch-a"),
      branchB: join(clonePath, "snapshots", "branch-b"),
      merged: join(clonePath, "snapshots", "merged"),
    };
    for (const [key, path] of Object.entries(paths))
      git(
        clonePath,
        "worktree",
        "add",
        "--detach",
        path,
        commits[key] ?? commits.base,
      );
    const first = mergeIn(paths.merged, commits.branchA, "branchA");
    let merge = first;
    if (first.clean) merge = mergeIn(paths.merged, commits.branchB, "branchB");
    if (merge.clean) {
      commits.merged = git(paths.merged, "rev-parse", "HEAD");
      merge = { clean: true, commit: commits.merged };
    }
    const normalTests = {};
    for (const key of ["base", "branchA", "branchB"])
      normalTests[key] = testSnapshot(paths[key], testCommand);
    normalTests.merged = merge.clean
      ? testSnapshot(paths.merged, testCommand)
      : {
          exitCode: null,
          signal: null,
          error: null,
          stdout: "",
          stderr: merge.stderr,
          skipped: true,
        };
    const analysis = {
      version: 2,
      runtime: runtimeMetadata(),
      id: randomUUID(),
      source,
      root,
      clonePath,
      refs: { baseRef, branchARef, branchBRef },
      commits,
      paths,
      merge,
      normalTests,
      testCommand: [...testCommand],
      protectedTestPaths: protectedPaths,
      frozen: null,
    };
    analysis.trees = Object.fromEntries(
      Object.entries(commits).map(([name, commit]) => [
        name,
        treeId(clonePath, commit),
      ]),
    );
    saveState(analysis);
    analyses.set(analysis.id, analysis);
    return publicAnalysis(analysis);
  } catch (error) {
    safeRemove(root);
    throw error;
  }
}

function assertPreparedSnapshots(a) {
  if (!a.merge.clean) return;
  for (const key of snapshots) {
    const path = a.paths[key];
    if (
      git(path, "rev-parse", "HEAD") !== a.commits[key] ||
      treeId(path, "HEAD") !== a.trees[key]
    )
      throw new Error(
        `Prepared ${key} snapshot no longer matches its recorded commit and tree.`,
      );
    if (
      git(
        path,
        "status",
        "--porcelain=v1",
        "--untracked-files=all",
        "--ignored=matching",
      )
    )
      throw new Error(
        `Prepared ${key} snapshot must remain clean during evaluation.`,
      );
  }
}
function assertCandidateIntegrity(path, head, tree) {
  if (git(path, "rev-parse", "HEAD") !== head || treeId(path, "HEAD") !== tree)
    throw new Error(
      "Candidate commit or tree changed during repair verification.",
    );
  if (
    git(
      path,
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--ignored=matching",
    )
  )
    throw new Error("Candidate worktree changed during repair verification.");
}
function readProbeStatus(result) {
  if (result.timedOut) return { kind: "inconclusive", reason: "timeout" };
  if (result.signal) return { kind: "inconclusive", reason: "signal" };
  if (result.error || result.exitCode === null || result.exitCode !== 0)
    return { kind: "inconclusive", reason: "nonzero_exit" };
  const last = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!last)
    return { kind: "inconclusive", reason: "missing_structured_result" };
  try {
    const payload = JSON.parse(last);
    return payload?.status === "pass" || payload?.status === "fail"
      ? { kind: payload.status, payload }
      : { kind: "inconclusive", reason: "invalid_status" };
  } catch {
    return { kind: "inconclusive", reason: "invalid_json" };
  }
}
function probeSnapshot(path, check, repetitions) {
  const runs = Array.from({ length: repetitions }, () => {
    const result = run(process.execPath, [check], { cwd: path, timeoutMs: 15_000 });
    return { ...result, probe: readProbeStatus(result) };
  });
  const consistent =
    new Set(runs.map((entry) => JSON.stringify(entry.probe))).size === 1;
  return {
    kind: consistent ? runs[0].probe.kind : "inconclusive",
    consistent,
    runs,
  };
}
function freezeArtifact(root, directory, input, dependencies, details = {}) {
  const source = resolve(input);
  const sourceDir = dirname(source);
  if (!existsSync(source))
    throw new Error(
      details.missingMessage ??
        `${details.missingLabel ?? "Check"} file does not exist: ${input}`,
    );
  if (!Array.isArray(dependencies))
    throw new Error("Check dependencies must be an array.");
  const frozenRoot = join(root, directory);
  mkdirSync(frozenRoot, { recursive: true });
  const manifest = [];
  for (const file of [source, ...dependencies.map((entry) => resolve(entry))]) {
    if (!existsSync(file))
      throw new Error(`Probe file does not exist: ${file}`);
    const rel = relative(sourceDir, file);
    if (
      rel === ".." ||
      rel.startsWith(`..${sep}`) ||
      rel.includes(`${sep}..${sep}`)
    )
      throw new Error(
        "Check dependencies must live under the check directory.",
      );
    const frozen = join(frozenRoot, rel || basename(source));
    mkdirSync(dirname(frozen), { recursive: true });
    copyFileSync(file, frozen);
    manifest.push({ source: file, frozen, hash: sha256(frozen) });
  }
  const frozen = join(frozenRoot, basename(source));
  return { ...details, source, frozen, hash: sha256(frozen), manifest };
}
function assertArtifactIntegrity(record, label) {
  if (
    !record ||
    !Array.isArray(record.manifest) ||
    !record.manifest.length ||
    record.manifest[0].frozen !== record.frozen ||
    record.manifest[0].hash !== record.hash
  )
    throw new Error(`Frozen ${label} manifest is incomplete or inconsistent.`);
  for (const entry of record.manifest)
    if (!existsSync(entry.frozen) || sha256(entry.frozen) !== entry.hash)
      throw new Error(
        label === "probe"
          ? `Frozen probe or dependency changed after evaluation: ${entry.frozen}`
          : `Frozen ${label} changed: ${entry.frozen}`,
      );
}
function assertRecordsIntegrity(records, label) {
  for (const record of records) assertArtifactIntegrity(record, label);
}
function validateRequirements(requirements) {
  if (requirements === undefined) return [];
  if (!Array.isArray(requirements))
    throw new Error("requirements must be an array.");
  const ids = new Set();
  return requirements.map((entry) => {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !entry.id ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(entry.id) ||
      ids.has(entry.id) ||
      !origins.has(entry.origin) ||
      typeof entry.checkPath !== "string"
    )
      throw new Error(
        "Each requirement needs a unique safe requirement id, branchA or branchB origin, and checkPath.",
      );
    ids.add(entry.id);
    if (entry.dependencies !== undefined && !Array.isArray(entry.dependencies))
      throw new Error("Requirement dependencies must be an array.");
    return {
      id: entry.id,
      origin: entry.origin,
      checkPath: entry.checkPath,
      dependencies: entry.dependencies ?? [],
    };
  });
}
function classify(a, matrix) {
  if (Object.values(a.normalTests).some(entry => entry.signal || entry.error || entry.timedOut || entry.exitCode == null)) return 'inconclusive';
  if (!Object.values(a.normalTests).every((entry) => entry.exitCode === 0))
    return "ordinary_test_failure";
  if (Object.values(matrix).some((entry) => entry.kind === "inconclusive"))
    return "inconclusive";
  if (matrix.base.kind === "fail") return "preexisting_violation";
  if (matrix.branchA.kind === "fail" || matrix.branchB.kind === "fail")
    return "branch_violation";
  return matrix.merged.kind === "fail"
    ? "interaction_witness"
    : "no_witness_found";
}

export function evaluate({
  analysisId,
  statePath,
  probePath,
  probeDependencies = [],
  featureCheckPaths = [],
  requirements,
  repetitions = 3,
}) {
  const a = loadAnalysis(analysisId, statePath);
  assertSupportedTestCommand(a.testCommand);
  if (!Array.isArray(probeDependencies) || !Array.isArray(featureCheckPaths))
    throw new Error("probeDependencies and featureCheckPaths must be arrays.");
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 10)
    throw new Error("repetitions must be an integer from 1 to 10.");
  const descriptors = validateRequirements(requirements);
  if (!a.merge.clean)
    return { analysisId, classification: "text_conflict", merge: a.merge };
  assertPreparedSnapshots(a);
  const root = mkdtempSync(join(a.root, "evaluation-"));
  try {
    const probe = freezeArtifact(
      root,
      "frozen-probe",
      probePath,
      probeDependencies,
      { missingLabel: "Probe" },
    );
    const legacyBasenames = featureCheckPaths.map((path) => basename(path));
    if (new Set(legacyBasenames).size !== legacyBasenames.length)
      throw new Error("Feature checks must have distinct basenames.");
    const legacy = featureCheckPaths.map((path) =>
      freezeArtifact(root, "frozen-feature-checks", path, [], {
        sourceType: "legacy",
        missingMessage: `Feature check does not exist: ${path}`,
      }),
    );
    const requirementRecords = descriptors.map((entry, index) =>
      freezeArtifact(
        root,
        join("frozen-requirements", String(index).padStart(3, "0")),
        entry.checkPath,
        entry.dependencies,
        { id: entry.id, origin: entry.origin, sourceType: "requirement" },
      ),
    );
    const matrix = Object.fromEntries(
      snapshots.map((key) => [
        key,
        probeSnapshot(a.paths[key], probe.frozen, repetitions),
      ]),
    );
    for (const requirement of requirementRecords)
      requirement.calibration = probeSnapshot(
        a.paths[requirement.origin],
        requirement.frozen,
        repetitions,
      );
    assertPreparedSnapshots(a);
    assertArtifactIntegrity(probe, "probe");
    assertRecordsIntegrity([...legacy, ...requirementRecords], "feature check");
    const retentionCoverage = Object.fromEntries(
      [...origins].map((origin) => [
        origin,
        requirementRecords.filter((entry) => entry.origin === origin).length >
          0 &&
          requirementRecords
            .filter((entry) => entry.origin === origin)
            .every(
              (entry) =>
                entry.calibration.kind === "pass" &&
                entry.calibration.consistent,
            ),
      ]),
    );
    const runtime = {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    };
    const evaluationId = randomUUID();
    const frozen = {
      version: 2,
      probePath: probe.frozen,
      probeHash: probe.hash,
      manifest: probe.manifest,
      repetitions,
      matrix,
      classification: classify(a, matrix),
      requirements: requirementRecords,
      featureChecks: [...legacy, ...requirementRecords],
      retentionCoverage,
      strictEligible:
        requirementRecords.length > 0 &&
        Object.values(matrix).every((entry) => entry.kind !== "inconclusive") &&
        Object.values(a.normalTests).every(
          (entry) => entry.exitCode === 0 && !entry.signal && !entry.error,
        ) &&
        retentionCoverage.branchA &&
        retentionCoverage.branchB &&
        requirementRecords.every(
          (entry) =>
            entry.calibration.kind === "pass" && entry.calibration.consistent,
        ),
      evaluationId,
      runtime,
    };
    const next = { ...a, frozen };
    const report = {
      version: 2,
      analysisId,
      evaluationId,
      runtime,
      refs: a.refs,
      commits: a.commits,
      trees: a.trees,
      merge: a.merge,
      normalTests: a.normalTests,
      preparationRuntime: a.runtime,
      probe: frozen,
      requirements: requirementRecords,
      retentionCoverage,
    };
    const reportPath = join(root, "evaluation-report.json");
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    saveState(next);
    analyses.set(analysisId, next);
    return {
      analysisId,
      evaluationId,
      runtime,
      classification: frozen.classification,
      probePath: probe.frozen,
      probeHash: probe.hash,
      probeManifest: probe.manifest,
      repetitions,
      matrix,
      normalTests: a.normalTests,
      requirements: requirementRecords,
      featureChecks: frozen.featureChecks,
      retentionCoverage,
      reportPath,
      report,
    };
  } catch (error) {
    safeRemove(root);
    throw error;
  }
}

function isProtectedCandidateFile(file, explicit) {
  const normalized = file.replace(/\\/g, "/");
  if (
    explicit.some(
      (path) => normalized === path || normalized.startsWith(`${path}/`),
    )
  )
    return true;
  return (
    /(^|\/)(?:tests?|specs?|__tests__|__specs__)\//i.test(normalized) ||
    /(^|\/)(?:(?:tests?|specs?)\.[^/]+|test[_-][^/]+|spec[_-][^/]+|[^/]+[._-](?:test|spec)(?:[._-][^/]*)?)$/i.test(
      normalized,
    ) ||
    /(^|\/)bob-probes\/|(^|\/)(package(?:-lock)?\.json|tsconfig.*\.json|vite\.config\.|.*\.config\.[cm]?[jt]s$)/.test(
      normalized,
    )
  );
}
export function verifyRepair({ analysisId, statePath, candidatePath }) {
  const a = loadAnalysis(analysisId, statePath);
  assertSupportedTestCommand(a.testCommand);
  if (!a.frozen)
    throw new Error("evaluate must freeze a probe before verifyRepair.");
  const candidate = resolve(candidatePath);
  if (!existsSync(candidate)) throw new Error("candidatePath does not exist.");
  if (!isStrictDescendant(realpathSync(a.clonePath), realpathSync(candidate)))
    throw new Error(
      "candidatePath must be a disposable worktree inside this analysis clone.",
    );
  const common = realpathSync(resolve(candidate, git(candidate, 'rev-parse', '--git-common-dir')));
  const ownedCommon = realpathSync(resolve(a.clonePath, git(a.clonePath, 'rev-parse', '--git-common-dir')));
  if (common !== ownedCommon) throw new Error('Candidate worktree must belong to this analysis clone.');
  if (
    git(candidate, "merge-base", "--is-ancestor", a.commits.merged, "HEAD") !==
    ""
  )
    throw new Error("candidatePath must descend from the combined snapshot.");
  const frozenProbe = {
    frozen: a.frozen.probePath,
    hash: a.frozen.probeHash,
    manifest: a.frozen.manifest,
  };
  assertArtifactIntegrity(frozenProbe, "probe");
  assertRecordsIntegrity(a.frozen.featureChecks, "feature check");
  const head = git(candidate, "rev-parse", "HEAD");
  const tree = treeId(candidate, "HEAD");
  if (
    git(
      candidate,
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--ignored=matching",
    )
  )
    throw new Error(
      "Candidate worktree must be committed and clean before repair verification.",
    );
  assertCandidateIntegrity(candidate, head, tree);
  const changed = new Set(
    gitRaw(
      candidate,
      "diff",
      "--no-renames",
      "--name-only",
      "-z",
      `${a.commits.merged}..HEAD`,
    )
      .split("\0")
      .filter(Boolean),
  );
  const protectedChange = [...changed].find((file) =>
    isProtectedCandidateFile(file, a.protectedTestPaths),
  );
  if (protectedChange)
    throw new Error(
      `Candidate changes protected test, probe, harness, or configuration file: ${protectedChange}`,
    );
  if (a.frozen.version !== 2 || !a.frozen.strictEligible)
    throw new Error(
      "Strict repair verification requires v2 requirements calibrated for both branch origins.",
    );
  const normalTests = testSnapshot(candidate, a.testCommand);
  assertCandidateIntegrity(candidate, head, tree);
  assertArtifactIntegrity(frozenProbe, "probe");
  assertRecordsIntegrity(a.frozen.featureChecks, "feature check");
  const probe = probeSnapshot(
    candidate,
    a.frozen.probePath,
    a.frozen.repetitions,
  );
  assertCandidateIntegrity(candidate, head, tree);
  const featureChecks = a.frozen.featureChecks.map((entry) => {
    const result = probeSnapshot(
      candidate,
      entry.frozen,
      entry.sourceType === "requirement" ? a.frozen.repetitions : 1,
    );
    assertCandidateIntegrity(candidate, head, tree);
    assertRecordsIntegrity(a.frozen.featureChecks, "feature check");
    return { ...entry, result };
  });
  assertArtifactIntegrity(frozenProbe, "probe");
  assertRecordsIntegrity(a.frozen.featureChecks, "feature check");
  assertCandidateIntegrity(candidate, head, tree);
  const requirementResults = featureChecks.filter(
    (entry) => entry.sourceType === "requirement",
  );
  const retentionCoverage = Object.fromEntries(
    [...origins].map((origin) => [
      origin,
      requirementResults.filter((entry) => entry.origin === origin).length >
        0 &&
        requirementResults
          .filter((entry) => entry.origin === origin)
          .every(
            (entry) =>
              entry.calibration.kind === "pass" &&
              entry.calibration.consistent &&
              entry.result.kind === "pass" &&
              entry.result.consistent,
          ),
    ]),
  );
  const retentionVerified =
    retentionCoverage.branchA && retentionCoverage.branchB;
  const passed =
    normalTests.exitCode === 0 &&
    !normalTests.signal &&
    !normalTests.error &&
    probe.kind === "pass" &&
    probe.consistent &&
    retentionVerified &&
    featureChecks.every(
      (entry) => entry.result.kind === "pass" && entry.result.consistent,
    );
  const report = {
    version: 2,
    analysisId,
    evaluationId: a.frozen.evaluationId,
    verificationId: randomUUID(),
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    candidatePath: candidate,
    candidateHead: head,
    candidateTree: tree,
    sourceMergedCommit: a.commits.merged,
    sourceMergedTree: a.trees.merged,
    evaluationClassification: a.frozen.classification,
    changedFiles: [...changed],
    frozenProbeHash: a.frozen.probeHash,
    normalTests,
    probe,
    featureChecks,
    requirementResults,
    retentionCoverage,
    retentionVerified,
    passed,
  };
  const reportPath = join(
    mkdtempSync(join(a.root, "repair-")),
    "repair-report.json",
  );
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return { ...report, reportPath };
}
function assertDisposableState(a, statePath) {
  const root = resolve(a.root);
  if (
    !isStrictDescendant(realpathSync(tmpdir()), realpathSync(root)) ||
    !basename(root).startsWith(temporaryPrefix) ||
    resolve(a.clonePath) !== join(root, "clone") ||
    (statePath && resolve(statePath) !== join(root, "analysis-state.json"))
  )
    throw new Error(
      "statePath does not describe a disposable MergeWitness analysis.",
    );
}
export function dispose({ analysisId, statePath }) {
  const a = loadAnalysis(analysisId, statePath);
  assertDisposableState(a, statePath);
  safeRemove(a.root);
  analyses.delete(analysisId);
  return { analysisId, disposed: true };
}
export const __testing = { analyses, basename, readProbeStatus, run, testSnapshot, probeSnapshot, classify, isStrictDescendant };

import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  __testing,
  dispose,
  evaluate,
  prepare,
  verifyRepair,
} from "../src/core/mergeWitness.mjs";

function fixtureRepo() {
  mkdirSync(resolve("fixtures/.generated"), { recursive: true });
  const root = mkdtempSync(join(resolve("fixtures/.generated"), "core-v2-"));
  const histories = join(root, "histories");
  const generated = spawnSync(
    process.execPath,
    [resolve("fixtures/create-fixtures.mjs"), histories],
    { encoding: "utf8" },
  );
  assert.equal(generated.status, 0, generated.stderr);
  return { root, repo: histories };
}

function passingCheck(path) {
  writeFileSync(
    path,
    "process.stdout.write(JSON.stringify({ status: 'pass', evidence: 'retained' }));\n",
  );
}

test("v2 requirements freeze both origins and strict verification returns retention coverage", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
    });
    const probe = join(fixture.root, "probe.mjs");
    const a = join(fixture.root, "pricing.check.mjs");
    const b = join(fixture.root, "cache.check.mjs");
    passingCheck(probe);
    passingCheck(a);
    passingCheck(b);
    const evaluated = evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      repetitions: 2,
      requirements: [
        { id: "pricing", origin: "branchA", checkPath: a, dependencies: [] },
        { id: "cache", origin: "branchB", checkPath: b, dependencies: [] },
      ],
    });
    assert.equal(evaluated.report.version, 2);
    assert.equal(evaluated.requirements.length, 2);
    assert.deepEqual(
      evaluated.requirements.map((entry) => entry.origin),
      ["branchA", "branchB"],
    );
    assert.equal(
      evaluated.requirements.every(
        (entry) =>
          entry.calibration.kind === "pass" && entry.calibration.consistent,
      ),
      true,
    );
    assert.equal(evaluated.report.probe.featureChecks.length, 2);
    const verified = verifyRepair({
      analysisId: analysis.analysisId,
      candidatePath: analysis.paths.merged,
    });
    assert.equal(verified.passed, true);
    assert.equal(verified.retentionVerified, true);
    assert.deepEqual(verified.retentionCoverage, {
      branchA: true,
      branchB: true,
    });
    assert.equal(
      verified.requirementResults.every(
        (entry) => entry.result.kind === "pass",
      ),
      true,
    );
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("strict verification never uses legacy feature checks as branch coverage", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
    });
    const probe = join(fixture.root, "probe.mjs");
    const legacy = join(fixture.root, "legacy.check.mjs");
    passingCheck(probe);
    passingCheck(legacy);
    evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      featureCheckPaths: [legacy],
      repetitions: 1,
    });
    assert.throws(
      () =>
        verifyRepair({
          analysisId: analysis.analysisId,
          candidatePath: analysis.paths.merged,
        }),
      /v2 requirements.*both branch origins/i,
    );
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("explicit protected test helpers cannot be changed by a candidate", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    const protectedHelper = "harness/ordinary-helper.mjs";
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
      protectedTestPaths: [protectedHelper],
    });
    const probe = join(fixture.root, "probe.mjs");
    const a = join(fixture.root, "a.mjs");
    const b = join(fixture.root, "b.mjs");
    passingCheck(probe);
    passingCheck(a);
    passingCheck(b);
    evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      repetitions: 1,
      requirements: [
        { id: "a", origin: "branchA", checkPath: a, dependencies: [] },
        { id: "b", origin: "branchB", checkPath: b, dependencies: [] },
      ],
    });
    const helper = join(analysis.paths.merged, protectedHelper);
    mkdirSync(dirname(helper), { recursive: true });
    writeFileSync(helper, "export default true;\n");
    const add = spawnSync("git", ["add", "--", protectedHelper], {
      cwd: analysis.paths.merged,
      encoding: "utf8",
    });
    assert.equal(add.status, 0, add.stderr);
    const commit = spawnSync(
      "git",
      [
        "-c",
        "user.name=MergeWitness",
        "-c",
        "user.email=merge@example.invalid",
        "commit",
        "-m",
        "change protected helper",
      ],
      { cwd: analysis.paths.merged, encoding: "utf8" },
    );
    assert.equal(commit.status, 0, commit.stderr);
    assert.throws(
      () =>
        verifyRepair({
          analysisId: analysis.analysisId,
          candidatePath: analysis.paths.merged,
        }),
      /protected test.*ordinary-helper/i,
    );
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("abnormal runtime results are inconclusive and only ETIMEDOUT is a timeout", () => {
  assert.deepEqual(
    __testing.readProbeStatus({
      timedOut: false,
      signal: "SIGTERM",
      error: null,
      exitCode: null,
      stdout: "",
    }),
    { kind: "inconclusive", reason: "signal" },
  );
  assert.deepEqual(
    __testing.readProbeStatus({
      timedOut: true,
      signal: "SIGTERM",
      error: { code: "ETIMEDOUT" },
      exitCode: null,
      stdout: "",
    }),
    { kind: "inconclusive", reason: "timeout" },
  );
  assert.deepEqual(
    __testing.readProbeStatus({
      timedOut: false,
      signal: null,
      error: null,
      exitCode: null,
      stdout: "",
    }),
    { kind: "inconclusive", reason: "nonzero_exit" },
  );
});

test("every declared requirement must calibrate and requirement ids cannot become paths", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
    });
    const probe = join(fixture.root, "probe.mjs");
    const passing = join(fixture.root, "passing.mjs");
    const failing = join(fixture.root, "failing.mjs");
    passingCheck(probe);
    passingCheck(passing);
    writeFileSync(
      failing,
      "process.stdout.write(JSON.stringify({ status: 'fail' }));\n",
    );
    assert.throws(
      () =>
        evaluate({
          analysisId: analysis.analysisId,
          probePath: probe,
          requirements: [
            {
              id: "../escape",
              origin: "branchA",
              checkPath: passing,
              dependencies: [],
            },
          ],
          repetitions: 1,
        }),
      /requirement id/i,
    );
    const result = evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      requirements: [
        {
          id: "a-passing",
          origin: "branchA",
          checkPath: passing,
          dependencies: [],
        },
        {
          id: "a-failing",
          origin: "branchA",
          checkPath: failing,
          dependencies: [],
        },
        {
          id: "b-passing",
          origin: "branchB",
          checkPath: passing,
          dependencies: [],
        },
      ],
      repetitions: 1,
    });
    assert.equal(result.report.probe.strictEligible, false);
    assert.throws(
      () =>
        verifyRepair({
          analysisId: analysis.analysisId,
          candidatePath: analysis.paths.merged,
        }),
      /both branch origins/i,
    );
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("evaluation report has an attempt identity and runtime metadata", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
    });
    const probe = join(fixture.root, "probe.mjs");
    passingCheck(probe);
    const result = evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      repetitions: 1,
    });
    assert.match(result.report.evaluationId, /^[0-9a-f-]{36}$/i);
    assert.equal(result.report.runtime.node, process.version);
    assert.equal(typeof result.report.runtime.platform, "string");
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("redundant branch references prepare as clean disposable snapshots", () => {
  const fixture = fixtureRepo();
  const prepared = [];
  try {
    for (const [branchARef, branchBRef] of [
      ["base", "tenant-pricing"],
      ["tenant-pricing", "tenant-pricing"],
      ["base", "base"],
    ]) {
      const analysis = prepare({
        repoPath: fixture.repo,
        baseRef: "base",
        branchARef,
        branchBRef,
      });
      prepared.push(analysis);
      assert.equal(analysis.merge.clean, true);
      assert.equal(analysis.normalTests.merged.exitCode, 0);
    }
  } finally {
    for (const analysis of prepared)
      dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("failed prepare leaves no in-memory analysis", () => {
  const fixture = fixtureRepo();
  const before = __testing.analyses.size;
  try {
    assert.throws(
      () =>
        prepare({
          repoPath: fixture.repo,
          baseRef: "missing-ref",
          branchARef: "tenant-pricing",
          branchBRef: "sku-cache",
        }),
      /rev-parse/,
    );
    assert.equal(__testing.analyses.size, before);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("repair attempts write independent immutable reports", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = prepare({
      repoPath: fixture.repo,
      baseRef: "base",
      branchARef: "tenant-pricing",
      branchBRef: "sku-cache",
    });
    const probe = join(fixture.root, "probe.mjs");
    const a = join(fixture.root, "a.mjs");
    const b = join(fixture.root, "b.mjs");
    passingCheck(probe);
    passingCheck(a);
    passingCheck(b);
    evaluate({
      analysisId: analysis.analysisId,
      probePath: probe,
      repetitions: 1,
      requirements: [
        { id: "a", origin: "branchA", checkPath: a, dependencies: [] },
        { id: "b", origin: "branchB", checkPath: b, dependencies: [] },
      ],
    });
    const first = verifyRepair({
      analysisId: analysis.analysisId,
      candidatePath: analysis.paths.merged,
    });
    const bytes = readFileSync(first.reportPath);
    const second = verifyRepair({
      analysisId: analysis.analysisId,
      candidatePath: analysis.paths.merged,
    });
    assert.notEqual(first.reportPath, second.reportPath);
    assert.notEqual(first.verificationId, second.verificationId);
    assert.deepEqual(readFileSync(first.reportPath), bytes);
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

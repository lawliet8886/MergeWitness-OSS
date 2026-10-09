import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  dispose,
  evaluate,
  prepare,
  verifyRepair,
} from "../src/core/mergeWitness.mjs";

function fixtureRepo() {
  mkdirSync(resolve("fixtures/.generated"), { recursive: true });
  const root = mkdtempSync(join(resolve("fixtures/.generated"), "windows-common-"));
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
  writeFileSync(path, "process.stdout.write(JSON.stringify({ status: 'pass' }));\n");
}

function preparedAnalysis(fixture) {
  const analysis = prepare({
    repoPath: fixture.repo,
    baseRef: "base",
    branchARef: "tenant-pricing",
    branchBRef: "sku-cache",
  });
  const probe = join(fixture.root, "probe.mjs");
  const pricing = join(fixture.root, "pricing.check.mjs");
  const cache = join(fixture.root, "cache.check.mjs");
  passingCheck(probe);
  passingCheck(pricing);
  passingCheck(cache);
  evaluate({
    analysisId: analysis.analysisId,
    probePath: probe,
    repetitions: 1,
    requirements: [
      { id: "pricing", origin: "branchA", checkPath: pricing, dependencies: [] },
      { id: "cache", origin: "branchB", checkPath: cache, dependencies: [] },
    ],
  });
  return analysis;
}

function lowercaseDrive(path) {
  return path.replace(/^([A-Z]):/, (_, drive) => `${drive.toLowerCase()}:`);
}

test(
  "a valid worktree remains owned when Git metadata uses a drive-case alias",
  { skip: process.platform !== "win32" && "Windows-specific filesystem spelling" },
  () => {
    const fixture = fixtureRepo();
    let analysis;
    try {
      analysis = preparedAnalysis(fixture);
      const clonePath = resolve(analysis.paths.merged, "..", "..");
      const candidate = join(lowercaseDrive(clonePath), "snapshots", "drive-case-alias");
      const added = spawnSync(
        "git",
        ["-C", lowercaseDrive(clonePath), "worktree", "add", "--detach", candidate, analysis.commits.merged],
        { encoding: "utf8" },
      );
      assert.equal(added.status, 0, added.stderr);
      const drive = /^([a-z]):/.exec(candidate)?.[1];
      assert.ok(drive, "The Windows candidate must use a lowercase drive alias.");
      const pointerPath = join(candidate, ".git");
      const originalPointer = readFileSync(pointerPath, "utf8");
      assert.match(originalPointer, /^gitdir:\s*[A-Za-z]:/m);
      const aliasPointer = originalPointer.replace(
        /^(gitdir:\s*)[A-Za-z]:/m,
        `$1${drive}:`,
      );
      assert.equal(Buffer.byteLength(aliasPointer), Buffer.byteLength(originalPointer));
      // Git marks the pointer hidden on Windows; update the existing file in place.
      writeFileSync(pointerPath, aliasPointer, { flag: "r+" });
      assert.match(
        readFileSync(pointerPath, "utf8"),
        new RegExp(`^gitdir:\\s*${drive}:`, "m"),
      );
      assert.equal(
        verifyRepair({
          analysisId: analysis.analysisId,
          candidatePath: candidate,
        }).passed,
        true,
      );
    } finally {
      if (analysis) dispose({ analysisId: analysis.analysisId });
      rmSync(fixture.root, { recursive: true, force: true });
    }
  },
);

test("an independent clone nested in the analysis clone is not an owned worktree", () => {
  const fixture = fixtureRepo();
  let analysis;
  try {
    analysis = preparedAnalysis(fixture);
    const clonePath = resolve(analysis.paths.merged, "..", "..");
    const foreign = join(clonePath, "foreign-candidate");
    const cloned = spawnSync(
      "git",
      ["clone", "--no-hardlinks", analysis.paths.merged, foreign],
      { encoding: "utf8" },
    );
    assert.equal(cloned.status, 0, cloned.stderr);
    assert.throws(
      () =>
        verifyRepair({
          analysisId: analysis.analysisId,
          candidatePath: foreign,
        }),
      /Candidate worktree must belong to this analysis clone/,
    );
  } finally {
    if (analysis) dispose({ analysisId: analysis.analysisId });
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

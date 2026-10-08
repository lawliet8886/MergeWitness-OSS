# MergeWitness v2 API

Import `prepare`, `evaluate`, `verifyRepair`, and `dispose` from installed `mergewitness-core`. The same objects are accepted as JSON by the CLI. `mergewitness-mcp` exposes the four operations over the existing stdio JSON-RPC transport; no Claude/OpenAI integration or SDK conformance claim is implied.

## Prepare

```js
const prepared = prepare({
  repoPath: '/absolute/path/to/trusted-repository',
  baseRef: 'base', branchARef: 'change-a', branchBRef: 'change-b',
  testCommand: ['node', '--test'],
  protectedTestPaths: ['support/oracle.mjs', 'fixtures/expected.json'],
});
```

The source repository is read-only; merges and repairs occur in a private clone. Equal/redundant references are valid. Real textual conflicts are distinguished from operational Git failures. `protectedTestPaths` identifies repository-relative harness inputs beyond discovered tests/configuration; it does not freeze production modules that need repair.

## Freeze and evaluate

```js
const evaluated = evaluate({
  analysisId: prepared.analysisId, statePath: prepared.statePath,
  probePath: '/absolute/path/to/checks/sequence.mjs',
  probeDependencies: ['/absolute/path/to/checks/observations.mjs'],
  requirements: [
    { id: 'tenant-pricing', origin: 'branchA', checkPath: '/absolute/path/to/checks/pricing.mjs', dependencies: [] },
    { id: 'cache', origin: 'branchB', checkPath: '/absolute/path/to/checks/cache.mjs', dependencies: [] },
  ],
  repetitions: 3,
});
```

Checks print a final JSON line with `status:'pass'` or `status:'fail'` and optional deterministic `evidence`. Both structured outcomes use exit zero. Nonzero exits, signals, process errors, timeouts, malformed output and differing repeated observations are inconclusive.

The same frozen probe runs in Base/A/B/Combined. Requirements have unique IDs and an explicit branch origin, are calibrated there, and are repeated in a candidate. Checks are assertions authored by the caller: the tool cannot infer whether they adequately represent a feature. Legacy `featureCheckPaths` remain available for evaluation but never establish A/B coverage for strict approval.

Declared helper/data dependencies must be regular files within the check directory; their relative structure and hashes are preserved. Keep check bundles self-contained except Node builtins and production modules selected from the evaluated snapshot. Undeclared dynamic, absolute or package imports, environment inputs and external services are outside the attestation; they are not automatically discovered or certified. Non-reproducible external check dependencies are unsupported.

Classification distinguishes ordinary-test failure, inconclusive execution, preexisting violation, branch violation, interaction witness and no witness found. A failure already present in A or B is not merge-specific evidence.

## Verify and dispose

```js
const verified = verifyRepair({
  analysisId: prepared.analysisId, statePath: prepared.statePath,
  candidatePath: prepared.paths.merged,
});
dispose({ analysisId: prepared.analysisId, statePath: prepared.statePath });
```

Before verification, commit the repair in that disposable candidate. Dirty candidates, altered test/configuration/harness inputs and mutations during execution are rejected. `passed` requires a stable passing probe, passing ordinary tests and all calibrated requirements retained. `retentionVerified` and `requirementResults` show the declared coverage. This is not proof of arbitrary repair correctness.

Each attempt has its own report path; retain or copy reports before disposal. Historical v1 reports remain readable as JSON, but v1 analyses require fresh v2 preparation before strict approval. State and frozen files are trusted private inputs; manual alteration invalidates the evidence chain.

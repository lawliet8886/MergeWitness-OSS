# Use a trusted Node repository

This walkthrough uses the existing MergeWitness **0.3.1 / v2** interfaces. First reproduce a known synthetic interaction with explicit lifecycle steps; then replace its inputs with your own reviewed project. Node.js 22+, Git on PATH and a source checkout are required. The companion files are source examples, **not included in the existing 0.3.1 tarball**. No npm install, API key or model call is needed for Part 1. See [QUICKSTART.md](QUICKSTART.md) for installing the unchanged release and [API.md](API.md) for the contract. [Português](USE_YOUR_REPOSITORY_PT_BR.md).

Run only trusted, reviewed code. Git worktrees and subprocesses are not hardened sandboxes. The supported ordinary test command is exactly `["node", "--test"]`; this is not a route for arbitrary test runners or non-reproducible external services.

## 1. Reproduce the trusted example

Clone the [maintained source](https://github.com/lawliet8886/MergeWitness-OSS) and enter its directory. Run the following commands from that source root in PowerShell, Linux or macOS shells. Windows and Linux have product acceptance evidence; this tutorial's acceptance was run on Windows, not macOS.

```sh
node --version
git --version
node src/cli/mergewitness.mjs --version
node examples/trusted-repository/tutorial.mjs init "artifacts/own repository tutorial"
node src/cli/mergewitness.mjs prepare "artifacts/own repository tutorial/prepare.request.json" "artifacts/own repository tutorial/prepared.json"
node examples/trusted-repository/tutorial.mjs requests "artifacts/own repository tutorial"
node src/cli/mergewitness.mjs evaluate "artifacts/own repository tutorial/evaluate.request.json" "artifacts/own repository tutorial/evaluated.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" evaluation
```

Use a **new, nonexistent** tutorial area. `init` refuses an existing path, so a repeat must choose another name throughout the commands. It runs the existing synthetic fixture generator only inside that new area's `workspace`; it does not generate a history in your own project or in the checkout's shared `fixtures/.generated`. The generator also creates an unused priority/cursor history in this isolated area. The helper never performs the MergeWitness lifecycle itself: the visible `prepare`, `evaluate`, `verify-repair`, `report` and `dispose` calls above/below are the existing CLI.

The trusted source lives at `<area>/workspace/fixtures/.generated/tenant-cache-history`. Base returns global prices; A (`tenant-pricing`) adds tenant overrides; B (`sku-cache`) caches by SKU. Ordinary tests pass in all four snapshots, but A+B returns alpha's cached price to beta. The sequence first reads alpha, then beta in the same catalog, and compares beta with a fresh catalog. Three repetitions produce stable evidence: Base/A/B `pass`; Combined (`merged`) `fail`, expected `100`, observed `90`; classification `interaction_witness`.

The generated `evaluate.request.json` declares `observations.mjs` in both `probeDependencies` and each requirement's `dependencies`. That helper imports Node builtins and the selected snapshot's `src/catalog.js`; there are no package imports, environment inputs or external services. `tenant-pricing` is calibrated in `branchA`; `sku-cache` in `branchB`, observing source reads through a Proxy as well as the counter. Declared helpers must be regular files within the check directory; relative structure and hashes are frozen. Unlisted dynamic/absolute/package imports or data dependencies are not automatically discovered or attested.

Inspect the **actual returned** paths in the JSON; never substitute a guessed temporary directory:

| Response | Fields used by this route |
| --- | --- |
| `prepared.json` | `analysisId`, `statePath`, `paths.base`, `paths.branchA`, `paths.branchB`, `paths.merged`, resolved `commits`, `normalTests`, `merge.clean` |
| `evaluated.json` | `classification`, `matrix.<snapshot>.kind`, `.consistent`, `.runs`, `requirements[].calibration`, `probeManifest`, `reportPath` |
| `good.json` / `bad.json` | `passed`, `retentionVerified`, `retentionCoverage`, `probe`, `normalTests`, `requirementResults`, distinct `reportPath` per attempt |
| HTML report response | exact `reportPath` to open locally |

`statePath` is the returned private mutable analysis state, usually under the OS temporary directory. `paths.merged` is the disposable candidate worktree, not your source. `reportPath` refers to a canonical report inside that analysis; it will disappear on disposal. Responses in the tutorial area are useful records but are not a replacement for copying the canonical reports. The state and frozen files are trusted inputs: do not edit them.

Apply the supplied valid nested-map repair, **commit it in the candidate**, verify and save its report:

```sh
node examples/trusted-repository/tutorial.mjs repair "artifacts/own repository tutorial" good
node src/cli/mergewitness.mjs verify-repair "artifacts/own repository tutorial/verify.request.json" "artifacts/own repository tutorial/good.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" good
node src/cli/mergewitness.mjs report "artifacts/own repository tutorial/saved/evaluation.json" --repair "artifacts/own repository tutorial/saved/good.json" --out "artifacts/own repository tutorial/html good"
```

Expected: `passed:true`, `retentionVerified:true`, ordinary tests and probe pass, and both requirements pass. The repair is supplied from the existing `src/bob-repairs/tenant-cache/catalog.fixed.js`; it is not generated by the tool. The helper prints the candidate path and committed HEAD, and does not change global Git configuration.

Now apply the deliberate false repair in the **same candidate**. It preserves prices by removing the cache:

```sh
node examples/trusted-repository/tutorial.mjs repair "artifacts/own repository tutorial" bad
node src/cli/mergewitness.mjs verify-repair "artifacts/own repository tutorial/verify.request.json" "artifacts/own repository tutorial/bad.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" bad
node src/cli/mergewitness.mjs report "artifacts/own repository tutorial/saved/evaluation.json" --repair "artifacts/own repository tutorial/saved/bad.json" --out "artifacts/own repository tutorial/html bad"
node src/cli/mergewitness.mjs dispose "artifacts/own repository tutorial/dispose.request.json" "artifacts/own repository tutorial/disposed.json"
```

The bad `verify-repair` command intentionally exits **1**, but writes `bad.json`. Run the following commands individually even after that expected rejection; do not use a shell chain that stops there. Expect `probe.kind:"pass"` but `passed:false`, `retentionVerified:false` and the cache requirement `fail`. Existing cache tests also fail: this example does not claim that retention alone caught the removal. Each attempt has a different canonical report path; both saved reports remain. Open the returned HTML paths. Report exit zero only means that a file was generated, not that the repair passed.

**Save evidence before disposal.** `saved/evaluation.json`, `saved/good.json` and `saved/bad.json` are exact copied canonical bytes. These contain local paths and execution output; review/redact before sharing, and keep originals privately. `dispose` removes private analysis state/worktrees, while the generated trusted source, saved reports and HTML remain. The source repository's files, Git history and current branch are preserved throughout preparation and verification.

### Inconclusive control and repetition

Use another fresh area to see why exit zero is not enough. The supplied control emits malformed final output, so all probe observations are inconclusive even though the process exits zero:

```sh
node examples/trusted-repository/tutorial.mjs init "artifacts/inconclusive tutorial" inconclusive
node src/cli/mergewitness.mjs prepare "artifacts/inconclusive tutorial/prepare.request.json" "artifacts/inconclusive tutorial/prepared.json"
node examples/trusted-repository/tutorial.mjs requests "artifacts/inconclusive tutorial"
node src/cli/mergewitness.mjs evaluate "artifacts/inconclusive tutorial/evaluate.request.json" "artifacts/inconclusive tutorial/evaluated.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/inconclusive tutorial" evaluation
node src/cli/mergewitness.mjs report "artifacts/inconclusive tutorial/saved/evaluation.json" --out "artifacts/inconclusive tutorial/html"
node src/cli/mergewitness.mjs dispose "artifacts/inconclusive tutorial/dispose.request.json" "artifacts/inconclusive tutorial/disposed.json"
```

Expected classification: `inconclusive`, never pass. To run the preexisting control, use a third fresh path and replace the `init` scenario with `preexisting`; repeat these same lifecycle commands with that path. It emits stable structured `fail` in Base too and returns `preexisting_violation`, not interaction-only evidence. Existing outputs are not overwritten by later fresh runs. The narrow automated reproduction is `node --test tests/trusted-repository-tutorial.test.mjs`; it checks paths containing spaces, source and previous-output byte preservation, both repairs and both controls.

## 2. Replace the inputs with your own project

Do not use the tutorial generator or `repair` helper on your project. Use the existing CLI or [v2 API](API.md) directly. Review every revision and check before execution; save your existing work first. MergeWitness resolves **committed** revisions, not unsaved working-tree edits. Choose the common base and the two intended changes, preferably immutable commit IDs, and keep your application interfaces and required branch features explicit.

1. Author and review one operation sequence that can expose the suspected interaction. It runs unchanged in Base/A/B/Combined. Exercise real operations and deterministic evidence; do not merely assert the desired final answer. Author a separate feature-retention assertion for each branch, with unique IDs and explicit origins. Calibrate a requirement in its own origin even if it is absent from Base.
2. Put checks and all helper/data files in a self-contained directory outside the candidate. A check prints its **final** JSON line with `status:"pass"` or `status:"fail"`; either structured outcome exits zero. Nonzero exits, timeouts, signals, malformed output or differing repeated observations are inconclusive. Use deterministic evidence: timestamps/random IDs in output can make repetitions disagree.
3. Set `repoPath`, the three revisions, `protectedTestPaths`, the sequence and all requirement/helper paths. Protect repository harness inputs such as expected data beyond the automatically discovered tests/configuration; do not freeze production modules you intend to repair. The only supported ordinary runner remains `node --test`. Dependencies needed by the project must already be reproducible in the evaluated snapshots; the tool does not install them or provide arbitrary dependency provisioning.

For example, save an edited `prepare.request.json` outside your repository (replace these illustrative absolute paths/revisions):

```json
{
  "repoPath": "/absolute/path/to/trusted-node-project",
  "baseRef": "BASE_COMMIT",
  "branchARef": "CHANGE_A_COMMIT",
  "branchBRef": "CHANGE_B_COMMIT",
  "testCommand": ["node", "--test"],
  "protectedTestPaths": ["test", "support/expected.json"]
}
```

```sh
node src/cli/mergewitness.mjs prepare prepare.request.json prepared.json
```

For an installed release replace `node src/cli/mergewitness.mjs` with `node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs` throughout. In JSON on Windows, use `C:/path with spaces/...` or escaped backslashes. Create `evaluate.request.json` using the **returned** `analysisId` and `statePath`:

```json
{
  "analysisId": "RETURNED_ANALYSIS_ID",
  "statePath": "/exact/returned/analysis-state.json",
  "probePath": "/absolute/path/to/checks/sequence.mjs",
  "probeDependencies": ["/absolute/path/to/checks/observations.mjs"],
  "requirements": [
    { "id": "feature-a", "origin": "branchA", "checkPath": "/absolute/path/to/checks/feature-a.mjs", "dependencies": ["/absolute/path/to/checks/observations.mjs"] },
    { "id": "feature-b", "origin": "branchB", "checkPath": "/absolute/path/to/checks/feature-b.mjs", "dependencies": [] }
  ],
  "repetitions": 3
}
```

```sh
node src/cli/mergewitness.mjs evaluate evaluate.request.json evaluated.json
```

This is caller-authored coverage. The tool does not discover features, generate tests, infer complete requirements or certify undeclared dependencies. Repetition checks observed stability, not universal correctness. Interpret `text_conflict`, ordinary-test failures and inconclusive observations before attempting a repair. `preexisting_violation` means Base already fails; `branch_violation` means A or B already fails; neither is an interaction witness. `no_witness_found` means this supplied sequence exposed no interaction, not that every merge is safe.

If the merge is clean and evaluation provides usable evidence, edit only the returned `prepared.paths.merged` candidate, preserving all frozen checks/configuration. Commit your candidate changes there with Git before `verify-repair`. A dirty candidate or changed protected inputs is rejected. Create `verify.request.json` with the same returned identity and `candidatePath` equal to that worktree:

```json
{ "analysisId": "RETURNED_ANALYSIS_ID", "statePath": "/exact/returned/analysis-state.json", "candidatePath": "/exact/returned/clone/snapshots/merged" }
```

```sh
node src/cli/mergewitness.mjs verify-repair verify.request.json verified.json
```

Inspect `passed`, the repeated probe, normal tests and every `requirementResults` entry. Preserve each canonical `reportPath` with a new filename before another attempt or disposal; copy the evaluation and repair report bytes unchanged. Generate a local report from those saved canonical files with the same `report` syntax as Part 1. Finally create `dispose.request.json` containing only the returned `analysisId`/`statePath` and run:

```sh
node src/cli/mergewitness.mjs dispose dispose.request.json disposed.json
```

This ends the analysis, not adoption of a repair in your project. Applying a reviewed candidate to the real repository is your separate Git workflow. Keep reports and the source unchanged until you have reviewed what was actually verified.

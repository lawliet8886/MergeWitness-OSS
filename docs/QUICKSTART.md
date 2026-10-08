# Install and reproduce MergeWitness locally

Prerequisites: Node.js 22 or newer, npm, and Git on PATH. The core has no npm runtime dependencies and the demonstration needs no API key.

The current version is a **local tarball**, not a published npm release. In this checkout:

```sh
npm pack --ignore-scripts --pack-destination ./artifacts
```

Copy `mergewitness-core-0.3.0.tgz` into a separate working directory. Verify its SHA-256 against the accompanying SHA256SUMS before installation. Install without network requests or install hooks:

```sh
npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.3.0.tgz
```

PowerShell:

```powershell
.\mw-tools\node_modules\.bin\mergewitness.cmd --help
.\mw-tools\node_modules\.bin\mergewitness.cmd --version
.\mw-tools\node_modules\.bin\mergewitness.cmd demo tenant-cache --out .\mw-demo
```

Linux/macOS:

```sh
./mw-tools/node_modules/.bin/mergewitness --help
./mw-tools/node_modules/.bin/mergewitness --version
./mw-tools/node_modules/.bin/mergewitness demo tenant-cache --out ./mw-demo
```

Each invocation creates its own run directory. The demo generates synthetic Git history, evaluates a frozen operation-sequence probe, applies the retained nested-map repair in a disposable clone, verifies separate tenant-pricing and cache requirements, and removes the private clone. It leaves portable evaluation and repair JSON in your output directory; it never writes into the installed package.

Expected version: `0.3.0`. Expected result: Base/A/B probe pass, Combined fails, candidate repair passes, `retentionVerified:true`. The known synthetic demo has two repetitions and a supplied repair, not an automatically generated correction. Inspect the JSON instead of treating an exit code as a general correctness proof. A second invocation must keep the first run's reports unchanged. Linux and Windows are tested; the macOS command is syntactically applicable but macOS acceptance has not been run.

## Read the offline HTML report

Use the demo's returned `outputDir`, replacing `<demo-outputDir>` below:

```sh
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs report "<demo-outputDir>/evaluation.public.json" --repair "<demo-outputDir>/repair.public.json" --out ./mw-reports
```

Open the returned `reportPath` in a browser. It shows **Interaction witness found** and **Declared checks passed** for this known example, with the observed wrong price and both frozen feature checks. It is self-contained, with no JavaScript or network assets. The original JSON remains the evidence. Report generation does not re-run checks; exit zero means a file was generated, not that every behavior is correct.

An evaluation alone may omit `--repair`; the view explicitly says a correction was not provided. Only the supported core/portable v2 report objects are accepted. Mismatched pairs, old formats and contradictory passing claims are rejected. Keep portable evaluation bytes unchanged so their exact digest still matches the repair. See [REPORTS.md](REPORTS.md) and the executable PowerShell sequence in the [Portuguese guide](QUICKSTART_PT_BR.md).

## Run directly from source

```sh
node src/cli/mergewitness.mjs demo tenant-cache --out ./artifacts/demo
node scripts/test.mjs
node scripts/run-corpus.mjs
```

The source corpus contains eight synthetic cases and four known public incident replays (DataLoader, lru-cache, fastq), with pinned modules and retained licenses. Those public cases are known-regression replay in a minimal harness, not evidence of a clean upstream merge failure. See `fixtures/cases/PROVENANCE.md`. The installed demo stays small; the full corpus is run from the source checkout.

## Installation problems

Confirm `node --version`, `npm --version` and `git --version` before running. Use an existing tarball path and a new prefix; the offline command cannot download a missing release. If a command fails, preserve stderr, runtime/OS and the attempted command, removing personal paths or secrets before sharing. Do not treat a partial run as success or disable checks to get a green result.

## Use your own trusted Node repository

`mergewitness prepare request.json response.json`, `evaluate`, `verify-repair`, and `dispose` retain analysis state across processes. Request paths are supplied explicitly; only `node --test` is supported. See `docs/API.md` for the v2 contract. The state file is private mutable workflow state and must remain intact. Dispose analyses after inspecting their evidence.

Run only reviewed, trusted code. Worktrees and subprocesses are not a hardened sandbox. Passing results cover the declared checks and dependencies, not every behavior or environment.

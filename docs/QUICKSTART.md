# Install and reproduce MergeWitness locally

Prerequisites: Node.js 22 or newer, npm, and Git on PATH. The core has no npm runtime dependencies and the demonstration needs no API key.

Download `mergewitness-core-0.3.1.tgz` and `SHA256SUMS` from the [GitHub release candidate](https://github.com/lawliet8886/MergeWitness-OSS/releases/tag/v0.3.1). Verify the downloaded archive against the `SHA256SUMS` published with the release. There is no npm registry release.

To build your own tarball instead, clone the source and create its ignored output directory first:

```sh
git clone https://github.com/lawliet8886/MergeWitness-OSS.git
cd MergeWitness-OSS
node -e "require('node:fs').mkdirSync('artifacts',{recursive:true})"
npm pack --ignore-scripts --pack-destination ./artifacts
```

Copy the tarball into a separate working directory. Verify the downloaded release against its accompanying SHA256SUMS before installation. A source rebuild can have a different hash because packaging conditions can differ; compute and retain that build's own hash instead of borrowing the official release checksum. Install without network requests or install hooks:

```sh
npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.3.1.tgz
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

Expected version: `0.3.1`. Expected result: Base/A/B probe pass, Combined fails, candidate repair passes, `retentionVerified:true`. The known synthetic demo has two repetitions and a supplied repair, not an automatically generated correction. Inspect the JSON instead of treating an exit code as a general correctness proof. A second invocation must keep the first run's reports unchanged. Linux and Windows are tested; the macOS command is syntactically applicable but macOS acceptance has not been run.

## Read the offline HTML report

Use the demo's returned `outputDir`, replacing `<demo-outputDir>` below:

```sh
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs report "<demo-outputDir>/evaluation.public.json" --repair "<demo-outputDir>/repair.public.json" --out ./mw-reports
```

Open the returned `reportPath` in a browser. It shows **Interaction witness found** and **Declared checks passed** for this known example, with the observed wrong price and both frozen feature checks. It is self-contained, with no JavaScript or network assets. The original JSON remains the evidence. Report generation does not re-run checks; exit zero means a file was generated, not that every behavior is correct.

An evaluation alone may omit `--repair`; the view explicitly says a correction was not provided. Only the supported core/portable v2 report objects are accepted. Mismatched pairs, old formats and contradictory passing claims are rejected. Keep portable evaluation bytes unchanged so their exact digest still matches the repair. See [REPORTS.md](REPORTS.md) and the executable PowerShell sequence in the [Portuguese guide](QUICKSTART_PT_BR.md).

## Run directly from source

Use the cloned repository directory, not an installed package directory:

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

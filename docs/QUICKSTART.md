# Install and reproduce MergeWitness locally

Prerequisites: Node.js 22 or newer, npm, and Git on PATH. The core has no npm runtime dependencies and the demonstration needs no API key.

The current version is a **local tarball**, not a published npm release. In this checkout:

```sh
npm pack --ignore-scripts --pack-destination ./artifacts
```

Copy `mergewitness-core-0.2.0.tgz` into a separate working directory. Install without network requests or install hooks:

```sh
npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.2.0.tgz
```

PowerShell:

```powershell
.\mw-tools\node_modules\.bin\mergewitness.cmd --help
.\mw-tools\node_modules\.bin\mergewitness.cmd demo tenant-cache --out .\mw-demo
```

Linux/macOS:

```sh
./mw-tools/node_modules/.bin/mergewitness --help
./mw-tools/node_modules/.bin/mergewitness demo tenant-cache --out ./mw-demo
```

Each invocation creates its own run directory. The demo generates synthetic Git history, evaluates a frozen operation-sequence probe, applies the retained nested-map repair in a disposable clone, verifies separate tenant-pricing and cache requirements, and removes the private clone. It leaves portable evaluation and repair JSON in your output directory; it never writes into the installed package.

Expected result: Base/A/B probe pass, Combined fails, candidate repair passes, `retentionVerified:true`. Inspect the JSON instead of treating an exit code as a general correctness proof. A second invocation must keep the first run's reports unchanged.

## Run directly from source

```sh
node src/cli/mergewitness.mjs demo tenant-cache --out ./artifacts/demo
node scripts/test.mjs
node scripts/run-corpus.mjs
```

The corpus contains eight synthetic cases and two historical DataLoader incident replays with pinned modules and retained licenses. Those public cases are known-regression replay in a minimal harness, not evidence of a clean upstream merge failure. See `fixtures/cases/PROVENANCE.md`.

## Use your own trusted Node repository

`mergewitness prepare request.json response.json`, `evaluate`, `verify-repair`, and `dispose` retain analysis state across processes. Request paths are supplied explicitly; only `node --test` is supported. See `docs/API.md` for the v2 contract. The state file is private mutable workflow state and must remain intact. Dispose analyses after inspecting their evidence.

Run only reviewed, trusted code. Worktrees and subprocesses are not a hardened sandbox. Passing results cover the declared checks and dependencies, not every behavior or environment.

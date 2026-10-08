# MergeWitness

Replay a sequence of operations, compare its observed behavior across trusted Git revisions, and verify a candidate repair against frozen checks for both changes.

This is an independent local evolution of the MIT-licensed IBM Bob prototype. The original [competition repository](https://github.com/lawliet8886/MergeWitness/tree/5b649c4bdf4a9372c9f890816835c100b5be0d01) is preserved. The project keeps its initial name and Signal Foundry attribution; provider support is optional.

## Try the local version

Node >=22 and Git are required. No API key or runtime npm dependency is needed.

```sh
node src/cli/mergewitness.mjs demo tenant-cache --out ./artifacts/demo
```

The same frozen probe passes in Base/A/B, fails in their clean combination, and passes after the retained repair. Independent pricing and externally observed cache checks must still pass. Each run writes distinct portable JSON and cleans its private clone.

For installation from the locally generated v0.3.0 tarball, use the [English quickstart](docs/QUICKSTART.md) or [guia em português](docs/QUICKSTART_PT_BR.md). A public npm release and maintained remote have not been published. The package remains private to prevent accidental npm publication.

Turn the returned demo's `evaluation.public.json` and `repair.public.json` into a readable offline view:

```sh
node src/cli/mergewitness.mjs report evaluation.public.json --repair repair.public.json --out ./artifacts/reports
```

Use the files inside the demo's returned `outputDir`. The HTML shows recorded observations, declared requirements and correction outcomes; it executes no repository code and needs no server. [Report inputs and limits](docs/REPORTS.md) explain identity binding, inconclusive results and safe sharing.

## What works and what remains unvalidated

The Node core, JSON CLI and stdio MCP stages operate on trusted local repositories. Version 2 records explicit A/B requirements, declared dependency manifests, execution failures and attempt-specific reports. Read the [API contract](docs/API.md), [0.3.0 validation receipt](docs/evidence/VALIDATION_0.3.0.md) and preserved [0.2.1 baseline](docs/evidence/VALIDATION_0.2.1.md) for exact commands, outcomes and remaining gates. The scoped [MCP client check](docs/evidence/MCP_0.3.0.md) is separate from an actual Claude/model-assisted workflow, which has not been run.

```sh
node scripts/test.mjs
node scripts/run-corpus.mjs
```

The twelve-case corpus includes compatible/refactor/unobservable controls, feature-removing false repairs, the two original synthetic failures and four pinned public sequence incidents from DataLoader, lru-cache and fastq. [Provenance](fixtures/cases/PROVENANCE.md) distinguishes unchanged published-module replay in a minimal harness from an upstream merge. These cases do not establish general detection efficacy or adoption.

Checks are supplied by the caller. A pass covers those observations and declared inputs. It does not certify every behavior, infer complete feature requirements, freeze undeclared environment dependencies or make arbitrary external code safe. A subprocess/worktree/browser worker is not a hardened sandbox. Only `node --test` is supported.

[QuietClash](https://github.com/arbade/quietclash) and [mumei](https://github.com/iroha924/mumei) overlap with behavioral comparison and frozen-test protection. A scoped executable QuietClash comparison is recorded separately; mumei source was unavailable in this pass. No broad novelty or superiority claim follows. See [positioning and external validation gates](docs/POSITIONING.md).

## Contribute and inspect history

See [CONTRIBUTING.md](CONTRIBUTING.md). Reproducible cases, retention checks and installation failures are useful first contributions when a public remote becomes available. No outreach has been sent.

The [external-validation protocol](docs/EXTERNAL_VALIDATION.md), [free first-pilot kit](docs/PILOT_KIT.md), [startup brief](docs/STARTUP_BRIEF.md) and [release handoff](docs/RELEASE_CHECKLIST.md) are prepared locally. The first integration pilot is limited to one trusted Node repository, one case and up to two sessions. Public distribution, external sessions and any support-program application still require the stated later gates; preparation is not adoption or submission. External installations/cases/returns remain zero.

The unchanged `reports/`, `bob_sessions/`, `web/`, media and submission artifacts document the original competition prototype. New runs write to `artifacts/` or an explicitly selected output directory and do not overwrite those historical reports. The browser laboratory remains a historical replay, separate from current Node verification.

The domain [mergewitness.com.br](https://mergewitness.com.br) is intended for this OSS evolution. A local site update is prepared from the existing Site source but has not been published; its currently live content is not proof of this local version's distribution.

## License and origin

Project software is MIT, copyright © 2026 Signal Foundry; keep the [LICENSE](LICENSE). Upstream commit: `5b649c4bdf4a9372c9f890816835c100b5be0d01`. Original authored probes and retained repair are preserved with their evidence and attribution.

The public corpus vendors unchanged DataLoader 1.4.0 (BSD-3-Clause) and 2.0.0 (MIT), lru-cache 7.4.0/7.4.1 (ISC), fastq 1.16.0/1.17.0 (ISC) and reusify 1.0.4 (MIT), with original notices beside the files. Their licenses are not replaced by the root MIT license. They are not runtime dependencies of the installed core package.

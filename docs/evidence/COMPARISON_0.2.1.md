# Scoped executable comparison

Recorded 2026-10-08. This is a limited workflow comparison, not a detection-rate benchmark, originality claim, or evidence of superiority. MergeWitness uses caller-authored sequence/retention checks; the QuietClash commands below keep its automatic inputs unchanged.

## Tool, setup and calibration

[QuietClash](https://github.com/arbade/quietclash) 0.3.0, MIT, exact source commit `0e2c70fab7d2fea24588f08ce599448858bb56d1`. Windows, Node 24.14.0, npm 11.9.0, Git 2.54.0.windows.1. Source was inspected, dependencies installed locally with `npm ci --ignore-scripts --omit=optional --no-audit --no-fund`; its skill-registration hook was not run, and the optional paid SDK was absent. No provider call or global registration was used.

From that checkout, `node bin/quietclash.js bench --json` exited 0 in 273.010 seconds: nine upstream synthetic scenarios, TP=4, TN=5, FP=0, FN=0, no skipped rows. Those are results on the tool's own planted scenarios, not a general rate. `npm run bench -- --json` produced only the npm banner on Windows; its exit 0 was not accepted as executed calibration.

The five upstream compatible controls were also invoked individually: all completed without a conflict. Four had no candidate; the identical-change control probed one symbol. One scheduled control was interrupted when scheduling changed, then completed under a distinct resumed receipt; its partial logs were preserved.

## Same preserved synthetic histories

The unchanged MergeWitness fixture generator was invoked in a separate scratch directory. Commands from the pinned QuietClash checkout:

```sh
node bin/quietclash.js check --base base --branches tenant-pricing,sku-cache --cwd <tenant-cache-history> --json
node bin/quietclash.js check --base base --branches priority-order,id-cursor --cwd <priority-cursor-history> --json
```

| History | Exit | Seconds | QuietClash observation |
|---|---:|---:|---|
| tenant-cache | 0 | 30.445 | clean merge; overlap 0; probed 1; conflicts 0; skipped 0; one `resolvePrice` -> `createCatalog` contract hint |
| priority-cursor | 0 | 30.171 | clean merge; overlap 0; probed 1; conflicts 0; skipped 0; one `orderItems` -> `createPager` contract hint |

The target probes invoke top-level factories and serialize the results/error signatures. They do not execute the particular `getPrice` / `listPage` operation sequences in the MergeWitness witnesses. Zero alerts or zero skips therefore do **not** establish that those sequences are correct. QuietClash supports async; this pass does not show that every stateful input is unsupported. Different observations or inputs could change its results.

MergeWitness's directed witnesses reproduce both synthetic interaction failures; the tenant repair additionally retains pricing/cache behavior, while no priority/cursor repair is claimed. Authoring those witnesses and retention checks is required work. This comparison does not cover all twelve corpus cases, equivalent probe-generation effort, arbitrary repositories, or a representative population.

## mumei availability

[mumei](https://github.com/iroha924/mumei): `not_run`, current source SHA/license unverified in this pass. Read-only clone exited 128 with repository-not-found; canonical public API/raw source also returned 404. Do not infer why access failed or that the project no longer exists. Previously indexed documentation describes reference-test reruns, frozen checks and test-weakening review; that remains historical overlap evidence. No current component benchmark or Claude Code integration was executed.

## Evidence

Full commands, resolved versions, stdout/stderr, durations and source pointers are in ignored `artifacts/validation-0.2.1/comparison/`. Final verifier exit 0: 77 indexed artifact hashes match, tool source remains clean at its pinned SHA, the fixture generator is unchanged, both target and five control receipts are complete, and mumei is explicitly not-run.

- Evidence index SHA-256: `d8d78a5931e1a6cdf13d021568902f8e991ac6476244fdca12235ad43b7a0217`.
- Comparison-summary SHA-256: `581115649cdc17487fcbfe2eb607e83a938b9eb1c2b0b9c29209ba504acc3968`.

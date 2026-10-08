# Case corpus provenance

The corpus contains eight synthetic controls and four public incident replays. It is a small acceptance corpus, not a general precision/recall benchmark or evidence of adoption.

The public cases use **unchanged published module bytes** in newly authored minimal Git repositories and observation harnesses. They do not recreate an upstream merge. Base/A/B are aliases of the old version, so the correct classification is `preexisting_violation`; the candidate replaces the library with its later published version. The A/B retention labels are verifier input slots, not a claim that an upstream contributor authored those branches. This distinguishes known-regression replay from interaction-only discovery.

## Public incidents

- [DataLoader #97](https://github.com/graphql/dataloader/issues/97): cached results resolve in a different queue cycle from an outstanding fresh batch. The observation primes key 1, requests cached key 1 and fresh key 2, records resolution before releasing the batch, then checks values and dispatched keys.
- [DataLoader #223](https://github.com/graphql/dataloader/pull/223), linked to [#224](https://github.com/graphql/dataloader/issues/224): priming an error for later access must stay quiet until it is loaded; loading it without handling the rejection must remain observable. The observation records events after priming and again after loading in a fresh child process. Version 1.4.0 emits the rejection too early; 2.0.0 emits it on the unhandled load.
- Both are addressed by [PR #222](https://github.com/graphql/dataloader/pull/222), merge commit `06c403bd72abef401dd7619c8ae992f03ed6b7d3`. This is a deliberate timing change, not a claim that all applications should upgrade without review.

## Pinned published modules

| Version | npm gitHead | License | index.cjs SHA-256 |
|---|---|---|---|
| 1.4.0 | f12608e11e0c90bedf7caeecee30dc717a187558 | BSD-3-Clause | e25ed8e107231f08de607929ccddb57175bcfbb34f210e6adee08032512597f0 |
| 2.0.0 | 0c05d28046af19704b67892ef30817b93225d40f | MIT | 89b07565e59292a340e8c168c086e0a6e789c96ee2cc88c296fa7f7f969121f0 |

Sources: `https://registry.npmjs.org/dataloader/-/dataloader-1.4.0.tgz` and `https://registry.npmjs.org/dataloader/-/dataloader-2.0.0.tgz`. Archive SHA-1 values match npm metadata (`bca11d867f5d3f1b9ed9f737bd15970c65dff5c8` and `41eaf123db115987e21ca93c005cd7753c55fe6f`); the original archive SHA-512 integrity is recorded in the validation receipt. Original `LICENSE` files are retained beside each module. The file extension is changed from `.js` to `.cjs` so the copied CommonJS code works under this project's ESM package; its bytes are unchanged.

The library performs Promise/Map/queue operations and has no external module imports, filesystem or network execution. The harness is trusted, reviewed code. This review does not establish a sandbox for arbitrary contributed repositories.

## Retention and holdout policy

Both public replays require ordinary successful loads and repeated-key memoization to remain working. Those checks are calibrated on the old module and repeated on the candidate. The public cases were initially reserved from implementation tuning in `manifest.json`; the incident selection and expected results were reviewed in advance, so this is **not a blind benchmark**. The first primed-error observation did not distinguish these two published versions: it was corrected against PR #223 to observe priming before loading, and its held-out label was withdrawn. The core algorithm was not adjusted to fit either incident. Preserve this failed harness attempt with the final results.

Synthetic provenance remains the preserved Signal Foundry generator and newly authored compatible/unobservable controls. The tenant repair is the retained nested-map repair, unchanged; priority/cursor still has no demonstrated repair in this corpus.

## Added 0.2.1 incidents

- [node-lru-cache #203](https://github.com/isaacs/node-lru-cache/issues/203), fixed by [31d439e](https://github.com/isaacs/node-lru-cache/commit/31d439e2dff09d6d413670a6c6a681b7a7de5f0c): clearing the last stale entry omits disposal callbacks. The harness sets a single entry, advances a controlled clock past TTL, clears twice and observes exactly one dispose/disposeAfter pair. It does not sleep or alter library bytes: a fresh child process supplies a `performance.now` object which the published module captures on import, then restores the global descriptor. Retention checks cover LRU eviction, object identity, overwrite disposal and idempotent fresh-entry cleanup.
- [fastq #80](https://github.com/mcollina/fastq/issues/80), fixed by [PR #81](https://github.com/mcollina/fastq/pull/81), merge `62eb43ef51e08378f2051ddc023285a524c7390e`: pause/resume starts an extra worker while one is active. With concurrency 1, A holds its callback, B waits, and pause/resume must leave only A running. Callbacks are explicitly released after observing this state; no timing race is used. Retention checks cover serial FIFO completion/drain and successful/error callback results with the configured context.

Published pairs are lru-cache 7.4.0 -> 7.4.1 (ISC), fastq 1.16.0 -> 1.17.0 (ISC), with the same published reusify 1.0.4 dependency (MIT). Original module, package metadata and license files are retained in `vendor/`. Fastq/lru main filenames change to `.cjs` when copied; their bytes remain exact. Reusify's original package and filename are copied into the private minimal repository so the unmodified `require('reusify')` resolves normally. The installed MergeWitness core has none of these fixture dependencies.

`vendor-manifest.json` records source hashes, npm gitHead, archive URLs and SHA-256, plus the admission timestamp and oracle hashes. Archive SHA-512 values were checked against npm metadata before copying. `tests/public-integrity.test.mjs` verifies admitted source/oracle bytes. Full download/probe/admission receipts remain under ignored `artifacts/validation-0.2.1/`.

Generated public Git harnesses now commit `* -text` before the first source commit, preserving the bytes when Git's autocrlf setting is true. The runner verifies the actual modules/notices/dependency files in all four prepared snapshots and before/after candidate verification, and emits that proof with the actual repeated-run counts. Earlier Windows execution receipts were subject to LF-to-CRLF conversion; their behavior observations remain recorded, but their byte-identical execution claim is withdrawn. See `docs/evidence/REVIEW_0.2.1.md`.

Expectations were evidence-derived and frozen before integration. Fastq's reserved oracle was also recorded before executing upstream modules (SHA-256 `bb7e54d558fe1d5f51bed3bc5ceeaceafea3b232a150dd525fdbad266c54f834`). Researchers inspected issue/fix sources, so neither is a fully blind benchmark. The core was not changed to fit either case. The initial LRU 7.3.1/7.3.2 selection hypothesis was rejected by source review before replay because that pair did not contain this clear fix; 7.4.0/7.4.1 is the admitted pair.

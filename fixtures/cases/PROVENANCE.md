# Case corpus provenance

The current source corpus contains thirteen entries: eight synthetic cases, four public published-module incident replays, and one minimized concurrent fastq drain-wait variant with a published old module and pinned unmerged/unreleased PR candidate. Historical twelve-case receipts remain unchanged. It is a small acceptance corpus, not a general precision/recall benchmark or evidence of adoption.

The four published-module incident replays use **unchanged published module bytes** in newly authored minimal Git repositories and observation harnesses. They do not recreate an upstream merge. Base/A/B are aliases of the old version, so the correct classification is `preexisting_violation`; their candidates replace the libraries with later published versions. The added drain-wait variant instead uses an unmerged PR candidate, as described below. The A/B retention labels are verifier input slots, not a claim that an upstream contributor authored those branches. This distinguishes known-regression replay from interaction-only discovery.

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

## Bounded fastq #86 retry (2026-10-09)

`public-fastq-drain-waiters` registers 14000 public `drained()` waits while one promise worker is explicitly held, then releases it. It is a minimized **concurrent-wait variant**, not a verified replay of the original sequential 14000-cycle history: the latter exhausted its declared local budget and remains inconclusive. Small old-version 8/512 controls completed. Base/A/B/Combined all retain unchanged fastq 1.17.0 and reusify 1.0.4 bytes, so the expected classification is `preexisting_violation`. A/B are retention input slots, not upstream branches.

The old module emits a captured structured RangeError after completing the work but leaves all waiters unsettled. The incident check requires completion, all 14000 settled waits, the correct work result, an idle queue and one user drain hook. Before-release timing is a separate retention requirement. Retention A checks active/queued/later-cycle/idle waiting and hook timing; retention B checks FIFO, concurrency 1, results, errors and worker context. Neither check requires Promise identity or a particular implementation cache.

The positive candidate copies unchanged [PR #87](https://github.com/mcollina/fastq/pull/87) `queue.js` at `9ca2ef17eec0d95a4c26dda2c28f41e43b2d4ff0`, renamed to `index.cjs` only, with its ISC notice. Its SHA-256 is `09fe02f23371a5979be9771e49d9da5797f3dcabc52b3301a7acfec97d68b0dc`. This is open, unmerged, unreleased PR source, not a published fixed version or our authored correction. It also contains an unrelated empty-resume change, whose general correctness is not established by this case. The separately recorded false candidate changes only old-version `drained()` to an immediately resolved Promise: it removes the observed stack symptom but fails active-wait retention, and MergeWitness rejects it. Both attempts belong to one corpus entry.

`fastq-drain-admission.json` separately freezes the new helper/oracle/candidate/source hashes; the original `vendor-manifest.json`, its oracle bytes, and previous twelve case entries remain unchanged. Burst/retention expectations preceded preliminary PR execution, but preliminary execution preceded formal integration. After an initial successful formal run, partial-retention JSON validation was strengthened and refrozen; both receipts remain under ignored artifacts. No blind, held-out, novelty, efficacy or adoption claim applies.

Fresh trusted local observation workers use a 256 MiB V8 heap limit, a 3-second internal deadline, a 5-second parent timeout and at most 14000 waiters. This is not a full RSS limit or hardened sandbox. Unknown exceptions, timeouts, signals and malformed/partial observations remain inconclusive. Elapsed time, runtime version, error-message wording and exact overflow threshold are retained separately as diagnostics, excluded from stable repeated evidence.

The same frozen helpers run directly with Node/Git and through MergeWitness in three repetitions. Source hashes are checked in every snapshot and before/after both candidate verifications. Ordinary callback/promise queue tests must produce real successful output; the integration test removes only inherited `NODE_TEST_CONTEXT` from its copied child environment. Evaluation, positive/false repair and direct reports are copied and hash-checked before disposing analysis state. Current receipt: `docs/evidence/FASTQ_DRAIN_RETRY_2026-10-09.md`. Core, CLI, MCP, schema and package/version remain unchanged.

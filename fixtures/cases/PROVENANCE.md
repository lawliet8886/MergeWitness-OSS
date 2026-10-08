# Case corpus provenance

The corpus contains eight synthetic controls and two public incident replays. It is a small acceptance corpus, not a general precision/recall benchmark or evidence of adoption.

The public cases use **unchanged published DataLoader module bytes** in a newly authored minimal Git repository and observation harness. They do not recreate an upstream merge. Base/A/B are aliases of the old version, so the correct classification is `preexisting_violation`; the candidate replaces the library with its later published version. This distinguishes known-regression replay from interaction-only discovery.

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

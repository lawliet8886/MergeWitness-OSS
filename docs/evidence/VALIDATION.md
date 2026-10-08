Windows acceptance below consolidates the complete original suite with serial reruns of every failed named check. It is not a clean first-pass full-suite result; original failures are preserved.

# Local validation record

Generated 2026-10-08T04:32:03.985Z by `artifacts/closeout.mjs`. This is local packaging evidence; it does not establish publication, adoption, deployment, hardened isolation, general detection efficacy, or completed browser rendering QA.

## Final suite receipts

| Runtime | Status | Exit | Passed | Failed | Receipt |
| --- | --- | ---: | ---: | ---: | --- |
| windows22 | passed | 0 | 42 | 0 | windows22-consolidated-2026-10-08T04-32-01-829Z |
| windows24 | passed | 0 | 46 | 0 | windows24-consolidated-2026-10-08T04-32-01-806Z |
| linux22 | passed | 0 | 42 | 0 | linux22-suite-2026-10-08T04-05-06-610Z |
| linux24 | passed | 0 | 46 | 0 | linux24-suite-2026-10-08T03-47-37-718Z |

## Earlier unsuccessful receipts

- linux22 2026-10-08T03:00:52.548Z: failed (exit 127, passed n/a, failed n/a; superseded by the later receipt above).
- linux22 2026-10-08T03:46:54.574Z: failed (exit 1, passed 42, failed 1; superseded by the later receipt above).
- linux24 2026-10-08T02:54:52.614Z: failed (exit 1, passed 33, failed 5; superseded by the later receipt above).
- linux24 2026-10-08T03:32:27.572Z: failed (exit 1, passed 36, failed 8; superseded by the later receipt above).
- windows22 2026-10-08T03:00:38.323Z: failed (exit 1, passed 30, failed 5; superseded by the later receipt above).
- windows22 2026-10-08T03:46:50.283Z: superseded (exit n/a, passed n/a, failed n/a; superseded by the later receipt above).
- windows22 2026-10-08T04:04:31.371Z: failed (exit 1, passed 38, failed 4; superseded by the later receipt above).
- windows24 2026-10-08T03:46:30.743Z: failed (exit 1, passed 40, failed 6; superseded by the later receipt above).

## Corpus

The latest 10-case corpus summary is `/mnt/c/Users/biel_/Documents/ChatGPT/MergeWitness-OSS/artifacts/corpus/run-ENE6Y3/summary.json` (corpus manifest SHA-256: `f3eb9ebaf897921b74e0218c14734f0c172c2f36359768963cdee2b054686604`), with `passed=true`. Its stated limit is: Ten small labeled cases, not a general efficacy benchmark. Public cases replay unchanged published library modules inside a newly authored minimal Git harness, not upstream Git merges.

- public-dataloader-cached-batching: preexisting_violation; unchanged published module in a minimal harness, so it is a preexisting violation and not an upstream merge reproduction.
- public-dataloader-primed-error: preexisting_violation; unchanged published module in a minimal harness, so it is a preexisting violation and not an upstream merge reproduction.

## Source preservation

- Frozen original HEAD: `5b649c4bdf4a9372c9f890816835c100b5be0d01`
- Frozen original status: `(clean)`
- Independent OSS remotes: `(none)`
- Original remotes: `origin	https://github.com/lawliet8886/MergeWitness.git (fetch)
origin	https://github.com/lawliet8886/MergeWitness.git (push)`
- OSS LICENSE SHA-256: `a1087f440e978b4b787894a7dc56a232018888f7e73e55edfe0a512a9bba5b47`
- Original LICENSE SHA-256: `a1087f440e978b4b787894a7dc56a232018888f7e73e55edfe0a512a9bba5b47`

## Release artifact

- Tarball: `artifacts/releases/mergewitness-core-0.2.0.tgz`
- SHA-256: `ca98b6571ac3b943bc857ab48fc5441f6dd1ec3311b1fd5a327dd136e0712835`
- Local Site preview copy: `site-preview/dist/downloads/mergewitness-core-0.2.0.tgz`
- Quickstart copy: `site-preview/dist/downloads/QUICKSTART.md`

## UI limitation

The static Site preview returned HTTP 200, but the integrated browser and Chrome recovery attempts timed out. Desktop/mobile rendering, console health, and video playback remain pending; no remote Site source push or deployment occurred.


On early Node 22, one historical TypeScript browser-adapter check is explicitly inapplicable because this runtime does not load TypeScript. All independent JavaScript core, CLI, corpus and installed-package checks run. The unchanged historical browser checks are fully executed on Node 24.

## Final release installation

The exact final tarball was installed offline without hooks/audit in a directory named instalação local. Its actual Windows bin reported 0.2.0 and completed the demo in saída demonstrada, with passed:true, retentionVerified:true and both origins retained. These paths include spaces and accents.

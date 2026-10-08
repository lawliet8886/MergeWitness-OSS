# Independent MergeWitness 0.2 implementation plan

Approved in the conversation on 2026-10-08 UTC. Implementation is local only.

## Goal and defaults

Deliver an independently maintained, locally installable, MIT-licensed Node/JavaScript utility for replaying operation sequences and checking candidate repairs against frozen requirements. No paid provider, automatic test generation, hardened sandbox, publication, or adoption claim is included. Support Node >=22 and exactly `node --test`.

Upstream: https://github.com/lawliet8886/MergeWitness at `5b649c4bdf4a9372c9f890816835c100b5be0d01`. Preserve its checkout, license, attribution, history, and evidence.

## Tasks and ownership

1. Root: independent clone on `oss/local-0.2`, no remotes; preserve baseline log (14/14 on Windows Node 24.14.0).
2. Core: normalize abnormal subprocess exits; conditional merge commits and real conflict detection; preparation rollback; attempt-specific reports; safe disposal after state reload.
3. Core: v2 state/reports; `prepare.protectedTestPaths`; `evaluate.requirements` descriptors `{id, origin:'branchA'|'branchB', checkPath, dependencies:[]}` with unique IDs and both origins; freeze/check dependencies and calibration; repeat candidate retention checks; reject legacy analyses for strict verification.
4. Package: locally packable private `mergewitness-core@0.2.0`, `mergewitness` and `mergewitness-mcp` bins, exported core; whitelist handlers; JSON stage CLI plus `dispose`, `--help`, `--version`, `demo tenant-cache --out <directory>`; per-run demo output and no writes to installation directory.
5. Root: migrate laboratory scripts to v2, retain their provenance and historical reports; documentation for installation/contributions/limits; ten labeled cases (eight synthetic controls, two licensed public incident reproductions), including two held-out cases recorded before behavior changes.
6. Root: obtain a local source snapshot of existing Sites project version 2 and prepare truthful OSS site content; no source push, registration, save-version, or deployment.
7. Root: Windows/Linux Node 22/24 validation, installed-tarball acceptance, final diff/source-preservation readback, independent review and fixes.

## Interface decisions

- `prepare` accepts `protectedTestPaths=[]` (repository-relative files/directories identifying harness inputs). Production modules remain editable.
- `evaluate` accepts explicit `requirements`; legacy `featureCheckPaths` may be frozen for historical compatibility but never establishes A/B coverage. Invalid/missing requirements prevent strict approval. Probe results remain `{status:'pass'|'fail', evidence?:...}`.
- Results preserve useful existing fields, add v2 identifiers, runtime metadata, requirement calibration/results, `retentionCoverage` and `retentionVerified`. `passed` requires conclusive ordinary tests, stable passing probe, full calibrated A/B requirements, and intact protected inputs.
- Freeze relative declared dependencies with original directory structure and check hashes before/after each phase. Dependencies omitted from the declared contract are outside the guarantee; external non-reproducible check dependencies are unsupported for strict approval.
- State v1 is readable as historical JSON, but must be prepared again for v2 repair approval. Candidate/report identity binds to the frozen evaluation rather than a mutable shared report filename.
- Historical report files remain unchanged; new runs use unique output directories. No claim of merge-specific interference when failure also exists in either individual branch.

## Acceptance

Keep all original regression assertions, adapting only newly explicit API contracts. Add tests for signals/errors/timeouts, redundant merges, operational Git errors, failed preparation cleanup, distinct reports, invalid handlers, missing A/B, dependency tampering, feature-removing repairs, legacy state, and valid repair. Installed demo must reproduce Base/A/B pass, combined failure, valid repair pass, and both features retained. Record OS/runtime/commands/exit codes and limitations. Public incidents need exact source/license/version and original versus adapted reproduction labels. Do not turn this corpus into a general efficacy benchmark.

Continue expansion only after an external reproduced regression or repeat use saving work. Five-person installation/return goals are future human validation; outreach is not authorized now.

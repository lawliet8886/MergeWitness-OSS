# MergeWitness 0.2.1 external-validation preparation

Approved in the conversation on 2026-10-08. The execution boundary is local.

## Goal and architecture

Prepare a reproducible release candidate, two additional public sequence incidents, an executable scoped comparison, a rendered site review, and reusable external-validation/application materials. Keep the version-2 core and existing CLI interfaces. Caller-authored checks, declared dependencies and trusted local code remain the contract; do not add provider calls or a general sandbox.

Base: `95ce4b6fd1280c97031c1455238fb4cadb2087ff`. Work on `oss/local-0.2.1` in the already separate OSS checkout. The competition checkout, upstream MIT notice, original history and historical evidence are preserved.

## Tasks

- [x] 1. Prepare 0.2.1 metadata, installation/contribution documentation and local release materials.
- [x] 2. Freeze evidence-derived expected labels before integrating two licensed public incidents outside DataLoader; replay unchanged old/fixed modules and verify retained behaviors. Publish exact provenance and limits. A reserved case is not a fully blind benchmark.
- [x] 3. Pin and inspect QuietClash; run supported scenarios and report commands, setup effort, observations and unsupported/inconclusive outcomes. Inspect mumei availability and independently runnable components; do not infer full Claude Code integration from component tests.
- [ ] 4. Source and exact copied-command acceptance passed; rendered IAB QA remains blocked. Review the local site using the internal browser only, update current package/evidence links and validate source preservation. A failed internal-browser attachment remains a visual-QA blocker; do not operate other PC browser windows.
- [x] 5. Prepare the five-developer protocol, blank evidence collection, release/publication checklist and honest application draft. No external participant, contribution, installation or return visit exists merely because these files exist.
- [x] 6. Run a complete suite per Windows/Linux and Node 22/24 environment, the twelve-case corpus, and exact packed-install acceptance; review the whole change and record failures and final receipts. Commit locally after author/provenance readback.

## External gates

Remote creation/push, release publication, site deployment, outreach and application submission await a subsequent specific user instruction. Future targets are three unaided reproductions in about ten minutes with Node/Git available, two concrete returns within two weeks, and an external reproduced regression or repeat use with observed benefit. They are learning targets, not official OpenAI eligibility thresholds.

Future publication target: a separate `MergeWitness-OSS` repository in the user's authorized account, preserving origin/history; display name stays MergeWitness. Initial distribution is a GitHub release tarball and SHA-256, not public npm. CI changes are prepared locally only.

## Review focus

- A copied/modified module must not be described as unchanged upstream source.
- A known preexisting bug or alias of one revision must not become a real A/B merge claim.
- Missing outcomes, process errors or skipped comparisons must not become PASS.
- The exact packed artifact and site download must agree with the documented version/hash.
- Internal local tests, fixture reconstructions and prepared drafts must not become usage, publication, provider-integration or application-success claims.

## Validation

Use meaningful failing acceptance checks before adding new replay behavior. Keep full logs in ignored artifacts and concise receipts in docs/evidence. Require the final release to install with lifecycle scripts disabled, run without API keys, retain both declared checks and leave its installation directory unchanged. Run `node scripts/test.mjs`, `node scripts/run-corpus.mjs`, scoped comparison commands and site source tests. Record resolved runtime versions, exit codes and actual browser coverage.

# Bounded fastq drain-wait retry — 2026-10-09

## Result and scope

The new source-corpus entry `public-fastq-drain-waiters` reproduces a minimized concurrent-wait variant of [fastq #86](https://github.com/mcollina/fastq/issues/86). One held promise job has 14000 `drained()` callers before release. Unchanged fastq 1.17.0 completes the work but produces a captured `RangeError`, leaving the waiters unsettled. All four old-version aliases fail in three repetitions, correctly classified as `preexisting_violation`.

The unchanged candidate from [open PR #87](https://github.com/mcollina/fastq/pull/87), pinned to `9ca2ef17eec0d95a4c26dda2c28f41e43b2d4ff0`, passes the incident and both retention checks. A deliberately false candidate changes only the old `drained()` implementation to resolve immediately. It passes the incident symptom check but fails active-wait retention and is rejected. Both repair attempts belong to one entry: the source corpus now has eight synthetic cases, four published-module incident replays and this variant, thirteen total.

| Direct checks, three repetitions each | Incident | Active-wait retention | Queue-contract retention |
|---|---|---|---|
| Published old module | fail ×3 | pass ×3 | pass ×3 |
| Pinned PR source | pass ×3 | pass ×3 | pass ×3 |
| Immediate-wait false candidate | pass ×3 | fail ×3 | pass ×3 |

Active-wait retention covers pending active/queued work, final drain notification, a fresh later cycle and idle waits. Queue-contract retention covers FIFO, concurrency one, worker context, returned values, rejected tasks and error notifications. Promise identity is not a requirement. The same frozen helpers execute directly under Node/Git and through MergeWitness. Actual ordinary callback and promise tests execute in all four snapshots and both candidates; empty successful subprocess output cannot satisfy that acceptance check.

## Interpretation limits

The original sequential reproduction remains inconclusive. A previous 20000-cycle attempt timed out without observations; this retry's sequential 14000-cycle observation stopped at its declared budget after 7915 cycles. Small sequential 8/512/2000 and concurrent 8/512 controls completed. The concurrent result does not replace those historical receipts.

The PR was open, unmerged and unreleased when reviewed. Its complete pinned source includes an unrelated empty-queue resume change, whose general correctness is outside this case. The sources were reviewed and preliminarily executed before formal integration. After the first successful formal run, partial-observation validation was strengthened and refrozen. Independent review then found an incomplete-envelope/null normalization defect; the correction was frozen separately without changing the old/PR/false expected outcomes. All three freezes and both earlier formal runs are retained locally. This is a known-behavior acceptance case, with no blind/held-out, novelty, general efficacy, adoption or startup-eligibility claim.

Each reviewed trusted worker has a 256 MiB V8 heap limit, a 3-second internal deadline, a 5-second parent timeout and a maximum of 14000 waiters. The heap limit is neither an RSS limit nor a hardened sandbox. Unknown exceptions, signals, timeouts and malformed/partial observations remain inconclusive. Elapsed time, Node version, error-message wording and exact overflow threshold are diagnostic data, excluded from stable repeated evidence.

## Local verification

Baseline: `93e3259fa35f0b2cddd557e1a8e142a5c21c7609`. Pre-review local formal run: Windows, Node `v24.14.0`, generated `2026-10-09T15:11:13.068Z`.

```text
node scripts/run-corpus.mjs --case public-fastq-drain-waiters --repetitions 3 --out <private-artifact-directory>
node --test tests/fastq-drain.test.mjs tests/public-integrity.test.mjs
git diff --check
```

The pre-review formal run passed; the positive repair has `retentionVerified=true`, the false repair is rejected, source hashes match and copied reports survive analysis disposal. The earlier focused 5/5 run covers actual queue execution, inherited test-context isolation and Git byte round trips with `autocrlf=true`. Its partial-observation coverage was insufficient, as detailed below. Root independently read back the complete formal result and all four retained report hashes, and confirmed state removal.

Independent review reproduced the defect: `null` could throw and a retention mode could ignore incomplete nested data belonging to the other projection. Added regressions then demonstrated six failures in seven focused tests before implementation. The corrected checker requires the complete typed worker envelope before projecting A or B. Missing/wrongly typed fields return `inconclusive`; complete observations with incorrect values, order or cardinality return `fail` for the relevant requirement. The independent semantic projections are preserved. Corrected focused checks passed 10/10; admission/preservation checks passed 2/2, with zero failures/cancellations/skips. Syntax/diff checks passed. Root verified all 15 current admitted source hashes. No additional full local formal replay was run after this correction; exact-commit hosted execution is the final gate. The corrected checker SHA-256 is `1f904401480cef98e6e05fd5ab9f7e8d43d57ac68d3cca95acfddedab48ff8d2`.

The admission records all helper/oracle/module/license/dependency hashes in [`fastq-drain-admission.json`](../../fixtures/cases/fastq-drain-admission.json). Key source hashes:

| Source | SHA-256 |
|---|---|
| Published fastq 1.17.0 | `41ec9df7123c13ec8d96fc37912b45ffe584fbb024e0b7c1d9b24ac69bd47bd3` |
| Pinned PR #87 | `09fe02f23371a5979be9771e49d9da5797f3dcabc52b3301a7acfec97d68b0dc` |
| Immediate-wait false candidate | `377473893a4c7d441999377dd7bc3483866a783c153d9cc34f8c4e07c8f0fb8d` |
| New oracle | `0514204d5282d60d5cf110cd91baaaf815bb1364a84af2fb3b5aee6779ac5780` |

Retained local final summary SHA-256: `8e3d499cda5d321cf0b3be72cfbe48733497d5df05444f4da2b640cbffbe1e46`. Original vendor-manifest bytes and the previous twelve case objects remain unchanged. The core, API, CLI, MCP, package version, historical release tag/assets and Site are preserved. The protected competition checkout remains clean at `5b649c4bdf4a9372c9f890816835c100b5be0d01`.

## Review and hosted acceptance

The initial whole-change review found one Important normalization defect and no Critical issues. A localized independent review accepted the correction after 136 controlled observations, checked source/freeze hashes and found no new issues. The staged whitespace check initially flagged preserved CRLF bytes in three new assets; the new attributes explicitly allow CR at line endings while retaining ordinary whitespace checks and `-text`. Asset bytes and admitted hashes are unchanged; staged and unstaged diff checks now pass.

The full Linux/Windows Node 22/24 matrix is pending. Local results above are the current accepted scope. Publication acceptance will be recorded here after exact-commit CI readback. No outreach, application, account changes or new paid API usage occurred.

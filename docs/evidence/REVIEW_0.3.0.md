# Independent review and one fix pass — 0.3.0

Date: 2026-10-08. The fresh, read-only whole-change reviewer examined candidate 1 against `cd1984c7d8c8e94c2f4f981fcec3e4cefadcb667`. Original review, reproductions and reviewed hashes remain at `artifacts/startup-0.3.0/review/`. Root accepted the severity of all three Important findings; none were Critical. No second review was dispatched.

| Finding | Root correction | Failure-to-pass evidence |
| --- | --- | --- |
| I1: hidden canonical legacy checks and contradictory approval | Bind the complete frozen feature set, manifests and corresponding results; render additional legacy checks and require all checks for approval | Honest legacy rejection, contradictory approval, missing result, changed hash and changed manifest |
| I2: execution failure/missing runs hidden by passing summaries | Derive each canonical status from recorded execution/output, validate repetition/consistency and preserve diagnostics | Timeout, empty/wrong run count, varying evidence and honest inconclusive diagnostics |
| I3: contradictory eligibility, coverage and duplicated metadata | Derive coverage/strict eligibility and check duplicated identity/runtime/requirements/classification/source commit/results | Seven independent metadata contradictions; actual producer reference names also displayed |

`node --test tests/report.test.mjs tests/report-review.test.mjs` first produced **37 total, 18 passed, 19 failed**; after the single correction pass it produced **37 passed, 0 failed, 0 skipped**. Eighteen new regressions reproduce the review families; an existing escaping check also failed after its literal fixture was corrected to the actual `baseRef`/`branchARef`/`branchBRef` contract. Full RED and GREEN logs: `artifacts/report-030-review-{red,green}.log`.

The review's augmented legacy reproduction also contains a primary-manifest mismatch. Root's new canonical literal fixtures keep that manifest coherent, so the honest legacy rejection test verifies visibility of the failing check rather than relying only on metadata rejection. These are contract fixtures, not new core executions or external cases.

The post-fix complete native Linux Node 24.14.0 suite passed **88/88**, with **0 failures and 0 skips**, and all 182 source/snapshot file hashes preserved. Receipt: `artifacts/validation-0.3.0/recovery/linux24-suite-2026-10-08T11-46-26-956Z/status.json`. Root also read the actual archived MCP canonical evaluation with each repaired/unrepaired verification through the corrected reader: both generated HTML, with their recorded approval true/false respectively. Receipt: `artifacts/startup-0.3.0/raw-mcp-reports/post-review/acceptance.json`.

Candidate 1 (`d831d437c6b4a7e32bcf86d8276551fd57389c9995adc81ae0f9fba54bcbea30`) remains preserved historical evidence. The corrected candidate is packed separately under `artifacts/releases/0.3.0/candidate-002/`; exact installation and site linkage are recorded in [validation](VALIDATION_0.3.0.md) and [site evidence](SITE_0.3.0.md), never retroactively attributed to candidate 1.

## Deferred Minor findings

- M1: candidateTree/candidateHead and frozen probe hash are not displayed in HTML. The original JSON remains necessary for those exact identities.
- M2: installed README/Portuguese guide contain supporting links to checkout-only evidence/pilot files omitted from the tarball. The installation, API and report guides are shipped; the supporting links remain a documented limitation.

## Remaining gates

Root's decisions on every reviewer-declined family, with costs if wrong, are retained in the [execution ledger](PROGRESS_0.3.0.md). Corrected reader regressions and full-suite success resolve I1–I3; they do not establish new browser QA, a complete Node 22/macOS matrix, actual Claude integration, protocol-wide conformance, external demand, program eligibility or publication. Review of the existing public site's initial viewport is only a browser diagnostic. The local 0.3.0 rendered acceptance remains [policy-blocked](BROWSER_QA_0.3.0.md).

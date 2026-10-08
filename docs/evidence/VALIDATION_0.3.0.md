# MergeWitness 0.3.0 local validation

Date: 2026-10-08. Local work only. Post-review technical regression and corrected exact release-asset acceptance passed. Rendered internal-browser QA of the new local version is [policy-blocked](BROWSER_QA_0.3.0.md). No external developer events, deployment or application submission occurred.

## Current-source regression

| Scope | Actual result | Receipt |
| --- | --- | --- |
| Linux Node 24.14.0, complete serial suite after reviewer fixes | 88 passed, 0 failed, 0 skipped | artifacts/validation-0.3.0/recovery/linux24-suite-2026-10-08T11-46-26-956Z/status.json |
| Windows Node 24.14.0, report + review regressions after fixes | 37 passed, 0 failed, 0 skipped | artifacts/report-030-review-green.log |
| Linux Node 24.14.0, pre-review complete serial suite | 70 passed, 0 failed, 0 skipped | artifacts/validation-0.3.0/recovery/linux24-suite-2026-10-08T11-10-57-368Z/status.json |
| Windows Node 24.14.0, protocol + report focused suite | 22 passed, 0 failed, 0 skipped | artifacts/protocol-report-030-green.log |
| Windows installed package unit acceptance | 2 passed, 0 failed, 0 skipped | artifacts/package-030-green.log |
| Windows report after real canonical-format correction | 19 passed, 0 failed, 0 skipped | artifacts/report-030-canonical-green.log |

The post-fix Linux gate used a native `/var/tmp` snapshot of 182 exact working-tree files, verified before/after, with original source unchanged during execution. The earlier 70-test gate captured 177 files; it remains phase-specific historical evidence. Both use the previously hash-verified official Node archive; no global runtime or WSL settings changed. Both full-suite logs and unsuccessful RED attempts remain retained. Earlier Windows package/protocol checks predate the review corrections. The corrected exact Windows asset run exercised the sealed candidate separately.

No new complete Windows/Node 22/macOS matrix is claimed. [0.2.1](VALIDATION_0.2.1.md) retains the earlier phase-specific runtime evidence, 14-test original local baseline and twelve-case corpus. Core/corpus bytes are unchanged in this cycle. The preserved twelve-case/three-repetition result is known-regression and synthetic coverage, not a new benchmark or user adoption.

## Meaningful failure-to-pass checks

The initial 16 report checks failed before implementation, then passed. Three validation regressions separately exposed inherited CLI option names, null requirement entries and falsely claimed retention hiding a failed calibration; all failed before their fixes and now pass. A real canonical API report exposed `probe.probeHash`; the corrected literal contract tests failed before the reader fix and the actual MCP evaluation/repair pair then generated HTML successfully. Pack tests first detected the old version and omitted report module before version/files changes. The SDK's missing-ping diagnostic was reproduced in a failing protocol test before the empty response was added.

The [independent review](REVIEW_0.3.0.md) exposed three evidence-correctness issues. The one TDD fix pass now checks complete canonical frozen feature sets, recorded execution/summary agreement and duplicated metadata/derived eligibility. Its 18 new regressions were RED before the fixes; all 37 report tests and the full 88-test suite are GREEN. Both actual archived canonical repaired/unrepaired pairs generated correctly classified HTML with input/output hashes retained at artifacts/startup-0.3.0/raw-mcp-reports/post-review/acceptance.json.

HTML generation checks pair identities, probe/source/requirements and the portable evaluation-file digest, escapes supplied text, preserves inputs/earlier output and contains no scripts or external assets. It reads evidence; it does not execute code, authenticate an author or re-run verification. Unit/source tests do not prove appearance or browser interactions.

## MCP and external gates

The [MCP receipt](MCP_0.3.0.md) distinguishes the full four-tool SDK v1.32.1 workflow observed on server 0.2.1 from the final 0.3.0 initialize/list/ping check. Core hash is unchanged. Actual Claude connection/model workflow and SDK v2 remain not run. Provider calls and new spending are zero.

External contacts/installations/cases/returns remain 0. Previous Anthropic application status remains UNKNOWN; authenticated portal readback is needed. A real pilot is required by our selected Anthropic gate; OpenAI retains a separate use/maintenance gate. Nothing has been submitted.

## Exact local release asset

Corrected candidate: `artifacts/releases/0.3.0/candidate-002/mergewitness-core-0.3.0.tgz`, **40515 bytes**, SHA-256 **848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688**. This supersedes candidate 1 for technical acceptance without replacing its bytes or receipts.

The actual installed Windows `.cmd` entrypoint passed version/help and two complete tenant-cache demos with two reports in unique accented/spaced paths. All **40 installed file hashes** remained unchanged; all **31 packed source hashes** matched both installation and current source. Portable evaluation-byte bindings and both HTML/evaluation/repair triples were read back. Browser rendering is explicitly false in the receipt.

Terminal receipt: `artifacts/release-acceptance/0.3.0/run-20261008-115342/acceptance.json`, SHA-256 **7a6ccc74d950d415de1f721f2184dcc1ce7a98c2430ff29049165e2b2a64a0c3**. Root independent readback: `artifacts/startup-0.3.0/candidate-002-readback.json` (PASS). License, old 0.2.0/0.2.1 assets and candidate 1 hashes also matched. The first readback helper attempt used the wrong assumed 0.2.0 directory and stopped with FileNotFoundError; its identified original is at `artifacts/releases/mergewitness-core-0.2.0.tgz`, and the corrected readback checked the unchanged expected hash.

Final original-repository and local-commit checks are recorded in the execution ledger. Separate site artifact/instruction acceptance is recorded by its owner in [SITE_0.3.0.md](SITE_0.3.0.md). Technical acceptance alone does not complete the local rendered-QA or external pilot gates.

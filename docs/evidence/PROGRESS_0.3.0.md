# Execution ledger — plan: docs/STARTUP_BETA_PLAN_0.3.0.md

Status: local implementation and technical acceptance complete; final asset readback and local commit are the closing steps. New local rendered QA remains BLOCKED / NOT_RUN; external outcomes remain pending.

## Initial state and rulings

- Clean independent checkout at cd1984c7d8c8e94c2f4f981fcec3e4cefadcb667; no remotes. Created oss/local-0.3.0. Original clean and still at protected upstream SHA.
- Existing 0.2.1 tarball SHA-256 verified: 6e3b0386e53042560b49b99317e77269a5e789cf9a2141a4347b0b49d6be0a89.
- Ruling: reuse the user-requested separate independent checkout on a new local branch; another worktree would duplicate established isolation and complicate the separate site/artifact boundary. Cost if wrong: isolation failure could affect unrelated work; original/source boundary checks remain required.
- Ruling: the user-approved in-chat plan is the binding brief. Persist it here instead of asking for another design approval. The ordinary spec/plan-file ceremony must not restart approved work. Cost if wrong: an inferred requirement may need reversible local rework; external authorization remains separate.
- Ruling: use a native durable ledger and task-scoped artifacts on Windows instead of POSIX skill helper cleanup. Preserve all receipts and previously policy-rejected review scratch; do not retry that cleanup. Cost if wrong: more retained disk usage and less automated bookkeeping; receipts and commit readback provide the audit.
- Pre-flight: CLI/package/site docs consume the report command and final tarball. Root owns those shared interfaces; documentation and MCP investigation agents get separate write scopes.
- Ruling: the existing installed demo emits portable v2 JSON, while the core emits canonical v2 reports. Support both explicit formats to make the approved viewer useful without changing either producer. Reject ambiguous wrappers and historical v1. Cost if wrong: normalization can hide or mislabel evidence; independent review and contradiction regressions are required.
- External sessions observed: 0. Contacts sent: 0. Startup decision: unknown. No new spending, provider requests, account changes, publications or applications authorized.

## Tasks

- [x] Report feature: 16 initial RED tests (missing implementation) -> 16 GREEN. Three additional validation regressions independently RED -> 19 GREEN. Logs: artifacts/report-030-{red,green,validation-red,validation-green}.log.
- [x] Package/docs: 0.3.0 metadata and installed/source guides.
- [x] Business/pilot/application/video materials; no new video produced or application submitted.
- [x] MCP compatibility investigation with no model calls; actual Claude workflow remains NOT_RUN.
- [x] Separate local site source and artifact integration: 17 tests passed, including the actual offline copied-install workflow. Final guide-copy refresh/readback closes before commit; new local rendered QA remains policy-blocked.
- [x] Exact release acceptance and regression receipts.
- [x] Independent whole-change review, single RED→GREEN fix pass, final code-byte and original preservation checks. The root local commit/readback is the final recording step; no remote or publication is authorized.

## Report/package checkpoint

- CLI integrated; report validates existing canonical and portable v2 formats before writing unique output. All supplied text is escaped; the page has no scripts or network resources. Core API/export and verification code unchanged.
- Package tests expanded to execute reports for both installed demos and compare file-content hashes. RED confirmed the old version and missing packed report module; 0.3.0 metadata and report/docs files are now included. Installed GREEN run in progress.
- Official SDK workflow passed on recorded pre-bump server 0.2.1 with core unchanged. The additional client health-check exposed missing ping (-32601). Root reproduced a meaningful RED unit test, added the specified empty response and obtained protocol/report 22/22 GREEN. The investigator is separately checking SDK ping on 0.3.0; receipts are never relabeled.
- Business/pilot/application/storyboard documents read and inspected; they retain zero external events, unknown previous application state and authentic form-field gate. Actual package/browser acceptance remains pending in their current text.
- User confirmed public pilot contact gabriel@mergewitness.com.br; local EN/PT mailto added, with no message sent or mailbox-delivery claim.

## Independent review and single fix pass

- Fresh reviewer retained a read-only candidate-1 review at artifacts/startup-0.3.0/review/REVIEW.md: 0 Critical, 3 Important, 2 Minor. Root grades all three Important as evidence-correctness findings and fixes them in the one planned pass; no second reviewer is dispatched.
- Canonical literal regressions first failed (37 total: 18 passed, 19 failed), then all 37 passed. Eighteen new regressions cover the three families; the existing escaping test also exposed the actual producer's baseRef/branchARef/branchBRef keys. RED/GREEN logs: artifacts/report-030-review-{red,green}.log.
- I1: bind/render complete frozen featureChecks including legacy results and manifests; contradictory approvals, missing/duplicate checks and changed identities are rejected.
- I2: derive canonical observations from recorded execution/output, require complete runs and consistent summaries, and retain timeout/error diagnostics. Portable evidence keeps its explicit smaller contract.
- I3: check duplicated canonical IDs/runtime/requirements/classification/sourceMergedCommit and derive coverage/strict eligibility from validated records. Actual archived canonical MCP repaired pair generated a new report successfully after the fix.
- Final: minor (deferred): M1 — the HTML does not display candidateTree/candidateHead or frozen probe hash; exact identities remain in the original JSON, so report-only comparison needs that file.
- Final: minor (deferred): M2 — installed README/Portuguese quickstart link to supporting evidence/pilot documents that are checkout-only; core installation/API/report guides are shipped, but those supporting local links will not resolve in an installation.
- Final: fixed I1 — canonical legacy rejection/approval and missing/hash/manifest tests RED→GREEN; full suite 88/88.
- Final: fixed I2 — timeout/empty/count/varying-evidence and honest inconclusive tests RED→GREEN; full suite 88/88.
- Final: fixed I3 — seven contradictory metadata tests and actual producer references RED→GREEN; full suite 88/88.
- Candidate 1 and all its receipts remain immutable historical evidence; corrected source packed separately to candidate-002 (40515 bytes, SHA-256 848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688). Post-fix full regression 88/88 passed; corrected exact Windows package acceptance PASS: version/help, two demos/reports, 40 installed hashes unchanged and 31 packed sources matched. Independent readback PASS; receipts in VALIDATION_0.3.0.md.

## Final decisions on reviewer-declined areas

- Final: Ruling: new local desktop/mobile rendering, keyboard, clipboard and media playback — users get a technically tested candidate with rendered QA explicitly pending; the tool rejected the preview and bypasses are forbidden. A read-only capture of the existing HTTPS site proves browser access only. Cost if wrong: unobserved layout or interaction defects; publication/pilot distribution remains gated.
- Final: Ruling: final site artifact binding — root and the site owner must check the corrected tar/actual reports and copied instructions after terminal acceptance; the independent reviewer did not have these final bytes. Cost if wrong: a download/report could describe a superseded candidate.
- Final: Ruling: fresh Node 22/macOS full matrix — current acceptance covers Node 24.14 on native Linux and installed Windows only, with prior phases retained separately. Cost if wrong: compatibility failures in another declared environment; no new complete-matrix claim is made.
- Final: Ruling: actual Claude integration, SDK v2 and full MCP conformance — the delivered claim is limited to the recorded official SDK v1 client checks, with model workflow explicitly NOT_RUN. Cost if wrong: later client/model integration may require additional implementation; no integration promise or paid call is made.
- Final: Ruling: authenticated startup status, contact, publication and external demand — the user supplied the public email; mailbox delivery/account eligibility/previous application decision and real adoption remain unverified, with no send/deploy/application. Cost if wrong: contact failure or startup ineligibility; real pilot and authenticated decision gates remain open.
- Final: Ruling: untrusted-code containment, signed reports, automatic redaction/discovery and new runners — keep the authorized trusted Node execution and static evidence reader, with supplied JSON unable to authenticate its author. Cost if wrong: use outside the stated trust/data boundary can mislead or expose data; no containment/authenticity claim is made.
- Final: Ruling: broad efficacy, competitor superiority and fresh corpus benchmark — unchanged core/corpus and bounded synthetic/known regressions support only their recorded outcomes; overlap with QuietClash/mumei remains acknowledged. Cost if wrong: false confidence about detection or adoption; no superiority/general-effectiveness claim is made.
- Final: Ruling: branch finishing and skill cleanup — the user's explicit local-only boundary selects keeping this branch and all audited artifacts, with no generic merge/push/discard menu or helper deletion. Cost if wrong: changes remain locally unshared and consume disk until a later authorized release.
- Final: Ruling: Git text normalization of the new reader — staging would change its CRLF bytes relative to the tested/packed source. Preserve that one path with `-text`, extending the existing exact-byte attribute convention; runtime/source/tar bytes remain unchanged. Cost if wrong: the reader retains its current line-ending style until deliberately changed and revalidated. All 31 packed files must match staged Git blobs before commit.
- Final: Ruling: final site receipt update after a rejected full-file overwrite — preserve the identified prepared-phase snapshot and all its sections, use only a context-checked status amendment and appended final checkpoint. This materially narrows the edit and avoids replaying the rejected PowerShell replacement; the smaller edit was accepted. Cost if wrong: old phase statements can confuse readers unless the final checkpoint is read; the header explicitly marks them as historical. The browser restriction remains unchanged.

## Closing technical checkpoint

- The Git staging audit initially exposed reader line-ending normalization; the narrow `-text` attribute and scoped `git add --renormalize` now preserve all 31 accepted packed-source hashes. Runtime bytes and the immutable candidate-002 tarball were not changed. Final receipt: `artifacts/startup-0.3.0/staged-byte-check.renormalized-green.json`.
- Site source, report/JSON/package bindings, public-safe guide graph and actual offline copied installation passed 17/17, 0 failed, 0 skipped. Full log: `artifacts/startup-0.3.0/site/final-tests.log`. Rendered acceptance remains a separate open gate.
- A read-only diagnosis confirmed configured Full Access (`danger-full-access`, approval `never`) and working internal-browser HTTPS access to the existing published page. The origin/reason of the preview-server rejection remains unknown; no permission setting was changed and no alternate browser bypass was attempted.
- The full site-receipt overwrite rejection, exact command and proposed text are preserved under `artifacts/startup-0.3.0/site/`. A smaller additive edit succeeded; it did not resolve or bypass the visual-preview restriction.
- Original competition SHA, license, core/demo/fixtures/corpus source and historical 0.2.0/0.2.1/candidate-1 tarballs remain preserved. The final local commit identity and clean-worktree/no-remote readback are recorded in the closing ignored receipt.

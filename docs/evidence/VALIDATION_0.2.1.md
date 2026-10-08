# MergeWitness 0.2.1 local validation

Local execution only; no remote creation, publication, site deployment, outreach or application submission.

## Latest complete suite receipts for release gates

This table selects the latest complete passing suite for each runtime. It spans separate phases: Windows22, Windows24 and Linux22 are initial full-suite snapshots; Linux24 is the final post-fix native-source full suite. The initial Linux24 suite was 49/49 and remains retained. Do not combine these phases into a single current 50-test matrix. Earlier unsuccessful and 0.2.0 consolidated records remain untouched.

| Runtime | Passed | Failed | Skipped | Receipt |
|---|---:|---:|---:|---|
| windows22 | 46 | 0 | 1 | artifacts/validation/windows22-suite-2026-10-08T07-13-25-480Z/status.json |
| windows24 | 49 | 0 | 0 | artifacts/validation/windows24-suite-2026-10-08T06-42-19-627Z/status.json |
| linux22 | 45 | 0 | 1 | artifacts/validation/linux22-suite-2026-10-08T07-06-26-278Z/status.json |
| linux24 | 50 | 0 | 0 | artifacts/validation-0.2.1/recovery/linux24-suite-2026-10-08T09-10-51-206Z/status.json |

The Node 22.0.0 historical TypeScript check is explicitly inapplicable; all independent JavaScript checks execute. Node 24 runs the preserved historical checks. Log hashes were verified before closeout.

## Corpus and comparison

All 12 expected outcomes matched with three probe repetitions. Four public cases are known-regression replays in a new minimal harness, not upstream merges; new oracles were reserved before integration but fixes were reviewed, so no blind benchmark is claimed. The current manifest SHA-256 is 2944783b3ed6c556bb781b168cc8c5f0bd22e319c0080a9f48efb2aee30a3516. Full evidence is in the uniquely named corpus run.

See [scoped comparison](COMPARISON_0.2.1.md): QuietClash calibration and two targets completed; mumei is explicitly not-run because current unauthenticated source access failed. No general efficacy, adoption or superiority claim follows.

## Release candidate

- File: artifacts/releases/0.2.1/mergewitness-core-0.2.1.tgz
- SHA-256: 6e3b0386e53042560b49b99317e77269a5e789cf9a2141a4347b0b49d6be0a89
- Bytes: 28754
- Exact packed-install acceptance: passed from this same tarball; the final UTF-8 receipt and path readback are below.
- Site download copy has the same SHA-256.

Original head/status/license were read back and verified intact. The OSS checkout has no remotes. The 0.2.0 package and receipt were preserved.

## Browser and external gates

The internal browser failed to attach both visible and background tabs; no external browser/native PC input was used. The final source and copied-instruction tests passed 9/9 against the exact 0.2.1 tarball. Rendered desktop/mobile, console health, keyboard interactions and video playback remain unverified.

External developer observations: 0. Outreach and application submission: not performed. Prepared documents are not evidence of adoption or selection.

## Final exact-artifact acceptance

The package was accepted from the exact tarball above after the explicit source-linked final handoff reached terminal pass. The actual installed Windows .cmd entrypoint returned version 0.2.1 and help successfully; two tenant-cache demos passed with distinct output directories. The installation prefix and demo paths contain spaces and accented characters. All installed file-content hashes remained unchanged across execution. Acceptance receipt: artifacts/release-acceptance/0.2.1/run-20261008-092620/acceptance.json; SHA-256 43c1e4df449166de0e1866a5ace4178227ef4d856ab24b346c86a87199c30fe6. Complete acceptance logs and source snapshots: artifacts/validation-0.2.1/artifact-acceptance/.

The copied install/demo instruction executed against this same final tarball, followed by the eight site source checks: 9 passed, 0 failed, 0 skipped. Receipt: artifacts/validation-0.2.1/artifact-acceptance/status.json. This validates instruction execution and source evidence; clipboard behavior, browser rendering, console, keyboard and video remain unverified after the IAB attachment failures.

## Phase-specific final gates

The initial complete functional snapshots remain Windows24 49 passed, Linux24 49 passed, Windows22 46 passed / 1 skipped, and Linux22 45 passed / 1 skipped. They started before the published-byte correction and must not be represented as one final 50-test matrix. The final post-fix complete Linux24 serial suite in the hash-verified native /var/tmp source snapshot is 50 passed, 0 failed, 0 skipped (artifacts/validation-0.2.1/recovery/linux24-suite-2026-10-08T09-10-51-206Z/status.json); it replaces the earlier failed post-fix full gate, whose logs remain retained. Windows22 post-fix focused corpus/integrity coverage is 6 passed, 0 failed, 0 skipped (artifacts/validation-0.2.1/recovery/windows22-focused-2026-10-08T08-22-14-677Z/output.log). Other focused correction receipts remain separately retained.

The final twelve-case Windows24 corpus receipt is artifacts/validation-0.2.1/recovery/windows24-corpus-2026-10-08T08-26-22-573Z/status.json; it verifies three observed repetitions for every matrix and executed published-byte proof. The helper also verified the current manifest and every expected outcome before packing. Source-content snapshots before and after exact artifact/site acceptance match; no product source, tests, core or configuration was edited by artifact acceptance. Original repository provenance and license and the absence of OSS remotes were read back by closeout.

Publication, deployment, outreach, external observations, and application submission remain not performed. This local acceptance does not resolve the pending rendered QA or external publication gates.

## Final receipt readback and preservation

The first installed execution passed, but its PowerShell .cmd stdout decoding produced mojibake in the JSON output paths. That receipt remains preserved as superseded encoding-defect evidence at artifacts/release-acceptance/0.2.1/run-20261008-091824/acceptance.json. Root authorized a task-local helper correction: Console.OutputEncoding and PowerShell OutputEncoding are UTF-8 only inside the fresh acceptance child process. No user/global settings changed. Exact asset acceptance was repeated on the same SHA-256 above; both reported output directories now exist and resolve inside their task-owned acceptance root, with the exact accented saída demonstrada path. Final readback: artifacts/validation-0.2.1/artifact-acceptance/encoding-readback-final.json.

All 37 installed files have identical content hashes before and after execution; the two durable manifests have SHA-256 dbaab6562be0efa6e20c7b8a09fe62c3617379f09c38c9e526464e56c0b25ff2. All 28 packed source-package files also match the installed package bytes. The final site test log remains 9 passed / 0 failed / 0 skipped on the identical tarball; it was not repeated after the process-only decoding correction. Product/source content and tar/download hashes were rechecked unchanged. The previous 0.2.0 tarball and both release/install receipts match their pre-acceptance hashes.

The mounted Linux24 attempt was explicitly superseded as incomplete with exit 9 and no test totals after a mounted-filesystem wait; its original receipt/log are retained alongside the earlier 48-pass/2-failure run. Neither is accepted as the final gate. The replacement native Linux24 suite passed 50/0/0 with all 164 source-linked snapshot files checked before/after. This does not add rendered browser, clipboard, publication, deployment, adoption, outreach or submission evidence.

# Independent implementation review and corrections

Read-only review covered the complete independent checkout diff, new files, and the separate Site source. It found no confirmed Critical issue and five Important issues. The initial verdict was REQUEST CHANGES; these findings were corrected with targeted failing/passing regressions before the final matrix.

| Finding | Correction and regression |
|---|---|
| A declared `harness/` directory did not protect its descendants | Canonical relative paths remove equivalent `./` and trailing separators. Both spellings reject a weakened oracle before execution. |
| Legacy state could be promoted to v2 without preparing again | Both in-memory and persisted analyses require version 2; rejected legacy bytes stay unchanged. |
| Windows cross-drive and junction candidates could escape the clone | Strict relative/real-path containment plus shared Git worktree membership; cross-drive/sibling and external junction regressions. |
| PATH Node could differ from recorded parent runtime | Node subprocesses use `process.execPath`; preparation runtime is recorded; checks run even when PATH has no Node. |
| Default demo used an internal counter as cache proof | Demo now freezes the shared/fresh probe and Proxy-observed cache check; portable reports record their hashes and observed results. |

Additional integration checks found state registration before persistence. Persistence now precedes publication in the registry; an injected state-write failure leaves no orphan. Directory cleanup retries are bounded. Abnormal ordinary execution is classified inconclusive, and MCP initialization reports version 0.2.0. These small diagnostic/distribution inconsistencies were treated as acceptance requirements rather than deferred polish.

Windows Git checkout converted historical Site text to CRLF. Each protected source/report/license file and the source manifest were restored from exact verified blobs of Site commit `7b38435c4c3ecbce8d56188448dd994f2f331a6c`, with a local attributes policy preventing conversion. No source/report content was replaced from an unidentified origin.

Receipts: `artifacts/review-red-confirmed.log` (1 passed, 8 failed), `artifacts/review-extra-red.log` (0 passed, 2 failed), and `artifacts/review-green.log` (11 passed, 0 failed). The final full matrix is recorded separately. Review was not rerun after the fix pass; regressions and the final suite are the acceptance evidence.

Unassessed guarantees remain: hardened isolation against hostile code, general detection efficacy, adoption, a head-to-head benchmark, and full SDK/client MCP conformance. UI rendering is not inferred from source tests.

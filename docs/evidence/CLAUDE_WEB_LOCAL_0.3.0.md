# User-forwarded Claude web proposal — local verification

Recorded on 2026-10-08 in the separate OSS checkout, baseline `84d7f1849f6d53062710d28d61ab02e1aec3e958`. Raw evidence is retained under ignored `artifacts/startup-0.3.0/claude-video/run-002/`.

The user has no Claude Pro. Two preserved CLI attempts initialized/listed the installed MCP server but stopped before model usage because the saved authentication was invalid. No new subscription, API key, billing route or global authentication setting was configured. These attempts are not model-assisted MCP evidence.

The user sent the provided synthetic prompt through their existing free Claude web account on their phone and forwarded the complete response. Provider origin is operator-reported; the provider UI/model label were not independently captured. The local controller reviewed and applied the recorded module unchanged. This is one synthetic demonstration, not an external participant or customer case.

| Gate | Observed result |
| --- | --- |
| Frozen sequence | Base/A/B pass, Combined fails, two consistent repetitions; beta receives 90 instead of 100 |
| Ordinary tests before proposal | Pass in all four snapshots |
| Requirement calibration | Pricing in A and cache in B pass before proposal |
| No-cache control | Sequence/pricing pass, cache fails; candidate rejected |
| Forwarded proposal | Only `src/catalog.js` changed; sequence, 3 ordinary tests and both requirements pass |
| Fresh replay | Different analysis; same proposal, no new generation; candidate passes |
| Retained sources | Probe/check hashes and original fixture unchanged |
| Lifecycle | Verification disposal receipt confirms removal; both recorded candidate paths absent after disposal |
| Candidate evidence | Complete response, exact module, patch and Git bundle retained |

Candidate SHA-256: `2dfde5b4bfee6ebdb9cba15407e9bd6d0430f78772bc79ed753318f4a67844b3`.
Retained response SHA-256: `617c9f940a9d087084d86e016bf16e3b0ea268440ab0b4c7183da318acd01c8f`.
Accepted tarball SHA-256: `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`.

The proposal uses `JSON.stringify([tenant, sku])`; passing this string-identifier example does not establish universal identity encoding or arbitrary repair correctness. Source review found no external I/O or new dependencies. Only trusted reviewed code may execute; worktrees and subprocesses are not hardened sandboxes. See [reproduction](../CLAUDE_WEB_WORKFLOW.md).

The full Windows suite completed 93/93 with zero failures/skips before adding the response-binding regression. The controller's 6 focused tests then passed, including the new regression observed failing before its implementation. No packed core input changed. Full logs and the RED/GREEN receipt remain local.

The 120-second silent visual draft uses actual JSON observations, user-forwarded provenance disclosure and persistent draft marking. Seven 1080p scene images were inspected and full decode passed. Final narration, final-film approval and changed-page browser playback/mobile QA remain pending. Public release, public Site/domain changes, outreach and applications remain unauthorized. External pilots/customers/revenue observed: zero.

# Web/local controller and private video review milestone

Date: 2026-10-08. Baseline: `84d7f1849f6d53062710d28d61ab02e1aec3e958`. One fresh independent whole-change review found **0 Critical, 3 Important and 2 Minor** issues. Its original report and all failed attempts remain under ignored `artifacts/startup-0.3.0/claude-video/`. This receipt records one correction pass, without claiming a second independent approval.

| Finding | Correction and observed verification |
| --- | --- |
| Replay could execute a changed/unreviewed module | Immutable successful verification seal; original source, response and repair receipt checked before preparation. Actual CLI rejects both missing seal and changed source before preparation. |
| Application/client failure could bypass disposal | Controller cleanup covers the whole terminal attempt and retains original/cleanup errors. Real Git bundle export failure was injected: original failure recorded, analysis removed, no approval seal issued. Client-failure and cleanup-error regressions also pass without provider calls. |
| Video could be paired with another run | All five manifest input hashes and evaluation/repair identities checked before Site writes. Different hash and unrelated-analysis regressions reject; exact recorded pairing passes. |
| Wrong-fixture test could fail for the wrong reason | Test now starts without prior preparation and requires the declared-fixture error; repeated preparation is checked separately. |
| Downloaded Markdown had missing targets | Reviewed dependencies included; all 12 distributed Markdown files have resolving local links. |

New correction regressions were RED before implementation, then **8/8 controller checks and 3/3 media-input checks passed**. The Python tests use their own synthetic temporary fixtures, not ignored private evidence. The prior full Windows suite remains **93/93, zero failures/skips**, before these added regressions; it was not relabeled as a new full-suite result. Core/package inputs did not change.

The corrected controller was exercised against a fresh offline installation of the same accepted tarball. The previously forwarded response was reused; no model generated another candidate. Verification and a distinct fresh replay passed, the same source hash was sealed, and disposal receipts confirm cleanup. Probe/check sources and the fixture remained unchanged. Candidate SHA-256: `2dfde5b4bfee6ebdb9cba15407e9bd6d0430f78772bc79ed753318f4a67844b3`.

The existing separate owner-private Site received the silent review and then documentation-link corrections. Corrected private source: `d1085c1b74774e0201dbefc6007f94ce3202da8a`; all **72 static files** matched the archive, whose SHA-256 is `4f740673821ec6e5b29742c8392c343b9db90f3b52a2ccf92d9b8fb31cabcf35`. Native private deployment succeeded. The public Site remains on its historical version 2.

The owner confirmed on their phone that the private page opened and the silent preview played. This is user-reported playback, not independent browser/mobile visual acceptance. The exact movie asset remained unchanged across the documentation correction: SHA-256 `3fce86941d1fb4a0bc33e5bb0d6ec6eacb9201e48e4431d6864333a97f46bd45`.

Still pending: materialized Knox audition audio, full narration/listening approval, final master/web/30-second film outputs, independent changed-page browser QA, public distribution and actual external pilots. No public repository/domain update, outreach, application, new paid API usage or global authentication/security configuration was performed. Provider origin remains user-reported and Claude Code/MCP model integration remains unverified. See [scoped workflow evidence](CLAUDE_WEB_LOCAL_0.3.0.md).

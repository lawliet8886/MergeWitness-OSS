# First product-cycle technical acceptance

Recorded 2026-10-09. This receipt covers engineering and preparation, not external adoption or commercial validation.

## Tested source and compatibility

The reviewed code/documentation commit is `42defe7879e72e4d0a1851dfbbc4452e3f604c11`. Core, CLI, MCP, API v2, package manifests and the twelve-case admitted corpus are unchanged from the public 0.3.1 baseline. The published 0.3.1 archive and tag were not replaced; archive SHA-256 remains `d4a29f561e1e42015dfa12aa5726e268e9d48686fa5f71b84fbdf236d816f763`.

The [exact-commit hosted validation](https://github.com/lawliet8886/MergeWitness-OSS/actions/runs/37940027993) completed successfully:

| Platform | Node | Passed | Failed | Skipped |
|---|---|---:|---:|---:|
| Windows | 22 | 101 | 0 | 0 |
| Windows | 24 | 101 | 0 | 0 |
| Linux | 22 | 100 | 0 | 1 |
| Linux | 24 | 100 | 0 | 1 |

The Linux skip is the existing Windows-specific directory-identity test. These are repeated platform executions, not 402 distinct tests or an efficacy benchmark. Each job also completed the existing corpus command; the corpus still has twelve known cases.

The independent local tutorial acceptance used Windows, Node 24.14.0 and Git 2.54.0.windows.1. A redundant full local run was cancelled after the exact-commit four-platform matrix succeeded; its partial log is not a full local PASS.

## Own-repository walkthrough

The [English guide](../USE_YOUR_REPOSITORY.md) and [Portuguese guide](../USE_YOUR_REPOSITORY_PT_BR.md) show existing lifecycle operations and actual returned state/candidate/report paths. Their educational companion is source-checkout-only; it is not part of the immutable 0.3.1 tarball. The own-project section uses the existing installed CLI/API and trusted caller-authored inputs.

The accepted walkthrough exercised paths containing spaces, isolated fixture initialization, source preservation, the supplied valid repair, a feature-removing repair, inconclusive output, preexisting violation, separate retained reports and disposal. The valid repair passed; the false repair retained a passing sequence but failed ordinary cache tests and the explicit cache requirement.

Independent review found that the first integration-test harness inherited `NODE_TEST_CONTEXT`, causing ordinary tests to be skipped. Those earlier ordinary-test acceptance claims were withdrawn, with their records preserved privately. The corrected harness copies the child environment and removes that internal test-context variable. A failing assertion first caught the original skip; the new accepted run contains real ordinary-test output for all twelve preparation snapshots, successful ordinary tests for the valid repair, and nonzero ordinary status for the false repair. Cleanup after a failed assertion was also verified. No runtime code was changed to resolve this test-harness issue.

## Site and participation preparation

The reviewed Site source is `e9dfaee4cb2a0b7dd7c97404b6ca59c6c12e2b4b`. Eleven Site tests passed. Local rendered checks used desktop 1440×900 and mobile 390×844: language switching, closed details and keyboard activation, copy feedback, correct guide destinations, historical comparison in both orders and historical repair. No relevant console errors/warnings or horizontal page overflow were observed. Initial HTML parity was checked statically and by tests; a separate JavaScript-disabled browser was not used. Clipboard contents and a new complete film/audio acceptance were not independently verified; approved media bytes remain unchanged.

Native IAB returned `Browser is not available: iab`; QA used the authorized dedicated Playwright MCP session without native desktop input. Deployment and public-file readback are recorded separately by the publisher; source/local QA alone does not prove deployment.

The asynchronous [participation instructions](../PARTICIPATE.md), [Portuguese instructions](../PARTICIPATE_PT_BR.md), installation issue form and pilot protocol were prepared. Attempt timing begins before download/installation, with prerequisite setup separate. Time/help remain participant-reported unless independently observed. Five blank private participant records, one blank case and ten unqualified discovery candidates were prepared; no invitations were sent.

External reproduction attempts, externally supplied cases, return use, customers and revenue remain unobserved. Internal learning targets stay five attempts/three unaided reproductions, one consented real case and two concrete 7–14-day returns. Questions and independent second uses are recorded distinctly.

## Incident investigation and scope

The fastq #86 investigation did not produce a validated reproduction. A bounded child attempt timed out without structured observation; subsequent analysis was static. No candidate or new oracle was accepted, and no case was added. This is inconclusive, not evidence of safety or a negative detection result.

No new doctor command, runner, runtime dependency, model integration, hosted code-execution service or npm release was introduced. The original competition repository and private preparation history were preserved. Provider programs, outreach, paid resources and applications retain their separate gates.

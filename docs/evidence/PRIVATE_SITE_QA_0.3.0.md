# Owner-private Sites QA — MergeWitness 0.3.0

Date: 2026-10-08. **PASS in the recorded scope.** This is the current rendered checkpoint for the owner-private hosted copy. Earlier local-file/server refusals in `BROWSER_QA_0.3.0.md` remain historical evidence; local URL restrictions were not changed.

## Authorization, audience and exact deployment

The user requested a private copy in ChatGPT Sites and then instructed continued implementation and visual validation. This extends the earlier local-only boundary to this separate owner-private hosting workflow. Public repository creation, public release, the public domain, outreach and applications remain separate gates.

- Private Site: `appgprj_6ac797d3bcec8191873c4c6559f813c1`.
- URL: OWNER_PRIVATE_PREVIEW_URL_NOT_PUBLISHED
- Access readback: custom audience with one owner, no groups and no external visitors; the native owner-private deployment operation succeeded.
- Saved version: `appgprj_6ac797d3bcec8191873c4c6559f813c1~appgver_928c864358fc8191bec38315a2a04382`.
- Deployment: `appgdep_6ac79b74cb0881918ee4e1262ebaef58`, terminal `succeeded`.
- Private source commit: `27c69b04875087643248d9ec92a59839abf8e6c7`, authored by the verified project maintainer.
- Hosting archive: 278107 bytes, SHA-256 `cbd234c1a4275fe93a8b98ecbfc32daefd41d0b9e599001591d9963e197df01c`.
- All 47 static files match the prepared source; the archive additionally contains the new hosting manifest. Existing Git metadata, hosting identity and credentials were not copied into the new source.
- The original public Site `appgprj_6ac65e14eef481918b51d1fa2a7dbf75` remains public at https://mergewitness.com.br, version 2. No update or source push was made to it or the competition repository.

The supported source workflow committed/pushed the private copy before its Windows packager invocation failed on a Bash path. Packaging recovered by running the original `package-site.sh` with installed Git Bash and absolute POSIX paths, preserving its validations. The initial audit incorrectly expected `static.directory=.`; inspection confirmed the supported packager retains `dist`. Source/archive bytes were not changed for that correction. These failed attempts are not relabeled as successful runs.

## Browser validation

Browser: Codex In-app Browser, ID 2, background operation. Desktop viewport: 1280 × 720. Responsive viewport: 390 × 844. Temporary viewport override was reset after validation.

| Check | Recorded result |
| --- | --- |
| Private authentication | Normal ChatGPT sign-in reached the Site as its owner; an initial route error recovered through the normal retry flow |
| Identity/nonblank/overlay | Actual new title, headings and content visible; no framework error overlay observed |
| EN/PT | Heading, navigation and content switched correctly; EN → PT roundtrip confirmed |
| Historical replay | Alpha → Beta contaminated Beta (100 vs 90); reverse order contaminated Alpha (90 vs 100) |
| Historical correction | Both orders displayed rule pass, independent prices and retained cache |
| Copy command | Native click showed Copiado and returned the exact 105-character installed command through the browser clipboard |
| Real package download | 40515 bytes, SHA-256 `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`, matching candidate 002 |
| Portuguese guide download | 3739 bytes, SHA-256 `1469be1158a853b82be865c9fdaf05f46ef442054e3fab616d8d6c33dbae8025`, matching source |
| Installed HTML reports | Both distinct recorded executions opened with their expected evaluation identities and declared passing repair checks |
| Report disclosure/keyboard | Recorded observations expanded; Enter closed the disclosure (one open → zero open) |
| Desktop/mobile appearance | Site, installation commands and representative report inspected; no page overflow at tested widths |
| Historical video/captions | Video advanced and reached 150/150 seconds, error null; downloaded captions retained the original SHA-256 |
| Console | No observed error/warning from the private Site origin in the final captured log scope |
| Pilot contact | Actual mailto equals gabriel@mergewitness.com.br; no message was sent |

A DOM-assisted copy probe initially returned an empty clipboard; the native click subsequently confirmed the real command. Some locator/navigation calls timed out, and initial images preceded paint. The selected browser was retained, its documented native controls/fresh binding were used, and final visible states were checked. The initial thumbnail/blank images are preserved but excluded from accepted screenshot evidence. No source-code fix was needed.

## Evidence and limits

Full structured observations: `artifacts/startup-0.3.0/browser/private-site-browser-qa.json`. Archive readback: `private-site-archive-receipt.json` in the same directory. Accepted screenshots are listed in the browser receipt and stored under `artifacts/startup-0.3.0/browser/screenshots/`; they include desktop/PT, repaired historical lab, actual report, mobile hero, mobile installation and completed historical video.

These are owner/agent checks, not external adoption or an independent user study. Physical phones, Safari/Firefox, email composer launch and mailbox delivery are not established. The private hosting does not authenticate supplied report authors, run users' repositories remotely, establish an actual Claude workflow or guarantee program eligibility. No new 0.3.0 presentation video was produced.

The frozen candidate-002 package and previous 88/88 project tests plus 17/17 site/instruction checks remain unchanged. Next gate: an explicitly authorized independent public repository/release and site update, then measured unaided reproduction, one consented real external case and follow-up returns. Anthropic/OpenAI applications retain their separate evidence and authorization gates.

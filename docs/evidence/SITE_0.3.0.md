# Local Site preparation — MergeWitness 0.3.0

Date: 2026-10-08. **Final technical checkpoint: corrected candidate 002 and 17 site/instruction checks accepted. Local rendered QA: BLOCKED / NOT_RUN. No publication.** The prepared-phase sections below are retained as history; the final checkpoint at the end supersedes their earlier pending statuses.

## Source and scope

The site is the separate ignored nested Git checkout `site-preview/`, branch `main`, HEAD `7b38435c4c3ecbce8d56188448dd994f2f331a6c`, with no configured remote. `.openai/hosting.json` retains Sites project `appgprj_6ac65e14eef481918b51d1fa2a7dbf75` and static directory `dist`. Parent work is on `oss/local-0.3.0`. The original competition checkout was not opened or changed by this site task.

Before edits, seven editable files were backed up and 17 preserved files were hashed under ignored `artifacts/startup-0.3.0/site/pre-edit/`. The preserved set includes hosting identity, historical locale/worker/lab code, vendor/catalog modules, public reports, source manifest, MIT notice, cover/captions and the existing 0.2.1 tarball/quickstart. A later exact-byte comparison matched all 17 files.

## Prepared behavior and claims

- English/Portuguese product copy introduces the free local MIT core, replay across Git revisions and an offline report of recorded execution.
- New release evidence is separate from the historical browser lab, JSON, competition source and 150-second video. The 120-second 0.3.0 video is a storyboard only.
- The installation flow checks Node >=22, npm and Git, uses an explicit installed CLI path and quotes the actual returned `outputDir` in the report command. It instructs the reader to open the actual returned `reportPath`; source commands are documented separately.
- The package and Site are visibly identified as local release-candidate preparation. Public release, publication, an independent public remote and public npm release are not claimed.
- The first free pilot is one trusted, reviewed Node repository, one case and up to two technical sessions. Four external observation counts remain zero. There is no form or outbound message behavior.
- The user supplied and authorized public pilot address `gabriel@mergewitness.com.br`. The EN/PT button is a mailto only, with explicit composer behavior; no request is collected or sent automatically. No email was inferred from Git or the domain, and mailbox delivery is not verified.
- No actual Claude-assisted workflow or candidate-generation integration is claimed. A scoped stdio MCP SDK-client check may be mentioned only when its final root receipt is available.

The historical source remains `https://github.com/lawliet8886/MergeWitness` at upstream commit `5b649c4bdf4a9372c9f890816835c100b5be0d01`. Historical copyright and licensing are preserved.

## Local artifacts

Candidate 1 was copied only after root supplied its exact identity. Its installed acceptance passed, then the fresh independent whole-change review found canonical-viewer issues. Root is preparing a corrected candidate; candidate 1 is **not final release acceptance**:

```text
artifacts/releases/0.3.0/mergewitness-core-0.3.0.tgz
bytes: 38306
sha256: d831d437c6b4a7e32bcf86d8276551fd57389c9995adc81ae0f9fba54bcbea30
```

The Site copy `site-preview/dist/downloads/mergewitness-core-0.3.0.tgz` was independently hashed and matched; `SHA256SUMS_0.3.0` records this actual candidate-1 digest. Old 0.2.1 download paths were not overwritten. Before replacement, candidate 1 and its actual root receipt `artifacts/release-acceptance/0.3.0/run-20261008-111801/acceptance.json` were preserved under `artifacts/startup-0.3.0/site/candidate-1/`; its provenance states `candidate-1-not-final` and final checks `HOLD`.

Root quickstarts, report/API guides, pilot kit and storyboard are copied under `dist/downloads/release-0.3.0/` with their relative filenames. The Portuguese guide is copied from `docs/QUICKSTART_PT_BR.md` and includes the real installed report workflow.

Pending root assets: the corrected final package/hash, two corresponding accepted installed-run HTML paths and their portable evaluation/repair JSON, plus final acceptance/MCP receipts. Targets are `dist/evidence/release-0.3.0/installed-demo-1.html`, `installed-demo-2.html`, per-run portable JSON and `site-artifacts.json`. Final asset and copied-install checks remain on hold. No report image, execution output or receipt is fabricated.

Root subsequently corrected the three Important viewer findings. The focused checks passed 37/37 and the full corrected-source suite passed **88/88, 0 failed, 0 skipped**, with 182 source/snapshot hashes preserved. Candidate 002 is `artifacts/releases/0.3.0/candidate-002/mergewitness-core-0.3.0.tgz`, **40515 bytes**, SHA-256 `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`. These root source/package facts do not establish its exact installed acceptance; the site package replacement and final checks await the explicit terminal handoff. The candidate-1 archive remains unchanged.

## Checks and limits

`node --test tests/site.test.mjs` in `site-preview/`: **12 passed, 0 failed** after the contact and copy updates. This covers historical integrity/replay/repair bindings, EN/PT field coverage, local-candidate labels, installed entrypoints/report paths, pilot scope, zero observations, the confirmed mailto-only contact and historical/current separation. The new checks failed as expected before the corresponding source was implemented, then passed. Full successful output: `artifacts/startup-0.3.0/site/source-tests.log`; the isolated mailto red/green logs are beside it.

JavaScript syntax passed for `dist/app.mjs`, `dist/oss-locale.mjs`, `tests/release-assets.test.mjs` and `tests/copied-install.test.mjs`. `git diff --check` returned exit 0 with only the pre-existing checkout's CRLF-to-LF normalization notices.

`tests/release-assets.test.mjs` is prepared to check local link existence, unique page destinations, exact package/guide/report hashes and portable JSON bindings after the actual reports are copied. It has not run while these artifacts remain pending. The Git-heavy `tests/copied-install.test.mjs` is updated for 0.3.0 but **NOT_RUN** until root releases the serialized acceptance slot.

Rendered acceptance is separately blocked as documented in [BROWSER_QA_0.3.0.md](BROWSER_QA_0.3.0.md). Automatic approval review rejected the local `Start-Process` preview-server launch as `blocked by policy`, with no further stated reason. Internal-browser direct `file:` navigation was rejected because only HTTP/HTTPS is permitted, with an explicit prohibition on alternate-surface workarounds. No retry, alternate server/browser or rendering workaround was used. No screenshot, responsive layout, console health, clipboard permission, keyboard interaction or video playback is certified.

In a later user-requested diagnostic, root opened `https://mergewitness.com.br/` in the internal browser, confirmed its title/AX content and inspected the current published page's initial screenshot (green hero and historical lab). This confirms access to the **already-published historical page**, which contains none of the local 0.3.0 edits. It is not rendered acceptance of this local Site or offline reports, and it does not verify new desktop/mobile, download, clipboard or video behavior. The local 0.3.0 QA gate remains NOT_RUN.

No source synchronization, remote creation, push, Site save/deploy, domain change, contact, submission, paid API call, account configuration or commit occurred in this site task.

## Final technical checkpoint — 2026-10-08

The accepted root package is candidate 002, **40515 bytes**, SHA-256 `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`. Its exact Windows installation receipt is `artifacts/release-acceptance/0.3.0/run-20261008-115342/acceptance.json`, SHA-256 `7a6ccc74d950d415de1f721f2184dcc1ce7a98c2430ff29049165e2b2a64a0c3`: two actual installed demonstrations, two distinct HTML reports, 40 installed-file hashes unchanged, and 31 packed-source hashes matched. Candidate 1 remains preserved as historical evidence.

The final site workflow `node --test tests/site.test.mjs tests/release-assets.test.mjs tests/copied-install.test.mjs` passed **17 tests, 0 failed, 0 skipped**, including the actual offline copied-install demonstration. The log is `artifacts/startup-0.3.0/site/final-tests.log`. This proves the recorded source, asset bindings and copied command; it does not prove rendered layout, browser downloads or clipboard behavior. The final asset manifest is `site-preview/dist/evidence/release-0.3.0/site-artifacts.json`.

The six primary guides and their supporting document graph are included in the local site bundle. Its MCP document is a public-safe derived summary, bound to the original root document and SDK-client receipt rather than a blind copy of private local paths. The claim remains **source 0.3.0 initialize/listTools/ping** and the separately recorded **0.2.1 full SDK workflow**, with an actual Claude model-assisted workflow NOT_RUN.

An attempted full replacement of this receipt using PowerShell `Set-Content` was rejected as `blocked by policy`, without a stated reason, and did not execute. The exact command, proposed replacement and unchanged prepared-phase snapshot are preserved under `artifacts/startup-0.3.0/site/`. This smaller context-checked edit preserves the existing history instead of replaying that full replacement. It does not change permissions or bypass the separate browser restriction.

Current authoritative root acceptance and limits are documented in [VALIDATION_0.3.0.md](VALIDATION_0.3.0.md) and [BROWSER_QA_0.3.0.md](BROWSER_QA_0.3.0.md). New local rendered QA remains **BLOCKED / NOT_RUN**. The existing published HTTPS page was inspected only as an access diagnostic. No publication or external pilot event occurred.

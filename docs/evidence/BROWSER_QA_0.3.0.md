# Internal-browser QA — 0.3.0

Date: 2026-10-08. **Rendered acceptance: NOT_RUN / policy-blocked.** Source/unit/instruction tests are recorded separately and are not visual, clipboard, keyboard or media-playback acceptance.

Root selected the existing Codex In-app Browser, ID 2, in background mode and read its local-development, screenshot and viewport documentation. No external/native browser, desktop input, global browser setting or publication was used.

Two distinct actions were rejected:

1. The execution tool's automatic approval review rejected a task-scoped `Start-Process` command for a Python preview server bound to `127.0.0.1:8765`, serving only the generated report folder. It returned `blocked by policy` without a more specific reason. The command did not execute; no server or public endpoint was created.
2. A materially simpler attempt to open the already-generated HTML directly with the internal browser at a local `file:` URL was rejected by the browser URL policy. Only `http:` and `https:` are permitted. Its response explicitly forbids workarounds, indirect execution, raw CDP, alternate browser surfaces and policy circumvention. Root stopped browser QA at that gate.

No server retry, alternate launch mechanism, rendering workaround or fallback browser was used. No temporary viewport override was set. No screenshot of the new local version, responsive layout, console, clipboard, keyboard interaction or historical video playback has been verified in this cycle.

## Additional read-only diagnosis

At the user's request, root opened `https://mergewitness.com.br/` successfully in the same internal browser and inspected its initial viewport screenshot and accessibility state. The visible historical page had the expected title, green hero and links to the competition source. This confirms that permitted HTTPS navigation and capture work; it neither serves the new local files nor validates their rendering. No public content was changed. Receipt: `artifacts/startup-0.3.0/browser/diagnostic.json`.

The active environment already grants Full Access with approval policy `never`. The preview rejection nevertheless came from the execution tool's automatic approval review. Its response supplies no configuration provenance or detailed reason; there is no evidence here that the user created the rule, and no policy or security setting was modified. Available Sites capabilities describe production deployments, so they do not provide an authorized local-only preview substitute.

A read-only check of permission keys in `~/.codex/config.toml` confirmed `approval_policy = "never"` and `sandbox_mode = "danger-full-access"`. The inspected user `requirements.toml` and project `.codex/config.toml` do not exist; this does not prove absence of app-managed or other policy layers. Authentication and unrelated configuration were not printed or changed.

The [official Auto-review guide](https://learn.chatgpt.com/docs/sandboxing/auto-review), checked on 2026-10-08, describes interactive approval requests and says `never` does not produce that review. The observed denial and reported local configuration are therefore insufficient to explain the cause; do not label this a confirmed user-authored rule or a confirmed product bug. The guide describes an exact-action override in the open-source TUI, but that control is not exposed by this session's tools. No override, policy replacement or denied-action retry was performed.

## Required later acceptance

A permitted internal-browser preview environment is needed for the separate site and generated report, or the user can inspect the local files manually and record the result. Credentials and broader permissions are not requested or changed by this receipt. Do not deploy just to obtain a preview under the current local-only scope.

Inspect desktop/mobile layout, absence of page overflow, legibility of observations and hashes, keyboard disclosure/link behavior, EN/PT navigation, copy commands, real downloads and historical video. Keep the exact accepted package/demo/report hashes with that review. Until it occurs, the release remains a technically tested local candidate with rendered QA pending, and the pilot/distribution gate is not complete.

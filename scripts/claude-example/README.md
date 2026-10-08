# Explicit, bounded Claude proposal example

This optional source-checkout controller is outside the accepted package's packed whitelist. It installs the exact reviewed package, creates synthetic histories and keeps the source repository read-only. It is not a hardened sandbox and is never invoked by installation or the test suite.

Use the [web/local runbook](../../docs/CLAUDE_WEB_WORKFLOW.md) for the zero-spend route. A real model response and local source review are necessary before candidate verification. One user-forwarded web proposal has passed local verification and a fresh replay. Provider origin is reported by the user; provider UI/model identity were not independently captured.

The optional Claude Code route is `setup`, `propose --acknowledge-subscription`, local source review, `verify --acknowledge-subscription --reviewed-candidate`, then `replay`. It needs a verified eligible account, uses a session-scoped four-tool MCP configuration, retains wire/results, and never changes global login/model/billing settings or falls back to an API key. No actual model-assisted MCP workflow is currently proven.

Never overwrite a run, substitute a provided repair for model provenance, weaken checks or execute code before reviewing it. Keep every unsuccessful diagnostic and model attempt. Private evidence belongs under ignored `artifacts/`.

# MergeWitness independent OSS working agreement

- This checkout evolves the MIT-licensed MergeWitness prototype independently. The upstream IBM competition repository at `../Concurso/MergeWitness` is read-only and must never be modified or pushed to.
- Preserve Signal Foundry copyright, original Git history, and historical evidence. Record the upstream URL and commit in documentation.
- Work locally only: no remote creation, push, deployment, outreach, paid API use, or account configuration changes.
- Use newly authored fixtures or licensed, attributed public incidents. Distinguish upstream reproduction, minimized reconstruction, and synthetic controls.
- Execute only trusted, reviewed local code. A subprocess or worktree is not a hardened security sandbox.
- Preserve requirements from both branches with explicit immutable checks; inconclusive executions must never pass.
- New analysis state and reports use version 2. Historical version 1 reports are evidence, not eligible input for strict repair verification.
- Core owner: `src/core`, `tests/core.test.mjs`, new core regression tests. Package owner: root package files, `src/cli`, `src/mcp`, `src/demo`, package/demo/protocol tests. Root owner: docs, fixtures/case corpus, scripts, site preparation, validation, integration, and review. Coordinate shared interfaces before editing.
- Do not commit, change global Git configuration, or modify files outside this checkout without root-agent coordination. Keep technical instructions and code comments in English.
- Full outputs belong under ignored `artifacts/`; retain concise validation receipts under `docs/evidence/`. Keep progress in `docs/IMPLEMENTATION_LOG.md`.

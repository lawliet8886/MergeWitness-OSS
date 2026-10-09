# MergeWitness 0.3.0 — release candidate

This independent MIT version adds an offline HTML evidence view. `mergewitness report` accepts the existing core and portable demo v2 reports, checks pair identity/frozen inputs and keeps generated output separate. It presents recorded observations, classifications, declared requirements, correction results and limits without scripts, external assets or executing repository code.

The core API v2, caller-authored checks, supported `node --test` runner and paid-API-free workflow remain unchanged. The stdio MCP server now answers health-check `ping` with an empty result; scoped official-client evidence is recorded separately from an untested actual Claude/model-assisted workflow.

English and Brazilian Portuguese installation guides, a free first-pilot kit and an approved two-minute narrated film accompany the release. The live website presents the independent project, examples and recorded Claude web proposal. Private application worksheets remain outside the public repository. Existing competition history and earlier evidence are preserved.

Acceptance evidence: [validation](evidence/VALIDATION_0.3.0.md), [MCP](evidence/MCP_0.3.0.md), [site](evidence/SITE_0.3.0.md) and [execution ledger](evidence/PROGRESS_0.3.0.md). Use the final tarball SHA256SUMS from its acceptance run.

Publication distributes the unchanged accepted candidate-002 tarball (40515 bytes, SHA-256 `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`) alongside the public source and updated guides. The archive's acceptance-time documentation is preserved; updated source guides may differ, so rebuilding from the tag is not promised to reproduce that compressed archive's hash. Runtime source hashes remain unchanged.

There is no npm registry release, demonstrated external pilot or application submission. Anthropic preparation waits for a real pilot; OpenAI has a separate use/maintenance gate. Neither approval is guaranteed or a dependency of the product.

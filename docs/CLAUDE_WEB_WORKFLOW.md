# Claude web proposal with local MergeWitness verification

Status: **user-forwarded Claude web proposal verified locally and replayed in a fresh analysis**. This is one synthetic example, not an external pilot. Provider origin is reported by the user; the model label and provider UI were not independently captured. It does not establish Claude Code/MCP model integration.

Claude Free does not include Claude Code. Ordinary Claude web chat can be used to propose code within the account's actual limits. The local MIT core does not require a model subscription. See [current Claude plans](https://claude.com/pricing).

## Reviewed local setup

From this independent source checkout, obtain the actual accepted 0.3.0 tarball. Its SHA-256 is `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688`. There is no assumed public npm release or independent public GitHub remote.

```sh
node scripts/claude-example/run.mjs setup --out ./artifacts/claude-example/my-run --package ./mergewitness-core-0.3.0.tgz
node scripts/claude-example/run.mjs local-prepare --run ./artifacts/claude-example/my-run
node scripts/claude-example/run.mjs negative-control --run ./artifacts/claude-example/my-run
```

Use a fresh output directory. This orchestration controller is currently exercised on Windows; the core has separate Windows and Linux acceptance. Setup installs the reviewed tarball offline with lifecycle scripts disabled and creates trusted synthetic histories. Preparation executes the installed API, freezes the probe and calibrates tenant-pricing in A and cache in B before any model proposal. It retains the actual evaluation and a path-free `context-for-claude-web.txt` containing the actual combined source and check inputs. The optional negative-control step independently records that removing caching passes the sequence/pricing check but fails caching and cannot approve the repair; no model is involved.

## Obtain and record a real proposal

Use your existing Claude web account. Send only the synthetic context from the generated text file. Do not enable paid usage or send private customer code. Keep the full actual response and the displayed model label; if the UI does not expose the model identifier, say so. A screenshot is optional evidence, not permission to publish personal account details.

Save the complete proposed catalog module as `model-catalog.js` in that run. Preserve the full response as `claude-response.md`. Inspect the entire source before executing it. The candidate must retain `createCatalog`, `getPrice` and `getSourceCalls`, pricing and caching; only `src/catalog.js` may change.

Record `provider-source.json` with `client: "claude.ai web"`, the actual candidate SHA-256, response evidence SHA-256, recording method, displayed model label, date and any human/controller intervention. Verification binds those hashes to the retained response and requires its JavaScript block to match the reviewed source. Operator-supplied provenance is not cryptographic proof of provider identity. Never relabel the retained demo repair, Codex-authored code or an invented response as Claude output.

```sh
node scripts/claude-example/run.mjs verify --run ./artifacts/claude-example/my-run --local-controller --reviewed-candidate
node scripts/claude-example/run.mjs replay --run ./artifacts/claude-example/my-run
```

The controller applies/commits the recorded module unchanged, checks a no-cache negative control, verifies the actual candidate with the same frozen requirements, retains a patch/bundle and disposes the private clone. The whole terminal attempt is covered by controller cleanup, including application/export or optional-client failures; `verify-lifecycle.json` retains the original failure and cleanup status. Successful verification creates an immutable `verification-seal.json`. Replay checks that seal, the reviewed source and prior receipt before preparing any new analysis, and rechecks the web response binding. It does not request another generation or overwrite an earlier replay. Retain every failed run; use a fresh run after terminal failure.

Inspect the raw results: Base/A/B passing and an interaction witness in Combined; negative control rejected; candidate and replay passing their probe, ordinary tests and both calibrated requirements. Errors, timeouts, inconsistent executions or missing coverage cannot pass. Record failed proposals and stop on account/quota errors. Passing covers the declared inputs/checks, not arbitrary repair correctness.

## Recorded web/local result — 2026-10-08

The user forwarded a complete response from their existing free web account on their phone. The candidate uses `JSON.stringify([tenant, sku])` for the cache key. The local controller reviewed and applied that exact module without changing pricing, tests or frozen checks. Only `src/catalog.js` changed. The candidate passed the sequence, three ordinary tests and both calibrated requirements. A fresh analysis passed using the same recorded code; the fixture and check hashes were unchanged and disposable clones were removed. The no-cache control failed cache retention and was rejected. This string-identifier example does not establish a universal identity encoding for arbitrary JavaScript values.

Candidate SHA-256: `2dfde5b4bfee6ebdb9cba15407e9bd6d0430f78772bc79ed753318f4a67844b3`. Retained response SHA-256: `617c9f940a9d087084d86e016bf16e3b0ea268440ab0b4c7183da318acd01c8f`.

## Optional Claude Code route — separate validation gate

The opt-in `propose`/`verify` route uses the existing four MCP tools and a transparent recorder. It requires a separately verified eligible Claude subscription and explicit `--acknowledge-subscription`. Its model sessions have no built-in shell/edit tools; the local controller applies the candidate. It remains **unverified with a model** in this project. Two recorded diagnostics initialized/listed the installed server but stopped before model usage because the saved login was invalid. Do not treat cached `subscriptionType` as active entitlement or configure API billing as a fallback.

Keep raw analysis states, account/login details and full private paths under ignored artifacts. Publish only separately reviewed, path-free evidence. See [API limits](API.md), [pilot protocol](PILOT_KIT.md) and [positioning](POSITIONING.md).

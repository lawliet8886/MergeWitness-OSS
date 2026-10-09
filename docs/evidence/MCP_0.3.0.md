# MCP investigation for the 0.3.0 local cycle

Date: 2026-10-08. Independent checkout: `MergeWitness-OSS`, branch `oss/local-0.3.0`, baseline `cd1984c7d8c8e94c2f4f981fcec3e4cefadcb667`.

**Observed result:** the full requested stdio workflow passed with the official **SDK v1.32.1 client against the initial 0.2.1 source**. An initial SDK `ping()` diagnostic exposed `-32601: Unknown method: ping`. After the root agent fixed that handler and bumped metadata, **fresh initialize/listTools/ping checks passed against source 0.3.0**. The core hash matches the initial full run. Actual Claude Code connection and model-assisted repair are **NOT_RUN**. This is limited client evidence, not an MCP conformance or provider-integration claim.

## Tested versions and boundaries

| Item | Observed value |
| --- | --- |
| Windows / Node | win32 x64 / v24.14.0 |
| npm | 11.9.0 |
| Official npm client package | `@modelcontextprotocol/sdk@1.32.1`, MIT |
| Initialized MCP protocol | `2025-11-25` |
| Initial server identity | `mergewitness`, **0.2.1** |
| Package before/after the initial full run | `mergewitness-core`, **0.2.1** |
| Final source server/package metadata | `mergewitness` / `mergewitness-core`, **0.3.0** |
| Main run | 2026-10-08 10:54:33–10:57:27 UTC, process exit **0** |
| Claude commands / paid provider calls / new spending | **0 / 0 / 0** |
| Claude version, authentication and entitlement | Not inspected or established |

The 0.3.0 title identifies the implementation cycle. The initial full-workflow receipts exercised the pre-bump 0.2.1 source and are not silently relabeled as a 0.3.0 package acceptance. The final source-only follow-up is recorded separately below; it does not rerun the full fixture or inspect an installed tarball. The official documentation identifies `@modelcontextprotocol/sdk` as the maintained v1 line; current v2 uses separate client/server packages. **SDK v2 was not tested.** [Official SDK documentation](https://ts.sdk.modelcontextprotocol.io/)

Only this receipt and `artifacts/startup-0.3.0/mcp/` were written by this investigation. Installation used an isolated prefix and cache, with install scripts, audit and funding checks disabled. This investigator did not modify root/runtime dependencies, core, CLI, MCP, package, tests, site or global/user Claude settings; the later MCP and metadata implementation belongs to the root agent. The original `../Concurso/MergeWitness` checkout was not written to. No login, account setup, provider prompting, publication or external pilot was attempted.

## Requested workflow

The harness imports the official `Client`, `StdioClientTransport` and `CallToolResultSchema`. Transcript hooks record SDK messages without replacing transport framing or protocol validation. The SDK spawns the actual `src/mcp/server.mjs`; explicit subprocess `TEMP`, `TMP` and `TMPDIR` values place private clones/state inside the authorized scratch directory. Calls are sequential.

| Check | Actual decoded outcome |
| --- | --- |
| Initialize | PASS; protocol `2025-11-25`, capability `tools: {}`, server 0.2.1; SDK sends `notifications/initialized` |
| List tools | PASS; exactly `prepare`, `evaluate`, `verifyRepair`, `dispose` |
| Prepare | PASS; clean merge; `node --test` passes in all four snapshots |
| Evaluate | PASS; `interaction_witness`; stable Base/A/B passes and combined failure |
| Verify unrepaired combined candidate | PASS as a rejection check; decoded `passed: false`, failing probe, retained A/B checks |
| Verify predetermined repaired candidate | PASS; decoded `passed: true`, stable passing probe, `retentionVerified: true`, both origins covered |
| Dispose | PASS; decoded `disposed: true`; the owned private analysis directory is absent afterward |

All five tool replies contain one JSON text block and matching `structuredContent`. There are 15 recorded messages, seven correlated request/response pairs and zero protocol errors in this covered workflow. The independent receipt readback verified **38 receipt hashes and six log hashes**, the decoded responses, frozen manifests, evaluation/repair identity links and the before/after manifests.

### Synthetic fixture and declared requirements

The newly authored, reviewed MIT control combines tenant-specific quotes (branch A) with repeated-SKU caching (branch B). It is **synthetic**, not an upstream issue reproduction, customer case or external observation. The fixture includes the Signal Foundry MIT notice. Checks execute only Node builtins, declared local helper/data files and production modules from the selected snapshot. A subprocess/private clone is not a hardened sandbox.

Each observation and requirement is repeated twice with consistent structured results. Ordinary tests pass everywhere.

| Snapshot | Observed sequence | Expected sequence | Probe |
| --- | --- | --- | --- |
| Base | `[10,10,10]` | `[10,10,10]` | pass |
| A | `[7,13,7]` | `[7,13,7]` | pass |
| B | `[10,10,10]` | `[10,10,10]` | pass |
| Combined | `[7,7,7]` | `[7,13,7]` | fail |

The frozen `tenant-quotes` requirement is calibrated on `branchA` and asserts quotes 7 and 13. The frozen `sku-cache` requirement is calibrated on `branchB` and asserts that two identical quotes use one source read. Both pass again in the repaired candidate. The predetermined repair is applied by the harness **only to the disposable candidate**, changing `src/quotes.mjs` to key cache entries by tenant and SKU. No Claude repair was generated or applied.

Fixture commits: base `a775566e9496b4a99af7498034eb74221032bdc5`; A `480974080e015797fa0ce978cc84e7fb15178f03`; B `ba91ce8fb22f7685eb63d7e47f990b8e26f997a2`. Candidate: `6f1ddfe0ffab5f89cf2451cb0e51a332bd04f61b`. The original scratch repository, repair patch and candidate Git bundle remain available. Disposal removes the private analysis clone; archived state snapshots are forensic receipts and no longer executable analysis inputs.

The fixture's HEAD, tree, refs, file hashes and clean status are identical before/after. Check files and the seven captured checkout files also have identical before/after hashes, including core and MCP. Full provenance, licenses, exact arguments, requirements, dependencies and hashes are in the linked run receipts.

## Initial compatibility failure and final source follow-up

On the initial unmodified 0.2.1 MCP source, a fresh official SDK client initialized and listed tools, but:

```js
await client.ping({ timeout: 5000 });
// Rejects: McpError, code -32601, "Unknown method: ping"
```

The [MCP ping specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/ping) describes the optional health-check mechanism and an empty receiver response. The initial handwritten dispatcher lacked a `ping` handler. This reproduced a concrete SDK health-check gap; its effect on an actual Claude Code connection was not tested.

The ping diagnostic (local audit artifact retained outside the public repository) records **`pingStatus: FAIL`**, the actual SDK exception, unchanged server hash, empty stderr and transcript. Its audit wrapper exits **0 because it confirms the expected failure**; this must not be represented as a passing ping. No fix was made by this investigation.

The root agent subsequently implemented the empty ping response and updated source metadata to 0.3.0. A new official SDK session at **2026-10-08 11:05:52 UTC**, process exit **0**, observed:

| Final source-only check | Decoded result |
| --- | --- |
| Initialize | PASS; protocol `2025-11-25`, server `mergewitness 0.3.0`, `tools: {}` |
| List tools | PASS; the same four operation definitions |
| SDK ping | PASS; empty result `{}` |
| Package metadata before/after | `0.3.0` / `0.3.0` |
| Source stability | The five captured source/metadata file hashes match before/after |
| Core continuity | `fed2bef5786b920086ab39e4063ff427b96846d594666caa82b684345726da06`, equal to the initial full run |
| Protocol transcript | Seven messages; zero protocol errors; client closed |

The final 0.3.0 SDK receipt (local audit artifact retained outside the public repository) and hash verification (local audit artifact retained outside the public repository) preserve this follow-up separately. Status SHA-256: `3a00fc7a5983c370598e6d1cfb29adfacab018064d758b406c9a1b774807cb93`; transcript: `a8c01db6efb7976b944e42c5f75984e4f7d3b1d5400702d655ee4865c6f01b2e`; final MCP source: `d1e626071cdfb09abd4a9ccd21e3bd6f68c7844c34024dfa4760520bfa4b6d9a`. All five stored artifact hashes were read back and verified.

**The full prepare/evaluate/verifyRepair/dispose fixture was observed on 0.2.1; only initialize/listTools/ping and source metadata were freshly checked on 0.3.0.** No Git or repository/test execution, Claude commands or paid API calls occur in the final follow-up. The original receipts and failure diagnosis remain unchanged.

## Commands and retained evidence

Executed from the independent checkout; the setup receipt contains the expanded absolute install command and exact observed versions:

```powershell
$mcpScratchPath = '<user-profile>\Documents\ChatGPT\MergeWitness-OSS\artifacts\startup-0.3.0\mcp'
npm.cmd install --prefix "$mcpScratchPath\sdk-client" @modelcontextprotocol/sdk --ignore-scripts --no-audit --no-fund --cache "$mcpScratchPath\npm-cache"
node --check artifacts/startup-0.3.0/mcp/sdk-client/run-sdk-check.mjs
node artifacts/startup-0.3.0/mcp/sdk-client/run-sdk-check.mjs
node artifacts/startup-0.3.0/mcp/verify-receipts.mjs
node artifacts/startup-0.3.0/mcp/sdk-client/ping-diagnostic.mjs
node artifacts/startup-0.3.0/mcp/sdk-client/final-sdk-check.mjs
```

The install resolved SDK 1.32.1 and preserves its exact registry integrity and transitive versions in the isolated lockfile. The `commands.jsonl` ledger records 31 harness Git commands, including one expected `git log` failure before the first synthetic commit existed; later commands succeed. Internal core behavior is bound by the captured core source hash, tool arguments, state and reports; the harness ledger is not a system-wide subprocess trace.

Main run directory: run-2026-10-08T10-54-33-611Z (local audit artifact retained outside the public repository).

- Status and hash ledger (local audit artifact retained outside the public repository)
- Independent receipt verification (local audit artifact retained outside the public repository)
- Fixture provenance (local audit artifact retained outside the public repository), source hashes before (local audit artifact retained outside the public repository), source hashes after (local audit artifact retained outside the public repository)
- Core v2 evaluation (local audit artifact retained outside the public repository), repaired candidate verification (local audit artifact retained outside the public repository)
- Setup receipt (local audit artifact retained outside the public repository), main output (local audit artifact retained outside the public repository), official documentation notes (local audit artifact retained outside the public repository)

Selected SHA-256 values; all other receipt hashes are in the ledger:

| Artifact | SHA-256 |
| --- | --- |
| Main `status.json` | `c2814b1c7a82b8666b670b40da3405b6ca4d8a145e699e8eb18f991b613adac9` |
| Main `wire.jsonl` | `527325fd04130202fa5a3a8b0a0a6c80db56571762c4c9701ffafc2895dd5024` |
| Main `commands.jsonl` | `1ae3215cfb259446b7d54365045535ddf098b5e46a3b54491a19c2985310d8d7` |
| Main `sdk-check.log` | `d351efccbfa190e4eaf2dcba180f6385fc90b874b6b9f636d5546a3b2dbeb4b5` |
| SDK isolated lockfile | `7c048a60976fe82888bbc4e88769b75b1db29c926c7376d40629d90d7829d3ff` |
| Core before/after | `fed2bef5786b920086ab39e4063ff427b96846d594666caa82b684345726da06` |
| Initial MCP server before/after | `4d5578b619f05f699c6a9150350212c7ef4d578c58ab2ead35ef2bbec558071c` |
| Ping transcript | `8f0c3cb24d78a4425c5fd139e55c568b637b25da56c8eaf79b7b43cce8a580fa` |

## Remaining gates

Actual Claude Code connectivity, authentication, entitlement, model-assisted repair, SDK v2, complete protocol conformance and external pilot acceptance remain unverified. No arbitrary repair correctness or customer-code safety is established by this synthetic control.

The [official Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) supports stdio and explains that default/local and user MCP configuration reside in `~/.claude.json`; project configuration and approvals are separate. No `claude mcp add`, prompting/`--print`, configuration read/write or approval reset was executed. Installation of a Claude executable alone proves none of the remaining gates.

Primary references read on 2026-10-08: [official SDK client guide](https://ts.sdk.modelcontextprotocol.io/client.html), [SDK protocol guide](https://ts.sdk.modelcontextprotocol.io/protocol.html), [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) and [stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

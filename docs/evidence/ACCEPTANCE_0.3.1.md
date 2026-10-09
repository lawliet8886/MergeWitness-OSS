# MergeWitness 0.3.1 technical acceptance — 2026-10-09

The [final hosted run 37913536449](https://github.com/lawliet8886/MergeWitness-OSS/actions/runs/37913536449) tested runtime source `f6848fd27950fb0a7aab3525229492fe91fc5eca`. All four jobs succeeded:

| Environment | Passed | Failed | Skipped | Corpus labels matched |
| --- | ---: | ---: | ---: | ---: |
| Windows / Node 22 | 100 | 0 | 0 | 12/12 |
| Windows / Node 24 | 100 | 0 | 0 | 12/12 |
| Linux / Node 22 | 99 | 0 | 1 | 12/12 |
| Linux / Node 24 | 99 | 0 | 1 | 12/12 |

The Linux skip is the explicitly Windows-only drive-case regression; all platform-independent checks run. The prior failed run and superseded cancelled run remain visible. [Diagnosis and scoped correction](WINDOWS_PATH_0.3.1.md) record the native common-directory fix, independent-clone rejection and local regression limitations. No original assertion was disabled to obtain the corrected matrix.

The selected archive is **41168 bytes**, SHA-256 `d4a29f561e1e42015dfa12aa5726e268e9d48686fa5f71b84fbdf236d816f763`. All 31 packed source files matched the Git bytes of the tested source; npm's normalized package JSON was compared semantically. There are no runtime dependencies or install hooks required by the example.

A fresh offline Windows installation with lifecycle scripts/audit/funding disabled reported version `0.3.1`. Two installed synthetic demos passed with `retentionVerified:true`, generated separate offline HTML reports, preserved earlier report/evaluation bytes and left all 31 installed file hashes unchanged. These are internal checks, not external adoption or a general repair guarantee.

The immutable locally preserved 0.3.0 archive/tag remains historical. Use the [0.3.1 release](https://github.com/lawliet8886/MergeWitness-OSS/releases/tag/v0.3.1) and its matching SHA256SUMS. Current publication receipts distinguish tested runtime source from subsequent documentation-only commits; network readback is separately verified at handoff.

MIT/Signal Foundry, pinned third-party notices and all 16 original competition commit IDs are preserved. External participants, real pilot cases, model-mediated Claude Code/MCP integration and program acceptance remain unproven.

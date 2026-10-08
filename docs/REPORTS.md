# Offline evidence reports

`mergewitness report` reads existing JSON and creates a self-contained HTML view. It does not execute a repository, run a model, re-run checks or certify the author of the input. No API key, server or network connection is required to open the result.

```sh
mergewitness report evaluation.json --repair repair.json --out ./mw-reports
```

The explicit installed entrypoint works without changing PATH:

```sh
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs report evaluation.json --repair repair.json --out ./mw-reports
```

`--repair` is optional. `--out` is required. A successful command prints `{outputDir, reportPath, evaluationId, verificationId?}` as JSON. Open the returned `reportPath` in a browser. Each call creates a unique directory and keeps earlier output and input bytes unchanged. Exit zero means the view was generated; read its outcome to know whether the supplied verification approved the candidate.

## Supported inputs and binding

- Canonical v2 evaluation and verification reports from the core API, with matching analysis/evaluation identities, frozen probe hash, source commit/tree and the complete frozen feature-check set (requirements and legacy checks). Duplicated records, manifests, coverage and eligibility must agree. Recorded run status and structured output must support each observation summary and its repetition count; timeouts and other execution diagnostics remain visible.
- Portable v2 `evaluation.public.json` / `repair.public.json` from the installed tenant-cache demonstration. These also require the repair's `evaluationPublicReportSha256` to match the exact evaluation-file bytes. Reformatting evaluation JSON changes this binding: keep the original pair.

Pass the report objects themselves, not CLI/API wrappers or `workflow` output. Canonical reports are stored at the core's returned `reportPath`. Historical v1 reports, textual-conflict results without a v2 matrix, mismatched pairs and contradictory passing claims are rejected before HTML output. The historical browser laboratory has a different report format and remains separate.

The view shows Base, Change A, Change B and their combination, recorded observations, caller-authored calibrated requirements, candidate results and the input digest. An inconclusive or absent verification is visibly distinguished from approval. No-witness results are not safety certificates.

## Limits and sharing

The input pair checks establish consistency between supplied records, not authenticity: an author can fabricate a JSON file. The HTML does not authenticate a producer or replace the original JSON. Passing checks cover only their declared operations, requirements and dependencies.

All supplied text is escaped. The generated page contains no JavaScript, external assets, analytics or remote links. Review the original reports before sharing: raw subprocess output may contain local paths or repository information. Automatic redaction and signed attestation are not implemented.

See [English installation](QUICKSTART.md), [Portuguese installation](QUICKSTART_PT_BR.md) and the [API v2 contract](API.md). The core API and public exports remain unchanged.

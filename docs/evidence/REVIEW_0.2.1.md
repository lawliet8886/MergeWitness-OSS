# Independent 0.2.1 review and fix pass

Fresh read-only reviewer, model gpt-6-astra, reviewed the working-tree change against base `95ce4b6fd1280c97031c1455238fb4cadb2087ff`, the approved plan and ledger. No second independent review is claimed.

Verdict: ready with fixes. No Critical findings. Two Important findings:

1. The generated public Git harnesses lacked attributes, so Windows `core.autocrlf=true` changed admitted LF library bytes to CRLF in executed snapshots. Vendored files themselves matched the downloaded archives. Fix both the existing DataLoader and new library harnesses, and record actual snapshot/candidate hashes rather than only vendor hashes.
2. The site's copied bare `mergewitness` command was absent from PATH after the documented `--prefix ./mw-tools` install. Use an explicit portable Node entrypoint path, and execute that instruction against a real prefixed installation.

Root fix verification: published-byte report regression was RED (missing verified snapshot/candidate proof); copied-command regression was RED (executable not found). GREEN and post-fix receipts are appended after actual execution. New private harnesses declare `* -text` before their first commit; actual modules, notices and reusify dependency files are hashed before/after evaluation and candidate verification. The core contract is unchanged.

Focused GREEN: all four public replays passed on Windows/Node 24 with `core.autocrlf=true` forced in child Git configuration (193426 ms), including snapshot/candidate hash proof and actual repetition counts. The prefixed-install copied-command test plus eight source checks passed (9/9, 100036 ms) against the preserved 0.2.0 baseline artifact; repeat the command acceptance against the exact final 0.2.1 artifact before delivery.

Minor findings: English badge still used v0.2 (completed as part of the requested version update); task-local closeout stated three repetitions without an evidence check (bind the final claim to observed run counts and include the separate portability receipt).

Declined to judge, with root disposition:

- Browser rendering/console/keyboard/video: remains explicitly unverified because IAB attachment failed; source/command checks are not a rendered acceptance. Cost: publication readiness cannot be claimed until rendered QA is completed.
- Exact final tarball and download: review occurred before the final artifact gate; root must execute exact packed acceptance and verify copied hashes before claiming delivery. Cost: a preparatory pack alone cannot be accepted.
- Publication/external usage/provider integration/application selection: outside this local milestone and not performed. Cost: no external outcome may be inferred from local preparation.

Review reproduction cleanup: automatic approval review rejected removal of `<user-profile>\AppData\Local\Temp\mw-readonly-review-np3rwmp8`, stating only a policy block. The directory was retained; no alternate deletion mechanism or permission bypass was attempted. The reviewer made no checkout changes.

Erratum: earlier Windows public replay results establish the observed behavior and retained features, but their generated snapshots were subject to CRLF conversion. Do not label those earlier Windows executions byte-identical to published modules. Vendored bytes and licenses remain exact; new post-fix execution receipts are needed for that stronger claim.

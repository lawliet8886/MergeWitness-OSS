# Independent release and publication handoff

The founder authorized independent public GitHub publication on 2026-10-09. Use only `lawliet8886/MergeWitness-OSS`; the original competition repository remains protected. Outreach, application submission, billing and account changes need their separate instructions.

## Release candidate

- Preserve the clean competition checkout at `5b649c4bdf4a9372c9f890816835c100b5be0d01`; keep Signal Foundry attribution and third-party notices.
- Use the independently reviewed 0.3.0 local commit on `oss/local-0.3.0`; keep the 0.2.0 and 0.2.1 artifacts/receipts unchanged.
- Inspect `docs/evidence/VALIDATION_0.3.0.md`, `MCP_0.3.0.md`, `SITE_0.3.0.md` and `PRIVATE_SITE_QA_0.3.0.md` for exact phase-specific tests, package acceptance, client checks and the completed private rendered QA.
- Install the exact release asset in a clean separate prefix with scripts disabled, run two demos and their offline HTML reports, and confirm retained checks, unique output and unchanged installed bytes. Match the site download SHA-256 to that asset.
- Include the tarball, SHA256SUMS, QUICKSTART and release notes. Initial distribution is the GitHub release, not npm; `private:true` stays set.

## After specific publication authorization

Verify the authenticated GitHub account and that a new `MergeWitness-OSS` repository is the intended destination; check for an existing repository before creating anything. Preserve Git history and use MergeWitness as the display name. Never replace, merge into, or push to the competition repository.

Use the sanitized maintained public copy. The full pre-publication local history contains private notes and is preserved separately; never attach it as a remote or push its old refs. The public [history map](evidence/PUBLIC_HISTORY_MAP_2026-10-09.txt) preserves all 16 upstream SHAs and maps the seven independent sanitized commits.

Push only reviewed `main` and the authorized `v0.3.0` tag; do not mirror all refs or upload ignored artifacts/private analysis states. CI runs on `main` and pull requests; tags do not repeat the same matrix. Inspect completed jobs before claiming hosted validation. Publish the unchanged accepted release assets and read back their downloaded bytes, version and SHA-256. Updated source documentation can differ from the accepted archive; keep local/hosted/installed results distinct.

The website is a separate Sites project, `appgprj_6ac65e14eef481918b51d1fa2a7dbf75`. Local source is `site-preview/`; its original source commit is `7b38435c4c3ecbce8d56188448dd994f2f331a6c`. Remote source access uses the Sites source workflow and its authenticated access; credentials must not be committed or printed. Re-fetch current production/source metadata before any update and reconcile intervening changes rather than overwrite them. Use the prepared site diff, completed internal-browser QA and new repository/release URLs; keep the historical competition reference. Publish only on explicit instruction, then verify live links, download hashes and responsive interactions.

## Community and application

Make the contribution guide, reproducible-case template, supported runtimes and declared limits visible. Address real installation/case issues and review external changes with the normal checks. Use `docs/EXTERNAL_VALIDATION.md` after separately authorized outreach; an issue template is not an external contribution.

Application worksheets remain in the private preparation copy. Prepare Anthropic after an actual pilot and authenticated previous-application readback, and OpenAI after its separate external-use/maintenance gate. On 2026-10-09, the [official Claude Startups page](https://claude.com/programs/startups) reports Team/$1,000 offers over capacity and re-review of applications; previous promotion details are not a current entitlement. Verify fields/terms again and obtain instruction for the exact reviewed submission. No message or application is sent by repository publication.

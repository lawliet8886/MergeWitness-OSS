# Contributing to MergeWitness

This independent checkout is being prepared locally. No new public repository, npm release, outreach campaign or provider integration has been published. Once a maintained remote exists, these instructions can support issues and pull requests there.

Use Node >=22 and Git. Run `node scripts/test.mjs`; new behavior must have a failing regression first. For corpus changes, also run `node scripts/run-corpus.mjs --case <id>` and then the complete corpus. Keep failures and unobservable cases in the results.

Useful contributions include reproducible operation sequences, calibrated feature-retention checks, installation failures on supported runtimes and clear limitations. A passing probe is not a claim that a repository is generally safe.

For a public incident, include upstream issue/fix URLs, exact commits or published versions, original licenses/notices, source hashes, observed sequence and expected outcome. State whether it is an unchanged upstream replay, minimized reconstruction or synthetic case. Never present an adapted Git history as the upstream merge. Remove secrets and personal data; contributed code must be reviewed before execution.

Keep checks and their declared helper/data files immutable during repair. State what each requirement preserves; prevent a false repair that removes the new feature. Prefer observable behavior over internal counters alone.

The core/API and CLI/MCP are small Node modules, without paid-provider or runtime npm dependencies. Keep changes focused. Custom runners, arbitrary external repository execution, automatic probe generation and broader integrations require a separate validated design.

Keep Signal Foundry attribution and the MIT notice. Retain third-party licenses alongside reused files. The historical IBM competition checkout and its published evidence are protected baselines; edit only the independent checkout.

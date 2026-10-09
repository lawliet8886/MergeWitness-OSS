# Windows common-directory identity correction — 0.3.1

The first hosted publication run, [37909284542](https://github.com/lawliet8886/MergeWitness-OSS/actions/runs/37909284542), passed on Linux Node 22/24 but failed 20 of 98 checks on each Windows job. The shared error was `Candidate worktree must belong to this analysis clone.` The failed run remains visible.

Read-only investigation reproduced the root cause on Windows: legacy `fs.realpathSync` preserves the input drive-letter spelling, so two spellings of the same `.git` directory compared unequal. `fs.realpathSync.native` resolves them to the same native canonical path. Filesystem identity and a zero relative path confirmed that both names referred to one directory.

The correction canonicalizes only the two Git common-directory paths before the existing exact equality check. Physical containment, merge ancestry, frozen checks and all other repair gates remain. A valid worktree with aliased drive spelling must work; an independent clone placed inside the analysis directory must still be rejected for foreign common-directory ownership.

This is a new patch candidate. The public `v0.3.0` tag, its 40515-byte tarball and SHA-256 `848a0f35f05604a561215da34e03ba359d14f256f69ed4196fcf1b62dd3dd688` remain unchanged. Version 0.3.1 adds the correction and updates CLI/MCP/package/installed-helper version metadata. Use its own release asset and checksum.

This diagnosis/preparation record does not assert completion of the new hosted matrix or installed-archive acceptance. Final source/release/download checks are recorded at handoff. Provider integration and external adoption remain unproven.

The focused Windows pair passed locally: two checks, zero failures. The new alias case was also attempted before the change, but this host's Git/path spelling did not reproduce the hosted failure; no local RED is claimed. The original hosted Windows failures are the recorded failing baseline. Five focused CLI/MCP/installed-helper version checks also passed. The full hosted matrix remains the acceptance gate for the actual runner environment.

The alias regression now derives the actual drive instead of assuming C, explicitly changes only the worktree pointer's drive spelling and asserts lowercase case-sensitively. Git canonicalized the initial fixture pointer, so that precondition needed to be made explicit. The hidden Windows pointer is updated in place with `r+`, preserving its attributes and byte length. The strengthened pair passed 2/2 locally; superseded hosted run `37912455881` was cancelled before the final environment-independent regression was pushed.

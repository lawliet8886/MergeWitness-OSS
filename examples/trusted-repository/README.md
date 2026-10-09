# Trusted repository tutorial companion

Follow [the English guide](../../docs/USE_YOUR_REPOSITORY.md) or [the Brazilian Portuguese guide](../../docs/USE_YOUR_REPOSITORY_PT_BR.md) from the source checkout root. This directory is educational glue around the unchanged 0.3.1 CLI, not an added public API/CLI or installed runtime. It is not in the existing release archive.

`tutorial.mjs init <new-area> [interaction|inconclusive|preexisting]` generates the existing tenant/cache synthetic Git history only inside a new isolated tutorial area and copies the declared checks. An existing area is rejected. Never run fixture generation inside your own repository or a shared generated tree.

After the real CLI writes `prepared.json`, `requests <area>` creates evaluate/verify/dispose requests using the returned identity and paths. `repair <area> good|bad` applies and commits only the supplied fixture candidate file. `save <area> evaluation|good|bad` copies canonical report bytes before disposal and refuses an existing saved filename.

The valid repair is reused from `src/bob-repairs/tenant-cache/catalog.fixed.js`. `catalog.no-cache.js` is an intentional false repair. The check helper `checks/observations.mjs` is declared separately for the sequence and both requirements; it only imports Node builtins and the production module from the selected snapshot. Stable repetitions establish observed consistency, not complete feature coverage. `inconclusive.mjs` and `preexisting.mjs` are deliberate controls.

Run only reviewed trusted code. This companion and the underlying worktrees are not hardened isolation. For your own project, author and review checks and use the existing API/CLI directly; do not adapt the fixture-generation or sample-repair commands into a general project mutation tool.

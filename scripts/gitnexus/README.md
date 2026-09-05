# GitNexus tooling

This private npm package pins the code-analysis CLI independently of the
Python site build. Nothing in this directory is published to the website.

Run from the repository root:

```bash
make gn-setup
make gn-analyze
make gn-status
```

GitNexus 1.6.11 is pinned in `package.json`. The lockfile includes patched
versions of `adm-zip`, `fast-uri`, `qs`, and `sharp`, enforced by overrides:
the upstream dependency ranges otherwise allow versions with known
advisories. The complete lockfile audit reported zero known vulnerabilities
on September 5, 2026. This is a dependency-advisory check, not a security
guarantee or a source-code audit.

Use the local CLI for queries, impact analysis, and change detection:

```bash
node scripts/gitnexus/node_modules/gitnexus/dist/cli/index.js impact buildSvg --file docs/assets/js/doodles.js --direction upstream
node scripts/gitnexus/node_modules/gitnexus/dist/cli/index.js detect-changes
```

To update, change the exact GitNexus version, run
`npm install --prefix scripts/gitnexus --foreground-scripts`, then
`npm audit --prefix scripts/gitnexus` and `make gn-analyze`. Review the
lockfile diff. Remove an override only when upstream resolves a patched
version without it. Do not use `npm audit fix --force`.

Structural indexing is verified; optional embedding/model inference is
not part of this site's workflow and has not been validated with the
transitive overrides. `--index-only` keeps indexing from replacing the
repository's agent instructions and skills.

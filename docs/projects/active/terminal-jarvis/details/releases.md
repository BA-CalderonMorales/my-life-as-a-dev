---
comments: true
---

# Release Notes

This page tracks recent Terminal Jarvis releases with a focus on user-impacting changes.

## Current Package Line: v0.0.81

- **Repository Version**: v0.0.81
- **Release Train**: v0.0.82 hardening is in progress

### v0.0.82 Focus

- Address actionable PR review feedback before release work continues
- Keep project documentation in this docs repository instead of adding a `docs/` folder to `terminal-jarvis`
- Harden security-sensitive code paths and review any credential-handling findings
- Keep release changes ordered: CHANGELOG first, Homebrew formula before GitHub release, then tag-driven CD

---

## Latest Published Notes: v0.0.80

- **Published**: March 31, 2026
- **GitHub Release**: [v0.0.80](https://github.com/BA-CalderonMorales/terminal-jarvis/releases/tag/v0.0.80)
- **Crates.io Version**: [0.0.80](https://crates.io/crates/terminal-jarvis)

### Highlights

- Added TypeScript type definitions (`index.d.ts`) for NPM wrapper package
- Introduced coverage reporting in CI workflow via cargo-tarpaulin
- Added documentation and coverage badges to README
- Fixed rustdoc warnings for cleaner API documentation

### Supported Tool Wrappers Updated in v0.0.80

- `amp`
- `claude`
- `codex`
- `crush`
- `gemini`
- `goose`
- `llxprt`
- `opencode`
- `qwen`

### Upgrade Recommendation

If you are on versions older than `v0.0.80`, upgrade to pick up the latest quality improvements:

```bash
npm update -g terminal-jarvis
```

---

## Previous Releases

### v0.0.79

- **Published**: March 30, 2026
- **GitHub Release**: [v0.0.79](https://github.com/BA-CalderonMorales/terminal-jarvis/releases/tag/v0.0.79)
- **Crates.io Version**: [0.0.79](https://crates.io/crates/terminal-jarvis)

#### Highlights

- Introduced docs drift prevention system to keep documentation synchronized with releases
- Added `verify-docs.sh` script for automated version consistency validation
- Created agent-driven release skill with cross-repo synchronization workflow
- Fixed Homebrew formula version drift

### v0.0.78

- **Published**: March 1, 2026
- **GitHub Release**: [v0.0.78](https://github.com/BA-CalderonMorales/terminal-jarvis/releases/tag/v0.0.78)
- **Crates.io Version**: [0.0.78](https://crates.io/crates/terminal-jarvis)

#### Highlights

- Fixed fresh-install permission problems in Codespaces/NVM npm environments ([#62](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/62))
- Improved shell-state handling by syncing current directory after `cd` ([#61](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/61))
- Normalized wrapper command parsing by stripping `terminal-jarvis` prefix when present ([#59](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/59))
- Improved Qwen wrapper UX by keeping command menu visibility during command flow

#### Supported Tool Wrappers

- `amp`
- `claude`
- `codex`
- `crush`
- `gemini`
- `goose`
- `llxprt`
- `opencode`
- `qwen`

#### Upgrade Recommendation

```bash
npm update -g terminal-jarvis
```

## How to Verify Current Version

```bash
terminal-jarvis --version
```

## Release References

- [All GitHub Releases](https://github.com/BA-CalderonMorales/terminal-jarvis/releases)
- [NPM Package](https://www.npmjs.com/package/terminal-jarvis)
- [Crates.io Package](https://crates.io/crates/terminal-jarvis)

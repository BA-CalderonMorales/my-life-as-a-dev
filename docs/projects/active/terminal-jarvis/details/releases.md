---
comments: true
---

# Release Notes

This page tracks recent Terminal Jarvis releases with a focus on user-impacting changes.

## Latest Release: v0.0.78

- **Published**: February 23, 2026
- **GitHub Release**: [v0.0.78](https://github.com/BA-CalderonMorales/terminal-jarvis/releases/tag/v0.0.78)
- **Crates.io Version**: [0.0.78](https://crates.io/crates/terminal-jarvis)

### Highlights

- Fixed fresh-install permission problems in Codespaces/NVM npm environments ([#62](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/62))
- Improved shell-state handling by syncing current directory after `cd` ([#61](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/61))
- Normalized wrapper command parsing by stripping `terminal-jarvis` prefix when present ([#59](https://github.com/BA-CalderonMorales/terminal-jarvis/pull/59))
- Improved Qwen wrapper UX by keeping command menu visibility during command flow

### Supported Tool Wrappers Updated in v0.0.78

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

If you are on versions older than `v0.0.78`, upgrade to pick up installation reliability fixes and wrapper behavior improvements:

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

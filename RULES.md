# Repository Workflow Rules

These rules keep development consistent across the project. The document is intentionally brief so it can be referenced often.

## General Principles

- Follow Test-Driven Development. Write tests before production code and keep changes small.
- Use strict TypeScript and prefer immutable patterns.
- When looking for solutions, consult **context7** and the guidance in **MEMORY.md**. Do not copy text from MEMORY.md into this file.

## Local Workflow

Use these npm scripts during feature work:

- `npm ci` – install dependencies
- `npm start` – run the Metro bundler
- `npm run ios` – run the iOS app
- `npm run android` – run the Android app
- `npm test` – run the full test suite
- `npm run typecheck` – run TypeScript checks
- `npm run build` – build release artifacts with Fastlane

Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` before pushing changes. CI uses the same commands.

## Commit Standards

Commits must use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

```
feat: add dark mode toggle
fix: handle null todo values
chore: update dependencies
```

## Pull Requests

Prefix PR titles to show intent:

- **Feature:** … → merge into `develop`
- **Bugfix:** … → merge into `develop`
- **Cleanup:** … → merge into `develop`
- **Pipeline:** … → merge into `develop`
- **Hotfix:** … → merge directly to `main`

Include a **Codex CI** section summarising `install`, `build`, `typecheck`, and `test` results.

After merging into `develop`, automatically open a PR that merges `develop` into `main` so changes can be tested against the main branch.

## Continuous Integration

All dependencies must be installed with `npm ci` in CI jobs. The Super-Linter runs on every pull request via `.github/workflows/super-linter.yml`.

Ensure we find ways to mitigate any current Super-Linter failures as we continue to make incremental changes. Failures should not cause us to break existing functionality or alter the current UI appearance. Take a balanced approach when addressing linter issues.


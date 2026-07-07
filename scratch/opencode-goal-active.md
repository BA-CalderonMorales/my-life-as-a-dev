# OpenCode Goal

Status: complete
Objective: Convert the "My Life as a Dev" hub from an AI-chatbot-fronted, multi-versioned, multi-tab reference site into a slim, presentation-focused site via a durable FEATURE-TOGGLE system. Defaults: Ask AI OFF, version selector OFF, all tabs OFF except the landing page (Home) tab.
Started: 2026-07-07
Updated: 2026-07-07
Repo: /mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev
Branch: main
Latest Commit: 2b83d012 (docs: add GitNexus integration and branch strategy (#149)) before this work

## Constraints
- Edit ONLY modular source config (config/zensical/*.toml); never hand-edit zensical.toml (regenerate via merge script).
- ALWAYS use uv; NEVER pip. No emojis. Conventional Commits.
- Feature toggles must be REAL config-driven switches read by build/overrides, not commented-out code.
- DO NOT delete chat widget implementation, version/deploy logic, or tab content pages; gate and preserve them.
- DEFAULT after change: chat OFF, version OFF, only Home tab visible.
- Run `make build` and fix all warnings (especially "not included in nav").
- COMMIT AND PUSH DIRECTLY TO main (origin/main); no PR, no develop.

## Plan
- [x] Discover how chat widget, version selector, and tabs are wired into the rendered site.
- [x] Add config/zensical/08-features.toml feature flag surface (chat_assistant, version_selector, tabs map).
- [x] Gate chat widget in docs/overrides/main.html (scripts + CSS) via flag; keep source on disk.
- [x] Gate version selector in main.html (partial + script + CSS) and remove mkdocs.yml native mike provider.
- [x] Add docs/overrides/partials/tabs.html filtering tabs by feature flags.
- [x] Remove chat-widget.css / header-version.css from 02-assets.toml extra_css (loaded via gated <link>).
- [x] Improve docs/index.md landing page (hero lead + Explore card grid).
- [x] Update e2e tests (chat widget + version selector) to be flag-aware / OFF-state.
- [x] Regenerate zensical.toml, run make build, fix warnings.
- [x] Validate: grep built site for absence of chat/version markup; run OFF-state e2e.
- [x] Update ledger, commit to main, push origin main.

## Progress
- Read AGENTS.md, README.md, all config/zensical/*.toml, merge script, overrides, e2e tests.
- Created config/zensical/08-features.toml with [project.extra.features] flags + [project.extra.features.tabs] map.
- Regenerated zensical.toml (merge script); flags present at lines 524-534.
- Edited docs/overrides/main.html: wrapped 10 chat-widget <script> tags and chat-trigger CSS in `{% if config.extra.features.chat_assistant %}`; wrapped version-selector include, version-selector/main.js script, and .md-version CSS in `{% if config.extra.features.version_selector %}`; added gated <link> for chat-widget.css and header-version.css.
- Edited config/zensical/02-assets.toml: commented out chat-widget.css and header-version.css in extra_css (now loaded via gated <link>).
- Edited mkdocs.yml: set extra.version.provider = "none" (native mike dropdown disabled).
- Added docs/overrides/partials/tabs.html: renders only top-level nav items whose tab flag is true (Tera syntax; Home only by default).
- Edited docs/index.md: added hero lead line and an "Explore the hub" card grid linking to Projects/Learning/Docs-as-Code/Experiments/About Me (aids navigation now that other tabs are hidden).
- Updated e2e/shared/utils.py: added load_features(), chat_assistant_enabled(), version_selector_enabled().
- Updated e2e/quality/test_chat_widget.py: ON-state classes skip when flag off; added TestChatWidgetDisabled (asserts trigger/modal/scripts absent).
- Updated e2e/quality/test_version_selector_browser.py: ON-state tests skip when flag off; added test_version_selector_absent_when_disabled.
- Updated e2e/quality/test_version_selector_regression.py: class skips when flag off.

## Current State
- `make build` passes with ZERO warnings (no "not included in nav").
- Built site/index.html renders exactly ONE tab (Home); other sections remain reachable via hamburger navigation.
- No chat-widget <script>/<link>, no #md-version-selector, no version-selector <script> in any rendered page.
- 4 OFF-state e2e tests PASS; 24 ON-state/regression tests SKIP (flag off).

## Blockers
- None.

## Verification
- `uv run python scripts/python/merge_zensical_config.py` -> success; zensical.toml reflects flags.
- `make build` -> "All tools built successfully", "Zensical build complete!", no warnings/errors.
- Grep built site:
  - `<script src=...chat-widget` across pages (excluding /overrides/ source): 0 real matches (only doc image prose).
  - `<script src=...version-selector`: 0.
  - `#md-version-selector` rendered: 0 (only in /overrides/ source partial).
  - `<link ...chat-widget.css|header-version.css`: 0.
  - Rendered tabs in landing: only `Home` (1 md-tabs__item).
- e2e (uv + playwright, served from built site/): 4 passed, 24 skipped.

## How to re-enable each feature (single flag + regenerate + rebuild)
1. Ask AI (chat assistant):
   - Set `chat_assistant = true` in config/zensical/08-features.toml.
   - `uv run python scripts/python/merge_zensical_config.py` then `make build`.
   - (chat-widget.css is auto-linked via the gated <link> in main.html; no extra edit needed.)
2. Version selector:
   - Set `version_selector = true` in config/zensical/08-features.toml.
   - Optionally set `provider = "mike"` in mkdocs.yml's `extra.version` to use the native dropdown instead of the custom one.
   - Regenerate + rebuild.
3. Any top-level tab (e.g. Learning):
   - Set that key `true` under `[project.extra.features.tabs]` in 08-features.toml (key = title lowercased with spaces/dashes/dots -> underscores; e.g. "Docs-as-Code" -> docs_as_code).
   - Regenerate + rebuild. The section then appears as a tab while staying reachable via hamburger regardless.

## Next Agent Prompt
/goal

Work in /mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev.

Objective:
Slim the "My Life as a Dev" Zensical site to a presentation-focused hub via feature toggles (COMPLETE on main). This pass is done; future passes should build on the toggle system in config/zensical/08-features.toml.

Context:
Feature-toggle system is in place on main. chat_assistant, version_selector default false; only Home tab visible. To add presentation polish or new toggled capabilities, flip the relevant flag in 08-features.toml and regenerate via `uv run python scripts/python/merge_zensical_config.py`.

Hard rules:
- Edit ONLY config/zensical/*.toml (regenerate zensical.toml); use uv; no emojis; Conventional Commits; do not delete chat widget / version / tab source.
- Commit directly to main only when explicitly asked; otherwise follow develop -> main PR flow.

Required reads:
- config/zensical/08-features.toml (flag surface)
- docs/overrides/main.html and docs/overrides/partials/tabs.html (gate implementations)
- AGENTS.md, README.md

Implementation scope:
- Future presentation-polish passes on the landing page (docs/index.md) and shared CSS (docs/assets/css/base.css), gated behind the existing flag system.

Validation:
- `make build` clean; `make serve` shows only Home tab, no Ask AI, no version UI.

Handoff:
- scratch/opencode-goal-active.md holds the final state and re-enable instructions.

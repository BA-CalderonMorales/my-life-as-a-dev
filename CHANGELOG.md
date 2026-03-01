# Changelog

All notable changes to this project are documented in this file.

## [0.4.8] - 2026-03-01

### Fixed
- Fixed late-loading stylesheet behavior by moving Ask AI and pull-to-refresh CSS into the global head-loaded `extra_css` pipeline.
- Fixed Ask AI mobile/tablet settings menu clipping by anchoring the options dropdown to the left-side ellipsis control with viewport-safe sizing.

## [0.4.7] - 2026-03-01

### Fixed
- Enforced dark-mode readability for the landing page "Featured Projects" and "Working with Me" sections using section-scoped styling.
- Reordered Ask AI modal input actions to reduce accidental taps: more-actions on the left, input in the middle, send on the right.

### Changed
- Updated docs latest-version pointer from `0.4.5` to `0.4.7` in `versions.json`.

## [0.4.5] - 2026-02-23

### Fixed
- Cleaned production console output by tightening AI chat dev-mode gating to local-only by default, with optional debug override.
- Suppressed noisy non-actionable console warning for giscus "Discussion not found" in the global console patch.
- Resolved mobile scroll-up overlap where the Material back-to-top bubble visually collided with the bottom Ask AI trigger.
- Improved Learning section chat reliability by sending canonical page URLs (without hash/query fragments) to the backend.
- Improved frontend chat context extraction by using focused main-content text instead of raw `document.body.innerText`.

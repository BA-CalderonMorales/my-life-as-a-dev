# Changelog

All notable changes to this project are documented in this file.

## [0.4.5] - 2026-02-23

### Fixed
- Cleaned production console output by tightening AI chat dev-mode gating to local-only by default, with optional debug override.
- Suppressed noisy non-actionable console warning for giscus "Discussion not found" in the global console patch.
- Resolved mobile scroll-up overlap where the Material back-to-top bubble visually collided with the bottom Ask AI trigger.
- Improved Learning section chat reliability by sending canonical page URLs (without hash/query fragments) to the backend.
- Improved frontend chat context extraction by using focused main-content text instead of raw `document.body.innerText`.

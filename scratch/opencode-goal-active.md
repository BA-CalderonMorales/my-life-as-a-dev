# OpenCode Goal

Status: complete
Objective: Slim the site to a single clean presentation landing page: gate OFF tabs
  from every nav surface (tabs, hamburger drawer, search), new minimal neutral
  palette, token-driven modular creative-canvas hero, plain landing copy with
  social links. Keep files on disk; commit/push main; sync develop; deploy.
Repo: /mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev
Branch: main
Latest Commit: (this work)

## Constraints
- Edit ONLY config/zensical/*.toml; regenerate via merge script. Never hand-edit zensical.toml.
- ALWAYS use uv; never pip. No emojis. Conventional Commits.
- Feature toggles are real config-driven switches; toggling off fully removes feature.
- DO NOT delete tab content/chat-doc source files; gate/hide/exclude them (kept on disk).
- DO NOT reuse existing repo images (me-today*, lumen, canvas, diagrams). Hero is runtime-generated.
- DO NOT emulate vendor site aesthetics. Original clean neutral look.
- Creative canvas is modular (separate CSS, JS entry, per-sketch files); single flag toggles.
- Committed/pushed DIRECTLY to main; develop synced; gh-pages deployed from main (via CI).

## Plan
- [x] Baseline build to confirm current state
- [x] Step 1: gate OFF tabs everywhere (drawer override + archive off-sections)
- [x] Step 2: Ask AI/chat docs excluded from nav/drawer/search; verify no chat scripts
- [x] Step 3: new minimal neutral palette (tokens.css + 04-theme.toml)
- [x] Step 4: modular creative-canvas hero (token-driven, sketches registry)
- [x] Step 5: rewrite landing page (plain copy + social links)
- [x] Step 6: update/add e2e tests (mobile drawer, creative-canvas-off)
- [x] Validate: config merge, make build (no warnings), serve checks
- [x] Commit main, push, sync develop, deploy gh-pages

## Progress
- Off-section content archived to docs-archive/{learning,docs-as-code,projects,canvas,resume}
  (source preserved on disk). nav trimmed to Home only. Drawer (nav.html) filters by flag.
- Dead JS assets archived: docs-archive/assets/js/{chat-widget,version-selector,canvas}.
- 04-theme.toml: primary/accent neutral (was indigo/amber). Logo removed (was me-today.png).
- New docs/assets/css/tokens.css: clean neutral palette + --creative-canvas-* tokens
  (loaded last, overrides Lumen layering). 02-assets: removed canvas.css + old
  canvas-scene script; added tokens.css (gated creative-canvas.css via main.html).
- Creative canvas subsystem: docs/assets/js/creative-canvas/{env.js, main.js,
  sketches/{aurora.js (WebGL), particles.js (Canvas2D)}} + docs/assets/css/creative-canvas.css
  + docs/overrides/partials/creative-canvas.html. Gated by creative_canvas flag in
  main.html (markup + CSS link + scripts). Registry pattern: add a sketch file +
  reference its id in data-creative-canvas, no other changes.
- Landing (docs/index.md) rewritten: plain copy, centered hero, prominent GitHub /
  LinkedIn / email buttons, short "What I work on". No reused images, no links to
  hidden sections. 404.md fixed (removed projects link).
- e2e: added test_mobile_drawer_sections.py (no off-section links at mobile width),
  test_creative_canvas.py (ON/OFF gated). Archived page tests (learning/docs-as-code/
  projects/resume) now skip when section archived. PAGE_SOURCES trimmed. Mobile blur
  test page updated to index.html.

## Current State
- `make build` => "No issues found" (zero warnings).
- Off-section pages NOT built (site/ has no learning/docs-as-code/projects/canvas/resume).
- search.json contains 0 off-section locations.
- index.html: no chat trigger, no version-selector, no me-today image, no logo img,
  creative-canvas markup + scripts present (when flag on), 0 when flag off.
- e2e (built site): test_creative_canvas (3 passed/2 skipped), test_mobile_drawer_sections
  (3 passed), test_chat_widget disabled (passed), test_structure (passed).

## Blockers
- zensical's Rust build core does NOT honor mkdocs `exclude_docs` (bypasses config
  validation, so the value is never converted to a GitIgnoreSpec). Therefore off
  sections are gated via archiving + nav trim instead of mkdocs exclude. Re-enable
  steps documented below and in 08-features.toml.

## Verification
- uv run python scripts/python/merge_zensical_config.py  -> succeeds
- make build (zensical build) -> No issues found
- e2e playwright: creative-canvas ON (boots <canvas>), mobile drawer no off links,
  chat OFF absent, structure pass.

## How to flip each flag back on
- chat_assistant / version_selector: set true in 08-features.toml, regenerate, rebuild.
- A whole section (e.g. Learning):
    1. git mv docs-archive/<section> docs/<section>
    2. Restore its nav entry from docs-archive/03-navigation-full.toml into 03-navigation.toml
    3. Set its tab flag true in 08-features.toml (e.g. learning = true)
    4. Regenerate + rebuild
- creative_canvas: set true/false in 08-features.toml. When false, main.html emits
  NO markup, CSS link, or scripts (verified: 0 refs in built index.html).

## How to add a creative-canvas sketch
1. Create docs/assets/js/creative-canvas/sketches/<name>.js that registers
   window.CreativeCanvasSketches.<name> = { id, mount(canvas, env) } where mount
   returns { destroy(), onVisibility(visible) } and reads colors via env.tokens().
2. Add it to the gated script list in docs/overrides/main.html (after env.js).
3. Set data-creative-canvas="<name>" on the container in
   docs/overrides/partials/creative-canvas.html (or per-page markup).
No changes to main.js or the landing page are required.

## Next Agent Prompt
Work in /mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev (branch main).
Objective: keep the site a single clean landing page; optionally add creative-canvas
sketches or re-enable a section using the steps in this ledger.
Hard rules: edit only config/zensical/*.toml; regenerate; uv only; no emojis;
keep archived source on disk (docs-archive/); creative-canvas is token-driven and
modular. Validate with `make build` (zero warnings) and the e2e suite. Push main,
sync develop, let CI deploy gh-pages.

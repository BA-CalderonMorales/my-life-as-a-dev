# Skill: Browser Automation

Use repo-owned Playwright tests through `uv` for browser-backed verification. Do not use Playwright MCP. Do not use `agent-browser` unless the user explicitly asks for it.

## When to Use

- Validating responsive layout across mobile, tablet, desktop, and wide viewports
- Capturing screenshots for visual inspection or regression baselines
- Checking browser console behavior
- Testing header, drawer, version selector, search, chat widget, and shared UI chrome
- Running accessibility checks with axe

## Core Workflow

### 1. Build the site first

```bash
make build
```

The Playwright fixtures serve the built `site/` directory with a local Python HTTP server, so browser tests do not require `make serve`.

### 2. Install browser binaries when needed

```bash
make browser-install
```

If Chromium starts but reports missing system libraries, run:

```bash
make browser-install-deps
```

This may require sudo on local Linux/WSL hosts. If sudo is unavailable, report the missing library and continue with non-browser verification.

### 3. Run the right check

```bash
make viewport-check
make screenshots
make accessibility-check
make e2e
```

Use the smallest command that covers the change:

- `make viewport-check` for global CSS, layout, header, sidebar, drawer, or responsive changes.
- `make screenshots` for visual design work that needs image review across viewports and color schemes.
- `make accessibility-check` for contrast, landmark, heading, interactive state, or navigation changes.
- `make e2e` before broad UI releases or when multiple shared surfaces changed.

## Direct Commands

```bash
uv run pytest e2e/quality/test_layout_integrity.py -v
uv run pytest e2e/visual_regression.py -v
uv run pytest e2e/test_accessibility.py -v
uv run pytest e2e/pages/test_home.py -v
```

## Viewport Coverage

The primary responsive checks cover:

- Mobile: `375x667`
- Tablet: `768x1024`
- Desktop: `1280x800`
- Wide: `1920x1080`

Screenshot capture covers:

- Mobile: `390x844`
- Tablet: `768x1024`
- Desktop: `1440x900`
- Light and dark Material palettes

## Troubleshooting

### Playwright is missing

```bash
uv pip install -r requirements.txt -e .
```

### Browser executable is missing

```bash
make browser-install
```

### Linux/WSL system libraries are missing

```bash
make browser-install-deps
```

If this fails because sudo is unavailable, include the exact missing library in the final report. This is an environment blocker, not a test failure.

### Dev server is already running

The Playwright tests do not need the Zensical dev server. They serve `site/` themselves. Only use `make serve` for manual preview.

## Checklist

- [ ] Run `make build` before browser checks
- [ ] Use `uv run pytest ...` or the Make targets, never Playwright MCP
- [ ] Prefer `make viewport-check` for responsive layout changes
- [ ] Use `make screenshots` for high-fidelity visual review
- [ ] Report browser dependency failures with the exact missing package/library

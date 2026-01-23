# Skill: Agent Browser

Use agent-browser CLI for headless browser automation and visual testing.

## When to Use

- Testing visual rendering of pages (WebGL, canvas, CSS)
- Debugging UI issues that require browser interaction
- Validating responsive design across viewport sizes
- Checking for JavaScript errors in the browser console
- Taking screenshots for visual regression
- Interacting with authenticated pages (localhost)

## Setup

Agent-browser is installed in `/tmp/agent-browser` within this Codespace:

```bash
# Verify installation
cd /tmp/agent-browser && ./bin/agent-browser --help
```

If not installed:

```bash
cd /tmp && git clone --depth 1 https://github.com/vercel-labs/agent-browser.git
cd agent-browser && npm install && npm run build
npx playwright install chromium
```

## Core Workflow

### 1. Ensure Dev Server is Running

```bash
# Start in background (check if already running first)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/my-life-as-a-dev/ || \
  (cd /workspaces/my-life-as-a-dev && nohup ./doc-cli serve > /tmp/server.log 2>&1 &)
```

### 2. Open Page via Localhost

**IMPORTANT**: Always use `localhost` URLs, not the GitHub Codespaces forwarded URL (requires auth).

```bash
cd /tmp/agent-browser && ./bin/agent-browser open "http://localhost:8001/my-life-as-a-dev/canvas/"
```

### 3. Wait for Page Load

```bash
./bin/agent-browser wait 3000  # Wait 3 seconds
./bin/agent-browser wait --load networkidle  # Wait for network idle
```

### 4. Inspect Page

```bash
# Get accessibility snapshot (best for understanding page structure)
./bin/agent-browser snapshot

# Interactive elements only
./bin/agent-browser snapshot -i

# Evaluate JavaScript
./bin/agent-browser eval "document.title"
./bin/agent-browser eval "document.querySelector('#canvas-scene') ? 'exists' : 'missing'"
```

### 5. Check for Errors

```bash
./bin/agent-browser console  # View console messages
./bin/agent-browser errors   # View JavaScript errors only
```

### 6. Close Browser

```bash
./bin/agent-browser close
```

## Common Tasks

### Test Responsive Design

```bash
cd /tmp/agent-browser

# Desktop (default 1280x720)
./bin/agent-browser open "http://localhost:8001/my-life-as-a-dev/canvas/"
./bin/agent-browser eval "({ w: window.innerWidth, h: window.innerHeight })"

# Mobile viewport
./bin/agent-browser set viewport 375 812
./bin/agent-browser wait 1000
./bin/agent-browser eval "document.querySelector('#canvas-scene').offsetHeight"

# Tablet viewport
./bin/agent-browser set viewport 768 1024
./bin/agent-browser wait 1000
./bin/agent-browser eval "document.querySelector('#canvas-scene').offsetHeight"
```

### Check WebGL/Canvas Rendering

```bash
# Check if canvas exists and has dimensions
./bin/agent-browser eval "const c = document.querySelector('#canvas-scene'); \
  c ? { exists: true, width: c.offsetWidth, height: c.offsetHeight } : { exists: false }"

# Check for WebGL context
./bin/agent-browser eval "const canvas = document.querySelector('canvas'); \
  canvas && canvas.getContext('webgl2') ? 'WebGL2 available' : 'No WebGL2'"
```

### Check Theme/Color Scheme

```bash
./bin/agent-browser eval "document.body.getAttribute('data-md-color-scheme')"
```

### Get Element Information

```bash
# Using refs from snapshot
./bin/agent-browser snapshot -i
# Output shows refs like [ref=e1], [ref=e2]

# Click or interact with refs
./bin/agent-browser click @e2
./bin/agent-browser get text @e1
```

### Debug JavaScript Errors

```bash
# Get all console output
./bin/agent-browser console

# Get only errors
./bin/agent-browser errors

# Clear and recheck
./bin/agent-browser console --clear
./bin/agent-browser reload
./bin/agent-browser wait 2000
./bin/agent-browser console
```

## Session Management

```bash
# Use named sessions for parallel testing
./bin/agent-browser --session mobile open "http://localhost:8001/..."
./bin/agent-browser --session desktop open "http://localhost:8001/..."

# List sessions
./bin/agent-browser session list
```

## Troubleshooting

### "Daemon not found" Error

Run from the agent-browser directory:

```bash
cd /tmp/agent-browser && ./bin/agent-browser open "http://..."
```

### "Execution context destroyed" Error

The page navigated during command. Add wait:

```bash
./bin/agent-browser open "http://..." && ./bin/agent-browser wait --load networkidle
```

### GitHub Codespaces Auth Redirect

**Never use the forwarded URL** (e.g., `https://xxx-8001.app.github.dev/...`). 
Always use `http://localhost:8001/...` for testing within the Codespace.

### Browser Not Installed

```bash
cd /tmp/agent-browser && npx playwright install chromium
```

## Checklist

- [ ] Dev server running on localhost:8001
- [ ] Using localhost URL (not Codespaces forwarded URL)
- [ ] Running commands from `/tmp/agent-browser` directory
- [ ] Waiting for page load before inspecting
- [ ] Closing browser when done (`./bin/agent-browser close`)

## Reference

Full documentation: https://github.com/vercel-labs/agent-browser

Key commands:
- `open <url>` - Navigate to URL
- `snapshot` - Accessibility tree with refs
- `eval <js>` - Execute JavaScript
- `console` - View console messages
- `set viewport <w> <h>` - Set viewport size
- `wait <ms>` - Wait milliseconds
- `close` - Close browser

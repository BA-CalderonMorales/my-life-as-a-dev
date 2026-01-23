# Skill: Fix Console Errors

## When to Use

- Console errors appear in browser dev tools during development or testing
- E2E tests fail with console error detection
- Third-party libraries or browser APIs throw errors
- MutationObserver, WebSocket, or fetch errors appear

## Architecture Overview

Console errors are handled by a **patch system** that intercepts problematic browser APIs before they can throw errors. The system has three components:

1. **console-patch.js** - JavaScript file that patches browser APIs
2. **main.html override** - Template that loads the patch early
3. **E2E tests** - Verify patches are active and errors are suppressed

```
docs/assets/js/console-patch.js    <- Patch implementations
docs/overrides/main.html           <- Loads patch in <head>
e2e/quality/test_console_repro.py  <- Tests patch effectiveness
```

## Common Console Errors and Fixes

### 1. MutationObserver TypeError

**Error:**
```
TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
```

**Cause:** MkDocs Material or third-party code calls `observer.observe(null)` or with an invalid target.

**Fix:** The console-patch.js wraps MutationObserver to validate targets:

```javascript
const NativeMutationObserver = window.MutationObserver;
window.MutationObserver = function (callback) {
    const observer = new NativeMutationObserver(callback);
    const originalObserve = observer.observe;
    observer.observe = function (target, options) {
        if (target && target.nodeType) {
            return originalObserve.call(observer, target, options);
        }
        // Silently ignore invalid targets
    };
    return observer;
};
window.MutationObserver.toString = function () { 
    return 'function MutationObserver() { [native code] } // Patched by NativeMutationObserver'; 
};
```

### 2. Mixed Content / WebSocket SecurityError

**Error:**
```
Mixed Content: The page was loaded over HTTPS but attempted to connect to ws://...
SecurityError: Failed to construct 'WebSocket': An insecure WebSocket connection may not be initiated
```

**Cause:** Dev server uses ws:// for livereload but page is served over HTTPS (Codespaces).

**Fix:** The console-patch.js upgrades ws:// to wss:// automatically:

```javascript
const NativeWebSocket = window.WebSocket;
window.WebSocket = function (url, protocols) {
    let targetUrl = String(url);
    if (window.location.protocol === 'https:' && targetUrl.startsWith('ws://')) {
        targetUrl = targetUrl.replace('ws://', 'wss://');
    }
    try {
        return new NativeWebSocket(targetUrl, protocols);
    } catch (e) {
        // Return mock if connection fails
        return { send: () => {}, close: () => {}, addEventListener: () => {}, readyState: 3 };
    }
};
window.WebSocket.toString = function () { 
    return 'function WebSocket() { [native code] } // Patched by NativeWebSocket'; 
};
```

### 3. GitHub API 404 Errors

**Error:**
```
Failed to load resource: the server responded with a status of 404
```

**Cause:** MkDocs Material checks for new releases via GitHub API, which 404s for private/local repos.

**Fix:** The console-patch.js intercepts fetch requests to GitHub releases API:

```javascript
const originalFetch = window.fetch;
window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input ? input.url : '');
    if (url && url.includes('api.github.com') && url.includes('releases/latest')) {
        return Promise.resolve({
            ok: true, status: 200,
            json: () => Promise.resolve({ tag_name: '0.0.0' }),
            text: () => Promise.resolve('{}')
        });
    }
    return originalFetch(input, init);
};
```

## Adding a New Patch

### Step 1: Identify the Error

Run the dev server and check browser console:
```bash
make serve
# Open browser dev tools, look for errors
```

### Step 2: Add Patch to console-patch.js

Edit [docs/assets/js/console-patch.js](../../docs/assets/js/console-patch.js):

```javascript
// Add inside the IIFE, following existing patterns
const NativeAPIName = window.APIName;
if (NativeAPIName) {
    window.APIName = function (...args) {
        // Your patched implementation
    };
    // Preserve prototype and static properties
    Object.assign(window.APIName, NativeAPIName);
    window.APIName.prototype = NativeAPIName.prototype;
    // Expose for testing
    window.APIName.toString = function () { 
        return 'function APIName() { [native code] } // Patched by NativeAPIName'; 
    };
}
```

### Step 3: Verify Patch Loads in Template

Ensure [docs/overrides/main.html](../../docs/overrides/main.html) includes the script in `extrahead`:

```html
{% block extrahead %}
<!-- Must load BEFORE other scripts -->
<script src="{{ 'assets/js/console-patch.js' | url }}"></script>
{% endblock %}
```

### Step 4: Update Test

Edit [e2e/quality/test_console_repro.py](../../e2e/quality/test_console_repro.py):

```python
# Add to FORBIDDEN_ERRORS if the error should never appear
FORBIDDEN_ERRORS = [
    "TypeError: Failed to execute 'observe' on 'MutationObserver'",
    "Mixed Content",
    "SecurityError",
    "YOUR_NEW_ERROR_STRING",  # Add here
]

# Update patch verification
patches_active = page.evaluate("""() => {
    return {
        // Add check for your new patch
        isNewAPIPached: window.APIName.toString().includes('NativeAPIName'),
    };
}""")
```

### Step 5: Rebuild and Test

```bash
# Rebuild site
make build

# Run tests
uv run pytest e2e/quality/test_console_repro.py -v

# Run all quality tests
uv run pytest e2e/quality/ -v
```

## Debugging Patches

### Check if Patches Load

In browser console:
```javascript
// Should include "Patched by" text
window.MutationObserver.toString()
window.WebSocket.toString()
```

### Check E2E Test with Verbose Output

```bash
uv run pytest e2e/quality/test_console_repro.py -v -s
```

### Manual Browser Test

1. Start dev server: `make serve`
2. Open browser dev tools
3. Check Console tab for errors
4. Verify patches in Console:
   ```javascript
   console.log('MutationObserver patched:', 
     window.MutationObserver.toString().includes('NativeMutationObserver'));
   ```

## Important Notes

1. **Load Order Matters**: console-patch.js MUST load before any other scripts
2. **Preserve Prototypes**: Always copy prototype and static properties when patching
3. **Testing Signature**: Include a recognizable string in `toString()` for test verification
4. **HTTP Server Required**: E2E tests use HTTP server (not file://), configured in conftest.py
5. **Rebuild Required**: After editing console-patch.js, run `make build` to copy to site/

## Files Reference

| File | Purpose |
|------|---------|
| [docs/assets/js/console-patch.js](../../docs/assets/js/console-patch.js) | Patch implementations |
| [docs/overrides/main.html](../../docs/overrides/main.html) | Template loading the patch |
| [e2e/quality/test_console_repro.py](../../e2e/quality/test_console_repro.py) | Patch verification tests |
| [e2e/conftest.py](../../e2e/conftest.py) | HTTP server fixture for tests |

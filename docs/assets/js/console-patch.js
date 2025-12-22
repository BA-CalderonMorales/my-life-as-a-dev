/**
 * Console Patch Module
 * 
 * This module patches browser APIs to suppress specific console errors that are
 * either false positives, environment-specific (Codespaces), or third-party issues.
 * 
 * Patches applied:
 * 1. MutationObserver: Handles null/undefined targets (MkDocs Material issue)
 * 2. WebSocket: Upgrades ws:// to wss:// on HTTPS (Codespaces livereload issue)
 * 3. fetch: Suppresses GitHub API 404s for release info
 * 4. Global error handler: Catches uncaught MutationObserver errors from async code
 * 5. Console.error filter: Filters out suppressed error messages from console
 */

(function () {
    // DEBUG: Verify this script is running
    console.log('[console-patch] Initializing patches...');

    // Error patterns to suppress (from third-party code)
    const SUPPRESSED_ERROR_PATTERNS = [
        "Failed to execute 'observe' on 'MutationObserver'",
        "parameter 1 is not of type 'Node'",
    ];

    function shouldSuppressError(message) {
        if (!message) return false;
        const msgStr = String(message);
        return SUPPRESSED_ERROR_PATTERNS.some(pattern => msgStr.includes(pattern));
    }

    // Intercept console.error to filter out suppressed messages
    const originalConsoleError = console.error;
    console.error = function (...args) {
        // Check if any argument matches suppressed patterns
        for (const arg of args) {
            if (shouldSuppressError(arg) || shouldSuppressError(arg?.message)) {
                return; // Suppress this error
            }
        }
        return originalConsoleError.apply(console, args);
    };

    // 0. Global error handlers to catch errors from dynamically loaded scripts
    // This catches MutationObserver errors thrown in Promise chains
    window.addEventListener('error', function (event) {
        if (shouldSuppressError(event.message) || shouldSuppressError(event.error?.message)) {
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
    }, true);

    window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason;
        if (shouldSuppressError(reason?.message) || shouldSuppressError(String(reason))) {
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
    }, true);

    // 1. Patch MutationObserver to handle null/undefined targets gracefully
    // Fixes: TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
    const NativeMutationObserver = window.MutationObserver;
    if (NativeMutationObserver) {
        // Store original prototype method
        const originalObserve = NativeMutationObserver.prototype.observe;

        // Patch the prototype directly so ALL instances get the patched method
        // Use try-catch as ultimate fallback to suppress any errors
        NativeMutationObserver.prototype.observe = function (target, options) {
            try {
                // Only call original if target is a valid Node
                if (target && target.nodeType) {
                    return originalObserve.call(this, target, options);
                }
                // Silently ignore invalid targets (null, undefined, non-Node objects)
            } catch (e) {
                // Swallow the error - this is a known MkDocs Material issue
                // Error: "Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'"
            }
        };

        // Expose for testing - mark that prototype is patched
        window.MutationObserver.toString = function () {
            return 'function MutationObserver() { [native code] } // Patched by NativeMutationObserver';
        };
    }

    // 2. Patch WebSocket to use WSS on HTTPS pages (fixes livereload in Codespaces)
    // Fixes: Mixed Content and SecurityError when dev server uses ws:// on https://
    const NativeWebSocket = window.WebSocket;
    if (NativeWebSocket) {
        window.WebSocket = function (url, protocols) {
            let targetUrl = String(url);
            if (window.location.protocol === 'https:' && targetUrl.startsWith('ws://')) {
                targetUrl = targetUrl.replace('ws://', 'wss://');
            }
            try {
                return new NativeWebSocket(targetUrl, protocols);
            } catch (e) {
                // Return mock if connection fails or is blocked
                return {
                    send: () => { },
                    close: () => { },
                    addEventListener: () => { },
                    removeEventListener: () => { },
                    readyState: 3 // CLOSED
                };
            }
        };
        Object.assign(window.WebSocket, NativeWebSocket);
        window.WebSocket.prototype = NativeWebSocket.prototype;
        // Expose for testing
        window.WebSocket.toString = function () { return 'function WebSocket() { [native code] } // Patched by NativeWebSocket'; };
    }

    // 3. Patch fetch to suppress GitHub API 404s
    // Fixes: Failed to load resource: the server responded with a status of 404
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input ? input.url : '');
        if (url && url.includes('api.github.com') && url.includes('releases/latest')) {
            // Return fake success to suppress 404
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ tag_name: '0.0.0' }),
                text: () => Promise.resolve('{}')
            });
        }
        return originalFetch(input, init);
    };
})();

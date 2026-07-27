/**
 * Console Patch Module (Supplementary)
 * 
 * This module provides additional patches for browser APIs. The critical
 * MutationObserver patch is now in main.html to run before any scripts load.
 * 
 * Patches applied here:
 * 1. WebSocket: Upgrades ws:// to wss:// on HTTPS (Codespaces livereload issue)
 * 2. fetch: Suppresses GitHub API 404s for release info
 * 3. Unhandled rejection handler: Catches async errors
 */

(function () {
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

    // Handle unhandled promise rejections (async errors)
    window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason;
        if (shouldSuppressError(reason?.message) || shouldSuppressError(String(reason))) {
            event.preventDefault();
            event.stopPropagation();
            return true;
        }
    }, true);

    // Patch WebSocket to use WSS on HTTPS pages (fixes livereload in Codespaces)
    // Fixes: Mixed Content and SecurityError when dev server uses ws:// on https://
    const NativeWebSocket = window.WebSocket;
    if (NativeWebSocket && !window.__WebSocketPatched) {
        window.__WebSocketPatched = true;
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
    }

    // Patch fetch to suppress GitHub API 404s
    // Fixes: Failed to load resource: the server responded with a status of 404
    const originalFetch = window.fetch;
    if (originalFetch && !window.__FetchPatched) {
        window.__FetchPatched = true;
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
    }
})();

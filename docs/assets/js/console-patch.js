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
 */

(function () {
    // 1. Patch MutationObserver to handle null/undefined targets gracefully
    // Fixes: TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
    const NativeMutationObserver = window.MutationObserver;
    if (NativeMutationObserver) {
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
        // Copy static properties and prototype
        Object.assign(window.MutationObserver, NativeMutationObserver);
        window.MutationObserver.prototype = NativeMutationObserver.prototype;
        // Expose for testing
        window.MutationObserver.toString = function () { return 'function MutationObserver() { [native code] } // Patched by NativeMutationObserver'; };
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

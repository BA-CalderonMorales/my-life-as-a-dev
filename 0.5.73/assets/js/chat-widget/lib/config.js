/** Chat Widget Configuration */

const ChatConfig = {
    // NVIDIA Chat Proxy (current service URL + legacy hostname fallback)
    NVIDIA_API_URL: 'https://nvidia-chat-proxy-python-dawfbmka6a-uc.a.run.app/nvidia/chat',
    NVIDIA_API_URLS: [
        'https://nvidia-chat-proxy-python-dawfbmka6a-uc.a.run.app/nvidia/chat',
        'https://nvidia-chat-proxy-python-882389009262.us-central1.run.app/nvidia/chat'
    ],
    NVIDIA_TIMEOUT: 60000,

    // Go/Gemini Cloud Run endpoint (current service URL + legacy hostname fallback)
    API_URL: 'https://agent-chat-proxy-dawfbmka6a-uc.a.run.app',
    API_URLS: [
        'https://agent-chat-proxy-dawfbmka6a-uc.a.run.app',
        'https://agent-chat-proxy-882389009262.us-central1.run.app'
    ],

    MIN_REQUEST_INTERVAL: 1000,
    MAX_MESSAGE_LENGTH: 500,
    MAX_CONTEXT_LENGTH: 2000,

    hasDebugOverride: function () {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get('chatDebug') === '1' || localStorage.getItem('chatDebug') === '1';
        } catch (e) {
            return false;
        }
    },

    isDevMode: function () {
        // Enforce debug override to prevent debug logs leaking in any production or pseudo-production environments
        return this.hasDebugOverride();
    },

    excludedPaths: [],

    shouldInject: function () {
        return !this.excludedPaths.some(function (path) {
            return window.location.pathname.includes(path);
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatConfig;
} else {
    window.ChatConfig = ChatConfig;
}

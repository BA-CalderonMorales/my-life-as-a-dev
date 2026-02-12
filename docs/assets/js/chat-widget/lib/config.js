/** Chat Widget Configuration */

const ChatConfig = {
    // NVIDIA Chat Proxy (primary)
    NVIDIA_API_URL: 'https://nvidia-chat-proxy-python-882389009262.us-central1.run.app/nvidia/chat',
    NVIDIA_TIMEOUT: 10000,

    // Go/Gemini Cloud Run endpoint (fallback)
    API_URL: 'https://agent-chat-proxy-882389009262.us-central1.run.app',

    MIN_REQUEST_INTERVAL: 1000,
    MAX_MESSAGE_LENGTH: 500,
    MAX_CONTEXT_LENGTH: 2000,

    isDevMode: function () {
        var hostname = window.location.hostname;
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.includes('.app.github.dev');
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

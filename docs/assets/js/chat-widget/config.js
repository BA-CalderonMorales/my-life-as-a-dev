/**
 * Chat Widget Configuration
 * 
 * Centralized configuration for the AI chat widget including:
 * - API endpoints
 * - Rate limiting settings
 * - Debug mode detection
 */

const ChatConfig = {
    // Cloud Run endpoint
    API_URL: 'https://agent-chat-proxy-882389009262.us-central1.run.app',

    // Rate limiting
    MIN_REQUEST_INTERVAL: 1000, // 1 second between requests
    MAX_MESSAGE_LENGTH: 500,
    MAX_CONTEXT_LENGTH: 2000,

    // Debug mode detection
    isDevMode: function () {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('.app.github.dev');
    },

    // Pages where widget should not appear
    excludedPaths: ['/canvas/'],

    // Check if widget should be injected on current page
    shouldInject: function () {
        return !this.excludedPaths.some(path =>
            window.location.pathname.includes(path)
        );
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatConfig;
} else {
    window.ChatConfig = ChatConfig;
}

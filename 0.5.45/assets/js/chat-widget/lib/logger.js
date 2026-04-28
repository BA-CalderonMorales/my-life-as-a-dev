/**
 * Chat Widget Logger
 * 
 * Development-only logging utility that suppresses output in production.
 * All debug logging goes through this module to ensure clean production console.
 */

const ChatLogger = {
    /**
     * Log debug information (only in dev mode)
     * @param  {...any} args - Arguments to log
     */
    log: function (...args) {
        if (window.ChatConfig && window.ChatConfig.isDevMode()) {
            console.log('[AI Chat]', ...args);
        }
    },

    /**
     * Log errors (only in dev mode)
     * @param  {...any} args - Arguments to log
     */
    error: function (...args) {
        if (window.ChatConfig && window.ChatConfig.isDevMode()) {
            console.error('[AI Chat]', ...args);
        }
    },

    /**
     * Log warnings (only in dev mode)
     * @param  {...any} args - Arguments to log
     */
    warn: function (...args) {
        if (window.ChatConfig && window.ChatConfig.isDevMode()) {
            console.warn('[AI Chat]', ...args);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatLogger;
} else {
    window.ChatLogger = ChatLogger;
}

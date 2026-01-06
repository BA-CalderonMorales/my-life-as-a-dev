/**
 * Chat Widget API
 * 
 * Handles communication with the backend AI service.
 * Includes rate limiting, request building, and response handling.
 */

const ChatAPI = {
    // Session tracking
    sessionId: null,
    lastRequestTime: 0,

    /**
     * Send a message to the AI backend
     * @param {string} message - User's message
     * @returns {Promise<object>} - Validated response data
     */
    sendMessage: async function (message) {
        const config = window.ChatConfig;
        const logger = window.ChatLogger;
        const parser = window.MessageParser ? new window.MessageParser() : null;

        // Rate limiting check
        const now = Date.now();
        if (now - this.lastRequestTime < config.MIN_REQUEST_INTERVAL) {
            throw new Error('RATE_LIMITED');
        }
        this.lastRequestTime = now;

        logger.log('Sending request to:', config.API_URL);
        logger.log('From origin:', window.location.origin);

        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: message,
                context: document.body.innerText.substring(0, config.MAX_CONTEXT_LENGTH),
                page_url: window.location.href,
                session_id: this.sessionId
            })
        });

        logger.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        logger.log('Response data:', data);

        // Validate response
        const validatedData = this.validateResponse(data, parser);

        // Update session
        this.sessionId = validatedData.session_id;

        return validatedData;
    },

    /**
     * Validate API response structure
     * @param {object} data - Raw response data
     * @param {MessageParser} parser - Optional parser with validation
     * @returns {object} - Validated data
     */
    validateResponse: function (data, parser) {
        if (parser && parser.validateResponse) {
            const validation = parser.validateResponse(data);
            if (!validation.valid) {
                window.ChatLogger.error('Response validation failed:', validation.errors);
                throw new Error('Invalid response format: ' + validation.errors.join(', '));
            }
            return validation.data;
        }

        // Fallback validation
        if (!data || typeof data.answer !== 'string') {
            throw new Error('Invalid response format');
        }

        return {
            answer: data.answer,
            session_id: data.session_id || null,
            sources: data.sources || []
        };
    },

    /**
     * Get user-friendly error message
     * @param {Error} error - The error object
     * @returns {string} - User-friendly message
     */
    getErrorMessage: function (error) {
        if (error.message === 'RATE_LIMITED') {
            return 'Please wait a moment before sending another message.';
        }
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        if (error.message.includes('CORS')) {
            return 'Connection blocked. Please try again from the production site.';
        }
        return 'Sorry, I encountered an error. Please try again.';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatAPI;
} else {
    window.ChatAPI = ChatAPI;
}

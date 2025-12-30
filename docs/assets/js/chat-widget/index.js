/**
 * Chat Widget - Main Entry Point
 * 
 * This module initializes and orchestrates the AI chat widget.
 * It ties together all component modules:
 * - config.js: Configuration and settings
 * - logger.js: Development-only logging
 * - message-parser.js: Markdown and link parsing
 * - ui.js: DOM injection and UI management
 * - api.js: Backend communication
 * 
 * Load Order (in HTML):
 * 1. config.js
 * 2. logger.js
 * 3. message-parser.js
 * 4. ui.js
 * 5. api.js
 * 6. index.js (this file)
 * 
 * Expected API Response Format (Pydantic model):
 * 
 * class ChatResponse(BaseModel):
 *     answer: str
 *     session_id: Optional[str] = None
 *     sources: Optional[List[str]] = None
 */

(function () {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Initialize the chat widget
     */
    function init() {
        const config = window.ChatConfig;
        const logger = window.ChatLogger;
        const ui = window.ChatUI;

        // Check if we should inject on this page
        if (!config || !config.shouldInject()) {
            return;
        }

        // Verify all modules are loaded
        if (!ui) {
            console.warn('[AI Chat] UI module not loaded');
            return;
        }

        // Create MessageParser instance
        const parser = window.MessageParser ? new window.MessageParser() : null;
        if (!parser && logger) {
            logger.warn('MessageParser not loaded, using fallback parsing');
        }

        // Inject UI
        ui.inject();

        // Expose public API
        window.ChatWidget = {
            // Components
            config: config,
            logger: logger,
            parser: parser,
            ui: ui,
            api: window.ChatAPI,

            // Public methods
            open: function () {
                ui.open();
            },

            close: function () {
                ui.close();
            },

            sendMessage: async function () {
                const message = ui.getAndClearInput();

                if (!message) return;

                // Validate message length
                if (message.length > config.MAX_MESSAGE_LENGTH) {
                    ui.addMessage(
                        `Please keep your question under ${config.MAX_MESSAGE_LENGTH} characters.`,
                        'bot',
                        parser
                    );
                    return;
                }

                // Add user message to UI
                ui.addMessage(message, 'user');

                // Show loading indicator
                const loadingDiv = ui.addLoadingMessage();

                try {
                    // Send to API
                    const data = await window.ChatAPI.sendMessage(message);

                    // Remove loading, show response
                    if (loadingDiv) loadingDiv.remove();
                    ui.addMessage(data.answer, 'bot', parser);

                } catch (error) {
                    if (logger) {
                        logger.error('Full error:', error);
                    }

                    // Remove loading, show error
                    if (loadingDiv) loadingDiv.remove();
                    const errorMessage = window.ChatAPI.getErrorMessage(error);
                    ui.addMessage(errorMessage, 'bot', parser);
                }
            }
        };

        if (logger) {
            logger.log('Chat widget initialized');
        }
    }
})();


/**
 * Chat Widget - Main Entry Point
 * 
 * Initializes the MVVM architecture:
 * 1. Loads Configuration and Dependencies
 * 2. Initializes Model, View, and ViewModel
 * 3. Injects the widget
 */

(function () {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Dependencies from Global Scope (loaded via lib/)
        const config = window.ChatConfig;
        const logger = window.ChatLogger;
        const api = window.ChatAPI;
        const prompts = window.SuggestedPrompts;

        // Always instantiate View first to handle cleanup/removal if needed
        const view = new window.ChatView();

        // Check if we should inject
        if (!config || !config.shouldInject()) {
            // Ensure widget is removed if on a page that shouldn't have it
            view.remove();
            return;
        }

        // Initialize MVVM Components
        const model = new window.ChatModel();

        // Parser logic
        const parser = window.MessageParser ? new window.MessageParser() : null;

        // Inject View into DOM (this also handles cleanup of old instances)
        view.inject();

        // Initialize ViewModel (binds everything)
        // Pass necessary dependencies
        const viewModel = new window.ChatViewModel(model, view, api, parser, config, logger);

        // Expose Public API (Backwards Compatibility)
        window.ChatWidget = {
            config: config,
            logger: logger,
            parser: parser,
            ui: view, // Map view to ui
            api: api,
            model: model,
            viewModel: viewModel,
            prompts: prompts,

            open: () => viewModel.openChat(),
            close: () => viewModel.closeChat(),
            sendMessage: () => viewModel.sendMessage(view.elements.input ? view.elements.input.value : '')
        };

        if (logger) {
            logger.log('Chat widget initialized (MVVM)');
        }
    }
})();

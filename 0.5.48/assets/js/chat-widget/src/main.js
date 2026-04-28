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

    let isInitializing = false;
    let ensureTimer = null;
    let domObserver = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (isInitializing) return;
        isInitializing = true;

        const config = window.ChatConfig;
        const logger = window.ChatLogger;
        const api = window.ChatAPI;
        const prompts = window.SuggestedPrompts;

        if (!window.ChatView || !window.ChatModel || !window.ChatViewModel) {
            isInitializing = false;
            return;
        }

        const view = new window.ChatView();

        if (!config || !config.shouldInject()) {
            view.remove();
            isInitializing = false;
            return;
        }

        const model = new window.ChatModel();

        const parser = window.MessageParser ? new window.MessageParser() : null;

        view.inject();

        const viewModel = new window.ChatViewModel(model, view, api, parser, config, logger);

        window.ChatWidget = {
            config: config,
            logger: logger,
            parser: parser,
            ui: view,
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

        isInitializing = false;
    }

    function ensureInjected() {
        const config = window.ChatConfig;
        if (!config || !config.shouldInject || !config.shouldInject()) {
            return;
        }

        const trigger = document.getElementById('ai-chat-trigger');
        const modal = document.getElementById('ai-chat-modal');

        if (!trigger || !modal) {
            init();
        }
    }

    function setupNavigationListeners() {
        document.addEventListener('DOMContentSwitch', () => {
            init();
        });

        if (typeof document$ !== 'undefined') {
            document$.subscribe(() => {
                init();
            });
        }

        window.addEventListener('popstate', () => {
            setTimeout(init, 0);
        });
    }

    function setupDomObserver() {
        if (domObserver || !document.body) return;

        domObserver = new MutationObserver(() => {
            if (ensureTimer) {
                clearTimeout(ensureTimer);
            }

            ensureTimer = setTimeout(() => {
                ensureInjected();
            }, 100);
        });

        domObserver.observe(document.body, { childList: true, subtree: true });
    }

    function enableWidgetRecovery() {
        setupNavigationListeners();
        setupDomObserver();
    }

    enableWidgetRecovery();
})();

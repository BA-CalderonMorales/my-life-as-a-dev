/**
 * Chat ViewModel
 * 
 * Mediates between the View and the Model.
 * Handles business logic, API calls, and state updates.
 */
class ChatViewModel {
    constructor(model, view, api, parser, config, logger) {
        this.model = model;
        this.view = view;
        this.api = api;
        this.parser = parser;
        this.config = config;
        this.logger = logger;
        this.prompts = window.SuggestedPrompts; // Reference prompts module

        this.init();
    }

    init() {
        // Bind View events to ViewModel methods
        this.view.bindOpen(() => this.openChat());
        this.view.bindClose(() => this.closeChat());
        this.view.bindSendMessage((text) => this.sendMessage(text));
        this.view.bindClear(() => this.clearChat());
        this.view.bindCopy(() => this.copyChat());
        this.view.bindShare(() => this.shareChat());
        this.view.bindMenuToggle();
        this.view.bindMaximize();
        this.view.bindPromptClick((text) => this.handlePromptClick(text));

        // Listen for MkDocs Material page navigation to refresh prompts
        this.setupPageNavigationListener();
    }

    /**
     * Listen for page navigation events to refresh prompts
     */
    setupPageNavigationListener() {
        // Track current page URL
        this.currentPageUrl = window.location.pathname;

        // MkDocs Material fires 'DOMContentSwitch' event on navigation
        document.addEventListener('DOMContentSwitch', () => {
            this.handlePageChange();
        });

        // Also listen for location$ observable (Material's internal navigation)
        if (window.location$) {
            window.location$.subscribe(() => {
                this.handlePageChange();
            });
        }
    }

    /**
     * Handle page navigation - refresh prompts if URL changed
     */
    handlePageChange() {
        const newUrl = window.location.pathname;
        if (newUrl !== this.currentPageUrl) {
            this.currentPageUrl = newUrl;

            // Clear prompts cache to force fresh prompts for new page
            if (this.prompts) {
                this.prompts.clearCache();
            }

            // If chat is open and conversation hasn't started, reload prompts
            if (this.model.isOpen && !this.model.conversationStarted) {
                this.loadPrompts();
            }
        }
    }

    openChat() {
        this.model.setOpen(true);
        this.view.show();

        // Load prompts if conversation hasn't started
        // Also reload if page URL has changed since last load
        if (!this.model.conversationStarted) {
            const currentUrl = window.location.pathname;
            if (this.lastPromptsUrl !== currentUrl) {
                this.loadPrompts();
            } else {
                // Just show the existing prompts
                this.view.showPrompts();
            }
        }
    }

    /**
     * Load suggested prompts for current page
     */
    loadPrompts() {
        if (this.prompts) {
            // Clear cache to ensure fresh prompts for this URL
            this.prompts.clearCache();

            const currentUrl = window.location.pathname;
            const pagePrompts = this.prompts.getPromptsForPage(currentUrl);

            this.lastPromptsUrl = currentUrl;
            this.model.setSuggestedPrompts(pagePrompts);
            this.view.renderPrompts(pagePrompts);
            this.view.showPrompts();
        }
    }

    /**
     * Handle suggested prompt button click
     */
    handlePromptClick(promptText) {
        if (this.view.elements.input) {
            this.view.elements.input.value = promptText;
        }
        this.sendMessage(promptText);
    }

    closeChat() {
        this.model.setOpen(false);
        this.view.hide();
    }

    async sendMessage(text) {
        if (!text) return;

        // Hide prompts on first message
        if (!this.model.conversationStarted) {
            this.model.setConversationStarted(true);
            this.view.hidePrompts();
        }

        // Validation
        if (this.config && text.length > this.config.MAX_MESSAGE_LENGTH) {
            this.view.addMessage(
                `Please keep your question under ${this.config.MAX_MESSAGE_LENGTH} characters.`,
                'bot',
                this.parser
            );
            return;
        }

        // Add user message to UI & Model
        this.model.addMessage(text, 'user');
        this.view.addMessage(text, 'user');
        this.view.clearInput();

        // Show loading
        this.model.setLoading(true);
        const loadingId = this.view.showLoading();
        const loadingTimers = this.startLoadingStatusUpdates(loadingId);

        try {
            // Send to API
            // Note: api.js in libs expects global config or internal handling. 
            // We assume api.sendMessage(text) works as is.
            const response = await this.api.sendMessage(text);
            if (this.logger) {
                this.logger.log('Routing metadata:', {
                    agent_used: response.agent_used || null,
                    model_used: response.model_used || null,
                    used_fallback: !!response.used_fallback
                });
            }

            // Update Session
            this.model.setSessionId(response.session_id);

            // Show response
            this.view.removeLoading(loadingId);
            this.model.addMessage(response.answer, 'bot');

            // Pass parser for markdown rendering
            this.view.addMessage(response.answer, 'bot', this.parser);

        } catch (error) {
            if (this.logger) {
                this.logger.error('Full error:', error);
            }

            this.view.removeLoading(loadingId);
            const errorMessage = this.api.getErrorMessage(error);
            this.view.addMessage(errorMessage, 'bot', this.parser);
            this.model.addMessage(errorMessage, 'bot'); // Log error in model too?
        } finally {
            this.stopLoadingStatusUpdates(loadingTimers);
            this.model.setLoading(false);
        }
    }

    startLoadingStatusUpdates(loadingId) {
        const timers = [];

        timers.push(setTimeout(() => {
            this.view.updateLoading(loadingId, 'Reviewing context');
        }, 3000));

        timers.push(setTimeout(() => {
            this.view.updateLoading(
                loadingId,
                'Still working',
                'This can take a bit for complex prompts.'
            );
        }, 8000));

        timers.push(setTimeout(() => {
            this.view.updateLoading(
                loadingId,
                'Almost there',
                'Large-model responses may take up to 30 seconds.'
            );
        }, 15000));

        return timers;
    }

    stopLoadingStatusUpdates(timers) {
        if (!timers || !Array.isArray(timers)) return;
        timers.forEach((id) => clearTimeout(id));
    }

    clearChat() {
        this.model.clearMessages();
        this.view.clearMessages();

        // Reset and show prompts again
        this.loadPrompts();
    }

    copyChat() {
        const text = this.view.getConversationText();
        if (text) {
            navigator.clipboard.writeText(text.trim()).then(() => {
                this.view.showToast('Copied to clipboard');
            }).catch(() => {
                this.view.showToast('Failed to copy');
            });
        }
    }

    shareChat() {
        const text = 'Chat with Brandon\'s AI Assistant\n\n' +
            this.view.getConversationText() +
            '---\nFrom: ' + window.location.href;

        if (navigator.share) {
            navigator.share({
                title: 'Chat with Brandon\'s AI Assistant',
                text: text,
                url: window.location.href
            }).catch(() => {
                this.fallbackShare(text);
            });
        } else {
            this.fallbackShare(text);
        }
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.view.showToast('Chat copied for sharing');
        }).catch(() => {
            this.view.showToast('Failed to share');
        });
    }
}

window.ChatViewModel = ChatViewModel;

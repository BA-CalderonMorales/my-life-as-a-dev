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
    }

    openChat() {
        this.model.setOpen(true);
        this.view.show();
    }

    closeChat() {
        this.model.setOpen(false);
        this.view.hide();
    }

    async sendMessage(text) {
        if (!text) return;

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

        try {
            // Send to API
            // Note: api.js in libs expects global config or internal handling. 
            // We assume api.sendMessage(text) works as is.
            const response = await this.api.sendMessage(text);

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
            this.model.setLoading(false);
        }
    }

    clearChat() {
        this.model.clearMessages();
        this.view.clearMessages();
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

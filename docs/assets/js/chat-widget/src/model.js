/**
 * Chat Model
 * 
 * Represents the state of the chat application.
 */
class ChatModel {
    constructor() {
        this.isOpen = false;
        this.isLoading = false;
        this.messages = []; // Array of { text, sender, timestamp }
        this.sessionId = null;
        this.conversationStarted = false; // Tracks if user has sent a message
        this.suggestedPrompts = []; // Current page's suggested prompts
    }

    addMessage(text, sender) {
        this.messages.push({
            text,
            sender,
            timestamp: new Date()
        });
    }

    setSessionId(id) {
        this.sessionId = id;
    }

    setLoading(loading) {
        this.isLoading = loading;
    }

    toggleOpen() {
        this.isOpen = !this.isOpen;
    }

    setOpen(isOpen) {
        this.isOpen = isOpen;
    }

    clearMessages() {
        this.messages = [];
        this.conversationStarted = false; // Reset on clear
    }

    setConversationStarted(started) {
        this.conversationStarted = started;
    }

    setSuggestedPrompts(prompts) {
        this.suggestedPrompts = prompts;
    }
}

// Export for global usage (Zensical non-module environment)
window.ChatModel = ChatModel;

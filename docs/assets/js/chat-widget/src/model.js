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
    }
}

// Export for global usage (Zensical non-module environment)
window.ChatModel = ChatModel;

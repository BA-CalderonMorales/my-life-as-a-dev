/**
 * Chat Widget UI
 * 
 * Handles DOM injection, UI state management, and user interactions.
 * This module is responsible for:
 * - Injecting the widget HTML into the page
 * - Managing modal open/close states
 * - Adding messages to the chat window
 * - Displaying loading indicators
 */

const ChatUI = {
  /**
   * Widget HTML template - Search modal inspired design
   */
  template: `
<button id="ai-chat-trigger" class="ai-chat-trigger" aria-label="Ask AI Assistant">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
  <span class="ai-chat-trigger-text">Ask AI</span>
</button>

<div id="ai-chat-modal" class="ai-chat-modal">
  <div class="ai-chat-container">
    <div class="ai-chat-header">
      <div class="ai-chat-header-info">
        <svg class="ai-chat-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="ai-chat-header-title">Ask about Brandon's work</span>
      </div>
      <div class="ai-chat-header-actions">
        <button class="ai-chat-action-btn" id="ai-chat-clear" aria-label="Clear chat" title="Clear chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button class="ai-chat-action-btn" id="ai-chat-copy" aria-label="Copy chat" title="Copy chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="ai-chat-action-btn" id="ai-chat-share" aria-label="Share chat" title="Share chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
        <button class="ai-chat-close" aria-label="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="ai-chat-input-area">
      <input type="text" id="ai-chat-input" placeholder="Ask a question..." autocomplete="off">
      <button class="ai-chat-send-btn" aria-label="Send message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>

    <div id="ai-chat-messages" class="ai-chat-messages">
      <div class="ai-message ai-message-bot">
        <div class="ai-message-content">
          Hello! I can help you learn about Brandon's projects, skills, and experience. What would you like to know?
        </div>
      </div>
    </div>
  </div>
</div>
    `,

  /**
   * Inject the widget into the page
   */
  inject: function () {
    document.body.insertAdjacentHTML('beforeend', this.template);
    this.bindEvents();
  },

  /**
   * Bind event listeners to widget elements
   */
  bindEvents: function () {
    // Trigger button
    const trigger = document.getElementById('ai-chat-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => this.open());
    }

    // Close button
    const closeBtn = document.querySelector('.ai-chat-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clear button
    const clearBtn = document.getElementById('ai-chat-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearChat());
    }

    // Copy button
    const copyBtn = document.getElementById('ai-chat-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyChat());
    }

    // Share button
    const shareBtn = document.getElementById('ai-chat-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareChat());
    }

    // Modal overlay click
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.id === 'ai-chat-modal') {
          this.close();
        }
      });
    }

    // Input enter key
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (window.ChatWidget && window.ChatWidget.sendMessage) {
            window.ChatWidget.sendMessage();
          }
        }
      });
    }

    // Send button
    const sendBtn = document.querySelector('.ai-chat-send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (window.ChatWidget && window.ChatWidget.sendMessage) {
          window.ChatWidget.sendMessage();
        }
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    // Prevent touch scroll bleed-through on mobile
    this.setupMobileTouchHandling();
  },

  /**
   * Setup touch event handling for mobile to prevent scroll bleed-through
   */
  setupMobileTouchHandling: function () {
    const modal = document.getElementById('ai-chat-modal');
    const messagesArea = document.getElementById('ai-chat-messages');

    if (!modal || !messagesArea) return;

    // Prevent touchmove on modal overlay from scrolling body
    modal.addEventListener('touchmove', (e) => {
      // Only prevent if the touch is on the overlay itself, not on scrollable content
      if (e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    // Handle scroll boundaries in messages area to prevent scroll chaining
    messagesArea.addEventListener('touchstart', (e) => {
      // Store starting scroll position and touch position
      this._touchStartY = e.touches[0].clientY;
      this._scrollStartTop = messagesArea.scrollTop;
      this._scrollHeight = messagesArea.scrollHeight;
      this._clientHeight = messagesArea.clientHeight;
    }, { passive: true });

    messagesArea.addEventListener('touchmove', (e) => {
      if (!this._touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = this._touchStartY - touchY;
      const scrollTop = messagesArea.scrollTop;
      const maxScroll = this._scrollHeight - this._clientHeight;

      // Prevent scroll if at top and trying to scroll up
      if (scrollTop <= 0 && deltaY < 0) {
        e.preventDefault();
        return;
      }

      // Prevent scroll if at bottom and trying to scroll down
      if (scrollTop >= maxScroll && deltaY > 0) {
        e.preventDefault();
        return;
      }
    }, { passive: false });
  },

  /**
   * Open the chat modal
   */
  open: function () {
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
      modal.classList.add('active');

      // Lock body scroll - store current position for iOS
      this._scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this._scrollY}px`;
      document.body.style.width = '100%';

      // Focus input
      const input = document.getElementById('ai-chat-input');
      if (input) {
        input.focus();
      }
    }
  },

  /**
   * Close the chat modal
   */
  close: function () {
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
      modal.classList.remove('active');

      // Restore body scroll - return to original position
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position
      if (this._scrollY !== undefined) {
        window.scrollTo(0, this._scrollY);
      }
    }
  },

  /**
   * Add a message to the chat window
   * @param {string} text - Message text
   * @param {string} sender - 'user' or 'bot'
   * @param {MessageParser} parser - Optional parser for formatting bot messages
   * @returns {HTMLElement} - The created message element
   */
  addMessage: function (text, sender, parser = null) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-message-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';

    // For bot messages, use parser if available
    if (sender === 'bot' && parser) {
      contentDiv.innerHTML = parser.parse(text);
    } else {
      contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return messageDiv;
  },

  /**
   * Add animated loading indicator
   * @returns {HTMLElement} - The loading message element
   */
  addLoadingMessage: function () {
    const messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message ai-message-loading';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content ai-loading-content';
    contentDiv.innerHTML = `
            <span class="ai-loading-text">Thinking</span>
            <span class="ai-loading-dots">
                <span class="ai-dot"></span>
                <span class="ai-dot"></span>
                <span class="ai-dot"></span>
            </span>
        `;

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return messageDiv;
  },

  /**
   * Get current input value and clear it
   * @returns {string} - The input value
   */
  getAndClearInput: function () {
    const input = document.getElementById('ai-chat-input');
    if (!input) return '';

    const value = input.value.trim();
    input.value = '';
    return value;
  },

  /**
   * Clear the chat history
   */
  clearChat: function () {
    const messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return;

    // Reset to initial welcome message
    messagesDiv.innerHTML = `
      <div class="ai-message ai-message-bot">
        <div class="ai-message-content">
          Hello! I can help you learn about Brandon's projects, skills, and experience. What would you like to know?
        </div>
      </div>
    `;

    // Show brief feedback
    this.showToast('Chat cleared');
  },

  /**
   * Copy chat history to clipboard
   */
  copyChat: function () {
    const messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return;

    const messages = messagesDiv.querySelectorAll('.ai-message');
    let chatText = '';

    messages.forEach((msg) => {
      const isUser = msg.classList.contains('ai-message-user');
      const content = msg.querySelector('.ai-message-content');
      if (content && !msg.classList.contains('ai-message-loading')) {
        const prefix = isUser ? 'You: ' : 'AI: ';
        chatText += prefix + content.textContent.trim() + '\n\n';
      }
    });

    if (chatText) {
      navigator.clipboard.writeText(chatText.trim()).then(() => {
        this.showToast('Copied to clipboard');
      }).catch(() => {
        this.showToast('Failed to copy');
      });
    }
  },

  /**
   * Share chat via Web Share API or copy link
   */
  shareChat: function () {
    const messagesDiv = document.getElementById('ai-chat-messages');
    if (!messagesDiv) return;

    const messages = messagesDiv.querySelectorAll('.ai-message');
    let chatText = 'Chat with Brandon\'s AI Assistant\n\n';

    messages.forEach((msg) => {
      const isUser = msg.classList.contains('ai-message-user');
      const content = msg.querySelector('.ai-message-content');
      if (content && !msg.classList.contains('ai-message-loading')) {
        const prefix = isUser ? 'You: ' : 'AI: ';
        chatText += prefix + content.textContent.trim() + '\n\n';
      }
    });

    chatText += '---\nFrom: ' + window.location.href;

    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Chat with Brandon\'s AI Assistant',
        text: chatText,
        url: window.location.href
      }).catch(() => {
        // User cancelled or error - fall back to copy
        this.fallbackShare(chatText);
      });
    } else {
      this.fallbackShare(chatText);
    }
  },

  /**
   * Fallback share method - copy to clipboard
   */
  fallbackShare: function (text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Chat copied for sharing');
    }).catch(() => {
      this.showToast('Failed to share');
    });
  },

  /**
   * Show a brief toast notification
   */
  showToast: function (message) {
    // Remove existing toast
    const existing = document.querySelector('.ai-chat-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ai-chat-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('ai-chat-toast-visible');
    });

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('ai-chat-toast-visible');
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatUI;
} else {
  window.ChatUI = ChatUI;
}

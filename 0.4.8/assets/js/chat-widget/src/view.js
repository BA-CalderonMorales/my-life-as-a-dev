/**
 * Chat Widget View
 * 
 * Handles DOM injection, UI rendering, and event broadcasting.
 * Driven by the ViewModel.
 */

class ChatView {
    constructor() {
        this.elements = {};
        this._scrollY = 0;
        this._touchStartY = null;
        this._scrollStartTop = 0;
        this._scrollHeight = 0;
        this._clientHeight = 0;
    }

    /**
     * Widget HTML template
     */
    get template() {
        return `
<button id="ai-chat-trigger" class="ai-chat-trigger" aria-label="Ask AI Assistant">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="6" width="12" height="12" rx="3"></rect>
    <circle cx="8.5" cy="12" r="0.9"></circle>
    <circle cx="12" cy="12" r="0.9"></circle>
    <path d="M19 4v4M17 6h4"></path>
    <path d="M18.5 11.5v3M17 13h3"></path>
  </svg>
  <span class="ai-chat-trigger-text">Ask AI</span>
</button>

<div id="ai-chat-modal" class="ai-chat-modal">
  <div class="ai-chat-container">
    <div class="ai-chat-header">
      <div class="ai-chat-header-info">
        <svg class="ai-chat-header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="6" width="12" height="12" rx="3"></rect>
          <circle cx="8.5" cy="12" r="0.9"></circle>
          <circle cx="12" cy="12" r="0.9"></circle>
          <path d="M19 4v4M17 6h4"></path>
          <path d="M18.5 11.5v3M17 13h3"></path>
        </svg>
        <span class="ai-chat-header-title">Ask about Brandon's work</span>
      </div>
      <div class="ai-chat-header-actions">
        <button class="ai-chat-action-btn" id="ai-chat-maximize" aria-label="Maximize chat" title="Maximize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button class="ai-chat-close" aria-label="Close chat" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div id="ai-chat-messages" class="ai-chat-messages">
      <div class="ai-message ai-message-bot">
        <div class="ai-message-content">
          Hello! I can help you learn about Brandon's projects, skills, and experience. What would you like to know?
        </div>
      </div>
    </div>

    <div id="ai-chat-prompts" class="ai-chat-prompts">
      <button class="ai-chat-prompt-btn" data-prompt-index="0"></button>
      <button class="ai-chat-prompt-btn" data-prompt-index="1"></button>
    </div>

    <div class="ai-chat-input-area">
      <input type="text" id="ai-chat-input" placeholder="Ask a question..." autocomplete="off">
      <button class="ai-chat-send-btn" aria-label="Send message" title="Send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
      <div class="ai-chat-menu-wrapper">
        <button class="ai-chat-menu-btn" id="ai-chat-menu-toggle" aria-label="More options" aria-expanded="false" title="More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="1.5"></circle>
            <circle cx="12" cy="12" r="1.5"></circle>
            <circle cx="12" cy="19" r="1.5"></circle>
          </svg>
        </button>
        <div class="ai-chat-menu" id="ai-chat-menu">
          <button class="ai-chat-menu-item" id="ai-chat-clear" title="Clear conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Clear</span>
          </button>
          <button class="ai-chat-menu-item" id="ai-chat-copy" title="Copy to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
          <button class="ai-chat-menu-item" id="ai-chat-share" title="Share conversation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
        `;
    }

    /**
     * Remove existing widget elements from the DOM
     */
    remove() {
        // Remove ALL instances using querySelectorAll to catch duplicates
        const selectors = ['#ai-chat-trigger', '#ai-chat-modal', '.ai-chat-toast'];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        this.elements = {};
    }

    /**
     * Inject the widget into the page
     */
    inject() {
        // Cleanup any existing instance first
        this.remove();

        document.body.insertAdjacentHTML('beforeend', this.template);
        this.cacheDOM();
        this.setupSearchModalObserver();
        this.setupMobileTouchHandling();
    }

    cacheDOM() {
        this.elements = {
            modal: document.getElementById('ai-chat-modal'),
            container: document.querySelector('.ai-chat-container'),
            trigger: document.getElementById('ai-chat-trigger'),
            closeBtn: document.querySelector('.ai-chat-close'),
            maximizeBtn: document.getElementById('ai-chat-maximize'),
            menuToggle: document.getElementById('ai-chat-menu-toggle'),
            menu: document.getElementById('ai-chat-menu'),
            clearBtn: document.getElementById('ai-chat-clear'),
            copyBtn: document.getElementById('ai-chat-copy'),
            shareBtn: document.getElementById('ai-chat-share'),
            input: document.getElementById('ai-chat-input'),
            sendBtn: document.querySelector('.ai-chat-send-btn'),
            messagesDiv: document.getElementById('ai-chat-messages'),
            promptsContainer: document.getElementById('ai-chat-prompts'),
            promptBtns: document.querySelectorAll('.ai-chat-prompt-btn')
        };
        this._isMaximized = false;
    }

    /**
     * Bind event listeners to ViewModel callbacks
     */
    bindOpen(handler) {
        if (this.elements.trigger) {
            this.elements.trigger.addEventListener('click', handler);
        }
    }

    bindClose(handler) {
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', handler);
        }
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target.id === 'ai-chat-modal') handler();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') handler();
        });
    }

    bindClear(handler) {
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => {
                this.closeMenu();
                handler();
            });
        }
    }

    bindCopy(handler) {
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => {
                this.closeMenu();
                handler();
            });
        }
    }

    bindShare(handler) {
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => {
                this.closeMenu();
                handler();
            });
        }
    }

    bindMenuToggle() {
        if (this.elements.menuToggle && this.elements.menu) {
            this.elements.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.elements.menu &&
                    !this.elements.menu.contains(e.target) &&
                    !this.elements.menuToggle.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }

    bindMaximize(handler) {
        if (this.elements.maximizeBtn) {
            this.elements.maximizeBtn.addEventListener('click', () => {
                this.toggleMaximize();
                if (handler) handler(this._isMaximized);
            });
        }
    }

    toggleMenu() {
        if (this.elements.menu && this.elements.menuToggle) {
            const isOpen = this.elements.menu.classList.toggle('active');
            this.elements.menuToggle.setAttribute('aria-expanded', isOpen);
        }
    }

    closeMenu() {
        if (this.elements.menu && this.elements.menuToggle) {
            this.elements.menu.classList.remove('active');
            this.elements.menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    toggleMaximize() {
        if (this.elements.container && this.elements.maximizeBtn) {
            this._isMaximized = !this._isMaximized;
            this.elements.container.classList.toggle('maximized', this._isMaximized);

            // Update the icon based on state
            const svg = this.elements.maximizeBtn.querySelector('svg');
            if (this._isMaximized) {
                // Minimize icon
                svg.innerHTML = '<path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7"></path>';
                this.elements.maximizeBtn.setAttribute('aria-label', 'Minimize chat');
                this.elements.maximizeBtn.setAttribute('title', 'Minimize');
            } else {
                // Maximize icon
                svg.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
                this.elements.maximizeBtn.setAttribute('aria-label', 'Maximize chat');
                this.elements.maximizeBtn.setAttribute('title', 'Maximize');
            }

            // Auto-focus the input field
            if (this.elements.input) {
                this.elements.input.focus();
            }
        }
    }

    bindSendMessage(handler) {
        const send = () => {
            const text = this.elements.input ? this.elements.input.value.trim() : '';
            if (text) handler(text);
        };

        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', send);
        }
        if (this.elements.input) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                }
            });
        }
    }

    /**
     * UI Actions
     */
    show() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('active');

            // Lock body scroll - store current position for iOS
            this._scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this._scrollY}px`;
            document.body.style.width = '100%';

            if (this.elements.input) this.elements.input.focus();
        }
    }

    hide() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');

            // Restore body scroll - return to original position
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            if (this._scrollY !== undefined) {
                window.scrollTo(0, this._scrollY);
            }
        }
    }

    clearInput() {
        if (this.elements.input) this.elements.input.value = '';
    }

    clearMessages() {
        if (this.elements.messagesDiv) {
            // Reset to initial welcome message
            this.elements.messagesDiv.innerHTML = `
              <div class="ai-message ai-message-bot">
                <div class="ai-message-content">
                  Hello! I can help you learn about Brandon's projects, skills, and experience. What would you like to know?
                </div>
              </div>
            `;
            this.showToast('Chat cleared');
        }
    }

    addMessage(text, sender, parser = null) {
        if (!this.elements.messagesDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message-content';

        if (sender === 'bot' && parser) {
            contentDiv.innerHTML = parser.parse(text);
            
            // Try to apply syntax highlighting if available
            // Material for MkDocs typically uses Highlight.js
            if (window.hljs) {
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    window.hljs.highlightElement(block);
                });
            }
        } else {
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(contentDiv);
        this.elements.messagesDiv.appendChild(messageDiv);
        this.elements.messagesDiv.scrollTop = this.elements.messagesDiv.scrollHeight;
    }

    showLoading() {
        if (!this.elements.messagesDiv) return null;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai-message-loading';
        // Unique ID for easy removal
        messageDiv.id = 'ai-chat-loading-' + Date.now();

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
        this.elements.messagesDiv.appendChild(messageDiv);
        this.elements.messagesDiv.scrollTop = this.elements.messagesDiv.scrollHeight;

        return messageDiv.id;
    }

    removeLoading(id) {
        if (id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }
        // Also clean up any stray loading indicators (fallback)
        const spinners = document.querySelectorAll('.ai-message-loading');
        spinners.forEach(s => s.remove());
    }

    showToast(message) {
        const existing = document.querySelector('.ai-chat-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'ai-chat-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('ai-chat-toast-visible');
        });

        setTimeout(() => {
            toast.classList.remove('ai-chat-toast-visible');
            setTimeout(() => toast.remove(), 200);
        }, 2000);
    }

    // Helper to get text for copy/share
    getConversationText() {
        if (!this.elements.messagesDiv) return '';

        const messages = this.elements.messagesDiv.querySelectorAll('.ai-message');
        let chatText = '';

        messages.forEach((msg) => {
            const isUser = msg.classList.contains('ai-message-user');
            const content = msg.querySelector('.ai-message-content');
            if (content && !msg.classList.contains('ai-message-loading')) {
                const prefix = isUser ? 'You: ' : 'AI: ';
                chatText += prefix + content.textContent.trim() + '\n\n';
            }
        });
        return chatText;
    }

    /**
     * Setup listener to hide/show trigger when Material for MkDocs search opens/closes.
     */
    setupSearchModalObserver() {
        // Track our own "search visually open" state
        let searchVisuallyOpen = false;

        const updateTrigger = () => {
            const trigger = document.getElementById('ai-chat-trigger');
            if (trigger) {
                trigger.style.display = searchVisuallyOpen ? 'none' : '';
            }
        };

        const searchCheckbox = document.getElementById('__search');
        const searchLabel = document.querySelector('label[for="__search"]');

        // Escape or Enter closes search
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Escape' || e.key === 'Enter') && searchVisuallyOpen) {
                searchVisuallyOpen = false;
                updateTrigger();
            }
        });

        // Handle all search-related clicks with debounce
        let lastClickTime = 0;
        document.addEventListener('click', (e) => {
            const now = Date.now();
            const target = e.target;
            const isSearchButton = target.closest('button.r') || target.closest('.lucide-search');
            const isSearchLabel = target.closest('label[for="__search"]');

            // Search toggle button or magnifying glass label clicked
            if (isSearchButton || isSearchLabel) {
                // Debounce - ignore clicks within 100ms
                if (now - lastClickTime < 100) {
                    return;
                }
                lastClickTime = now;

                searchVisuallyOpen = !searchVisuallyOpen;
                updateTrigger();
                return;
            }

            // If search is open and clicking outside the search form, close
            if (searchVisuallyOpen) {
                const searchForm = document.querySelector('.md-search__form');
                const isInsideSearchForm = searchForm && searchForm.contains(target);
                const isSearchCheckbox = target.id === '__search' || target.classList.contains('md-toggle');

                if (!isInsideSearchForm && !isSearchCheckbox) {
                    searchVisuallyOpen = false;
                    updateTrigger();
                }
            }
        }, true);

        // Initial state
        if (searchCheckbox) {
            searchVisuallyOpen = searchCheckbox.checked;
        }
        updateTrigger();
    }

    /**
     * Setup touch event handling for mobile to prevent scroll bleed-through
     */
    setupMobileTouchHandling() {
        const modal = this.elements.modal;
        const messagesArea = this.elements.messagesDiv;

        if (!modal || !messagesArea) return;

        // Prevent touchmove on modal overlay from scrolling body
        modal.addEventListener('touchmove', (e) => {
            if (e.target === modal) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle scroll boundaries in messages area to prevent scroll chaining
        messagesArea.addEventListener('touchstart', (e) => {
            this._touchStartY = e.touches[0].clientY;
            this._scrollStartTop = messagesArea.scrollTop;
            this._scrollHeight = messagesArea.scrollHeight;
            this._clientHeight = messagesArea.clientHeight;
        }, { passive: true });

        messagesArea.addEventListener('touchmove', (e) => {
            if (this._touchStartY === null) return;

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
    }

    /**
     * Suggested Prompts Methods
     */
    bindPromptClick(handler) {
        if (this.elements.promptBtns) {
            this.elements.promptBtns.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const promptText = btn.textContent;
                    if (promptText) handler(promptText);
                });
            });
        }
    }

    renderPrompts(prompts) {
        if (!this.elements.promptBtns || !prompts) return;

        prompts.forEach((prompt, index) => {
            if (this.elements.promptBtns[index]) {
                this.elements.promptBtns[index].textContent = prompt;
                this.elements.promptBtns[index].setAttribute('title', prompt);
            }
        });
    }

    showPrompts() {
        if (this.elements.promptsContainer) {
            this.elements.promptsContainer.classList.add('visible');
        }
    }

    hidePrompts() {
        if (this.elements.promptsContainer) {
            this.elements.promptsContainer.classList.remove('visible');
        }
    }
}

window.ChatView = ChatView;

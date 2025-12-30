// AI Chat Widget - Inject HTML into DOM on page load
(function () {
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget();
    }

    function injectWidget() {
        // Don't inject on canvas page
        if (window.location.pathname.includes('/canvas/')) {
            return;
        }

        // Create widget HTML
        const widgetHTML = `
<button id="ai-chat-trigger" class="ai-chat-trigger" onclick="openChat()" aria-label="Open AI Assistant">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
</button>

<div id="ai-chat-modal" class="ai-chat-modal" onclick="closeOnOverlay(event)">
  <div class="ai-chat-container">
    <div class="ai-chat-header">
      <h3>Ask Brandon's AI</h3>
      <button onclick="closeChat()" class="ai-chat-close" aria-label="Close chat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div id="ai-chat-messages" class="ai-chat-messages">
      <div class="ai-message ai-message-bot">
        <div class="ai-message-content">
          👋 Hi! I can help you learn about Brandon or navigate this site. What would you like to know?
        </div>
      </div>
    </div>

    <div class="ai-chat-input-area">
      <input type="text" id="ai-chat-input" placeholder="Ask a question..." onkeypress="handleKeyPress(event)"
        autocomplete="off">
      <button onclick="sendMessage()" class="ai-chat-send-btn" aria-label="Send message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }
})();

// Cloud Run endpoint
const CLOUD_FUNCTION_URL = 'https://agent-chat-proxy-882389009262.us-central1.run.app';
let sessionId = null;

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

function openChat() {
    document.getElementById('ai-chat-modal').classList.add('active');
    document.getElementById('ai-chat-input').focus();
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeChat() {
    document.getElementById('ai-chat-modal').classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

function closeOnOverlay(event) {
    if (event.target.id === 'ai-chat-modal') {
        closeChat();
    }
}

// Close on Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeChat();
    }
});

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Input validation: max length
    if (message.length > 500) {
        addMessage('Please keep your question under 500 characters.', 'bot');
        return;
    }

    // Rate limiting: prevent rapid requests
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
        addMessage('Please wait a moment before sending another message.', 'bot');
        return;
    }
    lastRequestTime = now;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Show loading indicator
    const loadingDiv = addMessage('Thinking...', 'loading');

    try {
        console.log('[AI Chat] Sending request to:', CLOUD_FUNCTION_URL);
        console.log('[AI Chat] From origin:', window.location.origin);

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: message,
                context: document.body.innerText.substring(0, 2000),
                page_url: window.location.href,
                session_id: sessionId
            })
        });

        console.log('[AI Chat] Response status:', response.status);
        console.log('[AI Chat] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Chat] Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('[AI Chat] Response data:', data);

        // Validate response structure
        if (!data || typeof data.answer !== 'string') {
            throw new Error('Invalid response format');
        }

        sessionId = data.session_id;

        // Remove loading, add response
        loadingDiv.remove();
        addMessage(data.answer, 'bot');

    } catch (error) {
        console.error('[AI Chat] Full error:', error);
        console.error('[AI Chat] Error name:', error.name);
        console.error('[AI Chat] Error message:', error.message);
        loadingDiv.remove();

        // More specific error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            addMessage('Network error. Please check your connection and try again.', 'bot');
        } else if (error.message.includes('CORS')) {
            addMessage('Connection blocked. Please try again from the production site.', 'bot');
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-message-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageDiv;
}

---
title: Architecture
description: MVVM architecture, file structure, and component breakdown for the AI chat widget.
---

# Chat Widget Architecture

The chat widget uses the **Model-View-ViewModel (MVVM)** pattern, providing clean separation of concerns and maintainability similar to the Rust doc-cli structure with `src/` and `lib/` directories.

## Directory Structure

```
docs/assets/js/chat-widget/
├── src/                      # Core application logic (MVVM)
│   ├── main.js               # Entry point, composition root
│   ├── model.js              # Application state
│   ├── view.js               # DOM manipulation
│   └── view-model.js         # Business logic
│
└── lib/                      # Reusable utilities
    ├── api.js                # Backend communication
    ├── config.js             # Configuration constants
    ├── logger.js             # Prefixed logging
    └── message-parser.js     # Markdown parsing
```

---

## MVVM Pattern

```text
┌─────────────────────────────────────────────────────────────┐
│                         View (view.js)                      │
│  - Creates DOM elements                                     │
│  - Binds event listeners                                    │
│  - Updates UI based on ViewModel callbacks                  │
│  - "Dumb" - no business logic                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ Events / Callbacks
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    ViewModel (view-model.js)                │
│  - Handles user actions (send message, toggle)              │
│  - Orchestrates API calls                                   │
│  - Updates Model state                                      │
│  - Notifies View of changes                                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ State Changes
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Model (model.js)                      │
│  - Holds application state                                  │
│  - Messages array, loading flag, isOpen state               │
│  - No UI logic, no API calls                                │
└─────────────────────────────────────────────────────────────┘
```

### Why MVVM?

| Benefit | Description |
|---------|-------------|
| **Testability** | Model and ViewModel can be unit tested without DOM |
| **Maintainability** | Clear boundaries make changes easier |
| **Reusability** | lib/ utilities work independently |
| **Debugging** | Issues isolate to specific layers |

---

## Component Details

### src/main.js - Entry Point

The composition root that wires everything together:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Skip on excluded pages
  if (window.location.pathname.includes('/canvas/')) return;
  
  // Create instances
  const model = new ChatModel();
  const view = new ChatView();
  const viewModel = new ChatViewModel(model, view);
  
  // Initialize
  viewModel.init();
});
```

**Responsibilities:**

- Wait for DOM ready
- Check exclusion paths (e.g., `/canvas/`)
- Instantiate Model, View, ViewModel
- Call initialization

### src/model.js - State Management

Pure data container with no side effects:

```javascript
class ChatModel {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.sessionId = null;
  }
  
  addMessage(text, sender) {
    this.messages.push({ text, sender, timestamp: Date.now() });
  }
  
  setLoading(loading) {
    this.isLoading = loading;
  }
  
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
```

**State Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | boolean | Widget panel visibility |
| `messages` | array | Chat history `[{text, sender, timestamp}]` |
| `isLoading` | boolean | API request in progress |
| `sessionId` | string | Gemini conversation session ID |

### src/view.js - DOM Manipulation

Handles all DOM operations without business logic:

```javascript
class ChatView {
  constructor() {
    this.elements = {};
  }
  
  create() {
    // Inject widget HTML into document
    document.body.insertAdjacentHTML('beforeend', this.getTemplate());
    this.cacheElements();
    this.bindEvents();
  }
  
  cacheElements() {
    this.elements = {
      toggle: document.getElementById('ai-chat-toggle'),
      panel: document.getElementById('ai-chat-panel'),
      input: document.getElementById('ai-chat-input'),
      messages: document.getElementById('ai-chat-messages'),
      // ...
    };
  }
  
  addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `ai-chat-message ai-chat-${sender}`;
    div.textContent = text;  // XSS safe - no innerHTML
    this.elements.messages.appendChild(div);
  }
}
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `create()` | Inject widget HTML, cache elements |
| `bindEvents()` | Attach click/keypress handlers |
| `addMessage()` | Append message to chat (XSS-safe) |
| `showLoading()` | Display typing indicator |
| `togglePanel()` | Show/hide chat panel |
| `remove()` | Clean up DOM elements |

### src/view-model.js - Business Logic

Coordinates between View and Model:

```javascript
class ChatViewModel {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.lastRequestTime = 0;
  }
  
  init() {
    this.view.create();
    this.view.onToggle(() => this.handleToggle());
    this.view.onSend((message) => this.handleSend(message));
    this.showWelcome();
  }
  
  async handleSend(message) {
    // Rate limiting
    if (Date.now() - this.lastRequestTime < 1000) {
      this.view.addMessage('Please wait...', 'assistant');
      return;
    }
    
    // Input validation
    if (message.length > 500) {
      this.view.addMessage('Message too long', 'assistant');
      return;
    }
    
    // Update state and UI
    this.model.addMessage(message, 'user');
    this.view.addMessage(message, 'user');
    this.model.setLoading(true);
    this.view.showLoading();
    
    // API call
    const response = await ChatAPI.send(message, this.model.sessionId);
    
    // Handle response
    this.model.setLoading(false);
    this.view.hideLoading();
    this.model.addMessage(response.answer, 'assistant');
    this.view.addMessage(response.answer, 'assistant');
  }
}
```

**Responsibilities:**

- Rate limiting enforcement
- Input validation
- API orchestration
- State synchronization
- Error handling

---

## lib/ Utilities

### lib/config.js - Configuration

Centralized configuration for easy customization:

```javascript
const ChatConfig = {
  // API Configuration
  API_URL: 'https://agent-chat-proxy-xxx.run.app/chat',
  
  // Rate Limiting
  MIN_REQUEST_INTERVAL: 1000,  // 1 second between requests
  MAX_MESSAGE_LENGTH: 500,
  
  // UI Configuration
  EXCLUDED_PATHS: ['/canvas/'],
  WELCOME_MESSAGE: 'Hi! Ask me anything about this site.',
  
  // Logging
  LOG_PREFIX: '[AI Chat]',
  DEBUG: false
};
```

### lib/logger.js - Prefixed Logging

Consistent logging with easy filtering:

```javascript
const ChatLogger = {
  log: (...args) => console.log(ChatConfig.LOG_PREFIX, ...args),
  warn: (...args) => console.warn(ChatConfig.LOG_PREFIX, ...args),
  error: (...args) => console.error(ChatConfig.LOG_PREFIX, ...args),
  debug: (...args) => {
    if (ChatConfig.DEBUG) console.debug(ChatConfig.LOG_PREFIX, ...args);
  }
};
```

### lib/api.js - Backend Communication

Handles all HTTP communication:

```javascript
const ChatAPI = {
  async send(message, sessionId) {
    try {
      const response = await fetch(ChatConfig.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      ChatLogger.error('API error:', error);
      return { answer: 'Sorry, something went wrong. Please try again.' };
    }
  }
};
```

### lib/message-parser.js - Markdown Parsing

Converts API responses with markdown to HTML:

```javascript
const MessageParser = {
  parse(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert `code` to <code>
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert [link](url) to <a>
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" target="_blank">$1</a>');
    
    return text;
  }
};
```

---

## Data Flow

```text
User clicks send
       │
       ▼
┌─────────────────┐
│  View.onSend()  │───► Captures input, calls callback
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ ViewModel.handleSend│───► Validates, rate limits
└────────┬────────────┘
         │
         ├───► Model.addMessage() ───► Updates state
         │
         ├───► View.addMessage() ───► Updates UI
         │
         ▼
┌─────────────────┐
│   ChatAPI.send  │───► HTTP POST to backend
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Response received   │
└────────┬────────────┘
         │
         ├───► Model.addMessage() ───► Store response
         │
         └───► View.addMessage() ───► Display response
```

---

## Extending the Architecture

### Adding a New Feature

Example: Adding message reactions

1. **Model** - Add reactions to message structure:
   ```javascript
   this.messages.push({ text, sender, timestamp, reactions: [] });
   ```

2. **View** - Add reaction UI elements:
   ```javascript
   addReactionButtons(messageElement) { /* ... */ }
   ```

3. **ViewModel** - Handle reaction logic:
   ```javascript
   handleReaction(messageIndex, reaction) { /* ... */ }
   ```

### Adding a New Utility

Add to `lib/` with consistent patterns:

```javascript
// lib/my-utility.js
const MyUtility = {
  doSomething(input) {
    ChatLogger.debug('MyUtility.doSomething', input);
    // Implementation
  }
};
```

---

## Testing Strategy

| Layer | Test Type | Tools |
|-------|-----------|-------|
| **Model** | Unit tests | Jest, no DOM |
| **ViewModel** | Unit tests | Jest, mock API |
| **View** | Integration | Playwright, JSDOM |
| **API** | E2E | curl, Playwright |

Example unit test for Model:

```javascript
test('addMessage stores message correctly', () => {
  const model = new ChatModel();
  model.addMessage('Hello', 'user');
  
  expect(model.messages).toHaveLength(1);
  expect(model.messages[0].text).toBe('Hello');
  expect(model.messages[0].sender).toBe('user');
});
```

---

## Related Documentation

- [Chat Widget Overview](chat_widget.md)
- [Security Documentation](../security/chat-security.md)
- [Deployment Guide](deployment.md)
- [Integration Guide](integration.md)

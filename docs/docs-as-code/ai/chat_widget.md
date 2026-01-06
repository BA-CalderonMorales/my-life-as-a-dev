---
title: Chat Widget Overview
description: A Claude Docs-inspired AI chat widget for documentation sites. Overview of components, architecture, and how to integrate into your own Zensical site.
---

# AI Chat Widget

A production-ready, Claude Docs-inspired AI chat widget that provides instant, conversational answers about your documentation site. Built with security-first principles using Google Cloud Run and Gemini API.

<div class="grid cards" markdown>

-   :material-shield-check:{ .lg .middle } **Security First**

    ---

    Defense-in-depth security model with prompt injection safeguards, secret management, and XSS prevention.

    [:octicons-arrow-right-24: Security Documentation](../security/chat-security.md)

-   :material-puzzle:{ .lg .middle } **Modular Architecture**

    ---

    MVVM pattern with separated concerns: Model, View, ViewModel, and reusable utilities in lib/.

    [:octicons-arrow-right-24: Architecture Guide](architecture.md)

-   :material-rocket-launch:{ .lg .middle } **Easy Deployment**

    ---

    Deploy to Google Cloud Run with Secret Manager integration. Free tier covers typical usage.

    [:octicons-arrow-right-24: Deployment Guide](deployment.md)

-   :material-power-plug:{ .lg .middle } **Plug & Play**

    ---

    Integrate into any Zensical or MkDocs Material site with minimal configuration.

    [:octicons-arrow-right-24: Integration Guide](integration.md)

</div>

---

## Why Build This?

### The Problem

Documentation sites are static. Users often struggle to find specific information across many pages, especially on mobile. Traditional search returns page links, not answers.

### The Solution

An AI-powered chat widget that:

- **Answers questions directly** - No need to read entire pages
- **Understands context** - Knows about the site and its content
- **Works everywhere** - Desktop, tablet, mobile
- **Respects privacy** - No conversation logging, session-based only

### Inspiration

Inspired by [Claude's documentation chat](https://docs.anthropic.com) which provides an excellent user experience for finding information quickly.

---

## Key Features

### For Users

| Feature | Description |
|---------|-------------|
| **Instant Answers** | Get responses about site content without searching |
| **Conversation Memory** | Follow-up questions maintain context |
| **Mobile Friendly** | Full-screen modal on mobile, sidebar on desktop |
| **Dark Mode** | Automatic theme detection |
| **Rate Limited** | Prevents abuse, provides friendly feedback |

### For Developers

| Feature | Description |
|---------|-------------|
| **MVVM Architecture** | Clean separation of concerns for maintainability |
| **No Build Step** | Pure JavaScript, no bundler required |
| **Configurable** | Easy to customize API endpoints, styling, behavior |
| **Secure by Default** | XSS prevention, CORS, prompt injection safeguards |
| **Observable** | Prefixed logging (`[AI Chat]`) for easy debugging |

---

## Component Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Your Static Site)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  src/                    lib/                         │  │
│  │  ├── main.js             ├── api.js                   │  │
│  │  ├── model.js            ├── config.js                │  │
│  │  ├── view.js             ├── logger.js                │  │
│  │  └── view-model.js       └── message-parser.js        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + CORS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Cloud Run)                                        │
│  ├── Flask Proxy Service                                    │
│  ├── Prompt Injection Safeguards                            │
│  ├── CORS Validation (dynamic Codespaces support)           │
│  └── Secret Manager Integration                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  AI Layer (Gemini API)                                      │
│  └── Gemini 2.0 Flash - Fast, conversational responses      │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **main.js** | `src/` | Application entry point, composition root |
| **model.js** | `src/` | State management (messages, loading, isOpen) |
| **view.js** | `src/` | DOM manipulation, event binding (dumb view) |
| **view-model.js** | `src/` | Business logic, bridges View and Model |
| **api.js** | `lib/` | Backend communication service |
| **config.js** | `lib/` | Configuration (API URL, limits, etc.) |
| **logger.js** | `lib/` | Prefixed logging utility |
| **message-parser.js** | `lib/` | Markdown parsing for responses |

### Backend Components

| Component | Purpose |
|-----------|---------|
| **main.py** | Flask service with Gemini integration |
| **CORS Handler** | Regex-based origin validation (supports Codespaces) |
| **Prompt Guard** | 10+ pattern detection for injection attempts |
| **Secret Manager** | Secure API key retrieval |

---

## Quick Start

### Prerequisites

- Google Cloud account with billing enabled
- Gemini API key (free tier available)
- Zensical or MkDocs Material site

### 1. Deploy Backend

```bash
# Clone the backend
git clone https://github.com/BA-CalderonMorales/agent-chat-proxy

# Deploy to Cloud Run
gcloud run deploy agent-chat-proxy \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### 2. Add Frontend

Copy the `docs/assets/js/chat-widget/` directory to your site and add to your template:

```html
<!-- In your overrides/main.html -->
{% block scripts %}
  {{ super() }}
  <script src="{{ 'assets/js/chat-widget/lib/config.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/lib/logger.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/lib/api.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/lib/message-parser.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/src/model.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/src/view.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/src/view-model.js' | url }}"></script>
  <script src="{{ 'assets/js/chat-widget/src/main.js' | url }}"></script>
{% endblock %}
```

### 3. Configure

Update `lib/config.js` with your Cloud Run URL:

```javascript
const ChatConfig = {
  API_URL: 'https://your-service-name.run.app/chat',
  // ...
};
```

[:octicons-arrow-right-24: Full Integration Guide](integration.md)

---

## Cost Estimate

Designed for personal/portfolio sites with < $5/month target:

| Service | Cost | Notes |
|---------|------|-------|
| Cloud Run | **Free** | 2M requests/month free tier |
| Gemini API | **Free** | Preview model, generous limits |
| Secret Manager | ~$0.10/month | Per secret version accessed |
| **Total** | **< $1/month** | Typical portfolio usage |

---

## Limitations

This implementation is designed for personal projects with moderate traffic:

| Limitation | Reason | Mitigation |
|------------|--------|------------|
| Client-side rate limiting | Can be bypassed | Server-side limits in roadmap |
| No user auth | Public by design | CORS + prompt guards |
| Pattern-based injection defense | Not ML-based | Covers common attacks |
| 500 char input limit | Cost control | Sufficient for questions |

For enterprise use, consider adding Cloud Armor, OAuth, and advanced logging.

---

## Roadmap

- [ ] Server-side rate limiting (IP-based)
- [ ] Conversation export
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Custom persona configuration
- [ ] Webhook integrations

---

## Related Documentation

<div class="grid cards" markdown>

-   [:octicons-shield-24: Security](../security/chat-security.md)

    Defense-in-depth model, threat analysis, testing procedures

-   [:octicons-cpu-24: Architecture](architecture.md)

    MVVM pattern, file structure, component details

-   [:octicons-rocket-24: Deployment](deployment.md)

    Cloud Run setup, Secret Manager, CI/CD

-   [:octicons-plug-24: Integration](integration.md)

    Plug-and-play guide for other sites

</div>

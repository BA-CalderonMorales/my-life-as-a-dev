---
title: AI Features
description: AI-powered features on this documentation site, including the chat widget.
tags:
  - AI
  - Cloud
  - JavaScript
comments: true
---

# AI Features

AI-powered features that enhance the documentation experience, built with modern cloud services and a focus on user privacy.

<div class="grid cards" markdown>

-   :material-chat:{ .lg .middle } **Chat Widget**

    ---

    A Claude Docs-inspired AI chat widget that provides instant, conversational answers about the site content.

    [:octicons-arrow-right-24: Chat Widget Overview](chat_widget.md)

-   :material-puzzle:{ .lg .middle } **Architecture**

    ---

    MVVM frontend pattern with modular backend. Google ADK multi-agent orchestration with session memory.

    [:octicons-arrow-right-24: Architecture Guide](architecture.md)

-   :material-rocket-launch:{ .lg .middle } **Deployment**

    ---

    Deploy to Google Cloud Run with uv for fast builds. Modular agent structure for easy customization.

    [:octicons-arrow-right-24: Deployment Guide](deployment.md)

-   :material-power-plug:{ .lg .middle } **Integration**

    ---

    Plug-and-play guide for adding the chat widget to your own Zensical or MkDocs Material site.

    [:octicons-arrow-right-24: Integration Guide](integration.md)

</div>

---

## Current AI Features

### Chat Widget

The primary AI feature is an interactive chat widget that:

- **Answers questions** about site content, navigation, and projects
- **Remembers context** within a conversation session
- **Works on all devices** with responsive mobile/desktop layouts
- **Respects privacy** with no conversation logging

**Status**: Production-ready and deployed (v3.0)

**Technology Stack**:

| Layer | Technology |
|-------|------------|
| Frontend | JavaScript MVVM, DOM injection |
| Backend | Go HTTP server on Cloud Run |
| AI Model | Google Gemini 2.0 Flash |
| Orchestration | Multi-agent with function calling |
| Security | Rate limiting, CORS, prompt injection detection |

---

## Roadmap

Planned AI features:

- [ ] **Smart Search** - AI-enhanced search with semantic understanding
- [ ] **Content Summaries** - Auto-generated page summaries
- [ ] **Code Explanations** - Inline explanations for code snippets
- [ ] **Multi-language Support** - Chat in multiple languages

---

## Related

- [Security Posture](../security/index.md) - Security practices for AI features
- [Zensical](../zensical/index.md) - The static site generator powering this site

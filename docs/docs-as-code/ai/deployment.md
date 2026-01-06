---
title: Deployment Guide
description: Deploy the AI chat widget backend to Google Cloud Run with Google ADK multi-agent architecture.
---

# Deployment Guide

This guide walks through deploying the chat widget backend to Google Cloud Run using the modular v3.0 architecture with Google ADK (Agent Development Kit).

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- Basic Python knowledge

---

## Architecture Overview

```text
+-------------------------------------------------------------+
|  Your Static Site (GitHub Pages, Netlify, etc.)             |
|  -- Chat Widget JavaScript                                  |
+-------------------------------------------------------------+
                              |
                              | HTTPS POST /
                              v
+-------------------------------------------------------------+
|  Cloud Run (agent-chat-proxy)                               |
|  +-- Flask application with rate limiting                   |
|  +-- Google ADK multi-agent orchestration                   |
|  +-- Session memory for conversation continuity             |
|  +-- Security: CORS, prompt injection detection             |
|                             |                               |
|                             | Delegates to sub-agents       |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |  Agent Registry                                       |  |
|  |  +-- site_about          - General site questions     |  |
|  |  +-- who_is_brandon      - About the author           |  |
|  |  +-- page_context        - Page-specific help         |  |
|  |  +-- project_info        - Project details            |  |
|  |  +-- resume_skills       - Career/skills info         |  |
|  |  +-- docs_navigation     - Site navigation            |  |
|  |  +-- learning_coach      - Algorithm learning         |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             | Each agent has:               |
|                             | - Google Search sub-agent     |
|                             | - URL Context sub-agent       |
+-------------------------------------------------------------+
                              |
                              | API request
                              v
+-------------------------------------------------------------+
|  Google AI (Gemini API via ADK)                             |
|  -- Gemini 2.5 Flash model                                  |
+-------------------------------------------------------------+
```

---

## Project Structure

The v3.0 architecture uses a modular pattern for maintainability:

```
agent-chat-proxy/
+-- app/                          # Flask application
|   +-- __init__.py
|   +-- main.py                  # Entry point, app factory
|   +-- routes/                  # HTTP endpoints
|   |   +-- chat.py              # Main chat endpoint
|   |   +-- health.py            # Health checks
|   +-- security/                # Security layer
|   |   +-- cors.py              # CORS configuration
|   |   +-- injection.py         # Prompt injection detection
|   |   +-- rate_limit.py        # Rate limiting
|   |   +-- safety.py            # ADK safety settings
|   +-- session/                 # Session management
|       +-- memory.py            # Conversation memory
|
+-- agents/                       # Agent definitions
|   +-- __init__.py              # Agent registry exports
|   +-- base.py                  # Base agent class
|   +-- registry.py              # Agent registration
|   +-- sub_agents/              # Individual agents
|       +-- site_about.py
|       +-- who_is_brandon.py
|       +-- ...
|
+-- prompts/                      # Static prompt files
|   +-- root.txt                 # Root orchestrator
|   +-- site_about.txt
|   +-- ...
|
+-- config/                       # Configuration
|   +-- settings.py              # Environment settings
|   +-- models.py                # Model configurations
|
+-- Dockerfile                    # Container config (uses uv)
+-- requirements.txt
+-- deploy.sh                     # Deployment script
+-- pyproject.toml
```

---

## Step 1: Create the Backend

### Option A: Clone the Template

```bash
# Clone the reference implementation
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev
cd my-life-as-a-dev/cloud/agent-chat-proxy

# Copy to your own directory
cp -r . ~/my-chat-proxy
cd ~/my-chat-proxy
```

### Option B: Create from Scratch

Create the directory structure above. Key files:

#### config/settings.py

```python
"""Application settings loaded from environment."""
import os
from dataclasses import dataclass, field
from typing import List

@dataclass
class Settings:
    gcp_project: str = field(
        default_factory=lambda: os.environ.get('GCP_PROJECT', 'your-project-id')
    )
    port: int = field(
        default_factory=lambda: int(os.environ.get('PORT', 8080))
    )
    
    # CORS - add your domains here
    allowed_origins_static: List[str] = field(default_factory=lambda: [
        'https://your-domain.github.io',
        'http://localhost:8001',
        'http://localhost:8000',
    ])
    
    # Codespaces pattern for dynamic CORS
    codespaces_pattern: str = r'https://.*-800[01]\.app\.github\.dev$'
    
    @property
    def prompts_dir(self) -> str:
        import pathlib
        return str(pathlib.Path(__file__).parent.parent / 'prompts')
    
    def get_prompt(self, name: str) -> str:
        import pathlib
        prompt_path = pathlib.Path(self.prompts_dir) / f'{name}.txt'
        return prompt_path.read_text().strip()

settings = Settings()
```

#### agents/base.py

```python
"""Base agent class for all sub-agents."""
from abc import ABC, abstractmethod
from google.adk.agents import LlmAgent
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context
from config.settings import settings

def create_search_agent(name_prefix: str) -> LlmAgent:
    return LlmAgent(
        name=f'{name_prefix}_google_search_agent',
        model='gemini-2.5-flash',
        description='Agent specialized in performing Google searches.',
        instruction='Use GoogleSearchTool to find information.',
        tools=[GoogleSearchTool()],
    )

def create_url_context_agent(name_prefix: str) -> LlmAgent:
    return LlmAgent(
        name=f'{name_prefix}_url_context_agent',
        model='gemini-2.5-flash',
        description='Agent specialized in fetching URL content.',
        instruction='Use UrlContextTool to retrieve content from URLs.',
        tools=[url_context],
    )

class BaseAgent(ABC):
    @property
    @abstractmethod
    def name(self) -> str: pass
    
    @property
    @abstractmethod
    def description(self) -> str: pass
    
    @property
    @abstractmethod
    def prompt_file(self) -> str: pass
    
    def get_instruction(self) -> str:
        return settings.get_prompt(self.prompt_file)
    
    def build(self) -> LlmAgent:
        return LlmAgent(
            name=self.name,
            model='gemini-2.5-flash',
            description=self.description,
            instruction=self.get_instruction(),
            tools=[
                agent_tool.AgentTool(agent=create_search_agent(self.name)),
                agent_tool.AgentTool(agent=create_url_context_agent(self.name)),
            ],
        )
```

#### Dockerfile (uses uv for fast builds)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv for fast dependency installation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "--timeout", "120", "app.main:app"]
```

#### requirements.txt

```
flask>=3.0.0
gunicorn>=21.0.0
google-adk>=0.3.0
google-genai>=0.5.0
google-cloud-secret-manager>=2.20.0
python-dotenv>=1.0.0
```

---

## Step 2: Configure Your Agents

### Create Prompt Files

Each agent needs a prompt file in prompts/. Example:

```text
# prompts/site_about.txt

You help visitors understand what this site is about.

This is [Your Name]'s personal documentation hub.

Key themes:
- [Theme 1]
- [Theme 2]

When someone asks what the site is about, share these highlights.
Keep it conversational and welcoming.
```

### Create Agent Modules

```python
# agents/sub_agents/site_about.py
from agents.base import BaseAgent

class SiteAboutAgent(BaseAgent):
    @property
    def name(self) -> str:
        return 'site_about'
    
    @property
    def description(self) -> str:
        return 'Handles questions about what this site is.'
    
    @property
    def prompt_file(self) -> str:
        return 'site_about'
```

### Register in Registry

```python
# agents/registry.py
from agents.sub_agents import SiteAboutAgent, YourOtherAgent

class AgentRegistry:
    def _load_agents(self):
        agent_classes = [SiteAboutAgent, YourOtherAgent]
        for cls in agent_classes:
            agent = cls()
            self._agents[agent.name] = agent
```

---

## Step 3: Set Up Google Cloud

### Enable APIs

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
    run.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com
```

### Create Secret for API Key

```bash
# Create secret with your Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | \
    gcloud secrets create gemini-api-key --data-file=-

# Grant Cloud Run access
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) \
    --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

---

## Step 4: Deploy

### Using the Deploy Script

```bash
# Make executable
chmod +x deploy.sh

# Dry run first
./deploy.sh --dry-run

# Full deploy
./deploy.sh
```

### Manual Deploy

```bash
gcloud run deploy agent-chat-proxy \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 120s \
    --min-instances 0 \
    --max-instances 10 \
    --set-secrets="GOOGLE_API_KEY=gemini-api-key:latest" \
    --set-env-vars="GCP_PROJECT=YOUR_PROJECT_ID"
```

---

## Step 5: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe agent-chat-proxy \
    --region=us-central1 \
    --format='value(status.url)')

# Test health
curl $SERVICE_URL/health
# Expected: {"status":"healthy","version":"3.0.0-adk"}

# Test chat
curl -X POST $SERVICE_URL/ \
    -H 'Content-Type: application/json' \
    -H 'Origin: https://your-domain.github.io' \
    -d '{"question":"What is this site about?"}'
```

---

## Security Features

The v3.0 architecture includes multiple security layers:

| Feature | Description |
|---------|-------------|
| **CORS** | Only approved origins can make requests |
| **Rate Limiting** | 30 req/min per IP, 1000 req/min global |
| **Burst Protection** | Max 10 requests in 5 seconds |
| **Prompt Injection** | Blocks manipulation attempts |
| **Safety Settings** | Google ADK harm category filters |
| **DDoS Protection** | Cloud Run infrastructure-level |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1767693633
```

---

## Adding New Agents

1. Create prompt: prompts/my_agent.txt
2. Create module: agents/sub_agents/my_agent.py
3. Register in agents/sub_agents/__init__.py
4. Add to agents/registry.py
5. Deploy: ./deploy.sh

See [Update Agent Flows](../../../.github/skills/update-agent-flows.md) for details.

---

## Cost Optimization

| Setting | Value | Purpose |
|---------|-------|---------|
| min-instances | 0 | Scale to zero when idle |
| max-instances | 10 | Prevent runaway costs |
| memory | 1Gi | Sufficient for ADK agents |
| CPU | 1 | Good balance |
| timeout | 120s | Allow complex agent chains |

Estimated cost: Free tier covers ~2M requests/month.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Add origin to allowed_origins_static |
| Prompt file not found | Check filename matches prompt_file property |
| Rate limit exceeded | Wait or adjust limits in rate_limit.py |
| Cold start slow | Consider min-instances=1 |
| ADK import error | Verify google-adk in requirements.txt |

### View Logs

```bash
gcloud logging read \
    "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy" \
    --limit 20 \
    --project=YOUR_PROJECT_ID
```

---

## Related Documentation

- [Chat Widget Overview](chat_widget.md)
- [Architecture Guide](architecture.md)
- [Integration Guide](integration.md)
- [Security Documentation](../security/chat-security.md)

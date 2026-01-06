# Update Agent Flows

How to add, modify, or update the ADK-based agent flows for the portfolio chat widget.

## Overview

The chat widget uses Google ADK (Agent Development Kit) with a modular multi-agent architecture deployed to Cloud Run. The v3.0 architecture separates prompts, agents, and configuration for easy maintenance.

## Architecture

```
cloud/agent-chat-proxy/
├── app/                    # Flask application
├── agents/                 # Agent definitions
│   ├── base.py            # Base agent class
│   ├── registry.py        # Agent registry
│   └── sub_agents/        # Individual agent modules
├── prompts/               # Static prompt files (.txt)
├── config/                # Settings and model config
└── tests/                 # Test suite
```

### Agent Hierarchy

```
root_agent (portfolio_assistant)
├── site_about            - General site questions
├── who_is_brandon        - About Brandon
├── page_context          - Page-specific context
├── project_info          - Project details
├── resume_skills         - Career/skills info
├── docs_navigation       - Site navigation help
└── learning_coach        - Algorithm learning help

Each agent has sub-agents:
├── {name}_google_search_agent   - Web search
└── {name}_url_context_agent     - URL fetching
```

## File Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| Prompts | `cloud/agent-chat-proxy/prompts/*.txt` | Agent instructions (text files) |
| Agent modules | `cloud/agent-chat-proxy/agents/sub_agents/` | Agent class definitions |
| Registry | `cloud/agent-chat-proxy/agents/registry.py` | Agent registration |
| Flask app | `cloud/agent-chat-proxy/app/main.py` | HTTP handling |
| Security | `cloud/agent-chat-proxy/app/security/` | CORS, injection detection, safety |
| Sessions | `cloud/agent-chat-proxy/app/session/` | Conversation memory |
| Config | `cloud/agent-chat-proxy/config/settings.py` | Environment settings |

## Adding a New Agent

### 1. Create the Prompt File

Create `prompts/my_new_agent.txt`:

```text
You help users with [specific topic].

Key responsibilities:
- [What this agent handles]
- [Key information to include]

Guidelines:
- Be conversational and helpful
- Include relevant links
- Guide users to explore further

Example good response:
[Provide an example]
```

### 2. Create the Agent Module

Create `agents/sub_agents/my_new_agent.py`:

```python
"""
My New Agent - Handles [topic].
"""
from agents.base import BaseAgent


class MyNewAgent(BaseAgent):
    """Agent that handles [topic]."""
    
    @property
    def name(self) -> str:
        return 'my_new_agent'  # Must match prompt filename
    
    @property
    def description(self) -> str:
        return 'Answers questions about [topic].'
    
    @property
    def prompt_file(self) -> str:
        return 'my_new_agent'  # Without .txt
```

### 3. Register the Agent

Update `agents/sub_agents/__init__.py`:

```python
from .my_new_agent import MyNewAgent

__all__ = [
    # ... existing agents ...
    'MyNewAgent',
]
```

Update `agents/registry.py`:

```python
from agents.sub_agents import (
    # ... existing imports ...
    MyNewAgent,
)

agent_classes: List[Type[BaseAgent]] = [
    # ... existing agents ...
    MyNewAgent,
]
```

### 4. Update Root Prompt (Optional)

Add to `prompts/root.txt`:

```text
- my_new_agent: Questions about [topic]
```

### 5. Deploy

```bash
cd cloud/agent-chat-proxy && ./deploy.sh
```

## Modifying Existing Agents

### Update Prompt Only

Edit the corresponding file in `prompts/`. No code changes needed.

```bash
vim prompts/who_is_brandon.txt
./deploy.sh
```

### Update Agent Behavior

Edit the agent module in `agents/sub_agents/`:

```python
# Disable search for this agent
@property
def include_search(self) -> bool:
    return False

# Use more powerful model
@property
def model(self) -> str:
    return 'pro'  # gemini-2.0-pro
```

## Naming Rules

Agent names must:
- Start with a letter or underscore
- Contain only: `a-z`, `A-Z`, `0-9`, `_`, `.`, `:`, `-`
- Be 64 characters or fewer
- **No apostrophes, spaces, or special characters**

**Valid**: `who_is_brandon`, `project_info`, `my_agent_v2`
**Invalid**: `what's_this`, `who is brandon`, `agent#1`

## Deployment Commands

### Dry Run

```bash
cd cloud/agent-chat-proxy && ./deploy.sh --dry-run
```

### Full Deploy

```bash
cd cloud/agent-chat-proxy && ./deploy.sh
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
  --set-secrets="GOOGLE_API_KEY=gemini-api-key:latest" \
  --set-env-vars "GCP_PROJECT=my-life-as-a-dev" \
  --project=my-life-as-a-dev
```

## Testing

### Local Testing

```bash
# Set up environment
cd cloud/agent-chat-proxy
cp .env.example .env
# Edit .env with your API key

# Run locally
python -m app.main

# Test health
curl http://localhost:8080/health

# Test chat
curl -X POST http://localhost:8080/ \
  -H 'Content-Type: application/json' \
  -d '{"question":"Who is Brandon?"}'
```

### Run Tests

```bash
cd cloud/agent-chat-proxy
pytest tests/
```

### Production Testing

```bash
# Get your service URL first
SERVICE_URL=$(gcloud run services describe agent-chat-proxy --region=us-central1 --format='value(status.url)')

# Health check
curl $SERVICE_URL/health
# Expected: {"status":"healthy","version":"3.0.0-adk"}

# Chat test
curl -s -X POST $SERVICE_URL/ \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://ba-calderonmorales.github.io' \
  -d '{"question":"Who is Brandon?"}'
```

## Viewing Logs

```bash
# Recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy" \
  --limit 20 \
  --format "value(textPayload)" \
  --project=my-life-as-a-dev

# Error logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy AND severity>=ERROR" \
  --limit 10 \
  --project=my-life-as-a-dev
```

## Troubleshooting

### "Prompt file not found"

Ensure the prompt file exists and name matches the `prompt_file` property.

### "Invalid function name" Error

Agent name contains invalid characters. Use only alphanumeric and underscores.

### "Internal error" Response

Check Cloud Run logs. Common causes:
- Missing API key in Secret Manager
- Invalid agent configuration
- ADK import errors

### CORS Errors

Add origin to `config/settings.py`:

```python
allowed_origins_static: List[str] = field(default_factory=lambda: [
    'https://ba-calderonmorales.github.io',
    'https://your-new-domain.com',  # Add here
    ...
])
```

## Current Agents

| Agent | Purpose | Triggered By |
|-------|---------|--------------|
| `site_about` | General site info | "What is this site?" |
| `who_is_brandon` | Brandon's bio + links | "Who is Brandon?" |
| `page_context` | Page-specific context | "What is this page?" + URL |
| `project_info` | Project details | Project questions |
| `resume_skills` | Career/skills info | Work experience questions |
| `docs_navigation` | Site navigation | "Where can I find...?" |
| `learning_coach` | Algorithm learning | Algorithm/interview prep |

## Service URLs

> **Security Note**: The Cloud Run URL should be configured via environment variables in frontend code, not hardcoded. Cloud Run provides DDoS protection, and our CORS policy restricts which origins can make requests.

- **Cloud Run**: Check Cloud Console or `gcloud run services describe agent-chat-proxy --region=us-central1`
- **Cloud Console**: https://console.cloud.google.com/run?project=my-life-as-a-dev
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=my-life-as-a-dev

## Related Documentation

- [Architecture](../../cloud/agent-chat-proxy/docs/architecture.md) - Full architecture details
- [Adding Agents](../../cloud/agent-chat-proxy/docs/adding-agents.md) - Detailed guide
- [AI Security](ai-security.md) - Security implementation

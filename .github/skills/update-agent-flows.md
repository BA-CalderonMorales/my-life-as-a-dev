# Update Agent Flows

How to add, modify, or update the ADK-based agent flows for the portfolio chat widget.

## Overview

The chat widget uses Google ADK (Agent Development Kit) with a multi-agent architecture deployed to Cloud Run. Agents are defined in `~/agent-chat-proxy/agents/__init__.py` and can be updated without changing the main Flask application.

## Architecture

```
root_agent (portfolio_assistant)
├── whats_this_site_about      - General site questions
├── who_is_brandon             - About Brandon
├── what_is_this_specific_page_about - Page-specific context
└── what_is_this_project_about - Project inquiries

Each agent has sub-agents:
├── {prefix}_google_search_agent  - Web search capability
└── {prefix}_url_context_agent    - URL content fetching
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Agent definitions | `~/agent-chat-proxy/agents/__init__.py` | All agent configurations |
| Flask app | `~/agent-chat-proxy/main.py` | HTTP handling, CORS, security |
| Dependencies | `~/agent-chat-proxy/requirements.txt` | Python packages |
| Container | `~/agent-chat-proxy/Dockerfile` | Cloud Run container config |
| Deploy script | `~/agent-chat-proxy/deploy.sh` | One-command deployment |

## Adding a New Agent

### 1. Create Helper Sub-Agents

```python
# In ~/agent-chat-proxy/agents/__init__.py

_my_agent_search = create_search_agent('my_agent')
_my_agent_url = create_url_context_agent('my_agent')
```

### 2. Define the Agent

```python
MY_AGENT_INSTRUCTION = """Your instruction text here.

Be specific about:
- What questions this agent handles
- How it should respond
- Example good/bad responses
- Links to include
"""

my_new_agent = LlmAgent(
    name='my_new_agent',  # alphanumeric + underscores only!
    model='gemini-2.5-flash',
    description='Brief description for agent routing.',
    sub_agents=[],
    instruction=MY_AGENT_INSTRUCTION,
    tools=[
        agent_tool.AgentTool(agent=_my_agent_search),
        agent_tool.AgentTool(agent=_my_agent_url),
    ],
)
```

### 3. Register with Root Agent

Add to the `root_agent` sub_agents list:

```python
root_agent = LlmAgent(
    name='portfolio_assistant',
    model='gemini-2.5-flash',
    description='Help with providing a succinct response to user inquiries about my site.',
    sub_agents=[
        whats_this_site_about,
        who_is_brandon,
        what_is_this_specific_page_about,
        what_is_this_project_about,
        my_new_agent,  # Add here
    ],
    instruction=ROOT_AGENT_INSTRUCTION,
    tools=[...],
)
```

### 4. Export the Agent

Add to `__all__`:

```python
__all__ = [
    'root_agent',
    'whats_this_site_about',
    'who_is_brandon',
    'what_is_this_specific_page_about',
    'what_is_this_project_about',
    'my_new_agent',  # Add here
    'create_search_agent',
    'create_url_context_agent',
]
```

### 5. Deploy

```bash
cd ~/agent-chat-proxy && ./deploy.sh
```

## Naming Rules

Agent names are converted to function declarations. They must:

- Start with a letter or underscore
- Contain only: `a-z`, `A-Z`, `0-9`, `_`, `.`, `:`, `-`
- Be 64 characters or less
- **No apostrophes, spaces, or special characters**

**Good**: `who_is_brandon`, `project_about_agent`
**Bad**: `What's_this_about`, `who is brandon`

## Deployment Commands

### Dry Run (Preview)

```bash
cd ~/agent-chat-proxy && ./deploy.sh --dry-run
```

### Full Deploy

```bash
cd ~/agent-chat-proxy && ./deploy.sh
```

### Manual Deploy (if script fails)

```bash
cd ~/agent-chat-proxy
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

### Health Check

```bash
curl https://agent-chat-proxy-882389009262.us-central1.run.app/health
# Expected: {"status":"healthy","version":"2.0.0-adk"}
```

### Chat Test

```bash
curl -s -X POST https://agent-chat-proxy-882389009262.us-central1.run.app/ \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://ba-calderonmorales.github.io' \
  -d '{"question":"Who is Brandon?"}'
```

### With Page Context

```bash
curl -s -X POST https://agent-chat-proxy-882389009262.us-central1.run.app/ \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://ba-calderonmorales.github.io' \
  -d '{"question":"What is this page about?", "page_url":"https://ba-calderonmorales.github.io/my-life-as-a-dev/learning/"}'
```

## Viewing Logs

### Recent Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy" \
  --limit 20 \
  --format "value(textPayload)" \
  --project=my-life-as-a-dev
```

### Error Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy AND severity>=ERROR" \
  --limit 10 \
  --format "value(textPayload)" \
  --project=my-life-as-a-dev
```

## Troubleshooting

### "Invalid function name" Error

Agent names contain invalid characters. Fix by using only alphanumeric and underscores.

### "Internal error" Response

Check Cloud Run logs for the stack trace. Common causes:
- Missing API key in Secret Manager
- Invalid agent configuration
- ADK import errors

### CORS Errors

Add the origin to `allowed_origins` in `main.py`:

```python
allowed_origins = [
    'https://ba-calderonmorales.github.io',
    'http://localhost:8001',
    'http://localhost:8000',
    # Add new origins here
]
```

### Timeout Errors

The default timeout is 120s. For complex agent chains, increase in deploy command:

```bash
--timeout 180s
```

## Current Agents

| Agent | Purpose | Triggered By |
|-------|---------|--------------|
| `whats_this_site_about` | General site info | "What is this site?" |
| `who_is_brandon` | Brandon's bio + links | "Who is Brandon?" |
| `what_is_this_specific_page_about` | Page-specific context | "What is this page?" + URL |
| `what_is_this_project_about` | Project details + contributors | Project questions |

## Service URLs

- **Cloud Run**: https://agent-chat-proxy-882389009262.us-central1.run.app
- **Cloud Console**: https://console.cloud.google.com/run?project=my-life-as-a-dev
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=my-life-as-a-dev

## Related Skills

- [AI Security](.github/skills/ai-security.md) - Security implementation details
- [Build and Test](.github/skills/build-and-test.md) - Local testing

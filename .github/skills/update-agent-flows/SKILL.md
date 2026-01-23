# Update Agent Flows

How to add, modify, or update the ADK-based agent flows for the portfolio chat widget.

## Overview

The chat widget uses Google ADK (Agent Development Kit) with a modular multi-agent architecture deployed to Cloud Run. The v3.0 architecture (Go implementation) separates prompts, agents, and configuration for easy maintenance.

## Architecture

```
cloud/agent-chat-proxy-go/
├── cmd/server/             # Main entry point: main.go
├── internal/
│   ├── adk/               # Agent Development Kit (Orchestrator)
│   ├── agents/            # Agent definitions & Registry
│   │   ├── registry.go    # Agent registry
│   │   └── types.go       # Agent struct definition
│   ├── api/               # HTTP handlers
│   ├── config/            # Configuration
│   ├── prompts/           # Static prompt files (.txt)
│   └── security/          # Security (CORS, Rate Limiting)
├── go.mod                 # Go dependencies
└── Dockerfile             # Container definition
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
```

## File Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| Prompts | `internal/prompts/*.txt` | Agent instructions (text files) |
| Registry | `internal/agents/registry.go` | Agent registration |
| HTTP Handlers | `internal/api/chat.go` | HTTP handling logic |
| Config | `internal/config/config.go` | Environment settings |

## Adding a New Agent

### 1. Create the Prompt File

Create `internal/prompts/my_new_agent.txt`:

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

### 2. Register the Agent

Update `internal/agents/registry.go`:

Add a new entry to the `definitions` slice in the `loadAgents` function:

```go
func (r *Registry) loadAgents() {
    definitions := []Agent{
        // ... existing agents ...
        {
            Name:        "my_new_agent", 
            Description: "Answers questions about [topic]", 
            PromptFile:  "my_new_agent.txt",
        },
    }
    // ...
}
```

### 3. Update Root Prompt (Optional)

Add to `internal/prompts/root.txt` to include the new agent in the routing logic:

```text
- my_new_agent: Questions about [topic]
```

### 4. Deploy

```bash
cd cloud/agent-chat-proxy-go && ./deploy.sh
```

## Modifying Existing Agents

### Update Prompt Only

Edit the corresponding file in `internal/prompts/`. No code changes needed.

```bash
vim internal/prompts/who_is_brandon.txt
./deploy.sh
```

## Naming Rules

Agent names must:
- Start with a letter or underscore
- Contain only: `a-z`, `A-Z`, `0-9`, `_`
- Match the filename of the prompt (without extension) for consistency

## Deployment Commands

### Manual Deploy

```bash
# From the root of the Go service
gcloud run deploy agent-chat-proxy \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_API_KEY=gemini-api-key:latest" \
  --project=YOUR_PROJECT_ID
```

## Testing

### Local Testing

```bash
# Run locally
go run cmd/server/main.go

# Test health
curl http://localhost:8080/health

# Test chat
curl -X POST http://localhost:8080/ \
  -H 'Content-Type: application/json' \
  -d '{"question":"Who is Brandon?"}'
```

### Production Testing

```bash
# Get your service URL first
SERVICE_URL=$(gcloud run services describe agent-chat-proxy --region=us-central1 --format='value(status.url)' --project=YOUR_PROJECT_ID)

# Health check
curl $SERVICE_URL/health

# Chat test
curl -s -X POST $SERVICE_URL/ \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://username.github.io' \
  -d '{"question":"Who is Brandon?"}'
```

## Viewing Logs

```bash
# Recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy" \
  --limit 20 \
  --format "value(textPayload)" \
  --project=YOUR_PROJECT_ID

# Error logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-chat-proxy AND severity>=ERROR" \
  --limit 10 \
  --project=YOUR_PROJECT_ID
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
    'https://username.github.io',
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
- **Cloud Console**: https://console.cloud.google.com/run?project=YOUR_PROJECT_ID
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=YOUR_PROJECT_ID

## Related Documentation

- [Retrieve Cloud Source](retrieve-cloud-source.md) - How to get the source code if not available locally
- [AI Security](ai-security.md) - Security implementation


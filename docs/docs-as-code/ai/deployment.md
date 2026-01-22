---
title: Deployment Guide
description: Deploy the AI chat widget backend to Google Cloud Run with multi-agent architecture.
comments: true
---

# Deployment Guide

This guide walks through deploying the chat widget backend to Google Cloud Run using a modular multi-agent architecture.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- Go 1.22+ (for local development)

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
|  +-- Go HTTP server with rate limiting                      |
|  +-- Multi-agent orchestration via function calling         |
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
+-------------------------------------------------------------+
                              |
                              | API request
                              v
+-------------------------------------------------------------+
|  Google AI (Gemini API)                                     |
|  -- Gemini 2.0 Flash model                                  |
+-------------------------------------------------------------+
```

---

## Project Structure

The backend uses a modular Go architecture for maintainability:

```
agent-chat-proxy/
+-- cmd/                          # Application entrypoints
|   +-- server/
|       +-- main.go              # Entry point
|
+-- internal/                     # Private application code
|   +-- api/                     # HTTP handlers
|   |   +-- chat.go              # Main chat endpoint
|   |   +-- health.go            # Health checks
|   +-- adk/                     # AI/Agent orchestration
|   |   +-- client.go            # Gemini client setup
|   |   +-- orchestrator.go      # Multi-agent routing
|   |   +-- executor.go          # Sub-agent execution
|   +-- agents/                  # Agent definitions
|   |   +-- registry.go          # Agent registration
|   |   +-- types.go             # Agent types
|   +-- prompts/                 # Static prompt files
|   |   +-- root.txt             # Root orchestrator
|   |   +-- site_about.txt
|   |   +-- ...
|   +-- config/                  # Configuration
|   |   +-- config.go            # Environment settings
|   +-- security/                # Security layer
|   |   +-- cors.go              # CORS configuration
|   |   +-- injection.go         # Prompt injection detection
|   |   +-- rate_limit.go        # Rate limiting
|   +-- session/                 # Session management
|       +-- manager.go           # Conversation memory
|
+-- Dockerfile                    # Container config
+-- go.mod                        # Go module definition
+-- go.sum                        # Dependency checksums
+-- deploy.sh                     # Deployment script
```

---

## Step 1: Create the Backend

### Option A: Use Your Own Implementation

Create a Go HTTP service that:

1. Accepts POST requests with `{"question": "...", "session_id": "..."}`
2. Routes to appropriate sub-agents via function calling
3. Returns `{"answer": "...", "session_id": "..."}`

### Option B: Create from Scratch

Create the directory structure above. Key files:

#### internal/config/config.go

```go
package config

import (
    "os"
    "time"
)

// Config holds all application configuration
type Config struct {
    Port             string
    Environment      string
    GoogleAPIKey     string
    CurrentModel     string
    MaxMessageLength int
    SessionTTL       time.Duration
    AllowedOrigins   []string
}

// Load creates a Config from environment variables
func Load() *Config {
    return &Config{
        Port:             getEnv("PORT", "8080"),
        Environment:      getEnv("ENV", "development"),
        GoogleAPIKey:     os.Getenv("GOOGLE_API_KEY"),
        CurrentModel:     getEnv("MODEL_ID", "gemini-2.0-flash"),
        MaxMessageLength: 2000,
        SessionTTL:       30 * time.Minute,
        AllowedOrigins: []string{
            "https://your-username.github.io",
            "http://localhost:8001",
        },
    }
}

func getEnv(key, fallback string) string {
    if value, ok := os.LookupEnv(key); ok {
        return value
    }
    return fallback
}
```

#### internal/agents/types.go

```go
package agents

// Agent represents a distinct capability or persona within the system
type Agent struct {
    Name        string
    Description string
    PromptFile  string
    Instruction string // Loaded content from the prompt file
}
```

#### Dockerfile (Go multi-stage build)

```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Final stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/internal/prompts ./internal/prompts

ENV PORT=8080

EXPOSE 8080

CMD ["./server"]
```

#### go.mod

```go
module github.com/your-username/agent-chat-proxy

go 1.22

require (
    github.com/google/generative-ai-go v0.18.0
    github.com/google/uuid v1.6.0
    google.golang.org/api v0.200.0
)
```

---

## Step 2: Configure Your Agents

### Create Prompt Files

Each agent needs a prompt file in `internal/prompts/`. Example:

```text
# internal/prompts/site_about.txt

You help visitors understand what this site is about.

This is [Your Name]'s personal documentation hub.

Key themes:
- [Theme 1]
- [Theme 2]

When someone asks what the site is about, share these highlights.
Keep it conversational and welcoming.
```

### Register Agents

Agents are registered in the registry and exposed as function declarations for Gemini's function calling:

```go
// internal/agents/registry.go
package agents

type Registry struct {
    RootAgent *Agent
    Agents    map[string]*Agent
}

func NewRegistry(promptsDir string) *Registry {
    r := &Registry{
        Agents: make(map[string]*Agent),
    }
    
    // Register agents
    agents := []Agent{
        {Name: "site_about", Description: "Handles general site questions", PromptFile: "site_about"},
        {Name: "project_info", Description: "Handles project questions", PromptFile: "project_info"},
        // Add more agents...
    }
    
    for _, a := range agents {
        agent := a
        agent.Instruction = loadPrompt(promptsDir, a.PromptFile)
        r.Agents[a.Name] = &agent
    }
    
    return r
}
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

The architecture includes multiple security layers:

| Feature | Description |
|---------|-------------|
| **CORS** | Only approved origins can make requests |
| **Rate Limiting** | Configurable per-IP and global limits |
| **Burst Protection** | Prevents rapid-fire requests |
| **Prompt Injection** | Blocks manipulation attempts |
| **Safety Settings** | Gemini harm category filters |
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

1. Create prompt: `internal/prompts/my_agent.txt`
2. Register in `internal/agents/registry.go`
3. Deploy: `./deploy.sh`

See the skills documentation for details on adding agents.

---

## Cost Optimization

| Setting | Value | Purpose |
|---------|-------|---------|
| min-instances | 0 | Scale to zero when idle |
| max-instances | 10 | Prevent runaway costs |
| memory | 512Mi-1Gi | Go is memory-efficient |
| CPU | 1 | Good balance |
| timeout | 120s | Allow complex agent chains |

Estimated cost: Free tier covers ~2M requests/month. Go's fast cold starts make min-instances=0 very practical.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Add origin to allowed origins in config |
| Prompt file not found | Check filename and path in prompts directory |
| Rate limit exceeded | Wait or adjust limits in security config |
| Cold start slow | Consider min-instances=1 (less needed with Go) |

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

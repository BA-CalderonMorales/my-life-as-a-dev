# Skill: AI Features and Security

Understand and safely work with AI features in this repository.

## Overview

This repository has AI features that are enabled in the backend Go service (`agent-chat-proxy`).

## Architecture

The AI features are implemented in a standalone Go service deployed to Cloud Run. The security layer handles:
- Authorization
- Rate Limiting
- Prompt Injection Defense
- Input/Output Filtering

## Service Location

The backend code is located in `cloud/agent-chat-proxy-go/` (or `temp_backend_source/go_proxy/` during development).

## Security Requirements

Before enabling AI features in production, implement:

### 1. Authentication

The service uses Google Cloud IAM for service-to-service auth, but the public endpoint relies on API keys or Origin verification.

```go
// Authorization logic in internal/security
func (s *SecurityConfig) VerifyOrigin(origin string) bool {
    // ... check allowed origins ...
}
```

### 2. Rate Limiting

The service implements a token bucket rate limiter in `internal/security/ratelimit.go`.

```go
// Example usage in HTTP handler
limiter = security.NewRateLimiter(30, 10, 1000)

if !limiter.Check(r).Allowed {
    http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
}
```

### 3. Token Protection

**NEVER** expose API tokens in client-side code. The Gemini API key is stored in Secret Manager and injected at runtime.

```go
// Correct: Load from environment/secret
apiKey := os.Getenv("GOOGLE_API_KEY")
```

### 4. Prompt Injection Defense

The service includes active defense against prompt injection attempts in `internal/security/injection.go`.

```go
// Checks for patterns like "ignore previous instructions"
if security.IsPromptInjection(req.Question) {
    // Return a safe, generic response
    return security.GetInjectionResponse()
}
```

### 5. Input/Output Filtering

Filters are applied at the ADK layer to ensure responses remain within the "portfolio assistant" persona and do not leak system instructions.

```go
// Internal logic to block unsafe content
if security.ContainsBlockedContent(response) {
    return "I cannot answer that question."
}
```
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, prompt, re.IGNORECASE):
            raise SecurityError("Blocked prompt pattern")
    return prompt
```

## Development Use

For local development/experimentation only:

```bash
# Set required environment variables
export AI_API_KEY="your-key"
export AI_PROXY_ENABLED="true"

# Run proxy locally
python scripts/python/ai_proxy.py
```

## File Locations

| File | Purpose |
|------|---------|
| `scripts/python/ai_proxy.py` | AI proxy server |
| `mkdocs_plugins/ai_plugin.py` | MkDocs integration |

## Security Checklist

Before enabling in production:

- [ ] Authentication implemented
- [ ] Rate limiting implemented
- [ ] API tokens server-side only
- [ ] Request logging enabled
- [ ] Input filtering enabled
- [ ] Output filtering enabled
- [ ] Security review completed
- [ ] Penetration testing done

## Questions?

If you need to modify AI features, ensure you:

1. Understand the security requirements
2. Test thoroughly in development
3. Get security review before enabling in production
4. Document any changes

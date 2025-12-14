# Skill: AI Features and Security

Understand and safely work with AI features in this repository.

## Overview

This repository has AI features that are **disabled in production** but exist in the codebase:

- `scripts/python/ai_proxy.py` - AI proxy server
- `mkdocs_plugins/ai_plugin.py` - MkDocs AI plugin

## Current Status

**Production**: AI features are DISABLED.

These features exist for experimentation but require security hardening before production use.

## Security Requirements

Before enabling AI features in production, implement:

### 1. Authentication

```python
# Required: Verify user identity before AI requests
def verify_auth(request):
    token = request.headers.get("Authorization")
    if not valid_token(token):
        raise AuthenticationError("Invalid token")
```

### 2. Rate Limiting

```python
# Required: Prevent abuse
from functools import lru_cache
import time

rate_limits = {}  # user_id -> (count, window_start)

def check_rate_limit(user_id: str, max_requests: int = 100, window: int = 3600):
    now = time.time()
    count, start = rate_limits.get(user_id, (0, now))
    
    if now - start > window:
        rate_limits[user_id] = (1, now)
        return True
    
    if count >= max_requests:
        raise RateLimitError("Rate limit exceeded")
    
    rate_limits[user_id] = (count + 1, start)
    return True
```

### 3. Token Protection

**NEVER** expose API tokens in client-side code.

```python
# WRONG - Never do this
API_KEY = "sk-abc123..."  # In client-side code

# RIGHT - Server-side proxy
def call_ai_api(prompt: str) -> str:
    api_key = os.environ.get("AI_API_KEY")  # Server-side only
    # ... make request with key ...
```

### 4. Request Logging

```python
# Required: Log all AI requests for audit
import logging

logger = logging.getLogger("ai_audit")

def log_request(user_id: str, prompt: str, response: str):
    logger.info(
        "AI request",
        extra={
            "user_id": user_id,
            "prompt_hash": hashlib.sha256(prompt.encode()).hexdigest(),
            "response_length": len(response),
            "timestamp": datetime.utcnow().isoformat(),
        }
    )
```

### 5. Input/Output Filtering

```python
# Required: Filter dangerous content
BLOCKED_PATTERNS = [
    r"ignore previous instructions",
    r"reveal.*api.*key",
    # Add more patterns
]

def filter_input(prompt: str) -> str:
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

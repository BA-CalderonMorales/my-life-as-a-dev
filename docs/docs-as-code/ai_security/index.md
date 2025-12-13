---
title: AI & Security Posture
description: Requirements before enabling any AI features publicly.
---

# AI & Security Posture

- **Authentication**: No public AI endpoints without authenticated access.
- **Rate limits**: Enforce sane defaults to prevent abuse.
- **Logging & observability**: Capture usage with privacy-aware logs and alerts.
- **Content filtering**: Apply safety filters before returning AI output.
- **Token handling**: Never expose tokens in client-side code; proxy and rotate secrets.
- **Change control**: Follow the checklist in `AGENTS.md` before any public release.

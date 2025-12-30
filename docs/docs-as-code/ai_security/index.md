---
title: AI & Security Posture
description: Requirements before enabling any AI features publicly.
---

# AI & Security Posture

This section documents the security posture and implementation patterns for AI features on this site. While this is a personal project and not enterprise-grade, these practices can help guide similar implementations.

---

## Security Principles

- **Authentication**: No public AI endpoints without authenticated access or proper safeguards.
- **Rate limits**: Enforce sane defaults to prevent abuse (client-side and server-side).
- **Logging & observability**: Capture usage with privacy-aware logs and alerts.
- **Content filtering**: Apply safety filters before returning AI output.
- **Token handling**: Never expose tokens in client-side code; proxy and rotate secrets.
- **Change control**: Follow the checklist in `AGENTS.md` before any public release.

---

## Implemented Features

### AI Chat Widget

A Claude Docs-inspired chat widget providing instant answers about the site and its content. Built with security-first principles using Google Cloud Run and Gemini API.

**[Implementation Guide](chat-implementation.md)**
:   Architecture, design decisions, deployment steps, and cost estimates.

**[Security Documentation](chat-security.md)**
:   Defense-in-depth security model, testing procedures, and incident response.

**Key Technologies**

- **Backend**: Flask on Cloud Run with Secret Manager for API keys
- **AI Model**: Google Gemini 2.0 Flash (conversational responses)
- **Frontend**: JavaScript DOM injection with rate limiting and XSS prevention
- **Security**: CORS validation, prompt injection safeguards, input sanitization

**Status**: ✅ Production-ready and deployed

---

## Security Checklist

Before deploying any AI feature:

- [ ] API keys stored in Google Secret Manager (not code/env vars)
- [ ] CORS configured with explicit allowed origins
- [ ] Prompt injection safeguards implemented
- [ ] Rate limiting enabled (client and server)
- [ ] Input validation and sanitization
- [ ] XSS prevention (textContent, no innerHTML)
- [ ] Error handling without leaking sensitive info
- [ ] Monitoring and alerting configured
- [ ] Cost controls and quotas set
- [ ] Documentation written and reviewed

---

## Known Limitations

These implementations are designed for personal projects with moderate traffic:

1. **Client-side rate limiting only** - Can be bypassed by determined users
2. **No user authentication** - Services are publicly accessible
3. **Basic prompt injection defenses** - Pattern matching, not ML-based detection
4. **No DDoS protection** - Relies on Cloud Run defaults
5. **Limited context window** - 1500-2000 characters to control costs

For production enterprise use, consider:

- Cloud Armor WAF rules
- API Gateway with OAuth
- Advanced threat detection
- Cloudflare or CDN protection
- Comprehensive audit logging

---

## Cost Management

Current implementations target <$5/month:

- **Cloud Run**: Free tier covers typical usage
- **Gemini API**: Using preview model (currently free)
- **Secret Manager**: $0.10/month
- **BigQuery logs**: Optional, pay-per-query

Monitor usage via Cloud Console dashboards and set budget alerts.

---

## Resources

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Cloud Run Security](https://cloud.google.com/run/docs/securing/securing-services)

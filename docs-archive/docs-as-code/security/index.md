---
title: Security Posture
description: Security principles and practices for this documentation site and its AI features.
tags:
  - Security
  - DevOps
  - Cloud
comments: true
---

# Security Posture

Security principles, practices, and documentation for this site. While this is a personal project, these practices demonstrate enterprise-grade thinking and can guide similar implementations.

---

## Security Principles

<div class="grid cards" markdown>

-   :material-key:{ .lg .middle } **Secret Management**

    ---

    Never expose tokens in client-side code. Use Secret Manager and rotate keys regularly.

-   :material-shield-lock:{ .lg .middle } **Defense in Depth**

    ---

    Multiple security layers: CORS, rate limiting, input validation, prompt guards.

-   :material-eye:{ .lg .middle } **Observability**

    ---

    Privacy-aware logging with alerts for anomalous behavior.

-   :material-filter:{ .lg .middle } **Input Validation**

    ---

    Sanitize all inputs. Never trust client-side data.

</div>

---

## Security Documentation

### Chat Widget Security

Comprehensive defense-in-depth security model for the AI chat widget.

[:octicons-arrow-right-24: Chat Widget Security Documentation](chat-security.md)

Covers:

- Threat model and risk assessment
- Prompt injection safeguards
- CORS and origin validation
- XSS prevention techniques
- Testing procedures
- Incident response

---

## Security Checklist

Before deploying any feature with external dependencies:

### API & Secrets

- [ ] API keys stored in Google Secret Manager (not code/env vars)
- [ ] Service accounts follow principle of least privilege
- [ ] Key rotation procedures documented
- [ ] No secrets in logs or error messages

### Network & Access

- [ ] CORS configured with explicit allowed origins
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting enabled (client and server)
- [ ] Input validation and sanitization

### Application Security

- [ ] XSS prevention (textContent, no innerHTML)
- [ ] Prompt injection safeguards for AI features
- [ ] Error handling without leaking sensitive info
- [ ] Content Security Policy headers

### Operations

- [ ] Monitoring and alerting configured
- [ ] Cost controls and quotas set
- [ ] Documentation written and reviewed
- [ ] Incident response plan in place

---

## Known Limitations

These implementations are designed for personal projects with moderate traffic:

| Limitation | Risk Level | Mitigation |
|------------|------------|------------|
| Client-side rate limiting | Medium | Server-side limits in roadmap |
| No user authentication | Low | Public by design, CORS + guards |
| Pattern-based injection defense | Medium | Covers common attacks |
| No DDoS protection | Low | Cloud Run autoscaling |
| Limited context window | Low | Cost control, sufficient for Q&A |

### For Enterprise Use

Consider adding:

- Cloud Armor WAF rules
- API Gateway with OAuth
- Advanced threat detection (ML-based)
- Cloudflare or CDN protection
- Comprehensive audit logging
- SOC 2 compliance measures

---

## Cost Management

Security features are designed to be cost-effective:

| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| Cloud Run | Free | 2M requests/month free tier |
| Gemini API | Free | Preview model |
| Secret Manager | ~$0.10 | Per secret version |
| **Total** | **< $1** | Typical portfolio usage |

### Budget Alerts

```bash
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="Security Budget" \
  --budget-amount=5USD \
  --threshold-rule=percent=0.9
```

---

## Resources

### Google Cloud

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Cloud Run Security](https://cloud.google.com/run/docs/securing/securing-services)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)

### Industry Standards

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### AI-Specific

- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Gemini API Safety Settings](https://ai.google.dev/docs/safety_setting)

---

## Related

- [AI Features](../ai/index.md) - AI-powered features on this site
- [Chat Widget](../ai/chat_widget.md) - The AI chat widget implementation

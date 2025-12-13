---
title: Security
description: Fundamentals of securing applications and infrastructure.
---

# Security

Security is not a feature; it's a mindset.

---

## CIA Triad

- **Confidentiality**: Only authorized users can access data.
- **Integrity**: Data is accurate and trustworthy.
- **Availability**: Data is accessible when needed.

---

## Authentication (AuthN) vs Authorization (AuthZ)

- **AuthN**: "Who are you?" (Passwords, MFA, OAuth).
- **AuthZ**: "What are you allowed to do?" (RBAC, ABAC, ACLs).

---

## OWASP Top 10 (The Classics)

1.  **Injection**: SQL Injection, Command Injection. *Fix*: Prepared statements, input validation.
2.  **Broken Authentication**: Weak passwords, session hijacking. *Fix*: MFA, strong session management.
3.  **Sensitive Data Exposure**: Plaintext passwords, exposed keys. *Fix*: Encryption at rest/transit.
4.  **XXE (XML External Entities)**: Malicious XML. *Fix*: Disable external entities.
5.  **Broken Access Control**: User A accessing User B's data. *Fix*: Server-side checks.
6.  **Security Misconfiguration**: Default passwords, verbose error messages.
7.  **XSS (Cross-Site Scripting)**: Injecting scripts into client pages. *Fix*: CSP, output encoding.
8.  **Insecure Deserialization**: Executing code via serialized objects.
9.  **Using Components with Known Vulnerabilities**: Old libs. *Fix*: `npm audit`, Dependabot.
10. **Insufficient Logging**: Not knowing you were hacked.

---

## Cryptography Basics

### Symmetric Encryption

- Same key for encryption and decryption.
- **Fast**.
- **Algorithms**: AES, ChaCha20.
- **Problem**: Key distribution.

### Asymmetric Encryption (Public Key)

- Public key encrypts, Private key decrypts.
- **Slow**.
- **Algorithms**: RSA, ECC (Elliptic Curve).
- **Use Case**: TLS Handshake, SSH, Signing.

### Hashing

- One-way function. Cannot be reversed.
- **Use Case**: Storing passwords (with salt), Integrity checks.
- **Algorithms**: SHA-256, Argon2 (for passwords).

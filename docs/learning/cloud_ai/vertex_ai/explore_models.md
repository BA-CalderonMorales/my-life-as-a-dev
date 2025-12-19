---
title: Explore Models
description: Discover available Vertex AI generative models and their capabilities.
---

# Explore Models

This page covers the available generative AI models in Vertex AI and how to choose the right one for your use case.

[Back to Vertex AI Quickstart](index.md)

---

## Model Documentation

Visit the official documentation for the complete model catalog:

[Vertex AI Generative Models](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models)

---

## What You Can Review

The documentation covers:

- **Capabilities**: What each model can do (text, code, vision, etc.)
- **Specifications**: Context window sizes, output limits
- **Knowledge cutoff dates**: When the model's training data ends
- **Token consumption**: How tokens are counted for billing

---

## Common Model Choices

| Model | Use Case | Notes |
| --- | --- | --- |
| `gemini-1.5-flash` | Fast, general-purpose | Good balance of speed and quality |
| `gemini-1.5-pro` | Complex reasoning | Higher quality, slower |
| `gemini-1.0-pro` | Legacy support | Previous generation |

---

## Model Selection Tips

1. **Start with `gemini-1.5-flash`** for development and testing
2. **Upgrade to `gemini-1.5-pro`** when you need better quality
3. **Consider token limits** when working with long documents
4. **Check pricing** before production deployment

---

## Next Step

Continue to [Code Examples](code_examples.md) for sample code demonstrating various use cases.

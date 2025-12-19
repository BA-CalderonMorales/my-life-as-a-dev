---
title: Vertex AI Studio
description: Use Google's web-based Vertex AI Studio for rapid prototyping and code generation.
---

# Vertex AI Studio

Vertex AI Studio is Google's full-fledged ML/GenAI framework for fine-tuning models, building pipelines, and deploying at enterprise scale.

[Back to Vertex AI Quickstart](index.md)

---

## Overview

Vertex AI Studio provides:

- **Prompt Management**: Save, version, and share prompts
- **Fine Tuning**: Customize models with your own data
- **Model Monitoring**: Track performance and usage
- **Freeform & Open Chat modes**: Interactive testing

---

## Access Vertex AI Studio

Visit: [Vertex AI Studio Console](https://console.cloud.google.com/vertex-ai/studio)

---

## Getting Started

### Step 1: Select Freeform

Choose the Freeform mode for open-ended prompting.

### Step 2: Choose a Model

Select a model such as `gemini-1.5-flash`.

### Step 3: Enter Instructions

Enter your system instructions and optionally upload media files (images, audio, etc.).

### Step 4: Get Code

Click **Get Code** to retrieve sample usage code for your prompt.

---

## Setup for Code Export

When you export code from Vertex AI Studio, it may use a different package than the SDK we installed earlier.

!!! note "Package Difference"
    - **SDK approach** (this guide): Uses `google-cloud-aiplatform` with service account authentication
    - **Studio export**: Uses `google-genai` with application default credentials
    
    Both work with Vertex AI. Use the SDK approach for production; Studio exports are great for quick testing.

To use exported code from Studio, install the required package:

```bash
pip install --upgrade google-genai
```

Authenticate with your Google Cloud account:

```bash
gcloud auth application-default login
```

---

## Studio Features

| Feature | Description |
| --- | --- |
| **Freeform** | Open-ended text generation |
| **Chat** | Multi-turn conversation testing |
| **Code** | Code generation and debugging |
| **Vision** | Image understanding and analysis |

---

## When to Use Studio vs SDK

| Use Case | Recommended |
| --- | --- |
| Quick prototyping | Studio |
| Testing prompts | Studio |
| Production integration | SDK |
| Automated pipelines | SDK |
| Learning and exploration | Studio |

---

## Summary

You have completed the Vertex AI Quickstart guide. You now know how to:

1. Set up a Python environment with Anaconda
2. Create a Google Cloud project and service account
3. Connect to Vertex AI using the Python SDK
4. Use generative models for text generation
5. Configure model behavior with generation settings
6. Maintain chat context across conversations
7. Use Vertex AI Studio for rapid prototyping

---

[Back to Vertex AI Quickstart](index.md) | [Back to Cloud AI Platforms](../index.md)

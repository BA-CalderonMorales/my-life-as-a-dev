---
title: Code Examples
description: Sample code for Vertex AI queries, streaming, chat, and configuration options.
---

# Code Examples

This page provides sample code snippets for common Vertex AI use cases.

[Back to Vertex AI Quickstart](index.md)

!!! note "Prerequisites"
    These examples assume you have completed the [Connect to Vertex AI](connect_to_vertex_ai.md) setup and have initialized the SDK with `vertexai.init()`.

---

## Basic Query

Simple text generation with a generative model:

```python
from vertexai.generative_models import GenerativeModel

# Assumes vertexai.init() has been called (see Connect to Vertex AI)
model = GenerativeModel("gemini-1.5-flash")
res = model.generate_content("What is the capital of India?")
print(res.text)
```

**Response:**
```
The capital of India is New Delhi.
```

---

## Another Example

```python
res = model.generate_content("Why does the sun set appear red and orange?")
print(res.text)
```

**Response:**
```
Sunsets appear red and orange due to a phenomenon called Rayleigh scattering.
```

---

## Streaming Response

For long responses, use streaming to get output incrementally:

```python
res = model.generate_content(
    "Write a poem for me about mathematics for 5th grader",
    stream=True
)
for r in res:
    print(r.text, end="")
```

**Response:**
```
A neat poem that's lengthy and complete so the user is absolutely happy.
```

---

## Generation Configuration

Fine-tune the model's behavior with configuration options:

```python
from vertexai.generative_models import GenerationConfig

generation_config = GenerationConfig(
    temperature=0.9,
    top_p=1.0,
    top_k=32,
    candidate_count=1,
    max_output_tokens=8192,
)
res = model.generate_content(
    "Why do sunsets appear red and orange?",
    generation_config=generation_config,
)
print(res.text)
```

### Configuration Parameters

| Parameter | Description | Range |
| --- | --- | --- |
| `temperature` | Randomness of output | 0.0 - 2.0 |
| `top_p` | Nucleus sampling threshold | 0.0 - 1.0 |
| `top_k` | Top-k sampling | 1 - 40 |
| `candidate_count` | Number of responses | 1 - 8 |
| `max_output_tokens` | Maximum output length | Varies by model |

!!! tip "Temperature Guide"
    - **Lower temperature (0.0-0.3)**: More deterministic, factual responses
    - **Higher temperature (0.7-1.0)**: More creative, varied responses

---

## Chat with Memory

Maintain conversation context across multiple exchanges:

```python
chat = model.start_chat()

# Send first message
res = chat.send_message("What is 2 + 2? Give me the wrong answer.")
print(res.text)

# Send follow-up - the model remembers context
res = chat.send_message("Remember earlier answer and what is 2 + 2?")
print(res.text)

# View conversation history
print(chat.history)
```

**Response:**
```
You got me! Earlier I said 2 + 2 = 17. I'm a language model... what kind of wrong answer next?
```

---

## Next Step

Continue to [Vertex AI Studio](vertex_ai_studio.md) to learn about the web-based studio interface.

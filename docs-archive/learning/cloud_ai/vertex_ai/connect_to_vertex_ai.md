---
title: Connect to Vertex AI
description: Initialize the Vertex AI SDK and authenticate using your service account credentials.
comments: true
---

# Connect to Vertex AI

This page covers initializing the Vertex AI SDK and authenticating with your service account.

[Back to Vertex AI Quickstart](index.md)

---

## Initialize the SDK

Use the following code to connect to Vertex AI APIs:

```python
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
import vertexai

api_key_path = "path/to/your/jsonkey.json"
credentials = Credentials.from_service_account_file(
    api_key_path,
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)
PROJECT_ID = "my-gcp-course-project"
REGION = "us-central1"
vertexai.init(project=PROJECT_ID, location=REGION, credentials=credentials)
```

---

## Configuration Details

| Parameter | Description | Example |
| --- | --- | --- |
| `api_key_path` | Path to your service account JSON file | `"./vertex-ai-sa-key.json"` |
| `PROJECT_ID` | Your Google Cloud project ID | `"my-gcp-course-project"` |
| `REGION` | Google Cloud region for Vertex AI | `"us-central1"` |

---

## Available Regions

Common Vertex AI regions include:

- `us-central1` (Iowa)
- `us-east1` (South Carolina)
- `us-west1` (Oregon)
- `europe-west1` (Belgium)
- `asia-east1` (Taiwan)

See the [full region list](https://cloud.google.com/vertex-ai/docs/general/locations) for all options.

---

## Next Step

Continue to [Explore Models](explore_models.md) to learn about available generative AI models.

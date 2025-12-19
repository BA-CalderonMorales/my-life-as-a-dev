---
title: Google Cloud Setup
description: Create a Google Cloud project, service account, and download credentials for Vertex AI.
---

# Google Cloud Setup

This page covers creating a Google Cloud project, service account, and downloading your API credentials.

[Back to Vertex AI Quickstart](index.md)

---

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **New Project**
3. Name your project (e.g., `my-gcp-course-project`)
4. Click **Create**

---

## 2. Create a Service Account

1. Navigate to **IAM & Admin** > **Service Accounts**
2. Click **+ Create Service Account**
3. Configure the account:
    - **Name/ID**: `vertex-ai-sa`
4. Grant role: **Vertex AI Administrator**
5. Click **Done**

---

## 3. Download Service Account Key

1. In your service account's row, click **Manage Keys**
2. Click **Add Key** > **Create new key**
3. Select **JSON** format
4. Click **Create**
5. Download and save the JSON file alongside your notebook

!!! warning "Keep Your Key Secure"
    Never commit your service account key to version control. Add it to your `.gitignore` file.

---

## Next Step

Continue to [Connect to Vertex AI](connect_to_vertex_ai.md) to initialize the SDK and authenticate with your credentials.

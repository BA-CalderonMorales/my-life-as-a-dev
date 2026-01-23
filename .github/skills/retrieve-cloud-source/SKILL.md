# Retrieve Cloud Source

How to retrieve the latest source code from a Google Cloud Run service when the original repository is not available.

## Overview

Sometimes you may need to access the source code of a deployed service (like `agent-chat-proxy`) for debugging or migration purposes, especially if the original git repository is disconnected or lost. Cloud Build stores the source code used for builds in Google Cloud Storage (GCS).

## Prerequisites

-   `gcloud` CLI installed and authenticated.
-   Permissions to view Cloud Build history and access the GCS source bucket.

## Procedure

### 1. Identify the Build

Find the latest successful build for the service to identify the source location.

```bash
gcloud builds list --project=YOUR_PROJECT_ID --limit=5
```

Look for the build corresponding to your service (e.g., `agent-chat-proxy`). Note the `SOURCE` URI, which will look like:
`gs://<project_id>_cloudbuild/source/<timestamp>-<hash>.tgz`

### 2. Download and Extract

Use `gsutil` to copy the source archive to a temporary directory.

**Important:** Do not download this into a tracked git directory to avoid committing sensitive cloud artifacts.

```bash
# Create a temp directory (ensure this is in .gitignore)
mkdir -p temp_backend_source

# Copy the source (replace URI with the one found in step 1)
gsutil cp gs://YOUR_PROJECT_ID_cloudbuild/source/YOUR_SOURCE_URI.tgz temp_backend_source/source.tgz

# Extract and cleanup
cd temp_backend_source
tar -xzf source.tgz
rm source.tgz
```

### 3. Analyze and Cleanup

You can now analyze the code in `temp_backend_source/`. When finished, remember to remove the directory.

```bash
rm -rf temp_backend_source
```

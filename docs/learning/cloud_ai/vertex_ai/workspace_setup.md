---
title: Workspace Setup
description: Create your project folder and set up Jupyter Lab for Vertex AI development.
---

# Workspace Setup

This page covers creating your project folder and setting up Jupyter Lab for interactive development.

[Back to Vertex AI Quickstart](index.md)

---

## 1. Create a Project Folder

Create a folder for your Vertex AI work:

```console
$ mkdir ~/Desktop/gcp_vertexai
$ cd ~/Desktop/gcp_vertexai
```

---

## 2. Install Jupyter Lab (Optional)

If you prefer working in Jupyter notebooks:

```console
$ conda install jupyterlab
```

---

## 3. Start Jupyter Lab

Launch Jupyter Lab from your project folder:

```console
$ jupyter lab
```

This opens Jupyter Lab in your browser.

---

## 4. Create Your First Notebook

1. In Jupyter Lab, create a new notebook named `Vertex AI Start.ipynb`
2. Add a test cell and run:

```python
print("Hello Vertex")
```

If you see "Hello Vertex" in the output, your environment is ready.

---

## Next Step

Continue to [Google Cloud Setup](google_cloud_setup.md) to create a service account and download your credentials.

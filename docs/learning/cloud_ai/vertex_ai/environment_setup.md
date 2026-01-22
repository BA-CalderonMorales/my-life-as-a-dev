---
title: Environment Setup
description: Install Anaconda and create a Python environment for Vertex AI development.
comments: true
---

# Environment Setup

This page covers installing Anaconda and creating a clean Python environment for Vertex AI development.

[Back to Vertex AI Quickstart](index.md)

---

## 1. Install Anaconda

Download Anaconda for your OS: [https://www.anaconda.com/download/success](https://www.anaconda.com/download/success)

### Windows Installation

1. Pick **Python 3.12 - 64-Bit Graphical Installer**
2. Click **Next** then **Install for myself**
3. Choose your install location
4. Add these shortcuts:
    - Add Anaconda to PATH
    - Register Anaconda3 as default Python 3.12
5. Clear package cache upon completion

!!! info "Anaconda vs Miniconda"
    - **Anaconda** (~1 GB): Full distribution with many pre-installed packages
    - **Miniconda** (~100 MB): Minimal installer, packages installed as needed
    
    Either works for this guide. Miniconda is lighter if you prefer minimal installs.

---

## 2. Create a Python Environment

Open your terminal and run these commands:

```bash
# Activate base and create a clean env
conda activate base
conda env list
conda create --name vertexai_env python=3.9  # accept prompts
conda activate vertexai_env
```

---

## 3. Install Vertex AI Python SDK

With your environment activated, install the SDK:

```bash
pip install google-cloud-aiplatform
```

---

## Next Step

Continue to [Workspace Setup](workspace_setup.md) to create your project folder and set up Jupyter Lab.

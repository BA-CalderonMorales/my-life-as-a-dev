# Coder Templates

A collection of templates and utilities for creating consistent development environments using Coder.

## Overview

This repository contains templates and utilities for creating consistent development environments using Coder. The templates ensure that every developer gets the same environment with all necessary tools pre-configured.

## Quick Links

- [:material-github: GitHub Repository](https://github.com/BA-CalderonMorales/coder-templates)

## Key Features

- Pre-configured templates
- Team collaboration ready
- Fast environment provisioning
- Cloud deployment guides for multiple providers

## Purpose

The scripts package development environment templates into portable tar archives (`.tar`). This is a crucial step in the Coder template workflow:

1. Define the development environment in a template directory
2. Run the packaging script to create a `.tar` archive
3. Upload the generated `.tar` file to Coder as a new template
4. Coder uses this template to create consistent development environments for all team members

## Current Templates

### Terminal Jarvis Playground

A development environment for Terminal-Jarvis with Node.js and Git support.

## Usage

To package a template environment, use the appropriate script for your operating system:

```bash
# For Windows
./start.windows.sh

# For macOS
./start.mac.sh

# For Linux
./start.linux.sh
```

These scripts will create `.tar` archives containing the development environment.

## Template Structure

Each template directory contains:
- `Dockerfile`: Defines the development environment
- `main.tf`: Terraform configuration for the Coder workspace
- Additional configuration files as needed

## Cloud Deployment Models

Guides for running templates on common cloud free tiers and low-cost infrastructure:

- [Docker Desktop (Local Baseline)](https://github.com/BA-CalderonMorales/coder-templates/blob/develop/docs/deployment_models/DockerDesktop.md)
- [GCP Deployment (Always Free)](https://github.com/BA-CalderonMorales/coder-templates/blob/develop/docs/deployment_models/GCP.md)
- [AWS Deployment (Free Tier)](https://github.com/BA-CalderonMorales/coder-templates/blob/develop/docs/deployment_models/AWS.md)
- [Azure Deployment (Free/Low-Cost)](https://github.com/BA-CalderonMorales/coder-templates/blob/develop/docs/deployment_models/Azure.md)
- [Limitations & Constraints](https://github.com/BA-CalderonMorales/coder-templates/blob/develop/docs/deployment_models/limitations.md)

Each guide covers:
- Recommended instance sizes and limits
- Optional swap and resource tuning
- Cost optimization strategies

## Documentation

For comprehensive documentation, visit the [GitHub repository](https://github.com/BA-CalderonMorales/coder-templates) and explore the `docs/` directory.

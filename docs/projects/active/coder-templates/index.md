# Coder Templates

**Terraform-based workspace templates for consistent, portable development environments**

Production-ready Coder workspace templates designed for Terminal-Jarvis development. Templates use Terraform to provision containerized workspaces with pre-configured toolchains including Node.js 20, Python 3, Rust, and development utilities.

## Overview

Terraform-based workspace templates that provision complete development environments on Coder with pre-installed toolchains, observability dashboards, and persistent storage. Templates target both local Docker deployments and cloud infrastructure, with an emphasis on free-tier and low-cost options.

## Quick Links

- [:fontawesome-brands-github: GitHub Repository](https://github.com/BA-CalderonMorales/coder-templates)

## Project Status

**Implemented:**

- :material-docker: Local Docker template using Docker containers with persistent volumes
- :material-google-cloud: GCP Compute Engine template using bare VM architecture
- :material-package-variant: Multi-platform packaging scripts (Linux, macOS, Windows)
- :material-file-document-multiple: Comprehensive deployment documentation for GCP, AWS, and Azure
- :material-developer-board: Development container for contributors
- :material-chart-line: Resource monitoring and observability built into templates

**Planned:**

- Feature flags for optional components (JetBrains Gateway, resource limits)
- Multi-architecture image builds (AMD64 + ARM64) via GitHub Actions
- AWS and Azure template implementations (documentation exists, Terraform pending)
- Automated linting and validation pipeline (tflint, trivy/grype)
- Secret management patterns (dotfiles, cloud secret managers)

## Architecture

### Template Model

Each template consists of three core components:

1. **Dockerfile** - Defines the workspace runtime environment with pre-installed tools
2. **main.tf** - Terraform configuration declaring Coder resources and infrastructure
3. **README.md** - Deployment-specific setup and configuration instructions

Templates are packaged into `.tar` archives and uploaded to Coder for workspace provisioning.

### Persistence Strategy

- **Ephemeral**: Workspace container or VM (recreated on restart)
- **Persistent**: User data in `/home/coder` via Docker volumes or attached disks
- **Consequence**: Tools installed outside persistent paths must be baked into Dockerfile

### Observability

Templates include real-time dashboard metrics:


- CPU usage (container/host)
- RAM usage with percentage utilization
- Disk usage for home directory
- Load average scaled by CPU count
- Swap usage (critical for memory-constrained instances)

## Quick Start

### 1. Package Template

Run the packaging script for your platform:

```console
$ ./package.linux.sh     # Linux
$ ./package.mac.sh       # macOS
$ ./package.windows.sh   # Windows (Git Bash/WSL)

$ ./package.linux.sh local-docker   # Creates terminal-jarvis-playground-local.tar
$ ./package.linux.sh gcp            # Creates terminal-jarvis-playground-gcp.tar
$ ./package.linux.sh all            # Creates both archives
```

### 2. Upload to Coder

1. Navigate to Coder dashboard
2. Go to Templates → Create Template
3. Upload generated `.tar` file
4. Configure template variables (see template README)
5. Create workspace from template

### 3. Template-Specific Setup

Consult the README in each template directory for deployment-specific requirements:


- `terminal-jarvis-playground/local-docker/README.md` - Docker Desktop setup
- `terminal-jarvis-playground/gcp/README.md` - GCP credentials and project configuration

## Available Templates

### terminal-jarvis-playground/local-docker

Docker-based workspace for local development and testing.

**Requirements:**

- Docker Desktop or Docker Engine
- 2+ GiB RAM recommended (JetBrains IDEs require 4+ GiB)

**Features:**

- Persistent `/home/coder` volume
- code-server for browser-based VS Code
- JetBrains Gateway support (IntelliJ, PyCharm, WebStorm, etc.)
- Automatic git configuration from Coder user metadata

**Terraform Variables:**

- `docker_socket` (optional) - Custom Docker socket path

### terminal-jarvis-playground/gcp

Google Compute Engine deployment using ephemeral VMs with persistent disks.

**Requirements:**

- GCP project with Compute Engine API enabled
- Service account with `compute.instanceAdmin.v1` role
- Service account JSON key file

**Features:**

- Bare VM architecture (no Docker dependency)
- Always Free tier eligible (e2-micro, 30 GB disk)
- Systemd-managed Coder agent with auto-restart
- Optional Archestra.ai integration
- Optional Docker installation for container workflows

**Terraform Variables:**

- `project_id` (required) - GCP project ID
- `zone` (optional) - Compute zone, default: `us-central1-a`
- `machine_type` (optional) - Instance size, default: `e2-micro`
- `disk_size` (optional) - Root disk GB, default: `30`
- `gcp_credentials` (sensitive) - Service account JSON key
- `enable_archestra` (optional) - Enable Archestra.ai, default: `false`
- `enable_docker` (optional) - Install Docker, default: `false`

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

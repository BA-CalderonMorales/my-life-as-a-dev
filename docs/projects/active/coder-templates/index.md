---
title: Coder Templates
description: Terraform-based workspace templates that make Terminal Jarvis-ready environments portable across laptops, Docker hosts, and cloud VMs.
tags:
  - Project
  - DevOps
  - Cloud
comments: true
---

# Coder Templates

> Terraform-based workspace templates that make Terminal Jarvis-ready environments portable across laptops, Docker hosts, and cloud VMs.

---

## Signal

!!! info "Project Signal"

	- **Status**: Maintained, with new providers rolling out
	- **Focus**: Reproducible Coder templates packaged as `.tar` uploads
	- **Stack**: Terraform, Docker, Bash packaging scripts
	- **Ideal For**: Platform teams standardizing dev workspaces or demo labs

## Quick Links

- [:fontawesome-brands-github: Repository](https://github.com/BA-CalderonMorales/coder-templates)
- [Packaging Scripts](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/scripts)
- [Deployment Models](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/docs/deployment_models)
- [Template Docs](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/templates)

## Onboarding Checklist

1. Clone the repository and pick a template folder (`terminal-jarvis-playground/local-docker`, `gcp`, etc.).
2. Run the packaging script for your platform (`./package.linux.sh`, `./package.mac.sh`, or `./package.windows.sh`).
3. Upload the generated `.tar` inside the Coder dashboard and follow the template README variables section.

## Highlights

- Single-source template model: Dockerfile + Terraform + README for every deployment target.
- Packaging workflow runs on macOS, Linux, and Windows/Git Bash with direct or interactive modes.
- Built-in observability dashboard surfaces CPU, RAM, disk, load, and swap metrics per workspace.
- Cloud model guides cover Docker Desktop, GCP, AWS, and Azure free-tier friendly setups.

## Code Snapshot

=== "Terraform"

    ```hcl title="main.tf"
    resource "coder_agent" "main" {
      os   = "linux"
      arch = "amd64"
      dir  = "/home/coder"

      startup_script = <<-EOT
        # Install Terminal Jarvis on workspace start
        npm install -g terminal-jarvis
        terminal-jarvis --version
      EOT
    }

    resource "docker_container" "workspace" {
      name  = "coder-${data.coder_workspace.me.name}"
      image = docker_image.main.image_id
      env   = ["CODER_AGENT_TOKEN=${coder_agent.main.token}"]
    }
    ```

## Core Scenarios

- **Local Docker**: Spin up a reproducible environment for Terminal Jarvis with persistent `home` volumes.
- **Cloud Starter Kits**: Launch low-cost GCP instances with optional Docker/Archestra toggles.
- **Contributor Mode**: Use the development container and packaging scripts to add new targets or providers.

## Documentation Map

| Document | Description |
| --- | --- |
| [Packaging Workflow](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/scripts) | Explains interactive vs direct modes plus artifact naming conventions |
| [Deployment Models](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/docs/deployment_models) | Cloud-specific guidance for Docker Desktop, GCP, AWS, Azure, and known limits |
| [Template Catalog](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/templates) | Dive into each template directory for Terraform variables and README instructions |

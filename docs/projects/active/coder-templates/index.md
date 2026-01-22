---
title: Coder Templates
description: Terraform-based workspace templates that make Terminal Jarvis-ready environments portable across laptops, Docker hosts, and cloud VMs.
tags:
  - Project
  - DevOps
  - Cloud
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

## Core Scenarios

- **Local Docker**: Spin up a reproducible environment for Terminal Jarvis with persistent `home` volumes.
- **Cloud Starter Kits**: Launch low-cost GCP instances with optional Docker/Archestra toggles.
- **Contributor Mode**: Use the development container and packaging scripts to add new targets or providers.

## Documentation Map

<div class="grid cards" markdown>

-   :material-download:{ .lg .middle } **Packaging Workflow**

	---

	Explains interactive vs direct modes plus artifact naming conventions.

	[View Scripts](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/scripts)

-   :material-cloud:{ .lg .middle } **Deployment Models**

	---

	Cloud-specific guidance for Docker Desktop, GCP, AWS, Azure, and known limits.

	[Read Guides](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/docs/deployment_models)

-   :material-docker:{ .lg .middle } **Template Catalog**

	---

	Dive into each template directory for Terraform variables and README instructions.

	[Explore Templates](https://github.com/BA-CalderonMorales/coder-templates/tree/develop/templates)

</div>

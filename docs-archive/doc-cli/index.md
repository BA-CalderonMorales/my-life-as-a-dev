---
title: Doc-CLI
description: The doc-cli Rust executable — the interactive front door for building, serving, and releasing this documentation site.
comments: true
hide:
  - toc
---

# Doc-CLI

`doc-cli` is the Rust command-line tool that drives local documentation
workflows for this repository: setup, serving, building, and release tooling.

## What It Is

- A small Rust CLI built from `scripts/rust/` (std-only, no external runtime).
- Wrapped by `doc-cli.sh` at the repository root so the built binary is
  rebuilt automatically when its sources change.
- The interactive front door behind the Makefile `make setup`, `make serve`,
  and `make build` targets.

## Running It

```bash
./doc-cli.sh            # launch the interactive menu
./doc-cli.sh setup      # uv-based environment install
./doc-cli.sh serve      # Zensical dev server on :8001
./doc-cli.sh build      # build the site with Zensical
```

The wrapper builds `scripts/rust/target/release/doc-cli` with Cargo on first
use and whenever `scripts/rust/**` sources are newer than the binary.

## Rebuilding From Source

```bash
cd scripts/rust
cargo build --release --bin doc-cli
```

## Why It Exists

The site pipeline leans on a Rust binary (rather than a second Python CLI) so
local automation stays boring and dependable: one binary, one wrapper, and
Makefile aliases that spell out the exact command.

<div align="center">

# My Life as a Dev

**One honest page on notebook paper**

[![Live site](https://img.shields.io/badge/site-live-1f9d8b?style=flat-square)](https://ba-calderonmorales.github.io/my-life-as-a-dev/)
[![Build status](https://img.shields.io/github/actions/workflow/status/BA-CalderonMorales/my-life-as-a-dev/github_pages.yml?branch=main&label=build&style=flat-square)](https://github.com/BA-CalderonMorales/my-life-as-a-dev/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

## Install

```bash
git clone https://github.com/BA-CalderonMorales/my-life-as-a-dev.git
cd my-life-as-a-dev
uv venv .venv
make setup
```

Prerequisites: Python 3.14+, [`uv`](https://docs.astral.sh/uv/). Rust/Cargo is
only needed to rebuild `doc-cli` from source.

## Quick Start

```bash
make serve
```

Open `http://localhost:8001/my-life-as-a-dev/`. The site is a single page
on notebook paper: a short introduction, work, life, projects, and a way
to say hello. Margin drawings follow one continuous marker stroke at a
time; hovering over a finished drawing erases it, then it redraws.

## Commands

Everything runs through one Rust front door, `doc-cli` (wrapped by
`doc-cli.sh`, which rebuilds the binary when its sources change). Commands
work headless (`./doc-cli <command>`) or from the interactive menu
(`./doc-cli.sh`).

| Command | Purpose |
|---|---|
| `serve` | Zensical dev server on :8001 |
| `build` | Build the site with Zensical |
| `kill` | Stop dev servers and free ports 8000/8001 |
| `info` | Project structure and configuration overview |
| `validate` | Validate `zensical.toml` and referenced files |
| `nav-check` | Find markdown pages missing from navigation |
| `bump-version` | Bump the documentation version |
| `deploy [VERSION]` | Deploy a versioned release to GitHub Pages |
| `setup` | Install dependencies and start the server |
| `help` | The full command map |

Make aliases: `make serve`, `make build`, `make test`, `make e2e`,
`make viewport-check`, `make accessibility-check`.

## Layout

```text
docs/                           # published content: one page + 404
docs/assets/css/theme.css       # the whole design: notebook paper, typewriter
docs-archive/                   # retired sections, kept on disk
config/zensical/                # modular config, merged into zensical.toml
scripts/rust/                   # doc-cli: the Rust front door
scripts/python/                 # config merge + versioned deploy
e2e/                            # Playwright browser suite
tests/                          # unit contracts
```

`zensical.toml` is generated from `config/zensical/*.toml` before every
serve/build. Retired sections live in `docs-archive/` — restoring one is a
move and a nav entry, not a rewrite.

## License

MIT

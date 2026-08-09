#!/usr/bin/env bash
# Capture screenshots across viewports and color schemes with repo Playwright tests.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

make screenshots

#!/usr/bin/env python3
"""Patch the generated living tree into the homepage idempotently."""

from __future__ import annotations

from pathlib import Path
import re
import textwrap


ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "docs" / "index.md"
GENERATED = ROOT / "scratch" / "life-tree.svg"
FACETS = ("work", "make", "serve", "learn", "life")
SVG_PATTERN = re.compile(
    r'(?ms)^[ \t]*<svg\b[^>]*class="life-tree"[^>]*>.*?</svg>[ \t]*'
)


def svg_markup(generated: str) -> str:
    """Wrap the generated fragment in one accessible, stable SVG element."""
    inner = textwrap.indent(textwrap.dedent(generated).strip(), "          ")
    return (
        '        <svg class="life-tree" viewBox="0 0 720 860" '
        'preserveAspectRatio="xMidYMid meet" role="group" data-life-tree-svg '
        'aria-labelledby="life-tree-title life-tree-description">\n'
        '          <title id="life-tree-title">The living index</title>\n'
        '          <desc id="life-tree-description">A rooted tree whose living '
        'branches open five facets: work, making, service, learning, and life.</desc>\n'
        f"{inner}\n"
        "        </svg>"
    )


def patch_text(source: str, generated: str) -> str:
    """Replace the homepage tree without accumulating leading indentation."""
    replacement = svg_markup(generated)
    patched, count = SVG_PATTERN.subn(replacement, source, count=1)
    if count != 1:
        raise ValueError('could not locate one <svg class="life-tree"> block')

    for attribute in ("data-tree-branch", "data-tree-node"):
        values = re.findall(fr'{attribute}="([^"]+)"', patched)
        if values != list(FACETS):
            raise ValueError(f"invalid {attribute} facets: {values}")
    if patched.count('class="life-tree__wood-shape"') != 1:
        raise ValueError("homepage must contain exactly one visible wood shape")
    return patched


def main() -> None:
    """Patch docs/index.md from the generated scratch fragment."""
    source = INDEX.read_text(encoding="utf-8")
    generated = GENERATED.read_text(encoding="utf-8")
    patched = patch_text(source, generated)
    INDEX.write_text(patched, encoding="utf-8")
    print("patched docs/index.md; one wood contour + five semantic branches")


if __name__ == "__main__":
    main()

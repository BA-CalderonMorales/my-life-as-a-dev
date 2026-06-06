from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
HEADER_CSS = ROOT / "docs" / "assets" / "css" / "header-version.css"


def _css() -> str:
    return HEADER_CSS.read_text(encoding="utf-8")


def _blocks(selector: str) -> list[str]:
    css = _css()
    matches = list(re.finditer(rf"(?m)^{re.escape(selector)}\s*\{{", css))
    assert matches, f"Missing selector block: {selector}"
    blocks = []
    for match in matches:
        brace = css.index("{", match.start())
        end = css.index("}", brace)
        blocks.append(css[brace + 1 : end])
    return blocks


def _block(selector: str) -> str:
    return _blocks(selector)[0]


def test_header_and_tabs_share_one_surface_token():
    css = _css()

    assert "--mlad-header-surface: var(--md-default-bg-color);" in css
    assert ".md-header,\n.md-tabs" in css
    assert "background: var(--mlad-header-surface);" in _block(".md-header,\n.md-tabs")
    assert "background-color: var(--mlad-header-surface);" in _block(".md-header,\n.md-tabs")


def test_logo_and_title_use_same_header_rhythm():
    css = _css()

    assert "--mlad-header-height: 4rem;" in css
    assert "min-height: var(--mlad-header-height);" in _block(".md-header__inner")
    assert "min-height: var(--mlad-header-height);" in _block(".md-header__title")
    assert "min-height: var(--mlad-header-height);" in _block(".md-header__ellipsis")
    assert "min-height: var(--mlad-header-height);" in _block(".md-header__topic")


def test_logo_icon_is_stable_and_centered():
    logo = next(block for block in _blocks(".md-logo") if "display: inline-flex;" in block)

    assert "display: inline-flex;" in logo
    assert "align-items: center;" in logo
    assert "justify-content: center;" in logo
    assert "width: 2rem;" in logo
    assert "height: 2rem;" in logo

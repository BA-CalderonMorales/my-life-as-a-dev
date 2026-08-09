from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
HEADER_CSS = ROOT / "docs" / "assets" / "css" / "header-version.css"


def _css() -> str:
    return HEADER_CSS.read_text(encoding="utf-8")


def _block(selector: str) -> str:
    css = _css()
    start = css.index(selector)
    brace = css.index("{", start)
    end = css.index("}", brace)
    return css[brace + 1 : end]


def test_header_title_does_not_become_a_custom_flex_row_again():
    title = _block(".md-header__title")

    assert "display: flex;" not in title
    assert "align-items: center;" not in title


def test_header_height_is_not_compressed_below_material_rhythm():
    css = _css()

    assert "--mlad-header-height: 4rem;" in css
    assert "--mlad-header-height: 2.8rem;" not in css


def test_tabs_do_not_introduce_a_second_navbar_background():
    tabs = _block(".md-header,\n.md-tabs")

    assert "var(--md-default-bg-color)" not in tabs
    assert "var(--mlad-header-surface)" in tabs

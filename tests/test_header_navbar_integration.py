from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATED_CONFIG = ROOT / "zensical.toml"
SOURCE_CSS = ROOT / "docs" / "assets" / "css" / "header-version.css"
SOURCE_PARTIAL = ROOT / "docs" / "overrides" / "partials" / "header.html"


def test_generated_config_loads_header_version_stylesheet():
    config = GENERATED_CONFIG.read_text(encoding="utf-8")

    assert '"assets/css/header-version.css"' in config


def test_header_css_contains_single_surface_contract():
    css = SOURCE_CSS.read_text(encoding="utf-8")

    assert "--mlad-header-surface: var(--md-default-bg-color);" in css
    assert "background: var(--mlad-header-surface);" in css
    assert "background-color: var(--mlad-header-surface);" in css


def test_header_template_keeps_logo_before_title():
    partial = SOURCE_PARTIAL.read_text(encoding="utf-8")

    logo_index = partial.index('class="md-header__button md-logo"')
    title_index = partial.index('class="md-header__title"')
    assert logo_index < title_index

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATED_CONFIG = ROOT / "zensical.toml"
SOURCE_CSS = ROOT / "docs" / "assets" / "css" / "header-version.css"
SOURCE_PARTIAL = ROOT / "docs" / "overrides" / "partials" / "header.html"
MAIN_OVERRIDE = ROOT / "docs" / "overrides" / "main.html"
LANDING_CSS = ROOT / "docs" / "assets" / "css" / "landing.css"


def test_generated_config_excludes_gated_header_version_stylesheet():
    config = GENERATED_CONFIG.read_text(encoding="utf-8")

    assert '"assets/css/header-version.css"' not in config


def test_landing_page_keeps_the_repository_link_visible():
    css = LANDING_CSS.read_text(encoding="utf-8")

    assert ".landing-page .md-source" not in css


def test_main_header_places_repository_link_right_of_palette_toggle():
    main = MAIN_OVERRIDE.read_text(encoding="utf-8")

    actions_start = main.index('class="mlad-header__actions"')
    actions_end = main.index("</div>", actions_start)
    actions = main[actions_start:actions_end]
    assert actions.index("partials/palette.html") < actions.index(
        "partials/source.html"
    )


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

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_CSS = ROOT / "docs" / "assets" / "css" / "background.css"
SCENE_MANAGER = ROOT / "docs" / "assets" / "js" / "threejs-background" / "core" / "SceneManager.js"
HOME_SCENE = ROOT / "docs" / "assets" / "js" / "threejs-background" / "pages" / "SceneObjectModel.js"
GEOMETRY_FACTORY = ROOT / "docs" / "assets" / "js" / "threejs-background" / "animation" / "GeometryFactory.js"


def test_home_threejs_background_owns_full_viewport_from_first_paint():
    css = BACKGROUND_CSS.read_text(encoding="utf-8")

    assert '.landing-page .threejs-bg-container[data-scene-kind="home"]' in css
    assert "position: fixed;" in css
    assert "inset: 0;" in css
    assert "width: 100vw;" in css
    assert "height: 100vh;" in css
    assert "height: 100dvh;" in css
    assert "pointer-events: none;" in css


def test_scene_manager_uses_viewport_fallback_before_container_layout():
    source = SCENE_MANAGER.read_text(encoding="utf-8")

    assert "getViewportSize()" in source
    assert "window.innerWidth || document.documentElement.clientWidth" in source
    assert "window.innerHeight || document.documentElement.clientHeight" in source
    assert "requestAnimationFrame(() => this.handleResize())" in source


def test_home_scene_prefers_toon_meshes_over_wireframe_texture():
    scene_model = HOME_SCENE.read_text(encoding="utf-8")
    geometry_factory = GEOMETRY_FACTORY.read_text(encoding="utf-8")

    assert "wireframeRing" not in scene_model
    assert "MeshToonMaterial" in geometry_factory
    assert "DataTexture" in geometry_factory
    assert "gradientMap: this.toonGradient" in geometry_factory

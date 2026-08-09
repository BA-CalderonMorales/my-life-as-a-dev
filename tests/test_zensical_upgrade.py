from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS = ROOT / "requirements.txt"


def test_zensical_requirement_tracks_current_font_release():
    requirements = REQUIREMENTS.read_text(encoding="utf-8")

    assert "zensical>=0.0.43" in requirements
    assert "zensical>=0.0.39" not in requirements

import re
from datetime import datetime, timedelta
from pathlib import Path
import argparse

from utils import cached_get_json, cached_get, slug

OWNER = "BA-CalderonMorales"
DEFAULT_BASE_DIR = Path(__file__).resolve().parent.parent / "docs" / "repositories"
INDEX_FILE = (
    Path(__file__).resolve().parent.parent / "docs" / "repositories" / "index.md"
)


def fetch_repo_info(repo: str, *, force: bool = False):
    url = f"https://api.github.com/repos/{OWNER}/{repo}"
    return cached_get_json(url, force=force)


def fetch_readme(repo: str, branch: str, *, force: bool = False) -> str | None:
    url = f"https://raw.githubusercontent.com/{OWNER}/{repo}/{branch}/README.md"
    return cached_get(url, force=force)


def get_repo_names() -> list[str]:
    text = INDEX_FILE.read_text(encoding="utf-8")
    pattern = re.compile(r"\[([^\]]+)\]\(https://github.com/BA-CalderonMorales/[^)]+\)")
    return pattern.findall(text)


def create_page(repo: str, *, base_dir: Path, force: bool = False):
    info = fetch_repo_info(repo, force=force)
    content = ""
    if info and not info.get("private", False):
        branch = info.get("default_branch", "main")
        readme = fetch_readme(repo, branch, force=force)
        if readme:
            content = readme
        else:
            content = f"# {repo}\nREADME not available."
    else:
        content = f"# {repo}\nDocumentation not available."

    # Add inactive disclaimer if pushed_at > 180 days ago
    if info and "pushed_at" in info:
        try:
            pushed = datetime.fromisoformat(info["pushed_at"].rstrip("Z"))
            if datetime.utcnow() - pushed > timedelta(days=180):
                content += "\n\n_It's been a while since this repo was updated._"
        except ValueError:
            pass
    else:
        content += "\n\n_It's been a while since this repo was updated._"

    target_dir = base_dir / slug(repo)
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "index.md").write_text(content.rstrip() + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate repository pages")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=DEFAULT_BASE_DIR,
        help="Directory where pages will be created",
    )
    parser.add_argument(
        "--force-refresh",
        action="store_true",
        help="Ignore cached responses and fetch fresh data",
    )
    args = parser.parse_args()

    base_dir = args.base_dir
    base_dir.mkdir(parents=True, exist_ok=True)

    for repo in get_repo_names():
        create_page(repo, base_dir=base_dir, force=args.force_refresh)


if __name__ == "__main__":
    main()

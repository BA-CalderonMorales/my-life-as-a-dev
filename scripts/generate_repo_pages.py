import re
import requests
from pathlib import Path
from datetime import datetime, timedelta

OWNER = "BA-CalderonMorales"
BASE_DIR = Path(__file__).resolve().parent.parent / "docs" / "repositories"
INDEX_FILE = Path(__file__).resolve().parent.parent / "docs" / "repositories" / "index.md"


def slug(name: str) -> str:
    return name.lower().replace('-', '_')


def fetch_repo_info(repo: str):
    url = f"https://api.github.com/repos/{OWNER}/{repo}"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return None


def fetch_readme(repo: str, branch: str) -> str | None:
    url = f"https://raw.githubusercontent.com/{OWNER}/{repo}/{branch}/README.md"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.text
    except requests.RequestException:
        pass
    return None


def get_repo_names() -> list[str]:
    text = INDEX_FILE.read_text(encoding="utf-8")
    pattern = re.compile(r"\[([^\]]+)\]\(https://github.com/BA-CalderonMorales/[^)]+\)")
    return pattern.findall(text)


def create_page(repo: str):
    info = fetch_repo_info(repo)
    content = ""
    if info and not info.get("private", False):
        branch = info.get("default_branch", "main")
        readme = fetch_readme(repo, branch)
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

    target_dir = BASE_DIR / slug(repo)
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "index.md").write_text(content.rstrip() + "\n", encoding="utf-8")


def main():
    for repo in get_repo_names():
        create_page(repo)


if __name__ == "__main__":
    main()

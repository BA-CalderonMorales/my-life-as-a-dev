import os
import requests
from pathlib import Path

REPOS = {
    "Vimrc-No-Plugins": "develop",
    "Amazon-Clone": "main",
}

BASE_DIR = Path(__file__).resolve().parent.parent / "docs" / "repositories"

RAW_URL_TEMPLATE = "https://raw.githubusercontent.com/{repo}/{branch}/README.md"


def slug(name: str) -> str:
    return name.lower().replace('-', '_')


def fetch_readme(repo: str, branch: str) -> str:
    url = RAW_URL_TEMPLATE.format(repo=f"BA-CalderonMorales/{repo}", branch=branch)
    resp = requests.get(url, timeout=10)
    if resp.status_code == 200:
        return resp.text
    else:
        return f"# {repo}\nREADME not available."


def write_doc(repo: str, content: str):
    target_dir = BASE_DIR / slug(repo)
    target_dir.mkdir(parents=True, exist_ok=True)
    with open(target_dir / "index.md", "w", encoding="utf-8") as fh:
        fh.write(content)


def main():
    for repo, branch in REPOS.items():
        print(f"Syncing {repo}...")
        readme = fetch_readme(repo, branch)
        write_doc(repo, readme)


if __name__ == "__main__":
    main()

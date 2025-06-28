from __future__ import annotations

import hashlib
import os
import re
from pathlib import Path

import requests

# Shared session for all network calls
_session = requests.Session()

GITHUB_TOKEN = os.getenv("GH_TOKEN") or os.getenv("GITHUB_TOKEN")

# Cache directory to store fetched resources
CACHE_DIR = Path(__file__).resolve().parent / ".cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def slug(name: str) -> str:
    """Convert a repository name to a filesystem-friendly slug."""
    slugified = name.lower()
    slugified = re.sub(r"[^a-z0-9]+", "_", slugified)
    return slugified.strip("_")


def cached_get(
    url: str,
    *,
    timeout: int = 10,
    headers: dict[str, str] | None = None,
    force: bool = False,
) -> str | None:
    """Fetch a URL and cache the result on disk.

    If ``GH_TOKEN`` or ``GITHUB_TOKEN`` is set in the environment, it is used
    for GitHub requests unless an ``Authorization`` header is already provided.
    """
    cache_key = hashlib.sha256(url.encode()).hexdigest()
    cache_file = CACHE_DIR / cache_key

    if cache_file.exists() and not force:
        return cache_file.read_text(encoding="utf-8")

    if headers is None:
        headers = {}
    if GITHUB_TOKEN and "github.com" in url and "Authorization" not in headers:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        resp = _session.get(url, timeout=timeout, headers=headers)
        if resp.status_code == 200:
            cache_file.write_text(resp.text, encoding="utf-8")
            return resp.text
    except requests.RequestException:
        pass
    return None

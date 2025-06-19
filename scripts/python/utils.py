from __future__ import annotations

import hashlib
from pathlib import Path

import requests

# Shared session for all network calls
_session = requests.Session()

# Cache directory to store fetched resources
CACHE_DIR = Path(__file__).resolve().parent / ".cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def slug(name: str) -> str:
    """Convert a repository name to a filesystem-friendly slug."""
    return name.lower().replace("-", "_")


def cached_get(url: str, *, timeout: int = 10) -> str | None:
    """Fetch a URL and cache the result on disk."""
    cache_key = hashlib.sha256(url.encode()).hexdigest()
    cache_file = CACHE_DIR / cache_key

    if cache_file.exists():
        return cache_file.read_text(encoding="utf-8")

    try:
        resp = _session.get(url, timeout=timeout)
        if resp.status_code == 200:
            cache_file.write_text(resp.text, encoding="utf-8")
            return resp.text
    except requests.RequestException:
        pass
    return None

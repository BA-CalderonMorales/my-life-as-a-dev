#!/usr/bin/env python3
"""
Versioned deployment script for Zensical projects.

This script provides mike-like versioned documentation deployment for Zensical,
which doesn't have native mike integration. It:
1. Builds the site with Zensical
2. Deploys to a versioned directory on gh-pages
3. Updates versions.json for the version selector

Usage:
    python versioned_deploy.py deploy <version> [--alias latest] [--push]
    python versioned_deploy.py list
    python versioned_deploy.py set-default <version>
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a command and return the result."""
    print(f"  Running: {' '.join(cmd)}")
    return subprocess.run(cmd, check=check, capture_output=True, text=True)


def get_versions_json(gh_pages_dir: Path) -> dict:
    """Load versions.json from gh-pages directory."""
    versions_file = gh_pages_dir / "versions.json"
    if versions_file.exists():
        with open(versions_file) as f:
            return json.load(f)
    return []


def save_versions_json(gh_pages_dir: Path, versions: list) -> None:
    """Save versions.json to gh-pages directory."""
    versions_file = gh_pages_dir / "versions.json"
    with open(versions_file, "w") as f:
        json.dump(versions, f, indent=2)


def build_site() -> bool:
    """Build the site with Zensical."""
    print("\n[1/4] Building site with Zensical...")
    try:
        result = run_command(["zensical", "build"])
        print("  Build completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  Build failed: {e.stderr}")
        return False


def checkout_gh_pages(temp_dir: Path, remote: str = "origin", branch: str = "gh-pages") -> bool:
    """Checkout gh-pages branch to temp directory."""
    print(f"\n[2/4] Checking out {branch} branch...")

    # Check if branch exists remotely
    result = run_command(["git", "ls-remote", "--heads", remote, branch], check=False)
    branch_exists = bool(result.stdout.strip())

    if branch_exists:
        # Clone just the gh-pages branch
        run_command([
            "git", "clone", "--single-branch", "--branch", branch,
            "--depth", "1", ".", str(temp_dir)
        ], check=False)

        if not temp_dir.exists():
            temp_dir.mkdir(parents=True)
            # Initialize if clone failed
            run_command(["git", "init"], check=False)
    else:
        temp_dir.mkdir(parents=True, exist_ok=True)

    return True


def deploy_version(
    version: str,
    aliases: list[str] = None,
    push: bool = False,
    remote: str = "origin",
    branch: str = "gh-pages"
) -> bool:
    """Deploy the current build to a versioned directory."""

    site_dir = Path("site")
    if not site_dir.exists():
        print("Error: site/ directory not found. Run 'zensical build' first.")
        return False

    # Work directly with gh-pages branch
    print(f"\n[2/4] Setting up {branch} branch...")

    # Fetch gh-pages if it exists
    result = run_command(["git", "fetch", remote, branch], check=False)

    # Create a worktree for gh-pages
    gh_pages_dir = Path(".gh-pages-deploy")
    if gh_pages_dir.exists():
        shutil.rmtree(gh_pages_dir)

    # Check if gh-pages exists
    result = run_command(["git", "ls-remote", "--heads", remote, branch], check=False)
    branch_exists = bool(result.stdout.strip())

    if branch_exists:
        run_command(["git", "worktree", "add", str(gh_pages_dir), f"{remote}/{branch}"], check=False)
    else:
        # Create orphan branch
        gh_pages_dir.mkdir(parents=True)
        os.chdir(gh_pages_dir)
        run_command(["git", "init"])
        run_command(["git", "checkout", "--orphan", branch])
        os.chdir("..")

    print(f"\n[3/4] Deploying version {version}...")

    # Copy site to version directory
    version_dir = gh_pages_dir / version
    if version_dir.exists():
        shutil.rmtree(version_dir)
    shutil.copytree(site_dir, version_dir)

    # Handle aliases (symlinks or copies)
    aliases = aliases or []
    for alias in aliases:
        alias_dir = gh_pages_dir / alias
        if alias_dir.exists():
            if alias_dir.is_symlink():
                alias_dir.unlink()
            else:
                shutil.rmtree(alias_dir)
        # Use copy instead of symlink for GitHub Pages compatibility
        shutil.copytree(version_dir, alias_dir)

    # Update versions.json
    versions = get_versions_json(gh_pages_dir)

    # Remove existing entry for this version
    versions = [v for v in versions if v.get("version") != version]

    # Remove aliases from other versions (aliases should be unique)
    for alias in aliases:
        for v in versions:
            if alias in v.get("aliases", []):
                v["aliases"].remove(alias)

    # Add new version entry
    version_entry = {
        "version": version,
        "title": version,
        "aliases": aliases
    }
    versions.append(version_entry)

    # Sort by semantic version (descending)
    def version_key(v):
        """Parse version string to tuple for sorting."""
        ver = v.get("version", "0.0.0")
        try:
            parts = [int(p) for p in ver.split(".")]
            return tuple(parts)
        except ValueError:
            return (0, 0, 0)

    versions.sort(key=version_key, reverse=True)

    save_versions_json(gh_pages_dir, versions)

    # Create redirect index.html at root if it doesn't exist
    root_index = gh_pages_dir / "index.html"
    default_version = aliases[0] if aliases else version
    if not root_index.exists() or True:  # Always update
        redirect_html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; URL=./{default_version}/">
    <link rel="canonical" href="./{default_version}/">
</head>
<body>
    <p>Redirecting to <a href="./{default_version}/">latest documentation</a>...</p>
</body>
</html>
'''
        with open(root_index, "w") as f:
            f.write(redirect_html)

    # Create 404.html to redirect deleted versions to latest
    root_404 = gh_pages_dir / "404.html"
    repo_name = "my-life-as-a-dev"  # TODO: could be extracted from git remote
    not_found_html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Page Not Found - Redirecting...</title>
    <script>
        // Redirect deleted versions to latest
        const path = window.location.pathname;
        const match = path.match(/^\\/{repo_name}\\/(\\d+\\.\\d+\\.\\d+|v\\d+\\.\\d+\\.\\d+)\\//);
        if (match) {{
            // This is an old version URL, redirect to latest equivalent
            const versionedPath = path.replace(/^\\/{repo_name}\\/[^\\/]+/, '/{repo_name}/latest');
            window.location.replace(versionedPath);
        }} else {{
            // Not a version URL, redirect to home
            window.location.replace('/{repo_name}/latest/');
        }}
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0; URL=/{repo_name}/latest/">
    </noscript>
</head>
<body>
    <p>Page not found. Redirecting to <a href="/{repo_name}/latest/">latest documentation</a>...</p>
</body>
</html>
'''
    with open(root_404, "w") as f:
        f.write(not_found_html)

    # Add .nojekyll
    (gh_pages_dir / ".nojekyll").touch()

    print(f"\n[4/4] Committing changes...")

    # Commit changes
    os.chdir(gh_pages_dir)
    run_command(["git", "add", "-A"])

    commit_msg = f"Deploy version {version}"
    if aliases:
        commit_msg += f" (aliases: {', '.join(aliases)})"

    result = run_command(["git", "commit", "-m", commit_msg], check=False)

    if push:
        print(f"  Pushing to {remote}/{branch}...")
        run_command(["git", "push", remote, f"HEAD:{branch}"])

    os.chdir("..")

    # Cleanup worktree
    run_command(["git", "worktree", "remove", str(gh_pages_dir)], check=False)

    print(f"\nDeployed version {version} successfully!")
    if aliases:
        print(f"  Aliases: {', '.join(aliases)}")
    if not push:
        print(f"\n  Run with --push to push to {remote}/{branch}")

    return True


def list_versions(remote: str = "origin", branch: str = "gh-pages") -> None:
    """List all deployed versions."""
    print(f"Fetching versions from {remote}/{branch}...")

    # Fetch versions.json directly
    result = run_command([
        "git", "show", f"{remote}/{branch}:versions.json"
    ], check=False)

    if result.returncode != 0:
        print("No versions deployed yet.")
        return

    versions = json.loads(result.stdout)

    print("\nDeployed versions:")
    for v in versions:
        aliases = v.get("aliases", [])
        alias_str = f" ({', '.join(aliases)})" if aliases else ""
        print(f"  - {v['version']}{alias_str}")


def main():
    parser = argparse.ArgumentParser(
        description="Versioned deployment for Zensical projects"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # deploy command
    deploy_parser = subparsers.add_parser("deploy", help="Deploy a version")
    deploy_parser.add_argument("version", help="Version to deploy")
    deploy_parser.add_argument("--alias", "-a", action="append", dest="aliases",
                              help="Alias for this version (can be repeated)")
    deploy_parser.add_argument("--push", "-p", action="store_true",
                              help="Push to remote after commit")
    deploy_parser.add_argument("--remote", "-r", default="origin",
                              help="Git remote (default: origin)")
    deploy_parser.add_argument("--branch", "-b", default="gh-pages",
                              help="Target branch (default: gh-pages)")
    deploy_parser.add_argument("--no-build", action="store_true",
                              help="Skip building, use existing site/")

    # list command
    list_parser = subparsers.add_parser("list", help="List deployed versions")
    list_parser.add_argument("--remote", "-r", default="origin")
    list_parser.add_argument("--branch", "-b", default="gh-pages")

    args = parser.parse_args()

    if args.command == "deploy":
        if not args.no_build:
            if not build_site():
                sys.exit(1)

        success = deploy_version(
            version=args.version,
            aliases=args.aliases or [],
            push=args.push,
            remote=args.remote,
            branch=args.branch
        )
        sys.exit(0 if success else 1)

    elif args.command == "list":
        list_versions(remote=args.remote, branch=args.branch)


if __name__ == "__main__":
    main()

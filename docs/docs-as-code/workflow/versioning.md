---
title: Versioning
description: How documentation versions are managed, deployed, and accessed.
tags:
  - Versioning
  - Deployment
  - Workflow
comments: true
---

# Versioning

Every release gets its own immutable snapshot. Readers can switch versions from the header dropdown. Old URLs redirect to the latest equivalent.

---

## How it works

1. **Build.** Zensical compiles Markdown into a static `site/` folder.
2. **Deploy.** The deploy script copies `site/` into a versioned directory on `gh-pages`.
3. **Alias.** The `latest` alias always points to the current release.
4. **Redirect.** Root and deleted version URLs redirect to `latest`.

```
gh-pages/
  0.3.1/          # Immutable snapshot
  0.3.2/          # Immutable snapshot
  0.3.3/          # Immutable snapshot
  latest/         # Copy of 0.3.3
  index.html      # Redirects to latest/
  404.html        # Redirects deleted versions
  versions.json   # Version selector data
```

---

## Commands

Deploy a new version:

```bash
./doc-cli.sh deploy 0.4.0 --push
```

Or use the Python script directly:

```bash
uv run python scripts/python/versioned_deploy.py deploy 0.4.0 --alias latest --push
```

List deployed versions:

```bash
uv run python scripts/python/versioned_deploy.py list
```

---

## Version selector

The header dropdown reads from `versions.json`:

```json
[
  { "version": "0.3.3", "title": "0.3.3", "aliases": ["latest"] },
  { "version": "0.3.2", "title": "0.3.2", "aliases": [] },
  { "version": "0.3.1", "title": "0.3.1", "aliases": [] }
]
```

MkDocs Material displays this automatically when `extra.version.provider: mike` is set.

---

## Deleted version handling

When a version is removed from `gh-pages`, its URLs return 404. The root `404.html` catches these and redirects to the equivalent path under `latest/`.

Example: `/my-life-as-a-dev/0.2.0/learning/` becomes `/my-life-as-a-dev/latest/learning/`.

---

## Applying this to your project

### Requirements

- GitHub Pages enabled on the `gh-pages` branch
- MkDocs Material with `extra.version.provider: mike`
- A static site generator that outputs to `site/`

### Steps

1. **Copy the deploy script.** Grab [versioned_deploy.py](https://github.com/BA-CalderonMorales/my-life-as-a-dev/blob/main/scripts/python/versioned_deploy.py) into your project.

2. **Configure MkDocs.** Add to your `mkdocs.yml`:
   ```yaml
   extra:
     version:
       provider: mike
   ```

3. **Deploy your first version.**
   ```bash
   python versioned_deploy.py deploy 1.0.0 --alias latest --push
   ```

4. **Enable GitHub Pages.** Point it to the `gh-pages` branch root.

### Customization

Edit the `repo_name` variable in the 404 redirect script if your repository name differs.

---

## When to cut a new version

- Breaking navigation changes
- Major content restructuring
- Stable release milestones

Avoid versioning every commit. Use `latest` for continuous updates and cut numbered versions for significant releases.

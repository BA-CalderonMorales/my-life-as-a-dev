# Sync Repository Documentation

**Purpose**: Sync external repository READMEs to the docs/repositories/ directory using the existing Python automation scripts.

## Context

This MkDocs project maintains two types of documentation:
- **docs/projects/**: Curated, manually-maintained project documentation
- **docs/repositories/**: Auto-synced READMEs from external GitHub repositories

## Workflow

1. **Check current repo list**:
   - Read `docs/repositories/index.md` to see which repos are tracked
   - Use `scripts/python/generate_repo_pages.py` to sync docs

2. **Run sync scripts**:
   ```bash
   # Navigate to project root
   cd /home/user/my-life-as-a-dev

   # Option 1: Sync specific repos (currently Vimrc-No-Plugins, Amazon-Clone)
   PYTHONPATH=$(pwd) python scripts/python/sync_repo_docs.py

   # Option 2: Generate pages for all repos listed in index.md
   PYTHONPATH=$(pwd) python scripts/python/generate_repo_pages.py

   # Option 3: Force refresh (bypass cache)
   PYTHONPATH=$(pwd) python scripts/python/generate_repo_pages.py --force-refresh
   ```

3. **Verify output**:
   - Check `docs/repositories/` for updated index.md files
   - Ensure no emojis were introduced (critical requirement)
   - Verify markdown formatting is correct

4. **Update navigation** (if needed):
   - Add new repositories to `docs/.nav.yml` under appropriate sections
   - Follow existing hierarchy pattern

## Key Constraints

- **CRITICAL**: NO EMOJIS in any documentation files
- Use Material Design icons (`:material-icon-name:`) for visual indicators
- Maintain PYTHONPATH when running scripts
- Cache is used by default (180-day inactivity warnings)
- Private repos are skipped automatically

## Automation Details

The scripts use:
- **utils.py**: Shared caching, slug generation, GitHub auth
- **generate_repo_pages.py**: Fetches repo info + README from GitHub API
- **sync_repo_docs.py**: Simple README sync for configured repos
- **update_index_links.py**: Auto-generates documentation links

## Expected Outcome

Fresh repository documentation synced from GitHub with:
- Latest README content
- Inactivity warnings for stale repos (180+ days)
- Proper slug-based directory structure
- No emojis or style violations

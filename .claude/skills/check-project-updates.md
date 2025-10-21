# Check Project Updates

**Purpose**: Identify which GitHub repositories have been updated recently to determine if documentation needs refreshing.

## Quick Check Script

Run this to see which projects have recent updates:

```bash
cd /home/user/my-life-as-a-dev

python -c "
import requests
import os
from datetime import datetime

OWNER = 'BA-CalderonMorales'
repos = [
    'terminal-jarvis',
    'coder-starter-scripts',
    'coder-templates',
    'terminal-screensaver',
    'my-life-as-a-dev',
    'immersive-awe-canvas',
    'shadow-scroll-blossom',
    'rust-terminal-forge'
]

headers = {}
token = os.getenv('GITHUB_TOKEN') or os.getenv('GH_TOKEN')
if token:
    headers['Authorization'] = f'token {token}'

print('{:<30} {:<20} {:<10}'.format('Repo', 'Last Push', 'Days Ago'))
print('-' * 65)

for repo in repos:
    try:
        resp = requests.get(
            f'https://api.github.com/repos/{OWNER}/{repo}',
            headers=headers,
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            pushed = datetime.fromisoformat(data['pushed_at'].rstrip('Z'))
            days_ago = (datetime.utcnow() - pushed).days
            print('{:<30} {:<20} {:<10}'.format(
                repo,
                pushed.strftime('%Y-%m-%d %H:%M'),
                str(days_ago)
            ))
    except Exception as e:
        print('{:<30} Error: {}'.format(repo, str(e)[:30]))
"
```

## Detailed Check with Changes

For more detailed information including recent commits:

```bash
python -c "
import requests
import os
from datetime import datetime

OWNER = 'BA-CalderonMorales'
repos = [
    'terminal-jarvis',
    'coder-starter-scripts',
    'coder-templates',
    'terminal-screensaver',
    'my-life-as-a-dev',
    'immersive-awe-canvas',
    'shadow-scroll-blossom',
    'rust-terminal-forge'
]

headers = {}
token = os.getenv('GITHUB_TOKEN') or os.getenv('GH_TOKEN')
if token:
    headers['Authorization'] = f'token {token}'

for repo in repos:
    try:
        # Get repo info
        resp = requests.get(
            f'https://api.github.com/repos/{OWNER}/{repo}',
            headers=headers,
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            pushed = datetime.fromisoformat(data['pushed_at'].rstrip('Z'))
            days_ago = (datetime.utcnow() - pushed).days

            # Get recent commits
            commits_resp = requests.get(
                f'https://api.github.com/repos/{OWNER}/{repo}/commits',
                headers=headers,
                params={'per_page': 3},
                timeout=10
            )

            print(f'\\n{repo}')
            print(f'  Last push: {pushed.strftime(\"%Y-%m-%d %H:%M\")} ({days_ago} days ago)')
            print(f'  Description: {data.get(\"description\", \"N/A\")}')

            if commits_resp.status_code == 200:
                commits = commits_resp.json()
                print(f'  Recent commits:')
                for commit in commits[:3]:
                    msg = commit['commit']['message'].split('\\n')[0][:60]
                    print(f'    - {msg}')
    except Exception as e:
        print(f'\\n{repo}: Error - {str(e)[:50]}')
"
```

## Update Thresholds

Based on project patterns:

- **0-7 days**: Recently updated - check if docs need sync
- **8-30 days**: Recent activity - probably fine
- **31-90 days**: Moderate staleness - review if major changes
- **90-180 days**: Stale - consider adding "not actively maintained" note
- **180+ days**: Very stale - auto-generated pages include disclaimer

## Documentation Update Decision Matrix

| Days Since Update | Action |
|------------------|--------|
| 0-7 | Check README for changes, sync if needed |
| 8-30 | Review release notes, update if major version |
| 31-90 | Light review, update if significant changes |
| 90-180 | Add "stable" or "maintenance mode" label if appropriate |
| 180+ | Auto-disclaimer added by generate_repo_pages.py |

## Integration with Sync Scripts

The `generate_repo_pages.py` script automatically:
- Detects repos updated more than 180 days ago
- Adds disclaimer: "It's been a while since this repo was updated."
- Uses cached GitHub API responses (bypass with `--force-refresh`)

## Workflow

1. Run quick check script to see update status
2. For recently updated repos (0-7 days):
   - Check if README changed: `curl -s https://raw.githubusercontent.com/OWNER/REPO/main/README.md`
   - Compare with current docs
   - Run sync if changes are significant
3. For stale repos (180+ days):
   - Verify disclaimer is present
   - Consider moving to "Archived" or "Historical" section
4. Update docs/.nav.yml if project status changed

## Expected Outcome

Clear visibility into which projects need documentation attention, enabling efficient maintenance and ensuring documentation freshness aligns with project activity levels.

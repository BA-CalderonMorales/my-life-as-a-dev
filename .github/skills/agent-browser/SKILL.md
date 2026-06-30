# Skill: Agent Browser

Deprecated for this repository. Use [browser-automation](../browser-automation/SKILL.md), which runs repo-owned Playwright tests through `uv`.

Do not use `agent-browser` unless the user explicitly requests it. The default browser automation path is:

```bash
make browser-install
make viewport-check
make screenshots
make accessibility-check
```

---
name: bmad-walkthrough
description: 'Guide a human review of a commit, PR, file, or directory. Use when invoked by name'
---

Run the following command exactly once from the project root. If you are in a subdirectory, change to the project root first:

```bash
uv run --cache-dir .uv-cache ./_bmad/scripts/render_skill.py --project-root . --skill ./.agents/skills/bmad-walkthrough
```

- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script is not found, BMad is not set up here. Offer to run the `bmad` skill's setup, installing `bmad` first if you do not have it (`npx skills add bmad-code-org/BMAD-METHOD --skill bmad`), then run the command above once more.
- On any other failure (including `uv` being unavailable), report the command output and HALT. Do not run any workflow source directly.

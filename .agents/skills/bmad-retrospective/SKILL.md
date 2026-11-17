---
name: bmad-retrospective
description: 'Review a finished epic folder in the ticket tree against the evidence it left behind — the epic file, each ticket''s story file and plan, diffs, commits — and produce a retrospective with sourced findings, action items, and an acceptance decision. Use when the user says "run a retrospective" or "lets retro the epic [epic]". Supports -H/--headless'
---

Run the following command exactly once from the project root. If you are in a subdirectory, change to the project root first.


```bash
uv run --cache-dir .uv-cache ./_bmad/scripts/render_skill.py --project-root . --skill ./.agents/skills/bmad-retrospective
```

- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script does not exist, BMad is not set up in this project yet. Offer to set it up using `bmad` skill, then run the command again. If you do not have the `bmad` skill, offer to install it first.
- On any other output or failure, including `uv` being unavailable, report the command output and stop. Do not run any workflow source directly.

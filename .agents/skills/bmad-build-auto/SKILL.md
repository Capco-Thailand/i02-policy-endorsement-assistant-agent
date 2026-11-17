---
name: bmad-build-auto
description: 'Implements one story, feature, or bug fix end to end without human interaction: plan, code, review, verify, report status. Use when invoked by name, usually by an orchestrator'
---

Run the following command exactly once from the project root. If you are in a subdirectory, change to the project root first.


```bash
uv run --cache-dir .uv-cache ./_bmad/scripts/render_skill.py --project-root . --skill ./.agents/skills/bmad-build-auto
```

- When the invocation names a route (`oneshot` or `full`), append `--set workflow.route=<value>` to the command.
- When the invocation names a review selection (`none`, `quick`, or `thorough`; "skip review" or "no review" mean `none`), append `--set workflow.review=<value>` to the command.
- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script does not exist, BMad is not set up in this project yet. Offer to set it up using `bmad` skill, then run the command again. If you do not have the `bmad` skill, offer to install it first.
- On any other output or failure, including `uv` being unavailable, report the command output and stop. Do not run any workflow source directly.

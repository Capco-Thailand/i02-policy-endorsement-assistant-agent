---
name: bmad-code-review
description: 'Review code changes with several independent reviewers in parallel, then triage and present the findings. Use when the user says "run code review" or "review this code"'
---

Run the following command exactly once from the project root. If you are in a subdirectory, change to the project root first.


If the invocation asks for a `quick` or `thorough` review, append `--set workflow.review=<value>` to the command.
If the invocation asks for a `no-code` review, append `--set workflow.fixes=handoff` to the command.

If the invocation is clearly non-interactive -- it says not to ask questions, or a bot, a CI job or another workflow is running the review -- append `--set workflow.interactive=false`. When in doubt, don't.

```bash
uv run --cache-dir .uv-cache ./_bmad/scripts/render_skill.py --project-root . --skill ./.agents/skills/bmad-code-review
```

- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script does not exist, BMad is not set up in this project yet. Offer to set it up using `bmad` skill, then run the command again. If you do not have the `bmad` skill, offer to install it first.
- On any other output or failure, including `uv` being unavailable, report the command output and stop. Do not run any workflow source directly.

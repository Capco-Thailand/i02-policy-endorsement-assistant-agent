---
name: bmad-qa-generate-e2e-tests
description: 'Add end-to-end and API tests for features that already work, following the project''s existing test harness. Use when the user asks for e2e tests, API tests, or automated coverage of an existing feature, or says "create qa automated tests for [feature]". Not for unit tests on work in flight, which the build writes.'
---

Run the following command exactly once from the project root. If you are in a subdirectory, change to the project root first.


```bash
uv run --cache-dir .uv-cache ./_bmad/scripts/render_skill.py --project-root . --skill ./.agents/skills/bmad-qa-generate-e2e-tests
```

- The command prints the skill's workflow: follow it. `HALT: <reason>`: report the reason and stop.
- If the script does not exist, BMad is not set up in this project yet. Offer to set it up using `bmad` skill, then run the command again. If you do not have the `bmad` skill, offer to install it first.
- On any other output or failure, including `uv` being unavailable, report the command output and stop. Do not run any workflow source directly.

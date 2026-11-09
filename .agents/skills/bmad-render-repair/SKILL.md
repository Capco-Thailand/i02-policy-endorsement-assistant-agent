---
name: bmad-render-repair
description: Diagnose and repair BMad setup or render failures on Windows when a new staging directory denies access to nested files.
---

# Repair BMad staging on Windows

Use this skill when BMad setup or `render_skill.py` stops with `WinError 5` inside a newly created `_bmad.setup-*` or `_bmad/render/.../.staging-*` directory.

1. Reproduce with the failing setup or render command. Record the failing path and Python version. Confirm the failure occurs inside a new staging directory, rather than while reading a source or configuration file.
2. Compare nested directory creation inside a directory made with `mode=0o700` (including `tempfile.TemporaryDirectory`) with one made using `Path.mkdir(mode=0o777)`. Use an explicitly named temporary parent, and verify that cleanup paths resolve inside it. If both fail, inspect the parent ACL and sandbox access before changing code.
3. If a directory created with mode `0o700` is inaccessible while one created with `0o777` works, inspect the installed skill sources in `.agents/skills/bmad/scripts/setup.py` and `render_skill.py`. Use `mode=0o777` only on Windows so the directory inherits the parent ACL; retain `mode=0o700` elsewhere. Preserve random names, atomic publication, output verification, and cleanup. Patch the source that BMad setup copies into `_bmad/scripts/`, because edits to generated scripts are replaced by setup.
4. If setup also fails while copying or deleting its old `scripts` or `render` trees, keep those generated trees out of its staging copy; setup rebuilds them from installed sources. If setup reports an error while deleting its old backup, check `setup.py --status` before retrying: replacement may already have succeeded. Keep the backup until the new installation reports current.
5. Rerun the original render command. Success means it produces a rendered workflow with no template expressions such as `{{ ... }}`. A declared `uv` dependency may need registry access on the first run. Inspect orphaned staging and backup directories from failed attempts and remove only those whose resolved paths are within the intended workspace or temporary directory.

Report the observed cause, the changed file, and the original command's result. Do not treat every `WinError 5` as this issue: the path and the temporary-directory comparison must match.

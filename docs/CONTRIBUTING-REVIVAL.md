# Contributing to eDEX Revival

Use focused reports and patches. Revival work should preserve the sci-fi interface while keeping text readable and controls reachable.

## Useful Details for Issues

- OS and version.
- Display size and scaling.
- Layout preset and theme.
- Whether the keyboard, side widgets, launcher rail, or explorer are hidden.
- Screenshots for visual/layout problems.
- Shell path, shell args, cwd, and Test Shell result for terminal problems.
- File type and size for explorer/editor problems.

## Patch Expectations

- Keep changes scoped.
- Preserve context isolation and privileged work through main/preload IPC.
- Run `node --check` for touched JS files.
- Run `npm test` when package files or dependency behavior are affected.
- Run `git diff --check` before handoff.

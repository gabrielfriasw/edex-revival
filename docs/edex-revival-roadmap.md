# eDEX Revival Community Roadmap

This file is the execution checkpoint for the Revival work. Always read it before starting a new implementation pass, update checkboxes after verification, and keep skipped items explicit.

## Rules

- Windows is the primary target; Linux packaging is supported. macOS packaging is out of this release cycle.
- Implement in small verified batches: edit, run targeted checks, update this file, continue.
- Do not re-enable visible AI actions unless `ai.enabled` is explicitly true.
- Destructive file operations use trash or confirmation, never silent permanent deletion.
- Skipped community items: `76`, `84`, `85`.

## Progress Snapshot

- [x] eDEX Revival branding in boot/welcome surfaces.
- [x] `npm start` launches the normal intro flow.
- [x] Dev File Browser 2.0 exists with dock, window, and cockpit surfaces.
- [x] Embedded explorer mode is simplified to breadcrumb, search, and file list.
- [x] Explorer supports double-click open, context menu, preview, Git status/diff, drives, recent paths, pinned folders, and common file operations.
- [x] Integrated text editor opens code files with a reliable plain textarea by default.
- [x] Settings button and Widget Visibility modal exist.
- [x] Widgets can be hidden granularly, including IP/interface/location privacy.
- [x] Terminal foreground/background overrides exist.
- [x] Terminal focus no longer steals input from editor/settings fields.
- [x] Top Processes filters Windows idle process noise.
- [x] Startup no longer registers Windows login launch with `--nointro`.
- [x] New installs default local AI integration to disabled.
- [x] Settings Center exposes granular widget and privacy controls.
- [x] Local Diagnostics window exists for runtime, shell, GPU, settings, paths, startup, explorer, widgets, and AI status.
- [x] Settings Center validates theme, keyboard, cwd, shell path, ports, colors, monitor, and numeric ranges before saving.
- [x] Boot recovery warns and falls back for invalid theme, missing keyboard layout, missing shell, and invalid cwd.
- [x] Settings Center can preview a selected theme before saving/reloading.
- [x] Settings Center can reset the active section to defaults before saving.
- [x] Settings Center can export profiles and import profiles with an automatic backup.
- [x] Packaged builds use native auto-update flow with background download, progress UI, and restart/install action.
- [x] Explorer supports Ctrl-click, Shift-click, Ctrl+A, multi-selection status, multi-selection inspector, and batch duplicate/copy/move/trash/path copy.
- [x] Explorer supports drag-and-drop copy by default, move with Shift, folder/pane drop targets, and external file drops when Electron exposes file paths.
- [x] Explorer persists tabs and active tab path under `devExplorer`.
- [x] Explorer renders 5k+ entry directories in cancelable chunks with visible progress and deferred preview.
- [x] Dock explorer exposes a compact detach/window button and `Ctrl+Shift+E` cycles dock, window, and cockpit.
- [x] Keyboard-hidden layout no longer pins the dock explorer over the terminal; keyboard-only, side-only, and all-hidden states are separated.
- [x] Editor textarea has line numbers, local search/replace, modified state, save status, size, path, and UTF-8 assumed encoding display.
- [x] Editor IDE mode starts the VS Code-level track: CodeMirror core, command palette, completions, folding, search keymaps, and JSON lint gutter with plain fallback.
- [x] Editor workbench adds VS Code-style quick open, project-wide search, multi-file tabs, and split panes.
- [x] Editor IDE includes a readable VS Code-style file sidebar with icons, filtering, refresh, collapse, and toggle.
- [x] Layout presets, auto-hide launcher header, Revival themes, smart editor open behavior, globe modes, shell test, plugin docs/examples, and Revival release docs are in place.
- [x] Native SSH profiles open terminal tabs without storing passwords and include keepalive/auth/key-agent controls plus guided key setup and key-login diagnostics.
- [x] Error to Fix turns the latest terminal diagnostic into an editable Codex/Claude prompt when AI is enabled.

## Phase 1: Base, Security, Stability

- [x] Keep privileged filesystem, Git, terminal helper, startup, plugin, and diagnostics work behind preload/main IPC.
- [x] Default AI integration to off for new installs while preserving explicit user settings.
- [x] Remove hidden `--nointro` startup coupling from Windows login registration.
- [x] Add a local diagnostics panel for shell, GPU, settings file, app paths, startup status, and Electron version.
- [x] Add safer theme/settings validation before saving values that can break boot.
- [x] Add user-facing recovery messages for invalid theme, missing keyboard layout, invalid cwd, and missing shell.

## Phase 2: File Explorer

- [x] Provide Windows Explorer/Dolphin basics: file list, double-click folder open, right-click menu, open file, refresh, up/back/forward.
- [x] Provide dock/window/cockpit surfaces with window drag/resize, edge resizing, and clearer window controls.
- [x] Keep dock mode calm: breadcrumb, search, dense file list.
- [x] Add operations: new file/folder, rename, duplicate, copy, move, trash, copy path, WSL path, open external, terminal here.
- [x] Add views: list, grid, columns, dual pane.
- [x] Add preview for text/code/json/markdown/image/pdf/media/binary/hex.
- [x] Add Git badges, status, and per-file diff.
- [x] Add robust multi-select operations.
- [x] Add drag-and-drop copy/move between panes and external shell where feasible.
- [x] Add persisted tab restore per workspace/cwd.
- [x] Add large-directory virtualization or chunked rendering verification for 5k+ entries.

## Phase 3: Integrated Editor

- [x] Make text editor reliable for `.py`, `.js`, `.json`, `.md`, `.env`, and other text files.
- [x] Keep plain textarea fallback available while IDE mode uses CodeMirror by default.
- [x] Fix mouse focus so fields do not immediately deselect.
- [x] Save and Save As route through devfs IPC.
- [x] Add line numbers, search, replace, modified marker, encoding display, and status bar.
- [x] Add IDE mode with CodeMirror command palette, local completions, folding, search keymaps, and JSON lint gutter.
- [x] Add VS Code-style file sidebar inside the IDE workbench with readable icons and filtering.
- [x] Add configurable default open behavior for text/media/binary files.
- [x] Add clearer error states for large files and non-UTF8 files.
- [x] Add VS Code-style workspace quick open, project-wide search, multi-file editor tabs, and split editor panes.
- [ ] Add LSP bridge through main/preload IPC for diagnostics, hover, go-to-definition, and references.

## Phase 4: Settings Center

- [x] Add an accessible Settings launcher.
- [x] Organize settings into tabs.
- [x] Expose theme, terminal colors, explorer, editor, AI, updates, startup, and widget basics.
- [x] Expose per-widget controls directly in Settings Center.
- [x] Expose privacy toggles for IP, interface, and geolocation.
- [x] Add theme preview before reload.
- [x] Add reset-to-default per section.
- [x] Add validation for colors, paths, ports, shell, and numeric ranges.
- [x] Add import/export settings profile.

## Phase 5: Widgets, Layout, Privacy

- [x] Add granular Widget Visibility modal.
- [x] Allow hiding only IP while leaving network status visible.
- [x] Allow hiding interface and geolocation independently.
- [x] Move Settings/Widgets launchers away from network status.
- [x] Add layout presets: Classic, Minimal, Developer, Privacy, Cinematic.
- [x] Persist window positions/layout presets for internal windows.
- [x] Add a compact launcher header that avoids keyboard, side panels, and network widgets at all supported sizes.

## Phase 6: Terminal and Shell

- [x] Add manual terminal foreground/background overrides.
- [x] Keep terminal focus stable when interacting with explorer/editor/settings.
- [x] Open terminal in current explorer directory.
- [x] Avoid unsupported-OS cwd tracking errors becoming noisy failures.
- [x] Improve cwd detection for PowerShell, Git Bash, WSL, cmd, and Linux shells.
- [x] Add Settings UI for shell args/env/cwd with validation and test button.
- [x] Improve terminal-local copy/paste, selection behavior, and multi-tab close flow.
- [x] Add a lightweight SSH Client that launches native `ssh` commands with keepalive/auth controls, guided key setup, and key-login diagnostics in terminal tabs.

## Phase 7: Visual Sci-Fi Polish

- [x] Add eDEX Revival welcome/boot text.
- [x] Use icon-based explorer actions in full modes.
- [x] Keep dock explorer visually restrained.
- [x] Create Revival theme variants with good contrast.
- [x] Add icon/tooltips consistency pass across settings, widgets, explorer, editor, and windows.
- [ ] Add optional boot/welcome visual assets without hiding the actual app.

## Phase 8: Network, Globe, Diagnostics

- [x] Add network/IP privacy toggles.
- [x] Allow hiding globe/location independently.
- [x] Improve network interface picker and active interface display.
- [x] Add local diagnostics panel for network-adjacent settings, shell, GPU, filesystem permissions, and startup registration.
- [x] Add reduced/offline globe mode for privacy and low GPU systems.
- [x] Add terminal Error to Fix flow for Codex/Claude handoff without showing AI controls when disabled.

## Phase 9: Touch, HiDPI, Responsiveness

- [x] Basic overlap fixes for Settings and Widgets launchers.
- [ ] Verify and tune 1920x1080, 1366x768, and 960x540.
- [ ] Add Windows scaling/HiDPI pass.
- [ ] Add optional touch-friendly sizing mode.
- [ ] Ensure no text overflow in command bars, tabs, modals, editor, settings, and status bars.

## Phase 10: Plugins and Local Extensibility

- [x] Add local plugin manager surface and preload/main listing.
- [x] Document plugin manifest and permissions.
- [x] Add safe panel/command/view contribution API.
- [x] Add example plugins: markdown panel, command launcher, status widget.
- [x] Add plugin error boundary and disabled-plugin recovery path.

## Phase 11: Packaging, Release, Community

- [x] Keep `npm start` intro-friendly.
- [x] Review Windows packaging after Revival changes.
- [x] Add Revival changelog and release notes.
- [x] Add packaged auto-update download/install flow through Electron Builder metadata.
- [x] Add contribution guide for bugs/features/screenshots.
- [x] Add issue templates for visual, explorer, terminal, settings, performance, and packaging bugs.

## Next Implementation Cursor

Next pass: optional touch-friendly sizing and final release polish. LSP/debugger/marketplace work remains out of scope for this Revival UX package unless explicitly prioritized later.

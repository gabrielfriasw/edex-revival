# eDEX Revival Changelog

## Unreleased

## v1.0.3 - 2026-06-19

- Added a Spotify Connect player widget with user-supplied Client ID setup, PKCE OAuth, encrypted token storage when Electron `safeStorage` is available, playback controls, album art proxying through the main process, and no client secret storage.
- Added an in-app Spotify setup guide covering the user-owned Spotify Developer app, Web API selection, loopback Redirect URI, required scopes, and Client ID-only configuration.
- Added drag-and-drop widget ordering with left/right column layout persistence in Widget Visibility.
- Added adaptive widget sizing so the Spotify player expands when its column has available space, plus a fullscreen Spotify focus mode.

## v1.0.2 - 2026-06-18

- Added a native packaged auto-update flow with background download, progress UI, restart/install action, install-on-quit support, and Settings toggles.
- Added guided SSH key setup: generate an Ed25519 key, copy the public key, build an install command, test key login, and switch profiles to key-based authentication.
- Added SSH keepalive, timeout, key-agent, auth-mode, host-key, compression, and diagnostics controls while preserving the no-password-storage policy.
- Fixed PowerShell SSH command quoting so generated install commands do not corrupt quoted remote commands.
- Improved SSH key diagnostics for unreadable keys, refused keys, remote permission issues, and accepted authentication methods.
- Fixed terminal copy/paste shortcuts for Ctrl+Shift+C, Ctrl+Shift+V, Ctrl+Insert, and Shift+Insert.
- Added close controls for terminal tabs with safer active-tab handling.
- Reworked floating developer windows with minimize-to-dock, restore, maximize, snap left/right, close, and edge/corner resizing.
- Hardened cockpit, SSH, terminal, and modal surfaces against theme bleed-through and plain-text fallback rendering.
- Added launcher, dev window, and SSH debug logs to make UI failures easier to diagnose.

## v1.0.1

- Replaced the fixed `systeminformation` worker pool with a lazy scheduler, cache, request dedupe, queue pressure scaling, idle reaping, and diagnostics counters.
- Added Performance settings for worker limits, hidden-widget pausing, window blur pausing, globe startup, terminal WebGL/ligatures, feedback audio, cinematic audio, lazy audio, background throttling, and Error Lens capture.
- Reduced renderer and widget work when users opt into pause behavior.
- Added GitHub Actions release automation for tagged `v*` builds with Windows and Linux assets.

## v1.0.0

- Renamed the app metadata to eDEX Revival 1.0.0 under `com.frias.edexrevival`, with Gabriel Frias as Revival author while preserving original eDEX-UI attribution.
- Added Revival layout presets: Classic, Minimal, Developer, Privacy, and Cinematic.
- Added the auto-hide icon launcher header for Settings, Widgets, Explorer, Diagnostics, Editor, SSH, Network Lens, Theme Tools, and Layout Tools.
- Added Revival theme variants: classic cinematic, cyan contrast, amber contrast, and high contrast.
- Added `editor.defaultOpenBehavior` with smart, editor, preview, external, and ask modes.
- Added a native SSH profile client that opens saved hosts in terminal tabs without storing passwords.
- Added an Error to Fix flow for the latest terminal diagnostic, with direct Codex, Claude, auto-provider, and copy-prompt actions when AI is enabled.
- Added a startup ANSI sprite banner for the first terminal, controlled by `terminal.showStartupBanner`.
- Removed IP address display from Network Status; it now shows only state and ping.
- Fixed PowerShell startup integration so the CWD tracking command no longer appears as typed terminal input.
- Improved editor error handling for large files, binary files, invalid UTF-8, and permission failures.
- Added visible editor actions for Open External, Copy Path, Reveal in Explorer, and Sidebar.
- Improved terminal shell argument parsing, shell test settings, tab close confirmation, and CWD fallback noise.
- Added network `iface=auto` handling, detailed interface picker labels, and `widgets.globeMode`.
- Privacy preset now hides IP/interface/geo and prevents unnecessary public IP/geolocation lookups.
- Fixed Windows packaging by removing the stale global `brace-expansion` override that broke `electron-builder`'s `minimatch@10` dependency.
- Fixed Windows package size by removing the circular `src` dependency on the repository root.
- Added plugin manifest documentation, example plugins, and plugin error recovery state.
- Added Revival release notes, contribution guide, and focused issue templates.

# eDEX Revival Changelog

## Unreleased

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

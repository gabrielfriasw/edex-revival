# eDEX Revival Release Notes

## v1.0.6

Emergency packaged startup fix.

### Fixes

- Fixed packaged Windows/Linux startup failure caused by `_boot.js` requiring `../package.json` after the app is assembled from `prebuild-src`.
- Added a package metadata fallback so development runs and packaged builds both keep safe update defaults instead of aborting during boot.

### Compatibility Notes

- Existing settings are merged forward on boot.
- Windows and Linux remain the supported package targets.

### Validation

- `node --check` on touched JavaScript files.
- `npm test`.
- `git diff --check`.
- trailing whitespace scan.

### Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

Auto-update metadata is included as `latest.yml` and installer blockmap assets where generated.

## v1.0.5

Security hardening, Spotify palette, privacy, and plugin trust release.

### Highlights

- Added optional Spotify dynamic palette theming for the normal widget and fullscreen focus mode.
- `spotify.dynamicPalette` supports `fullscreen`, `always`, and `off`.
- Album colors are extracted locally from the already-rendered album art; no AI model, remote palette service, or persisted color profile is used.
- Terminal WebSocket sessions now bind to loopback and require a random per-session token before the renderer can attach.
- Terminal IPC resize/startup messages now include the session token and trusted-sender checks.
- Settings save/import/export now run through main-process IPC with validation, backups, and atomic writes.
- Added session-only screen-share mode for masking sensitive paths, SSH/network labels, interface data, and geolocation while presenting or recording.
- Plugin Manager now shows trust state, declared permissions, health, and last errors, with a third-party plugin recovery action.

### Fixes And Hardening

- Added a terminal transport regression harness for loopback/token validation.
- Added explicit terminal cleanup for renderer listeners, DOM listeners, timers, WebSocket clients, WebSocket servers, and pty data subscriptions.
- Changed new-install performance defaults to pause hidden widgets and pause when the app window is blurred.
- Blocked public IP/geolocation resolution while screen-share mode is active.
- Made unsigned update behavior conservative: automatic update downloads stay disabled until signed release enforcement is enabled.
- Added AI prompt retention controls and removed shell-chained prompt deletion. Prompt cleanup now runs through a narrow backend IPC path.
- Added plugin-owned interval cleanup support so example plugins do not leave timers running after plugin/window shutdown.
- Renamed visible IDE labels to Workbench to keep expectations aligned with the lightweight developer cockpit scope.
- Removed the internal roadmap/checklist document from public release docs.

### Compatibility Notes

- Existing settings are merged forward on boot.
- Existing users who already enabled automatic update downloads will still see update checks, but downloads are not automatic while release signing enforcement is disabled.
- Spotify still uses the existing user-owned Spotify Web API setup. No Client Secret is stored or required.
- SSH passwords are still never stored, and AI controls remain hidden unless `ai.enabled` is explicitly true.
- Plugins are local trusted code. Install only plugins you trust.
- LSP, debugger, extension marketplace, and macOS release work remain outside this release cycle.
- Windows and Linux remain the supported package targets.

### Validation

- `node --check` on touched JavaScript files.
- `npm run test:terminal-transport`.
- CSS brace checks on touched stylesheets.
- `git diff --check`.
- trailing whitespace scan.
- `npm test`.
- Windows package build.

### Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

Auto-update metadata is included as `latest.yml` and installer blockmap assets where generated.

## v1.0.4

Dual monitor, fullscreen startup, and Settings Center cleanup release.

### Highlights

- Added Dual Monitor Mode for systems with a second display.
- The secondary monitor can now be configured for Spotify focus, widgets, terminal, or a blank stage.
- Spotify remains the default secondary-monitor experience, with portrait and landscape intent available for vertical or horizontal displays.
- Secondary windows now participate in the eDEX startup rhythm with boot/intro handling instead of jumping straight into the widget.
- Fullscreen startup is stricter: force-fullscreen settings now take priority over saved window bounds.
- When Spotify is assigned to the second monitor, the primary monitor removes the Spotify widget so the main cockpit stays cleaner.
- Settings Center was reorganized into clearer groups with search, compact top actions, and a More menu so users are not dropped into a wall of buttons.
- Launcher Theme Tools and Layout Tools were removed because their actions were redundant with Settings and presets.

### Fixes

- Fixed secondary Spotify focus mode so it sizes and stacks as a true display surface instead of a small or clipped window.
- Fixed Spotify fullscreen title handling so ASCII-style playback text has more room and avoids clipping, including "NO ACTIVE PLAYBACK" states.
- Fixed primary/secondary Spotify duplication when the secondary monitor owns the Spotify display.
- Fixed fullscreen restore behavior that could let saved window state override explicit fullscreen startup.
- Reduced Settings Center visual overload by removing duplicate bottom action buttons and consolidating secondary commands.

### Compatibility Notes

- Existing settings are merged forward on boot.
- Dual Monitor Mode is disabled unless a secondary display is available and the setting is enabled.
- Spotify on the secondary monitor still uses the existing user-owned Spotify Web API setup. No Client Secret is stored or required.
- SSH passwords are still never stored, and AI controls remain hidden unless `ai.enabled` is explicitly true.
- Windows and Linux remain the supported package targets for this release cycle.

### Validation

- `node --check` on touched JavaScript files.
- `git diff --check`.
- trailing whitespace scan.
- `npm test`.
- Windows package build.

### Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

Auto-update metadata is included as `latest.yml` and installer blockmap assets where generated.

## v1.0.3

Spotify cockpit, widget layout, and fullscreen focus release.

### Highlights

- Added a Spotify Connect player widget powered by Spotify Web API and Authorization Code with PKCE.
- Spotify setup is user-owned: each user supplies their own Spotify Developer app Client ID, with no Client Secret stored or required.
- Settings Center now includes a guided Spotify setup flow with Dashboard/docs links, Redirect URI copy, Web API selection guidance, scopes, and Client ID-only instructions.
- Added adaptive widget layout controls with drag-and-drop ordering between left and right columns.
- Added Spotify Solo layout support and responsive widget density so Spotify can expand when other widgets are hidden.
- Added a fullscreen Spotify focus mode with album art, ASCII-style title display, playback timeline, centered controls, and minimal volume.

### Screenshots

![Spotify fullscreen focus mode](https://raw.githubusercontent.com/gabrielfriasw/edex-revival/v1.0.3/media/revival/spotify2.png)

<img alt="Spotify widget" src="https://raw.githubusercontent.com/gabrielfriasw/edex-revival/v1.0.3/media/revival/spotify-widget.png" width="360">

### Fixes

- Fixed Spotify fullscreen stacking and sizing so focus mode uses the full viewport instead of rendering as a clipped centered panel.
- Fixed Spotify widget click handling so setup/connect/fullscreen actions respond reliably.
- Fixed Spotify API handling for empty `204 No Content` playback responses.
- Fixed settings JSON loading for UTF-8 BOM-prefixed files.
- Improved hidden-widget behavior so disabled widgets are removed from layout flow.
- Refined Spotify play/pause icon geometry and button spacing in normal and fullscreen modes.

### Compatibility Notes

- Users must create their own Spotify Developer app and select `Web API`.
- Add the exact Redirect URI shown in Settings, usually `http://127.0.0.1:43879/spotify/callback`.
- Paste only the Spotify app Client ID. Do not paste or store a Client Secret.
- Spotify Premium may be required by Spotify for some playback-control behavior.
- Existing settings are merged forward on first boot.

### Validation

- `node --check` on touched JavaScript files.
- CSS brace checks on touched stylesheets.
- `git diff --check`.
- trailing whitespace scan.
- `npm test`.

### Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

## v1.0.2

SSH reliability, native updates, terminal workflow, and floating-window UX release.

### Highlights

- Packaged builds now use a native update flow: check, background download, progress display, restart/install action, and install-on-quit support.
- Settings Center now includes update controls for enabling updates, startup checks, auto-download, and install-on-quit.
- SSH Client now guides users through safe key-based access: generate an Ed25519 key, copy the public key, install it on the server, test key login, and switch the profile to key authentication.
- SSH profiles gained keepalive, timeout, auth-mode, key-agent, host-key, compression, and diagnostics controls without storing passwords.
- Floating developer windows now support minimize-to-dock, restore, maximize, snap left/right, close, and edge/corner resize.
- Terminal tabs now have close controls, and terminal-local copy/paste shortcuts work with Ctrl+Shift+C, Ctrl+Shift+V, Ctrl+Insert, and Shift+Insert.

### Fixes

- Fixed PowerShell quoting for generated SSH install commands.
- Improved SSH key-login diagnostics for unreadable keys, refused keys, remote permission issues, and accepted authentication methods.
- Fixed a cockpit CSS parse failure that could make the SSH window render as plain text/native buttons.
- Hardened cockpit, SSH, terminal, and modal surfaces against theme bleed-through.
- Added launcher, dev window, and SSH debug logs for easier troubleshooting.

### Compatibility Notes

- Passwords are still never stored. SSH authentication stays with native `ssh`, keys, ssh-agent, and terminal prompts.
- Users on v1.0.1 or earlier should install v1.0.2 manually once. Native auto-update support applies to packaged builds from this version forward.
- Packaged update checks require GitHub release metadata generated by Electron Builder.
- Build hosts should use Node 24.x to avoid engine warnings from the package metadata.

### Validation

- `node --check` on touched JavaScript files.
- CSS brace checks on touched stylesheets.
- `git diff --check`.
- trailing whitespace scan.
- `npm test`.

### Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

## v1.0.1

Performance and release automation update for the first Revival line.

### Highlights

- Replaced the fixed `systeminformation` worker pool with a configurable lazy scheduler, short-lived cache, request dedupe, queue pressure scaling, idle reaping, and diagnostics counters.
- Added Performance settings for worker limits, hidden-widget pausing, window blur pausing, globe startup, terminal WebGL/ligatures, feedback audio, cinematic audio, lazy audio, background throttling, and Error Lens capture.
- Kept the default experience conventional and cinematic, while making lower-resource behavior available through user settings.
- Widgets can now stop timers, chart streams, polling, and globe work when users opt into pause behavior.
- Globe assets load only when needed, and terminal output diagnostics are debounced to reduce unnecessary renderer work.
- GitHub Actions now publishes tagged `v*` builds directly to GitHub Releases with Windows and Linux assets.

### Validation

- `node --check` on touched JavaScript files.
- `git diff --check`.
- trailing whitespace scan.
- `npm test`.
- `npm start` smoke test on Windows.

## v1.0.0

First Revival release of eDEX, focused on keeping the original sci-fi terminal identity while making the app easier to use on modern Windows and Linux systems.

## Highlights

- App identity is now `eDEX Revival` 1.0.0 with `com.frias.edexrevival` packaging metadata.
- `Classic` remains the recommended default layout, with Minimal, Developer, Privacy, and Cinematic presets available.
- Auto-hide top launcher header replaces loose Settings/Widgets buttons when enabled, while the old buttons remain as fallback.
- Startup terminal now shows an `eDEX Revival` ANSI sprite banner.
- SSH Client stores host profiles and opens native `ssh` sessions in terminal tabs without storing passwords.
- Error to Fix flow turns the latest terminal diagnostic into an editable Codex/Claude prompt when AI integration is enabled.
- Lightweight editor workbench has safer smart-open behavior for text, media, large files, binary files, and invalid UTF-8.
- File Operations Cockpit adds a richer explorer, preview, Git-aware actions, batch operations, and terminal-here flow.
- Network Status now shows only state and ping; IP display was removed from that panel.
- Privacy mode hides interface/geolocation details and prevents unnecessary public IP/geolocation lookups.
- Terminal settings now include shell path, shell args, cwd, env, and a Test Shell button.
- Plugin failures are contained and surfaced in Plugin Manager.
- Windows packaging has been rebuilt and verified for the Revival identity.
- Linux AppImage packaging is the supported Linux release target.

## Compatibility Notes

- Existing settings are merged forward on boot.
- LSP/debugger/extension marketplace work remains out of scope for this package.
- AI actions remain hidden unless `ai.enabled` is explicitly true.
- No chat assistant, model download, SSH password storage, or API key storage is included.
- SSH profiles store host, user, port, key path, remote cwd, and extra args only; authentication stays with the native SSH client.
- Build hosts should use Node 24.x to avoid engine warnings from the package metadata.
- Release binaries are unsigned, so Windows SmartScreen can warn until the app builds reputation.
- macOS builds are not shipped in this release cycle.

## Download

Use the Windows installer attached to this release. Linux builds use the AppImage target:

```text
eDEX-Revival-Windows-x64.exe
eDEX-Revival-Linux-x86_64.AppImage
```

Auto-update metadata is included as `latest.yml` and `eDEX-Revival-Windows-x64.exe.blockmap`.

## Credits

eDEX Revival is a GPL-3.0 fork and continuation of the original eDEX-UI by Gabriel "Squared" Saillard. Revival development and packaging are maintained by Gabriel Frias.

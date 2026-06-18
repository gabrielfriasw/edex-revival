# eDEX Revival Release Notes

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

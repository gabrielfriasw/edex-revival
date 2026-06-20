# Plugin Manifest

Plugins live in a directory with a `plugin.json` manifest and an entry JavaScript file.

```json
{
    "id": "example.plugin",
    "name": "Example Plugin",
    "version": "0.1.0",
    "entry": "index.js",
    "permissions": ["window"],
    "contributes": {
        "commands": ["example.hello"],
        "panels": ["example.panel"],
        "statusWidgets": ["example.status"]
    }
}
```

## Fields

- `id`: Stable unique plugin id.
- `name`: Display name shown in Plugin Manager.
- `version`: Plugin version string.
- `entry`: Relative path to the JavaScript module.
- `permissions`: Declared capabilities. Current examples use `window`, `commands`, `panels`, and `status`; runtime APIs reject calls for permissions that are not declared.
- `contributes`: Optional metadata for commands, panels, and status widgets.

## Trust And Recovery

Bundled plugins are marked `bundled` in Plugin Manager. Plugins under the user data plugin directory are marked `local`, and configured external paths are marked `custom`.

Plugins are local code. Install only plugins you trust. Plugin Manager shows trust state, declared permissions, contributions, health, and the last recorded error. The recovery action disables third-party plugins while leaving bundled examples available.

## Runtime API

The entry module may export `activate(api)`.

- `api.registerCommand(id, label, handler)`: Registers a command callable by plugin UI.
- `api.registerPanel(id, label, render)`: Registers a panel renderer.
- `api.openWindow(options)`: Opens an internal eDEX window. A panel/window `render` callback may return a cleanup function.
- `api.setInterval(handler, ms)`: Creates a plugin-owned interval and registers it for cleanup.
- `api.notify(message)`: Shows an informational modal.

If activation throws, eDEX records the error, disables the plugin, and keeps the UI running. If `activate(api)` returns a function, eDEX calls it when the plugin is deactivated or reloaded.

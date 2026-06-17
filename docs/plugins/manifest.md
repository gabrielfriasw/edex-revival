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
- `permissions`: Declared capabilities. Current examples use `window`, `commands`, `panels`, and `status`.
- `contributes`: Optional metadata for commands, panels, and status widgets.

## Runtime API

The entry module may export `activate(api)`.

- `api.registerCommand(id, label, handler)`: Registers a command callable by plugin UI.
- `api.registerPanel(id, label, render)`: Registers a panel renderer.
- `api.openWindow(options)`: Opens an internal eDEX window.
- `api.notify(message)`: Shows an informational modal.

If activation throws, eDEX records the error, disables the plugin, and keeps the UI running.

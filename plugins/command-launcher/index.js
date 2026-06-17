exports.activate = api => {
    api.registerCommand("launcher.hello", "Example: Hello", () => {
        api.notify("Command launcher example executed.");
    });
    api.openWindow({
        id: "plugin-command-launcher",
        title: "Command Launcher",
        subtitle: "example plugin",
        className: "dev_plugins_window",
        rect: {left: 26, top: 16, width: 38, height: 28},
        render: body => {
            body.innerHTML = "<div class=\"devfs_empty\">Registered command: launcher.hello</div>";
        }
    });
};

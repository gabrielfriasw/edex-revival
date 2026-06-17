exports.activate = api => {
    api.registerPanel("markdown.preview", "Markdown Preview", body => {
        body.innerHTML = [
            "<div class=\"devfs_empty\">",
            "<strong>Markdown Panel</strong>",
            "<p>This example plugin opens a read-only markdown-oriented panel.</p>",
            "</div>"
        ].join("");
    });
    api.openWindow({
        id: "plugin-markdown-panel",
        title: "Markdown Panel",
        subtitle: "example plugin",
        className: "dev_plugins_window",
        rect: {left: 24, top: 14, width: 42, height: 32},
        render: body => {
            body.innerHTML = "<div class=\"devfs_empty\">Markdown plugin panel is active.</div>";
        }
    });
};

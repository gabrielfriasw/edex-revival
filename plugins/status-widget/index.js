exports.activate = api => {
    api.openWindow({
        id: "plugin-status-widget",
        title: "Status Widget",
        subtitle: "example plugin",
        className: "dev_plugins_window",
        rect: {left: 28, top: 18, width: 34, height: 24},
        render: body => {
            const update = () => {
                body.innerHTML = `<div class="devfs_empty">Example status: ${new Date().toLocaleTimeString()}</div>`;
            };
            update();
            setInterval(update, 1000);
        }
    });
};

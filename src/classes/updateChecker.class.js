class UpdateChecker {
    constructor() {
        let current = edex.app.getVersion();

        this._failed = false;
        this._fail = e => {
            this._failed = true;
            ipc.send("log", "note", "UpdateChecker: Could not fetch latest release from GitHub's API.");
            ipc.send("log", "debug", `Error: ${e}`);
        };

        edex.getLatestRelease().then(release => {
            try {
                if (release.tag_name.slice(1) === current) {
                    ipc.send("log", "info", "UpdateChecker: Running latest version.");
                } else if (Number(release.tag_name.slice(1).replace(/\./g, "")) < Number(current.replace("-pre", "").replace(/\./g, ""))) {
                    ipc.send("log", "info", "UpdateChecker: Running an unreleased, development version.");
                } else {
                    new Modal({
                        type: "info",
                        title: "New version available",
                        message: `eDEX Revival <strong>${release.tag_name}</strong> is now available.<br/>Head over to <a href="#" onclick="edex.openExternal('${release.html_url}')">github.com</a> to download the latest version.`
                    });
                    ipc.send("log", "info", `UpdateChecker: New version ${release.tag_name} available.`);
                }
            } catch(e) {
                this._fail(e);
            }
        }).catch(this._fail);
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        UpdateChecker
    };
}

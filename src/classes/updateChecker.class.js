class UpdateChecker {
    constructor() {
        this.current = edex.app.getVersion();
        this.modal = null;
        this.lastState = null;
        window.edexUpdateChecker = this;

        if (edex.updates && typeof edex.updates.onEvent === "function") {
            this.unsubscribe = edex.updates.onEvent(state => this.handleState(state));
            edex.updates.state().then(state => {
                if (state && state.supported === false && state.status !== "disabled") this.fallbackGitHubCheck();
                this.handleState(state);
            }).catch(error => this.fail(error));
        } else {
            this.fallbackGitHubCheck();
        }
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    titleForState(state) {
        switch(state && state.status) {
            case "available":
                return "Update available";
            case "downloading":
                return "Downloading update";
            case "downloaded":
                return "Update ready";
            case "error":
                return "Update failed";
            default:
                return "eDEX Revival updates";
        }
    }

    messageForState(state) {
        const version = state && state.version ? `v${state.version}` : "a new version";
        switch(state && state.status) {
            case "available":
                return `${version} is available.`;
            case "downloading":
                return `${version} is downloading in the background.`;
            case "downloaded":
                return `${version} has been downloaded and is ready to install.`;
            case "error":
                return state.error || "The update check failed.";
            default:
                return "Checking for updates.";
        }
    }

    progressForState(state) {
        if (!state || state.status !== "downloading") return "";
        const percent = Math.max(0, Math.min(100, Number(state.progress) || 0));
        return `<progress value="${percent.toFixed(1)}" max="100"></progress><span>${percent.toFixed(1)}%</span>`;
    }

    actionButtons(state) {
        if (!state) return "";
        if (state.status === "available") {
            return `<button type="button" onclick="window.edexUpdateChecker.download()">Download</button>`;
        }
        if (state.status === "downloaded") {
            return `<button type="button" onclick="window.edexUpdateChecker.install()">Restart & Install</button>`;
        }
        if (state.status === "error") {
            return `<button type="button" onclick="window.edexUpdateChecker.check()">Retry</button>`;
        }
        return "";
    }

    panelHtml(state) {
        return `<div class="update_status_panel">
            <strong>${this.escape(this.messageForState(state))}</strong>
            ${state && state.releaseName ? `<span>${this.escape(state.releaseName)}</span>` : ""}
            ${state && state.releaseDate ? `<span>${this.escape(new Date(state.releaseDate).toLocaleString())}</span>` : ""}
            <div class="update_progress">${this.progressForState(state)}</div>
            <div class="update_actions">${this.actionButtons(state)}</div>
        </div>`;
    }

    openOrUpdate(state) {
        const element = this.modal ? document.getElementById(`modal_${this.modal.id}`) : null;
        if (element) {
            const title = element.querySelector("h1");
            const panel = element.querySelector(".update_status_panel");
            if (title) title.textContent = this.titleForState(state);
            if (panel) panel.outerHTML = this.panelHtml(state);
            return;
        }

        this.modal = new Modal({
            type: "custom",
            title: this.titleForState(state),
            html: this.panelHtml(state),
            buttons: []
        }, () => {
            this.modal = null;
        });
    }

    handleState(state) {
        if (!state || !state.status) return;
        this.lastState = state;
        if (state.status === "latest") {
            ipc.send("log", "info", "UpdateChecker: Running latest version.");
            return;
        }
        if (["available", "downloading", "downloaded", "error"].includes(state.status)) {
            this.openOrUpdate(state);
        }
    }

    async check() {
        if (!edex.updates) return false;
        try {
            this.handleState(await edex.updates.check());
            return true;
        } catch(error) {
            this.fail(error);
            return false;
        }
    }

    async download() {
        if (!edex.updates) return false;
        try {
            this.handleState(await edex.updates.download());
            return true;
        } catch(error) {
            this.fail(error);
            return false;
        }
    }

    install() {
        if (edex.updates) edex.updates.install();
    }

    openRelease() {
        if (this.releaseURL) edex.openExternal(this.releaseURL);
    }

    fail(error) {
        ipc.send("log", "note", "UpdateChecker: Could not check for updates.");
        ipc.send("log", "debug", `Error: ${error && error.message ? error.message : error}`);
    }

    isNewer(tagName) {
        const latest = String(tagName || "").replace(/^v/i, "");
        const current = String(this.current || "").replace("-pre", "");
        const normalize = value => value.split(".").map(part => Number(part) || 0);
        const a = normalize(latest);
        const b = normalize(current);
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if ((a[i] || 0) > (b[i] || 0)) return true;
            if ((a[i] || 0) < (b[i] || 0)) return false;
        }
        return false;
    }

    fallbackGitHubCheck() {
        if (!edex.getLatestRelease || this.fallbackStarted) return;
        this.fallbackStarted = true;
        edex.getLatestRelease().then(release => {
            if (!this.isNewer(release.tag_name)) {
                ipc.send("log", "info", "UpdateChecker: Running latest version.");
                return;
            }
            this.releaseURL = release.html_url;
            new Modal({
                type: "custom",
                title: "New version available",
                html: `<div class="update_status_panel">
                    <strong>eDEX Revival ${this.escape(release.tag_name)} is available.</strong>
                    <span>Automatic install is available in packaged builds. This development run can open the release page.</span>
                    <div class="update_actions"><button type="button" onclick="window.edexUpdateChecker.openRelease()">Open Release</button></div>
                </div>`,
                buttons: []
            });
            ipc.send("log", "info", `UpdateChecker: New version ${release.tag_name} available.`);
        }).catch(error => this.fail(error));
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        UpdateChecker
    };
}

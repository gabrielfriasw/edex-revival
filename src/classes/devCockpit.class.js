const DEVFS_ICON_PATHS = {
    back: '<path d="M15 18l-6-6 6-6"/><path d="M9 12h12"/>',
    forward: '<path d="M9 18l6-6-6-6"/><path d="M3 12h12"/>',
    up: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.4 6.4"/><path d="M3 12a9 9 0 0 1 15.4-6.4"/><path d="M18 2v4h-4"/><path d="M6 22v-4h4"/>',
    filePlus: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11v6"/><path d="M9 14h6"/>',
    folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v6"/><path d="M9 14h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
    rename: '<path d="M4 20h16"/><path d="M14 4l6 6"/><path d="M12 6l6 6-8 8H4v-6z"/>',
    duplicate: '<path d="M8 8h10a2 2 0 0 1 2 2v10H8z"/><path d="M4 16V4h12"/>',
    copy: '<path d="M8 8h12v12H8z"/><path d="M4 16V4h12"/>',
    move: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/><path d="M5 5v14"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/>',
    open: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    terminal: '<path d="M4 17l6-5-6-5"/><path d="M12 19h8"/>',
    path: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    wsl: '<path d="M4 5h16v14H4z"/><path d="M7 9l3 3-3 3"/><path d="M12 15h5"/>',
    edit: '<path d="M12 20h9"/><path d="M16 4l4 4L8 20H4v-4z"/>',
    media: '<path d="M4 5h16v14H4z"/><path d="M9 9l6 3-6 3z"/>',
    pin: '<path d="M12 17v5"/><path d="M5 17h14"/><path d="M9 3h6l1 7 3 3H5l3-3z"/>',
    plugins: '<path d="M8 3v5"/><path d="M16 3v5"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>',
    network: '<path d="M12 4a8 8 0 0 1 8 8"/><path d="M4 12a8 8 0 0 1 8-8"/><path d="M6 18a8 8 0 0 0 12 0"/><circle cx="12" cy="12" r="2"/><path d="M12 14v7"/>',
    theme: '<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2 2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 10 10 0 0 0-9-10z"/><circle cx="7.5" cy="10.5" r=".5"/><circle cx="10.5" cy="7.5" r=".5"/><circle cx="14" cy="7.5" r=".5"/><circle cx="16.5" cy="10.5" r=".5"/>',
    layout: '<path d="M3 3h18v18H3z"/><path d="M9 3v18"/><path d="M3 9h18"/>',
    hidden: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20 20 4"/>',
    extensions: '<path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z"/><path d="M14 2v6h6"/><path d="M8 14h8"/><path d="M8 18h5"/>',
    preview: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    dock: '<path d="M5 20h14"/><path d="M8 16h8"/>',
    minimize: '<path d="M5 19h14"/>',
    maximize: '<path d="M4 4h16v16H4z"/>',
    restore: '<path d="M8 8h10v10H8z"/><path d="M6 14H4V4h10v2"/>',
    snapLeft: '<path d="M4 4h16v16H4z"/><path d="M11 4v16"/>',
    snapRight: '<path d="M4 4h16v16H4z"/><path d="M13 4v16"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    window: '<path d="M4 5h16v14H4z"/><path d="M4 9h16"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    grid: '<path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/>',
    columns: '<path d="M4 4h5v16H4z"/><path d="M10 4h5v16h-5z"/><path d="M16 4h4v16h-4z"/>',
    dualPane: '<path d="M4 5h7v14H4z"/><path d="M13 5h7v14h-7z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    symlink: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    deleted: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/>',
    code: '<path d="M9 18 3 12l6-6"/><path d="M15 6l6 6-6 6"/>',
    image: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-5 4 4 2-2 5 5"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z"/><path d="M14 2v6h6"/><path d="M7 15h10"/>',
    audio: '<path d="M9 18V5l10-2v13"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
    video: '<path d="M4 6h12v12H4z"/><path d="M16 10l5-3v10l-5-3z"/>',
    archive: '<path d="M6 3h12v18H6z"/><path d="M10 3v18"/><path d="M10 7h2"/><path d="M10 11h2"/><path d="M10 15h2"/>',
    json: '<path d="M8 4H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-2"/>',
    markdown: '<path d="M4 6h16v12H4z"/><path d="M7 15V9l3 3 3-3v6"/><path d="M16 9v6"/><path d="M14 13l2 2 2-2"/>',
    git: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 7.5 16.5 16"/><path d="M6 8v8"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 5 15a1.7 1.7 0 0 0-1.5-1H3v-3h.5A1.7 1.7 0 0 0 5 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.8a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L18 8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.9v3h-.9a1.7 1.7 0 0 0-1.7 1z"/>',
    diagnostics: '<path d="M4 4h16v16H4z"/><path d="M8 9h8"/><path d="M8 13h5"/><path d="M8 17h8"/><path d="M17 7l1 1 2-3"/>',
    drive: '<path d="M5 4h14l2 10H3z"/><path d="M3 14v5h18v-5"/><circle cx="17" cy="17" r="1"/>',
    recent: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
    context: '<path d="M5 4h14v16H5z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>'
};

class DevCockpit {
    constructor() {
        this.path = require("path");
        this.lastDiagnostic = null;
        this.lastDiagnosticText = "";
        this.aiTools = null;
        this.contextScan = null;
        this.windowManager = new DevWindowManager();
        this.editor = new DevEditor(this.windowManager);
        this.mediaViewer = new DevMediaViewer(this.windowManager);
        this.pluginHost = new DevPluginHost(this.windowManager);
        this.networkLens = new DevNetworkLens(this.windowManager);
        this.themeTools = new DevThemeLayoutTools(this.windowManager);
        this.sshClient = new DevSshClient(this.windowManager);
        this.lastLocalDiagnostics = null;

        window.onTerminalErrorLensEvent = (terminal, event) => this.onTerminalErrorLensEvent(terminal, event);
        window.openErrorToFixFlow = () => this.openErrorToFixFlow();
        window.openTerminalDiagnostics = number => this.openTerminalDiagnostics(number);
        window.openContextPackManager = () => this.openContextPackManager();
        window.openDevEditor = file => this.editor.open(file);
        window.openDevPluginManager = () => this.pluginHost.openManager();
        window.openDevNetworkLens = () => this.networkLens.openPanel();
        window.openDevThemeEditor = () => this.themeTools.openThemeEditor();
        window.openDevLayoutEditor = () => this.themeTools.openLayoutEditor();
        window.openDevSshClient = () => this.sshClient.open();
        window.openDevDiagnostics = () => this.openLocalDiagnostics();
        window.devCockpitAction = (action, arg) => this.handleAction(action, arg);
        window.devCockpitOpenRef = index => this.openDiagnosticRef(index);
        window.spawnShellTab = options => this.spawnShellTab(options || {});

        setInterval(() => this.refreshDiagnosticBadges(), 2000);
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    isAiEnabled() {
        return !!(window.settings && window.settings.ai && window.settings.ai.enabled === true);
    }

    currentCwd() {
        const term = window.term && window.term[window.currentTerm];
        if (term && term.cwd && !term.cwd.startsWith("FALLBACK |-- ")) return term.cwd;
        if (term && term.cwd && term.cwd.startsWith("FALLBACK |-- ")) return term.cwd.slice(13);
        if (window.fsDisp && window.fsDisp.dirpath) return window.fsDisp.dirpath;
        return window.settings.cwd;
    }

    terminalIndex(terminal) {
        if (!window.term) return 0;
        return Number(Object.keys(window.term).find(key => window.term[key] === terminal) || 0);
    }

    onTerminalErrorLensEvent(terminal, event) {
        if (event) {
            this.lastDiagnostic = terminal.errorLens.getDiagnostic();
            this.lastDiagnosticText = this.formatDiagnostic(this.lastDiagnostic);
            this.networkLens.ingestDiagnostic(event, terminal);
        }
        this.updateDiagnosticBadge(this.terminalIndex(terminal));
    }

    refreshDiagnosticBadges() {
        if (!window.term) return;
        Object.keys(window.term).forEach(key => {
            if (window.term[key] && window.term[key].errorLens) this.updateDiagnosticBadge(Number(key));
        });
    }

    updateDiagnosticBadge(number) {
        const tab = document.getElementById(`shell_tab${number}`);
        const terminal = window.term && window.term[number];
        if (!tab || !terminal || !terminal.errorLens) return;

        const count = terminal.errorLens.count;
        tab.dataset.diagnostics = count;
        tab.classList.toggle("has-diagnostics", count > 0);

        let button = tab.querySelector(".shell_diag_button");
        if (count > 0 && !button) {
            button = document.createElement("button");
            button.className = "shell_diag_button";
            button.type = "button";
            button.title = "Diagnostics";
            button.textContent = "!";
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.openTerminalDiagnostics(number);
            });
            tab.appendChild(button);
        } else if (count === 0 && button) {
            button.remove();
        }
        if (button) button.textContent = String(Math.min(count, 9));
    }

    formatDiagnostic(diagnostic) {
        if (!diagnostic) return "";
        const latest = diagnostic.latest;
        return [
            "Terminal diagnostic",
            `CWD: ${diagnostic.cwd || this.currentCwd()}`,
            latest ? `Type: ${latest.type}` : "Type: none",
            latest ? `Time: ${new Date(latest.time).toISOString()}` : "",
            "",
            latest ? latest.excerpt : "No diagnostic events captured.",
            "",
            "Recent output:",
            diagnostic.output || ""
        ].filter(Boolean).join("\n");
    }

    activeDiagnostic(number) {
        const terminal = window.term && window.term[typeof number === "number" ? number : window.currentTerm];
        if (!terminal || !terminal.errorLens) return null;
        return terminal.errorLens.getDiagnostic();
    }

    openTerminalDiagnostics(number) {
        window.terminalDiagnosticsActiveUntil = Date.now() + 300000;
        const diagnostic = this.activeDiagnostic(number);
        if (!diagnostic) {
            new Modal({type: "info", title: "Diagnostics", message: "No terminal diagnostics are available."});
            return;
        }

        this.lastDiagnostic = diagnostic;
        this.lastDiagnosticText = this.formatDiagnostic(diagnostic);
        const events = diagnostic.events.slice().reverse();
        const latestRefs = diagnostic.latest && diagnostic.latest.refs ? diagnostic.latest.refs : [];

        const eventRows = events.length ? events.map(event => `
            <tr>
                <td>${this.escape(new Date(event.time).toLocaleTimeString())}</td>
                <td>${this.escape(event.severity)}</td>
                <td>${this.escape(event.type)}</td>
                <td><pre>${this.escape(event.excerpt)}</pre></td>
            </tr>`).join("") : `<tr><td colspan="4">No events captured.</td></tr>`;

        const refs = latestRefs.length ? latestRefs.map((ref, index) => {
            const label = ref.type === "file" ? `${ref.path}:${ref.line || 1}${ref.column ? ":"+ref.column : ""}` : (ref.url || ref.ip);
            return `<button class="dev_inline_button" onclick="window.devCockpitOpenRef(${index})">${this.escape(label)}</button>`;
        }).join("") : `<span class="dev_muted">No references detected.</span>`;

        new Modal({
            type: "custom",
            title: "Diagnostics",
                html: `<div class="dev_modal dev_diagnostics">
                    <div class="dev_modal_toolbar">
                        <button onclick="window.devCockpitAction('copy-diagnostic')">Copy</button>
                        <button onclick="window.devCockpitAction('clear-diagnostics')">Clear</button>
                    </div>
                    <div class="dev_diag_refs">${refs}</div>
                    <table>
                        <tr><th>Time</th><th>Severity</th><th>Type</th><th>Excerpt</th></tr>
                        ${eventRows}
                    </table>
                    <pre class="dev_output_preview">${this.escape((diagnostic.output || "").slice(-8000))}</pre>
                </div>`
        });
    }

    openDiagnosticRef(index) {
        const refs = this.lastDiagnostic && this.lastDiagnostic.latest ? this.lastDiagnostic.latest.refs || [] : [];
        const ref = refs[index];
        if (!ref) return;
        if (ref.type === "url") {
            edex.openExternal(ref.url);
        } else if (ref.type === "file") {
            edex.openPath(ref.path);
        } else if (ref.type === "ip") {
            edex.clipboard.writeText(ref.ip);
        }
    }

    aiProviderSetting() {
        const ai = window.settings && window.settings.ai || {};
        return ai.provider || ai.defaultProvider || "auto";
    }

    async resolveAiProvider(provider) {
        const selected = provider && provider !== "auto" ? provider : (this.selectedProvider() || this.aiProviderSetting());
        if (["codex", "claude"].includes(selected)) return selected;
        const tools = this.aiTools || await edex.ai.detectTools();
        this.aiTools = tools;
        return tools && tools.preferred || "codex";
    }
    selectedProvider() {
        const el = document.getElementById("ai_provider");
        return el ? el.value : this.aiProviderSetting();
    }

    async handleAction(action, arg) {
        switch(action) {
            case "copy-diagnostic":
                edex.clipboard.writeText(this.lastDiagnosticText || this.formatDiagnostic(this.activeDiagnostic()));
                return;
            case "clear-diagnostics": {
                const term = window.term && window.term[window.currentTerm];
                if (term && term.errorLens) term.errorLens.clear();
                this.refreshDiagnosticBadges();
                return;
            }
            case "copy-local-diagnostics":
                edex.clipboard.writeText(JSON.stringify(this.lastLocalDiagnostics || {}, null, 2));
                return true;
            case "explain-last-error":
                return this.openErrorToFixFlow();
            case "context-create":
                return this.createContextPack(arg);
            default:
                return false;
        }
    }

    async runAiPrompt(provider, prompt, label) {
        if (!this.isAiEnabled()) return false;
        const selected = await this.resolveAiProvider(provider || this.selectedProvider());
        const result = await edex.ai.runPromptInTab(selected, prompt);
        if (!result || !result.command) {
            new Modal({type: "warning", title: "Error to Fix", message: "No AI command could be prepared."});
            return false;
        }
        const spawned = this.spawnShellTab({initialCommand: result.command, label: label || result.provider});
        if (result.deletePromptOnSend && result.promptFile && edex.ai && typeof edex.ai.consumePrompt === "function") {
            Promise.resolve(spawned).then(() => {
                setTimeout(() => edex.ai.consumePrompt(result.promptFile).catch(() => {}), 30000);
            }).catch(() => {});
        }
        return true;
    }

    async explainLastError() {
        const diagnostic = this.activeDiagnostic();
        if (!diagnostic || !diagnostic.latest) {
            new Modal({type: "info", title: "Error to Fix", message: "No terminal error has been captured yet."});
            return false;
        }
        const prompt = [
            "Explain this terminal error and propose the smallest safe fix.",
            "Include likely root cause, relevant file references, and verification commands.",
            "",
            this.formatDiagnostic(diagnostic)
        ].join("\n");
        return this.runAiPrompt(this.selectedProvider(), prompt, "Explain error");
    }

    latestDiagnostic() {
        const diagnostic = this.activeDiagnostic() || this.lastDiagnostic;
        if (!diagnostic || !diagnostic.latest) return null;
        this.lastDiagnostic = diagnostic;
        this.lastDiagnosticText = this.formatDiagnostic(diagnostic);
        return diagnostic;
    }

    buildErrorFixPrompt(diagnostic) {
        const contextBytes = window.settings.ai && Number(window.settings.ai.contextBytes) || 60000;
        const cwd = diagnostic.cwd || this.currentCwd();
        const latest = diagnostic.latest || {};
        const output = String(diagnostic.output || "").slice(-contextBytes);
        return [
            "You are helping fix this project from an eDEX terminal error.",
            "Goal: identify the root cause and propose the smallest safe fix.",
            "Prefer concrete commands, exact file references, and verification steps.",
            "",
            `CWD: ${cwd}`,
            `Terminal error type: ${latest.type || "unknown"}`,
            `Severity: ${latest.severity || "unknown"}`,
            latest.time ? `Captured: ${new Date(latest.time).toISOString()}` : "",
            "",
            "Error excerpt:",
            latest.excerpt || "[No excerpt captured]",
            "",
            "Recent terminal output:",
            output || "[No recent output captured]"
        ].filter(Boolean).join("\n");
    }

    openErrorToFixFlow() {
        if (!this.isAiEnabled()) return false;
        const diagnostic = this.latestDiagnostic();
        if (!diagnostic) {
            new Modal({type: "info", title: "Error to Fix", message: "No terminal error has been captured yet."});
            return false;
        }
        const prompt = this.buildErrorFixPrompt(diagnostic);
        const existing = this.windowManager.windows["error-to-fix"];
        if (existing) {
            this.windowManager.focus("error-to-fix");
            this.windowManager.setTitle("error-to-fix", "Error to Fix", diagnostic.cwd || this.currentCwd());
            this.renderErrorToFix(existing.body, diagnostic, prompt);
            return existing;
        }
        return this.windowManager.open({
            id: "error-to-fix",
            title: "Error to Fix",
            subtitle: diagnostic.cwd || this.currentCwd(),
            className: "dev_error_fix_window",
            rect: {left: 14, top: 8, width: 72, height: 72},
            render: body => this.renderErrorToFix(body, diagnostic, prompt)
        });
    }

    renderErrorToFix(body, diagnostic, prompt) {
        const latest = diagnostic.latest || {};
        body.innerHTML = `
            <div class="dev_error_fix">
                <div class="dev_error_fix_summary">
                    <div><strong>${this.escape(latest.type || "terminal-error")}</strong><span>${this.escape(latest.severity || "unknown")}</span></div>
                    <div><strong>CWD</strong><span title="${this.escape(diagnostic.cwd || this.currentCwd())}">${this.escape(diagnostic.cwd || this.currentCwd())}</span></div>
                    <div><strong>Provider</strong><span>Codex / Claude / auto</span></div>
                </div>
                <pre class="dev_error_fix_excerpt">${this.escape(latest.excerpt || "No excerpt captured.")}</pre>
                <textarea id="dev_error_fix_prompt" spellcheck="false">${this.escape(prompt)}</textarea>
                <div class="dev_error_fix_actions">
                    <button type="button" data-provider="auto">Auto Provider</button>
                    <button type="button" data-provider="codex">Ask Codex</button>
                    <button type="button" data-provider="claude">Ask Claude</button>
                    <button type="button" data-action="copy">Copy Prompt</button>
                    <button type="button" data-action="clear">Clear Diagnostic</button>
                </div>
                <div class="dev_error_fix_status">Edit the prompt if needed, then send it to the selected local provider.</div>
            </div>`;
        const textarea = body.querySelector("#dev_error_fix_prompt");
        const status = body.querySelector(".dev_error_fix_status");
        body.querySelectorAll("[data-provider]").forEach(button => {
            button.addEventListener("click", () => {
                const provider = button.dataset.provider;
                status.textContent = `Opening ${provider} fix flow...`;
                this.runAiPrompt(provider, textarea.value, `Fix error (${provider})`);
            });
        });
        body.querySelector("[data-action='copy']").addEventListener("click", () => {
            edex.clipboard.writeText(textarea.value);
            status.textContent = "Prompt copied.";
        });
        body.querySelector("[data-action='clear']").addEventListener("click", () => {
            this.handleAction("clear-diagnostics");
            status.textContent = "Current terminal diagnostics cleared.";
        });
    }

    spawnShellTab(options) {
        const ipc = edex.ipc;
        let number = null;
        for (let i = 1; i <= 4; i++) {
            if (!window.term[i] || window.term[i] === null || typeof window.term[i] !== "object") {
                number = i;
                break;
            }
        }
        if (number === null) {
            new Modal({type: "warning", title: "Terminal", message: "No empty terminal tabs are available."});
            return false;
        }

        window.term[number] = null;
        const tab = document.getElementById(`shell_tab${number}`);
        tab.innerHTML = window.shellTabLabel ? window.shellTabLabel(number, "LOADING...") : `<p>LOADING...</p>`;
        ipc.send("ttyspawn", {initialCommand: options.initialCommand || ""});
        ipc.once("ttyspawn-reply", (e, response) => {
            const session = window.terminalSessionFromReply
                ? window.terminalSessionFromReply(response)
                : {ok: String(response || "").startsWith("SUCCESS"), port: Number(String(response || "").substr(9)), host: "127.0.0.1", token: ""};
            if (!session.ok) {
                tab.innerHTML = window.shellTabLabel ? window.shellTabLabel(number, "ERROR") : "<p>ERROR</p>";
                new Modal({type: "warning", title: "Terminal", message: this.escape(session.error || "Unable to allocate terminal")});
                return;
            }

            const port = session.port;
            window.term[number] = new Terminal({
                role: "client",
                parentId: `terminal${number}`,
                port,
                host: session.host,
                token: session.token
            });
            window.term[number].onclose = () => {
                delete window.term[number].onprocesschange;
                if (window.resetShellTab) window.resetShellTab(number);
                else {
                    tab.innerHTML = window.shellTabLabel ? window.shellTabLabel(number, "EMPTY") : "<p>EMPTY</p>";
                    document.getElementById(`terminal${number}`).innerHTML = "";
                    window.term[number].term.dispose();
                    delete window.term[number];
                    window.useAppShortcut("PREVIOUS_TAB");
                }
            };
            window.term[number].onprocesschange = processName => {
                window.term[number].processName = processName || "";
                const label = `#${number+1} - ${processName || options.label || port}`;
                tab.innerHTML = window.shellTabLabel ? window.shellTabLabel(number, label) : `<p>${this.escape(label)}</p>`;
                this.updateDiagnosticBadge(number);
            };
            tab.innerHTML = window.shellTabLabel ? window.shellTabLabel(number, options.label || "::"+port) : `<p>${this.escape(options.label || "::"+port)}</p>`;
            setTimeout(() => window.focusShellTab(number), 500);
        });
        return true;
    }

    async openContextPackManager() {
        const cwd = this.currentCwd();
        const scan = await edex.contextPack.scanRepo(cwd);
        this.contextScan = scan;
        const scripts = scan.commandHints && scan.commandHints.length
            ? scan.commandHints.map(name => `<li>${this.escape(name)}: <code>${this.escape(scan.scripts[name])}</code></li>`).join("")
            : "<li>No standard scripts detected.</li>";
        const structure = (scan.structure || []).slice(0, 16).map(item => `<li>${this.escape(item)}</li>`).join("");

        new Modal({
            type: "custom",
            title: "Context",
            html: `<div class="dev_modal context_pack">
                    <div class="context_summary">
                        <strong>${this.escape(scan.name)}</strong>
                        <span>${this.escape(scan.cwd)}</span>
                    </div>
                    <div class="context_columns">
                        <div><h5>Commands</h5><ul>${scripts}</ul></div>
                        <div><h5>Map</h5><ul>${structure}</ul></div>
                    </div>
                    <div class="context_action_grid">
                        <button onclick="window.devCockpitAction('context-create','agents')">Create AGENTS.md</button>
                        <button onclick="window.devCockpitAction('context-create','repo-map')">Generate repo map</button>
                    </div>
                </div>`
        });
    }

    async createContextPack(type) {
        const cwd = this.currentCwd();
        let result = await edex.contextPack.create(type, cwd, {overwrite: false});
        if (result && result.exists) {
            const shouldOverwrite = window.confirm(`${this.path.basename(result.path)} already exists. Overwrite it?`);
            if (!shouldOverwrite) return result;
            result = await edex.contextPack.create(type, cwd, {overwrite: true});
        }
        if (result && result.path) {
            if (window.fsDisp && window.fsDisp.openPathInInspector) {
                window.fsDisp.openPathInInspector(result.path);
            }
            edex.openPath(result.path);
        }
        return result;
    }

    statusClass(status) {
        if (status === "ok") return "ok";
        if (status === "warn") return "warn";
        return "error";
    }

    renderKeyValues(values) {
        return Object.keys(values || {}).map(key => `
            <div class="dev_diag_kv">
                <span>${this.escape(key)}</span>
                <strong>${this.escape(values[key])}</strong>
            </div>`).join("");
    }

    async renderLocalDiagnostics(body) {
        body.innerHTML = `
            <div class="dev_diag_toolbar">
                <button type="button" data-action="refresh">Refresh</button>
                <button type="button" data-action="copy">Copy JSON</button>
            </div>
            <div class="dev_diag_snapshot"><div class="devfs_empty">Collecting diagnostics...</div></div>`;

        const snapshot = await edex.diagnostics.snapshot().catch(error => ({error: error.message, checks: []}));
        snapshot.rendererPerformance = window.collectWidgetRuntimeDiagnostics ? window.collectWidgetRuntimeDiagnostics() : {};
        this.lastLocalDiagnostics = snapshot;
        const target = body.querySelector(".dev_diag_snapshot");
        if (!target) return;

        if (snapshot.error) {
            target.innerHTML = `<div class="devfs_empty">${this.escape(snapshot.error)}</div>`;
            return;
        }

        const checks = (snapshot.checks || []).map(check => `
            <div class="dev_diag_check ${this.statusClass(check.status)}">
                <span>${this.escape(check.status || "unknown")}</span>
                <strong>${this.escape(check.title || check.id)}</strong>
                <em>${this.escape(check.detail || "")}</em>
            </div>`).join("");

        const systemInfo = snapshot.performance && snapshot.performance.systemInformation || {};
        const processMetrics = snapshot.performance && snapshot.performance.appMetrics || [];
        const processRows = processMetrics.length ? processMetrics.map(metric => `
            <div class="dev_diag_check ok">
                <span>${this.escape(metric.type || "process")}</span>
                <strong>PID ${this.escape(metric.pid)}</strong>
                <em>CPU ${this.escape(metric.cpu && metric.cpu.percentCPUUsage != null ? metric.cpu.percentCPUUsage : 0)}% / RAM ${edex.formatBytes((metric.memory && metric.memory.workingSetSize || 0) * 1024)}</em>
            </div>`).join("") : `<div class="devfs_empty">Process metrics unavailable.</div>`;

        target.innerHTML = `
            <div class="dev_diag_summary">
                <div>
                    <h4>Runtime</h4>
                    ${this.renderKeyValues({
                        app: `${snapshot.app.name} ${snapshot.app.version}`,
                        electron: snapshot.app.electron,
                        chrome: snapshot.app.chrome,
                        node: snapshot.app.node,
                        generated: snapshot.generatedAt
                    })}
                </div>
                <div>
                    <h4>System</h4>
                    ${this.renderKeyValues({
                        platform: `${snapshot.os.platform} ${snapshot.os.release} ${snapshot.os.arch}`,
                        hostname: snapshot.os.hostname,
                        cpus: snapshot.os.cpus,
                        memory: edex.formatBytes(snapshot.os.freeMemory) + " free / " + edex.formatBytes(snapshot.os.totalMemory)
                    })}
                </div>
                <div>
                    <h4>Settings</h4>
                    ${this.renderKeyValues({
                        theme: snapshot.settings.theme,
                        keyboard: snapshot.settings.keyboard,
                        shell: snapshot.settings.shell,
                        explorer: snapshot.settings.devExplorerEnabled ? "enabled" : "disabled",
                        widgets: snapshot.settings.widgetsVisible ? "visible" : "hidden"
                    })}
                </div>
                <div>
                    <h4>Performance</h4>
                    ${this.renderKeyValues({
                        profile: snapshot.settings.performance && snapshot.settings.performance.profile || "balanced",
                        workers: `${systemInfo.activeWorkers || 0} active / ${systemInfo.busyWorkers || 0} busy`,
                        queue: `${systemInfo.pendingQueue || 0} queued / ${systemInfo.inFlight || 0} in flight`,
                        cache: `${systemInfo.cacheEntries || 0} entries`,
                        widgetsPaused: snapshot.rendererPerformance && snapshot.rendererPerformance.pausedByWindowState ? "yes" : "no"
                    })}
                </div>
            </div>
            <div class="dev_diag_checks">${checks}</div>
            <div class="dev_diag_checks">
                <h4>Processes</h4>
                ${processRows}
            </div>
            <div class="dev_diag_paths">
                <h4>Paths</h4>
                ${Object.keys(snapshot.pathReports || {}).map(key => {
                    const report = snapshot.pathReports[key];
                    const state = report.exists && report.readable ? "ok" : "error";
                    return `<div class="dev_diag_path ${state}">
                        <span>${this.escape(key)}</span>
                        <strong>${this.escape(report.path)}</strong>
                        <em>${this.escape(report.error || `${report.readable ? "R" : "-"}${report.writable ? "W" : "-"}`)}</em>
                    </div>`;
                }).join("")}
            </div>`;

        body.querySelector("[data-action='refresh']").addEventListener("click", () => this.renderLocalDiagnostics(body));
        body.querySelector("[data-action='copy']").addEventListener("click", () => this.handleAction("copy-local-diagnostics"));
    }

    openLocalDiagnostics() {
        const existing = this.windowManager.windows["local-diagnostics"];
        if (existing) {
            this.windowManager.focus("local-diagnostics");
            return this.renderLocalDiagnostics(existing.body);
        }

        return this.windowManager.open({
            id: "local-diagnostics",
            title: "Diagnostics",
            subtitle: "local system health",
            className: "dev_diagnostics_window",
            rect: {left: 16, top: 9, width: 62, height: 66},
            render: body => this.renderLocalDiagnostics(body)
        });
    }

}

class DevSshClient {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.path = require("path");
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    option(value, label, current) {
        return `<option value="${this.escape(value)}" ${value === current ? "selected" : ""}>${this.escape(label)}</option>`;
    }

    checked(value) {
        return value ? "checked" : "";
    }

    settings() {
        if (!window.settings.ssh) window.settings.ssh = {profiles: [], lastProfileId: ""};
        if (!Array.isArray(window.settings.ssh.profiles)) window.settings.ssh.profiles = [];
        if (typeof window.settings.ssh.lastProfileId !== "string") window.settings.ssh.lastProfileId = "";
        return window.settings.ssh;
    }

    persist() {
        if (typeof window.persistSettingsNow === "function") return window.persistSettingsNow();
        return false;
    }

    profileId() {
        return `ssh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    }

    blankProfile() {
        return {
            id: "",
            name: "",
            host: "",
            user: "",
            port: 22,
            keyPath: "",
            remoteCwd: "",
            extraArgs: "",
            authMode: "default",
            hostKeyPolicy: "default",
            keepAlive: true,
            keepAliveInterval: 60,
            keepAliveCountMax: 3,
            connectTimeout: 15,
            forwardAgent: false,
            identitiesOnly: false,
            addKeysToAgent: false,
            compression: false
        };
    }

    normalizeProfile(profile) {
        const number = (value, fallback, min, max) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return fallback;
            return Math.max(min, Math.min(max, Math.round(parsed)));
        };
        const enumValue = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
        return {
            id: String(profile && profile.id || ""),
            name: String(profile && profile.name || ""),
            host: String(profile && profile.host || "").trim(),
            user: String(profile && profile.user || "").trim(),
            port: number(profile && profile.port, 22, 1, 65535),
            keyPath: String(profile && profile.keyPath || "").trim(),
            remoteCwd: String(profile && profile.remoteCwd || "").trim(),
            extraArgs: String(profile && profile.extraArgs || "").trim(),
            authMode: enumValue(String(profile && profile.authMode || "default"), ["default", "password", "publickey", "keyboard-interactive"], "default"),
            hostKeyPolicy: enumValue(String(profile && profile.hostKeyPolicy || "default"), ["default", "accept-new", "yes", "no"], "default"),
            keepAlive: profile && typeof profile.keepAlive === "boolean" ? profile.keepAlive : true,
            keepAliveInterval: number(profile && profile.keepAliveInterval, 60, 0, 3600),
            keepAliveCountMax: number(profile && profile.keepAliveCountMax, 3, 1, 20),
            connectTimeout: number(profile && profile.connectTimeout, 15, 0, 300),
            forwardAgent: !!(profile && profile.forwardAgent),
            identitiesOnly: !!(profile && profile.identitiesOnly),
            addKeysToAgent: !!(profile && profile.addKeysToAgent),
            compression: !!(profile && profile.compression)
        };
    }

    selectedProfile(id) {
        const ssh = this.settings();
        const selectedId = id || ssh.lastProfileId;
        return ssh.profiles.find(profile => profile.id === selectedId)
            || ssh.profiles[0]
            || this.blankProfile();
    }

    open() {
        this.debug("open requested");
        return this.windowManager.open({
            id: "ssh-client",
            title: "SSH Client",
            subtitle: "native ssh profiles",
            className: "dev_ssh_window",
            rect: {left: 14, top: 8, width: 72, height: 70},
            render: body => this.render(body)
        });
    }

    debug(message, detail) {
        if (typeof window.edexDebugLog === "function") {
            window.edexDebugLog("ssh-client", message, detail);
        }
    }

    render(body, profileId) {
        const ssh = this.settings();
        const selected = this.normalizeProfile(this.selectedProfile(profileId));
        this.debug("render start", {
            profileCount: ssh.profiles.length,
            hasSelected: !!selected.id,
            requestedProfile: !!profileId
        });
        body.dataset.activeProfileId = selected.id || "";
        const profiles = ssh.profiles.length ? ssh.profiles.map(profile => `
            <button type="button" class="${profile.id === selected.id ? "active" : ""}" data-profile-id="${this.escape(profile.id)}" title="${this.escape(profile.host)}">
                <strong>${this.escape(profile.name || profile.host || "SSH profile")}</strong>
                <span>${this.escape(this.targetLabel(profile))}</span>
            </button>`).join("") : `<div class="dev_ssh_empty">No SSH profiles yet.</div>`;

        body.innerHTML = `
            <div class="dev_ssh_shell">
                <aside class="dev_ssh_profiles">
                    <div class="dev_ssh_profile_head">
                        <strong>Profiles</strong>
                        <button type="button" data-action="new">New</button>
                    </div>
                    <div class="dev_ssh_profile_list">${profiles}</div>
                </aside>
                <section class="dev_ssh_form">
                    <div class="dev_ssh_notice">Passwords are not stored by eDEX Revival. Use the native password prompt, SSH keys, and ssh-agent for fast reconnects.</div>
                    <input type="hidden" id="dev_ssh_id" value="${this.escape(selected.id)}">
                    <label>Name<input type="text" id="dev_ssh_name" value="${this.escape(selected.name)}" placeholder="prod / staging / home lab"></label>
                    <label>Host<input type="text" id="dev_ssh_host" value="${this.escape(selected.host)}" placeholder="example.com or 10.0.0.12"></label>
                    <label>User<input type="text" id="dev_ssh_user" value="${this.escape(selected.user)}" placeholder="optional"></label>
                    <label>Port<input type="number" id="dev_ssh_port" value="${this.escape(selected.port || 22)}" min="1" max="65535"></label>
                    <label>Auth mode<select id="dev_ssh_authMode">
                        ${this.option("default", "Default", selected.authMode)}
                        ${this.option("password", "Password prompt", selected.authMode)}
                        ${this.option("keyboard-interactive", "Keyboard-interactive", selected.authMode)}
                        ${this.option("publickey", "Key / agent first", selected.authMode)}
                    </select></label>
                    <label>Host key<select id="dev_ssh_hostKeyPolicy">
                        ${this.option("default", "Default", selected.hostKeyPolicy)}
                        ${this.option("accept-new", "Accept new hosts", selected.hostKeyPolicy)}
                        ${this.option("yes", "Known hosts only", selected.hostKeyPolicy)}
                        ${this.option("no", "Skip checking", selected.hostKeyPolicy)}
                    </select></label>
                    <label>Identity file<input type="text" id="dev_ssh_keyPath" value="${this.escape(selected.keyPath)}" placeholder="C:\\Users\\you\\.ssh\\id_ed25519"></label>
                    <div class="dev_ssh_key_setup">
                        <div class="dev_ssh_key_head">
                            <strong>Key setup</strong>
                            <span>Generate a local key, install the public key on the server, then save this profile for key login.</span>
                        </div>
                        <div class="dev_ssh_key_actions">
                            <button type="button" data-action="key-generate">Generate Key</button>
                            <button type="button" data-action="key-copy">Copy Public Key</button>
                            <button type="button" data-action="key-install">Install on Server</button>
                            <button type="button" data-action="key-test">Test Key</button>
                            <button type="button" data-action="key-use">Use Key Login</button>
                        </div>
                        <pre class="dev_ssh_key_status">Checking SSH key status...</pre>
                    </div>
                    <label>Remote cwd<input type="text" id="dev_ssh_remoteCwd" value="${this.escape(selected.remoteCwd)}" placeholder="/srv/app"></label>
                    <label>Connect timeout<input type="number" id="dev_ssh_connectTimeout" value="${this.escape(selected.connectTimeout)}" min="0" max="300" step="1"></label>
                    <label>Keepalive interval<input type="number" id="dev_ssh_keepAliveInterval" value="${this.escape(selected.keepAliveInterval)}" min="0" max="3600" step="1"></label>
                    <label>Keepalive misses<input type="number" id="dev_ssh_keepAliveCountMax" value="${this.escape(selected.keepAliveCountMax)}" min="1" max="20" step="1"></label>
                    <label class="dev_ssh_check"><input type="checkbox" id="dev_ssh_keepAlive" ${this.checked(selected.keepAlive)}>Keep connection alive</label>
                    <label class="dev_ssh_check"><input type="checkbox" id="dev_ssh_forwardAgent" ${this.checked(selected.forwardAgent)}>Forward ssh-agent</label>
                    <label class="dev_ssh_check"><input type="checkbox" id="dev_ssh_identitiesOnly" ${this.checked(selected.identitiesOnly)}>Use only this identity</label>
                    <label class="dev_ssh_check"><input type="checkbox" id="dev_ssh_addKeysToAgent" ${this.checked(selected.addKeysToAgent)}>Add key to agent</label>
                    <label class="dev_ssh_check"><input type="checkbox" id="dev_ssh_compression" ${this.checked(selected.compression)}>Compression</label>
                    <label class="wide">Extra args<input type="text" id="dev_ssh_extraArgs" value="${this.escape(selected.extraArgs)}" placeholder="-J jump-host -L 8080:localhost:8080"></label>
                    <div class="dev_ssh_actions">
                        <button type="button" data-action="save">Save</button>
                        <button type="button" data-action="connect">Connect</button>
                        <button type="button" data-action="copy">Copy Command</button>
                        <button type="button" data-action="delete" ${selected.id ? "" : "disabled"}>Delete</button>
                    </div>
                    <pre class="dev_ssh_preview"></pre>
                    <div class="dev_ssh_status">Extra args are appended as typed. Do not put passwords here.</div>
                </section>
            </div>`;
        this.debug("render html applied", {
            hasShell: !!body.querySelector(".dev_ssh_shell"),
            hasForm: !!body.querySelector(".dev_ssh_form"),
            formControls: body.querySelectorAll(".dev_ssh_form input, .dev_ssh_form select, .dev_ssh_form button").length,
            childCount: body.querySelectorAll("*").length
        });
        this.bind(body);
        this.updatePreview(body);
        setTimeout(() => {
            const form = body.querySelector(".dev_ssh_form");
            const shell = body.querySelector(".dev_ssh_shell");
            const formRect = form ? form.getBoundingClientRect() : null;
            const shellRect = shell ? shell.getBoundingClientRect() : null;
            const bodyRect = body.getBoundingClientRect();
            const shellStyle = shell ? window.getComputedStyle(shell) : null;
            const formStyle = form ? window.getComputedStyle(form) : null;
            this.debug("render layout", {
                shellVisible: !!(shellRect && shellRect.width > 0 && shellRect.height > 0),
                formVisible: !!(formRect && formRect.width > 0 && formRect.height > 0),
                bodyWidth: Math.round(bodyRect.width),
                bodyHeight: Math.round(bodyRect.height),
                formWidth: formRect ? Math.round(formRect.width) : 0,
                formHeight: formRect ? Math.round(formRect.height) : 0,
                shellDisplay: shellStyle ? shellStyle.display : "",
                shellOverflow: shellStyle ? shellStyle.overflow : "",
                formDisplay: formStyle ? formStyle.display : "",
                formOverflow: formStyle ? formStyle.overflow : ""
            });
        }, 50);
    }

    bind(body) {
        this.debug("bind start", {
            profileButtons: body.querySelectorAll("[data-profile-id]").length,
            actionButtons: body.querySelectorAll("[data-action]").length,
            hasForm: !!body.querySelector(".dev_ssh_form")
        });
        body.querySelectorAll("[data-profile-id]").forEach(button => {
            button.addEventListener("click", () => {
                this.settings().lastProfileId = button.dataset.profileId;
                this.persist();
                this.render(body, button.dataset.profileId);
            });
        });
        body.querySelector("[data-action='new']").addEventListener("click", () => this.render(body, ""));
        body.querySelector("[data-action='save']").addEventListener("click", () => this.save(body));
        body.querySelector("[data-action='connect']").addEventListener("click", () => this.connect(body));
        body.querySelector("[data-action='copy']").addEventListener("click", () => this.copyCommand(body));
        body.querySelector("[data-action='delete']").addEventListener("click", () => this.delete(body));
        body.querySelector("[data-action='key-generate']").addEventListener("click", () => this.generateKey(body));
        body.querySelector("[data-action='key-copy']").addEventListener("click", () => this.copyPublicKey(body));
        body.querySelector("[data-action='key-install']").addEventListener("click", () => this.installPublicKey(body));
        body.querySelector("[data-action='key-test']").addEventListener("click", () => this.testKeyLogin(body));
        body.querySelector("[data-action='key-use']").addEventListener("click", () => this.useKeyLogin(body));
        body.querySelectorAll("input, select").forEach(input => input.addEventListener("input", () => this.updatePreview(body)));
        const keyPathInput = body.querySelector("#dev_ssh_keyPath");
        if (keyPathInput) keyPathInput.addEventListener("change", () => this.refreshKeyStatus(body));
        this.refreshKeyStatus(body);
        this.debug("bind complete");
    }

    formProfile(body) {
        const value = id => {
            const input = body.querySelector(`#${id}`);
            return input ? input.value : "";
        };
        const checked = id => {
            const input = body.querySelector(`#${id}`);
            return !!(input && input.checked);
        };
        return this.normalizeProfile({
            id: value("dev_ssh_id"),
            name: value("dev_ssh_name"),
            host: value("dev_ssh_host"),
            user: value("dev_ssh_user"),
            port: Number(value("dev_ssh_port")) || 22,
            keyPath: value("dev_ssh_keyPath"),
            remoteCwd: value("dev_ssh_remoteCwd"),
            extraArgs: value("dev_ssh_extraArgs"),
            authMode: value("dev_ssh_authMode"),
            hostKeyPolicy: value("dev_ssh_hostKeyPolicy"),
            keepAlive: checked("dev_ssh_keepAlive"),
            keepAliveInterval: Number(value("dev_ssh_keepAliveInterval")),
            keepAliveCountMax: Number(value("dev_ssh_keepAliveCountMax")),
            connectTimeout: Number(value("dev_ssh_connectTimeout")),
            forwardAgent: checked("dev_ssh_forwardAgent"),
            identitiesOnly: checked("dev_ssh_identitiesOnly"),
            addKeysToAgent: checked("dev_ssh_addKeysToAgent"),
            compression: checked("dev_ssh_compression")
        });
    }

    keyPayload(body) {
        const profile = this.formProfile(body);
        return {
            keyPath: profile.keyPath,
            profile: {
                name: profile.name,
                host: profile.host,
                user: profile.user,
                port: profile.port,
                hostKeyPolicy: profile.hostKeyPolicy,
                connectTimeout: profile.connectTimeout
            }
        };
    }

    setKeyStatus(body, message, state) {
        const target = body.querySelector(".dev_ssh_key_status");
        if (!target) return;
        target.className = `dev_ssh_key_status ${state || ""}`.trim();
        target.textContent = String(message || "");
    }

    formatKeyStatus(result) {
        if (!result) return "SSH key status unavailable.";
        if (result.privateExists && result.publicExists) {
            return [
                "Key ready for this profile.",
                result.fingerprint || "Fingerprint unavailable.",
                `Identity: ${result.keyPath}`
            ].join("\n");
        }
        return [
            "No eDEX-managed key found yet.",
            `Suggested identity: ${result.keyPath || result.defaultPath || ""}`,
            result.tools && result.tools.sshKeygen ? "ssh-keygen detected." : "ssh-keygen not detected."
        ].join("\n");
    }

    async refreshKeyStatus(body) {
        if (!edex.sshKey) return;
        try {
            this.debug("key status request");
            const result = await edex.sshKey.status(this.keyPayload(body));
            this.debug("key status result", {
                privateExists: !!(result && result.privateExists),
                publicExists: !!(result && result.publicExists),
                hasKeygen: !!(result && result.tools && result.tools.sshKeygen)
            });
            this.setKeyStatus(body, this.formatKeyStatus(result), result && result.privateExists && result.publicExists ? "ok" : "warn");
        } catch(error) {
            this.debug("key status failed", {error: error.message || String(error)});
            this.setKeyStatus(body, error.message || String(error), "warn");
        }
    }

    applyKeyLoginDefaults(body, keyPath) {
        const keyInput = body.querySelector("#dev_ssh_keyPath");
        const authMode = body.querySelector("#dev_ssh_authMode");
        const identitiesOnly = body.querySelector("#dev_ssh_identitiesOnly");
        const addKeysToAgent = body.querySelector("#dev_ssh_addKeysToAgent");
        if (keyInput && keyPath) keyInput.value = keyPath;
        if (authMode) authMode.value = "publickey";
        if (identitiesOnly) identitiesOnly.checked = true;
        if (addKeysToAgent) addKeysToAgent.checked = true;
        this.updatePreview(body);
    }

    async generateKey(body) {
        if (!edex.sshKey) return false;
        this.debug("generate key requested");
        this.setKeyStatus(body, "Generating ed25519 key...", "warn");
        try {
            const result = await edex.sshKey.generate(this.keyPayload(body));
            this.applyKeyLoginDefaults(body, result.keyPath);
            this.setKeyStatus(body, [
                result.created ? "Generated a new SSH key." : "Using existing SSH key.",
                result.fingerprint || "Fingerprint unavailable.",
                "Next: Install on Server."
            ].join("\n"), "ok");
            return true;
        } catch(error) {
            this.debug("generate key failed", {error: error.message || String(error)});
            this.setKeyStatus(body, error.message || String(error), "error");
            return false;
        }
    }

    async copyPublicKey(body) {
        if (!edex.sshKey) return false;
        this.debug("copy public key requested");
        this.setKeyStatus(body, "Copying public key...", "warn");
        try {
            const result = await edex.sshKey.copyPublic(this.keyPayload(body));
            this.applyKeyLoginDefaults(body, result.keyPath);
            this.setKeyStatus(body, "Public key copied to clipboard.", "ok");
            return true;
        } catch(error) {
            this.debug("copy public key failed", {error: error.message || String(error)});
            this.setKeyStatus(body, `${error.message || String(error)}\nGenerate a key first, then copy again.`, "error");
            return false;
        }
    }

    async installPublicKey(body) {
        if (!edex.sshKey) return false;
        this.debug("install public key requested");
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        const status = body.querySelector(".dev_ssh_status");
        if (errors.length) {
            if (status) status.textContent = errors.join(" ");
            this.setKeyStatus(body, errors.join("\n"), "error");
            return false;
        }
        this.setKeyStatus(body, "Preparing server install command...", "warn");
        try {
            const result = await edex.sshKey.installCommand(this.keyPayload(body));
            this.applyKeyLoginDefaults(body, result.keyPath);
            this.save(body);
            if (window.spawnShellTab) {
                window.spawnShellTab({initialCommand: result.command, label: `install key ${profile.host}`});
                this.setKeyStatus(body, "Install terminal opened. Enter the server password once, then run Test Key before connecting.", "ok");
                return true;
            }
            this.setKeyStatus(body, "No terminal tab launcher is available.", "error");
            return false;
        } catch(error) {
            this.debug("install public key failed", {error: error.message || String(error)});
            this.setKeyStatus(body, `${error.message || String(error)}\nGenerate a key first if no public key exists.`, "error");
            return false;
        }
    }

    async testKeyLogin(body) {
        if (!edex.sshKey) return false;
        this.debug("test key login requested");
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        const status = body.querySelector(".dev_ssh_status");
        if (errors.length) {
            if (status) status.textContent = errors.join(" ");
            this.setKeyStatus(body, errors.join("\n"), "error");
            return false;
        }
        this.setKeyStatus(body, "Testing SSH key login...", "warn");
        try {
            const result = await edex.sshKey.test(this.keyPayload(body));
            const notes = Array.isArray(result.notes) ? result.notes.filter(Boolean) : [];
            const lines = [
                result.message || "SSH key test finished.",
                result.fingerprint || "",
                ...notes
            ].filter(Boolean);
            this.setKeyStatus(body, lines.join("\n"), result.status || (result.ok ? "ok" : "error"));
            return !!result.ok;
        } catch(error) {
            this.debug("test key login failed", {error: error.message || String(error)});
            this.setKeyStatus(body, error.message || String(error), "error");
            return false;
        }
    }

    async useKeyLogin(body) {
        if (!edex.sshKey) return false;
        this.debug("use key login requested");
        this.setKeyStatus(body, "Saving key login profile...", "warn");
        try {
            const result = await edex.sshKey.status(this.keyPayload(body));
            if (!result.privateExists || !result.publicExists) {
                this.setKeyStatus(body, "Generate a key before saving key login.", "error");
                return false;
            }
            this.applyKeyLoginDefaults(body, result.keyPath);
            const saved = this.save(body);
            this.setKeyStatus(body, saved ? "Profile saved for SSH key login." : "Unable to save profile.", saved ? "ok" : "error");
            return saved;
        } catch(error) {
            this.debug("use key login failed", {error: error.message || String(error)});
            this.setKeyStatus(body, error.message || String(error), "error");
            return false;
        }
    }

    targetLabel(profile) {
        const user = profile.user ? `${profile.user}@` : "";
        const port = profile.port && Number(profile.port) !== 22 ? `:${profile.port}` : "";
        return profile.host ? `${user}${profile.host}${port}` : "not configured";
    }

    validate(profile) {
        const errors = [];
        const endpointPattern = /^[A-Za-z0-9_.:%+\-[\]]+$/;
        const userPattern = /^[A-Za-z0-9_.+\-]+$/;
        if (!profile.host) errors.push("Host is required.");
        if (profile.host && !endpointPattern.test(profile.host)) errors.push("Host contains unsupported characters.");
        if (profile.user && !userPattern.test(profile.user)) errors.push("User contains unsupported characters.");
        if (!Number.isInteger(Number(profile.port)) || Number(profile.port) < 1 || Number(profile.port) > 65535) {
            errors.push("Port must be between 1 and 65535.");
        }
        if (profile.extraArgs && /[\r\n\0]/.test(profile.extraArgs)) errors.push("Extra args cannot contain new lines.");
        if (profile.extraArgs && /(?:sshpass|SSHPASS|password\s*=|passphrase\s*=|-pw\s+)/i.test(profile.extraArgs)) {
            errors.push("Extra args must not store SSH passwords or passphrases.");
        }
        if (profile.keyPath && profile.keyPath.includes("\0")) errors.push("Identity file path is invalid.");
        if (profile.remoteCwd && profile.remoteCwd.includes("\0")) errors.push("Remote cwd is invalid.");
        if (!["default", "password", "publickey", "keyboard-interactive"].includes(profile.authMode)) errors.push("Auth mode is invalid.");
        if (!["default", "accept-new", "yes", "no"].includes(profile.hostKeyPolicy)) errors.push("Host key policy is invalid.");
        if (!Number.isInteger(Number(profile.connectTimeout)) || Number(profile.connectTimeout) < 0 || Number(profile.connectTimeout) > 300) {
            errors.push("Connect timeout must be between 0 and 300 seconds.");
        }
        if (!Number.isInteger(Number(profile.keepAliveInterval)) || Number(profile.keepAliveInterval) < 0 || Number(profile.keepAliveInterval) > 3600) {
            errors.push("Keepalive interval must be between 0 and 3600 seconds.");
        }
        if (!Number.isInteger(Number(profile.keepAliveCountMax)) || Number(profile.keepAliveCountMax) < 1 || Number(profile.keepAliveCountMax) > 20) {
            errors.push("Keepalive misses must be between 1 and 20.");
        }
        return errors;
    }

    save(body) {
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        const status = body.querySelector(".dev_ssh_status");
        if (errors.length) {
            status.textContent = errors.join(" ");
            return false;
        }
        if (!profile.id) profile.id = this.profileId();
        if (!profile.name) profile.name = this.targetLabel(profile);
        const ssh = this.settings();
        const index = ssh.profiles.findIndex(item => item.id === profile.id);
        if (index >= 0) ssh.profiles[index] = profile;
        else ssh.profiles.push(profile);
        ssh.lastProfileId = profile.id;
        this.persist();
        this.render(body, profile.id);
        return true;
    }

    delete(body) {
        const profile = this.formProfile(body);
        if (!profile.id) return false;
        const confirmed = window.confirm(`Delete SSH profile "${profile.name || profile.host}"?`);
        if (!confirmed) return false;
        const ssh = this.settings();
        ssh.profiles = ssh.profiles.filter(item => item.id !== profile.id);
        ssh.lastProfileId = ssh.profiles[0] ? ssh.profiles[0].id : "";
        this.persist();
        this.render(body, ssh.lastProfileId);
        return true;
    }

    connect(body) {
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        const status = body.querySelector(".dev_ssh_status");
        if (errors.length) {
            status.textContent = errors.join(" ");
            return false;
        }
        const command = this.buildCommand(profile);
        if (profile.id) {
            this.settings().lastProfileId = profile.id;
            this.persist();
        }
        status.textContent = "Opening SSH terminal tab...";
        return window.spawnShellTab
            ? window.spawnShellTab({initialCommand: command, label: profile.name || profile.host})
            : false;
    }

    copyCommand(body) {
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        const status = body.querySelector(".dev_ssh_status");
        if (errors.length) {
            status.textContent = errors.join(" ");
            return false;
        }
        edex.clipboard.writeText(this.buildCommand(profile));
        status.textContent = "SSH command copied.";
        return true;
    }

    updatePreview(body) {
        const preview = body.querySelector(".dev_ssh_preview");
        const status = body.querySelector(".dev_ssh_status");
        if (!preview) return;
        const profile = this.formProfile(body);
        const errors = this.validate(profile);
        if (errors.length) {
            preview.textContent = errors.join("\n");
            if (status) status.textContent = "Complete the required fields before connecting.";
            return;
        }
        preview.textContent = this.buildCommand(profile);
        if (status) status.textContent = "Ready. Use keys or ssh-agent for saved access; passwords stay in the native prompt.";
    }

    shellFlavor() {
        const shell = this.path.basename(String(window.settings.shell || "")).toLowerCase();
        if (shell.includes("cmd")) return "cmd";
        if (shell.includes("powershell") || shell.includes("pwsh")) return "powershell";
        if (shell.includes("bash") || shell.includes("sh") || shell.includes("zsh") || shell.includes("fish")) return "posix";
        return (typeof process !== "undefined" && process.platform === "win32") ? "powershell" : "posix";
    }

    localQuote(value) {
        const text = String(value);
        switch(this.shellFlavor()) {
            case "cmd":
                return `"${text.replace(/"/g, "\"\"")}"`;
            case "powershell":
                return `'${text.replace(/'/g, "''")}'`;
            default:
                return `'${text.replace(/'/g, "'\\''")}'`;
        }
    }

    remoteQuote(value) {
        return `'${String(value).replace(/'/g, "'\\''")}'`;
    }

    sshOption(parts, key, value) {
        if (value === "" || value == null) return;
        parts.push("-o", `${key}=${value}`);
    }

    buildCommand(profile) {
        const parts = ["ssh"];
        if (Number(profile.port) !== 22) parts.push("-p", String(Number(profile.port)));
        if (profile.compression) parts.push("-C");
        if (Number(profile.connectTimeout) > 0) this.sshOption(parts, "ConnectTimeout", Number(profile.connectTimeout));
        if (profile.keepAlive && Number(profile.keepAliveInterval) > 0) {
            this.sshOption(parts, "ServerAliveInterval", Number(profile.keepAliveInterval));
            this.sshOption(parts, "ServerAliveCountMax", Number(profile.keepAliveCountMax) || 3);
        }
        if (profile.forwardAgent) this.sshOption(parts, "ForwardAgent", "yes");
        if (profile.identitiesOnly) this.sshOption(parts, "IdentitiesOnly", "yes");
        if (profile.addKeysToAgent) this.sshOption(parts, "AddKeysToAgent", "yes");
        if (profile.hostKeyPolicy !== "default") this.sshOption(parts, "StrictHostKeyChecking", profile.hostKeyPolicy);
        switch(profile.authMode) {
            case "password":
                this.sshOption(parts, "PreferredAuthentications", "password,keyboard-interactive");
                break;
            case "keyboard-interactive":
                this.sshOption(parts, "PreferredAuthentications", "keyboard-interactive,password");
                break;
            case "publickey":
                this.sshOption(parts, "PreferredAuthentications", "publickey");
                break;
            default:
                break;
        }
        if (profile.keyPath) parts.push("-i", this.localQuote(profile.keyPath));
        if (profile.extraArgs) parts.push(profile.extraArgs);
        const target = profile.user ? `${profile.user}@${profile.host}` : profile.host;
        parts.push(target);
        if (profile.remoteCwd) {
            parts.push("-t", this.localQuote(`cd ${this.remoteQuote(profile.remoteCwd)} && exec \${SHELL:-sh} -l`));
        }
        return parts.join(" ");
    }
}

class DevWindowManager {
    constructor() {
        this.windows = {};
        this.z = 21000;
        this.path = require("path");
        this.layer = document.createElement("div");
        this.layer.id = "dev_window_layer";
        document.body.appendChild(this.layer);
        if (!window.settings.windowManager) window.settings.windowManager = {rememberLayout: true, snap: true, windows: {}};
        if (!window.settings.windowManager.windows) window.settings.windowManager.windows = {};
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    defaultRect(id, rect) {
        const saved = window.settings.windowManager && window.settings.windowManager.windows && window.settings.windowManager.windows[id];
        const source = saved || rect || {};
        return {
            left: this.clamp(source.left, 6, 78, 18),
            top: this.clamp(source.top, 5, 70, 9),
            width: this.clamp(source.width, 34, 94, 64),
            height: this.clamp(source.height, 28, 88, 64)
        };
    }

    clamp(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.max(min, Math.min(max, number));
    }

    iconMarkup(icon, label) {
        const path = DEVFS_ICON_PATHS[icon] || "";
        return `<svg class="dev_window_icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg><span>${this.escape(label)}</span>`;
    }

    controlButton(action, icon, label) {
        return `<button type="button" data-action="${this.escape(action)}" title="${this.escape(label)}" aria-label="${this.escape(label)}">${this.iconMarkup(icon, label)}</button>`;
    }

    open(options) {
        const id = options.id;
        if (this.windows[id]) {
            if (typeof window.edexDebugLog === "function") {
                window.edexDebugLog("dev-window", "focus existing", {id});
            }
            this.restore(id);
            this.focus(id);
            return this.windows[id];
        }

        const rect = this.defaultRect(id, options.rect);
        if (typeof window.edexDebugLog === "function") {
            window.edexDebugLog("dev-window", "open", {id, left: rect.left, top: rect.top, width: rect.width, height: rect.height});
        }
        const element = document.createElement("section");
        element.className = `dev_window ${options.className || ""}`;
        element.dataset.windowId = id;
        element.style.left = `${rect.left}vw`;
        element.style.top = `${rect.top}vh`;
        element.style.width = `${rect.width}vw`;
        element.style.height = `${rect.height}vh`;
        element.innerHTML = `
            <div class="dev_window_titlebar">
                <span class="dev_window_grip"></span>
                <strong>${this.escape(options.title || id)}</strong>
                <span class="dev_window_subtitle">${this.escape(options.subtitle || "")}</span>
                <div class="dev_window_controls">
                    ${this.controlButton("minimize", "minimize", "Minimize")}
                    ${this.controlButton("snap-left", "snapLeft", "Snap left")}
                    ${this.controlButton("snap-right", "snapRight", "Snap right")}
                    ${this.controlButton("maximize", "maximize", "Maximize")}
                    ${this.controlButton("close", "close", "Close")}
                </div>
            </div>
            <div class="dev_window_body"></div>
            <div class="dev_window_resize_edge north" data-resize-edge="n" title="Resize"></div>
            <div class="dev_window_resize_edge east" data-resize-edge="e" title="Resize"></div>
            <div class="dev_window_resize_edge south" data-resize-edge="s" title="Resize"></div>
            <div class="dev_window_resize_edge west" data-resize-edge="w" title="Resize"></div>
            <div class="dev_window_resize_corner nw" data-resize-edge="nw" title="Resize"></div>
            <div class="dev_window_resize_corner ne" data-resize-edge="ne" title="Resize"></div>
            <div class="dev_window_resize_corner sw" data-resize-edge="sw" title="Resize"></div>
            <div class="dev_window_resize" data-resize-edge="se" title="Resize"></div>`;
        this.layer.appendChild(element);

        const record = {
            id,
            element,
            body: element.querySelector(".dev_window_body"),
            title: element.querySelector(".dev_window_titlebar strong"),
            subtitle: element.querySelector(".dev_window_subtitle"),
            rect,
            restoreRect: null,
            minimized: false,
            maximized: false,
            onClose: options.onClose || (() => {})
        };
        this.windows[id] = record;
        try {
            if (typeof options.render === "function") options.render(record.body, record);
            this.bind(record);
            this.focus(id);
            if (typeof window.edexDebugLog === "function") {
                window.edexDebugLog("dev-window", "open complete", {id, children: record.body.querySelectorAll("*").length});
            }
        } catch(error) {
            console.error(`Unable to render dev window "${id}"`, error);
            if (typeof window.edexDebugLog === "function") {
                window.edexDebugLog("dev-window", "render failed", {id, error: error.message || String(error)});
            }
            record.body.innerHTML = `<div class="dev_window_error">${this.escape(error.message || String(error))}</div>`;
            this.bind(record);
            this.focus(id);
        }
        return record;
    }

    bind(record) {
        const titlebar = record.element.querySelector(".dev_window_titlebar");
        const resizeHandles = record.element.querySelectorAll("[data-resize-edge]");
        let drag = null;
        const minWidth = 34;
        const minHeight = 28;
        const maxWidth = 96;
        const maxHeight = 90;

        const clampRect = rect => {
            const width = this.clamp(rect.width, minWidth, maxWidth, record.rect.width);
            const height = this.clamp(rect.height, minHeight, maxHeight, record.rect.height);
            return {
                left: Math.max(1, Math.min(99 - width, rect.left)),
                top: Math.max(2, Math.min(98 - height, rect.top)),
                width,
                height
            };
        };

        const resizeRect = (rect, edge, dx, dy) => {
            let left = rect.left;
            let top = rect.top;
            let width = rect.width;
            let height = rect.height;

            if (edge.includes("e")) width += dx;
            if (edge.includes("s")) height += dy;
            if (edge.includes("w")) {
                left += dx;
                width -= dx;
            }
            if (edge.includes("n")) {
                top += dy;
                height -= dy;
            }

            if (width < minWidth) {
                if (edge.includes("w")) left -= minWidth - width;
                width = minWidth;
            }
            if (height < minHeight) {
                if (edge.includes("n")) top -= minHeight - height;
                height = minHeight;
            }

            return {left, top, width, height};
        };

        const start = (event, mode, edge) => {
            if (event.target.closest("button,input,select,textarea,.cm-editor")) return;
            if (record.minimized) return;
            if (record.maximized) return;
            event.preventDefault();
            drag = {
                mode,
                edge: edge || "se",
                startX: event.clientX,
                startY: event.clientY,
                rect: {...record.rect}
            };
            this.focus(record.id);
            document.body.classList.add("dev_window_dragging");
        };

        titlebar.addEventListener("mousedown", event => start(event, "move"));
        titlebar.addEventListener("dblclick", event => {
            if (event.target.closest("button,input,select,textarea,.cm-editor")) return;
            event.preventDefault();
            this.toggleMaximize(record.id);
        });
        resizeHandles.forEach(handle => {
            handle.addEventListener("mousedown", event => start(event, "resize", handle.dataset.resizeEdge || "se"));
        });
        record.element.addEventListener("mousedown", () => this.focus(record.id));
        record.element.querySelectorAll(".dev_window_controls button").forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                switch(button.dataset.action) {
                    case "minimize":
                        this.toggleMinimize(record.id);
                        break;
                    case "snap-left":
                        this.restore(record.id);
                        record.maximized = false;
                        record.element.classList.remove("maximized");
                        this.setRect(record.id, {left: 1, top: 4, width: 48, height: 88});
                        this.updateControls(record);
                        break;
                    case "snap-right":
                        this.restore(record.id);
                        record.maximized = false;
                        record.element.classList.remove("maximized");
                        this.setRect(record.id, {left: 51, top: 4, width: 48, height: 88});
                        this.updateControls(record);
                        break;
                    case "maximize":
                        this.toggleMaximize(record.id);
                        break;
                    case "close":
                        this.close(record.id);
                        break;
                    default:
                        break;
                }
            });
        });

        document.addEventListener("mousemove", event => {
            if (!drag) return;
            const dx = (event.clientX - drag.startX) / Math.max(window.innerWidth, 1) * 100;
            const dy = (event.clientY - drag.startY) / Math.max(window.innerHeight, 1) * 100;
            const rect = drag.mode === "move"
                ? {...drag.rect, left: drag.rect.left + dx, top: drag.rect.top + dy}
                : resizeRect(drag.rect, drag.edge, dx, dy);
            this.setRect(record.id, clampRect(rect), false);
        });

        document.addEventListener("mouseup", () => {
            if (!drag) return;
            drag = null;
            document.body.classList.remove("dev_window_dragging");
            this.persist(record.id);
        });
        this.updateControls(record);
    }

    setRect(id, rect, persist = true) {
        const record = this.windows[id];
        if (!record) return false;
        record.rect = rect;
        if (!record.minimized) {
            record.element.style.left = `${rect.left}vw`;
            record.element.style.top = `${rect.top}vh`;
            record.element.style.width = `${rect.width}vw`;
            record.element.style.height = `${rect.height}vh`;
        }
        if (persist) this.persist(id);
        return true;
    }

    updateControls(record) {
        if (!record) return;
        const minimize = record.element.querySelector("[data-action='minimize']");
        const maximize = record.element.querySelector("[data-action='maximize']");
        const snapButtons = record.element.querySelectorAll("[data-action='snap-left'], [data-action='snap-right']");
        if (minimize) {
            const label = record.minimized ? "Restore" : "Minimize";
            minimize.title = label;
            minimize.setAttribute("aria-label", label);
            minimize.innerHTML = this.iconMarkup(record.minimized ? "restore" : "minimize", label);
        }
        if (maximize) {
            const label = record.maximized ? "Restore" : "Maximize";
            maximize.disabled = !!record.minimized;
            maximize.title = label;
            maximize.setAttribute("aria-label", label);
            maximize.innerHTML = this.iconMarkup(record.maximized ? "restore" : "maximize", label);
        }
        snapButtons.forEach(button => {
            button.disabled = !!record.minimized;
        });
    }

    applyStoredRect(record) {
        record.element.style.left = `${record.rect.left}vw`;
        record.element.style.top = `${record.rect.top}vh`;
        record.element.style.width = `${record.rect.width}vw`;
        record.element.style.height = `${record.rect.height}vh`;
    }

    arrangeMinimized() {
        const width = 24;
        const height = 3.4;
        const gap = 0.6;
        const perRow = Math.max(1, Math.floor(96 / (width + gap)));
        Object.keys(this.windows)
            .map(id => this.windows[id])
            .filter(record => record.minimized)
            .forEach((record, index) => {
                const row = Math.floor(index / perRow);
                const col = index % perRow;
                record.element.style.left = `${1 + col * (width + gap)}vw`;
                record.element.style.top = `${94 - row * (height + 0.5)}vh`;
                record.element.style.width = `${width}vw`;
                record.element.style.height = `${height}vh`;
            });
    }

    restore(id) {
        const record = this.windows[id];
        if (!record || !record.minimized) return false;
        record.minimized = false;
        record.element.classList.remove("minimized");
        this.applyStoredRect(record);
        this.arrangeMinimized();
        this.updateControls(record);
        return true;
    }

    toggleMinimize(id) {
        const record = this.windows[id];
        if (!record) return false;
        if (record.minimized) {
            this.restore(id);
            this.focus(id);
            return true;
        }
        record.minimized = true;
        record.element.classList.add("minimized");
        this.arrangeMinimized();
        this.updateControls(record);
        return true;
    }

    toggleMaximize(id) {
        const record = this.windows[id];
        if (!record) return false;
        if (record.minimized) this.restore(id);
        if (record.maximized) {
            const target = record.restoreRect || record.rect;
            record.maximized = false;
            record.restoreRect = null;
            record.element.classList.remove("maximized");
            this.setRect(id, target);
        } else {
            record.restoreRect = {...record.rect};
            record.maximized = true;
            record.element.classList.add("maximized");
            this.setRect(id, {left: 2, top: 4, width: 96, height: 90});
        }
        this.focus(id);
        this.updateControls(record);
        return true;
    }

    setTitle(id, title, subtitle) {
        const record = this.windows[id];
        if (!record) return false;
        if (title) record.title.textContent = title;
        if (typeof subtitle !== "undefined") record.subtitle.textContent = subtitle || "";
        return true;
    }

    persist(id) {
        if (!window.settings.windowManager || window.settings.windowManager.rememberLayout === false) return;
        if (!window.settings.windowManager.windows) window.settings.windowManager.windows = {};
        const record = this.windows[id];
        if (record) window.settings.windowManager.windows[id] = {...record.rect};
    }

    focus(id) {
        const record = this.windows[id];
        if (!record) return false;
        record.element.style.zIndex = String(++this.z);
        Object.keys(this.windows).forEach(key => {
            this.windows[key].element.classList.toggle("focused", key === id);
        });
        return true;
    }

    close(id) {
        const record = this.windows[id];
        if (!record) return false;
        if (record.onClose(record) === false) return false;
        record.element.remove();
        delete this.windows[id];
        this.arrangeMinimized();
        return true;
    }
}

class DevEditor {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.path = require("path");
        this.docs = {};
        this.cm = null;
        this.workbenchId = "editor-workbench";
        this.workbench = {
            docs: [],
            activePrimaryId: null,
            activeSecondaryId: null,
            activePane: "primary",
            split: false,
            panelMode: "",
            panelToken: 0,
            body: null,
            root: "",
            sidebarVisible: true,
            fileTree: {
                files: [],
                filter: "",
                loading: false,
                error: "",
                truncated: false,
                token: 0,
                loadedRoot: "",
                expanded: new Set([""])
            }
        };
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    icon(name, title = "") {
        const path = DEVFS_ICON_PATHS[name] || DEVFS_ICON_PATHS.file;
        return `<svg class="dev_ide_icon" viewBox="0 0 24 24" aria-hidden="true" ${title ? `title="${this.escape(title)}"` : ""}>${path}</svg>`;
    }

    fileIconFor(file) {
        const ext = String(file && (file.ext || file.name || file.relative || file.path) || "").split(".").pop().toLowerCase();
        if (["js", "jsx", "ts", "tsx", "mjs", "cjs", "css", "scss", "html", "xml", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "cs", "php", "sql", "sh", "ps1", "bat", "cmd"].includes(ext)) return "code";
        if (["json", "jsonc"].includes(ext)) return "json";
        if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
        if (["pdf"].includes(ext)) return "pdf";
        if (["mp3", "wav", "flac", "ogg"].includes(ext)) return "audio";
        if (["mp4", "webm", "mov", "avi"].includes(ext)) return "video";
        return "file";
    }

    async loadCodeMirror() {
        if (this.cm) return this.cm;
        try {
            this.cm = {
                core: require("codemirror"),
                view: require("@codemirror/view"),
                search: require("@codemirror/search"),
                autocomplete: require("@codemirror/autocomplete"),
                lint: require("@codemirror/lint"),
                language: require("@codemirror/language"),
                commands: require("@codemirror/commands"),
                js: require("@codemirror/lang-javascript"),
                json: require("@codemirror/lang-json"),
                md: require("@codemirror/lang-markdown")
            };
        } catch(error) {
            this.cm = {error};
        }
        return this.cm;
    }

    languageFor(file) {
        const ext = String(file || "").split(".").pop().toLowerCase();
        const cm = this.cm || {};
        if (["js", "jsx", "ts", "tsx", "mjs", "cjs"].includes(ext) && cm.js && cm.js.javascript) return cm.js.javascript({typescript: ["ts", "tsx"].includes(ext)});
        if (["json", "jsonc"].includes(ext) && cm.json && cm.json.json) return cm.json.json();
        if (["md", "markdown"].includes(ext) && cm.md && cm.md.markdown) return cm.md.markdown();
        return [];
    }

    editorSettings() {
        return window.settings.editor || {};
    }

    shouldUseCodeMirror() {
        const settings = this.editorSettings();
        return settings.ideMode !== false || settings.useCodeMirror === true;
    }

    byteLength(value) {
        try {
            return Buffer.byteLength(String(value == null ? "" : value), "utf8");
        } catch(e) {
            return new Blob([String(value == null ? "" : value)]).size;
        }
    }

    formatBytes(value) {
        if (typeof edex !== "undefined" && edex && typeof edex.formatBytes === "function") return edex.formatBytes(value);
        return `${value} B`;
    }

    updateEditorStatus(state, message) {
        if (!state.statusEl) return;
        const bytes = this.byteLength(this.getValue(state));
        const dirty = state.dirty ? "modified" : "clean";
        const search = state.searchQuery
            ? `${state.searchMatches.length} match${state.searchMatches.length === 1 ? "" : "es"}`
            : "";
        state.statusEl.textContent = [
            message || dirty,
            this.formatBytes(bytes),
            state.encoding || "UTF-8 assumed",
            state.editorMode || "",
            search,
            state.path || "unsaved"
        ].filter(Boolean).join(" / ");
    }

    isJsonFile(file) {
        return ["json", "jsonc"].includes(String(file || "").split(".").pop().toLowerCase());
    }

    snippetOptions(file) {
        const ext = String(file || "").split(".").pop().toLowerCase();
        const common = [
            {label: "TODO", type: "text", apply: "TODO: ", detail: "marker"},
            {label: "path.basename", type: "function", apply: "path.basename(${})", detail: "Node path"}
        ];
        if (["js", "jsx", "ts", "tsx", "mjs", "cjs"].includes(ext)) {
            return common.concat([
                {label: "console.log", type: "function", apply: "console.log(${})", detail: "log"},
                {label: "async function", type: "keyword", apply: "async function name() {\n    \n}", detail: "snippet"},
                {label: "try/catch", type: "keyword", apply: "try {\n    \n} catch(error) {\n    console.error(error);\n}", detail: "snippet"},
                {label: "module.exports", type: "keyword", apply: "module.exports = {\n    \n};", detail: "CommonJS"}
            ]);
        }
        if (["json", "jsonc"].includes(ext)) {
            return common.concat([
                {label: "object", type: "constant", apply: "{\n    \n}", detail: "JSON"},
                {label: "array", type: "constant", apply: "[\n    \n]", detail: "JSON"},
                {label: "property", type: "property", apply: "\"key\": ", detail: "JSON"}
            ]);
        }
        if (["md", "markdown"].includes(ext)) {
            return common.concat([
                {label: "heading", type: "text", apply: "## ", detail: "Markdown"},
                {label: "code fence", type: "text", apply: "```text\n\n```", detail: "Markdown"},
                {label: "task", type: "text", apply: "- [ ] ", detail: "Markdown"}
            ]);
        }
        return common;
    }

    completionSource(editorState) {
        return context => {
            const word = context.matchBefore(/[\w$.-]*/);
            if (!word || (word.from === word.to && !context.explicit)) return null;
            const token = word.text.toLowerCase();
            const text = context.state.doc.toString();
            const seen = new Set();
            const options = [];
            const push = option => {
                const label = String(option.label || option.apply || "");
                if (!label || seen.has(label.toLowerCase())) return;
                if (token && !label.toLowerCase().includes(token)) return;
                seen.add(label.toLowerCase());
                options.push(option);
            };
            this.snippetOptions(editorState.path || editorState.name).forEach(push);
            const matches = text.match(/[A-Za-z_$][A-Za-z0-9_$-]{2,}/g) || [];
            matches.slice(-800).forEach(match => push({label: match, type: "variable", detail: "buffer"}));
            return {
                from: word.from,
                options: options.slice(0, 80),
                validFor: /^[\w$.-]*$/
            };
        };
    }

    jsonDiagnostics(editorState) {
        return view => {
            if (!this.isJsonFile(editorState.path || editorState.name)) return [];
            const text = view.state.doc.toString();
            if (!text.trim()) return [];
            try {
                JSON.parse(text);
                return [];
            } catch(error) {
                const match = String(error.message || "").match(/position\s+(\d+)/i);
                const position = match ? Math.max(0, Math.min(Number(match[1]), text.length - 1)) : 0;
                return [{
                    from: position,
                    to: Math.min(position + 1, text.length),
                    severity: "error",
                    message: error.message || "Invalid JSON"
                }];
            }
        };
    }

    createTextArea(host, state, markDirty) {
        const settings = this.editorSettings();
        host.innerHTML = "";
        state.view = null;
        state.lineCount = 0;
        const wrapper = document.createElement("div");
        wrapper.className = "dev_editor_plain";
        state.lineNumbers = document.createElement("pre");
        state.lineNumbers.className = "dev_editor_line_numbers";
        state.textarea = document.createElement("textarea");
        state.textarea.value = typeof state.content === "string" ? state.content : state.original;
        state.textarea.spellcheck = false;
        state.textarea.wrap = settings.wordWrap === false ? "off" : "soft";
        state.textarea.style.fontSize = `${Number(settings.fontSize) || 13}px`;
        state.textarea.style.tabSize = String(Number(settings.tabSize) || 4);
        state.lineNumbers.style.fontSize = state.textarea.style.fontSize;
        state.lineNumbers.style.lineHeight = "1.45";
        state.textarea.addEventListener("keydown", event => {
            if (event.key === "Tab") {
                event.preventDefault();
                const value = state.textarea.value;
                const start = state.textarea.selectionStart;
                const end = state.textarea.selectionEnd;
                const spaces = " ".repeat(Number(settings.tabSize) || 4);
                state.textarea.value = `${value.slice(0, start)}${spaces}${value.slice(end)}`;
                state.textarea.selectionStart = state.textarea.selectionEnd = start + spaces.length;
                state.content = state.textarea.value;
                markDirty(state.textarea.value !== state.original);
                this.updateLineNumbers(state);
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                this.save(state);
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
                event.preventDefault();
                this.focusFind(state);
            }
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "p") {
                event.preventDefault();
                this.openCommandPalette(state);
            }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "p") {
                event.preventDefault();
                this.openQuickOpenPanel();
            }
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") {
                event.preventDefault();
                this.openWorkspaceSearchPanel();
            }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "b") {
                event.preventDefault();
                this.toggleSidebar();
            }
            if (event.key === "F1") {
                event.preventDefault();
                this.openCommandPalette(state);
            }
        });
        state.textarea.addEventListener("input", () => {
            state.content = state.textarea.value;
            markDirty(state.textarea.value !== state.original);
            this.updateLineNumbers(state);
            this.updateSearchMatches(state, false);
        });
        state.textarea.addEventListener("scroll", () => {
            if (state.lineNumbers) state.lineNumbers.scrollTop = state.textarea.scrollTop;
        });
        wrapper.appendChild(state.lineNumbers);
        wrapper.appendChild(state.textarea);
        host.appendChild(wrapper);
        this.updateLineNumbers(state);
        return state.textarea;
    }

    updateLineNumbers(state) {
        if (!state.lineNumbers || !state.textarea) return;
        const value = state.textarea.value || "";
        const lineCount = Math.max(1, (value.match(/\n/g) || []).length + 1);
        if (state.lineCount === lineCount) return;
        state.lineCount = lineCount;
        let numbers = "";
        for (let index = 1; index <= lineCount; index++) numbers += `${index}\n`;
        state.lineNumbers.textContent = numbers;
    }

    windowId(file) {
        return `editor:${String(file || "untitled").replace(/[^a-z0-9_-]/gi, "_").slice(-80)}`;
    }

    createDocState(doc) {
        const id = this.windowId(doc.path || `untitled-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        const content = doc.content || "";
        return {
            id,
            path: doc.path,
            name: doc.name || (doc.path ? this.path.basename(doc.path) : "untitled.txt"),
            original: content,
            content,
            size: typeof doc.size === "number" ? doc.size : this.byteLength(content),
            encoding: doc.encoding || "UTF-8 assumed",
            dirty: false,
            view: null,
            textarea: null,
            editorMode: "plain",
            lineNumbers: null,
            lineCount: 0,
            searchQuery: "",
            replaceValue: "",
            searchMatches: [],
            searchIndex: -1,
            statusEl: null,
            findInput: null,
            replaceInput: null,
            palette: null,
            paletteInput: null,
            paletteResults: null
        };
    }

    captureState(state) {
        if (!state) return;
        if (state.view) {
            state.content = state.view.state.doc.toString();
        } else if (state.textarea) {
            state.content = state.textarea.value;
        } else if (typeof state.content !== "string") {
            state.content = state.original || "";
        }
        state.dirty = state.content !== state.original;
    }

    disposeStateSurface(state) {
        if (!state) return;
        if (state.view && typeof state.view.destroy === "function") {
            state.view.destroy();
        }
        state.view = null;
        state.textarea = null;
        state.lineNumbers = null;
        state.statusEl = null;
        state.findInput = null;
        state.replaceInput = null;
        state.palette = null;
        state.paletteInput = null;
        state.paletteResults = null;
    }

    captureVisibleDocs() {
        const ids = [this.workbench.activePrimaryId, this.workbench.activeSecondaryId].filter(Boolean);
        ids.forEach(id => this.captureState(this.docs[id]));
    }

    activeDoc(pane) {
        const targetPane = pane || this.workbench.activePane || "primary";
        const id = targetPane === "secondary" ? this.workbench.activeSecondaryId : this.workbench.activePrimaryId;
        return this.docs[id] || null;
    }

    workspaceRoot() {
        if (this.workbench && this.workbench.root) return this.workbench.root;
        if (window.fsDisp && window.fsDisp.dirpath) return window.fsDisp.dirpath;
        if (window.devCockpit && typeof window.devCockpit.currentCwd === "function") return window.devCockpit.currentCwd();
        const active = this.activeDoc() || this.activeDoc("primary") || this.activeDoc("secondary");
        if (active && active.path) return this.path.dirname(active.path);
        return window.settings.cwd || ".";
    }

    displayPath(file, root) {
        if (!file) return "unsaved";
        try {
            const relative = this.path.relative(root || this.workspaceRoot(), file);
            if (relative && !relative.startsWith("..") && !this.path.isAbsolute(relative)) return relative.replace(/\\/g, "/");
        } catch(e) {}
        return file;
    }

    updateWorkbenchTitle() {
        const dirty = this.workbench.docs.some(id => this.docs[id] && this.docs[id].dirty);
        const active = this.activeDoc() || this.activeDoc("primary") || this.activeDoc("secondary");
        const subtitle = active ? (active.path || active.name) : this.workspaceRoot();
        this.windowManager.setTitle(this.workbenchId, `${dirty ? "*" : ""}eDEX Workbench`, subtitle);
    }

    ensureWorkbenchWindow() {
        const existing = this.windowManager.windows[this.workbenchId];
        if (existing) {
            this.workbench.body = existing.body;
            this.windowManager.focus(this.workbenchId);
            this.updateWorkbenchTitle();
            return existing;
        }

        return this.windowManager.open({
            id: this.workbenchId,
            title: "eDEX Workbench",
            subtitle: this.workspaceRoot(),
            className: "dev_editor_window dev_ide_window",
            rect: {left: 7, top: 5, width: 86, height: 84},
            onClose: () => this.closeWorkbench(),
            render: body => this.renderWorkbench(body)
        });
    }

    closeWorkbench() {
        this.captureVisibleDocs();
        const dirty = this.workbench.docs
            .map(id => this.docs[id])
            .filter(state => state && state.dirty);
        if (dirty.length && !window.confirm(`${dirty.length} unsaved editor tab${dirty.length === 1 ? "" : "s"}. Close anyway?`)) {
            return false;
        }
        this.workbench.docs.forEach(id => {
            this.disposeStateSurface(this.docs[id]);
            delete this.docs[id];
        });
        this.workbench.docs = [];
        this.workbench.activePrimaryId = null;
        this.workbench.activeSecondaryId = null;
        this.workbench.activePane = "primary";
        this.workbench.panelMode = "";
        this.workbench.body = null;
        return true;
    }

    updateDocTabMarkers(state) {
        if (!this.workbench.body || !state) return;
        this.workbench.body.querySelectorAll("[data-doc-id]").forEach(button => {
            if (button.dataset.docId !== state.id) return;
            const tab = button.closest(".dev_ide_tab");
            if (tab) tab.classList.toggle("dirty", !!state.dirty);
            const label = button.querySelector(".dev_ide_tab_label");
            if (label) label.textContent = `${state.dirty ? "*" : ""}${state.name}`;
        });
    }

    workbenchTabsHtml(root = this.workbench.root || this.workspaceRoot()) {
        const docs = this.workbench.docs.map(id => this.docs[id]).filter(Boolean);
        return docs.length ? docs.map(state => `
            <div class="dev_ide_tab ${state.dirty ? "dirty" : ""} ${state.id === this.workbench.activePrimaryId ? "primary" : ""} ${state.id === this.workbench.activeSecondaryId ? "secondary" : ""}">
                <button type="button" class="dev_ide_tab_main" data-doc-id="${this.escape(state.id)}" title="${this.escape(state.path || state.name)}">
                    <span class="dev_ide_tab_label">${this.escape(`${state.dirty ? "*" : ""}${state.name}`)}</span>
                    <span>${this.escape(this.displayPath(state.path, root))}</span>
                </button>
                <button type="button" class="dev_ide_tab_close" data-close-doc="${this.escape(state.id)}" title="Close">X</button>
            </div>`).join("") : `<div class="dev_ide_empty_tab">NO EDITORS</div>`;
    }

    bindWorkbenchTabs(root = this.workbench.body) {
        if (!root) return;
        root.querySelectorAll("[data-doc-id]").forEach(button => {
            button.addEventListener("click", () => this.activateDoc(button.dataset.docId));
        });
        root.querySelectorAll("[data-close-doc]").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();
                this.closeDoc(button.dataset.closeDoc);
            });
        });
    }

    renderWorkbenchTabs() {
        if (!this.workbench.body) return false;
        const tabs = this.workbench.body.querySelector(".dev_ide_tabs");
        if (!tabs) return false;
        tabs.innerHTML = this.workbenchTabsHtml();
        this.bindWorkbenchTabs(tabs);
        return true;
    }

    normalizeTreePath(value) {
        return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
    }

    buildFileTree(files) {
        const root = {type: "dir", name: "", relative: "", children: new Map()};
        (files || []).forEach(file => {
            const relative = this.normalizeTreePath(file.relative || this.displayPath(file.path, this.workbench.root));
            const parts = relative.split("/").filter(Boolean);
            if (!parts.length) return;
            let node = root;
            parts.forEach((part, index) => {
                const childRelative = parts.slice(0, index + 1).join("/");
                const isFile = index === parts.length - 1;
                if (!node.children.has(part)) {
                    node.children.set(part, isFile
                        ? {...file, type: "file", name: file.name || part, relative: childRelative}
                        : {type: "dir", name: part, relative: childRelative, children: new Map()});
                }
                node = node.children.get(part);
            });
        });
        return root;
    }

    sortedTreeChildren(node) {
        return Array.from((node && node.children || new Map()).values()).sort((a, b) => {
            if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
            return String(a.name || "").localeCompare(String(b.name || ""), undefined, {sensitivity: "base"});
        });
    }

    renderFileTreeNodes(node, depth = 0) {
        const tree = this.workbench.fileTree;
        const filtering = !!tree.filter;
        const activePaths = new Set(this.workbench.docs.map(id => this.docs[id] && this.docs[id].path).filter(Boolean));
        return this.sortedTreeChildren(node).map(child => {
            if (child.type === "dir") {
                const open = filtering || tree.expanded.has(child.relative);
                return `
                    <button type="button" class="dev_ide_tree_row dir ${open ? "open" : ""}" data-tree-dir="${this.escape(child.relative)}" style="--depth:${depth}" title="${this.escape(child.relative)}">
                        <span class="dev_ide_tree_caret">${open ? "v" : ">"}</span>
                        ${this.icon("folder", "Folder")}
                        <span>${this.escape(child.name)}</span>
                    </button>
                    ${open ? this.renderFileTreeNodes(child, depth + 1) : ""}`;
            }
            return `
                <button type="button" class="dev_ide_tree_row file ${activePaths.has(child.path) ? "active" : ""}" data-tree-file="${this.escape(child.path)}" style="--depth:${depth}" title="${this.escape(child.path || child.relative)}">
                    <span class="dev_ide_tree_caret"></span>
                    ${this.icon(this.fileIconFor(child), "File")}
                    <span>${this.escape(child.name || this.path.basename(child.path || child.relative))}</span>
                </button>`;
        }).join("");
    }

    fileSidebarHtml(root) {
        const tree = this.workbench.fileTree;
        const status = tree.loading
            ? "SCANNING"
            : tree.error
                ? tree.error
                : `${tree.files.length} FILE${tree.files.length === 1 ? "" : "S"}${tree.truncated ? " / LIMIT" : ""}`;
        const fileTree = this.buildFileTree(tree.files);
        const rows = tree.error
            ? `<div class="dev_ide_tree_empty">${this.escape(tree.error)}</div>`
            : tree.loading && !tree.files.length
                ? `<div class="dev_ide_tree_empty">SCANNING WORKSPACE</div>`
                : this.renderFileTreeNodes(fileTree) || `<div class="dev_ide_tree_empty">NO FILES</div>`;

        return `
            <aside class="dev_ide_sidebar">
                <div class="dev_ide_sidebar_head">
                    <strong title="${this.escape(root)}">EXPLORER</strong>
                    <button type="button" data-sidebar-action="refresh" title="Refresh files">${this.icon("refresh", "Refresh")}</button>
                    <button type="button" data-sidebar-action="collapse" title="Collapse folders">${this.icon("columns", "Collapse")}</button>
                    <button type="button" data-sidebar-action="hide" title="Hide sidebar">${this.icon("close", "Hide")}</button>
                </div>
                <input type="search" class="dev_ide_sidebar_filter" value="${this.escape(tree.filter)}" spellcheck="false" placeholder="filter files">
                <div class="dev_ide_sidebar_status">${this.escape(status)}</div>
                <div class="dev_ide_tree" role="tree">${rows}</div>
            </aside>`;
    }

    bindFileSidebar(body = this.workbench.body) {
        if (!body) return;
        const filter = body.querySelector(".dev_ide_sidebar_filter");
        let filterTimer = null;
        if (filter) {
            filter.addEventListener("input", () => {
                clearTimeout(filterTimer);
                filterTimer = setTimeout(() => this.loadFileSidebar(this.workspaceRoot(), filter.value), 180);
            });
        }
        body.querySelectorAll("[data-sidebar-action]").forEach(button => {
            button.addEventListener("click", () => {
                switch(button.dataset.sidebarAction) {
                    case "refresh":
                        this.loadFileSidebar(this.workspaceRoot(), this.workbench.fileTree.filter, true);
                        break;
                    case "collapse":
                        this.workbench.fileTree.expanded = new Set([""]);
                        this.renderFileSidebar();
                        break;
                    case "hide":
                        this.workbench.sidebarVisible = false;
                        this.renderWorkbench();
                        break;
                    case "show":
                        this.workbench.sidebarVisible = true;
                        this.renderWorkbench();
                        break;
                    case "toggle":
                        this.toggleSidebar();
                        break;
                    default:
                        break;
                }
            });
        });
        body.querySelectorAll("[data-tree-dir]").forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.treeDir || "";
                const expanded = this.workbench.fileTree.expanded;
                if (expanded.has(target)) expanded.delete(target);
                else expanded.add(target);
                this.renderFileSidebar();
            });
        });
        body.querySelectorAll("[data-tree-file]").forEach(button => {
            button.addEventListener("click", () => this.open(button.dataset.treeFile));
        });
    }

    renderFileSidebar() {
        if (!this.workbench.body) return false;
        const container = this.workbench.body.querySelector(".dev_ide_sidebar_slot");
        if (!container) return false;
        container.innerHTML = this.fileSidebarHtml(this.workspaceRoot());
        this.bindFileSidebar(container);
        return true;
    }

    async loadFileSidebar(root = this.workspaceRoot(), query = this.workbench.fileTree.filter, force = false) {
        const tree = this.workbench.fileTree;
        const normalizedQuery = String(query || "");
        if (!force && tree.loadedRoot === root && tree.filter === normalizedQuery && tree.files.length) {
            return true;
        }
        const token = ++tree.token;
        tree.loading = true;
        tree.error = "";
        tree.filter = normalizedQuery;
        this.renderFileSidebar();
        const data = await edex.workspace.listFiles(root, {query: normalizedQuery, limit: 1200}).catch(error => ({error}));
        if (token !== tree.token) return false;
        tree.loading = false;
        if (!data || data.error) {
            tree.files = [];
            tree.truncated = false;
            tree.loadedRoot = root;
            tree.error = data && data.error ? data.error.message : "Workspace scan failed";
            this.renderFileSidebar();
            return false;
        }
        tree.files = data.files || [];
        tree.truncated = !!data.truncated;
        tree.loadedRoot = data.cwd || root;
        this.workbench.root = data.cwd || root;
        if (!tree.expanded || typeof tree.expanded.has !== "function") tree.expanded = new Set([""]);
        this.renderFileSidebar();
        this.updateWorkbenchTitle();
        return true;
    }

    activateDoc(id, pane) {
        if (!this.docs[id]) return false;
        this.captureVisibleDocs();
        const targetPane = pane || this.workbench.activePane || "primary";
        if (this.workbench.split && targetPane === "secondary") {
            this.workbench.activeSecondaryId = id;
            this.workbench.activePane = "secondary";
        } else {
            this.workbench.activePrimaryId = id;
            this.workbench.activePane = "primary";
        }
        const record = this.ensureWorkbenchWindow();
        this.renderWorkbench(record.body);
        this.updateWorkbenchTitle();
        return true;
    }

    closeDoc(id) {
        const state = this.docs[id];
        if (!state) return false;
        this.captureState(state);
        if (state.dirty && !window.confirm(`${state.name} has unsaved changes. Close anyway?`)) {
            return false;
        }

        const index = this.workbench.docs.indexOf(id);
        this.disposeStateSurface(state);
        delete this.docs[id];
        this.workbench.docs = this.workbench.docs.filter(item => item !== id);
        const fallback = this.workbench.docs[index] || this.workbench.docs[index - 1] || this.workbench.docs[0] || null;
        if (this.workbench.activePrimaryId === id) this.workbench.activePrimaryId = fallback;
        if (this.workbench.activeSecondaryId === id) {
            this.workbench.activeSecondaryId = this.workbench.docs.find(item => item !== this.workbench.activePrimaryId) || null;
        }
        if (!this.workbench.docs.length) {
            this.workbench.activePrimaryId = null;
            this.workbench.activeSecondaryId = null;
            this.workbench.activePane = "primary";
        }

        const record = this.ensureWorkbenchWindow();
        this.renderWorkbench(record.body);
        this.updateWorkbenchTitle();
        return true;
    }

    toggleSplit() {
        this.captureVisibleDocs();
        this.workbench.split = !this.workbench.split;
        if (this.workbench.split) {
            this.workbench.activeSecondaryId = this.workbench.activeSecondaryId
                || this.workbench.docs.find(id => id !== this.workbench.activePrimaryId)
                || null;
            this.workbench.activePane = this.workbench.activeSecondaryId ? "secondary" : "primary";
        } else {
            this.workbench.activePane = "primary";
        }
        const record = this.ensureWorkbenchWindow();
        this.renderWorkbench(record.body);
        this.updateWorkbenchTitle();
        return true;
    }

    toggleSidebar() {
        this.workbench.sidebarVisible = !this.workbench.sidebarVisible;
        const record = this.ensureWorkbenchWindow();
        this.renderWorkbench(record.body);
        return true;
    }

    renderWorkbench(body = this.workbench.body) {
        if (!body) return false;
        const primaryState = this.docs[this.workbench.activePrimaryId] || null;
        const secondaryState = this.docs[this.workbench.activeSecondaryId] || null;
        [primaryState, secondaryState].filter(Boolean).forEach(state => {
            this.captureState(state);
            this.disposeStateSurface(state);
        });

        this.workbench.body = body;
        const root = this.workspaceRoot();
        this.workbench.root = root;
        const tabs = this.workbenchTabsHtml(root);

        body.innerHTML = `
            <div class="dev_ide_shell">
                <div class="dev_ide_bar">
                    <button type="button" data-sidebar-action="toggle" title="Toggle explorer">${this.icon("folder", "Explorer")}</button>
                    <button type="button" data-ide-action="new-file" title="New file">${this.icon("filePlus", "New")}</button>
                    <button type="button" data-ide-action="quick-open" title="Quick open">${this.icon("search", "Quick open")}<span>Quick Open</span></button>
                    <button type="button" data-ide-action="workspace-search" title="Search workspace">${this.icon("search", "Search")}<span>Search</span></button>
                    <button type="button" data-ide-action="split-toggle" title="Toggle split">${this.icon("columns", "Split")}<span>${this.workbench.split ? "Unsplit" : "Split"}</span></button>
                    <span class="dev_ide_root">${this.escape(root)}</span>
                </div>
                <div class="dev_ide_tabs">${tabs}</div>
                <div class="dev_ide_body ${this.workbench.sidebarVisible ? "" : "sidebar-hidden"}">
                    <div class="dev_ide_sidebar_slot">
                        ${this.workbench.sidebarVisible ? this.fileSidebarHtml(root) : ""}
                    </div>
                    <div class="dev_ide_main">
                        <div class="dev_ide_panel hidden"></div>
                        <div class="dev_ide_panes ${this.workbench.split ? "split" : ""}">
                            <div class="dev_ide_pane ${this.workbench.activePane === "primary" ? "active" : ""}" data-pane="primary">
                                <div class="dev_ide_editor_mount" data-pane-mount="primary"></div>
                            </div>
                            <div class="dev_ide_pane ${this.workbench.activePane === "secondary" ? "active" : ""}" data-pane="secondary">
                                <div class="dev_ide_editor_mount" data-pane-mount="secondary"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        body.querySelectorAll("[data-ide-action]").forEach(button => {
            button.addEventListener("click", () => {
                switch(button.dataset.ideAction) {
                    case "new-file":
                        this.open();
                        break;
                    case "quick-open":
                        this.openQuickOpenPanel();
                        break;
                    case "workspace-search":
                        this.openWorkspaceSearchPanel();
                        break;
                    case "split-toggle":
                        this.toggleSplit();
                        break;
                    default:
                        break;
                }
            });
        });
        this.bindWorkbenchTabs(body);
        this.bindFileSidebar(body);
        body.querySelectorAll("[data-pane]").forEach(pane => {
            pane.addEventListener("mousedown", () => {
                this.workbench.activePane = pane.dataset.pane;
                body.querySelectorAll("[data-pane]").forEach(candidate => candidate.classList.toggle("active", candidate === pane));
            });
        });
        body.addEventListener("keydown", event => {
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "p") {
                event.preventDefault();
                this.openQuickOpenPanel();
            }
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") {
                event.preventDefault();
                this.openWorkspaceSearchPanel();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
                event.preventDefault();
                this.toggleSplit();
            }
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "b") {
                event.preventDefault();
                this.toggleSidebar();
            }
        }, true);

        const primaryMount = body.querySelector("[data-pane-mount='primary']");
        const secondaryMount = body.querySelector("[data-pane-mount='secondary']");
        if (primaryState) {
            this.render(primaryMount, primaryState);
        } else {
            primaryMount.innerHTML = `<div class="dev_ide_empty">OPEN A FILE</div>`;
        }
        if (this.workbench.split) {
            if (secondaryState && secondaryState.id !== (primaryState && primaryState.id)) {
                this.render(secondaryMount, secondaryState);
            } else {
                secondaryMount.innerHTML = `<div class="dev_ide_empty">SELECT A SECOND TAB</div>`;
            }
        } else {
            secondaryMount.innerHTML = "";
        }
        this.updateWorkbenchTitle();
        if (this.workbench.sidebarVisible && this.workbench.fileTree.loadedRoot !== root && !this.workbench.fileTree.loading) {
            this.loadFileSidebar(root, this.workbench.fileTree.filter);
        }
        return true;
    }

    hideWorkbenchPanel() {
        const panel = this.workbench.body && this.workbench.body.querySelector(".dev_ide_panel");
        if (!panel) return false;
        panel.classList.add("hidden");
        panel.innerHTML = "";
        this.workbench.panelMode = "";
        return true;
    }

    panelShell(mode, placeholder) {
        const panel = this.workbench.body && this.workbench.body.querySelector(".dev_ide_panel");
        if (!panel) return null;
        this.workbench.panelMode = mode;
        panel.classList.remove("hidden");
        panel.innerHTML = `
            <div class="dev_ide_panel_head">
                <input type="search" data-role="workspace-query" spellcheck="false" placeholder="${this.escape(placeholder)}">
                <button type="button" data-panel-close title="Close">X</button>
            </div>
            <div class="dev_ide_results"></div>`;
        const input = panel.querySelector("[data-role='workspace-query']");
        panel.querySelector("[data-panel-close]").addEventListener("click", () => this.hideWorkbenchPanel());
        input.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                this.hideWorkbenchPanel();
            }
            if (event.key === "Enter") {
                event.preventDefault();
                const first = panel.querySelector("[data-open-file]");
                if (first) this.openPanelFile(first.dataset.openFile, first.dataset.line, first.dataset.column);
            }
        });
        setTimeout(() => input.focus(), 0);
        return {panel, input, results: panel.querySelector(".dev_ide_results")};
    }

    openQuickOpenPanel() {
        const shell = this.panelShell("quick-open", "quick open");
        if (!shell) return false;
        let timer = null;
        const run = () => this.runQuickOpen(shell.input.value, shell.results);
        shell.input.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(run, 160);
        });
        run();
        return true;
    }

    async runQuickOpen(query, results) {
        const token = ++this.workbench.panelToken;
        const root = this.workspaceRoot();
        results.innerHTML = `<div class="devfs_empty">SCANNING ${this.escape(root)}</div>`;
        const data = await edex.workspace.listFiles(root, {query, limit: 90}).catch(error => ({error}));
        if (token !== this.workbench.panelToken || this.workbench.panelMode !== "quick-open") return false;
        if (!data || data.error) {
            results.innerHTML = `<div class="devfs_empty">${this.escape(data && data.error ? data.error.message : "Workspace scan failed")}</div>`;
            return false;
        }
        const files = data.files || [];
        results.innerHTML = files.length ? files.map(file => `
            <button type="button" data-open-file="${this.escape(file.path)}">
                <strong>${this.escape(file.name)}</strong>
                <span>${this.escape(file.relative || this.displayPath(file.path, root))}</span>
            </button>`).join("") + (data.truncated ? `<div class="dev_ide_result_note">LIMIT REACHED</div>` : "") : `<div class="devfs_empty">NO FILES</div>`;
        results.querySelectorAll("[data-open-file]").forEach(button => {
            button.addEventListener("click", () => this.openPanelFile(button.dataset.openFile));
        });
        return true;
    }

    openWorkspaceSearchPanel() {
        const shell = this.panelShell("workspace-search", "search workspace");
        if (!shell) return false;
        let timer = null;
        const run = () => this.runWorkspaceSearch(shell.input.value, shell.results);
        shell.input.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(run, 220);
        });
        shell.results.innerHTML = `<div class="devfs_empty">ENTER SEARCH TEXT</div>`;
        return true;
    }

    async runWorkspaceSearch(query, results) {
        const token = ++this.workbench.panelToken;
        const root = this.workspaceRoot();
        const value = String(query || "").trim();
        if (!value) {
            results.innerHTML = `<div class="devfs_empty">ENTER SEARCH TEXT</div>`;
            return false;
        }
        results.innerHTML = `<div class="devfs_empty">SEARCHING ${this.escape(root)}</div>`;
        const data = await edex.workspace.search(root, value, {maxMatches: 160, maxFiles: 2200}).catch(error => ({error}));
        if (token !== this.workbench.panelToken || this.workbench.panelMode !== "workspace-search") return false;
        if (!data || data.error) {
            results.innerHTML = `<div class="devfs_empty">${this.escape(data && data.error ? data.error.message : "Workspace search failed")}</div>`;
            return false;
        }
        const matches = data.matches || [];
        results.innerHTML = matches.length ? matches.map(match => `
            <button type="button" data-open-file="${this.escape(match.path)}" data-line="${this.escape(match.line)}" data-column="${this.escape(match.column)}">
                <strong>${this.escape(match.relative || this.displayPath(match.path, root))}:${this.escape(match.line)}:${this.escape(match.column)}</strong>
                <span>${this.escape(match.preview || "")}</span>
            </button>`).join("") + (data.truncated ? `<div class="dev_ide_result_note">LIMIT REACHED</div>` : "") : `<div class="devfs_empty">NO MATCHES</div>`;
        results.querySelectorAll("[data-open-file]").forEach(button => {
            button.addEventListener("click", () => this.openPanelFile(button.dataset.openFile, button.dataset.line, button.dataset.column));
        });
        return true;
    }

    async openPanelFile(file, line, column) {
        const reveal = Number(line) > 0 ? {line: Number(line), column: Number(column) || 1} : null;
        await this.open(file, reveal ? {reveal} : {});
        this.hideWorkbenchPanel();
        return true;
    }

    revealLocation(state, location) {
        if (!state || !location) return false;
        const line = Math.max(1, Number(location.line) || 1);
        const column = Math.max(1, Number(location.column) || 1);
        const lines = this.getValue(state).split(/\r?\n/);
        let offset = 0;
        for (let index = 0; index < Math.min(line - 1, lines.length); index++) {
            offset += lines[index].length + 1;
        }
        const targetLine = lines[Math.max(0, line - 1)] || "";
        offset += Math.min(column - 1, targetLine.length);
        this.setSelection(state, offset, offset);
        this.updateEditorStatus(state, `line ${line}`);
        return true;
    }

    async open(file, options = {}) {
        const doc = file ? await edex.devfs.readFile(file, 5 * 1024 * 1024) : {
            path: null,
            name: "untitled.txt",
            content: ""
        };
        if (doc && doc.error) return this.openError(file, doc);
        return this.openDoc(doc, options);
    }

    openError(file, error) {
        const id = `editor-error:${String(file || "untitled").replace(/[^a-z0-9_-]/gi, "_").slice(-80)}`;
        const title = this.path.basename(file || "Editor");
        return this.windowManager.open({
            id,
            title: "Editor",
            subtitle: title,
            className: "dev_editor_error_window",
            rect: {left: 18, top: 12, width: 56, height: 42},
            render: body => {
                const detail = this.editorErrorDetail(error);
                body.innerHTML = `
                    <div class="dev_editor_error">
                        <h4>${this.escape(detail.title)}</h4>
                        <p>${this.escape(detail.message)}</p>
                        <code>${this.escape(file || "")}</code>
                        <div class="dev_editor_error_actions">
                            <button type="button" data-action="preview">Preview</button>
                            <button type="button" data-action="external">Open External</button>
                            <button type="button" data-action="path">Copy Path</button>
                            <button type="button" data-action="reveal">Reveal in Explorer</button>
                        </div>
                    </div>`;
                body.querySelector("[data-action='preview']").addEventListener("click", () => window.devCockpit.mediaViewer.open(file));
                body.querySelector("[data-action='external']").addEventListener("click", () => edex.devfs.openExternal(file));
                body.querySelector("[data-action='path']").addEventListener("click", () => edex.devfs.copyPath(file, "windows"));
                body.querySelector("[data-action='reveal']").addEventListener("click", () => this.revealInExplorer(file));
            }
        });
    }

    editorErrorDetail(error) {
        const code = error && error.code || "read-error";
        if (code === "file-too-large") return {
            title: "File is too large",
            message: `The editor limit is ${error.limit || "5 MB"}. Use Preview or Open External.`
        };
        if (code === "binary-file") return {
            title: "Binary file",
            message: "This file contains binary bytes. Use Preview for hex/media inspection or Open External."
        };
        if (code === "invalid-utf8") return {
            title: "Invalid UTF-8",
            message: "The editor expects UTF-8 text. Preview can still show a safe representation."
        };
        if (code === "permission-denied") return {
            title: "Permission denied",
            message: "The current process cannot read this file."
        };
        return {
            title: "File could not be opened",
            message: error && error.message || "Unknown editor read failure."
        };
    }

    revealInExplorer(file) {
        if (!file || !window.fsDisp || !window.fsDisp.readFS) return false;
        const dir = this.path.dirname(file);
        window.fsDisp.readFS(dir).then(() => {
            if (window.fsDisp.setStatus) window.fsDisp.setStatus(`Revealed ${this.path.basename(file)}`);
        }).catch(() => {});
        return true;
    }

    async openDoc(doc, options = {}) {
        this.captureVisibleDocs();
        const existingId = doc.path && this.workbench.docs.find(id => this.docs[id] && this.docs[id].path === doc.path);
        let state = existingId ? this.docs[existingId] : null;
        if (!state) {
            state = this.createDocState(doc);
            this.docs[state.id] = state;
            this.workbench.docs.push(state.id);
        }
        if (options.reveal) state.pendingReveal = options.reveal;

        if (this.workbench.split && this.workbench.activePane === "secondary") {
            this.workbench.activeSecondaryId = state.id;
        } else {
            this.workbench.activePrimaryId = state.id;
            this.workbench.activePane = "primary";
        }
        if (!this.workbench.activePrimaryId) this.workbench.activePrimaryId = state.id;
        if (this.workbench.split && !this.workbench.activeSecondaryId) {
            this.workbench.activeSecondaryId = this.workbench.docs.find(id => id !== this.workbench.activePrimaryId) || state.id;
        }

        const hadWindow = !!this.windowManager.windows[this.workbenchId];
        const record = this.ensureWorkbenchWindow();
        if (hadWindow) this.renderWorkbench(record.body);
        this.updateWorkbenchTitle();
        return record;
    }

    async render(body, state) {
        this.captureState(state);
        this.disposeStateSurface(state);
        state.editorMode = "plain";
        body.innerHTML = `
            <div class="dev_editor_toolbar">
                <button type="button" data-action="save">Save</button>
                <button type="button" data-action="save-as">Save as</button>
                <button type="button" data-action="find">Find</button>
                <button type="button" data-action="command-palette">Command</button>
                <button type="button" data-action="open-external">Open External</button>
                <button type="button" data-action="copy-path">Copy Path</button>
                <button type="button" data-action="reveal">Reveal</button>
                <button type="button" data-action="toggle-sidebar">Sidebar</button>
                <div class="dev_editor_searchbar">
                    <input type="search" data-role="find" spellcheck="false" placeholder="find">
                    <input type="text" data-role="replace" spellcheck="false" placeholder="replace">
                    <button type="button" data-action="find-prev">Prev</button>
                    <button type="button" data-action="find-next">Next</button>
                    <button type="button" data-action="replace">Replace</button>
                    <button type="button" data-action="replace-all">All</button>
                </div>
                <button type="button" data-action="insert-path">Insert path</button>
                <span class="dev_editor_state">clean</span>
            </div>
            <div class="dev_editor_palette hidden">
                <input type="search" data-role="command-palette" spellcheck="false" placeholder="Type a command">
                <div class="dev_editor_palette_results"></div>
            </div>
            <div class="dev_editor_host"></div>`;
        const host = body.querySelector(".dev_editor_host");
        const status = body.querySelector(".dev_editor_state");
        state.statusEl = status;
        state.findInput = body.querySelector("[data-role='find']");
        state.replaceInput = body.querySelector("[data-role='replace']");
        state.palette = body.querySelector(".dev_editor_palette");
        state.paletteInput = body.querySelector("[data-role='command-palette']");
        state.paletteResults = body.querySelector(".dev_editor_palette_results");
        const markDirty = dirty => {
            state.dirty = dirty;
            this.updateDocTabMarkers(state);
            this.updateWorkbenchTitle();
            this.updateEditorStatus(state);
        };
        state.markDirty = markDirty;

        this.createTextArea(host, state, markDirty);
        if (this.shouldUseCodeMirror()) {
            try {
                const cm = await this.loadCodeMirror();
                if (!cm.core || !cm.core.EditorView) throw cm.error || new Error("CodeMirror is not available");
                const extensions = [
                    cm.core.basicSetup,
                    cm.language.bracketMatching(),
                    cm.language.foldGutter(),
                    cm.view.highlightActiveLine(),
                    cm.search.highlightSelectionMatches(),
                    cm.autocomplete.closeBrackets(),
                    cm.autocomplete.autocompletion({override: [this.completionSource(state)]}),
                    cm.lint.lintGutter(),
                    cm.lint.linter(this.jsonDiagnostics(state)),
                    cm.view.keymap.of([
                        {
                            key: "Mod-s",
                            preventDefault: true,
                            run: () => {
                                this.save(state);
                                return true;
                            }
                        },
                        {
                            key: "Ctrl-Shift-p",
                            run: () => this.openCommandPalette(state)
                        },
                        {
                            key: "Mod-Shift-p",
                            run: () => this.openCommandPalette(state)
                        },
                        {
                            key: "F1",
                            run: () => this.openCommandPalette(state)
                        },
                        {
                            key: "Mod-Shift-f",
                            run: () => {
                                this.openWorkspaceSearchPanel();
                                return true;
                            }
                        },
                        {
                            key: "Mod-p",
                            preventDefault: true,
                            run: () => {
                                this.openQuickOpenPanel();
                                return true;
                            }
                        },
                        {
                            key: "Mod-\\",
                            preventDefault: true,
                            run: () => {
                                this.toggleSplit();
                                return true;
                            }
                        },
                        {
                            key: "Mod-b",
                            preventDefault: true,
                            run: () => this.toggleSidebar()
                        },
                        ...(cm.search.searchKeymap || []),
                        ...(cm.autocomplete.completionKeymap || []),
                        ...(cm.lint.lintKeymap || [])
                    ]),
                    this.languageFor(state.path || state.name),
                    cm.core.EditorView.updateListener.of(update => {
                        if (update.docChanged) {
                            state.content = update.state.doc.toString();
                            markDirty(this.getValue(state) !== state.original);
                            this.updateSearchMatches(state, false);
                        }
                    })
                ];
                host.innerHTML = "";
                state.textarea = null;
                state.lineNumbers = null;
                state.view = new cm.core.EditorView({
                    doc: typeof state.content === "string" ? state.content : state.original,
                    extensions,
                    parent: host
                });
                state.editorMode = "CodeMirror IDE";
            } catch(error) {
                this.createTextArea(host, state, markDirty);
                status.textContent = `fallback editor: ${error.message}`;
                state.editorMode = "plain fallback";
            }
        }

        body.querySelectorAll(".dev_editor_toolbar button").forEach(button => {
            button.addEventListener("click", () => this.handleAction(state, button.dataset.action));
        });
        state.findInput.addEventListener("input", () => {
            state.searchQuery = state.findInput.value;
            this.updateSearchMatches(state, false);
        });
        state.findInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.findNext(state, event.shiftKey ? -1 : 1);
            }
        });
        state.replaceInput.addEventListener("input", () => {
            state.replaceValue = state.replaceInput.value;
        });
        state.paletteInput.addEventListener("input", () => this.renderCommandPalette(state));
        state.paletteInput.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                this.closeCommandPalette(state);
            }
            if (event.key === "Enter") {
                event.preventDefault();
                const first = state.paletteResults.querySelector("button[data-command-id]");
                if (first) this.runPaletteCommand(state, first.dataset.commandId);
            }
        });
        state.paletteResults.addEventListener("click", event => {
            const button = event.target.closest("button[data-command-id]");
            if (button) this.runPaletteCommand(state, button.dataset.commandId);
        });
        markDirty(this.getValue(state) !== state.original);
        if (state.pendingReveal) {
            const reveal = state.pendingReveal;
            state.pendingReveal = null;
            this.revealLocation(state, reveal);
        }
    }

    getValue(state) {
        if (state.view) return state.view.state.doc.toString();
        if (state.textarea) return state.textarea.value;
        return typeof state.content === "string" ? state.content : "";
    }

    setValue(state, value, selectionStart, selectionEnd) {
        state.content = String(value == null ? "" : value);
        if (state.view) {
            const length = state.view.state.doc.length;
            state.view.dispatch({
                changes: {from: 0, to: length, insert: state.content}
            });
            if (typeof selectionStart === "number") {
                state.view.dispatch({selection: {anchor: selectionStart, head: typeof selectionEnd === "number" ? selectionEnd : selectionStart}});
            }
        } else if (state.textarea) {
            state.textarea.value = state.content;
            if (typeof selectionStart === "number") {
                state.textarea.setSelectionRange(selectionStart, typeof selectionEnd === "number" ? selectionEnd : selectionStart);
            }
            this.updateLineNumbers(state);
        }
        if (state.markDirty) state.markDirty(this.getValue(state) !== state.original);
    }

    selectionRange(state) {
        if (state.view) {
            const selection = state.view.state.selection.main;
            return {start: selection.from, end: selection.to};
        }
        if (state.textarea) return {start: state.textarea.selectionStart, end: state.textarea.selectionEnd};
        return {start: 0, end: 0};
    }

    setSelection(state, start, end) {
        if (state.view) {
            state.view.dispatch({selection: {anchor: start, head: end}, scrollIntoView: true});
            state.view.focus();
            return;
        }
        if (state.textarea) {
            state.textarea.focus();
            state.textarea.setSelectionRange(start, end);
        }
    }

    updateSearchMatches(state, selectFirst) {
        state.searchQuery = state.findInput ? state.findInput.value : state.searchQuery;
        const needle = state.searchQuery;
        const value = this.getValue(state);
        state.searchMatches = [];
        state.searchIndex = -1;
        if (needle) {
            const lowerValue = value.toLowerCase();
            const lowerNeedle = needle.toLowerCase();
            let index = lowerValue.indexOf(lowerNeedle);
            while (index >= 0) {
                state.searchMatches.push(index);
                index = lowerValue.indexOf(lowerNeedle, index + Math.max(1, lowerNeedle.length));
            }
            if (selectFirst && state.searchMatches.length) {
                state.searchIndex = 0;
                this.setSelection(state, state.searchMatches[0], state.searchMatches[0] + needle.length);
            }
        }
        this.updateEditorStatus(state);
        return state.searchMatches;
    }

    focusFind(state) {
        if (!state.findInput) return false;
        state.findInput.focus();
        state.findInput.select();
        return true;
    }

    findNext(state, direction = 1) {
        if (!state.searchQuery && state.findInput) state.searchQuery = state.findInput.value;
        const matches = this.updateSearchMatches(state, false);
        if (!state.searchQuery) return this.focusFind(state);
        if (!matches.length) {
            this.updateEditorStatus(state, "no matches");
            return false;
        }
        const range = this.selectionRange(state);
        const needleLength = state.searchQuery.length;
        let next = 0;
        if (direction < 0) {
            next = matches.length - 1;
            for (let index = matches.length - 1; index >= 0; index--) {
                if (matches[index] < range.start) {
                    next = index;
                    break;
                }
            }
        } else {
            next = 0;
            const threshold = range.end > range.start ? range.end : range.start;
            for (let index = 0; index < matches.length; index++) {
                if (matches[index] >= threshold) {
                    next = index;
                    break;
                }
            }
        }
        state.searchIndex = next;
        this.setSelection(state, matches[next], matches[next] + needleLength);
        this.updateEditorStatus(state, `${next + 1}/${matches.length} match`);
        return true;
    }

    replaceCurrent(state) {
        state.replaceValue = state.replaceInput ? state.replaceInput.value : state.replaceValue;
        const needle = state.searchQuery || (state.findInput && state.findInput.value);
        if (!needle) return this.focusFind(state);
        const value = this.getValue(state);
        const range = this.selectionRange(state);
        const selected = value.slice(range.start, range.end);
        if (selected.toLowerCase() !== needle.toLowerCase()) {
            if (!this.findNext(state, 1)) return false;
            return this.replaceCurrent(state);
        }
        const nextValue = value.slice(0, range.start) + state.replaceValue + value.slice(range.end);
        const nextEnd = range.start + state.replaceValue.length;
        this.setValue(state, nextValue, range.start, nextEnd);
        this.updateSearchMatches(state, false);
        this.updateEditorStatus(state, "replaced");
        return true;
    }

    replaceAll(state) {
        state.searchQuery = state.findInput ? state.findInput.value : state.searchQuery;
        state.replaceValue = state.replaceInput ? state.replaceInput.value : state.replaceValue;
        if (!state.searchQuery) return this.focusFind(state);
        const matches = this.updateSearchMatches(state, false);
        if (!matches.length) {
            this.updateEditorStatus(state, "no matches");
            return false;
        }
        const escaped = state.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const nextValue = this.getValue(state).replace(new RegExp(escaped, "gi"), state.replaceValue);
        this.setValue(state, nextValue);
        this.updateSearchMatches(state, false);
        this.updateEditorStatus(state, `replaced ${matches.length}`);
        return true;
    }

    commandPaletteActions(state) {
        return [
            {
                id: "save",
                label: "File: Save",
                detail: "Write current file through devfs IPC",
                run: () => this.save(state)
            },
            {
                id: "save-as",
                label: "File: Save As",
                detail: "Write current buffer to a new path",
                run: () => this.saveAs(state)
            },
            {
                id: "find",
                label: "Edit: Find",
                detail: "Focus local search",
                run: () => this.focusFind(state)
            },
            {
                id: "replace-all",
                label: "Edit: Replace All",
                detail: "Replace all current search matches",
                run: () => this.replaceAll(state)
            },
            {
                id: "format-json",
                label: "Format: JSON",
                detail: "Pretty-print valid JSON content",
                run: () => this.formatJson(state)
            },
            {
                id: "workspace-quick-open",
                label: "Workspace: Quick Open",
                detail: "Open a file from the current workspace",
                run: () => this.openQuickOpenPanel()
            },
            {
                id: "workspace-search",
                label: "Workspace: Search",
                detail: "Search text across workspace files",
                run: () => this.openWorkspaceSearchPanel()
            },
            {
                id: "view-toggle-split",
                label: "View: Toggle Split",
                detail: "Toggle the second editor pane",
                run: () => this.toggleSplit()
            },
            {
                id: "view-toggle-explorer",
                label: "View: Toggle Explorer",
                detail: "Show or hide the IDE file sidebar",
                run: () => this.toggleSidebar()
            },
            {
                id: "file-close-tab",
                label: "File: Close Editor",
                detail: state.name || "Current editor",
                run: () => this.closeDoc(state.id)
            },
            {
                id: "copy-path",
                label: "File: Copy Path",
                detail: state.path || "No path yet",
                run: () => {
                    if (!state.path) return false;
                    edex.clipboard.writeText(state.path);
                    this.updateEditorStatus(state, "path copied");
                    return true;
                }
            },
            {
                id: "open-external",
                label: "File: Open External",
                detail: "Open with the OS default application",
                run: () => {
                    if (!state.path) return false;
                    return edex.devfs.openExternal(state.path);
                }
            },
            {
                id: "insert-path",
                label: "Terminal: Insert File Path",
                detail: "Paste this file path into the active terminal",
                run: () => this.handleAction(state, "insert-path")
            }
        ];
    }

    renderCommandPalette(state) {
        if (!state.paletteResults) return;
        const query = String(state.paletteInput && state.paletteInput.value || "").toLowerCase();
        const actions = this.commandPaletteActions(state).filter(action => {
            const haystack = `${action.label} ${action.detail}`.toLowerCase();
            return !query || haystack.includes(query);
        });
        state.paletteResults.innerHTML = actions.length ? actions.slice(0, 12).map(action => `
            <button type="button" data-command-id="${this.escape(action.id)}">
                <strong>${this.escape(action.label)}</strong>
                <span>${this.escape(action.detail || "")}</span>
            </button>`).join("") : `<div class="devfs_empty">No commands match.</div>`;
    }

    openCommandPalette(state) {
        if (!state.palette || !state.paletteInput) return false;
        state.palette.classList.remove("hidden");
        state.paletteInput.value = "";
        this.renderCommandPalette(state);
        state.paletteInput.focus();
        state.paletteInput.select();
        return true;
    }

    closeCommandPalette(state) {
        if (!state.palette) return false;
        state.palette.classList.add("hidden");
        if (state.view) state.view.focus();
        else if (state.textarea) state.textarea.focus();
        return true;
    }

    runPaletteCommand(state, id) {
        const action = this.commandPaletteActions(state).find(item => item.id === id);
        if (!action) return false;
        this.closeCommandPalette(state);
        return action.run();
    }

    formatJson(state) {
        try {
            const parsed = JSON.parse(this.getValue(state));
            const formatted = `${JSON.stringify(parsed, null, 4)}\n`;
            this.setValue(state, formatted);
            this.updateEditorStatus(state, "formatted JSON");
            return true;
        } catch(error) {
            this.updateEditorStatus(state, `format failed: ${error.message}`);
            return false;
        }
    }

    async handleAction(state, action) {
        switch(action) {
            case "save":
                return this.save(state);
            case "save-as":
                return this.saveAs(state);
            case "find":
                return this.focusFind(state);
            case "find-prev":
                return this.findNext(state, -1);
            case "find-next":
                return this.findNext(state, 1);
            case "replace":
                return this.replaceCurrent(state);
            case "replace-all":
                return this.replaceAll(state);
            case "command-palette":
                return this.openCommandPalette(state);
            case "insert-path":
                if (state.path && window.term && window.term[window.currentTerm]) window.term[window.currentTerm].write(`"${state.path}"`);
                return true;
            case "open-external":
                if (state.path) return edex.devfs.openExternal(state.path);
                return false;
            case "copy-path":
                if (state.path) {
                    edex.clipboard.writeText(state.path);
                    this.updateEditorStatus(state, "path copied");
                    return true;
                }
                return false;
            case "reveal":
                return state.path ? this.revealInExplorer(state.path) : false;
            case "toggle-sidebar":
                return this.toggleSidebar();
            default:
                return false;
        }
    }

    async save(state) {
        this.captureState(state);
        if (!state.path) return this.saveAs(state);
        const result = await edex.devfs.writeFile(state.path, this.getValue(state));
        state.original = this.getValue(state);
        state.content = state.original;
        state.name = result.name;
        state.path = result.path;
        state.size = result.size;
        state.dirty = false;
        this.updateDocTabMarkers(state);
        this.updateWorkbenchTitle();
        this.updateEditorStatus(state, "saved");
        return result;
    }

    async saveAs(state) {
        this.captureState(state);
        const target = window.prompt("Save as", state.path || state.name);
        if (!target) return false;
        const result = await edex.devfs.saveAs(target, this.getValue(state));
        state.original = this.getValue(state);
        state.content = state.original;
        state.name = result.name;
        state.path = result.path;
        state.size = result.size;
        state.dirty = false;
        this.updateDocTabMarkers(state);
        this.renderWorkbenchTabs();
        this.updateWorkbenchTitle();
        this.updateEditorStatus(state, "saved as");
        if (this.workbench.sidebarVisible) this.loadFileSidebar(this.workspaceRoot(), this.workbench.fileTree.filter, true);
        return result;
    }

    find(state) {
        const needle = window.prompt("Find text");
        if (!needle) return false;
        const value = this.getValue(state);
        const index = value.toLowerCase().indexOf(needle.toLowerCase());
        if (index < 0) {
            new Modal({type: "info", title: "Editor", message: "No match."});
            return false;
        }
        if (state.textarea) {
            state.textarea.focus();
            state.textarea.setSelectionRange(index, index + needle.length);
        }
        return true;
    }
}

class DevMediaViewer {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.path = require("path");
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    async open(file) {
        const preview = await edex.devfs.preview(file, 1024 * 1024).catch(error => ({kind: "error", content: error.message, path: file}));
        const id = `media:${String(file).replace(/[^a-z0-9_-]/gi, "_").slice(-80)}`;
        return this.windowManager.open({
            id,
            title: this.path.basename(file),
            subtitle: file,
            className: "dev_media_window",
            rect: {left: 13, top: 8, width: 68, height: 70},
            render: body => this.render(body, preview, file)
        });
    }

    render(body, preview, file) {
        const mime = preview.mime || "";
        let media = `<div class="devfs_empty">${this.escape(preview.content || "Media preview unavailable")}</div>`;
        if (preview.kind === "image") {
            media = `<img src="${this.escape(preview.url)}" alt="">`;
        } else if (preview.kind === "pdf") {
            media = `<iframe src="${this.escape(preview.url)}"></iframe>`;
        } else if (mime.startsWith("video/")) {
            media = `<video src="${this.escape(preview.url)}" controls autoplay></video>`;
        } else if (mime.startsWith("audio/")) {
            media = `<audio src="${this.escape(preview.url)}" controls autoplay></audio>`;
        }
        body.innerHTML = `
            <div class="dev_media_toolbar">
                <button type="button" data-action="external">Open external</button>
                <button type="button" data-action="path">Copy path</button>
            </div>
            <div class="dev_media_stage">${media}</div>`;
        body.querySelector("[data-action='external']").addEventListener("click", () => edex.devfs.openExternal(file));
        body.querySelector("[data-action='path']").addEventListener("click", () => edex.devfs.copyPath(file, "windows"));
    }
}

class DevPluginHost {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.plugins = [];
        this.commands = {};
        this.panels = {};
        this.activeModules = {};
        this.cleanups = {};
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    async refresh() {
        this.plugins = await edex.plugins.list().catch(() => []);
        return this.plugins;
    }

    hasPermission(plugin, permission) {
        return plugin && Array.isArray(plugin.permissions) && plugin.permissions.includes(permission);
    }

    contributionSummary(plugin) {
        const contributes = plugin && plugin.contributes || {};
        return Object.keys(contributes).filter(key => {
            return Array.isArray(contributes[key]) ? contributes[key].length : !!contributes[key];
        }).join(", ") || "none";
    }

    addCleanup(plugin, cleanup) {
        if (!plugin || !plugin.id || typeof cleanup !== "function") return null;
        let called = false;
        const wrapped = async () => {
            if (called) return;
            called = true;
            await cleanup();
        };
        const previous = this.cleanups[plugin.id];
        this.cleanups[plugin.id] = async () => {
            if (typeof previous === "function") await previous();
            await wrapped();
        };
        return wrapped;
    }

    api(plugin) {
        return {
            registerCommand: (id, label, handler) => {
                if (!this.hasPermission(plugin, "commands")) throw new Error("Plugin permission required: commands");
                this.commands[`${plugin.id}:${id}`] = {plugin: plugin.id, label, handler};
            },
            registerPanel: (id, label, render) => {
                if (!this.hasPermission(plugin, "panels")) throw new Error("Plugin permission required: panels");
                this.panels[`${plugin.id}:${id}`] = {plugin: plugin.id, label, render};
            },
            openWindow: options => {
                if (!this.hasPermission(plugin, "window")) throw new Error("Plugin permission required: window");
                const originalRender = options && options.render;
                const originalClose = options && options.onClose;
                let renderCleanup = null;
                return this.windowManager.open(Object.assign({}, options || {}, {
                    render: (body, record) => {
                        const cleanup = typeof originalRender === "function" ? originalRender(body, record) : null;
                        renderCleanup = this.addCleanup(plugin, cleanup);
                    },
                    onClose: record => {
                        if (typeof renderCleanup === "function") renderCleanup().catch(() => {});
                        if (typeof originalClose === "function") return originalClose(record);
                    }
                }));
            },
            setInterval: (handler, ms) => {
                const timer = setInterval(handler, ms);
                return this.addCleanup(plugin, () => clearInterval(timer));
            },
            notify: message => {
                if (!this.hasPermission(plugin, "status") && !this.hasPermission(plugin, "window")) throw new Error("Plugin permission required: status");
                return new Modal({type: "info", title: plugin.name, message: this.escape(message)});
            }
        };
    }

    clearContributions(pluginId) {
        Object.keys(this.commands).forEach(id => {
            if (this.commands[id] && this.commands[id].plugin === pluginId) delete this.commands[id];
        });
        Object.keys(this.panels).forEach(id => {
            if (this.panels[id] && this.panels[id].plugin === pluginId) delete this.panels[id];
        });
    }

    async deactivate(plugin, persist = true) {
        if (!plugin || !plugin.id) return false;
        const cleanup = this.cleanups[plugin.id];
        delete this.cleanups[plugin.id];
        try {
            if (typeof cleanup === "function") await cleanup();
        } catch(error) {
            plugin.error = error.message || String(error);
        }
        const mod = this.activeModules[plugin.id];
        delete this.activeModules[plugin.id];
        try {
            if (mod && typeof mod.deactivate === "function") await mod.deactivate(this.api(plugin));
        } catch(error) {
            plugin.error = error.message || String(error);
        }
        this.clearContributions(plugin.id);
        if (persist) await edex.plugins.setState(plugin.id, false, plugin.error || "");
        return true;
    }

    async activate(plugin) {
        if (!plugin.enabled) return false;
        try {
            await this.deactivate(plugin, false);
            const mod = require(plugin.entry);
            this.activeModules[plugin.id] = mod;
            if (mod && typeof mod.activate === "function") {
                const cleanup = await mod.activate(this.api(plugin));
                if (typeof cleanup === "function") this.cleanups[plugin.id] = cleanup;
            }
            plugin.error = "";
            await edex.plugins.setState(plugin.id, true, "");
            return true;
        } catch(error) {
            plugin.enabled = false;
            plugin.error = error.message || String(error);
            await edex.plugins.setState(plugin.id, false, plugin.error);
            new Modal({type: "warning", title: "Plugin", message: `${plugin.name}: ${error.message}`});
            this.renderOpenManager();
            return false;
        }
    }

    async openManager() {
        await this.refresh();
        this.windowManager.open({
            id: "plugins",
            title: "Plugin Manager",
            subtitle: "local manifests",
            className: "dev_plugins_window",
            rect: {left: 16, top: 10, width: 58, height: 56},
            render: body => this.renderManager(body)
        });
    }

    renderOpenManager() {
        const record = this.windowManager.windows["plugins"];
        if (record) this.renderManager(record.body);
    }

    renderManager(body) {
        const rows = this.plugins.length ? this.plugins.map(plugin => `
            <tr class="${plugin.error ? "plugin-error" : ""}">
                <td>${this.escape(plugin.enabled ? "ON" : "OFF")}</td>
                <td>${this.escape(plugin.name)}</td>
                <td>${this.escape(plugin.version)}</td>
                <td>${this.escape(plugin.trustState || "local")}</td>
                <td title="${this.escape((plugin.permissions || []).join(", "))}">${this.escape((plugin.permissions || []).join(", ") || "none")}</td>
                <td title="${this.escape(this.contributionSummary(plugin))}">${this.escape(plugin.health || (plugin.error ? "error" : "ready"))}</td>
                <td title="${this.escape(plugin.error || plugin.root)}">${this.escape(plugin.error || plugin.root)}</td>
                <td>
                    <button type="button" data-plugin="${this.escape(plugin.id)}" ${plugin.enabled ? "" : "disabled"}>Activate</button>
                    <button type="button" data-plugin-toggle="${this.escape(plugin.id)}">${plugin.enabled ? "Disable" : "Enable"}</button>
                </td>
            </tr>`).join("") : `<tr><td colspan="8">No plugins found.</td></tr>`;
        body.innerHTML = `
            <div class="dev_plugins">
                <div class="dev_plugins_toolbar">
                    <button type="button" data-plugin-recovery="third-party">Disable Third-Party</button>
                </div>
                <table>
                    <tr><th>State</th><th>Name</th><th>Version</th><th>Trust</th><th>Permissions</th><th>Health</th><th>Root</th><th>Action</th></tr>
                    ${rows}
                </table>
            </div>`;
        const recovery = body.querySelector("[data-plugin-recovery]");
        if (recovery) {
            recovery.addEventListener("click", async () => {
                await Promise.all(this.plugins.filter(plugin => plugin.trustState !== "bundled").map(plugin => this.deactivate(plugin, false)));
                const result = await edex.plugins.disableThirdParty();
                await this.refresh();
                this.renderManager(body);
                new Modal({type: "info", title: "Plugin Recovery", message: `${(result && result.disabled || []).length} third-party plugin(s) disabled.`});
            });
        }
        body.querySelectorAll("button[data-plugin]").forEach(button => {
            button.addEventListener("click", () => {
                const plugin = this.plugins.find(item => item.id === button.dataset.plugin);
                if (plugin) this.activate(plugin);
            });
        });
        body.querySelectorAll("button[data-plugin-toggle]").forEach(button => {
            button.addEventListener("click", async () => {
                const plugin = this.plugins.find(item => item.id === button.dataset.pluginToggle);
                if (!plugin) return;
                plugin.enabled = !plugin.enabled;
                if (plugin.enabled) plugin.error = "";
                if (!plugin.enabled) {
                    await this.deactivate(plugin, true);
                } else {
                    await edex.plugins.setState(plugin.id, true, plugin.error || "");
                }
                await this.refresh();
                this.renderManager(body);
            });
        });
    }
}

class DevNetworkLens {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.events = [];
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    ingestDiagnostic(event, terminal) {
        const refs = event && event.refs ? event.refs : [];
        refs.forEach(ref => {
            if (ref.type === "ip") this.addEndpoint(ref.ip, {source: event.type, terminal});
            if (ref.type === "url") {
                try {
                    const parsed = new URL(ref.url);
                    this.addEndpoint(parsed.hostname, {source: event.type, terminal, url: ref.url});
                } catch(e) {}
            }
        });
    }

    async addEndpoint(endpoint, meta = {}) {
        const resolved = await edex.networkLens.resolveEndpoint(endpoint).catch(() => ({input: endpoint, ip: endpoint}));
        const entry = {
            time: Date.now(),
            endpoint,
            ip: resolved.ip,
            hostname: resolved.hostname || meta.url || "",
            source: meta.source || "terminal"
        };
        this.events.unshift(entry);
        this.events = this.events.slice(0, 50);
        if (window.mods && window.mods.globe && typeof window.mods.globe.addTemporaryConnectedMarker === "function" && entry.ip) {
            window.mods.globe.addTemporaryConnectedMarker(entry.ip);
        }
        this.renderOpenPanel();
        return entry;
    }

    openPanel() {
        this.windowManager.open({
            id: "network-lens",
            title: "Network Lens",
            subtitle: "terminal endpoint events",
            className: "dev_network_window",
            rect: {left: 18, top: 12, width: 56, height: 54},
            render: body => {
                body.innerHTML = `
                    <div class="dev_network_tools">
                        <input type="text" placeholder="IP or domain">
                        <button type="button">Inspect</button>
                    </div>
                    <div class="dev_network_events"></div>`;
                body.querySelector("button").addEventListener("click", () => {
                    const value = body.querySelector("input").value.trim();
                    if (value) this.addEndpoint(value, {source: "manual"});
                });
                this.renderOpenPanel();
            }
        });
    }

    renderOpenPanel() {
        const record = this.windowManager.windows["network-lens"];
        if (!record) return;
        const target = record.body.querySelector(".dev_network_events");
        if (!target) return;
        target.innerHTML = this.events.length ? this.events.map(event => `
            <div class="dev_network_event">
                <strong>${this.escape(event.ip || event.endpoint)}</strong>
                <span>${this.escape(event.hostname || event.endpoint)}</span>
                <em>${this.escape(event.source)} / ${this.escape(new Date(event.time).toLocaleTimeString())}</em>
            </div>`).join("") : `<div class="devfs_empty">No endpoint events yet.</div>`;
    }
}

class DevThemeLayoutTools {
    constructor(windowManager) {
        this.windowManager = windowManager;
    }

    openThemeEditor() {
        this.windowManager.open({
            id: "theme-editor",
            title: "Theme Editor",
            subtitle: window.settings.theme || "current",
            className: "dev_theme_window",
            rect: {left: 20, top: 10, width: 48, height: 48},
            render: body => {
                body.innerHTML = `
                    <div class="dev_theme_grid">
                        <label>R <input id="dev_theme_r" type="number" value="${window.theme.r}"></label>
                        <label>G <input id="dev_theme_g" type="number" value="${window.theme.g}"></label>
                        <label>B <input id="dev_theme_b" type="number" value="${window.theme.b}"></label>
                        <label>Background image/video <input id="dev_theme_bg" type="text" value="${window.settings.backgroundMedia || ""}"></label>
                        <button type="button" data-action="apply">Apply</button>
                    </div>`;
                body.querySelector("[data-action='apply']").addEventListener("click", () => {
                    const r = Number(body.querySelector("#dev_theme_r").value) || window.theme.r;
                    const g = Number(body.querySelector("#dev_theme_g").value) || window.theme.g;
                    const b = Number(body.querySelector("#dev_theme_b").value) || window.theme.b;
                    document.documentElement.style.setProperty("--color_r", r);
                    document.documentElement.style.setProperty("--color_g", g);
                    document.documentElement.style.setProperty("--color_b", b);
                    window.theme.r = r;
                    window.theme.g = g;
                    window.theme.b = b;
                    window.settings.backgroundMedia = body.querySelector("#dev_theme_bg").value.trim();
                });
            }
        });
    }

    openLayoutEditor() {
        this.windowManager.open({
            id: "layout-editor",
            title: "Layout Editor",
            subtitle: "windows and modules",
            className: "dev_layout_window",
            rect: {left: 21, top: 11, width: 50, height: 50},
            render: body => {
                const windows = window.settings.windowManager && window.settings.windowManager.windows || {};
                body.innerHTML = `
                    <div class="dev_layout_tools">
                        <button type="button" data-action="reset">Reset saved windows</button>
                        <pre>${window._escapeHtml(JSON.stringify(windows, null, 2))}</pre>
                    </div>`;
                body.querySelector("[data-action='reset']").addEventListener("click", () => {
                    if (!window.settings.windowManager) window.settings.windowManager = {};
                    window.settings.windowManager.windows = {};
                    body.querySelector("pre").textContent = "{}";
                });
            }
        });
    }
}

class ExplorerStore {
    constructor(browser) {
        this.browser = browser;
        this.path = browser.path;
        this.settings = this.normalizeSettings();
        this.dirpath = "";
        this.items = [];
        this.git = {isRepo: false};
        this.selected = null;
        this.selectedIndex = -1;
        this.selectedPaths = new Set();
        this.selectionAnchor = null;
        this.search = "";
        this.filterType = "all";
        this.view = this.validView(this.settings.defaultView || "list");
        this.hideDotfiles = window.settings.hideDotfiles === true;
        this.showPreview = this.settings.showPreview !== false;
        this.showExtensions = this.settings.showExtensions !== false;
        this.surfaceMode = this.validSurfaceMode(this.settings.mode || "dock");
        this.expanded = this.surfaceMode === "cockpit";
        this.windowRect = this.normalizeWindowRect(this.settings.windowRect);
        this.history = [];
        this.historyIndex = -1;
        const savedTabs = Array.isArray(this.settings.tabs) && this.settings.tabs.length
            ? this.settings.tabs.filter(tab => tab && typeof tab.path === "string").slice(0, 8)
            : [{id: "tab-1", path: ""}];
        this.tabs = savedTabs.map((tab, index) => ({
            id: tab.id || `tab-${index + 1}`,
            path: tab.path || ""
        }));
        if (!this.tabs.length) this.tabs = [{id: "tab-1", path: ""}];
        this.activeTabId = this.tabs.some(tab => tab.id === this.settings.activeTabId)
            ? this.settings.activeTabId
            : this.tabs[0].id;
        this.initialPath = (this.tabs.find(tab => tab.id === this.activeTabId) || this.tabs[0]).path || "";
        this.drives = [];
        this.secondaryDir = "";
        this.secondaryItems = [];
        this.activePane = "primary";
        this.columnChildren = [];
        this.columnParent = null;
        this.hashes = {};
        this.diffs = {};
        this.operations = [];
        this.operationRunning = false;
        this.renderProgress = {
            active: false,
            rendered: 0,
            total: 0
        };
        this.status = "Waiting for directory...";
    }

    normalizeSettings() {
        const defaults = {
            mode: "dock",
            defaultView: "list",
            showPreview: true,
            showGitStatus: true,
            showExtensions: true,
            confirmTrash: true,
            enableAiActions: false,
            pinned: [],
            recent: [],
            recentLimit: 12,
            tabs: [],
            activeTabId: "tab-1",
            windowRect: {
                left: 14,
                top: 8,
                width: 72,
                height: 70
            }
        };
        if (!window.settings.devExplorer) window.settings.devExplorer = {};
        Object.keys(defaults).forEach(key => {
            if (typeof window.settings.devExplorer[key] === "undefined") {
                window.settings.devExplorer[key] = defaults[key];
            }
        });
        return window.settings.devExplorer;
    }

    validView(view) {
        return ["list", "grid", "columns", "dualPane"].includes(view) ? view : "list";
    }

    validSurfaceMode(mode) {
        return ["dock", "window", "cockpit"].includes(mode) ? mode : "dock";
    }

    normalizeWindowRect(rect) {
        const source = rect && typeof rect === "object" ? rect : {};
        return {
            left: this.clampNumber(source.left, 1, 70, 14),
            top: this.clampNumber(source.top, 2, 58, 8),
            width: this.clampNumber(source.width, 52, 96, 72),
            height: this.clampNumber(source.height, 42, 90, 70)
        };
    }

    clampNumber(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.max(min, Math.min(max, number));
    }

    persist(key, value) {
        if (!window.settings.devExplorer) window.settings.devExplorer = {};
        window.settings.devExplorer[key] = value;
        this.settings[key] = value;
    }

    persistTabs() {
        this.persist("tabs", this.tabs.map(tab => ({
            id: tab.id,
            path: tab.path || ""
        })).slice(0, 8));
        this.persist("activeTabId", this.activeTabId);
    }

    setDirectory(data, options = {}) {
        const previousPath = this.selected && this.selected.path;
        this.dirpath = data.cwd;
        this.items = data.items || [];
        this.git = data.git || {isRepo: false};
        this.selected = previousPath ? this.items.find(item => item.path === previousPath) || null : null;
        this.selectedIndex = this.selected ? this.items.findIndex(item => item.path === this.selected.path) : -1;
        const itemPaths = new Set(this.items.map(item => item.path));
        this.selectedPaths = new Set(Array.from(this.selectedPaths || []).filter(item => itemPaths.has(item)));
        if (this.selected && !this.selectedPaths.size) this.selectedPaths.add(this.selected.path);
        this.selectionAnchor = this.selected ? this.selected.path : null;
        this.columnChildren = [];
        this.columnParent = null;

        const tab = this.tabs.find(item => item.id === this.activeTabId);
        if (tab) tab.path = this.dirpath;
        this.persistTabs();

        if (options.history !== false) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            if (this.history[this.history.length - 1] !== this.dirpath) {
                this.history.push(this.dirpath);
                this.historyIndex = this.history.length - 1;
            }
        }
    }

    displayName(item) {
        if (!item || this.showExtensions || item.type !== "file") return item ? item.name : "";
        const ext = this.path.extname(item.name);
        return ext ? item.name.slice(0, -ext.length) : item.name;
    }

    filteredItems(source) {
        let items = (source || this.items).slice();
        if (this.hideDotfiles) items = items.filter(item => !item.hidden);
        if (this.filterType === "dir") items = items.filter(item => item.type === "dir" || item.type === "symlink");
        if (this.filterType === "file") items = items.filter(item => item.type === "file");
        if (this.filterType === "changed") items = items.filter(item => item.git);
        if (this.search) {
            const needle = this.search.toLowerCase();
            const allowed = new Set(items.map(item => item.path));
            items = this.browser.fuse && source === undefined
                ? this.browser.fuse.search(this.search).map(result => result.item).filter(item => allowed.has(item.path))
                : items.filter(item => item.name.toLowerCase().includes(needle) || item.path.toLowerCase().includes(needle));
        }
        return items;
    }

    isSelected(item) {
        return !!(item && this.selectedPaths && this.selectedPaths.has(item.path));
    }

    selectItem(item, list, options = {}) {
        this.selected = item || null;
        const items = list || this.filteredItems();
        this.selectedIndex = item ? items.findIndex(candidate => candidate.path === item.path) : -1;

        if (!item) {
            this.selectedPaths.clear();
            this.selectionAnchor = null;
            return;
        }

        if (options.range && this.selectionAnchor) {
            const anchorIndex = items.findIndex(candidate => candidate.path === this.selectionAnchor);
            if (anchorIndex >= 0 && this.selectedIndex >= 0) {
                const start = Math.min(anchorIndex, this.selectedIndex);
                const end = Math.max(anchorIndex, this.selectedIndex);
                this.selectedPaths = new Set(items.slice(start, end + 1).map(candidate => candidate.path));
                return;
            }
        }

        if (options.toggle) {
            if (this.selectedPaths.has(item.path)) {
                this.selectedPaths.delete(item.path);
                if (!this.selectedPaths.size) {
                    this.selected = null;
                    this.selectedIndex = -1;
                    this.selectionAnchor = null;
                    return;
                }
                const nextPath = Array.from(this.selectedPaths)[this.selectedPaths.size - 1];
                this.selected = items.find(candidate => candidate.path === nextPath) || item;
                this.selectedIndex = items.findIndex(candidate => candidate.path === this.selected.path);
            } else {
                this.selectedPaths.add(item.path);
                this.selected = item;
                this.selectedIndex = items.findIndex(candidate => candidate.path === item.path);
                this.selectionAnchor = this.selectionAnchor || item.path;
            }
            return;
        }

        this.selectedPaths = new Set([item.path]);
        this.selectionAnchor = item.path;
    }

    selectAll(source) {
        const items = source || this.filteredItems();
        this.selectedPaths = new Set(items.map(item => item.path));
        this.selected = items[0] || null;
        this.selectedIndex = this.selected ? 0 : -1;
        this.selectionAnchor = this.selected ? this.selected.path : null;
        return this.selected;
    }

    selectedItems(source) {
        const items = source || this.items;
        if (!this.selectedPaths || !this.selectedPaths.size) return this.selected ? [this.selected] : [];
        return items.filter(item => this.selectedPaths.has(item.path));
    }

    selectOffset(offset) {
        const items = this.filteredItems();
        if (!items.length) return null;
        const current = this.selectedIndex >= 0 ? this.selectedIndex : 0;
        const next = Math.max(0, Math.min(items.length - 1, current + offset));
        this.selectItem(items[next], items);
        return this.selected;
    }

    enqueueOperation(label, task) {
        const op = {
            id: `op-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            label,
            state: "pending",
            error: null,
            task
        };
        this.operations.unshift(op);
        this.operations = this.operations.slice(0, 6);
        this.browser.renderer.renderOperations();
        this.processQueue();
        return op;
    }

    async processQueue() {
        if (this.operationRunning) return;
        const op = this.operations.slice().reverse().find(item => item.state === "pending");
        if (!op) return;

        this.operationRunning = true;
        op.state = "running";
        this.browser.renderer.renderOperations();
        try {
            await op.task();
            op.state = "done";
        } catch(error) {
            op.state = "failed";
            op.error = error.message || String(error);
        } finally {
            this.operationRunning = false;
            this.browser.renderer.renderOperations();
            this.processQueue();
        }
    }
}

class ExplorerPreview {
    constructor(browser) {
        this.browser = browser;
        this.token = 0;
    }

    escape(value) {
        return this.browser.escape(value);
    }

    renderPreview(preview) {
        if (!preview) return `<div class="devfs_empty">Preview unavailable</div>`;
        switch(preview.kind) {
            case "image":
                return `<img src="${this.escape(preview.url)}" alt="">`;
            case "pdf":
                return `<iframe src="${this.escape(preview.url)}"></iframe>`;
            case "json":
                try {
                    return `<pre>${this.escape(JSON.stringify(JSON.parse(preview.content), null, 2))}${preview.truncated ? "\n\n[truncated]" : ""}</pre>`;
                } catch(e) {
                    return `<pre>${this.escape(preview.content)}${preview.truncated ? "\n\n[truncated]" : ""}</pre>`;
                }
            case "markdown":
            case "text":
                return `<pre>${this.escape(preview.content)}${preview.truncated ? "\n\n[truncated]" : ""}</pre>`;
            case "binary":
                return `<pre class="devfs_hex">${this.escape(preview.hex || "Binary preview unavailable")}${preview.truncated ? "\n\n[truncated]" : ""}</pre>`;
            case "directory":
                return `<div class="devfs_empty">Directory selected</div>`;
            case "error":
                return `<div class="devfs_empty">${this.escape(preview.content || "Preview failed")}</div>`;
            default:
                return `<div class="devfs_empty">${this.escape(preview.content || preview.kind || "Preview unavailable")}</div>`;
        }
    }

    async loadSelected() {
        const item = this.browser.store.selected;
        if (!item || !this.browser.store.showPreview || item.type !== "file") return;
        if (this.browser.isRenderingItems()) {
            this.browser.deferPreview(item.path);
            return false;
        }

        const token = ++this.token;
        this.browser.renderer.setPreview(`<div class="devfs_empty">Loading preview...</div>`);
        const preview = await edex.devfs.preview(item.path, 60000).catch(error => ({kind: "error", content: error.message}));
        if (token !== this.token || !this.browser.store.selected || this.browser.store.selected.path !== item.path) return;
        this.browser.renderer.setPreview(this.renderPreview(preview));
    }

    async quickPreview() {
        const item = this.browser.store.selected;
        if (!item) return;

        const modalId = "devfs_quick_preview";
        new Modal({
            type: "custom",
            title: item.name,
            html: `<div id="${modalId}" class="dev_modal devfs_quick_preview"><div class="devfs_empty">Loading preview...</div></div>`
        }, () => {
            if (window.keyboard) window.keyboard.attach();
        });

        const target = document.getElementById(modalId);
        if (!target) return;
        const preview = await edex.devfs.preview(item.path, 120000).catch(error => ({kind: "error", content: error.message}));
        target.innerHTML = this.renderPreview(preview);
    }
}

class ExplorerCommands {
    constructor(browser) {
        this.browser = browser;
        this.commandButtons = [
            {command: "back", label: "Back", icon: "back"},
            {command: "forward", label: "Forward", icon: "forward"},
            {command: "up", label: "Up", icon: "up"},
            {command: "refresh", label: "Refresh", icon: "refresh"},
            {command: "new-folder", label: "Folder", icon: "folderPlus"},
            {command: "new-file", label: "File", icon: "filePlus"},
            {command: "rename", label: "Rename", icon: "rename"},
            {command: "duplicate", label: "Duplicate", icon: "duplicate"},
            {command: "copy", label: "Copy", icon: "copy"},
            {command: "move", label: "Move", icon: "move"},
            {command: "trash", label: "Trash", icon: "trash"},
            {command: "open-external", label: "Open", icon: "open"},
            {command: "terminal-here", label: "Terminal", icon: "terminal"},
            {command: "copy-path", label: "Path", icon: "path"},
            {command: "copy-wsl", label: "WSL", icon: "wsl"},
            {command: "edit", label: "Edit", icon: "edit"},
            {command: "media", label: "Media", icon: "media"},
            {command: "pin-folder", label: "Pin", icon: "pin"},
            {command: "plugins", label: "Plugins", icon: "plugins"},
            {command: "settings", label: "Settings", icon: "settings"},
            {command: "network-lens", label: "Net", icon: "network"},
            {command: "diagnostics", label: "Diag", icon: "diagnostics"},
            {command: "theme-editor", label: "Theme", icon: "theme"},
            {command: "layout-editor", label: "Layout", icon: "layout"},
            {command: "toggle-hidden", label: "Hidden", icon: "hidden"},
            {command: "toggle-extensions", label: "Ext", icon: "extensions"},
            {command: "toggle-preview", label: "Preview", icon: "preview"}
        ];
        this.bindKeyboard();
    }

    bindKeyboard() {
        document.addEventListener("keydown", event => {
            if (event.ctrlKey && event.shiftKey && event.code === "KeyE") {
                event.preventDefault();
                this.browser.cycleSurfaceMode();
                return;
            }

            if (event.ctrlKey && !event.shiftKey && event.code === "KeyE") {
                event.preventDefault();
                this.browser.toggleExpanded();
                return;
            }

            const target = event.target;
            const inExplorer = this.browser.container.contains(target);
            if (!inExplorer) return;

            const isInput = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
            if (isInput && !(event.ctrlKey && ["KeyL", "KeyF"].includes(event.code))) return;

            if (event.ctrlKey && event.code === "KeyL") {
                event.preventDefault();
                this.browser.focusOmnibar();
                return;
            }
            if (event.ctrlKey && event.code === "KeyF" && !event.shiftKey) {
                event.preventDefault();
                this.browser.focusFilter();
                return;
            }
            if (event.ctrlKey && event.shiftKey && event.code === "KeyF") {
                event.preventDefault();
                window.activeFuzzyFinder = new FuzzyFinder();
                return;
            }
            if (event.ctrlKey && !event.shiftKey && event.code === "KeyA") {
                event.preventDefault();
                this.browser.selectAll();
                return;
            }
            if (event.ctrlKey && ["Digit1", "Digit2", "Digit3", "Digit4"].includes(event.code)) {
                event.preventDefault();
                this.browser.setViewMode(["list", "grid", "columns", "dualPane"][Number(event.code.slice(-1)) - 1]);
                return;
            }

            switch(event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    this.browser.selectOffset(1);
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    this.browser.selectOffset(-1);
                    break;
                case "ArrowRight":
                    if (this.browser.store.selected && this.browser.isDirectoryLike(this.browser.store.selected)) {
                        event.preventDefault();
                        this.browser.openItem(this.browser.store.selected);
                    }
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    this.browser.goUp();
                    break;
                case "Enter":
                    if (this.browser.store.selected) {
                        event.preventDefault();
                        this.browser.openItem(this.browser.store.selected);
                    }
                    break;
                case "Backspace":
                    event.preventDefault();
                    this.browser.goUp();
                    break;
                case " ":
                    event.preventDefault();
                    this.browser.preview.quickPreview();
                    break;
                case "F2":
                    event.preventDefault();
                    this.browser.renameSelected();
                    break;
                case "Delete":
                    event.preventDefault();
                    this.browser.trashSelected();
                    break;
                default:
                    break;
            }
        }, true);
    }

    async run(command) {
        switch(command) {
            case "back": return this.browser.goBack();
            case "forward": return this.browser.goForward();
            case "up": return this.browser.goUp();
            case "refresh": return this.browser.refresh();
            case "new-file": return this.browser.createFile();
            case "new-folder": return this.browser.createFolder();
            case "rename": return this.browser.renameSelected();
            case "duplicate": return this.browser.duplicateSelected();
            case "copy": return this.browser.copySelected();
            case "move": return this.browser.moveSelected();
            case "trash": return this.browser.trashSelected();
            case "open-selected": return this.browser.openSelected();
            case "open-external": return this.browser.openExternal();
            case "terminal-here": return this.browser.openTerminalHere();
            case "copy-path": return this.browser.copySelectedPath("windows");
            case "copy-wsl": return this.browser.copySelectedPath("wsl");
            case "edit": return this.browser.editSelected();
            case "media": return this.browser.openSelectedMedia();
            case "pin-folder": return this.browser.pinCurrentFolder();
            case "plugins": return window.openDevPluginManager();
            case "settings": return window.openSettings && window.openSettings();
            case "network-lens": return window.openDevNetworkLens();
            case "diagnostics": return window.openDevDiagnostics();
            case "theme-editor": return window.openDevThemeEditor();
            case "layout-editor": return window.openDevLayoutEditor();
            case "toggle-hidden": return this.browser.toggleHidedotfiles();
            case "toggle-extensions": return this.browser.toggleExtensions();
            case "toggle-preview": return this.browser.togglePreview();
            case "surface-dock": return this.browser.setSurfaceMode("dock");
            case "surface-window": return this.browser.setSurfaceMode("window");
            case "surface-cockpit": return this.browser.setSurfaceMode("cockpit");
            case "hash": return this.browser.showHash();
            case "diff": return this.browser.showDiff();
            case "context": return window.openContextPackManager();
            default: return false;
        }
    }

    async handleOmnibar(raw) {
        const value = String(raw || "").trim();
        if (!value) return;
        if (value.startsWith(">")) return this.runCommandLine(value.slice(1).trim());
        return this.browser.openPathOrSearch(value);
    }

    runCommandLine(line) {
        const command = line.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
        if (["back"].includes(command)) return this.run("back");
        if (["forward", "fwd"].includes(command)) return this.run("forward");
        if (["up", "parent"].includes(command)) return this.run("up");
        if (["refresh", "reload"].includes(command)) return this.run("refresh");
        if (["new file", "touch"].includes(command)) return this.run("new-file");
        if (["new folder", "mkdir", "new dir"].includes(command)) return this.run("new-folder");
        if (["rename"].includes(command)) return this.run("rename");
        if (["duplicate"].includes(command)) return this.run("duplicate");
        if (["copy"].includes(command)) return this.run("copy");
        if (["move"].includes(command)) return this.run("move");
        if (["trash", "delete"].includes(command)) return this.run("trash");
        if (["open", "open external"].includes(command)) return this.run("open-external");
        if (["open terminal", "terminal", "terminal here"].includes(command)) return this.run("terminal-here");
        if (["copy path", "copy windows path"].includes(command)) return this.run("copy-path");
        if (["copy wsl", "copy wsl path"].includes(command)) return this.run("copy-wsl");
        if (["edit", "open editor", "editor"].includes(command)) return this.run("edit");
        if (["media", "open media"].includes(command)) return this.run("media");
        if (["plugins", "plugin manager"].includes(command)) return this.run("plugins");
        if (["settings", "config", "configuration", "preferences"].includes(command)) return this.run("settings");
        if (["network lens", "net lens"].includes(command)) return this.run("network-lens");
        if (["diagnostics", "diagnostic", "health", "local diagnostics", "system diagnostics"].includes(command)) return this.run("diagnostics");
        if (["theme", "theme editor"].includes(command)) return this.run("theme-editor");
        if (["layout", "layout editor"].includes(command)) return this.run("layout-editor");
        if (["toggle hidden", "hidden"].includes(command)) return this.run("toggle-hidden");
        if (["toggle extensions", "extensions"].includes(command)) return this.run("toggle-extensions");
        if (["toggle preview", "preview"].includes(command)) return this.run("toggle-preview");
        if (["dock", "dock mode"].includes(command)) return this.browser.setSurfaceMode("dock");
        if (["window", "window mode", "janela", "modo janela"].includes(command)) return this.browser.setSurfaceMode("window");
        if (["cockpit", "maximize", "maximise", "expanded", "expand"].includes(command)) return this.browser.setSurfaceMode("cockpit");
        if (["list", "list view"].includes(command)) return this.browser.setViewMode("list");
        if (["grid", "grid view"].includes(command)) return this.browser.setViewMode("grid");
        if (["columns", "column view"].includes(command)) return this.browser.setViewMode("columns");
        if (["dual pane", "dualpane"].includes(command)) return this.browser.setViewMode("dualPane");
        if (["context"].includes(command)) return this.run("context");
        this.browser.setStatus(`Unknown command: ${line}`);
        return false;
    }
}

class ExplorerRenderer {
    constructor(browser) {
        this.browser = browser;
        this.container = browser.container;
        this.renderToken = 0;
        this.currentItems = [];
        this.lastClick = null;
        this.ignoreNativeDoubleClickUntil = 0;
        this.renderedEntries = 0;
    }

    escape(value) {
        return this.browser.escape(value);
    }

    renderIconButton(attrs, icon, label, extraClass = "") {
        return `<button type="button" class="devfs_icon_button ${extraClass}" ${attrs} title="${this.escape(label)}">${this.browser.buttonMarkup(icon, label)}</button>`;
    }

    renderShell() {
        this.container.innerHTML = `
            <h3 class="title"><p>FILES</p><p id="fs_disp_title_dir"></p></h3>
            <div class="devfs_window_bar">
                <div class="devfs_window_grip"></div>
                <div class="devfs_window_title">
                    <strong>FILE OPERATIONS COCKPIT</strong>
                    <span id="devfs_window_path"></span>
                </div>
                <div class="devfs_window_controls">
                    ${this.renderIconButton('data-surface-mode="dock"', "minimize", "Minimize", "compact")}
                    ${this.renderIconButton('data-surface-mode="cockpit"', "maximize", "Maximize", "compact")}
                    ${this.renderIconButton('data-surface-mode="dock"', "close", "Close to dock", "compact")}
                </div>
            </div>
            <div class="devfs_cockpit">
                <div class="devfs_topbar">
                    ${this.renderIconButton('id="devfs_window"', "window", "Window", "devfs_surface_button")}
                    ${this.renderIconButton('id="devfs_expand"', "maximize", "Expand", "devfs_surface_button")}
                    <div id="devfs_breadcrumbs"></div>
                    <input id="devfs_omnibar" type="search" spellcheck="false" placeholder="path / search / >command">
                </div>
                <div id="devfs_tabs"></div>
                <div class="devfs_layout">
                    <aside id="devfs_nav"></aside>
                    <main class="devfs_main">
                        <div class="devfs_filterbar">
                            <input id="devfs_filter" type="search" spellcheck="false" placeholder="filter">
                            <select id="devfs_type_filter">
                                <option value="all">all</option>
                                <option value="dir">dirs</option>
                                <option value="file">files</option>
                                <option value="changed">changed</option>
                            </select>
                            <div id="devfs_view_modes">
                                ${this.renderIconButton('data-view="list"', "list", "List")}
                                ${this.renderIconButton('data-view="grid"', "grid", "Grid")}
                                ${this.renderIconButton('data-view="columns"', "columns", "Columns")}
                                ${this.renderIconButton('data-view="dualPane"', "dualPane", "Dual")}
                            </div>
                        </div>
                        <div id="devfs_headers"></div>
                        <div id="fs_disp_container" tabindex="0"></div>
                    </main>
                    <aside id="devfs_inspector"></aside>
                </div>
                <div id="fs_space_bar"><h1>EXIT DISPLAY</h1><h3 id="devfs_status">Waiting for directory...</h3><progress value="100" max="100"></progress><div id="devfs_ops"></div></div>
            </div>
            <div class="devfs_resize_edge north" data-devfs-resize-edge="n" title="Resize"></div>
            <div class="devfs_resize_edge east" data-devfs-resize-edge="e" title="Resize"></div>
            <div class="devfs_resize_edge south" data-devfs-resize-edge="s" title="Resize"></div>
            <div class="devfs_resize_edge west" data-devfs-resize-edge="w" title="Resize"></div>
            <div class="devfs_resize_corner nw" data-devfs-resize-edge="nw" title="Resize"></div>
            <div class="devfs_resize_corner ne" data-devfs-resize-edge="ne" title="Resize"></div>
            <div class="devfs_resize_corner sw" data-devfs-resize-edge="sw" title="Resize"></div>
            <div class="devfs_resize_handle" data-devfs-resize-edge="se" title="Resize"></div>`;

        this.filesContainer = this.container.querySelector("#fs_disp_container");
        this.inspector = this.container.querySelector("#devfs_inspector");
        this.status = this.container.querySelector("#devfs_status");
        this.progress = this.container.querySelector("#fs_space_bar progress");
        this.bindShell();
    }

    bindShell() {
        this.container.querySelector("#devfs_expand").addEventListener("click", () => this.browser.toggleExpanded());
        this.container.querySelector("#devfs_window").addEventListener("click", () => {
            this.browser.setSurfaceMode(this.browser.store.surfaceMode === "window" ? "dock" : "window");
        });
        this.container.querySelectorAll(".devfs_window_controls button[data-surface-mode]").forEach(button => {
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.browser.setSurfaceMode(button.dataset.surfaceMode);
            });
        });
        this.bindWindowFrame();
        this.container.querySelector("#devfs_omnibar").addEventListener("input", event => {
            const value = event.target.value.trim();
            if (value && !value.startsWith(">") && !this.browser.looksLikePath(value)) {
                this.browser.store.search = value;
                this.browser.render();
            }
        });
        this.container.querySelector("#devfs_omnibar").addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.browser.commands.handleOmnibar(event.target.value);
            }
        });
        this.container.querySelector("#devfs_filter").addEventListener("input", event => {
            this.browser.store.search = event.target.value.trim();
            this.browser.render();
        });
        this.container.querySelector("#devfs_type_filter").addEventListener("change", event => {
            this.browser.store.filterType = event.target.value;
            this.browser.render();
        });
        this.container.querySelector("#devfs_view_modes").addEventListener("click", event => {
            const button = event.target.closest("button[data-view]");
            if (button) this.browser.setViewMode(button.dataset.view);
        });
        this.filesContainer.addEventListener("click", event => this.handleFileClick(event));
        this.filesContainer.addEventListener("dblclick", event => this.handleFileDoubleClick(event));
        this.filesContainer.addEventListener("contextmenu", event => this.handleContextMenu(event));
        this.filesContainer.addEventListener("dragstart", event => this.handleDragStart(event));
        this.filesContainer.addEventListener("dragover", event => this.handleDragOver(event));
        this.filesContainer.addEventListener("dragleave", event => this.handleDragLeave(event));
        this.filesContainer.addEventListener("drop", event => this.handleDrop(event));
        this.inspector.addEventListener("click", event => {
            const button = event.target.closest("button[data-action]");
            if (button) this.browser.commands.run(button.dataset.action);
        });
    }

    bindWindowFrame() {
        const bar = this.container.querySelector(".devfs_window_bar");
        const handles = this.container.querySelectorAll("[data-devfs-resize-edge]");
        let dragState = null;
        const minWidth = 52;
        const minHeight = 42;
        const maxWidth = 96;
        const maxHeight = 90;

        const clampRect = rect => {
            const width = Math.max(minWidth, Math.min(maxWidth, rect.width));
            const height = Math.max(minHeight, Math.min(maxHeight, rect.height));
            return {
                left: Math.max(1, Math.min(99 - width, rect.left)),
                top: Math.max(2, Math.min(96 - height, rect.top)),
                width,
                height
            };
        };

        const resizeRect = (rect, edge, dx, dy) => {
            let left = rect.left;
            let top = rect.top;
            let width = rect.width;
            let height = rect.height;

            if (edge.includes("e")) width += dx;
            if (edge.includes("s")) height += dy;
            if (edge.includes("w")) {
                left += dx;
                width -= dx;
            }
            if (edge.includes("n")) {
                top += dy;
                height -= dy;
            }
            if (width < minWidth) {
                if (edge.includes("w")) left -= minWidth - width;
                width = minWidth;
            }
            if (height < minHeight) {
                if (edge.includes("n")) top -= minHeight - height;
                height = minHeight;
            }
            return {left, top, width, height};
        };

        const start = (event, mode, edge) => {
            if (this.browser.store.surfaceMode !== "window") return;
            if (event.target.closest("button,input,select")) return;
            event.preventDefault();
            dragState = {
                mode,
                edge: edge || "se",
                startX: event.clientX,
                startY: event.clientY,
                rect: {...this.browser.store.windowRect}
            };
            document.body.classList.add("devfs_window_dragging");
        };

        bar.addEventListener("mousedown", event => start(event, "move"));
        handles.forEach(handle => {
            handle.addEventListener("mousedown", event => start(event, "resize", handle.dataset.devfsResizeEdge || "se"));
        });

        document.addEventListener("mousemove", event => {
            if (!dragState) return;
            const dx = (event.clientX - dragState.startX) / Math.max(window.innerWidth, 1) * 100;
            const dy = (event.clientY - dragState.startY) / Math.max(window.innerHeight, 1) * 100;
            const rect = dragState.mode === "move"
                ? {
                    ...dragState.rect,
                    left: dragState.rect.left + dx,
                    top: dragState.rect.top + dy
                }
                : {
                    ...resizeRect(dragState.rect, dragState.edge, dx, dy)
                };
            this.browser.setWindowRect(clampRect(rect), false);
        });

        document.addEventListener("mouseup", () => {
            if (!dragState) return;
            dragState = null;
            document.body.classList.remove("devfs_window_dragging");
            this.browser.persistWindowRect();
        });
    }

    itemFromNode(node) {
        const index = Number(node.dataset.index);
        if (node.dataset.pane === "secondary") return this.browser.store.secondaryItems[index];
        if (node.dataset.pane === "children") return this.browser.store.columnChildren[index];
        return this.currentItems[index];
    }

    clearDragTarget() {
        if (this.dragTargetNode) {
            this.dragTargetNode.classList.remove("drag-target");
            this.dragTargetNode = null;
        }
    }

    dropTargetForEvent(event) {
        const node = event.target.closest("[data-index]");
        if (node) {
            const item = this.itemFromNode(node);
            if (this.browser.isDirectoryLike(item)) return {dir: item.path, node};
        }

        const pane = event.target.closest(".devfs_pane");
        if (pane && pane.classList.contains("active") && this.browser.store.activePane === "secondary") {
            return {dir: this.browser.store.secondaryDir || this.browser.dirpath, node: pane};
        }
        if (pane && pane.querySelector(".devfs_pane_title")) {
            const title = pane.querySelector(".devfs_pane_title").textContent;
            return {dir: title || this.browser.dirpath, node: pane};
        }

        return {dir: this.browser.dirpath, node: this.filesContainer};
    }

    dragPathsFromEvent(event) {
        const files = Array.from(event.dataTransfer && event.dataTransfer.files || [])
            .map(file => file.path)
            .filter(Boolean);
        if (files.length) return files;

        const raw = event.dataTransfer ? event.dataTransfer.getData("application/x-edex-devfs") || event.dataTransfer.getData("text/plain") : "";
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
            if (parsed && Array.isArray(parsed.paths)) return parsed.paths.filter(Boolean);
        } catch(e) {}
        return raw.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    }

    handleFileClick(event) {
        const node = event.target.closest("[data-index]");
        if (!node) return;
        const item = this.itemFromNode(node);
        if (!item) return;
        const pane = node.dataset.pane || "primary";
        const now = Date.now();
        if (this.lastClick && this.lastClick.path === item.path && this.lastClick.pane === pane && now - this.lastClick.time < 520) {
            this.lastClick = null;
            this.ignoreNativeDoubleClickUntil = now + 520;
            this.browser.openItem(item, pane);
            return;
        }
        this.lastClick = {path: item.path, pane, time: now};
        this.filesContainer.focus();
        this.browser.store.activePane = pane;
        const multiSelectable = pane === "primary";
        this.browser.selectItem(item, {
            list: this.currentItems,
            toggle: multiSelectable && (event.ctrlKey || event.metaKey),
            range: multiSelectable && event.shiftKey
        });
        if (this.browser.store.view === "columns" && this.browser.isDirectoryLike(item)) {
            this.browser.loadColumnChildren(item);
        }
    }

    handleFileDoubleClick(event) {
        if (Date.now() < this.ignoreNativeDoubleClickUntil) return;
        const node = event.target.closest("[data-index]");
        if (!node) return;
        const item = this.itemFromNode(node);
        if (item) this.browser.openItem(item, node.dataset.pane || "primary");
    }

    handleContextMenu(event) {
        event.preventDefault();
        const node = event.target.closest("[data-index]");
        let item = null;
        if (node) {
            item = this.itemFromNode(node);
            if (item && !this.browser.store.isSelected(item)) this.browser.selectItem(item);
        } else {
            this.browser.selectItem(null);
        }
        this.browser.showContextMenu(event.clientX, event.clientY, item);
    }

    handleDragStart(event) {
        const node = event.target.closest("[data-index]");
        if (!node || !event.dataTransfer) return;
        const item = this.itemFromNode(node);
        if (!item) return;
        if (!this.browser.store.isSelected(item)) {
            this.browser.store.selectItem(item, this.currentItems);
            this.browser.syncLegacyState();
        }
        const paths = this.browser.selectedOperationItems().map(selected => selected.path);
        event.dataTransfer.effectAllowed = "copyMove";
        event.dataTransfer.setData("application/x-edex-devfs", JSON.stringify({paths}));
        event.dataTransfer.setData("text/plain", paths.join("\n"));
    }

    handleDragOver(event) {
        const target = this.dropTargetForEvent(event);
        if (!target || !target.dir) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = event.shiftKey ? "move" : "copy";
        this.clearDragTarget();
        this.dragTargetNode = target.node;
        if (this.dragTargetNode && this.dragTargetNode.classList) this.dragTargetNode.classList.add("drag-target");
    }

    handleDragLeave(event) {
        if (!this.filesContainer.contains(event.relatedTarget)) this.clearDragTarget();
    }

    handleDrop(event) {
        const target = this.dropTargetForEvent(event);
        const paths = this.dragPathsFromEvent(event);
        this.clearDragTarget();
        if (!target || !target.dir || !paths.length) return;
        event.preventDefault();
        this.browser.dropPathsToDirectory(paths, target.dir, event.shiftKey ? "move" : "copy");
    }

    render() {
        const store = this.browser.store;
        this.container.classList.toggle("dev-explorer", true);
        this.container.classList.toggle("cockpit-expanded", store.surfaceMode === "cockpit");
        this.container.classList.toggle("window-mode", store.surfaceMode === "window");
        this.container.classList.toggle("dock-mode", store.surfaceMode === "dock");
        this.container.classList.toggle("hideDotfiles", store.hideDotfiles);
        this.browser.applyWindowRect();
        ["list", "grid", "columns", "dualPane"].forEach(view => {
            this.container.classList.toggle(`${view}-view`, store.view === view);
        });

        const title = this.container.querySelector("#fs_disp_title_dir");
        if (title) title.innerText = store.dirpath || "";
        const windowPath = this.container.querySelector("#devfs_window_path");
        if (windowPath) windowPath.textContent = store.dirpath || "";
        const expand = this.container.querySelector("#devfs_expand");
        if (expand) {
            const isExpanded = store.surfaceMode === "cockpit";
            expand.innerHTML = this.browser.buttonMarkup(isExpanded ? "dock" : "maximize", isExpanded ? "Dock" : "Expand");
            expand.title = isExpanded ? "Return to dock" : "Expand cockpit";
        }
        const windowButton = this.container.querySelector("#devfs_window");
        if (windowButton) {
            const isWindow = store.surfaceMode === "window";
            windowButton.innerHTML = this.browser.buttonMarkup(isWindow ? "dock" : "window", isWindow ? "Dock" : "Window");
            windowButton.title = isWindow ? "Return explorer to dock (Ctrl+Shift+E)" : "Detach explorer to movable window (Ctrl+Shift+E)";
        }
        const filter = this.container.querySelector("#devfs_filter");
        if (filter && document.activeElement !== filter) filter.value = store.search;
        const typeFilter = this.container.querySelector("#devfs_type_filter");
        if (typeFilter) typeFilter.value = store.filterType;

        this.renderBreadcrumbs();
        this.renderTabs();
        this.renderNavigator();
        this.renderViewButtons();
        this.renderItems();
        this.renderInspector();
        this.renderStatus();
        this.renderOperations();
    }

    renderBreadcrumbs() {
        const store = this.browser.store;
        const target = this.container.querySelector("#devfs_breadcrumbs");
        if (!target) return;
        const parsed = this.browser.path.parse(store.dirpath || "");
        const parts = (store.dirpath || "").slice(parsed.root.length).split(/[\\/]+/).filter(Boolean);
        let current = parsed.root || "";
        const crumbs = [];
        if (current) crumbs.push(`<button type="button" title="${this.escape(current)}" data-path="${this.escape(current)}">${this.escape(current.replace(/[\\/]$/, "") || current)}</button>`);
        parts.forEach(part => {
            current = current ? this.browser.path.join(current, part) : part;
            crumbs.push(`<button type="button" title="${this.escape(current)}" data-path="${this.escape(current)}">${this.escape(part)}</button>`);
        });
        target.innerHTML = crumbs.join("<span>/</span>");
        target.querySelectorAll("button[data-path]").forEach(button => {
            button.addEventListener("click", () => this.browser.readFS(button.dataset.path));
        });
    }

    renderTabs() {
        const store = this.browser.store;
        const target = this.container.querySelector("#devfs_tabs");
        target.innerHTML = store.tabs.map(tab => `
            <button type="button" class="${tab.id === store.activeTabId ? "active" : ""}" data-tab="${this.escape(tab.id)}" title="${this.escape(tab.path || store.dirpath)}">
                ${this.escape(tab.path ? this.browser.path.basename(tab.path) || tab.path : "tab")}
            </button>
        `).join("") + `<button type="button" data-tab-action="new">+</button>`;
        target.querySelectorAll("button[data-tab]").forEach(button => {
            button.addEventListener("click", () => this.browser.activateTab(button.dataset.tab));
        });
        const add = target.querySelector("button[data-tab-action='new']");
        if (add) add.addEventListener("click", () => this.browser.newTab());
    }

    renderNavigator() {
        const store = this.browser.store;
        const nav = this.container.querySelector("#devfs_nav");
        const root = this.browser.path.parse(store.dirpath || "").root || store.dirpath;
        const parent = this.browser.path.dirname(store.dirpath || root);
        const cwd = window.settings.cwd || store.dirpath;
        const userData = edex.paths && edex.paths.userData || store.dirpath;
        const pinned = store.settings.pinned || [];
        const recent = store.settings.recent || [];
        const drives = store.drives || [];
        const pathButton = (target, icon, label, title, disabled = false) => (
            `<button type="button" class="devfs_nav_button" ${disabled ? "disabled" : ""} data-path="${this.escape(target)}" title="${this.escape(title || target)}">${this.browser.buttonMarkup(icon, label)}</button>`
        );
        const commandButton = (command, icon, label, title) => (
            `<button type="button" class="devfs_nav_button" data-command="${this.escape(command)}" title="${this.escape(title || label)}">${this.browser.buttonMarkup(icon, label)}</button>`
        );
        nav.innerHTML = `
            <div class="devfs_nav_group">
                <h5>Places</h5>
                ${pathButton(parent, "up", "Parent", parent, parent === store.dirpath)}
                ${pathButton(root, "drive", "Root", root)}
                ${pathButton(cwd, "terminal", "CWD", cwd)}
                ${pathButton(userData, "home", "User data", userData)}
                ${commandButton("pin-folder", "pin", "Pin current", "Pin current folder")}
            </div>
            <div class="devfs_nav_group">
                <h5>Drives</h5>
                ${drives.map(drive => pathButton(drive.path, "drive", drive.name, drive.path)).join("") || `<div class="devfs_nav_empty">No drives</div>`}
            </div>
            <div class="devfs_nav_group">
                <h5>Pinned</h5>
                ${pinned.slice(0, 6).map(item => pathButton(item, "pin", this.browser.path.basename(item) || item, item)).join("") || `<div class="devfs_nav_empty">No pins</div>`}
            </div>
            <div class="devfs_nav_group">
                <h5>Recent</h5>
                ${recent.slice(0, 6).map(item => pathButton(item, "recent", this.browser.path.basename(item) || item, item)).join("") || `<div class="devfs_nav_empty">No recent</div>`}
            </div>
            <div class="devfs_nav_group">
                <h5>Tools</h5>
                ${commandButton("terminal-here", "terminal", "Terminal", "Open terminal here")}
                ${commandButton("context", "context", "Context", "Open context pack")}
                ${commandButton("plugins", "plugins", "Plugins", "Open plugin manager")}
                ${commandButton("settings", "settings", "Settings", "Open eDEX settings")}
            </div>`;
        nav.querySelectorAll("button[data-path]").forEach(button => {
            button.addEventListener("click", () => this.browser.readFS(button.dataset.path));
        });
        nav.querySelectorAll("button[data-command]").forEach(button => {
            button.addEventListener("click", () => this.browser.commands.run(button.dataset.command));
        });
    }

    renderViewButtons() {
        this.container.querySelectorAll("#devfs_view_modes button").forEach(button => {
            button.classList.toggle("active", button.dataset.view === this.browser.store.view);
        });
    }

    refreshSelection() {
        this.filesContainer.querySelectorAll("[data-index]").forEach(node => {
            const item = this.itemFromNode(node);
            node.classList.toggle("selected", this.browser.store.isSelected(item));
        });
        this.renderInspector();
        this.renderStatus();
    }

    itemClasses(item) {
        const classes = ["devfs_item", item.type, item.hidden ? "hidden" : "", this.browser.store.isSelected(item) ? "selected" : ""];
        if (item.git) {
            const status = String(item.git);
            if (status.includes("?")) classes.push("git-untracked");
            if (status.includes("M")) classes.push("git-modified");
            if (status.includes("D") || item.type === "deleted") classes.push("git-deleted");
            if (status.includes("A")) classes.push("git-added");
        }
        return classes.filter(Boolean).join(" ");
    }

    renderItem(item, index, pane) {
        const store = this.browser.store;
        const name = this.browser.itemDisplayName(item);
        const git = item.git ? `<span class="devfs_git_badge">${this.escape(item.git)}</span>` : "";
        const size = typeof item.size === "number" ? edex.formatBytes(item.size) : "--";
        const mtime = item.mtime ? new Date(item.mtime).toLocaleString() : "--";
        const kind = this.browser.kindLabel(item);
        return `
            <div class="${this.itemClasses(item)}" draggable="true" data-index="${index}" ${pane ? `data-pane="${pane}"` : ""} data-path="${this.escape(item.path)}" data-name="${this.escape(name)}" title="${this.escape(name)} - ${this.escape(kind)} - ${this.escape(item.path)}">
                <span class="devfs_icon">${this.browser.svgIcon(this.browser.itemIconName(item))}</span>
                <span class="devfs_name" data-name="${this.escape(name)}">${this.escape(name)}</span>
                <span class="devfs_kind" aria-hidden="true">${git}</span>
                <span class="devfs_size">${this.escape(size)}</span>
                <span class="devfs_time">${this.escape(mtime)}</span>
            </div>`;
    }

    renderItems() {
        const store = this.browser.store;
        const items = store.filteredItems();
        this.currentItems = items;
        this.container.querySelector("#devfs_headers").innerHTML = store.view === "list"
            ? `<span></span><span>Name</span><span></span><span>Size</span><span>Modified</span>`
            : "";

        if (store.view === "columns") return this.renderColumns(items);
        if (store.view === "dualPane") return this.renderDualPane(items);
        this.renderIncremental(items, "");
    }

    nextRenderToken(total) {
        const token = ++this.renderToken;
        this.renderedEntries = 0;
        this.browser.store.renderProgress = {
            active: total > 0,
            rendered: 0,
            total
        };
        this.renderStatus();
        this.updateRenderNotice(token);
        return token;
    }

    isRendering() {
        return !!(this.browser.store.renderProgress && this.browser.store.renderProgress.active);
    }

    chunkSize(total) {
        if (total >= 5000) return 120;
        if (total >= 1500) return 180;
        return 300;
    }

    scheduleRenderChunk(callback) {
        if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(callback, {timeout: 80});
            return;
        }
        window.requestAnimationFrame(callback);
    }

    updateRenderProgress(token, rendered, total) {
        if (token !== this.renderToken) return;
        this.browser.store.renderProgress = {
            active: rendered < total,
            rendered,
            total
        };
        this.renderStatus();
        this.updateRenderNotice(token);
        if (rendered >= total) this.browser.onItemsRendered();
    }

    updateRenderNotice(token) {
        if (token !== this.renderToken || !this.filesContainer) return;
        const progress = this.browser.store.renderProgress || {};
        let notice = this.filesContainer.querySelector(".devfs_render_notice");
        if (!progress.active) {
            if (notice) notice.remove();
            return;
        }
        if (!notice) {
            notice = document.createElement("div");
            notice.className = "devfs_render_notice";
            this.filesContainer.appendChild(notice);
        }
        notice.textContent = `rendering ${progress.rendered}/${progress.total} entries`;
    }

    renderIncremental(items, pane) {
        const total = items.length;
        const token = this.nextRenderToken(total);
        this.filesContainer.innerHTML = "";
        if (!total) {
            this.filesContainer.innerHTML = `<div class="devfs_empty">No entries match the current filters.</div>`;
            this.updateRenderProgress(token, 0, 0);
            return;
        }

        this.renderChunkedJobs(token, [{target: this.filesContainer, items, pane}], total);
    }

    renderChunkedJobs(token, jobs, total) {
        let activeJobs = jobs.filter(job => job.target && job.items.length);
        if (!activeJobs.length) {
            this.updateRenderProgress(token, total, total);
            return;
        }

        const chunk = this.chunkSize(total);
        activeJobs.forEach(job => {
            job.index = 0;
        });

        const append = () => {
            if (token !== this.renderToken) return;
            let didWork = false;
            activeJobs = activeJobs.filter(job => job.index < job.items.length);

            activeJobs.forEach(job => {
                if (job.index >= job.items.length) return;
                const end = Math.min(job.index + chunk, job.items.length);
                let html = "";
                for (; job.index < end; job.index++) {
                    html += this.renderItem(job.items[job.index], job.index, job.pane || "");
                }
                if (html) {
                    job.target.insertAdjacentHTML("beforeend", html);
                    didWork = true;
                }
            });

            this.renderedEntries = jobs.reduce((sum, job) => sum + Math.min(job.index || 0, job.items.length), 0);
            this.updateRenderProgress(token, Math.min(this.renderedEntries, total), total);
            activeJobs = activeJobs.filter(job => job.index < job.items.length);
            if (didWork && activeJobs.length) this.scheduleRenderChunk(append);
        };

        append();
    }

    renderColumns(items) {
        const store = this.browser.store;
        const parts = (store.dirpath || "").split(/[\\/]+/).filter(Boolean);
        const pathColumn = parts.length ? parts.map((part, index) => {
            const target = this.browser.path.join(this.browser.path.parse(store.dirpath).root || "", ...parts.slice(0, index + 1));
            return `<button type="button" data-path="${this.escape(target)}">${this.escape(part)}</button>`;
        }).join("") : `<button type="button" data-path="${this.escape(store.dirpath)}">${this.escape(store.dirpath || "root")}</button>`;
        this.filesContainer.innerHTML = `
            <div class="devfs_columns">
                <div class="devfs_column devfs_path_column">${pathColumn}</div>
                <div class="devfs_column devfs_column_primary"></div>
                <div class="devfs_column devfs_column_children">${store.columnChildren.length ? "" : `<div class="devfs_empty">Select a folder</div>`}</div>
            </div>`;
        this.filesContainer.querySelectorAll(".devfs_path_column button").forEach(button => {
            button.addEventListener("click", () => this.browser.readFS(button.dataset.path));
        });
        const jobs = [
            {target: this.filesContainer.querySelector(".devfs_column_primary"), items, pane: ""},
            {target: this.filesContainer.querySelector(".devfs_column_children"), items: store.columnChildren, pane: "children"}
        ];
        const total = items.length + store.columnChildren.length;
        const token = this.nextRenderToken(total);
        this.renderChunkedJobs(token, jobs, total);
    }

    renderDualPane(items) {
        const store = this.browser.store;
        this.filesContainer.innerHTML = `
            <div class="devfs_dual">
                <div class="devfs_pane ${store.activePane !== "secondary" ? "active" : ""}">
                    <div class="devfs_pane_title">${this.escape(store.dirpath || "")}</div>
                    <div class="devfs_pane_items devfs_pane_primary">${items.length ? "" : `<div class="devfs_empty">No entries</div>`}</div>
                </div>
                <div class="devfs_pane ${store.activePane === "secondary" ? "active" : ""}">
                    <div class="devfs_pane_title">${this.escape(store.secondaryDir || "")}</div>
                    <div class="devfs_pane_items devfs_pane_secondary">${store.secondaryItems.length ? "" : `<div class="devfs_empty">No entries</div>`}</div>
                </div>
            </div>`;
        const jobs = [
            {target: this.filesContainer.querySelector(".devfs_pane_primary"), items, pane: ""},
            {target: this.filesContainer.querySelector(".devfs_pane_secondary"), items: store.secondaryItems, pane: "secondary"}
        ];
        const total = items.length + store.secondaryItems.length;
        const token = this.nextRenderToken(total);
        this.renderChunkedJobs(token, jobs, total);
    }

    renderInspector() {
        const store = this.browser.store;
        const selectedItems = store.selectedItems(this.currentItems || store.filteredItems());
        if (selectedItems.length > 1) {
            const action = (command, label) => {
                const meta = this.browser.actionMeta(command);
                return `<button type="button" data-action="${this.escape(command)}" title="${this.escape(label || meta.label)}">${this.browser.buttonMarkup(meta.icon, label || meta.label)}</button>`;
            };
            this.inspector.innerHTML = `
                <h4><span class="devfs_inspector_icon">${this.browser.svgIcon("list")}</span>${selectedItems.length} selected</h4>
                <p>${this.escape(store.dirpath || "")}</p>
                <div class="devfs_meta">
                    <span>${selectedItems.filter(item => item.type === "file").length} files</span>
                    <span>${selectedItems.filter(item => this.browser.isDirectoryLike(item)).length} folders</span>
                    <span>${selectedItems.filter(item => item.git).length} changed</span>
                </div>
                <div class="devfs_actions">
                    ${action("copy-path", "Copy paths")}
                    ${action("copy-wsl", "Copy WSL paths")}
                    ${action("copy", "Copy selected")}
                    ${action("move", "Move selected")}
                    ${action("duplicate", "Duplicate selected")}
                    ${action("trash", "Trash selected")}
                </div>
                <div id="devfs_preview"><div class="devfs_empty">Multi-selection active</div></div>`;
            return;
        }

        const item = store.selected;
        if (!item) {
            this.inspector.innerHTML = `<div class="devfs_inspector_empty">Select an entry</div>`;
            return;
        }

        const git = item.git ? `<span class="git_status">${this.escape(item.git)}</span>` : `<span class="dev_muted">clean</span>`;
        const hash = store.hashes[item.path] ? `<div class="devfs_extra"><h5>Hashes</h5><pre>${this.escape(JSON.stringify(store.hashes[item.path], null, 2))}</pre></div>` : "";
        const diff = store.diffs[item.path] ? `<div class="devfs_extra"><h5>Diff</h5><pre>${this.escape(store.diffs[item.path].diff || "No diff")}</pre></div>` : "";
        const previewSlot = store.showPreview ? `<div id="devfs_preview"><div class="devfs_empty">Preview ready</div></div>` : `<div id="devfs_preview" class="disabled"><div class="devfs_empty">Preview hidden</div></div>`;
        const name = this.browser.itemDisplayName(item);
        const action = (command, disabled = false, label) => {
            const meta = this.browser.actionMeta(command);
            return `<button type="button" data-action="${this.escape(command)}" ${disabled ? "disabled" : ""} title="${this.escape(label || meta.label)}">${this.browser.buttonMarkup(meta.icon, label || meta.label)}</button>`;
        };

        this.inspector.innerHTML = `
            <h4 title="${this.escape(name)}"><span class="devfs_inspector_icon">${this.browser.svgIcon(this.browser.itemIconName(item))}</span>${this.escape(name)}</h4>
            <p title="${this.escape(item.path)}">${this.escape(item.path)}</p>
            <div class="devfs_meta">
                <span>${this.escape(this.browser.kindLabel(item))}</span>
                <span>${typeof item.size === "number" ? edex.formatBytes(item.size) : "--"}</span>
                <span>${item.mtime ? this.escape(new Date(item.mtime).toLocaleString()) : "--"}</span>
                ${git}
            </div>
            <div class="devfs_actions">
                ${action("open-external")}
                ${action("edit", item.type !== "file")}
                ${action("media", item.type !== "file")}
                ${action("terminal-here")}
                ${action("copy-path")}
                ${action("copy-wsl")}
                ${action("rename")}
                ${action("duplicate")}
                ${action("copy")}
                ${action("move")}
                ${action("trash")}
                ${action("hash", item.type !== "file")}
                ${action("diff", !item.git)}
            </div>
            ${previewSlot}
            ${hash}
            ${diff}`;
    }

    setPreview(html) {
        const target = this.inspector.querySelector("#devfs_preview");
        if (target) target.innerHTML = html;
    }

    renderStatus() {
        const store = this.browser.store;
        const progress = store.renderProgress || {};
        const visible = this.currentItems ? this.currentItems.length : store.filteredItems().length;
        const git = store.git && store.git.isRepo ? ` / git ${store.git.branch || "repo"}` : "";
        const selected = store.selectedItems(this.currentItems || store.filteredItems()).length;
        const selection = selected > 1 ? ` / ${selected} selected` : "";
        if (progress.active) {
            this.status.textContent = `rendering ${progress.rendered}/${progress.total} entries`;
            this.progress.value = progress.total ? Math.max(3, Math.round((progress.rendered / progress.total) * 100)) : 100;
        } else {
            this.status.textContent = store.status || `${visible}/${store.items.length} entries / ${store.view}${selection}${git}`;
            this.progress.value = store.operationRunning ? 45 : 100;
        }
    }

    renderOperations() {
        const target = this.container.querySelector("#devfs_ops");
        if (!target) return;
        target.innerHTML = this.browser.store.operations.slice(0, 4).map(op => (
            `<span class="devfs_op ${this.escape(op.state)}" title="${this.escape(op.error || op.label)}">${this.escape(op.state)}: ${this.escape(op.label)}</span>`
        )).join("");
    }
}

class DevFileBrowser {
    constructor(opts) {
        if (!opts.parentId) throw "Missing options";
        this.path = require("path");
        this.container = document.getElementById(opts.parentId);
        this.fuse = null;
        this.watchHandle = null;
        this.watchTimer = null;
        this.readToken = 0;
        this.pendingPreviewPath = null;
        this.store = new ExplorerStore(this);
        this.commands = new ExplorerCommands(this);
        this.preview = new ExplorerPreview(this);
        this.renderer = new ExplorerRenderer(this);
        this.renderer.renderShell();
        this.syncLegacyState();
        this.followTab();
        this.refreshDrives();

        const startupCwd = this.store.initialPath || (window.term && window.term[window.currentTerm] && window.term[window.currentTerm].cwd
            ? window.term[window.currentTerm].cwd
            : window.settings.cwd);
        this.readFS(startupCwd && startupCwd.startsWith("FALLBACK |-- ") ? startupCwd.slice(13) : startupCwd);
    }

    escape(value) {
        return window._escapeHtml(String(value == null ? "" : value));
    }

    itemDisplayName(item) {
        if (!item) return "";
        const rawName = item.name || (item.path ? this.path.basename(item.path) : "");
        if (!rawName) return "Untitled";
        if (this.store.showExtensions === false && item.type === "file") {
            const ext = this.path.extname(rawName);
            return ext ? rawName.slice(0, -ext.length) : rawName;
        }
        return rawName;
    }

    svgIcon(name) {
        const path = DEVFS_ICON_PATHS[name] || DEVFS_ICON_PATHS.file;
        return `<svg class="devfs_svg_icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
    }

    buttonMarkup(icon, label) {
        return `${this.svgIcon(icon)}<span>${this.escape(label)}</span>`;
    }

    actionMeta(command) {
        const found = this.commands && this.commands.commandButtons.find(item => item.command === command);
        const fallback = {
            "open-external": {label: "Open", icon: "open"},
            "open-selected": {label: "Open", icon: "open"},
            "terminal-here": {label: "Terminal", icon: "terminal"},
            "copy-path": {label: "Copy path", icon: "path"},
            "copy-wsl": {label: "Copy WSL", icon: "wsl"},
            "hash": {label: "Hash", icon: "extensions"},
            "diff": {label: "Diff", icon: "git"},
            "context": {label: "Context", icon: "context"}
        };
        return found || fallback[command] || {label: command, icon: "file"};
    }

    itemIconName(item) {
        if (!item) return "file";
        if (item.type === "dir") return "folder";
        if (item.type === "symlink") return "symlink";
        if (item.type === "deleted") return "deleted";
        const ext = String(item.ext || "").toLowerCase();
        if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
        if (["mp4", "webm", "mov", "mkv", "avi"].includes(ext)) return "video";
        if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) return "audio";
        if (["zip", "rar", "7z", "tar", "gz", "xz"].includes(ext)) return "archive";
        if (["js", "jsx", "ts", "tsx", "mjs", "cjs", "css", "scss", "html", "xml", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "cs", "php", "sh", "ps1", "bat", "cmd", "sql"].includes(ext)) return "code";
        if (["json", "jsonc"].includes(ext)) return "json";
        if (["md", "markdown"].includes(ext)) return "markdown";
        if (ext === "pdf") return "pdf";
        return "file";
    }

    kindLabel(item) {
        if (!item) return "";
        if (item.type === "dir") return "Folder";
        if (item.type === "symlink") return "Link";
        if (item.type === "deleted") return "Deleted";
        const ext = String(item.ext || "").toUpperCase();
        return ext ? `${ext} file` : "File";
    }

    syncLegacyState() {
        this.cwd = this.store.items;
        this.cwd_path = this.store.dirpath;
        this.dirpath = this.store.dirpath;
        this.selected = this.store.selected;
        this.view = this.store.view;
        this.hideDotfiles = this.store.hideDotfiles;
        this.git = this.store.git;
    }

    applyWindowRect() {
        const rect = this.store.windowRect;
        this.container.style.setProperty("--devfs-window-left", `${rect.left}vw`);
        this.container.style.setProperty("--devfs-window-top", `${rect.top}vh`);
        this.container.style.setProperty("--devfs-window-width", `${rect.width}vw`);
        this.container.style.setProperty("--devfs-window-height", `${rect.height}vh`);
    }

    setWindowRect(rect, persist = true) {
        this.store.windowRect = this.store.normalizeWindowRect(rect);
        this.applyWindowRect();
        if (persist) this.persistWindowRect();
    }

    persistWindowRect() {
        this.store.persist("windowRect", {...this.store.windowRect});
    }

    setStatus(message) {
        this.store.status = message;
        if (this.renderer && this.renderer.status) this.renderer.renderStatus();
    }

    isRenderingItems() {
        return !!(this.renderer && this.renderer.isRendering());
    }

    deferPreview(path) {
        this.pendingPreviewPath = path || (this.store.selected && this.store.selected.path) || null;
        if (this.pendingPreviewPath && this.renderer) {
            this.renderer.setPreview(`<div class="devfs_empty">Preview waits for directory render...</div>`);
        }
    }

    requestPreviewForSelection() {
        const item = this.store.selected;
        if (!item || item.type !== "file" || !this.store.showPreview) return false;
        if (this.isRenderingItems()) {
            this.deferPreview(item.path);
            return false;
        }
        this.pendingPreviewPath = null;
        return this.preview.loadSelected();
    }

    onItemsRendered() {
        const item = this.store.selected;
        if (!this.pendingPreviewPath || !item || item.path !== this.pendingPreviewPath) return false;
        this.pendingPreviewPath = null;
        if (item.type === "file" && this.store.showPreview) return this.preview.loadSelected();
        return false;
    }

    followTab() {
        const number = window.currentTerm || 0;
        const terminal = window.term && window.term[number];
        if (!terminal) return false;
        terminal.oncwdchange = cwd => {
            if (window.currentTerm !== number || !cwd) return;
            const next = cwd.startsWith("FALLBACK |-- ") ? cwd.slice(13) : cwd;
            if (next !== this.cwd_path) this.readFS(next);
        };
    }

    async readFS(dir, options = {}) {
        if (!dir) return false;
        if (process.platform === "win32" && /^[A-Za-z]:$/.test(dir)) dir += "\\";
        const token = ++this.readToken;
        this.setStatus("Reading directory...");

        try {
            const data = await edex.devfs.readDir(dir, {git: this.store.settings.showGitStatus !== false});
            if (!data || token !== this.readToken) return false;
            this.store.setDirectory(data, options);
            this.rememberRecent(data.cwd);
            this.buildFuse();
            this.syncLegacyState();
            this.store.status = "";
            this.renderer.render();
            this.watchFS(data.cwd);
            if (this.store.view === "dualPane" && !this.store.secondaryDir) {
                this.readSecondary(this.path.dirname(data.cwd), false);
            }
            this.requestPreviewForSelection();
            return true;
        } catch(error) {
            if (token !== this.readToken) return false;
            this.setStatus(error.message);
            this.renderer.filesContainer.innerHTML = `<div class="devfs_empty">Cannot access directory</div>`;
            return false;
        }
    }

    async watchFS(dir) {
        if (this.watchHandle) {
            await this.watchHandle.close().catch(() => {});
            this.watchHandle = null;
        }
        this.watchHandle = await edex.devfs.watch(dir, payload => {
            if (payload && payload.type === "error") {
                this.setStatus(payload.error || "Directory watcher unavailable");
                return;
            }
            clearTimeout(this.watchTimer);
            const delay = window.performanceTiming ? window.performanceTiming().filesystemWatcherDebounce : 1000;
            this.watchTimer = setTimeout(() => this.readFS(this.dirpath, {history: false}), delay);
        }).catch(() => null);
    }

    buildFuse() {
        try {
            const Fuse = require("fuse.js");
            this.fuse = new Fuse(this.store.items, {
                keys: ["name", "path", "ext", "type", "git"],
                threshold: 0.35,
                ignoreLocation: true
            });
        } catch(e) {
            this.fuse = null;
        }
    }

    filteredItems() {
        return this.store.filteredItems();
    }

    render() {
        this.syncLegacyState();
        this.renderer.render();
        this.requestPreviewForSelection();
    }

    selectItem(item, options = {}) {
        this.store.selectItem(item, options.list, options);
        this.syncLegacyState();
        this.renderer.refreshSelection();
        if (item && item.type === "file") this.requestPreviewForSelection();
    }

    selectAll() {
        const item = this.store.selectAll(this.renderer.currentItems);
        this.syncLegacyState();
        this.renderer.refreshSelection();
        if (item && item.type === "file") this.requestPreviewForSelection();
        return item;
    }

    selectOffset(offset) {
        const item = this.store.selectOffset(offset);
        this.syncLegacyState();
        this.renderer.refreshSelection();
        if (item && item.type === "file") this.requestPreviewForSelection();
    }

    iconFor(item) {
        if (!item) return "----";
        if (item.type === "dir") return "DIR";
        if (item.type === "symlink") return "LNK";
        if (item.type === "deleted") return "DEL";
        if (item.ext) return item.ext.slice(0, 4).toUpperCase();
        return item.type.toUpperCase().slice(0, 4);
    }

    isDirectoryLike(item) {
        return item && (item.type === "dir" || item.type === "symlink");
    }

    isTextLike(item) {
        if (!item || item.type !== "file") return false;
        const ext = String(item.ext || "").toLowerCase();
        return [
            "txt", "md", "markdown", "json", "jsonc", "js", "jsx", "ts", "tsx", "mjs", "cjs",
            "css", "scss", "html", "xml", "yml", "yaml", "toml", "ini", "env", "ps1", "sh",
            "bat", "cmd", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "cs", "php",
            "sql", "log"
        ].includes(ext) || item.name.toLowerCase() === "dockerfile";
    }

    isMediaLike(item) {
        if (!item || item.type !== "file") return false;
        const ext = String(item.ext || "").toLowerCase();
        return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "mp4", "webm", "ogg", "mp3", "wav", "flac", "pdf"].includes(ext);
    }

    defaultOpenBehavior() {
        const behavior = window.settings && window.settings.editor && window.settings.editor.defaultOpenBehavior || "smart";
        return ["smart", "editor", "preview", "external", "ask"].includes(behavior) ? behavior : "smart";
    }

    async openFileByBehavior(item) {
        if (!item || item.type !== "file") return false;
        let behavior = this.defaultOpenBehavior();
        if (behavior === "ask") {
            const choice = window.prompt("Open with: editor, preview, external", this.isMediaLike(item) ? "preview" : "editor");
            behavior = ["editor", "preview", "external"].includes(String(choice || "").toLowerCase())
                ? String(choice).toLowerCase()
                : "smart";
        }
        if (behavior === "external") return edex.devfs.openExternal(item.path);
        if (behavior === "preview") {
            this.selectItem(item);
            return this.requestPreviewForSelection();
        }
        if (behavior === "editor") return window.devCockpit ? window.devCockpit.editor.open(item.path) : false;
        if (this.isMediaLike(item) && window.devCockpit) return window.devCockpit.mediaViewer.open(item.path);
        if (this.isTextLike(item) && window.devCockpit) return window.devCockpit.editor.open(item.path);
        this.selectItem(item);
        return this.requestPreviewForSelection();
    }

    looksLikePath(value) {
        return this.path.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.startsWith(".") || value.includes("\\") || value.includes("/");
    }

    async openPathOrSearch(value) {
        const candidates = this.looksLikePath(value)
            ? [value, this.path.resolve(this.dirpath || ".", value)]
            : [this.path.resolve(this.dirpath || ".", value)];
        for (const candidate of candidates) {
            const stat = await edex.devfs.stat(candidate).catch(() => null);
            if (!stat) continue;
            if (stat.isDirectory) return this.readFS(stat.path);
            return this.openPathInInspector(stat.path);
        }
        this.store.search = value;
        this.render();
        this.setStatus(`Filter: ${value}`);
        return false;
    }

    openItem(item, pane) {
        if (!item || item.type === "deleted") return false;
        if (pane === "secondary") {
            if (this.isDirectoryLike(item)) return this.readSecondary(item.path, true);
            this.selectItem(item);
            return this.requestPreviewForSelection();
        }
        if (pane === "children" && this.isDirectoryLike(item)) return this.readFS(item.path);
        if (this.isDirectoryLike(item)) return this.readFS(item.path);
        return this.openFileByBehavior(item);
    }

    async refreshDrives() {
        this.store.drives = await edex.devfs.listDrives().catch(() => []);
        this.render();
    }

    rememberRecent(dir) {
        if (!this.store.settings.recent) this.store.settings.recent = [];
        const recent = this.store.settings.recent.filter(item => item !== dir);
        recent.unshift(dir);
        this.store.settings.recent = recent.slice(0, Number(this.store.settings.recentLimit) || 12);
        this.store.persist("recent", this.store.settings.recent);
    }

    async loadColumnChildren(item) {
        const data = await edex.devfs.readDir(item.path, {git: this.store.settings.showGitStatus !== false}).catch(() => null);
        if (!data || !this.store.selected || this.store.selected.path !== item.path) return;
        this.store.columnParent = item.path;
        this.store.columnChildren = data.items || [];
        this.renderer.renderItems();
    }

    async readSecondary(dir, activate) {
        if (!dir) return false;
        const data = await edex.devfs.readDir(dir, {git: this.store.settings.showGitStatus !== false}).catch(error => {
            this.setStatus(error.message);
            return null;
        });
        if (!data) return false;
        this.store.secondaryDir = data.cwd;
        this.store.secondaryItems = data.items || [];
        if (activate) this.store.activePane = "secondary";
        this.renderer.render();
        return true;
    }

    goBack() {
        if (this.store.historyIndex <= 0) return false;
        this.store.historyIndex--;
        return this.readFS(this.store.history[this.store.historyIndex], {history: false});
    }

    goForward() {
        if (this.store.historyIndex >= this.store.history.length - 1) return false;
        this.store.historyIndex++;
        return this.readFS(this.store.history[this.store.historyIndex], {history: false});
    }

    goUp() {
        if (!this.dirpath) return false;
        const parent = this.path.dirname(this.dirpath);
        if (parent === this.dirpath) return false;
        return this.readFS(parent);
    }

    refresh() {
        return this.readFS(this.dirpath, {history: false});
    }

    focusOmnibar() {
        const input = this.container.querySelector("#devfs_omnibar");
        if (input) {
            input.focus();
            input.select();
        }
    }

    focusFilter() {
        const input = this.container.querySelector("#devfs_filter");
        if (input) {
            input.focus();
            input.select();
        }
    }

    setViewMode(view) {
        this.store.view = this.store.validView(view);
        this.store.persist("defaultView", this.store.view);
        window.settings.fsListView = this.store.view === "list";
        if (this.store.view === "dualPane" && !this.store.secondaryDir) {
            this.readSecondary(this.path.dirname(this.dirpath), false);
        }
        this.render();
    }

    toggleListview() {
        this.setViewMode(this.store.view === "list" ? "grid" : "list");
    }

    toggleHidedotfiles() {
        this.store.hideDotfiles = !this.store.hideDotfiles;
        window.settings.hideDotfiles = this.store.hideDotfiles;
        this.render();
    }

    toggleExtensions() {
        this.store.showExtensions = !this.store.showExtensions;
        this.store.persist("showExtensions", this.store.showExtensions);
        this.render();
    }

    togglePreview() {
        this.store.showPreview = !this.store.showPreview;
        this.store.persist("showPreview", this.store.showPreview);
        this.render();
    }

    setSurfaceMode(mode) {
        this.store.surfaceMode = this.store.validSurfaceMode(mode);
        this.store.expanded = this.store.surfaceMode === "cockpit";
        this.store.persist("mode", this.store.surfaceMode);
        this.applyWindowRect();
        this.render();
    }

    cycleSurfaceMode() {
        const modes = ["dock", "window", "cockpit"];
        const current = modes.indexOf(this.store.surfaceMode);
        const next = modes[(current + 1) % modes.length] || "dock";
        this.setSurfaceMode(next);
        return next;
    }

    toggleExpanded() {
        this.setSurfaceMode(this.store.surfaceMode === "cockpit" ? "dock" : "cockpit");
    }

    activateTab(id) {
        const tab = this.store.tabs.find(item => item.id === id);
        if (!tab) return false;
        this.store.activeTabId = id;
        this.store.persistTabs();
        if (tab.path && tab.path !== this.dirpath) return this.readFS(tab.path);
        this.render();
    }

    newTab() {
        const id = `tab-${Date.now()}`;
        this.store.tabs.push({id, path: this.dirpath});
        this.store.activeTabId = id;
        this.store.persistTabs();
        this.render();
    }

    operation(label, task) {
        return this.store.enqueueOperation(label, async () => {
            await task();
            await this.refresh();
        });
    }

    selectedOperationItems() {
        const items = this.store.selectedItems();
        return items.length ? items : (this.store.selected ? [this.store.selected] : []);
    }

    dropPathsToDirectory(paths, targetDir, mode) {
        const uniquePaths = Array.from(new Set((paths || []).filter(Boolean)));
        if (!uniquePaths.length || !targetDir) return false;
        const action = mode === "move" ? "move" : "copy";
        return this.operation(`${action} ${uniquePaths.length} dragged item${uniquePaths.length === 1 ? "" : "s"}`, async () => {
            for (const source of uniquePaths) {
                const name = this.path.basename(source);
                const target = this.path.join(targetDir, name);
                if (action === "move") {
                    if (source === target) continue;
                    await edex.devfs.move(source, target);
                } else if (source === target) {
                    await edex.devfs.duplicate(source);
                } else {
                    await edex.devfs.copy(source, target);
                }
            }
        });
    }

    targetDirForSelected() {
        const item = this.store.selected;
        if (!item) return this.dirpath;
        return this.isDirectoryLike(item) ? item.path : this.path.dirname(item.path);
    }

    async copySelectedPath(format) {
        const selected = this.selectedOperationItems();
        if (selected.length > 1) {
            const paths = selected.map(item => format === "wsl" ? item.path : item.path);
            if (format === "wsl") {
                const converted = await Promise.all(selected.map(item => edex.devfs.toWslPath(item.path).catch(() => item.path)));
                await edex.devfs.copyText(converted.join("\n"));
            } else {
                await edex.devfs.copyText(paths.join("\n"));
            }
            this.setStatus(`Copied ${selected.length} ${format === "wsl" ? "WSL " : ""}paths`);
            return true;
        }
        const item = this.store.selected;
        const target = item ? item.path : this.dirpath;
        const result = await edex.devfs.copyPath(target, format === "wsl" ? "wsl" : "windows");
        this.setStatus(`Copied ${format === "wsl" ? "WSL" : "Windows"} path`);
        return result;
    }

    async openTerminalHere() {
        const dir = this.targetDirForSelected();
        const result = await edex.devfs.openTerminalHere(dir);
        if (!result || !result.command) return false;
        if (window.spawnShellTab) return window.spawnShellTab({initialCommand: result.command, label: this.path.basename(dir) || dir});
        window.term[window.currentTerm].writelr(result.command);
        return true;
    }

    async openExternal() {
        const item = this.store.selected;
        if (!item) return false;
        await edex.devfs.openExternal(item.path);
        if (window.appWindow) window.appWindow.minimize();
        return true;
    }

    editSelected() {
        const item = this.store.selected;
        if (!item || item.type !== "file" || !window.devCockpit) return false;
        return window.devCockpit.editor.open(item.path);
    }

    openSelectedMedia() {
        const item = this.store.selected;
        if (!item || item.type !== "file" || !window.devCockpit) return false;
        return window.devCockpit.mediaViewer.open(item.path);
    }

    openSelected() {
        const item = this.store.selected;
        if (!item) return false;
        return this.openItem(item);
    }

    showContextMenu(x, y, item = this.store.selected) {
        const old = document.getElementById("devfs_context_menu");
        if (old) old.remove();
        const menu = document.createElement("div");
        menu.id = "devfs_context_menu";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        const hasItem = !!item;
        const entries = hasItem ? [
            {command: "open-selected", label: this.isDirectoryLike(item) ? "Open folder" : "Open"},
            {command: "edit", label: "Edit", disabled: item.type !== "file"},
            {command: "media", label: "Preview media", disabled: item.type !== "file"},
            {separator: true},
            {command: "open-external", label: "Open external"},
            {command: "terminal-here", label: "Terminal here"},
            {command: "copy-path", label: "Copy path"},
            {command: "copy-wsl", label: "Copy WSL path"},
            {separator: true},
            {command: "rename", label: "Rename"},
            {command: "duplicate", label: "Duplicate"},
            {command: "copy", label: "Copy to..."},
            {command: "move", label: "Move to..."},
            {command: "trash", label: "Move to trash", disabled: item.type === "deleted"},
            {separator: true},
            {command: "pin-folder", label: "Pin current folder"}
        ] : [
            {command: "new-folder", label: "New folder"},
            {command: "new-file", label: "New file"},
            {separator: true},
            {command: "terminal-here", label: "Terminal here"},
            {command: "copy-path", label: "Copy current path"},
            {command: "pin-folder", label: "Pin current folder"},
            {separator: true},
            {command: "refresh", label: "Refresh"}
        ];
        menu.innerHTML = entries.map(entry => {
            if (entry.separator) return `<div class="devfs_context_separator"></div>`;
            const meta = this.actionMeta(entry.command);
            return `<button type="button" data-command="${this.escape(entry.command)}" ${entry.disabled ? "disabled" : ""} title="${this.escape(entry.label)}">${this.buttonMarkup(meta.icon, entry.label || meta.label)}</button>`;
        }).join("");
        document.body.appendChild(menu);
        menu.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                if (button.disabled) return;
                menu.remove();
                this.commands.run(button.dataset.command);
            });
        });
        const close = event => {
            if (!menu.contains(event.target)) {
                menu.remove();
                document.removeEventListener("mousedown", close);
            }
        };
        setTimeout(() => document.addEventListener("mousedown", close), 0);
    }

    pinCurrentFolder() {
        if (!this.dirpath) return false;
        if (!this.store.settings.pinned) this.store.settings.pinned = [];
        const pinned = this.store.settings.pinned.filter(item => item !== this.dirpath);
        pinned.unshift(this.dirpath);
        this.store.settings.pinned = pinned.slice(0, 12);
        this.store.persist("pinned", this.store.settings.pinned);
        this.render();
        return true;
    }

    createFile() {
        const name = window.prompt("File name");
        if (!name) return false;
        return this.operation(`create ${name}`, () => edex.devfs.createFile(this.path.join(this.dirpath, name), ""));
    }

    createFolder() {
        const name = window.prompt("Folder name");
        if (!name) return false;
        return this.operation(`mkdir ${name}`, () => edex.devfs.createFolder(this.path.join(this.dirpath, name)));
    }

    renameSelected() {
        const item = this.store.selected;
        if (!item) return false;
        if (this.selectedOperationItems().length > 1) {
            this.setStatus("Rename one item at a time.");
            return false;
        }
        const name = window.prompt("New name", item.name);
        if (!name || name === item.name) return false;
        return this.operation(`rename ${this.itemDisplayName(item)}`, () => edex.devfs.rename(item.path, name));
    }

    duplicateSelected() {
        const selected = this.selectedOperationItems();
        if (!selected.length) return false;
        if (selected.length > 1) {
            return this.operation(`duplicate ${selected.length} items`, async () => {
                for (const item of selected) await edex.devfs.duplicate(item.path);
            });
        }
        const item = selected[0];
        const target = window.prompt("Duplicate to", "");
        if (target === null) return false;
        return this.operation(`duplicate ${this.itemDisplayName(item)}`, () => edex.devfs.duplicate(item.path, target || undefined));
    }

    copySelected() {
        const selected = this.selectedOperationItems();
        if (!selected.length) return false;
        if (selected.length > 1) {
            const targetDir = window.prompt("Copy selected items to folder", this.dirpath);
            if (!targetDir) return false;
            return this.operation(`copy ${selected.length} items`, async () => {
                for (const item of selected) await edex.devfs.copy(item.path, this.path.join(targetDir, item.name));
            });
        }
        const item = selected[0];
        const target = window.prompt("Copy to", this.path.join(this.dirpath, item.name));
        if (!target || target === item.path) return false;
        return this.operation(`copy ${this.itemDisplayName(item)}`, () => edex.devfs.copy(item.path, target));
    }

    moveSelected() {
        const selected = this.selectedOperationItems();
        if (!selected.length) return false;
        if (selected.length > 1) {
            const targetDir = window.prompt("Move selected items to folder", this.dirpath);
            if (!targetDir) return false;
            return this.operation(`move ${selected.length} items`, async () => {
                for (const item of selected) await edex.devfs.move(item.path, this.path.join(targetDir, item.name));
            });
        }
        const item = selected[0];
        const target = window.prompt("Move to", item.path);
        if (!target || target === item.path) return false;
        return this.operation(`move ${this.itemDisplayName(item)}`, () => edex.devfs.move(item.path, target));
    }

    trashSelected() {
        const selected = this.selectedOperationItems().filter(item => item.type !== "deleted");
        if (!selected.length) return false;
        if (this.store.settings.confirmTrash !== false) {
            const message = selected.length > 1 ? `Move ${selected.length} items to trash?` : `Move ${this.itemDisplayName(selected[0])} to trash?`;
            if (!window.confirm(message)) return false;
        }
        return this.operation(`trash ${selected.length > 1 ? selected.length+" items" : this.itemDisplayName(selected[0])}`, async () => {
            for (const item of selected) await edex.devfs.trash(item.path);
            this.store.selectItem(null);
        });
    }

    async showHash() {
        const item = this.store.selected;
        if (!item || item.type !== "file") return false;
        this.setStatus("Hashing file...");
        this.store.hashes[item.path] = await edex.devfs.hash(item.path);
        this.store.status = "";
        this.render();
        return true;
    }

    async showDiff() {
        const item = this.store.selected;
        if (!item || !item.git) return false;
        this.setStatus("Loading diff...");
        this.store.diffs[item.path] = await edex.devfs.gitDiff(item.path);
        this.store.status = "";
        this.render();
        return true;
    }

    previewSelected() {
        return this.requestPreviewForSelection();
    }

    openFile(itemOrIndex) {
        const item = typeof itemOrIndex === "number" ? this.cwd[itemOrIndex] : itemOrIndex;
        if (!item) return false;
        this.selectItem(item);
        return this.previewSelected();
    }

    openMedia(itemOrIndex) {
        return this.openFile(itemOrIndex);
    }

    openPathInInspector(filePath) {
        const dir = this.path.dirname(filePath);
        return this.readFS(dir).then(() => {
            const item = this.store.items.find(candidate => candidate.path === filePath);
            if (item) this.selectItem(item);
            return item;
        });
    }

    readDevices() {
        new Modal({type: "info", title: "Dev File Browser", message: "Device view is not available in Dev File Browser 2.0."});
    }
}

if (typeof module !== "undefined") {
    module.exports = {
        DevCockpit,
        DevFileBrowser
    };
}

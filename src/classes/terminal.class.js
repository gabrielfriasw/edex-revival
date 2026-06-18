function parseTerminalColor(value) {
    if (typeof value !== "string") return {r: 0, g: 0, b: 0};
    if (value.startsWith("#")) {
        let hex = value.slice(1);
        if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }
    const rgb = value.match(/\d+(\.\d+)?/g);
    if (rgb && rgb.length >= 3) {
        return {
            r: Number(rgb[0]),
            g: Number(rgb[1]),
            b: Number(rgb[2])
        };
    }
    return {r: 0, g: 0, b: 0};
}

function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function colorToHex(color) {
    return "#" + [color.r, color.g, color.b].map(channel => clampColor(channel).toString(16).padStart(2, "0")).join("");
}

function mixTerminalColors(base, target, weight) {
    const amount = Number.isFinite(weight) ? weight : 0.5;
    return {
        r: base.r * (1 - amount) + target.r * amount,
        g: base.g * (1 - amount) + target.g * amount,
        b: base.b * (1 - amount) + target.b * amount
    };
}

function applyTerminalColorFilter(base, target, filters) {
    let color = parseTerminalColor(base);
    const targetColor = parseTerminalColor(target);

    filters.forEach(step => {
        const amount = Number.isFinite(step.arg[0]) ? step.arg[0] : 0.25;
        switch(step.func) {
            case "negate":
                color = {r: 255 - color.r, g: 255 - color.g, b: 255 - color.b};
                break;
            case "grayscale": {
                const gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
                color = {r: gray, g: gray, b: gray};
                break;
            }
            case "lighten":
            case "whiten":
            case "fade":
                color = mixTerminalColors(color, {r: 255, g: 255, b: 255}, amount);
                break;
            case "darken":
            case "blacken":
                color = mixTerminalColors(color, {r: 0, g: 0, b: 0}, amount);
                break;
            case "mix":
                color = mixTerminalColors(color, targetColor, amount);
                break;
            default:
                break;
        }
    });

    return colorToHex(color);
}

function splitShellArgs(value) {
    if (Array.isArray(value)) return value.map(item => String(item));
    const raw = String(value || "").trim();
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(item => String(item));
    } catch(e) {}

    const args = [];
    let current = "";
    let quote = null;
    let escaping = false;
    for (const char of raw) {
        if (escaping) {
            current += char;
            escaping = false;
            continue;
        }
        if (char === "\\") {
            escaping = true;
            continue;
        }
        if (quote) {
            if (char === quote) quote = null;
            else current += char;
            continue;
        }
        if (char === "\"" || char === "'") {
            quote = char;
            continue;
        }
        if (/\s/.test(char)) {
            if (current) {
                args.push(current);
                current = "";
            }
            continue;
        }
        current += char;
    }
    if (current) args.push(current);
    return args;
}

function cwdFromOsc7(data) {
    const match = String(data || "").match(/\x1b\]7;file:\/\/(?:[^/\x07\x1b]+)?([^\x07\x1b]+)(?:\x07|\x1b\\)/);
    if (!match) return null;
    try {
        const decoded = decodeURIComponent(match[1]);
        if (/^\/[A-Za-z]:\//.test(decoded)) return decoded.slice(1).replace(/\//g, "\\");
        if (process.platform === "win32" && /^\/mnt\/[A-Za-z]\//.test(decoded)) {
            return decoded.replace(/^\/mnt\/([A-Za-z])\//, "$1:\\").replace(/\//g, "\\");
        }
        if (process.platform === "win32" && /^\/[A-Za-z]\//.test(decoded)) {
            return decoded.replace(/^\/([A-Za-z])\//, "$1:\\").replace(/\//g, "\\");
        }
        return decoded.replace(/^\/([A-Za-z])\//, "$1:\\").replace(/\//g, process.platform === "win32" ? "\\" : "/");
    } catch(e) {
        return null;
    }
}

function stripOsc7(data) {
    return String(data || "").replace(/\x1b\]7;file:\/\/[^\x07\x1b]+(?:\x07|\x1b\\)/g, "");
}

function shellName(shellPath) {
    return String(shellPath || "").split(/[\\/]/).pop().toLowerCase();
}

function applyShellIntegrationEnv(shellPath, env) {
    const nextEnv = Object.assign({}, env || process.env);
    const name = shellName(shellPath);
    if (name === "cmd.exe" || name === "cmd") {
        nextEnv.PROMPT = "$E]7;file:///%CD:\\=/%$E\\$P$G";
    }
    if (name.includes("bash") || name.includes("sh")) {
        const probe = "printf \"\\033]7;file://%s%s\\007\" \"${HOSTNAME:-localhost}\" \"$PWD\"";
        nextEnv.PROMPT_COMMAND = nextEnv.PROMPT_COMMAND
            ? `${probe}; ${nextEnv.PROMPT_COMMAND}`
            : probe;
    }
    return nextEnv;
}

function shellIntegrationCommand(shellPath) {
    const name = shellName(shellPath);
    if (name.includes("powershell") || name.includes("pwsh")) {
        return "if (-not $global:__edexOriginalPrompt) { $global:__edexOriginalPrompt = (Get-Command prompt -CommandType Function).ScriptBlock }; function global:prompt { $p=(Get-Location).ProviderPath; $esc=[char]27; [Console]::Write(\"$esc]7;file:///$($p -replace '\\\\','/')$([char]7)\"); & $global:__edexOriginalPrompt }";
    }
    if (name.includes("wsl")) {
        return "export PROMPT_COMMAND='printf \"\\033]7;file://%s%s\\007\" \"${HOSTNAME:-wsl}\" \"$PWD\"'";
    }
    return "";
}

function powershellQuote(value) {
    return "'" + String(value || "").replace(/'/g, "''") + "'";
}

function powershellStartupBannerCommand(version) {
    const lines = [
        "",
        "███████╗██████╗ ███████╗██╗  ██╗",
        "██╔════╝██╔══██╗██╔════╝╚██╗██╔╝",
        "█████╗  ██║  ██║█████╗   ╚███╔╝",
        "██╔══╝  ██║  ██║██╔══╝   ██╔██╗",
        "███████╗██████╔╝███████╗██╔╝ ██╗",
        "╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
        "              ██████╗ ███████╗██╗   ██╗██╗██╗   ██╗ █████╗ ██╗     ",
        "              ██╔══██╗██╔════╝██║   ██║██║██║   ██║██╔══██╗██║     ",
        "              ██████╔╝█████╗  ██║   ██║██║██║   ██║███████║██║     ",
        "              ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║╚██╗ ██╔╝██╔══██║██║     ",
        "              ██║  ██║███████╗ ╚████╔╝ ██║ ╚████╔╝ ██║  ██║███████╗",
        "              ╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝"
    ];
    return [
        `$__edexBanner=@(${lines.map(powershellQuote).join(",")})`,
        "foreach ($__edexLine in $__edexBanner) { Write-Host $__edexLine -ForegroundColor Red }",
        `Write-Host ${powershellQuote("              terminal // cockpit // ssh // v"+(version || "1.0.0"))} -ForegroundColor DarkCyan`
    ].join("; ");
}

function hasShellArg(args, names) {
    const normalized = names.map(name => name.toLowerCase());
    return args.some(arg => normalized.includes(String(arg || "").toLowerCase()));
}

function prepareShellStartup(shellPath, args, opts = {}) {
    const name = shellName(shellPath);
    const shellArgs = args.slice();
    const bootstrap = shellIntegrationCommand(shellPath);

    if (name.includes("powershell") || name.includes("pwsh")) {
        const hasExecutionArg = hasShellArg(shellArgs, ["-command", "-c", "-encodedcommand", "-e", "-file", "-f"]);
        if (!hasExecutionArg) {
            const startupCommands = [];
            if (opts.showStartupBanner) startupCommands.push(powershellStartupBannerCommand(opts.appVersion));
            if (bootstrap) startupCommands.push(bootstrap);

            if (startupCommands.length) {
                const nextArgs = shellArgs.slice();
                if (!hasShellArg(nextArgs, ["-nologo"])) nextArgs.push("-NoLogo");
                if (!hasShellArg(nextArgs, ["-noexit", "-noe"])) nextArgs.push("-NoExit");
                nextArgs.push("-Command", startupCommands.join("; "));
                return {
                    args: nextArgs,
                    postSpawnCommand: ""
                };
            }
        }
    }

    return {
        args: shellArgs,
        postSpawnCommand: bootstrap
    };
}

function fallbackStripAnsi(value) {
    return String(value || "")
        .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1B\\))/g, "")
        .replace(/\r/g, "\n");
}

function hashDiagnostic(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return String(hash);
}

function createTerminalErrorLens(term) {
    const state = {
        buffer: "",
        events: [],
        hashes: new Set(),
        maxBuffer: 60000,
        maxEvents: 40,
        onchange: () => {}
    };

    const patterns = [
        {type: "npm", severity: "error", re: /\bnpm ERR!?[^\n]*/i},
        {type: "python", severity: "error", re: /Traceback \(most recent call last\):[\s\S]{0,2200}?(?:\n\w*(?:Error|Exception):[^\n]*)/},
        {type: "javascript", severity: "error", re: /(?:TypeError|ReferenceError|SyntaxError|RangeError|Error):[^\n]*(?:\n\s+at\s+[^\n]+){1,12}/},
        {type: "git", severity: "warning", re: /\b(?:CONFLICT|Automatic merge failed|error: Your local changes|fatal: not a git repository|fatal: unable to)[^\n]*/i},
        {type: "command", severity: "error", re: /\b(?:command not found|is not recognized as an internal or external command|exit code \d+|failed with exit code \d+)[^\n]*/i},
        {type: "path", severity: "info", re: /(?:[A-Za-z]:\\|\/)[^\s"'<>:]+(?::\d+){1,2}/},
        {type: "url", severity: "info", re: /\bhttps?:\/\/[^\s"'<>]+/i},
        {type: "ip", severity: "info", re: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/}
    ];

    function normalize(raw) {
        const strip = term.stripAnsi || fallbackStripAnsi;
        return fallbackStripAnsi(strip(raw)).replace(/\n{4,}/g, "\n\n\n");
    }

    function addEvent(match, pattern, source) {
        const excerpt = String(match[0] || "").trim();
        if (!excerpt) return;

        const hash = hashDiagnostic(`${pattern.type}:${excerpt}`);
        if (state.hashes.has(hash)) return;
        state.hashes.add(hash);

        const event = {
            id: `${Date.now()}-${hash}`,
            time: Date.now(),
            type: pattern.type,
            severity: pattern.severity,
            excerpt: excerpt.slice(0, 4000),
            context: source.slice(-8000),
            refs: extractRefs(source)
        };

        state.events.push(event);
        if (state.events.length > state.maxEvents) {
            const removed = state.events.shift();
            if (removed) state.hashes.delete(hashDiagnostic(`${removed.type}:${removed.excerpt}`));
        }
        state.onchange(event, state);
    }

    function extractRefs(source) {
        const refs = [];
        const text = String(source || "");
        const pathRe = /((?:[A-Za-z]:\\|\/)[^\s"'<>:]+):(\d+)(?::(\d+))?/g;
        const urlRe = /\bhttps?:\/\/[^\s"'<>]+/g;
        const ipRe = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
        let match;

        while ((match = pathRe.exec(text)) && refs.length < 20) {
            refs.push({type: "file", path: match[1], line: Number(match[2]), column: match[3] ? Number(match[3]) : null});
        }
        while ((match = urlRe.exec(text)) && refs.length < 30) {
            refs.push({type: "url", url: match[0]});
        }
        while ((match = ipRe.exec(text)) && refs.length < 40) {
            refs.push({type: "ip", ip: match[0]});
        }

        return refs;
    }

    return {
        capture(raw) {
            const text = normalize(raw);
            if (!text.trim()) return;

            state.buffer = (state.buffer + text).slice(-state.maxBuffer);
            const analysisWindow = state.buffer.slice(-12000);
            patterns.forEach(pattern => {
                const match = analysisWindow.match(pattern.re);
                if (match) addEvent(match, pattern, analysisWindow);
            });
        },
        getText() {
            return state.buffer;
        },
        getEvents() {
            return state.events.slice();
        },
        getLatest() {
            return state.events[state.events.length - 1] || null;
        },
        getDiagnostic() {
            const latest = state.events[state.events.length - 1];
            return {
                cwd: term.cwd,
                port: term.port,
                latest,
                events: state.events.slice(-10),
                output: state.buffer
            };
        },
        clear() {
            state.events = [];
            state.hashes.clear();
            state.onchange(null, state);
        },
        set onchange(callback) {
            state.onchange = typeof callback === "function" ? callback : () => {};
        },
        get count() {
            return state.events.length;
        }
    };
}

class Terminal {
    constructor(opts) {
        if (opts.role === "client") {
            if (!opts.parentId) throw "Missing options";

            this.xTerm = window.Terminal && (window.Terminal.Terminal || window.Terminal);
            const AttachAddon = window.AttachAddon && (window.AttachAddon.AttachAddon || window.AttachAddon);
            const FitAddon = window.FitAddon && (window.FitAddon.FitAddon || window.FitAddon);
            const WebglAddon = window.WebglAddon && (window.WebglAddon.WebglAddon || window.WebglAddon);
            if (!this.xTerm || !AttachAddon || !FitAddon || !WebglAddon) {
                throw new Error("xterm browser bundles were not loaded");
            }
            this.Ipc = edex.ipc;

            this.port = opts.port || 3000;
            this.cwd = "";
            this.oncwdchange = () => {};
            this.errorLens = createTerminalErrorLens(this);
            this.errorLens.onchange = (event, state) => {
                if (typeof window.onTerminalErrorLensEvent === "function") {
                    window.onTerminalErrorLensEvent(this, event, state);
                }
            };
            import("../node_modules/strip-ansi/index.js").then(mod => {
                this.stripAnsi = mod.default || mod.stripAnsi || mod;
            }).catch(() => {
                this.stripAnsi = fallbackStripAnsi;
            });

            this._sendSizeToServer = () => {
                let cols = this.term.cols.toString();
                let rows = this.term.rows.toString();
                while (cols.length < 3) {
                    cols = "0"+cols;
                }
                while (rows.length < 3) {
                    rows = "0"+rows;
                }
                this.Ipc.send("terminal_channel-"+this.port, "Resize", cols, rows);
            };

            // Support for custom color filters on the terminal - see #483
            let doCustomFilter = (window.isTermFilterValidated) ? true : false;

            // Parse & validate color filter
            if (window.isTermFilterValidated !== true && typeof window.theme.terminal.colorFilter === "object" && window.theme.terminal.colorFilter.length > 0) {
                doCustomFilter = window.theme.terminal.colorFilter.every((step, i, a) => {
                    let func = step.slice(0, step.indexOf("("));

                    switch(func) {
                        case "negate":
                        case "grayscale":
                            a[i] = {
                                func,
                                arg: []
                            };
                            return true;
                        case "lighten":
                        case "darken":
                        case "saturate":
                        case "desaturate":
                        case "whiten":
                        case "blacken":
                        case "fade":
                        case "opaquer":
                        case "rotate":
                        case "mix":
                            break;
                        default:
                            return false;
                    }

                    let arg = step.slice(step.indexOf("(")+1, step.indexOf(")"));

                    if (!Number.isNaN(Number(arg))) {
                        a[i] = {
                            func,
                            arg: [Number(arg)]
                        };
                        window.isTermFilterValidated = true;
                        return true;
                    }

                    return false;
                });
            }

            let colorify;
            if (doCustomFilter) {
                colorify = (base, target) => {
                    return applyTerminalColorFilter(base, target, window.theme.terminal.colorFilter);
                };
            } else {
                colorify = (base, target) => {
                    return applyTerminalColorFilter(base, target, [
                        {func: "grayscale", arg: []},
                        {func: "mix", arg: [0.3]}
                    ]);
                };
            }

            let themeColor = `rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b})`;
            let terminalStyle = window.settings.terminalStyle || {};
            let terminalForeground = String(terminalStyle.foreground || "").trim() || window.theme.terminal.foreground;
            let terminalBackground = String(terminalStyle.background || "").trim() || window.theme.terminal.background;
            let performanceSettings = window.performanceSettings ? window.performanceSettings() : {};

            this.term = new this.xTerm({
                cols: 80,
                rows: 24,
                allowProposedApi: true,
                cursorBlink: window.theme.terminal.cursorBlink || true,
                cursorStyle: window.theme.terminal.cursorStyle || "block",
                allowTransparency: window.theme.terminal.allowTransparency || false,
                fontFamily: window.theme.terminal.fontFamily || "Fira Mono",
                fontSize: window.theme.terminal.fontSize || window.settings.termFontSize || 15,
                fontWeight: window.theme.terminal.fontWeight || "normal",
                fontWeightBold: window.theme.terminal.fontWeightBold || "bold",
                letterSpacing: window.theme.terminal.letterSpacing || 0,
                lineHeight: window.theme.terminal.lineHeight || 1,
                scrollback: 1500,
                bellStyle: "none",
                theme: {
                    foreground: terminalForeground,
                    background: terminalBackground,
                    cursor: window.theme.terminal.cursor,
                    cursorAccent: window.theme.terminal.cursorAccent,
                    selection: window.theme.terminal.selection,
                    black: window.theme.colors.black || colorify("#2e3436", themeColor),
                    red: window.theme.colors.red || colorify("#cc0000", themeColor),
                    green: window.theme.colors.green || colorify("#4e9a06", themeColor),
                    yellow: window.theme.colors.yellow || colorify("#c4a000", themeColor),
                    blue: window.theme.colors.blue || colorify("#3465a4", themeColor),
                    magenta: window.theme.colors.magenta || colorify("#75507b", themeColor),
                    cyan: window.theme.colors.cyan || colorify("#06989a", themeColor),
                    white: window.theme.colors.white || colorify("#d3d7cf", themeColor),
                    brightBlack: window.theme.colors.brightBlack || colorify("#555753", themeColor),
                    brightRed: window.theme.colors.brightRed || colorify("#ef2929", themeColor),
                    brightGreen: window.theme.colors.brightGreen || colorify("#8ae234", themeColor),
                    brightYellow: window.theme.colors.brightYellow || colorify("#fce94f", themeColor),
                    brightBlue: window.theme.colors.brightBlue || colorify("#729fcf", themeColor),
                    brightMagenta: window.theme.colors.brightMagenta || colorify("#ad7fa8", themeColor),
                    brightCyan: window.theme.colors.brightCyan || colorify("#34e2e2", themeColor),
                    brightWhite: window.theme.colors.brightWhite || colorify("#eeeeec", themeColor)
                }
            });
            let fitAddon = new FitAddon();
            this.term.loadAddon(fitAddon);
            this.term.open(document.getElementById(opts.parentId));
            if (performanceSettings.enableTerminalWebGL !== false) {
                try {
                    this.term.loadAddon(new WebglAddon());
                } catch(e) {
                    console.warn("Could not initialize xterm WebGL renderer", e);
                }
            }
            if (performanceSettings.enableTerminalLigatures === true) {
                import("../node_modules/@xterm/addon-ligatures/lib/addon-ligatures.mjs").then(({LigaturesAddon}) => {
                    this.term.loadAddon(new LigaturesAddon());
                }).catch(e => {
                    console.warn("Could not initialize xterm ligatures addon", e);
                });
            }
            this.term.attachCustomKeyEventHandler(e => {
                if (e.type === "keydown") {
                    const key = String(e.key || "").toLowerCase();
                    const ctrlOrMeta = e.ctrlKey || e.metaKey;
                    if (ctrlOrMeta && e.shiftKey && key === "c") {
                        if (this.clipboard) this.clipboard.copy();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    if (ctrlOrMeta && e.shiftKey && key === "v") {
                        if (this.clipboard) this.clipboard.paste();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    if (ctrlOrMeta && e.key === "Insert") {
                        if (this.clipboard) this.clipboard.copy();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    if (e.shiftKey && e.key === "Insert") {
                        if (this.clipboard) this.clipboard.paste();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                if (e.type === "keydown" && window.keyboard && typeof window.keyboard.keydownHandler === "function") {
                    window.keyboard.keydownHandler(e);
                }
                return true;
            });
            // Prevent soft-keyboard on touch devices #733
            document.querySelectorAll('.xterm-helper-textarea').forEach(textarea => textarea.setAttribute('readonly', 'readonly'))
            this.term.focus();

            this.Ipc.send("terminal_channel-"+this.port, "Renderer startup");
            this.Ipc.on("terminal_channel-"+this.port, (e, ...args) => {
                switch(args[0]) {
                    case "New cwd":
                        this.cwd = args[1];
                        this.oncwdchange(this.cwd);
                        break;
                    case "Fallback cwd":
                        this.cwd = "FALLBACK |-- "+args[1];
                        this.oncwdchange(this.cwd);
                        break;
                    case "New process":
                        this.processName = args[1] || "";
                        if (this.onprocesschange) {
                            this.onprocesschange(args[1]);
                        }
                        break;
                    default:
                        return;
                }
            });
            this.resendCWD = () => {
                this.oncwdchange(this.cwd || null);
            };

            let sockHost = opts.host || "127.0.0.1";
            let sockPort = this.port;

            this.socket = new WebSocket("ws://"+sockHost+":"+sockPort);
            this.socket.onopen = () => {
                let attachAddon = new AttachAddon(this.socket);
                this.term.loadAddon(attachAddon);
                this.fit();
            };
            this.socket.onerror = e => {
                console.warn("Terminal websocket error", e);
            };
            this.socket.onclose = e => {
                if (this.onclose) {
                    this.onclose(e);
                }
            };

            this._terminalAnalysisBuffer = "";
            this._terminalAnalysisTimer = null;
            this.queueTerminalAnalysis = data => {
                this._terminalAnalysisBuffer = (this._terminalAnalysisBuffer + String(data || "")).slice(-60000);
                if (this._terminalAnalysisTimer) return;
                const timing = window.performanceTiming ? window.performanceTiming() : {terminalAnalysisDebounce: 150};
                this._terminalAnalysisTimer = setTimeout(() => {
                    const chunk = this._terminalAnalysisBuffer;
                    this._terminalAnalysisBuffer = "";
                    this._terminalAnalysisTimer = null;

                    if (window.shouldCaptureTerminalErrorLens && window.shouldCaptureTerminalErrorLens()) {
                        this.errorLens.capture(chunk);
                    }

                    // See #397
                    if (!window.settings.experimentalGlobeFeatures || !window.mods || !window.mods.globe) return;
                    let ips = chunk.match(/((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g);
                    if (ips !== null && ips.length >= 1) {
                        ips = ips.filter((val, index, self) => { return self.indexOf(val) === index; });
                        ips.forEach(ip => {
                            window.mods.globe.addTemporaryConnectedMarker(ip);
                        });
                    }
                }, timing.terminalAnalysisDebounce || 150);
            };

            this.lastSoundFX = Date.now();
            this.socket.addEventListener("message", e => {
                let d = Date.now();
                this.queueTerminalAnalysis(e.data);

                if (d - this.lastSoundFX > 30) {
                    const perf = window.performanceSettings ? window.performanceSettings() : {};
                    if(window.passwordMode == "false" && perf.enableFeedbackAudio === true)
                        window.audioManager.stdout.play();
                    this.lastSoundFX = d;
                }
                if (d - this.lastRefit > 10000) {
                    this.fit();
                }
            });

            let parent = document.getElementById(opts.parentId);
            parent.addEventListener("wheel", e => {
                this.term.scrollLines(Math.round(e.deltaY/10));
            });
            this._lastTouchY = null;
            parent.addEventListener("touchstart", e => {
                this._lastTouchY = e.targetTouches[0].screenY;
            });
            parent.addEventListener("touchmove", e => {
                if (this._lastTouchY) {
                    let y = e.changedTouches[0].screenY;
                    let deltaY = y - this._lastTouchY;
                    this._lastTouchY = y;
                    this.term.scrollLines(-Math.round(deltaY/10));
                }
            });
            parent.addEventListener("touchend", e => {
                this._lastTouch = null;
            });
            parent.addEventListener("touchcancel", e => {
                this._lastTouch = null;
            });

            document.querySelector(".xterm-helper-textarea").addEventListener("keydown", e => {
                if (e.key === "F11" && window.settings.allowWindowed) {
                    e.preventDefault();
                    window.toggleFullScreen();
                }
            });

            this.fit = () => {
                this.lastRefit = Date.now();
                let dimensions = fitAddon.proposeDimensions();
                if (!dimensions) return;
                let {cols, rows} = dimensions;

                // Apply custom fixes based on screen ratio, see #302
                let w = screen.width;
                let h = screen.height;
                let x = 1;
                let y = 0;

                function gcd(a, b) {
                    return (b == 0) ? a : gcd(b, a%b);
                }
                let d = gcd(w, h);

                if (d === 100) { y = 1; x = 3;}
                // if (d === 120) y = 1;
                if (d === 256) x = 2;

                if (window.settings.termFontSize < 15) y = y - 1;

                cols = cols+x;
                rows = rows+y;

                if (this.term.cols !== cols || this.term.rows !== rows) {
                    this.resize(cols, rows);
                }
            };

            this.resize = (cols, rows) => {
                this.term.resize(cols, rows);
                this._sendSizeToServer();
            };

            this.write = cmd => {
                this.socket.send(cmd);
            };

            this.writelr = cmd => {
                this.socket.send(cmd+"\r");
            };

            this.clipboard = {
                copy: () => {
                    const selection = this.term.getSelection();
                    if (!selection) return false;
                    edex.clipboard.writeText(selection);
                    this.term.clearSelection();
                    this.clipboard.didCopy = true;
                    return true;
                },
                paste: () => {
                    const text = edex.clipboard.readText();
                    if (!text) return false;
                    if (typeof this.term.paste === "function") this.term.paste(text);
                    else this.write(text);
                    this.clipboard.didCopy = false;
                    return true;
                },
                didCopy: false
            };

        } else if (opts.role === "server") {

            this.Pty = require("node-pty");
            this.Websocket = require("ws").WebSocketServer;
            this.Ipc = opts.ipc;
            if (!this.Ipc) throw new Error("Missing ipcMain for terminal server");

            this.renderer = null;
            this.port = opts.port || 3000;

            this._closed = false;
            this.onclosed = () => {};
            this.onopened = () => {};
            this.onresize = () => {};
            this.ondisconnected = () => {};
            this._cwdFallbackNotified = false;

            this._disableCWDtracking = false;
            this._getTtyCWD = tty => {
                return new Promise((resolve, reject) => {
                    let pid = tty.pid || tty._pid;
                    switch(require("os").type()) {
                        case "Linux":
                            require("fs").readlink(`/proc/${pid}/cwd`, (e, cwd) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(cwd);
                                }
                            });
                            break;
                        case "Darwin":
                            require("child_process").exec(`lsof -a -d cwd -p ${pid} | tail -1 | awk '{ for (i=9; i<=NF; i++) printf "%s ", $i }'`, (e, cwd) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(cwd.trim());
                                }
                            });
                            break;
                        default:
                            resolve(tty._cwd || opts.cwd || process.env.PWD || process.cwd());
                    }
                });
            };
            this._getTtyProcess = tty => {
                return new Promise((resolve, reject) => {
                    let pid = tty.pid || tty._pid;
                    switch(require("os").type()) {
                        case "Linux":
                        case "Darwin":
                            require("child_process").exec(`ps -o comm --no-headers --sort=+pid -g ${pid} | tail -1`, (e, proc) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(proc.trim());
                                }
                            });
                            break;
                        default:
                            resolve(tty._process || "");
                    }
                });
            };
            this._nextTickUpdateTtyCWD = false;
            this._nextTickUpdateProcess = false;
            this._tick = setInterval(() => {
                if (this._nextTickUpdateTtyCWD && this._disableCWDtracking === false) {
                    this._nextTickUpdateTtyCWD = false;
                    this._getTtyCWD(this.tty).then(cwd => {
                        if (this.tty._cwd === cwd) return;
                        this.tty._cwd = cwd;
                        if (this.renderer) {
                            this.renderer.send("terminal_channel-"+this.port, "New cwd", cwd);
                        }
                    }).catch(e => {
                        if (!this._closed) {
                            if (!this._cwdFallbackNotified) {
                                console.log("TTY cwd tracking unavailable; using startup cwd fallback.");
                                this._cwdFallbackNotified = true;
                            }
                            this._disableCWDtracking = true;
                            try {
                                this.renderer.send("terminal_channel-"+this.port, "Fallback cwd", opts.cwd || process.env.PWD);
                            } catch(e) {
                                // renderer closed
                            }
                        }
                    });
                }

                if (this.renderer && this._nextTickUpdateProcess) {
                    this._nextTickUpdateProcess = false;
                    this._getTtyProcess(this.tty).then(process => {
                        if (this.tty._process === process) return;
                        this.tty._process = process;
                        if (this.renderer) {
                            this.renderer.send("terminal_channel-"+this.port, "New process", process);
                        }
                    }).catch(e => {
                        if (!this._closed) {
                            console.log("Error while retrieving TTY subprocess: ", e);
                            try {
                                this.renderer.send("terminal_channel-"+this.port, "New process", "");
                            } catch(e) {
                                // renderer closed
                            }
                        }
                    });
                }
            }, 1000);

            let shellArgs = splitShellArgs(opts.params);
            if (!shellArgs.length && process.platform !== "win32") {
                shellArgs = ["--login"];
            }
            const startup = prepareShellStartup(opts.shell || "bash", shellArgs, {
                showStartupBanner: opts.showStartupBanner === true,
                appVersion: opts.appVersion
            });
            shellArgs = startup.args;
            const shellEnv = applyShellIntegrationEnv(opts.shell || "bash", opts.env || process.env);

            this.tty = this.Pty.spawn(opts.shell || "bash", shellArgs, {
                name: shellEnv.TERM || "xterm-256color",
                cols: 80,
                rows: 24,
                cwd: opts.cwd || process.env.PWD,
                env: shellEnv
            });
            const bootstrap = startup.postSpawnCommand;
            if (bootstrap) {
                setTimeout(() => {
                    if (!this._closed) this.tty.write(bootstrap+"\r");
                }, 80);
            }

            this.tty.onExit(({exitCode, signal}) => {
                this._closed = true;
                this.onclosed(exitCode, signal);
            });

            this.wss = new this.Websocket({
                port: this.port,
                clientTracking: true,
                verifyClient: info => {
                    if (this.wss.clients.size >= 1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            });
            this.Ipc.on("terminal_channel-"+this.port, (e, ...args) => {
                switch(args[0]) {
                    case "Renderer startup":
                        this.renderer = e.sender;
                        if (!this._disableCWDtracking && this.tty._cwd) {
                            this.renderer.send("terminal_channel-"+this.port, "New cwd", this.tty._cwd);
                        }
                        if (this._disableCWDtracking) {
                            this.renderer.send("terminal_channel-"+this.port, "Fallback cwd", opts.cwd || process.env.PWD);
                        }
                        break;
                    case "Resize":
                        let cols = args[1];
                        let rows = args[2];
                        try {
                            this.tty.resize(Number(cols), Number(rows));
                        } catch (error) {
                            //Keep going, it'll work anyways.
                        }
                        this.onresized(cols, rows);
                        break;
                    default:
                        return;
                }
            });
            this.wss.on("connection", ws => {
                this.onopened(this.tty.pid || this.tty._pid);
                ws.on("close", (code, reason) => {
                    this.ondisconnected(code, reason);
                });
                ws.on("message", msg => {
                    this.tty.write(msg.toString());
                });
                this.tty.onData(data => {
                    this._nextTickUpdateTtyCWD = true;
                    this._nextTickUpdateProcess = true;
                    const oscCwd = cwdFromOsc7(data);
                    if (oscCwd && this.tty._cwd !== oscCwd) {
                        this.tty._cwd = oscCwd;
                        if (this.renderer) {
                            this.renderer.send("terminal_channel-"+this.port, "New cwd", oscCwd);
                        }
                    }
                    try {
                        ws.send(stripOsc7(data));
                    } catch (e) {
                        // Websocket closed
                    }
                });
            });

            this.close = () => {
                this.tty.kill();
                this._closed = true;
            };
        } else {
            throw "Unknown purpose";
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = {
    Terminal
    };
}

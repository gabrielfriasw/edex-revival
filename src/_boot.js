const signale = require("signale");
const {app, BrowserWindow, dialog, globalShortcut, ipcMain, screen, shell} = require("electron");

process.on("uncaughtException", e => {
    signale.fatal(e);
    dialog.showErrorBox("eDEX Revival crashed", e.message || "Cannot retrieve error message.");
    if (tty) {
        tty.close();
    }
    if (extraTtys) {
        Object.keys(extraTtys).forEach(key => {
            if (extraTtys[key] !== null) {
                extraTtys[key].close();
            }
        });
    }
    process.exit(1);
});

signale.start(`Starting eDEX Revival v${app.getVersion()}`);
signale.info(`With Node ${process.versions.node} and Electron ${process.versions.electron}`);
signale.info(`Renderer is Chrome ${process.versions.chrome}`);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    signale.fatal("Error: Another instance of eDEX is already running. Cannot proceed.");
    app.exit(1);
}

signale.time("Startup");

const electron = require("electron");
const ipc = ipcMain;
const path = require("path");
const url = require("url");
const fs = require("fs");
const Terminal = require("./classes/terminal.class.js").Terminal;
const {
    defaultDevSettings,
    registerDevBackend
} = require("./classes/devBackend.class.js");

ipc.on("log", (e, type, content) => {
    if (!isTrustedSender(e) && win) return;
    if (typeof signale[type] === "function") {
        signale[type](content);
    }
});

var win, tty, extraTtys;
const startupRecoveryWarnings = [];
const settingsFile = path.join(electron.app.getPath("userData"), "settings.json");
const shortcutsFile = path.join(electron.app.getPath("userData"), "shortcuts.json");
const lastWindowStateFile = path.join(electron.app.getPath("userData"), "lastWindowState.json");
const themesDir = path.join(electron.app.getPath("userData"), "themes");
const innerThemesDir = path.join(__dirname, "assets/themes");
const kblayoutsDir = path.join(electron.app.getPath("userData"), "keyboards");
const innerKblayoutsDir = path.join(__dirname, "assets/kb_layouts");
const fontsDir = path.join(electron.app.getPath("userData"), "fonts");
const innerFontsDir = path.join(__dirname, "assets/fonts");

const defaultSettings = {
    shell: (process.platform === "win32") ? "powershell.exe" : "bash",
    shellArgs: "",
    cwd: electron.app.getPath("userData"),
    keyboard: "en-US",
    theme: "tron",
    layoutPreset: "classic",
    launcherRail: {
        enabled: true,
        position: "top",
        compact: false,
        labels: true,
        autoHide: true
    },
    termFontSize: 15,
    terminal: {
        showStartupBanner: true
    },
    terminalStyle: {
        foreground: "",
        background: ""
    },
    audio: true,
    audioVolume: 1.0,
    disableFeedbackAudio: false,
    clockHours: 24,
    pingAddr: "1.1.1.1",
    port: 3000,
    nointro: false,
    nocursor: false,
    forceFullscreen: true,
    allowWindowed: false,
    widgets: {
        visible: true,
        keyboard: true,
        systemPanel: true,
        networkPanel: true,
        clock: true,
        sysinfo: true,
        hardware: true,
        cpu: true,
        memory: true,
        processes: true,
        networkStatus: true,
        networkTraffic: true,
        globe: true,
        globeMode: "full",
        showIp: true,
        showInterface: true,
        showGeo: true
    },
    excludeThreadsFromToplist: true,
    hideDotfiles: false,
    fsListView: false,
    experimentalGlobeFeatures: false,
    experimentalFeatures: false,
    ...defaultDevSettings()
};

function mergeSettingsDefaults(target, defaults) {
    Object.keys(defaults).forEach(key => {
        if (typeof target[key] === "undefined") {
            target[key] = defaults[key];
        } else if (
            defaults[key]
            && typeof defaults[key] === "object"
            && !Array.isArray(defaults[key])
            && target[key]
            && typeof target[key] === "object"
            && !Array.isArray(target[key])
        ) {
            mergeSettingsDefaults(target[key], defaults[key]);
        }
    });
    return target;
}

function readSettingsFile() {
    return JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
}

function isTrustedSender(event) {
    return win && event.sender === win.webContents;
}

function isSafeExternalURL(value) {
    try {
        const parsed = new URL(value);
        return ["https:", "http:", "mailto:"].includes(parsed.protocol);
    } catch(e) {
        return false;
    }
}

function getRendererContext() {
    return {
        appVersion: app.getVersion(),
        argv: process.argv.slice(),
        recoveryWarnings: startupRecoveryWarnings.slice(),
        paths: {
            app: app.getAppPath(),
            userData: app.getPath("userData"),
            settings: settingsFile,
            shortcuts: shortcutsFile,
            lastWindowState: lastWindowStateFile,
            themes: themesDir,
            keyboards: kblayoutsDir,
            fonts: fontsDir
        }
    };
}

function recordStartupRecovery(message) {
    startupRecoveryWarnings.push(message);
    signale.warn(message);
}

ipc.on("edex:get-context", event => {
    event.returnValue = getRendererContext();
});

ipc.handle("edex:open-external", (event, rawURL) => {
    if (!isTrustedSender(event) || !isSafeExternalURL(rawURL)) return false;
    shell.openExternal(rawURL);
    return true;
});

ipc.handle("edex:open-path", (event, filePath) => {
    if (!isTrustedSender(event) || typeof filePath !== "string" || filePath.length === 0) return false;
    return shell.openPath(filePath);
});

ipc.on("edex:app-control", (event, action) => {
    if (!isTrustedSender(event)) return;
    switch(action) {
        case "focus":
            app.focus({steal: true});
            break;
        case "relaunch":
            app.relaunch();
            break;
        case "quit":
            app.quit();
            break;
        default:
            break;
    }
});

ipc.on("edex:window-control", (event, action, ...args) => {
    if (!isTrustedSender(event) || !win) return;
    switch(action) {
        case "minimize":
            win.minimize();
            break;
        case "toggleDevTools":
            win.webContents.toggleDevTools();
            break;
        case "setFullScreen":
            win.setFullScreen(!!args[0]);
            break;
        case "unmaximize":
            win.unmaximize();
            break;
        case "setSize":
            if (Number.isFinite(args[0]) && Number.isFinite(args[1])) {
                win.setSize(Math.max(320, Math.round(args[0])), Math.max(240, Math.round(args[1])));
            }
            break;
        default:
            break;
    }
});

ipc.on("edex:window-sync", (event, action) => {
    if (!isTrustedSender(event) || !win) {
        event.returnValue = null;
        return;
    }
    switch(action) {
        case "isFullScreen":
            event.returnValue = win.isFullScreen();
            break;
        case "isMaximized":
            event.returnValue = win.isMaximized();
            break;
        case "getSize":
            event.returnValue = win.getSize();
            break;
        default:
            event.returnValue = null;
            break;
    }
});

ipc.on("edex:screen-sync", (event, action) => {
    if (!isTrustedSender(event)) {
        event.returnValue = [];
        return;
    }
    event.returnValue = action === "getAllDisplays" ? screen.getAllDisplays() : [];
});

ipc.on("edex:global-shortcut-register", (event, id, accelerator) => {
    if (!isTrustedSender(event) || typeof id !== "string" || typeof accelerator !== "string") return;
    globalShortcut.register(accelerator, () => {
        if (!event.sender.isDestroyed()) {
            event.sender.send("edex:global-shortcut", id);
        }
    });
});

ipc.on("edex:global-shortcut-unregister-all", event => {
    if (!isTrustedSender(event)) return;
    globalShortcut.unregisterAll();
});

const devBackend = registerDevBackend({
    app,
    ipc,
    shell,
    getWindow: () => win,
    settingsFile,
    isTrustedSender,
    signale
});

// Unset proxy env variables to avoid connection problems on the internal websockets
// See #222
if (process.env.http_proxy) delete process.env.http_proxy;
if (process.env.https_proxy) delete process.env.https_proxy;

// Bypass GPU acceleration blocklist, trading a bit of stability for a great deal of performance, mostly on Linux
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-video-decode");

// Fix userData folder not setup on Windows
try {
    fs.mkdirSync(electron.app.getPath("userData"));
    signale.info(`Created config dir at ${electron.app.getPath("userData")}`);
} catch(e) {
    signale.info(`Base config dir is ${electron.app.getPath("userData")}`);
}
// Create default settings file
if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, "", 4));
    signale.info(`Default settings written to ${settingsFile}`);
} else {
    const currentSettings = readSettingsFile();
    const beforeMerge = JSON.stringify(currentSettings);
    const mergedSettings = mergeSettingsDefaults(currentSettings, defaultSettings);
    if (beforeMerge !== JSON.stringify(mergedSettings)) {
        fs.writeFileSync(settingsFile, JSON.stringify(mergedSettings, "", 4));
        signale.info(`Settings defaults merged into ${settingsFile}`);
    }
}
// Create default shortcuts file
if (!fs.existsSync(shortcutsFile)) {
    fs.writeFileSync(shortcutsFile, JSON.stringify([
        { type: "app", trigger: "Ctrl+Shift+C", action: "COPY", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+V", action: "PASTE", enabled: true },
        { type: "app", trigger: "Ctrl+Tab", action: "NEXT_TAB", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+Tab", action: "PREVIOUS_TAB", enabled: true },
        { type: "app", trigger: "Ctrl+X", action: "TAB_X", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+S", action: "SETTINGS", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+K", action: "SHORTCUTS", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+W", action: "TOGGLE_WIDGETS", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+A", action: "AI_COMMAND_CENTER", enabled: false },
        { type: "app", trigger: "Ctrl+Shift+F", action: "FUZZY_SEARCH", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+L", action: "FS_LIST_VIEW", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+H", action: "FS_DOTFILES", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+P", action: "KB_PASSMODE", enabled: true },
        { type: "app", trigger: "Ctrl+Shift+I", action: "DEV_DEBUG", enabled: false },
        { type: "app", trigger: "Ctrl+Shift+F5", action: "DEV_RELOAD", enabled: true },
        { type: "shell", trigger: "Ctrl+Shift+Alt+Space", action: "neofetch", linebreak: true, enabled: false }
    ], "", 4));
    signale.info(`Default keymap written to ${shortcutsFile}`);
}
//Create default window state file
if(!fs.existsSync(lastWindowStateFile)) {
    fs.writeFileSync(lastWindowStateFile, JSON.stringify({
        useFullscreen: true
    }, "", 4));
    signale.info(`Default last window state written to ${lastWindowStateFile}`);
}

// Copy default themes & keyboard layouts & fonts
signale.pending("Mirroring internal assets...");
try {
    fs.mkdirSync(themesDir);
} catch(e) {
    // Folder already exists
}
fs.readdirSync(innerThemesDir).forEach(e => {
    fs.writeFileSync(path.join(themesDir, e), fs.readFileSync(path.join(innerThemesDir, e), {encoding:"utf-8"}));
});
try {
    fs.mkdirSync(kblayoutsDir);
} catch(e) {
    // Folder already exists
}
fs.readdirSync(innerKblayoutsDir).forEach(e => {
    fs.writeFileSync(path.join(kblayoutsDir, e), fs.readFileSync(path.join(innerKblayoutsDir, e), {encoding:"utf-8"}));
});
try {
    fs.mkdirSync(fontsDir);
} catch(e) {
    // Folder already exists
}
fs.readdirSync(innerFontsDir).forEach(e => {
    fs.writeFileSync(path.join(fontsDir, e), fs.readFileSync(path.join(innerFontsDir, e)));
});

// Version history logging
const versionHistoryPath = path.join(electron.app.getPath("userData"), "versions_log.json");
var versionHistory = fs.existsSync(versionHistoryPath) ? require(versionHistoryPath) : {};
var version = app.getVersion();
if (typeof versionHistory[version] === "undefined") {
	versionHistory[version] = {
		firstSeen: Date.now(),
		lastSeen: Date.now()
	};
} else {
	versionHistory[version].lastSeen = Date.now();
}
fs.writeFileSync(versionHistoryPath, JSON.stringify(versionHistory, 0, 2), {encoding:"utf-8"});

function createWindow(settings) {
    signale.info("Creating window...");

    let display;
    if (!isNaN(settings.monitor)) {
        display = screen.getAllDisplays()[settings.monitor] || screen.getPrimaryDisplay();
    } else {
        display = screen.getPrimaryDisplay();
    }
    let {x, y, width, height} = display.bounds;
    width++; height++;
    win = new BrowserWindow({
        title: "eDEX Revival",
        x,
        y,
        width,
        height,
        show: false,
        resizable: true,
        movable: settings.allowWindowed || false,
        fullscreen: settings.forceFullscreen || false,
        autoHideMenuBar: true,
        frame: settings.allowWindowed || false,
        backgroundColor: '#000000',
        webPreferences: {
            devTools: true,
            preload: path.join(__dirname, "preload.js"),
            sandbox: false,
            contextIsolation: true,
            backgroundThrottling: false,
            webSecurity: true,
            nodeIntegration: false,
            nodeIntegrationInSubFrames: false,
            allowRunningInsecureContent: false,
            experimentalFeatures: settings.experimentalFeatures || false
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'ui.html'),
        protocol: 'file:',
        slashes: true
    }));

    signale.complete("Frontend window created!");
    win.on("resize", () => {
        if (!win.webContents.isDestroyed()) win.webContents.send("edex:window-event", "resize");
    });
    win.on("leave-full-screen", () => {
        if (!win.webContents.isDestroyed()) win.webContents.send("edex:window-event", "leave-full-screen");
    });
    win.show();
    if (!settings.allowWindowed) {
        win.setResizable(false);
    } else if (!require(lastWindowStateFile)["useFullscreen"]) {
        win.setFullScreen(false);
    }

    signale.watch("Waiting for frontend connection...");
}

async function resolveShellPath(shellName) {
    const mod = await import("which");
    const fn = mod.which || mod.default || mod;
    return fn(shellName);
}

async function resolveShellPathWithFallback(shellName) {
    try {
        return await resolveShellPath(shellName);
    } catch(error) {
        const fallbackNames = process.platform === "win32"
            ? ["powershell.exe", "cmd.exe"]
            : [process.env.SHELL, "bash", "sh"];
        const candidates = fallbackNames.filter((item, index, list) => item && item !== shellName && list.indexOf(item) === index);

        for (const candidate of candidates) {
            try {
                const resolved = await resolveShellPath(candidate);
                recordStartupRecovery(`Shell "${shellName}" could not be resolved. Falling back to "${candidate}".`);
                return resolved;
            } catch(e) {}
        }

        throw error;
    }
}

async function loadShellEnv(shellPath) {
    const mod = await import("shell-env");
    const fn = mod.shellEnv || mod.default || mod;
    return fn(shellPath);
}

function parseEnvOverrides(value) {
    if (!value) return {};
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    const raw = String(value || "").trim();
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch(e) {}

    return raw.split(/\r?\n|;/).reduce((env, line) => {
        const index = line.indexOf("=");
        if (index > 0) {
            const key = line.slice(0, index).trim();
            if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) env[key] = line.slice(index + 1).trim();
        }
        return env;
    }, {});
}

app.on('ready', async () => {
    signale.pending(`Loading settings file...`);
    let settings = readSettingsFile();
    devBackend.setStartup(settings.launchOnStartup);
    signale.pending(`Resolving shell path...`);
    settings.shell = await resolveShellPathWithFallback(settings.shell).catch(e => { throw(e) });
    signale.info(`Shell found at ${settings.shell}`);
    signale.success(`Settings loaded!`);

    if (!require("fs").existsSync(settings.cwd)) {
        const fallbackCwd = electron.app.getPath("userData");
        recordStartupRecovery(`Configured cwd "${settings.cwd}" does not exist. Falling back to "${fallbackCwd}".`);
        settings.cwd = fallbackCwd;
    }

    // See #366
    let cleanEnv = await loadShellEnv(settings.shell).catch(e => { throw e; });

    Object.assign(cleanEnv, {
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        TERM_PROGRAM: "eDEX Revival",
        TERM_PROGRAM_VERSION: app.getVersion()
    }, parseEnvOverrides(settings.env));

    signale.pending(`Creating new terminal process on port ${settings.port || '3000'}`);
    tty = new Terminal({
        role: "server",
        ipc,
        shell: settings.shell,
        params: settings.shellArgs || '',
        cwd: settings.cwd,
        env: cleanEnv,
        showStartupBanner: !(settings.terminal && settings.terminal.showStartupBanner === false),
        appVersion: app.getVersion(),
        port: settings.port || 3000
    });
    signale.success(`Terminal back-end initialized!`);
    tty.onclosed = (code, signal) => {
        tty.ondisconnected = () => {};
        signale.complete("Terminal exited", code, signal);
        app.quit();
    };
    tty.onopened = () => {
        signale.success("Connected to frontend!");
        signale.timeEnd("Startup");
    };
    tty.onresized = (cols, rows) => {
        signale.info("Resized TTY to ", cols, rows);
    };
    tty.ondisconnected = () => {
        signale.error("Lost connection to frontend");
        signale.watch("Waiting for frontend connection...");
    };

    // Support for multithreaded systeminformation calls
    signale.pending("Starting multithreaded calls controller...");
    require("./_multithread.js");

    createWindow(settings);

    // Support for more terminals, used for creating tabs (currently limited to 4 extra terms)
    extraTtys = {};
    let basePort = settings.port || 3000;
    basePort = Number(basePort) + 2;

    for (let i = 0; i < 4; i++) {
        extraTtys[basePort+i] = null;
    }

    ipc.on("ttyspawn", (e, arg) => {
        if (!isTrustedSender(e)) return;
        const spawnOptions = arg && typeof arg === "object" ? arg : {};
        const initialCommand = typeof spawnOptions.initialCommand === "string" && spawnOptions.initialCommand.length < 4096
            ? spawnOptions.initialCommand
            : null;
        let port = null;
        Object.keys(extraTtys).forEach(key => {
            if (extraTtys[key] === null && port === null) {
                extraTtys[key] = {};
                port = key;
            }
        });

        if (port === null) {
            signale.error("TTY spawn denied (Reason: exceeded max TTYs number)");
            e.sender.send("ttyspawn-reply", "ERROR: max number of ttys reached");
        } else {
            signale.pending(`Creating new TTY process on port ${port}`);
            let term = new Terminal({
                role: "server",
                ipc,
                shell: settings.shell,
                params: settings.shellArgs || '',
                cwd: tty.tty._cwd || settings.cwd,
                env: cleanEnv,
                port: port
            });
            signale.success(`New terminal back-end initialized at ${port}`);
            term.onclosed = (code, signal) => {
                term.ondisconnected = () => {};
                term.wss.close();
                signale.complete(`TTY exited at ${port}`, code, signal);
                extraTtys[term.port] = null;
                term = null;
            };
            term.onopened = pid => {
                signale.success(`TTY ${port} connected to frontend (process PID ${pid})`);
                if (initialCommand) {
                    setTimeout(() => {
                        try {
                            term.tty.write(initialCommand+"\r");
                        } catch(error) {
                            signale.error(`Unable to write initial command to TTY ${port}: ${error.message}`);
                        }
                    }, 150);
                }
            };
            term.onresized = () => {};
            term.ondisconnected = () => {
                term.onclosed = () => {};
                term.close();
                term.wss.close();
                extraTtys[term.port] = null;
                term = null;
            };

            extraTtys[port] = term;
            e.sender.send("ttyspawn-reply", "SUCCESS: "+port);
        }
    });

    // Backend support for theme and keyboard hotswitch
    let themeOverride = null;
    let kbOverride = null;
    ipc.on("getThemeOverride", (e, arg) => {
        if (!isTrustedSender(e)) return;
        e.sender.send("getThemeOverride", themeOverride);
    });
    ipc.on("getKbOverride", (e, arg) => {
        if (!isTrustedSender(e)) return;
        e.sender.send("getKbOverride", kbOverride);
    });
    ipc.on("setThemeOverride", (e, arg) => {
        if (!isTrustedSender(e)) return;
        themeOverride = typeof arg === "string" ? arg : null;
    });
    ipc.on("setKbOverride", (e, arg) => {
        if (!isTrustedSender(e)) return;
        kbOverride = typeof arg === "string" ? arg : null;
    });
});

app.on('web-contents-created', (e, contents) => {
    // Prevent creating more than one window
    contents.setWindowOpenHandler(({url}) => {
        if (isSafeExternalURL(url)) {
            shell.openExternal(url);
        }
        return {action: "deny"};
    });

    // Prevent loading something else than the UI
    contents.on('will-navigate', (event, targetURL) => {
        if (targetURL !== contents.getURL()) event.preventDefault();
    });
});

app.on('window-all-closed', () => {
    signale.info("All windows closed");
    app.quit();
});

app.on('before-quit', () => {
    globalShortcut.unregisterAll();
    if (tty) tty.close();
    Object.keys(extraTtys || {}).forEach(key => {
        if (extraTtys[key] !== null) {
            extraTtys[key].close();
        }
    });
    signale.complete("Shutting down...");
});

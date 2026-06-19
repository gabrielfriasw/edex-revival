// Disable eval()
window.global = window;
window.eval = window.global.eval = function () {
    throw new Error("eval() is disabled for security reasons.");
};
// Security helper :)
window._escapeHtml = text => {
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => {return map[m];});
};
window._encodePathURI = uri => {
    return encodeURI(uri).replace(/#/g, "%23");
};
window._purifyCSS = str => {
    if (typeof str === "undefined") return "";
    if (typeof str !== "string") {
        str = str.toString();
    }
    return str.replace(/[<]/g, "");
};
window._delay = ms => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
};

// Initiate basic error handling
window.onerror = (msg, path, line, col, error) => {
    document.getElementById("boot_screen").innerHTML += `${error} :  ${msg}<br/>==> at ${path}  ${line}:${col}`;
};

const path = require("path");
const fs = require("fs");
const ipc = edex.ipc;

window.edexDebugLog = (scope, message, detail) => {
    const prefix = `[${String(scope || "debug")}] ${String(message || "")}`;
    const suffix = detail && typeof detail === "object"
        ? " "+JSON.stringify(detail)
        : (detail ? " "+String(detail) : "");
    const line = prefix + suffix;
    try {
        console.info(line);
    } catch(e) {}
    try {
        ipc.send("log", "info", line);
    } catch(e) {}
};

const settingsDir = edex.paths.userData;
const themesDir = edex.paths.themes;
const keyboardsDir = edex.paths.keyboards;
const fontsDir = edex.paths.fonts;
const settingsFile = edex.paths.settings;
const shortcutsFile = edex.paths.shortcuts;
const lastWindowStateFile = edex.paths.lastWindowState;

// Load config
window.settings = require(settingsFile);
window.shortcuts = require(shortcutsFile);
window.lastWindowState = require(lastWindowStateFile);
window.recoveryWarnings = Array.isArray(edex.recoveryWarnings) ? edex.recoveryWarnings.slice() : [];
window.displayParams = new URLSearchParams(window.location.search || "");
window.edexWindowRole = edex.windowRole || window.displayParams.get("display") || "primary";
window.isSecondaryDisplay = window.edexWindowRole === "secondary";
window.secondaryDisplayContent = window.displayParams.get("content") || "spotify";
window.secondaryDisplayOrientation = window.displayParams.get("orientation") || "auto";

window.revivalLayoutPresets = () => ({
    classic: {
        label: "Classic",
        theme: null,
        widgets: {
            visible: true,
            keyboard: true,
            systemPanel: true,
            networkPanel: true,
            globe: true,
            globeMode: "full",
            showIp: true,
            showInterface: true,
            showGeo: true
        },
        devExplorer: {mode: "dock", defaultView: "list", showPreview: true},
        editor: {defaultOpenBehavior: "smart"},
        launcherRail: {enabled: true, compact: false, labels: true, autoHide: true}
    },
    minimal: {
        label: "Minimal",
        theme: "revival-cyan-contrast",
        widgets: {
            visible: true,
            keyboard: false,
            systemPanel: false,
            networkPanel: false,
            globe: false,
            globeMode: "hidden"
        },
        devExplorer: {mode: "dock", defaultView: "list", showPreview: false},
        editor: {defaultOpenBehavior: "smart"},
        launcherRail: {enabled: true, compact: true, labels: false, autoHide: true}
    },
    developer: {
        label: "Developer",
        theme: "revival-cyan-contrast",
        widgets: {
            visible: true,
            keyboard: false,
            systemPanel: true,
            networkPanel: true,
            globe: true,
            globeMode: "reduced"
        },
        devExplorer: {mode: "window", defaultView: "list", showPreview: true},
        editor: {defaultOpenBehavior: "smart"},
        launcherRail: {enabled: true, compact: false, labels: true, autoHide: true}
    },
    privacy: {
        label: "Privacy",
        theme: "revival-high-contrast",
        widgets: {
            visible: true,
            keyboard: true,
            systemPanel: true,
            networkPanel: true,
            globe: true,
            globeMode: "offline",
            showIp: false,
            showInterface: false,
            showGeo: false
        },
        devExplorer: {mode: "dock", defaultView: "list", showPreview: true},
        editor: {defaultOpenBehavior: "smart"},
        launcherRail: {enabled: true, compact: false, labels: true, autoHide: true}
    },
    cinematic: {
        label: "Cinematic",
        theme: "revival-classic-cinematic",
        widgets: {
            visible: true,
            keyboard: true,
            systemPanel: true,
            networkPanel: true,
            globe: true,
            globeMode: "full",
            showIp: true,
            showInterface: true,
            showGeo: true
        },
        devExplorer: {mode: "dock", defaultView: "list", showPreview: true},
        editor: {defaultOpenBehavior: "smart"},
        launcherRail: {enabled: true, compact: false, labels: true, autoHide: true}
    }
});

window.defaultLauncherRailSettings = () => ({
    enabled: true,
    position: "top",
    compact: false,
    labels: true,
    autoHide: true
});

window.defaultUpdateSettings = () => ({
    enabled: true,
    checkOnStartup: true,
    autoDownload: true,
    installOnQuit: true
});

window.defaultAiSettings = () => ({
    enabled: false,
    provider: "auto",
    defaultProvider: "auto",
    contextBytes: 60000,
    redactSecrets: true,
    commands: {
        codex: "codex",
        claude: "claude"
    }
});

window.defaultSpotifySettings = () => ({
    enabled: false,
    clientId: "",
    callbackPort: 43879,
    pollIntervalMs: 5000,
    market: "",
    showAlbumArt: true,
    showDevices: true
});

window.normalizeSpotifySettings = spotify => {
    const defaults = window.defaultSpotifySettings();
    const source = spotify && typeof spotify === "object" && !Array.isArray(spotify) ? spotify : {};
    const next = Object.assign({}, defaults, source);
    next.enabled = next.enabled === true;
    next.clientId = String(next.clientId || "").trim();
    if (!/^[A-Za-z0-9_-]{0,128}$/.test(next.clientId)) next.clientId = "";
    next.callbackPort = Number.isInteger(Number(next.callbackPort)) ? Math.max(1024, Math.min(65535, Number(next.callbackPort))) : defaults.callbackPort;
    next.pollIntervalMs = Number.isInteger(Number(next.pollIntervalMs)) ? Math.max(2500, Math.min(30000, Number(next.pollIntervalMs))) : defaults.pollIntervalMs;
    next.market = String(next.market || "").trim().toUpperCase();
    if (next.market && !/^[A-Z]{2}$/.test(next.market)) next.market = "";
    next.showAlbumArt = next.showAlbumArt !== false;
    next.showDevices = next.showDevices !== false;
    return next;
};

window.defaultDualMonitorSettings = () => ({
    enabled: false,
    display: "auto",
    content: "spotify",
    orientation: "auto",
    fullscreen: true
});

window.normalizeDualMonitorSettings = dualMonitor => {
    const defaults = window.defaultDualMonitorSettings();
    const source = dualMonitor && typeof dualMonitor === "object" && !Array.isArray(dualMonitor) ? dualMonitor : {};
    const display = source.display === "auto" ? "auto" : Number(source.display);
    return {
        enabled: source.enabled === true,
        display: display === "auto" || (Number.isInteger(display) && display >= 0) ? display : defaults.display,
        content: ["spotify", "widgets", "terminal", "blank"].includes(source.content) ? source.content : defaults.content,
        orientation: ["auto", "landscape", "portrait"].includes(source.orientation) ? source.orientation : defaults.orientation,
        fullscreen: source.fullscreen !== false
    };
};

window.defaultPerformanceSettings = () => ({
    profile: "cinematic",
    systemInfoWorkers: 2,
    maxSystemInfoWorkers: 2,
    systemInfoWorkerIdleMs: 30000,
    systemInfoWorkerScaleDelayMs: 750,
    pauseHiddenWidgets: false,
    pauseWhenWindowBlurred: false,
    enableGlobeByDefault: true,
    enableTerminalWebGL: true,
    enableTerminalLigatures: true,
    enableFeedbackAudio: true,
    enableCinematicAudio: true,
    lazyAudio: false,
    disableBackgroundThrottling: true,
    enableErrorLens: "ai-only"
});

window.performanceProfileTimings = profile => {
    const profiles = {
        balanced: {
            cpuLoadInterval: 1500,
            cpuTempInterval: 5000,
            cpuSpeedInterval: 5000,
            cpuTasksInterval: 5000,
            toplistInterval: 5000,
            processListInterval: 2500,
            memoryInterval: 3000,
            batteryInterval: 15000,
            networkStatusInterval: 2000,
            networkTrafficInterval: 2000,
            globeLocationInterval: 5000,
            globeConnectionsInterval: 5000,
            cpuChartFPS: 12,
            networkChartFPS: 12,
            globeFPS: 18,
            filesystemWatcherDebounce: 1000,
            terminalAnalysisDebounce: 150
        },
        max: {
            cpuLoadInterval: 3000,
            cpuTempInterval: 10000,
            cpuSpeedInterval: 10000,
            cpuTasksInterval: 10000,
            toplistInterval: 10000,
            processListInterval: 5000,
            memoryInterval: 6000,
            batteryInterval: 30000,
            networkStatusInterval: 5000,
            networkTrafficInterval: 5000,
            globeLocationInterval: 15000,
            globeConnectionsInterval: 15000,
            cpuChartFPS: 6,
            networkChartFPS: 6,
            globeFPS: 0,
            filesystemWatcherDebounce: 1500,
            terminalAnalysisDebounce: 250
        },
        cinematic: {
            cpuLoadInterval: 1000,
            cpuTempInterval: 5000,
            cpuSpeedInterval: 5000,
            cpuTasksInterval: 5000,
            toplistInterval: 5000,
            processListInterval: 2000,
            memoryInterval: 2500,
            batteryInterval: 15000,
            networkStatusInterval: 2000,
            networkTrafficInterval: 1500,
            globeLocationInterval: 3000,
            globeConnectionsInterval: 3000,
            cpuChartFPS: 24,
            networkChartFPS: 24,
            globeFPS: 30,
            filesystemWatcherDebounce: 800,
            terminalAnalysisDebounce: 120
        }
    };
    return Object.assign({}, profiles.balanced, profiles[profile] || {});
};

window.normalizePerformanceSettings = performance => {
    const defaults = window.defaultPerformanceSettings();
    const source = performance && typeof performance === "object" && !Array.isArray(performance) ? performance : {};
    const next = Object.assign({}, defaults, source);
    if (!["balanced", "max", "cinematic"].includes(next.profile)) next.profile = "balanced";
    next.systemInfoWorkers = Number.isInteger(Number(next.systemInfoWorkers)) ? Math.max(1, Math.min(4, Number(next.systemInfoWorkers))) : defaults.systemInfoWorkers;
    next.maxSystemInfoWorkers = Number.isInteger(Number(next.maxSystemInfoWorkers)) ? Math.max(next.systemInfoWorkers, Math.min(4, Number(next.maxSystemInfoWorkers))) : defaults.maxSystemInfoWorkers;
    next.systemInfoWorkerIdleMs = Number.isInteger(Number(next.systemInfoWorkerIdleMs)) ? Math.max(5000, Math.min(300000, Number(next.systemInfoWorkerIdleMs))) : defaults.systemInfoWorkerIdleMs;
    next.systemInfoWorkerScaleDelayMs = Number.isInteger(Number(next.systemInfoWorkerScaleDelayMs)) ? Math.max(100, Math.min(60000, Number(next.systemInfoWorkerScaleDelayMs))) : defaults.systemInfoWorkerScaleDelayMs;
    if (next.profile !== "cinematic") {
        const minimumScaleDelayMs = next.profile === "max" ? 15000 : defaults.systemInfoWorkerScaleDelayMs;
        next.systemInfoWorkerScaleDelayMs = Math.max(minimumScaleDelayMs, next.systemInfoWorkerScaleDelayMs);
    }
    next.pauseHiddenWidgets = next.pauseHiddenWidgets !== false;
    next.pauseWhenWindowBlurred = next.pauseWhenWindowBlurred !== false;
    next.enableGlobeByDefault = next.enableGlobeByDefault !== false;
    next.enableTerminalWebGL = next.enableTerminalWebGL !== false;
    next.enableTerminalLigatures = next.enableTerminalLigatures === true;
    next.enableFeedbackAudio = next.enableFeedbackAudio === true;
    next.enableCinematicAudio = next.profile === "cinematic"
        ? next.enableCinematicAudio !== false
        : next.enableCinematicAudio === true;
    next.lazyAudio = next.lazyAudio === true;
    next.disableBackgroundThrottling = next.disableBackgroundThrottling !== false;
    if (!["off", "ai-only", "always"].includes(next.enableErrorLens)) next.enableErrorLens = "ai-only";
    if (next.profile === "max") {
        next.enableGlobeByDefault = false;
        next.enableFeedbackAudio = false;
        next.enableCinematicAudio = false;
        next.lazyAudio = true;
        next.disableBackgroundThrottling = false;
    }
    return next;
};

window.performanceSettings = () => {
    window.settings.performance = window.normalizePerformanceSettings(window.settings.performance);
    return window.settings.performance;
};

window.performanceTiming = () => window.performanceProfileTimings(window.performanceSettings().profile);

window.shouldCaptureTerminalErrorLens = () => {
    const perf = window.performanceSettings();
    if (perf.enableErrorLens === "off") return false;
    if (perf.enableErrorLens === "always") return true;
    if (window.settings && window.settings.ai && window.settings.ai.enabled === true) return true;
    return Number(window.terminalDiagnosticsActiveUntil || 0) > Date.now();
};

window.normalizeAiSettings = ai => {
    const defaults = window.defaultAiSettings();
    const source = ai && typeof ai === "object" && !Array.isArray(ai) ? ai : {};
    const next = Object.assign({}, defaults, source);
    next.enabled = next.enabled === true;
    const validProviders = ["auto", "codex", "claude"];
    next.provider = validProviders.includes(next.provider) ? next.provider : (validProviders.includes(next.defaultProvider) ? next.defaultProvider : "auto");
    next.defaultProvider = validProviders.includes(next.defaultProvider) ? next.defaultProvider : next.provider;
    if (next.defaultProvider === "auto" && next.provider !== "auto") next.defaultProvider = next.provider;
    next.contextBytes = Number(next.contextBytes) || defaults.contextBytes;
    next.redactSecrets = next.redactSecrets !== false;
    next.commands = Object.assign({}, defaults.commands, source.commands || {});
    next.commands.codex = String(next.commands.codex || "codex");
    next.commands.claude = String(next.commands.claude || "claude");
    delete next.ollama;
    return next;
};

window.normalizeUpdateSettings = updates => {
    const defaults = window.defaultUpdateSettings();
    const source = updates && typeof updates === "object" && !Array.isArray(updates) ? updates : {};
    return {
        enabled: source.enabled !== false,
        checkOnStartup: source.checkOnStartup !== false,
        autoDownload: source.autoDownload !== false,
        installOnQuit: source.installOnQuit !== false
    };
};

window.normalizeRevivalSettings = () => {
    const validPresets = Object.keys(window.revivalLayoutPresets());
    if (!validPresets.includes(window.settings.layoutPreset)) window.settings.layoutPreset = "classic";
    window.settings.launcherRail = Object.assign(window.defaultLauncherRailSettings(), window.settings.launcherRail || {});
    if (window.settings.launcherRail.position !== "top") window.settings.launcherRail.position = "top";
    window.settings.launcherRail.autoHide = true;
    if (!window.settings.terminal || typeof window.settings.terminal !== "object" || Array.isArray(window.settings.terminal)) {
        window.settings.terminal = {};
    }
    if (typeof window.settings.terminal.showStartupBanner === "undefined") {
        window.settings.terminal.showStartupBanner = true;
    }
    if (!window.settings.widgets) window.settings.widgets = {};
    if (!["full", "reduced", "offline", "hidden"].includes(window.settings.widgets.globeMode)) window.settings.widgets.globeMode = "full";
    window.settings.performance = window.normalizePerformanceSettings(window.settings.performance);
    if (!window.settings.editor) window.settings.editor = {};
    if (!["smart", "editor", "preview", "external", "ask"].includes(window.settings.editor.defaultOpenBehavior)) {
        window.settings.editor.defaultOpenBehavior = "smart";
    }
    if (!window.settings.plugins) window.settings.plugins = {enabled: true, paths: [], disabled: [], errors: {}, permissions: {}};
    if (!window.settings.plugins.errors) window.settings.plugins.errors = {};
    window.settings.updates = window.normalizeUpdateSettings(window.settings.updates);
    window.settings.ai = window.normalizeAiSettings(window.settings.ai);
    window.settings.spotify = window.normalizeSpotifySettings(window.settings.spotify);
    window.settings.dualMonitor = window.normalizeDualMonitorSettings(window.settings.dualMonitor);
    window.settings.ssh = window.normalizeSshSettings(window.settings.ssh);
    return window.settings;
};

window.normalizeSshSettings = ssh => {
    const next = Object.assign({profiles: [], lastProfileId: ""}, ssh || {});
    if (!Array.isArray(next.profiles)) next.profiles = [];
    const number = (value, fallback, min, max) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.max(min, Math.min(max, Math.round(parsed)));
    };
    const enumValue = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
    next.profiles = next.profiles.map((profile, index) => ({
        id: String(profile && profile.id || `ssh-${index + 1}`),
        name: String(profile && profile.name || ""),
        host: String(profile && profile.host || ""),
        user: String(profile && profile.user || ""),
        port: number(profile && profile.port, 22, 1, 65535),
        keyPath: String(profile && profile.keyPath || ""),
        remoteCwd: String(profile && profile.remoteCwd || ""),
        extraArgs: String(profile && profile.extraArgs || ""),
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
    })).filter(profile => profile.host || profile.name || profile.user || profile.keyPath);
    if (!next.profiles.some(profile => profile.id === next.lastProfileId)) next.lastProfileId = next.profiles[0] ? next.profiles[0].id : "";
    return next;
};
window.normalizeRevivalSettings();

window.renderTerminalStartupBanner = targetTerm => {
    if (!targetTerm || !targetTerm.term) return;
    const terminalSettings = window.settings.terminal || {};
    const version = typeof edex !== "undefined" && edex.app ? edex.app.getVersion() : "1.0.0";
    const electronVersion = typeof edex !== "undefined" && edex.versions ? edex.versions.electron : "";
    const term = targetTerm.term;
    const cols = Number(term.cols) || 80;
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const dim = "\x1b[2m";
    const red = "\x1b[31m";
    const cyan = "\x1b[36m";
    const magenta = "\x1b[35m";
    const white = "\x1b[37m";
    const accent = window.settings.layoutPreset === "cinematic" || window.settings.theme === "revival-amber-contrast" ? red : cyan;
    const shadow = window.settings.theme === "revival-amber-contrast" ? magenta : "\x1b[34m";
    const padLine = line => {
        if (cols < 74) return line;
        return "  "+line;
    };
    const writeLines = lines => {
        lines.forEach(line => term.writeln(line));
    };

    if (terminalSettings.showStartupBanner === false || cols < 58) {
        const compactMeta = cols < 50 || !electronVersion ? `v${version}` : `v${version} - Electron v${electronVersion}`;
        term.writeln(`${bold}${accent}eDEX Revival${reset} ${dim}${compactMeta}${reset}`);
        return;
    }

    writeLines([
        "",
        padLine(`${shadow}███████╗██████╗ ███████╗██╗  ██╗${reset}`),
        padLine(`${accent}██╔════╝██╔══██╗██╔════╝╚██╗██╔╝${reset}`),
        padLine(`${accent}█████╗  ██║  ██║█████╗   ╚███╔╝${reset}`),
        padLine(`${accent}██╔══╝  ██║  ██║██╔══╝   ██╔██╗${reset}`),
        padLine(`${accent}███████╗██████╔╝███████╗██╔╝ ██╗${reset}`),
        padLine(`${accent}╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝${reset}`),
        padLine(`${white}              ██████╗ ███████╗██╗   ██╗██╗██╗   ██╗ █████╗ ██╗     ${reset}`),
        padLine(`${white}              ██╔══██╗██╔════╝██║   ██║██║██║   ██║██╔══██╗██║     ${reset}`),
        padLine(`${white}              ██████╔╝█████╗  ██║   ██║██║██║   ██║███████║██║     ${reset}`),
        padLine(`${white}              ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║╚██╗ ██╔╝██╔══██║██║     ${reset}`),
        padLine(`${white}              ██║  ██║███████╗ ╚████╔╝ ██║ ╚████╔╝ ██║  ██║███████╗${reset}`),
        padLine(`${white}              ╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝${reset}`),
        padLine(`${dim}${accent}              terminal // cockpit // ssh // v${version}${electronVersion ? ` // electron ${electronVersion}` : ""}${reset}`),
        ""
    ]);
};

window.persistSettingsNow = () => {
    window.normalizeRevivalSettings();
    fs.writeFileSync(settingsFile, JSON.stringify(window.settings, "", 4));
    return true;
};

window.addRecoveryWarning = message => {
    const text = String(message || "Recovery action applied.");
    window.recoveryWarnings.push(text);
    const bootScreen = document.getElementById("boot_screen");
    if (bootScreen) bootScreen.innerHTML += `[recovery] ${window._escapeHtml(text)}<br/>`;
    try {
        ipc.send("log", "warn", text);
    } catch(e) {}
};

window.loadThemeByName = themeName => {
    const requested = String(themeName || window.settings.theme || "tron");
    const candidates = [requested, "tron"]
        .concat(fs.readdirSync(themesDir).filter(file => file.endsWith(".json")).map(file => file.replace(".json", "")))
        .filter((item, index, list) => item && list.indexOf(item) === index);

    let lastError = null;
    for (const candidate of candidates) {
        try {
            const theme = require(path.join(themesDir, candidate+".json"));
            if (candidate !== requested) {
                window.addRecoveryWarning(`Theme "${requested}" could not be loaded. Falling back to "${candidate}".`);
            }
            window.settings.theme = candidate;
            window._loadTheme(theme);
            return true;
        } catch(error) {
            lastError = error;
        }
    }

    throw lastError || new Error("No usable theme could be loaded.");
};

window.resolveKeyboardLayout = layoutName => {
    const requested = String(layoutName || window.settings.keyboard || "en-US");
    const candidates = [requested, "en-US"]
        .concat(fs.readdirSync(keyboardsDir).filter(file => file.endsWith(".json")).map(file => file.replace(".json", "")))
        .filter((item, index, list) => item && list.indexOf(item) === index);

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(keyboardsDir, candidate+".json"))) {
            if (candidate !== requested) {
                window.addRecoveryWarning(`Keyboard layout "${requested}" is missing. Falling back to "${candidate}".`);
            }
            window.settings.keyboard = candidate;
            return candidate;
        }
    }

    throw new Error("No usable keyboard layout could be found.");
};

window.showRecoveryWarnings = () => {
    if (!window.recoveryWarnings || !window.recoveryWarnings.length || window.recoveryWarningsShown) return;
    window.recoveryWarningsShown = true;
    new Modal({
        type: "warning",
        title: "Configuration Recovery",
        message: window.recoveryWarnings.map(item => window._escapeHtml(item)).join("<br>")
    });
};

// Load CLI parameters
if (edex.app.argv.includes("--nointro")) {
    window.settings.nointroOverride = true;
} else {
    window.settings.nointroOverride = false;
}
if (edex.app.argv.includes("--nocursor")) {
    window.settings.nocursorOverride = true;
} else {
    window.settings.nocursorOverride = false;
}

// Load UI theme
window._loadTheme = theme => {

    if (document.querySelector("style.theming")) {
        document.querySelector("style.theming").remove();
    }

    // Load fonts
    let mainFont = new FontFace(theme.cssvars.font_main, `url("${path.join(fontsDir, theme.cssvars.font_main.toLowerCase().replace(/ /g, '_')+'.woff2').replace(/\\/g, '/')}")`);
    let lightFont = new FontFace(theme.cssvars.font_main_light, `url("${path.join(fontsDir, theme.cssvars.font_main_light.toLowerCase().replace(/ /g, '_')+'.woff2').replace(/\\/g, '/')}")`);
    let termFont = new FontFace(theme.terminal.fontFamily, `url("${path.join(fontsDir, theme.terminal.fontFamily.toLowerCase().replace(/ /g, '_')+'.woff2').replace(/\\/g, '/')}")`);

    document.fonts.add(mainFont);
    document.fonts.load("12px "+theme.cssvars.font_main);
    document.fonts.add(lightFont);
    document.fonts.load("12px "+theme.cssvars.font_main_light);
    document.fonts.add(termFont);
    document.fonts.load("12px "+theme.terminal.fontFamily);

    document.querySelector("head").innerHTML += `<style class="theming">
    :root {
        --font_main: "${window._purifyCSS(theme.cssvars.font_main)}";
        --font_main_light: "${window._purifyCSS(theme.cssvars.font_main_light)}";
        --font_mono: "${window._purifyCSS(theme.terminal.fontFamily)}";
        --color_r: ${window._purifyCSS(theme.colors.r)};
        --color_g: ${window._purifyCSS(theme.colors.g)};
        --color_b: ${window._purifyCSS(theme.colors.b)};
        --color_black: ${window._purifyCSS(theme.colors.black)};
        --color_light_black: ${window._purifyCSS(theme.colors.light_black)};
        --color_grey: ${window._purifyCSS(theme.colors.grey)};

        /* Used for error and warning modals */
        --color_red: ${window._purifyCSS(theme.colors.red) || "red"};
        --color_yellow: ${window._purifyCSS(theme.colors.yellow) || "yellow"};
    }

    body {
        font-family: var(--font_main), sans-serif;
        cursor: ${(window.settings.nocursorOverride || window.settings.nocursor) ? "none" : "default"} !important;
    }

    * {
   	   ${(window.settings.nocursorOverride || window.settings.nocursor) ? "cursor: none !important;" : ""}
	}

    ${window._purifyCSS(theme.injectCSS || "")}
    </style>`;

    window.theme = theme;
    window.theme.r = theme.colors.r;
    window.theme.g = theme.colors.g;
    window.theme.b = theme.colors.b;
};

// Retrieve theme override (hotswitch)
ipc.once("getThemeOverride", (e, theme) => {
    if (theme !== null) {
        window.settings.nointroOverride = true;
        window.loadThemeByName(theme);
    } else {
        window.loadThemeByName(window.settings.theme);
    }
});
ipc.send("getThemeOverride");
// Same for keyboard override/hotswitch
ipc.once("getKbOverride", (e, layout) => {
    if (layout !== null) {
        window.resolveKeyboardLayout(layout);
        window.settings.nointroOverride = true;
    } else {
        window.resolveKeyboardLayout(window.settings.keyboard);
    }
});
ipc.send("getKbOverride");

function initGraphicalErrorHandling() {
    window.edexErrorsModals = [];
    window.onerror = (msg, path, line, col, error) => {
        let errorModal = new Modal({
            type: "error",
            title: error,
            message: `${msg}<br/>        at ${path}  ${line}:${col}`
        });
        window.edexErrorsModals.push(errorModal);

        ipc.send("log", "error", `${error}: ${msg}`);
        ipc.send("log", "debug", `at ${path} ${line}:${col}`);
    };
}

function waitForFonts() {
    return new Promise(resolve => {
        if (document.readyState !== "complete" || document.fonts.status !== "loaded") {
            document.addEventListener("readystatechange", () => {
                if (document.readyState === "complete") {
                    if (document.fonts.status === "loaded") {
                        resolve();
                    } else {
                        document.fonts.onloadingdone = () => {
                            if (document.fonts.status === "loaded") resolve();
                        };
                    }
                }
            });
        } else {
            resolve();
        }
    });
}

// A proxy function used to add multithreading to systeminformation calls - see backend process manager @ _multithread.js
function initSystemInformationProxy() {
    const { nanoid } = require("nanoid/non-secure");

    window.si = new Proxy({}, {
        apply: () => {throw new Error("Cannot use sysinfo proxy directly as a function")},
        set: () => {throw new Error("Cannot set a property on the sysinfo proxy")},
        get: (target, prop, receiver) => {
            return function(...args) {
                let callback = (typeof args[args.length - 1] === "function") ? true : false;
                let sendArgs = callback ? args.slice(0, -1) : args;

                return new Promise((resolve, reject) => {
                    let id = nanoid();
                    ipc.once("systeminformation-reply-"+id, (e, res) => {
                        if (callback) {
                            args[args.length - 1](res);
                        }
                        resolve(res);
                    });
                    ipc.send("systeminformation-call", prop, id, ...sendArgs);
                });
            };
        }
    });
}

// Init audio
window.audioManager = new AudioManager();

// See #223
if (!window.isSecondaryDisplay) edex.app.focus();

let i = 0;
if (window.settings.nointro || window.settings.nointroOverride) {
    initGraphicalErrorHandling();
    initSystemInformationProxy();
    document.getElementById("boot_screen").remove();
    document.body.setAttribute("class", "");
    waitForFonts().then(window.isSecondaryDisplay ? initSecondaryDisplayUI : initUI);
} else {
    displayLine();
}

// Startup boot log
function displayLine() {
    let bootScreen = document.getElementById("boot_screen");
    let log = fs.readFileSync(path.join(__dirname, "assets", "misc", "boot_log.txt")).toString().split('\n');

    function isArchUser() {
        return edex.isArchUser();
    }

    if (typeof log[i] === "undefined") {
        setTimeout(displayTitleScreen, 300);
        return;
    }

    if (log[i] === "Boot Complete") {
        window.audioManager.granted.play();
    } else {
        window.audioManager.stdout.play();
    }
    bootScreen.innerHTML += log[i]+"<br/>";
    i++;

    switch(true) {
        case i === 2:
            bootScreen.innerHTML += `eDEX Revival Kernel version ${edex.app.getVersion()} boot at ${Date().toString()}; root:xnu-1699.22.73~1/RELEASE_X86_64`;
        case i === 4:
            setTimeout(displayLine, 500);
            break;
        case i > 4 && i < 25:
            setTimeout(displayLine, 30);
            break;
        case i === 25:
            setTimeout(displayLine, 400);
            break;
        case i === 42:
            setTimeout(displayLine, 300);
            break;
        case i > 42 && i < 82:
            setTimeout(displayLine, 25);
            break;
        case i === 83:
            if (isArchUser())
                bootScreen.innerHTML += "btw i use arch<br/>";
            setTimeout(displayLine, 25);
            break;
        case i >= log.length-2 && i < log.length:
            setTimeout(displayLine, 300);
            break;
        default:
            setTimeout(displayLine, Math.pow(1 - (i/1000), 3)*25);
    }
}

// Show "logo" and background grid
async function displayTitleScreen() {
    let bootScreen = document.getElementById("boot_screen");
    if (bootScreen === null) {
        bootScreen = document.createElement("section");
        bootScreen.setAttribute("id", "boot_screen");
        bootScreen.setAttribute("style", "z-index: 9999999");
        document.body.appendChild(bootScreen);
    }
    bootScreen.innerHTML = "";
    window.audioManager.theme.play();

    await _delay(400);

    document.body.setAttribute("class", "");
    bootScreen.setAttribute("class", "center");
    bootScreen.innerHTML = "<h1>eDEX Revival</h1>";
    let title = document.querySelector("section > h1");

    await _delay(200);

    document.body.setAttribute("class", "solidBackground");

    await _delay(100);

    title.setAttribute("style", `background-color: rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});border-bottom: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(300);

    title.setAttribute("style", `border: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(100);

    title.setAttribute("style", "");
    title.setAttribute("class", "glitch");

    await _delay(500);

    document.body.setAttribute("class", "");
    title.setAttribute("class", "");
    title.setAttribute("style", `border: 5px solid rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b});`);

    await _delay(1000);
    if (window.term) {
        bootScreen.remove();
        return true;
    }
    initGraphicalErrorHandling();
    initSystemInformationProxy();
    waitForFonts().then(() => {
        bootScreen.remove();
        if (window.isSecondaryDisplay) initSecondaryDisplayUI();
        else initUI();
    });
}

// Returns the user's desired display name
async function getDisplayName() {
    let user = settings.username || null;
    if (user)
        return user;

    try {
        user = await edex.username();
    } catch (e) {}

    return user;
}

window.revivalIcon = (name, label) => {
    const icons = (typeof DEVFS_ICON_PATHS !== "undefined") ? DEVFS_ICON_PATHS : {};
    const pathData = icons[name] || icons.layout || '<path d="M4 4h16v16H4z"/>';
    return `<svg class="edex_ui_icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${pathData}</svg><span>${window._escapeHtml(label || name)}</span>`;
};

window.layoutPresetOptions = current => Object.keys(window.revivalLayoutPresets()).map(key => (
    `<option value="${key}" ${key === current ? "selected" : ""}>${window.revivalLayoutPresets()[key].label}</option>`
)).join("");

window.applyLayoutPresetToSettings = (presetName, opts = {}) => {
    const presets = window.revivalLayoutPresets();
    const preset = presets[presetName] || presets.classic;
    const name = presets[presetName] ? presetName : "classic";

    window.settings.layoutPreset = name;
    window.settings.widgets = Object.assign(window.defaultWidgetSettings ? window.defaultWidgetSettings() : {}, window.settings.widgets || {}, preset.widgets || {});
    window.settings.devExplorer = Object.assign({}, window.settings.devExplorer || {}, preset.devExplorer || {});
    window.settings.editor = Object.assign({}, window.settings.editor || {}, preset.editor || {});
    window.settings.launcherRail = Object.assign(window.defaultLauncherRailSettings(), window.settings.launcherRail || {}, preset.launcherRail || {});
    if (preset.theme && fs.existsSync(path.join(themesDir, preset.theme+".json"))) window.settings.theme = preset.theme;

    window.applyLayoutPresetClasses();
    if (typeof window.applyWidgetVisibility === "function") window.applyWidgetVisibility();
    if (window.fsDisp && window.fsDisp.setSurfaceMode && preset.devExplorer && preset.devExplorer.mode) {
        window.fsDisp.setSurfaceMode(preset.devExplorer.mode);
    }
    if (opts.persist) fs.writeFileSync(settingsFile, JSON.stringify(window.settings, "", 4));
    return name;
};

window.applyLayoutPresetClasses = () => {
    if (!document.body) return;
    const preset = window.settings.layoutPreset || "classic";
    const rail = Object.assign(window.defaultLauncherRailSettings(), window.settings.launcherRail || {});
    document.body.dataset.layoutPreset = preset;
    document.body.classList.toggle("launcher-rail-enabled", rail.enabled !== false);
    document.body.classList.toggle("launcher-rail-compact", rail.compact === true);
    document.body.classList.toggle("launcher-rail-labels", rail.labels === true);
    document.body.classList.toggle("launcher-rail-autohide", true);
    document.body.classList.toggle("launcher-rail-right", rail.position === "right");
    document.body.classList.toggle("launcher-header-enabled", rail.enabled !== false);
};

window.secondaryDisplayMode = () => {
    const settings = window.normalizeDualMonitorSettings(window.settings.dualMonitor);
    const content = ["spotify", "widgets", "terminal", "blank"].includes(window.secondaryDisplayContent)
        ? window.secondaryDisplayContent
        : settings.content;
    const orientation = ["auto", "landscape", "portrait"].includes(window.secondaryDisplayOrientation)
        ? window.secondaryDisplayOrientation
        : settings.orientation;
    return {
        content,
        orientation: orientation === "auto"
            ? (window.innerHeight > window.innerWidth ? "portrait" : "landscape")
            : orientation
    };
};

window.renderSecondaryDisplayFrame = mode => {
    document.body.classList.add("secondary-display");
    document.body.dataset.secondaryContent = mode.content;
    document.body.dataset.secondaryOrientation = mode.orientation;
    document.body.innerHTML = `<main id="secondary_display_shell" data-secondary-content="${mode.content}">
        <header id="secondary_display_header">
            <strong>eDEX SECONDARY</strong>
            <span>${window._escapeHtml(mode.content.toUpperCase())} // ${window._escapeHtml(mode.orientation.toUpperCase())}</span>
        </header>
        <section id="secondary_display_stage"></section>
    </main>`;
};

window.initSecondarySpotify = () => {
    const stage = document.getElementById("secondary_display_stage");
    if (!stage) return false;
    stage.classList.add("secondary_spotify_stage");
    window.mods = {};
    const baseShouldStart = window.shouldStartWidgetInitially;
    window.shouldStartWidgetInitially = key => key === "spotify"
        ? !window.areWidgetTimersPaused()
        : (typeof baseShouldStart === "function" ? baseShouldStart(key) : false);
    window.mods.spotify = new SpotifyPlayer("secondary_display_stage");
    window.mods.spotify.fullscreen = true;
    window.mods.spotify.refreshNodes();
    window.mods.spotify.start();
    return true;
};

window.initSecondaryWidgets = () => {
    const shell = document.getElementById("secondary_display_shell");
    if (!shell) return false;
    shell.classList.add("secondary_widgets_shell");
    shell.innerHTML = `<section class="mod_column activated" id="mod_column_left">
        <h3 class="title"><p>PANEL</p><p>SYSTEM</p></h3>
    </section>
    <section class="mod_column activated" id="mod_column_right">
        <h3 class="title"><p>PANEL</p><p>NETWORK</p></h3>
    </section>`;

    window.mods = {};
    window.mods.clock = new Clock("mod_column_left");
    window.mods.sysinfo = new Sysinfo("mod_column_left");
    window.mods.hardwareInspector = new HardwareInspector("mod_column_left");
    window.mods.cpuinfo = new Cpuinfo("mod_column_left");
    window.mods.ramwatcher = new RAMwatcher("mod_column_left");
    window.mods.toplist = new Toplist("mod_column_left");
    window.mods.netstat = new Netstat("mod_column_right");
    window.mods.globe = new LocationGlobe("mod_column_right");
    window.mods.conninfo = new Conninfo("mod_column_right");
    window.mods.spotify = new SpotifyPlayer("mod_column_right");
    window.applyWidgetVisibility();
    document.querySelectorAll(".mod_column > div").forEach(element => {
        element.setAttribute("style", "animation-play-state: running;");
    });
    return true;
};

window.initSecondaryTerminal = () => {
    const stage = document.getElementById("secondary_display_stage");
    if (!stage) return false;
    stage.classList.add("secondary_terminal_stage");
    stage.innerHTML = `<section id="secondary_terminal_shell" augmented-ui="bl-clip tr-clip exe">
        <h3 class="title"><p>TERMINAL</p><p>SECONDARY</p></h3>
        <div id="secondary_terminal_status">ALLOCATING TTY</div>
        <pre id="secondary_terminal"></pre>
    </section>`;

    const status = document.getElementById("secondary_terminal_status");
    window.term = {};
    window.currentTerm = 0;
    ipc.send("ttyspawn", {source: "secondary-display"});
    ipc.once("ttyspawn-reply", (event, reply) => {
        const message = String(reply || "");
        if (!message.startsWith("SUCCESS:")) {
            if (status) status.textContent = message || "Unable to allocate terminal";
            return;
        }
        const port = Number(message.split(":").pop().trim());
        if (!Number.isInteger(port)) {
            if (status) status.textContent = "Invalid terminal port";
            return;
        }
        if (status) status.textContent = `TTY ${port}`;
        window.term[0] = new Terminal({
            role: "client",
            parentId: "secondary_terminal",
            port
        });
        window.term[0].onprocesschange = processName => {
            if (status) status.textContent = processName ? `TTY ${port} // ${processName}` : `TTY ${port}`;
        };
        window.term[0].onclose = () => {
            if (status) status.textContent = "TERMINAL DISCONNECTED";
        };
    });
    return true;
};

window.initSecondaryBlank = () => {
    const stage = document.getElementById("secondary_display_stage");
    if (!stage) return false;
    stage.innerHTML = `<section id="secondary_blank_panel">
        <strong>SECONDARY DISPLAY READY</strong>
        <span>Choose Spotify, widgets, or terminal in Settings Center.</span>
    </section>`;
    return true;
};

async function initSecondaryDisplayUI() {
    window.applyLayoutPresetClasses();
    const mode = window.secondaryDisplayMode();
    window.renderSecondaryDisplayFrame(mode);
    window.audioManager.expand.play();
    if (mode.content === "widgets") return window.initSecondaryWidgets();
    if (mode.content === "terminal") return window.initSecondaryTerminal();
    if (mode.content === "blank") return window.initSecondaryBlank();
    return window.initSecondarySpotify();
}

window.pendingLauncherAction = "";
window.devCockpitReady = false;
window.devCockpitInitError = "";

window.devActionOrDefer = (action, fnName) => {
    window.edexDebugLog("launcher", "developer action requested", {
        action,
        fnName,
        available: typeof window[fnName] === "function",
        cockpitReady: window.devCockpitReady,
        cockpitError: !!window.devCockpitInitError
    });
    if (typeof window[fnName] === "function") return window[fnName]();
    if (window.devCockpitInitError) {
        if (typeof Modal !== "undefined") {
            new Modal({type: "warning", title: "Developer Cockpit", message: window._escapeHtml(window.devCockpitInitError)});
        }
        return false;
    }
    if (window.devCockpitReady) {
        if (typeof Modal !== "undefined") {
            new Modal({type: "warning", title: "Developer Cockpit", message: "Developer action is unavailable."});
        }
        return false;
    }
    window.pendingLauncherAction = action;
    return false;
};

window.flushPendingLauncherAction = () => {
    const action = window.pendingLauncherAction;
    if (!action) return false;
    window.pendingLauncherAction = "";
    window.edexDebugLog("launcher", "flushing pending action", {action});
    return window.openLauncherAction(action);
};

window.openLauncherAction = action => {
    try {
        window.edexDebugLog("launcher", "action clicked", {action});
        switch(action) {
            case "settings":
                return window.openSettings && window.openSettings();
            case "widgets":
                return window.openWidgetVisibility && window.openWidgetVisibility();
            case "explorer":
                if (window.fsDisp && window.fsDisp.setSurfaceMode) return window.fsDisp.setSurfaceMode("window");
                window.pendingLauncherAction = action;
                return false;
            case "diagnostics":
                return window.devActionOrDefer(action, "openDevDiagnostics");
            case "editor":
                return window.devActionOrDefer(action, "openDevEditor");
            case "ssh":
                return window.devActionOrDefer(action, "openDevSshClient");
            case "errorfix":
                return window.devActionOrDefer(action, "openErrorToFixFlow");
            case "network":
                return window.devActionOrDefer(action, "openDevNetworkLens");
            default:
                return false;
        }
    } catch(error) {
        console.error(`Launcher action "${action}" failed`, error);
        window.edexDebugLog("launcher", "action failed", {action, error: error.message || String(error)});
        if (typeof Modal !== "undefined") {
            new Modal({type: "warning", title: "Launcher", message: window._escapeHtml(error.message || String(error))});
        }
        return false;
    }
};

window.renderLauncherRail = () => {
    const rail = Object.assign(window.defaultLauncherRailSettings(), window.settings.launcherRail || {});
    let existing = document.getElementById("edex_launcher_header");
    const oldRail = document.getElementById("edex_launcher_rail");
    if (oldRail) oldRail.remove();
    if (rail.enabled === false) {
        if (existing) existing.remove();
        window.applyLayoutPresetClasses();
        return false;
    }
    const actions = [
        ["settings", "settings", "Settings"],
        ["widgets", "layout", "Widgets"],
        ["explorer", "folder", "Explorer"],
        ["diagnostics", "diagnostics", "Diagnostics"],
        ["editor", "edit", "Editor"],
        ["ssh", "terminal", "SSH"],
        ["network", "network", "Network Lens"]
    ];
    if (window.settings && window.settings.ai && window.settings.ai.enabled === true) {
        actions.splice(5, 0, ["errorfix", "diagnostics", "Fix"]);
    }
    if (!existing) {
        existing = document.createElement("nav");
        existing.id = "edex_launcher_header";
        existing.setAttribute("aria-label", "eDEX launcher");
        document.body.appendChild(existing);
    }
    existing.innerHTML = actions.map(([action, icon, label]) => `
        <button type="button" data-launcher-action="${action}" title="${label}" aria-label="${label}">
            ${window.revivalIcon(icon, label)}
        </button>`).join("");
    existing.style.setProperty("--launcher-action-count", String(actions.length));
    if (!window.launcherHeaderEventsBound) {
        window.launcherHeaderEventsBound = true;
        document.addEventListener("click", event => {
            const button = event.target && event.target.closest && event.target.closest("#edex_launcher_header button[data-launcher-action]");
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            window.openLauncherAction(button.dataset.launcherAction);
        }, true);
    }
    window.applyLayoutPresetClasses();
    return true;
};

// Create the UI's html structure and initialize the terminal client and the keyboard
async function initUI() {
    window.applyLayoutPresetClasses();
    document.body.innerHTML += `<section class="mod_column" id="mod_column_left">
        <h3 class="title"><p>PANEL</p><p>SYSTEM</p></h3>
    </section>
    <section id="main_shell" style="height:0%;width:0%;opacity:0;margin-bottom:30vh;" augmented-ui="bl-clip tr-clip exe">
        <h3 class="title" style="opacity:0;"><p>TERMINAL</p><p>MAIN SHELL</p></h3>
        <h1 id="main_shell_greeting"></h1>
    </section>
    <button id="edex_settings_launcher" type="button" title="Open eDEX settings" onclick="window.openSettings()">SETTINGS</button>
    <button id="edex_widgets_toggle" type="button" title="Configure visible widgets" onclick="window.openWidgetVisibility()">WIDGETS</button>
    <section class="mod_column" id="mod_column_right">
        <h3 class="title"><p>PANEL</p><p>NETWORK</p></h3>
    </section>`;

    await _delay(10);

    window.audioManager.expand.play();
    document.getElementById("main_shell").setAttribute("style", "height:0%;margin-bottom:30vh;");

    await _delay(500);

    document.getElementById("main_shell").setAttribute("style", "margin-bottom: 30vh;");
    document.querySelector("#main_shell > h3.title").setAttribute("style", "");

    await _delay(700);

    document.getElementById("main_shell").setAttribute("style", "opacity: 0;");
    document.body.innerHTML += `
    <section id="filesystem" style="width: 0px;" class="${window.settings.hideDotfiles ? "hideDotfiles" : ""} ${window.settings.fsListView ? "list-view" : ""}">
    </section>
    <section id="keyboard" style="opacity:0;">
    </section>`;
    window.keyboard = new Keyboard({
        layout: path.join(keyboardsDir, window.resolveKeyboardLayout(settings.keyboard)+".json"),
        container: "keyboard"
    });
    window.renderLauncherRail();
    window.applyWidgetVisibility();

    await _delay(10);

    document.getElementById("main_shell").setAttribute("style", "");

    await _delay(270);

    let greeter = document.getElementById("main_shell_greeting");

    getDisplayName().then(user => {
        if (user) {
            greeter.innerHTML += `eDEX Revival<br/><em>${user}</em>`;
        } else {
            greeter.innerHTML += "eDEX Revival";
        }
    });

    greeter.setAttribute("style", "opacity: 1;");

    document.getElementById("filesystem").setAttribute("style", "");
    document.getElementById("keyboard").setAttribute("style", "");
    if (window.areWidgetsVisible()) {
        document.getElementById("keyboard").setAttribute("class", "animation_state_1");
        window.audioManager.keyboard.play();
    }

    await _delay(100);

    if (window.areWidgetsVisible()) document.getElementById("keyboard").setAttribute("class", "animation_state_1 animation_state_2");

    await _delay(1000);

    greeter.setAttribute("style", "opacity: 0;");

    await _delay(100);

    document.getElementById("keyboard").setAttribute("class", "");

    await _delay(400);

    greeter.remove();

    // Initialize modules
    window.mods = {};
    try {
        window.edexDebugLog("dev-cockpit", "initializing");
        window.devCockpit = new DevCockpit();
        window.devCockpitReady = true;
        window.edexDebugLog("dev-cockpit", "ready");
        window.flushPendingLauncherAction();
    } catch(error) {
        window.devCockpitInitError = error.message || String(error);
        console.error("Unable to initialize Developer Cockpit", error);
        window.edexDebugLog("dev-cockpit", "init failed", {error: window.devCockpitInitError});
    }

    // Left column
    window.mods.clock = new Clock("mod_column_left");
    window.mods.sysinfo = new Sysinfo("mod_column_left");
    window.mods.hardwareInspector = new HardwareInspector("mod_column_left");
    window.mods.cpuinfo = new Cpuinfo("mod_column_left");
    window.mods.ramwatcher = new RAMwatcher("mod_column_left");
    window.mods.toplist = new Toplist("mod_column_left");

    // Right column
    window.mods.netstat = new Netstat("mod_column_right");
    window.mods.globe = new LocationGlobe("mod_column_right");
    window.mods.conninfo = new Conninfo("mod_column_right");
    window.mods.spotify = new SpotifyPlayer("mod_column_right");
    window.applyWidgetVisibility();

    // Fade-in animations
    document.querySelectorAll(".mod_column").forEach(e => {
        e.setAttribute("class", "mod_column activated");
    });
    let i = 0;
    let left = document.querySelectorAll("#mod_column_left > div");
    let right = document.querySelectorAll("#mod_column_right > div");
    let x = setInterval(() => {
        if (!left[i] && !right[i]) {
            clearInterval(x);
        } else {
            window.audioManager.panels.play();
            if (left[i]) {
                left[i].setAttribute("style", "animation-play-state: running;");
            }
            if (right[i]) {
                right[i].setAttribute("style", "animation-play-state: running;");
            }
            i++;
        }
    }, 500);

    await _delay(100);

    // Initialize the terminal
    let shellContainer = document.getElementById("main_shell");
    shellContainer.innerHTML += `
        <ul id="main_shell_tabs">
            <li id="shell_tab0" onclick="window.focusShellTab(0);" class="active"><p>MAIN SHELL</p></li>
            <li id="shell_tab1" onclick="window.focusShellTab(1);"><p>EMPTY</p></li>
            <li id="shell_tab2" onclick="window.focusShellTab(2);"><p>EMPTY</p></li>
            <li id="shell_tab3" onclick="window.focusShellTab(3);"><p>EMPTY</p></li>
            <li id="shell_tab4" onclick="window.focusShellTab(4);"><p>EMPTY</p></li>
        </ul>
        <div id="main_shell_innercontainer">
            <pre id="terminal0" class="active"></pre>
            <pre id="terminal1"></pre>
            <pre id="terminal2"></pre>
            <pre id="terminal3"></pre>
            <pre id="terminal4"></pre>
        </div>`;
    window.term = {
        0: new Terminal({
            role: "client",
            parentId: "terminal0",
            port: window.settings.port || 3000
        })
    };
    window.currentTerm = 0;
    window.term[0].onprocesschange = p => {
        document.getElementById("shell_tab0").innerHTML = `<p>MAIN - ${p}</p>`;
    };
    // Prevent losing hardware keyboard focus on the terminal when using touch keyboard
    window.onmouseup = e => {
        const target = e && e.target;
        if (target && target.closest && target.closest("input, textarea, select, button, [contenteditable='true'], .dev_window, .modal_popup, #filesystem, #edex_settings_launcher, #edex_widgets_toggle, #edex_launcher_header")) return;
        if (window.keyboard.linkedToTerm) window.term[window.currentTerm].term.focus();
    };

    await _delay(100);

    if (!window.settings.devExplorer || window.settings.devExplorer.enabled !== false) {
        window.fsDisp = new DevFileBrowser({
            parentId: "filesystem"
        });
    } else {
        window.fsDisp = new FilesystemDisplay({
            parentId: "filesystem"
        });
    }

    await _delay(200);

    document.getElementById("filesystem").setAttribute("style", "opacity: 1;");

    // Resend terminal CWD to fsDisp if we're hot reloading
    if (window.performance.navigation.type === 1) {
        window.term[window.currentTerm].resendCWD();
    }

    await _delay(200);

    window.updateCheck = new UpdateChecker();
    window.applyWidgetVisibility();
    setTimeout(window.showRecoveryWarnings, 500);
}

window.themeChanger = theme => {
    ipc.send("setThemeOverride", theme);
    setTimeout(() => {
        window.location.reload(true);
    }, 100);
};

window.widgetCatalog = () => ({
    clock: {
        label: "Clock",
        description: "Large digital clock.",
        element: "mod_clock",
        module: "clock",
        defaultColumn: "left"
    },
    sysinfo: {
        label: "System status",
        description: "Date, uptime and power state.",
        element: "mod_sysinfo",
        module: "sysinfo",
        defaultColumn: "left"
    },
    hardware: {
        label: "Hardware identity",
        description: "Manufacturer/model/chassis block.",
        element: "mod_hardwareInspector",
        module: "hardwareInspector",
        defaultColumn: "left"
    },
    cpu: {
        label: "CPU graphs",
        description: "CPU usage, speed and tasks.",
        element: "mod_cpuinfo",
        module: "cpuinfo",
        defaultColumn: "left"
    },
    memory: {
        label: "Memory graph",
        description: "RAM and swap widget.",
        element: "mod_ramwatcher",
        module: "ramwatcher",
        defaultColumn: "left"
    },
    processes: {
        label: "Top processes",
        description: "Process list widget.",
        element: "mod_toplist",
        module: "toplist",
        defaultColumn: "left"
    },
    spotify: {
        label: "Spotify player",
        description: "Spotify Connect now-playing and controls.",
        element: "mod_spotify",
        module: "spotify",
        defaultColumn: "right"
    },
    networkStatus: {
        label: "Network status",
        description: "Online state and ping block.",
        element: "mod_netstat",
        module: "netstat",
        defaultColumn: "right"
    },
    globe: {
        label: "World view",
        description: "Network globe and endpoint map.",
        element: "mod_globe",
        module: "globe",
        defaultColumn: "right"
    },
    networkTraffic: {
        label: "Traffic graph",
        description: "Upload/download graph.",
        element: "mod_conninfo",
        module: "conninfo",
        defaultColumn: "right"
    }
});

window.defaultWidgetLayout = () => ({
    left: Object.keys(window.widgetCatalog()).filter(key => window.widgetCatalog()[key].defaultColumn === "left"),
    right: Object.keys(window.widgetCatalog()).filter(key => window.widgetCatalog()[key].defaultColumn === "right")
});

window.normalizeWidgetLayout = layout => {
    const catalog = window.widgetCatalog();
    const defaults = window.defaultWidgetLayout();
    const source = layout && typeof layout === "object" && !Array.isArray(layout) ? layout : defaults;
    const clean = {left: [], right: []};
    const seen = new Set();
    ["left", "right"].forEach(column => {
        (Array.isArray(source[column]) ? source[column] : defaults[column]).forEach(key => {
            if (catalog[key] && !seen.has(key)) {
                clean[column].push(key);
                seen.add(key);
            }
        });
    });
    Object.keys(catalog).forEach(key => {
        if (seen.has(key)) return;
        clean[catalog[key].defaultColumn === "left" ? "left" : "right"].push(key);
    });
    return clean;
};

window.widgetColumnForKey = key => {
    const layout = window.normalizeWidgetSettings().layout;
    return layout.left.includes(key) ? "left" : "right";
};

window.defaultWidgetSettings = () => ({
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
    spotify: false,
    networkStatus: true,
    networkTraffic: true,
    globe: true,
    globeMode: "full",
    showIp: true,
    showInterface: true,
    showGeo: true,
    layout: window.defaultWidgetLayout()
});

window.normalizeWidgetSettings = () => {
    window.settings.widgets = Object.assign(window.defaultWidgetSettings(), window.settings.widgets || {});
    window.settings.widgets.layout = window.normalizeWidgetLayout(window.settings.widgets.layout);
    if (!["full", "reduced", "offline", "hidden"].includes(window.settings.widgets.globeMode)) {
        window.settings.widgets.globeMode = "full";
    }
    return window.settings.widgets;
};

window.areWidgetsVisible = () => window.normalizeWidgetSettings().visible !== false;

window.isSpotifyRoutedToSecondary = () => {
    if (window.isSecondaryDisplay) return false;
    const dualMonitor = window.normalizeDualMonitorSettings(window.settings.dualMonitor || {});
    const widgets = window.settings && window.settings.widgets || {};
    const routed = dualMonitor.content === "spotify" || (dualMonitor.content === "widgets" && widgets.spotify !== false);
    if (!dualMonitor.enabled || !routed) return false;
    try {
        return edex.screen.getAllDisplays().length > 1;
    } catch(e) {
        return true;
    }
};

window.isWidgetSuppressedOnPrimary = key => key === "spotify" && window.isSpotifyRoutedToSecondary();

window.isWidgetVisible = key => {
    const widgets = window.normalizeWidgetSettings();
    if (window.isWidgetSuppressedOnPrimary(key)) return false;
    return widgets.visible !== false && widgets[key] !== false && (!window.widgetCatalog()[key] || window.isWidgetColumnEnabled(key));
};

window.__edexWindowBlurred = false;
window.areWidgetTimersPaused = () => {
    const perf = window.performanceSettings();
    return perf.pauseWhenWindowBlurred !== false && (document.hidden || window.__edexWindowBlurred === true);
};

window.setWidgetRuntime = (key, shouldRun) => {
    const entry = window.widgetCatalog()[key];
    const mod = entry && window.mods && window.mods[entry.module];
    if (!mod) return false;
    if (shouldRun && typeof mod.start === "function") return mod.start();
    if (!shouldRun && typeof mod.stop === "function") return mod.stop();
    return false;
};

window.isWidgetColumnEnabled = key => {
    const widgets = window.normalizeWidgetSettings();
    const column = window.widgetColumnForKey(key);
    return column === "left" ? widgets.systemPanel !== false : widgets.networkPanel !== false;
};

window.shouldStartWidgetInitially = key => {
    const widgets = window.normalizeWidgetSettings();
    const visible = widgets.visible !== false;
    if (!window.widgetCatalog()[key]) return false;
    if (window.isWidgetSuppressedOnPrimary(key)) return false;
    if (key === "spotify") return visible && window.isWidgetColumnEnabled(key) && widgets.spotify !== false && !window.areWidgetTimersPaused();
    const perf = window.performanceSettings();
    if (perf.pauseHiddenWidgets === false) return true;
    if (key === "globe") return visible && window.isWidgetColumnEnabled(key) && widgets.globe !== false && widgets.globeMode !== "hidden" && perf.enableGlobeByDefault !== false && !window.areWidgetTimersPaused();
    return visible && window.isWidgetColumnEnabled(key) && widgets[key] !== false && !window.areWidgetTimersPaused();
};

window.syncWidgetLifecycles = states => {
    const perf = window.performanceSettings();
    if (perf.pauseHiddenWidgets === false) return false;
    const runtimePaused = window.areWidgetTimersPaused();
    Object.keys(states).forEach(key => {
        window.setWidgetRuntime(key, states[key] && !runtimePaused);
    });
    return true;
};

window.collectWidgetRuntimeDiagnostics = () => {
    const widgets = {};
    const catalog = window.widgetCatalog();
    Object.keys(catalog).forEach(key => {
        const mod = window.mods && window.mods[catalog[key].module];
        widgets[key] = {
            constructed: !!mod,
            running: !!(mod && mod.running),
            timers: mod ? Object.keys(mod).filter(name => /Updater|Timer|Timeout|Frame|Interval/.test(name) && mod[name]) : []
        };
    });
    return {
        profile: window.performanceSettings().profile,
        pausedByWindowState: window.areWidgetTimersPaused(),
        widgets
    };
};

window.addEventListener("blur", () => {
    window.__edexWindowBlurred = true;
    if (typeof window.applyWidgetVisibility === "function") window.applyWidgetVisibility();
});
window.addEventListener("focus", () => {
    window.__edexWindowBlurred = false;
    if (typeof window.applyWidgetVisibility === "function") window.applyWidgetVisibility();
});
document.addEventListener("visibilitychange", () => {
    if (typeof window.applyWidgetVisibility === "function") window.applyWidgetVisibility();
});

window.fitCurrentTerminal = () => {
    setTimeout(() => {
        try {
            if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
        } catch(e) {}
    }, 350);
};

window.applyWidgetOrder = () => {
    const widgets = window.normalizeWidgetSettings();
    const layout = widgets.layout;
    const catalog = window.widgetCatalog();
    const columns = {
        left: document.getElementById("mod_column_left"),
        right: document.getElementById("mod_column_right")
    };
    ["left", "right"].forEach(column => {
        const target = columns[column];
        if (!target) return;
        layout[column].forEach(key => {
            const entry = catalog[key];
            const element = entry && document.getElementById(entry.element);
            if (element) target.appendChild(element);
        });
    });
    return true;
};

window.syncWidgetLayoutState = states => {
    const catalog = window.widgetCatalog();
    const columns = {
        left: document.getElementById("mod_column_left"),
        right: document.getElementById("mod_column_right")
    };
    const visibleByColumn = {left: [], right: []};

    Object.keys(catalog).forEach(key => {
        const entry = catalog[key];
        const element = document.getElementById(entry.element);
        if (!element) return;
        element.classList.remove("widget-fill", "widget-roomy", "widget-compact");
        if (states[key]) {
            const column = window.widgetColumnForKey(key);
            visibleByColumn[column].push({key, element});
        }
    });

    Object.keys(columns).forEach(column => {
        const target = columns[column];
        const items = visibleByColumn[column];
        if (!target) return;
        target.dataset.widgetCount = String(items.length);
        target.classList.toggle("widget-column-empty", items.length === 0);
        target.classList.toggle("widget-column-solo", items.length === 1);
        target.classList.toggle("widget-column-roomy", items.length === 2);
        target.classList.toggle("widget-column-dense", items.length >= 4);

        items.forEach(item => {
            const isSpotify = item.key === "spotify";
            item.element.classList.toggle("widget-fill", isSpotify && items.length === 1);
            item.element.classList.toggle("widget-roomy", isSpotify && items.length === 2);
            item.element.classList.toggle("widget-compact", items.length >= 4);
        });
    });
    return visibleByColumn;
};

window.applyWidgetVisibility = () => {
    const widgets = window.normalizeWidgetSettings();
    const perf = window.performanceSettings();
    const visible = widgets.visible !== false;
    const globeMode = widgets.globeMode || "full";
    const globeEnabled = perf.enableGlobeByDefault !== false;
    const catalog = window.widgetCatalog();
    const hidden = [];
    const setHidden = (selector, hide, key) => {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.toggle("widget-hidden", hide);
            element.hidden = hide;
        });
        if (hide && key) hidden.push(key);
    };

    window.applyWidgetOrder();
    setHidden("section#keyboard", !visible || widgets.keyboard === false, "keyboard");
    setHidden("section#mod_column_left", !visible || widgets.systemPanel === false, "systemPanel");
    setHidden("section#mod_column_right", !visible || widgets.networkPanel === false, "networkPanel");
    const states = {};
    Object.keys(catalog).forEach(key => {
        const entry = catalog[key];
        const columnEnabled = window.isWidgetColumnEnabled(key);
        const extraHidden = key === "globe" ? (globeMode === "hidden" || !globeEnabled) : false;
        const routedHidden = window.isWidgetSuppressedOnPrimary(key);
        const hide = !visible || !columnEnabled || widgets[key] === false || extraHidden || routedHidden;
        setHidden(`#${entry.element}`, hide, key);
        states[key] = !hide;
    });
    window.syncWidgetLayoutState(states);
    window.syncWidgetLifecycles(states);
    if (window.mods && window.mods.spotify) {
        if (states.spotify && !window.areWidgetTimersPaused()) window.mods.spotify.start();
        else window.mods.spotify.stop();
    }

    document.body.classList.toggle("widgets-hidden", !visible);
    document.body.classList.toggle("widgets-keyboard-hidden", !visible || widgets.keyboard === false);
    document.body.classList.toggle("widgets-system-hidden", !visible || widgets.systemPanel === false);
    document.body.classList.toggle("widgets-network-hidden", !visible || widgets.networkPanel === false);
    document.body.classList.toggle("widgets-side-hidden", !visible || (widgets.systemPanel === false && widgets.networkPanel === false));
    document.body.classList.toggle("widgets-hide-ip", widgets.showIp === false);
    document.body.classList.toggle("widgets-hide-interface", widgets.showInterface === false);
    document.body.classList.toggle("widgets-hide-geo", widgets.showGeo === false);
    document.body.classList.toggle("widgets-spotify-routed", window.isSpotifyRoutedToSecondary());
    document.body.dataset.layoutPreset = window.settings.layoutPreset || "classic";
    document.body.dataset.globeMode = globeMode;

    const button = document.getElementById("edex_widgets_toggle");
    if (button) {
        const privacyHidden = ["showIp", "showInterface", "showGeo"].filter(key => widgets[key] === false).length;
        const hiddenCount = hidden.length + privacyHidden;
        button.textContent = hiddenCount ? `WIDGETS (${hiddenCount})` : "WIDGETS";
        button.title = "Configure visible widgets";
        button.classList.toggle("active", hiddenCount > 0);
    }
    window.renderSensitiveNetworkFields();
    window.fitCurrentTerminal();
};

window.isGlobeLiveMode = () => {
    const widgets = window.normalizeWidgetSettings();
    const perf = window.performanceSettings();
    return widgets.visible !== false
        && widgets.networkPanel !== false
        && widgets.globe !== false
        && perf.enableGlobeByDefault !== false
        && !["offline", "hidden"].includes(widgets.globeMode || "full");
};

window.isGlobeConnectionMode = () => window.isGlobeLiveMode() && window.normalizeWidgetSettings().globeMode !== "reduced";

window.shouldResolvePublicNetworkInfo = () => {
    const widgets = window.normalizeWidgetSettings();
    return widgets.showIp !== false && widgets.showGeo !== false && window.isGlobeLiveMode();
};

window.persistWidgetVisibility = () => {
    if (!window.settings.widgets) window.settings.widgets = {};
    fs.writeFileSync(settingsFile, JSON.stringify(window.settings, "", 4));
};

window.renderSensitiveNetworkFields = () => {
    const widgets = window.normalizeWidgetSettings();
    const ifaceTarget = document.getElementById("mod_netstat_iname");
    const geoTarget = document.querySelector("i.mod_globe_headerInfo");
    if (ifaceTarget) {
        if (widgets.showInterface === false) {
            ifaceTarget.textContent = "Interface: hidden";
        } else if (window.mods && window.mods.netstat && window.mods.netstat.iface) {
            ifaceTarget.textContent = "Interface: "+window.mods.netstat.iface;
        }
    }
    if (geoTarget) {
        if (widgets.showGeo === false) {
            geoTarget.textContent = "HIDDEN";
        } else if (window.mods && window.mods.globe && window.mods.globe.lastgeo && window.mods.globe.lastgeo.latitude) {
            geoTarget.textContent = `${window.mods.globe.lastgeo.latitude}, ${window.mods.globe.lastgeo.longitude}`;
        }
    }
};

window.toggleWidgets = () => {
    window.openWidgetVisibility();
    return true;
};

window.setWidgetModalState = visible => {
    document.querySelectorAll("#widgetVisibilityPanel input[type='checkbox'][data-widget-key]").forEach(input => {
        input.checked = visible;
    });
};

window.widgetModalLayout = () => ({
    left: Array.from(document.querySelectorAll("#widgetLayout-left [data-widget-item]")).map(item => item.dataset.widgetItem),
    right: Array.from(document.querySelectorAll("#widgetLayout-right [data-widget-item]")).map(item => item.dataset.widgetItem)
});

window.bindWidgetLayoutDnD = () => {
    const panel = document.getElementById("widgetVisibilityPanel");
    if (!panel) return false;
    let dragged = null;
    const findItem = key => Array.from(panel.querySelectorAll("[data-widget-item]")).find(item => item.dataset.widgetItem === key);
    panel.querySelectorAll("[data-widget-item]").forEach(item => {
        item.addEventListener("dragstart", event => {
            dragged = item;
            item.classList.add("dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.dataset.widgetItem);
        });
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            dragged = null;
        });
        item.addEventListener("dragover", event => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });
        item.addEventListener("drop", event => {
            event.preventDefault();
            const key = event.dataTransfer.getData("text/plain");
            const source = dragged || findItem(key);
            if (!source || source === item) return;
            item.parentElement.insertBefore(source, item);
        });
    });
    panel.querySelectorAll("[data-widget-list]").forEach(list => {
        list.addEventListener("dragover", event => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        });
        list.addEventListener("drop", event => {
            event.preventDefault();
            if (event.target.closest && event.target.closest("[data-widget-item]")) return;
            const key = event.dataTransfer.getData("text/plain");
            const source = dragged || findItem(key);
            if (source) list.appendChild(source);
        });
    });
    return true;
};

window.applyWidgetVisibilityFromModal = () => {
    const widgets = window.normalizeWidgetSettings();
    document.querySelectorAll("#widgetVisibilityPanel input[type='checkbox'][data-widget-key]").forEach(input => {
        widgets[input.dataset.widgetKey] = input.checked;
    });
    widgets.visible = document.getElementById("widgetToggle-visible").checked;
    const globeMode = document.getElementById("widgetToggle-globeMode");
    if (globeMode) widgets.globeMode = globeMode.value;
    widgets.layout = window.normalizeWidgetLayout(window.widgetModalLayout());
    window.applyWidgetVisibility();
    window.persistWidgetVisibility();
    const status = document.getElementById("widgetVisibilityStatus");
    if (status) status.textContent = "Saved at "+new Date().toTimeString();
    return true;
};

window.applySpotifySoloLayout = () => {
    const widgets = window.normalizeWidgetSettings();
    widgets.visible = true;
    widgets.networkPanel = true;
    widgets.spotify = true;
    widgets.networkStatus = false;
    widgets.globe = false;
    widgets.networkTraffic = false;
    widgets.layout = window.normalizeWidgetLayout(Object.assign({}, widgets.layout || {}, {
        right: ["spotify", "networkStatus", "globe", "networkTraffic"]
    }));
    window.applyWidgetVisibility();
    window.persistWidgetVisibility();
    const panel = document.getElementById("widgetVisibilityPanel");
    if (panel) {
        const visible = document.getElementById("widgetToggle-visible");
        if (visible) visible.checked = true;
        ["spotify", "networkPanel"].forEach(key => {
            panel.querySelectorAll(`input[data-widget-key='${key}']`).forEach(input => input.checked = true);
        });
        ["networkStatus", "globe", "networkTraffic"].forEach(key => {
            panel.querySelectorAll(`input[data-widget-key='${key}']`).forEach(input => input.checked = false);
        });
        const status = document.getElementById("widgetVisibilityStatus");
        if (status) status.textContent = "Spotify solo layout saved at "+new Date().toTimeString();
    }
    return true;
};

window.openWidgetVisibility = () => {
    if (document.getElementById("widgetVisibilityPanel")) return;
    const widgets = window.normalizeWidgetSettings();
    const catalog = window.widgetCatalog();
    const layout = widgets.layout;
    const row = (key, label, description) => `
        <label class="widget_visibility_row">
            <input type="checkbox" data-widget-key="${key}" ${widgets[key] !== false ? "checked" : ""}>
            <span><strong>${label}</strong><em>${description}</em></span>
        </label>`;
    const widgetItem = key => {
        const entry = catalog[key];
        if (!entry) return "";
        return `<div class="widget_layout_item" draggable="true" data-widget-item="${key}">
            <span class="widget_drag_handle" title="Drag to reorder">::</span>
            <label>
                <input type="checkbox" data-widget-key="${key}" ${widgets[key] !== false ? "checked" : ""}>
                <span><strong>${entry.label}</strong><em>${entry.description}</em></span>
            </label>
        </div>`;
    };

    new Modal({
        type: "custom",
        title: "Widget Visibility",
        html: `<div id="widgetVisibilityPanel" class="widget_visibility_panel">
            <div class="widget_visibility_intro">
                <label class="widget_visibility_master">
                    <input id="widgetToggle-visible" type="checkbox" ${widgets.visible !== false ? "checked" : ""}>
                    <span><strong>Widgets enabled</strong><em>Master switch for all decorative/monitoring widgets.</em></span>
                </label>
            </div>
            <div class="widget_visibility_grid">
                <section>
                    <h4>Layout Toggles</h4>
                    ${row("keyboard", "Keyboard", "On-screen keyboard at the bottom.")}
                    ${row("systemPanel", "Left panel", "Left widget column.")}
                    ${row("networkPanel", "Right panel", "Right widget column.")}
                </section>
                <section class="widget_layout_section">
                    <h4>Left Column</h4>
                    <div id="widgetLayout-left" class="widget_layout_list" data-widget-list="left">
                        ${layout.left.map(widgetItem).join("")}
                    </div>
                </section>
                <section class="widget_layout_section">
                    <h4>Right Column</h4>
                    <div id="widgetLayout-right" class="widget_layout_list" data-widget-list="right">
                        ${layout.right.map(widgetItem).join("")}
                    </div>
                    <label class="widget_visibility_row select_row">
                        <span><strong>World view mode</strong><em>Full, reduced, offline or hidden.</em></span>
                        <select id="widgetToggle-globeMode">
                            <option>${widgets.globeMode || "full"}</option>
                            <option>full</option>
                            <option>reduced</option>
                            <option>offline</option>
                            <option>hidden</option>
                        </select>
                    </label>
                </section>
                <section>
                    <h4>Privacy</h4>
                    ${row("showIp", "Allow public IP lookup", "Used only for live globe geolocation. Network Status never displays IP.")}
                    ${row("showInterface", "Show interface name", "Hide Wi-Fi/Ethernet adapter name.")}
                    ${row("showGeo", "Show location/coordinates", "Hide globe latitude/longitude text.")}
                </section>
            </div>
            <h6 id="widgetVisibilityStatus">Loaded current visibility settings</h6>
        </div>`,
        buttons: [
            {label: "Spotify Solo", action: "window.applySpotifySoloLayout();"},
            {label: "Show All", action: "window.setWidgetModalState(true);document.getElementById('widgetToggle-visible').checked=true;"},
            {label: "Hide All", action: "window.setWidgetModalState(false);document.getElementById('widgetToggle-visible').checked=false;"},
            {label: "Save", action: "window.applyWidgetVisibilityFromModal();"}
        ]
    });
    setTimeout(window.bindWidgetLayoutDnD, 0);
};

window.remakeKeyboard = layout => {
    document.getElementById("keyboard").innerHTML = "";
    window.keyboard = new Keyboard({
        layout: path.join(keyboardsDir, layout+".json" || settings.keyboard+".json"),
        container: "keyboard"
    });
    ipc.send("setKbOverride", layout);
};

window.shellTabLabel = (number, label) => {
    const close = number > 0 ? `<button type="button" class="shell_tab_close" title="Close terminal tab" aria-label="Close terminal tab" onclick="event.stopPropagation();window.closeShellTab(${number});">X</button>` : "";
    return `<p>${window._escapeHtml(String(label || ""))}</p>${close}`;
};

window.resetShellTab = (number, focusFallback) => {
    if (number <= 0 || !window.term) return false;
    const terminal = window.term[number];
    try {
        if (terminal && terminal.term && !terminal.term._isDisposed) terminal.term.dispose();
    } catch(e) {}
    delete window.term[number];
    const tab = document.getElementById("shell_tab"+number);
    const pane = document.getElementById("terminal"+number);
    if (tab) {
        tab.setAttribute("class", "");
        tab.innerHTML = window.shellTabLabel(number, "EMPTY");
    }
    if (pane) {
        pane.setAttribute("class", "");
        pane.innerHTML = "";
    }
    if (focusFallback !== false && window.currentTerm === number) {
        window.useAppShortcut("PREVIOUS_TAB");
    }
    return true;
};

window.closeShellTab = number => {
    if (number <= 0 || !window.term || !window.term[number]) return false;
    const terminal = window.term[number];
    const processName = terminal.processName || "";
    if (processName && !window.confirm(`Close terminal #${number + 1} running ${processName}?`)) return false;
    try {
        if (terminal.socket && terminal.socket.readyState <= 1) terminal.socket.close(1000, "closed by user");
        else window.resetShellTab(number);
    } catch(e) {}
    return true;
};

window.focusShellTab = number => {
    window.audioManager.folder.play();

    if (number !== window.currentTerm && window.term[number]) {
        window.currentTerm = number;

        document.querySelectorAll(`ul#main_shell_tabs > li:not(:nth-child(${number+1}))`).forEach(e => {
            e.setAttribute("class", "");
        });
        document.getElementById("shell_tab"+number).setAttribute("class", "active");

        document.querySelectorAll(`div#main_shell_innercontainer > pre:not(:nth-child(${number+1}))`).forEach(e => {
            e.setAttribute("class", "");
        });
        document.getElementById("terminal"+number).setAttribute("class", "active");

        window.term[number].fit();
        window.term[number].term.focus();
        window.term[number].resendCWD();

        window.fsDisp.followTab();
    } else if (number > 0 && number <= 4 && window.term[number] !== null && typeof window.term[number] !== "object") {
        window.term[number] = null;

        document.getElementById("shell_tab"+number).innerHTML = window.shellTabLabel(number, "LOADING...");
        ipc.send("ttyspawn", "true");
        ipc.once("ttyspawn-reply", (e, r) => {
            if (r.startsWith("ERROR")) {
                document.getElementById("shell_tab"+number).innerHTML = window.shellTabLabel(number, "ERROR");
                new Modal({type: "warning", title: "Terminal", message: r});
            } else if (r.startsWith("SUCCESS")) {
                let port = Number(r.substr(9));

                window.term[number] = new Terminal({
                    role: "client",
                    parentId: "terminal"+number,
                    port
                });

                window.term[number].onclose = e => {
                    delete window.term[number].onprocesschange;
                    window.resetShellTab(number);
                };

                window.term[number].onprocesschange = p => {
                    window.term[number].processName = p || "";
                    document.getElementById("shell_tab"+number).innerHTML = window.shellTabLabel(number, `#${number+1} - ${p}`);
                };

                document.getElementById("shell_tab"+number).innerHTML = window.shellTabLabel(number, `::${port}`);
                setTimeout(() => {
                    window.focusShellTab(number);
                }, 500);
            }
        });
    }
};

// Settings editor
window.openSettings = async () => {
    if (document.getElementById("settingsEditor")) return;

    // Build lists of available keyboards, themes, monitors
    let keyboards = "", themes = "", monitors = "", dualMonitorDisplays = "", ifaces = "";
    fs.readdirSync(keyboardsDir).forEach(kb => {
        if (!kb.endsWith(".json")) return;
        kb = kb.replace(".json", "");
        if (kb === window.settings.keyboard) return;
        keyboards += `<option>${kb}</option>`;
    });
    fs.readdirSync(themesDir).forEach(th => {
        if (!th.endsWith(".json")) return;
        th = th.replace(".json", "");
        if (th === window.settings.theme) return;
        themes += `<option>${th}</option>`;
    });
    const displays = edex.screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        if (i !== window.settings.monitor) monitors += `<option>${i}</option>`;
    }
    const dualMonitorSettings = window.normalizeDualMonitorSettings(window.settings.dualMonitor || {});
    const displayOptionLabel = (display, index) => {
        const bounds = display && display.bounds || {};
        const orientation = Number(bounds.height) > Number(bounds.width) ? "portrait" : "landscape";
        return `${index} - ${Number(bounds.width) || 0}x${Number(bounds.height) || 0} - ${orientation}`;
    };
    dualMonitorDisplays = `<option value="auto" ${dualMonitorSettings.display === "auto" ? "selected" : ""}>auto - first display not used by main UI</option>`;
    displays.forEach((display, index) => {
        dualMonitorDisplays += `<option value="${index}" ${dualMonitorSettings.display === index ? "selected" : ""}>${window._escapeHtml(displayOptionLabel(display, index))}</option>`;
    });
    let nets = await window.si.networkInterfaces();
    const currentIface = window.settings.iface || "auto";
    const ifaceLabel = net => {
        const state = net.operstate || "unknown";
        const type = net.type || (net.virtual ? "virtual" : "interface");
        const ip = net.ip4 || "no IPv4";
        return `${net.iface} - ${ip} - ${state} - ${type}`;
    };
    ifaces = `<option value="auto" ${currentIface === "auto" || currentIface === false ? "selected" : ""}>auto - select active IPv4 interface</option>`;
    nets.forEach(net => {
        ifaces += `<option value="${window._escapeHtml(net.iface)}" ${net.iface === currentIface ? "selected" : ""}>${window._escapeHtml(ifaceLabel(net))}</option>`;
    });
    let startupStatus = await edex.startup.get();
    let aiSettings = window.normalizeAiSettings(window.settings.ai || {});
    let aiCommands = aiSettings.commands || {};
    let aiSettingsHidden = "";
    let devExplorerSettings = window.settings.devExplorer || {};
    let editorSettings = window.settings.editor || {};
    let widgetSettings = window.normalizeWidgetSettings();
    let terminalStyle = window.settings.terminalStyle || {};
    let launcherRailSettings = Object.assign(window.defaultLauncherRailSettings(), window.settings.launcherRail || {});
    let performanceSettings = window.performanceSettings();
    let updateSettings = window.normalizeUpdateSettings(window.settings.updates || {});
    let spotifySettings = window.normalizeSpotifySettings(window.settings.spotify || {});
    let spotifyRedirectUri = `http://127.0.0.1:${spotifySettings.callbackPort}/spotify/callback`;

    // Unlink the tactile keyboard from the terminal emulator to allow filling in the settings fields
    window.keyboard.detach();

    new Modal({
        type: "custom",
        title: `Settings <i>(v${edex.app.getVersion()})</i>`,
        html: `<table id="settingsEditor">
                    <tr>
                        <th>Key</th>
                        <th>Description</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>shell</td>
                        <td>The program to run as a terminal emulator</td>
                        <td><input type="text" id="settingsEditor-shell" value="${window.settings.shell}"></td>
                    </tr>
                    <tr>
                        <td>shellArgs</td>
                        <td>Arguments to pass to the shell</td>
                        <td><input type="text" id="settingsEditor-shellArgs" value="${window.settings.shellArgs || ''}"></td>
                    </tr>
                    <tr>
                        <td>cwd</td>
                        <td>Working Directory to start in</td>
                        <td><input type="text" id="settingsEditor-cwd" value="${window.settings.cwd}"></td>
                    </tr>
                    <tr>
                        <td>env</td>
                        <td>Custom shell environment override (KEY=value lines or JSON object)</td>
                        <td><input type="text" id="settingsEditor-env" value="${window.settings.env}"></td>
                    </tr>
                    <tr>
                        <td>shell.test</td>
                        <td>Validate shell path, args, cwd and env without saving</td>
                        <td><button type="button" id="settingsEditor-testShell">Test Shell</button></td>
                    </tr>
                    <tr>
                        <td>username</td>
                        <td>Custom username to display at boot</td>
                        <td><input type="text" id="settingsEditor-username" value="${window.settings.username}"></td>
                    </tr>
                    <tr>
                        <td>keyboard</td>
                        <td>On-screen keyboard layout code</td>
                        <td><select id="settingsEditor-keyboard">
                            <option>${window.settings.keyboard}</option>
                            ${keyboards}
                        </select></td>
                    </tr>
                    <tr>
                        <td>theme</td>
                        <td>Name of the theme to load</td>
                        <td><select id="settingsEditor-theme">
                            <option>${window.settings.theme}</option>
                            ${themes}
                        </select></td>
                    </tr>
                    <tr>
                        <td>layoutPreset</td>
                        <td>Recommended Revival layout preset</td>
                        <td><select id="settingsEditor-layoutPreset">
                            ${window.layoutPresetOptions(window.settings.layoutPreset || "classic")}
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.profile</td>
                        <td>Runtime budget for polling, charts, and diagnostics</td>
                        <td><select id="settingsEditor-performance-profile">
                            <option>${performanceSettings.profile}</option>
                            <option>balanced</option>
                            <option>max</option>
                            <option>cinematic</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.systemInfoWorkers</td>
                        <td>Lazy systeminformation workers kept available after the first request</td>
                        <td><input type="number" id="settingsEditor-performance-systemInfoWorkers" value="${performanceSettings.systemInfoWorkers}" min="1" max="4"></td>
                    </tr>
                    <tr>
                        <td>performance.maxSystemInfoWorkers</td>
                        <td>Maximum workers when systeminformation calls queue up</td>
                        <td><input type="number" id="settingsEditor-performance-maxSystemInfoWorkers" value="${performanceSettings.maxSystemInfoWorkers}" min="1" max="4"></td>
                    </tr>
                    <tr>
                        <td>performance.systemInfoWorkerIdleMs</td>
                        <td>Milliseconds before extra systeminformation workers are stopped</td>
                        <td><input type="number" id="settingsEditor-performance-systemInfoWorkerIdleMs" value="${performanceSettings.systemInfoWorkerIdleMs}" min="5000" max="300000"></td>
                    </tr>
                    <tr>
                        <td>performance.systemInfoWorkerScaleDelayMs</td>
                        <td>Milliseconds a queued call waits before creating extra workers</td>
                        <td><input type="number" id="settingsEditor-performance-systemInfoWorkerScaleDelayMs" value="${performanceSettings.systemInfoWorkerScaleDelayMs}" min="100" max="60000"></td>
                    </tr>
                    <tr>
                        <td>performance.pauseHiddenWidgets</td>
                        <td>Stop polling, chart streams, and globe work for hidden widgets</td>
                        <td><select id="settingsEditor-performance-pauseHiddenWidgets">
                            <option>${performanceSettings.pauseHiddenWidgets !== false}</option>
                            <option>${performanceSettings.pauseHiddenWidgets === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.pauseWhenWindowBlurred</td>
                        <td>Pause widget work while the app window is hidden or unfocused</td>
                        <td><select id="settingsEditor-performance-pauseWhenWindowBlurred">
                            <option>${performanceSettings.pauseWhenWindowBlurred !== false}</option>
                            <option>${performanceSettings.pauseWhenWindowBlurred === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.disableBackgroundThrottling</td>
                        <td>Keep renderer work active when Electron would normally throttle the window</td>
                        <td><select id="settingsEditor-performance-disableBackgroundThrottling">
                            <option>${performanceSettings.disableBackgroundThrottling !== false}</option>
                            <option>${performanceSettings.disableBackgroundThrottling === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableGlobeByDefault</td>
                        <td>Allow the globe WebGL scene to initialize when visible</td>
                        <td><select id="settingsEditor-performance-enableGlobeByDefault">
                            <option>${performanceSettings.enableGlobeByDefault !== false}</option>
                            <option>${performanceSettings.enableGlobeByDefault === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableTerminalWebGL</td>
                        <td>Use xterm's WebGL renderer when available</td>
                        <td><select id="settingsEditor-performance-enableTerminalWebGL">
                            <option>${performanceSettings.enableTerminalWebGL !== false}</option>
                            <option>${performanceSettings.enableTerminalWebGL === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableTerminalLigatures</td>
                        <td>Load terminal font ligature shaping</td>
                        <td><select id="settingsEditor-performance-enableTerminalLigatures">
                            <option>${performanceSettings.enableTerminalLigatures === true}</option>
                            <option>${performanceSettings.enableTerminalLigatures !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableFeedbackAudio</td>
                        <td>Enable recurring keyboard/stdout feedback sounds</td>
                        <td><select id="settingsEditor-performance-enableFeedbackAudio">
                            <option>${performanceSettings.enableFeedbackAudio === true}</option>
                            <option>${performanceSettings.enableFeedbackAudio !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableCinematicAudio</td>
                        <td>Enable startup and interface cinematic sounds</td>
                        <td><select id="settingsEditor-performance-enableCinematicAudio">
                            <option>${performanceSettings.enableCinematicAudio === true}</option>
                            <option>${performanceSettings.enableCinematicAudio !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.lazyAudio</td>
                        <td>Load audio files on first use instead of during AudioManager startup</td>
                        <td><select id="settingsEditor-performance-lazyAudio">
                            <option>${performanceSettings.lazyAudio === true}</option>
                            <option>${performanceSettings.lazyAudio !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>performance.enableErrorLens</td>
                        <td>Terminal error analysis mode</td>
                        <td><select id="settingsEditor-performance-enableErrorLens">
                            <option>${performanceSettings.enableErrorLens || "ai-only"}</option>
                            <option>ai-only</option>
                            <option>always</option>
                            <option>off</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launcherRail.enabled</td>
                        <td>Use the icon launcher rail as the primary app launcher</td>
                        <td><select id="settingsEditor-launcherRail-enabled">
                            <option>${launcherRailSettings.enabled !== false}</option>
                            <option>${launcherRailSettings.enabled === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launcherRail.position</td>
                        <td>Launcher navigation placement. Top is the header mode.</td>
                        <td><select id="settingsEditor-launcherRail-position">
                            <option>${launcherRailSettings.position || "top"}</option>
                            <option>top</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launcherRail.compact</td>
                        <td>Use compact icon buttons in the launcher rail</td>
                        <td><select id="settingsEditor-launcherRail-compact">
                            <option>${launcherRailSettings.compact === true}</option>
                            <option>${launcherRailSettings.compact !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launcherRail.labels</td>
                        <td>Show short labels next to rail icons</td>
                        <td><select id="settingsEditor-launcherRail-labels">
                            <option>${launcherRailSettings.labels === true}</option>
                            <option>${launcherRailSettings.labels !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launcherRail.autoHide</td>
                        <td>Header always collapses until hover or focus</td>
                        <td><select id="settingsEditor-launcherRail-autoHide" disabled>
                            <option>true</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>termFontSize</td>
                        <td>Size of the terminal text in pixels</td>
                        <td><input type="number" id="settingsEditor-termFontSize" value="${window.settings.termFontSize}"></td>
                    </tr>
                    <tr>
                        <td>terminalStyle.foreground</td>
                        <td>Terminal text color override. Leave empty to use the theme.</td>
                        <td><input type="text" id="settingsEditor-terminalStyle-foreground" placeholder="#00ffcc / rgb(...)" value="${terminalStyle.foreground || ""}"></td>
                    </tr>
                    <tr>
                        <td>terminalStyle.background</td>
                        <td>Terminal background color override. Leave empty to use the theme.</td>
                        <td><input type="text" id="settingsEditor-terminalStyle-background" placeholder="#000000 / rgba(...)" value="${terminalStyle.background || ""}"></td>
                    </tr>
                    <tr>
                        <td>terminal.showStartupBanner</td>
                        <td>Show the eDEX Revival ANSI sprite in the first terminal on startup</td>
                        <td><select id="settingsEditor-terminal-showStartupBanner">
                            <option>${window.settings.terminal && window.settings.terminal.showStartupBanner !== false}</option>
                            <option>${!(window.settings.terminal && window.settings.terminal.showStartupBanner !== false)}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>audio</td>
                        <td>Activate audio sound effects</td>
                        <td><select id="settingsEditor-audio">
                            <option>${window.settings.audio}</option>
                            <option>${!window.settings.audio}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>audioVolume</td>
                        <td>Set default volume for sound effects (0.0 - 1.0)</td>
                        <td><input type="number" id="settingsEditor-audioVolume" value="${window.settings.audioVolume || '1.0'}"></td>
                    </tr>
                    <tr>
                        <td>disableFeedbackAudio</td>
                        <td>Disable recurring feedback sound FX (input/output, mostly)</td>
                        <td><select id="settingsEditor-disableFeedbackAudio">
                            <option>${window.settings.disableFeedbackAudio}</option>
                            <option>${!window.settings.disableFeedbackAudio}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>port</td>
                        <td>Local port to use for UI-shell connection</td>
                        <td><input type="number" id="settingsEditor-port" value="${window.settings.port}"></td>
                    </tr>
                    <tr>
                        <td>pingAddr</td>
                        <td>IPv4 address to test Internet connectivity</td>
                        <td><input type="text" id="settingsEditor-pingAddr" value="${window.settings.pingAddr || "1.1.1.1"}"></td>
                    </tr>
                    <tr>
                        <td>clockHours</td>
                        <td>Clock format (12/24 hours)</td>
                        <td><select id="settingsEditor-clockHours">
                            <option>${(window.settings.clockHours === 12) ? "12" : "24"}</option>
                            <option>${(window.settings.clockHours === 12) ? "24" : "12"}</option>
                        </select></td>
                    <tr>
                        <td>monitor</td>
                        <td>Which monitor to spawn the UI in (defaults to primary display)</td>
                        <td><select id="settingsEditor-monitor">
                            ${(typeof window.settings.monitor !== "undefined") ? "<option>"+window.settings.monitor+"</option>" : ""}
                            ${monitors}
                        </select></td>
                    </tr>
                    <tr>
                        <td>dualMonitor.enabled</td>
                        <td>Open a dedicated eDEX secondary display window when another monitor is available</td>
                        <td><select id="settingsEditor-dualMonitor-enabled">
                            <option>${dualMonitorSettings.enabled === true}</option>
                            <option>${dualMonitorSettings.enabled !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>dualMonitor.display</td>
                        <td>Secondary monitor target. Auto avoids the main UI monitor.</td>
                        <td><select id="settingsEditor-dualMonitor-display">
                            ${dualMonitorDisplays}
                        </select></td>
                    </tr>
                    <tr>
                        <td>dualMonitor.content</td>
                        <td>Content rendered on the secondary monitor</td>
                        <td><select id="settingsEditor-dualMonitor-content">
                            <option>${dualMonitorSettings.content}</option>
                            <option>spotify</option>
                            <option>widgets</option>
                            <option>terminal</option>
                            <option>blank</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>dualMonitor.orientation</td>
                        <td>Secondary display layout orientation. Use auto to follow the display bounds.</td>
                        <td><select id="settingsEditor-dualMonitor-orientation">
                            <option>${dualMonitorSettings.orientation}</option>
                            <option>auto</option>
                            <option>landscape</option>
                            <option>portrait</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>dualMonitor.fullscreen</td>
                        <td>Fill the secondary monitor instead of opening a framed test window</td>
                        <td><select id="settingsEditor-dualMonitor-fullscreen">
                            <option>${dualMonitorSettings.fullscreen !== false}</option>
                            <option>${dualMonitorSettings.fullscreen === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>nointro</td>
                        <td>Skip the intro boot log and logo${(window.settings.nointroOverride) ? " (Currently overridden by CLI flag)" : ""}</td>
                        <td><select id="settingsEditor-nointro">
                            <option>${window.settings.nointro}</option>
                            <option>${!window.settings.nointro}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>nocursor</td>
                        <td>Hide the mouse cursor${(window.settings.nocursorOverride) ? " (Currently overridden by CLI flag)" : ""}</td>
                        <td><select id="settingsEditor-nocursor">
                            <option>${window.settings.nocursor}</option>
                            <option>${!window.settings.nocursor}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>iface</td>
                        <td>Interface used for network monitoring</td>
                        <td><select id="settingsEditor-iface">
                            ${ifaces}
                        </select></td>
                    </tr>
                    <tr>
                        <td>allowWindowed</td>
                        <td>Allow using F11 key to set the UI in windowed mode</td>
                        <td><select id="settingsEditor-allowWindowed">
                            <option>${window.settings.allowWindowed}</option>
                            <option>${!window.settings.allowWindowed}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.visible</td>
                        <td>Show keyboard, system graphs, network globe and IP panels</td>
                        <td><select id="settingsEditor-widgets-visible">
                            <option>${widgetSettings.visible !== false}</option>
                            <option>${widgetSettings.visible === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.keyboard</td>
                        <td>Show the on-screen keyboard widget</td>
                        <td><select id="settingsEditor-widgets-keyboard">
                            <option>${widgetSettings.keyboard !== false}</option>
                            <option>${widgetSettings.keyboard === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.systemPanel</td>
                        <td>Show the left system widget column</td>
                        <td><select id="settingsEditor-widgets-systemPanel">
                            <option>${widgetSettings.systemPanel !== false}</option>
                            <option>${widgetSettings.systemPanel === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.networkPanel</td>
                        <td>Show the right network widget column</td>
                        <td><select id="settingsEditor-widgets-networkPanel">
                            <option>${widgetSettings.networkPanel !== false}</option>
                            <option>${widgetSettings.networkPanel === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.clock</td>
                        <td>Show the clock widget</td>
                        <td><select id="settingsEditor-widgets-clock">
                            <option>${widgetSettings.clock !== false}</option>
                            <option>${widgetSettings.clock === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.sysinfo</td>
                        <td>Show OS and session information</td>
                        <td><select id="settingsEditor-widgets-sysinfo">
                            <option>${widgetSettings.sysinfo !== false}</option>
                            <option>${widgetSettings.sysinfo === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.hardware</td>
                        <td>Show hardware information</td>
                        <td><select id="settingsEditor-widgets-hardware">
                            <option>${widgetSettings.hardware !== false}</option>
                            <option>${widgetSettings.hardware === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.cpu</td>
                        <td>Show CPU graph widget</td>
                        <td><select id="settingsEditor-widgets-cpu">
                            <option>${widgetSettings.cpu !== false}</option>
                            <option>${widgetSettings.cpu === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.memory</td>
                        <td>Show memory graph widget</td>
                        <td><select id="settingsEditor-widgets-memory">
                            <option>${widgetSettings.memory !== false}</option>
                            <option>${widgetSettings.memory === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.processes</td>
                        <td>Show top processes widget</td>
                        <td><select id="settingsEditor-widgets-processes">
                            <option>${widgetSettings.processes !== false}</option>
                            <option>${widgetSettings.processes === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.spotify</td>
                        <td>${window.isSpotifyRoutedToSecondary() ? "Spotify is routed to the secondary display, so the main display widget is hidden." : "Show Spotify Connect player widget"}</td>
                        <td><select id="settingsEditor-widgets-spotify">
                            <option>${widgetSettings.spotify !== false}</option>
                            <option>${widgetSettings.spotify === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.networkStatus</td>
                        <td>Show network status widget</td>
                        <td><select id="settingsEditor-widgets-networkStatus">
                            <option>${widgetSettings.networkStatus !== false}</option>
                            <option>${widgetSettings.networkStatus === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.networkTraffic</td>
                        <td>Show network traffic widget</td>
                        <td><select id="settingsEditor-widgets-networkTraffic">
                            <option>${widgetSettings.networkTraffic !== false}</option>
                            <option>${widgetSettings.networkTraffic === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.globe</td>
                        <td>Show network globe widget</td>
                        <td><select id="settingsEditor-widgets-globe">
                            <option>${widgetSettings.globe !== false}</option>
                            <option>${widgetSettings.globe === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>widgets.globeMode</td>
                        <td>Network globe detail mode</td>
                        <td><select id="settingsEditor-widgets-globeMode">
                            <option>${widgetSettings.globeMode || "full"}</option>
                            <option>full</option>
                            <option>reduced</option>
                            <option>offline</option>
                            <option>hidden</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>privacy.showIp</td>
                        <td>Allow public IP lookup for live globe geolocation. Network Status never displays IP.</td>
                        <td><select id="settingsEditor-widgets-showIp">
                            <option>${widgetSettings.showIp !== false}</option>
                            <option>${widgetSettings.showIp === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>privacy.showInterface</td>
                        <td>Display the active network interface name</td>
                        <td><select id="settingsEditor-widgets-showInterface">
                            <option>${widgetSettings.showInterface !== false}</option>
                            <option>${widgetSettings.showInterface === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>privacy.showGeo</td>
                        <td>Display geolocation coordinates in the globe widget</td>
                        <td><select id="settingsEditor-widgets-showGeo">
                            <option>${widgetSettings.showGeo !== false}</option>
                            <option>${widgetSettings.showGeo === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>launchOnStartup</td>
                        <td>Start eDEX with Windows login${startupStatus && startupStatus.supported ? "" : " (Windows only)"}</td>
                        <td><select id="settingsEditor-launchOnStartup" ${startupStatus && startupStatus.supported ? "" : "disabled"}>
                            <option>${window.settings.launchOnStartup === true}</option>
                            <option>${window.settings.launchOnStartup !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>updates.enabled</td>
                        <td>Check GitHub release metadata and use native packaged updates when available</td>
                        <td><select id="settingsEditor-updates-enabled">
                            <option>${updateSettings.enabled === true}</option>
                            <option>${updateSettings.enabled !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>updates.checkOnStartup</td>
                        <td>Check for updates after startup</td>
                        <td><select id="settingsEditor-updates-checkOnStartup">
                            <option>${updateSettings.checkOnStartup === true}</option>
                            <option>${updateSettings.checkOnStartup !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>updates.autoDownload</td>
                        <td>Download packaged updates in the background after they are found</td>
                        <td><select id="settingsEditor-updates-autoDownload">
                            <option>${updateSettings.autoDownload === true}</option>
                            <option>${updateSettings.autoDownload !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>updates.installOnQuit</td>
                        <td>Install a downloaded update automatically when eDEX exits</td>
                        <td><select id="settingsEditor-updates-installOnQuit">
                            <option>${updateSettings.installOnQuit === true}</option>
                            <option>${updateSettings.installOnQuit !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>spotify.setup</td>
                        <td colspan="2">
                            <div class="spotify_settings_guide">
                                <div class="spotify_settings_guide_head">
                                    <strong>User-owned Spotify setup</strong>
                                    <span>Each user must create their own Spotify Developer app. eDEX stores only the Client ID and OAuth tokens; never paste a Client Secret.</span>
                                </div>
                                <ol>
                                    <li>Open Spotify Developer Dashboard and create a new app for your local eDEX install.</li>
                                    <li>When Spotify asks which APIs or SDKs you plan to use, select <b>Web API</b> only.</li>
                                    <li>In the Spotify app settings, add this exact Redirect URI:</li>
                                </ol>
                                <div class="spotify_redirect_copy">
                                    <input type="text" id="settingsEditor-spotify-redirectUri" value="${window._escapeHtml(spotifyRedirectUri)}" readonly>
                                    <button type="button" data-settings-spotify-action="copy-redirect">Copy URI</button>
                                </div>
                                <ol start="4">
                                    <li>Copy the app's Client ID into <b>spotify.clientId</b>. Do not use the Client Secret.</li>
                                    <li>Set <b>spotify.enabled</b> to true, save, reload eDEX, then connect from the Spotify widget.</li>
                                </ol>
                                <div class="spotify_scope_notes">
                                    <span>Scopes requested: user-read-playback-state, user-read-currently-playing, user-modify-playback-state.</span>
                                    <span>Spotify Premium may be required by Spotify for some playback control behavior.</span>
                                </div>
                                <div class="spotify_settings_actions">
                                    <button type="button" data-settings-spotify-action="dashboard">Open Dashboard</button>
                                    <button type="button" data-settings-spotify-action="pkce-docs">PKCE Docs</button>
                                    <button type="button" data-settings-spotify-action="scope-docs">Scope Docs</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>spotify.enabled</td>
                        <td>Enable the Spotify Web API integration after the user supplies their own Client ID</td>
                        <td><select id="settingsEditor-spotify-enabled">
                            <option>${spotifySettings.enabled === true}</option>
                            <option>${spotifySettings.enabled !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>spotify.clientId</td>
                        <td>User-owned Spotify app Client ID. Use Authorization Code with PKCE; never enter a Client Secret.</td>
                        <td><input type="text" id="settingsEditor-spotify-clientId" value="${window._escapeHtml(spotifySettings.clientId || "")}"></td>
                    </tr>
                    <tr>
                        <td>spotify.callbackPort</td>
                        <td>Loopback callback port. The Redirect URI preview above must match Spotify Dashboard exactly.</td>
                        <td><input type="number" id="settingsEditor-spotify-callbackPort" value="${spotifySettings.callbackPort}" min="1024" max="65535"></td>
                    </tr>
                    <tr>
                        <td>spotify.pollIntervalMs</td>
                        <td>Milliseconds between player state refreshes</td>
                        <td><input type="number" id="settingsEditor-spotify-pollIntervalMs" value="${spotifySettings.pollIntervalMs}" min="2500" max="30000"></td>
                    </tr>
                    <tr>
                        <td>spotify.market</td>
                        <td>Optional two-letter market code for playable track data</td>
                        <td><input type="text" id="settingsEditor-spotify-market" value="${window._escapeHtml(spotifySettings.market || "")}" maxlength="2"></td>
                    </tr>
                    <tr>
                        <td>spotify.showAlbumArt</td>
                        <td>Download current album art through the main process and render it as a local data URL</td>
                        <td><select id="settingsEditor-spotify-showAlbumArt">
                            <option>${spotifySettings.showAlbumArt !== false}</option>
                            <option>${spotifySettings.showAlbumArt === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>spotify.showDevices</td>
                        <td>Fetch Spotify Connect device state for active device and volume data</td>
                        <td><select id="settingsEditor-spotify-showDevices">
                            <option>${spotifySettings.showDevices !== false}</option>
                            <option>${spotifySettings.showDevices === false}</option>
                        </select></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.enabled</td>
                        <td>Enable Error to Fix prompt handoff</td>
                        <td><select id="settingsEditor-ai-enabled">
                            <option>${aiSettings.enabled === true}</option>
                            <option>${aiSettings.enabled !== true}</option>
                        </select></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.defaultProvider</td>
                        <td>Preferred local CLI provider for Error to Fix</td>
                        <td><select id="settingsEditor-ai-defaultProvider">
                            <option>${aiSettings.defaultProvider || aiSettings.provider || "auto"}</option>
                            <option>auto</option>
                            <option>codex</option>
                            <option>claude</option>
                        </select></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.contextBytes</td>
                        <td>Maximum prompt context bytes sent after redaction</td>
                        <td><input type="number" id="settingsEditor-ai-contextBytes" value="${Number(aiSettings.contextBytes) || 60000}"></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.redactSecrets</td>
                        <td>Redact common token and key patterns before launching Error to Fix</td>
                        <td><select id="settingsEditor-ai-redactSecrets">
                            <option>${aiSettings.redactSecrets !== false}</option>
                            <option>${aiSettings.redactSecrets === false}</option>
                        </select></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.commands.codex</td>
                        <td>Command used for Codex CLI</td>
                        <td><input type="text" id="settingsEditor-ai-codex" value="${aiCommands.codex || "codex"}"></td>
                    </tr>
                    <tr${aiSettingsHidden}>
                        <td>ai.commands.claude</td>
                        <td>Command used for Claude CLI</td>
                        <td><input type="text" id="settingsEditor-ai-claude" value="${aiCommands.claude || "claude"}"></td>
                    </tr>
                    <tr>
                        <td>devExplorer.enabled</td>
                        <td>Use Dev File Browser 2.0 instead of the legacy filesystem display</td>
                        <td><select id="settingsEditor-devExplorer-enabled">
                            <option>${devExplorerSettings.enabled !== false}</option>
                            <option>${devExplorerSettings.enabled === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.mode</td>
                        <td>Start the file browser docked, windowed, or maximized</td>
                        <td><select id="settingsEditor-devExplorer-mode">
                            <option>${devExplorerSettings.mode || "dock"}</option>
                            <option>dock</option>
                            <option>window</option>
                            <option>cockpit</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.defaultView</td>
                        <td>Default file browser layout</td>
                        <td><select id="settingsEditor-devExplorer-defaultView">
                            <option>${devExplorerSettings.defaultView || "list"}</option>
                            <option>list</option>
                            <option>grid</option>
                            <option>columns</option>
                            <option>dualPane</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.showPreview</td>
                        <td>Show the inspector preview panel</td>
                        <td><select id="settingsEditor-devExplorer-showPreview">
                            <option>${devExplorerSettings.showPreview !== false}</option>
                            <option>${devExplorerSettings.showPreview === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.showGitStatus</td>
                        <td>Show Git status badges for files in repositories</td>
                        <td><select id="settingsEditor-devExplorer-showGitStatus">
                            <option>${devExplorerSettings.showGitStatus !== false}</option>
                            <option>${devExplorerSettings.showGitStatus === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.showExtensions</td>
                        <td>Show file extensions in the file list</td>
                        <td><select id="settingsEditor-devExplorer-showExtensions">
                            <option>${devExplorerSettings.showExtensions !== false}</option>
                            <option>${devExplorerSettings.showExtensions === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>devExplorer.confirmTrash</td>
                        <td>Confirm before moving files to trash</td>
                        <td><select id="settingsEditor-devExplorer-confirmTrash">
                            <option>${devExplorerSettings.confirmTrash !== false}</option>
                            <option>${devExplorerSettings.confirmTrash === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.enabled</td>
                        <td>Enable the integrated file editor</td>
                        <td><select id="settingsEditor-editor-enabled">
                            <option>${editorSettings.enabled !== false}</option>
                            <option>${editorSettings.enabled === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.ideMode</td>
                        <td>Use the CodeMirror IDE core with command palette, completions, folding, and lint gutter</td>
                        <td><select id="settingsEditor-editor-ideMode">
                            <option>${editorSettings.ideMode !== false}</option>
                            <option>${editorSettings.ideMode === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.fontSize</td>
                        <td>Editor font size in pixels</td>
                        <td><input type="number" id="settingsEditor-editor-fontSize" value="${Number(editorSettings.fontSize) || 13}"></td>
                    </tr>
                    <tr>
                        <td>editor.tabSize</td>
                        <td>Spaces inserted when pressing Tab</td>
                        <td><input type="number" id="settingsEditor-editor-tabSize" value="${Number(editorSettings.tabSize) || 4}"></td>
                    </tr>
                    <tr>
                        <td>editor.wordWrap</td>
                        <td>Wrap long lines in the editor</td>
                        <td><select id="settingsEditor-editor-wordWrap">
                            <option>${editorSettings.wordWrap !== false}</option>
                            <option>${editorSettings.wordWrap === false}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.defaultOpenBehavior</td>
                        <td>Default file-open route from explorer</td>
                        <td><select id="settingsEditor-editor-defaultOpenBehavior">
                            <option>${editorSettings.defaultOpenBehavior || "smart"}</option>
                            <option>smart</option>
                            <option>editor</option>
                            <option>preview</option>
                            <option>external</option>
                            <option>ask</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.autosave</td>
                        <td>Reserved for future autosave support</td>
                        <td><select id="settingsEditor-editor-autosave">
                            <option>${editorSettings.autosave === true}</option>
                            <option>${editorSettings.autosave !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>editor.useCodeMirror</td>
                        <td>Compatibility switch for the CodeMirror renderer; plain textarea remains the fallback</td>
                        <td><select id="settingsEditor-editor-useCodeMirror">
                            <option>${editorSettings.useCodeMirror === true}</option>
                            <option>${editorSettings.useCodeMirror !== true}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>keepGeometry</td>
                        <td>Try to keep a 16:9 aspect ratio in windowed mode</td>
                        <td><select id="settingsEditor-keepGeometry">
                            <option>${(window.settings.keepGeometry === false) ? 'false' : 'true'}</option>
                            <option>${(window.settings.keepGeometry === false) ? 'true' : 'false'}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>excludeThreadsFromToplist</td>
                        <td>Display threads in the top processes list</td>
                        <td><select id="settingsEditor-excludeThreadsFromToplist">
                            <option>${window.settings.excludeThreadsFromToplist}</option>
                            <option>${!window.settings.excludeThreadsFromToplist}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>hideDotfiles</td>
                        <td>Hide files and directories starting with a dot in file display</td>
                        <td><select id="settingsEditor-hideDotfiles">
                            <option>${window.settings.hideDotfiles}</option>
                            <option>${!window.settings.hideDotfiles}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>fsListView</td>
                        <td>Show files in a more detailed list instead of an icon grid</td>
                        <td><select id="settingsEditor-fsListView">
                            <option>${window.settings.fsListView}</option>
                            <option>${!window.settings.fsListView}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>experimentalGlobeFeatures</td>
                        <td>Toggle experimental features for the network globe</td>
                        <td><select id="settingsEditor-experimentalGlobeFeatures">
                            <option>${window.settings.experimentalGlobeFeatures}</option>
                            <option>${!window.settings.experimentalGlobeFeatures}</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td>experimentalFeatures</td>
                        <td>Toggle Chrome's experimental web features (DANGEROUS)</td>
                        <td><select id="settingsEditor-experimentalFeatures">
                            <option>${window.settings.experimentalFeatures}</option>
                            <option>${!window.settings.experimentalFeatures}</option>
                        </select></td>
                    </tr>
                </table>
                <h6 id="settingsEditorStatus">Loaded values from memory</h6>
                <br>`,
        buttons: []
    }, () => {
        // Link the keyboard back to the terminal
        window.keyboard.attach();

        // Focus back on the term
        window.term[window.currentTerm].term.focus();
    });
    setTimeout(() => {
        if (window.enhanceSettingsEditor) window.enhanceSettingsEditor();
    }, 0);
};

window.settingsSectionForKey = key => {
    if (/^theme$|^layoutPreset$|^launcherRail\.|^monitor$|^dualMonitor\.|^clockHours$|^nointro$|^nocursor$|^allowWindowed$|^keepGeometry$/.test(key)) return "display";
    if (/^shell|^cwd$|^env$|^termFontSize$|^terminalStyle\.|^terminal\.|^port$/.test(key)) return "terminal";
    if (/^devExplorer\.|^editor\.|^hideDotfiles$|^fsListView$/.test(key)) return "workspace";
    if (/^widgets\./.test(key)) return "widgets";
    if (/^spotify\.|^ai\.|^updates\.|^launchOnStartup$/.test(key)) return "integrations";
    if (/^privacy\.|^iface$|^pingAddr$/.test(key)) return "privacy";
    if (/^performance\.|^experimental|^excludeThreadsFromToplist$/.test(key)) return "advanced";
    return "core";
};

window.enhanceSettingsEditor = () => {
    const table = document.getElementById("settingsEditor");
    if (!table || table.dataset.enhanced === "true") return;
    table.dataset.enhanced = "true";

    const sections = [
        ["core", "Core"],
        ["display", "Display"],
        ["terminal", "Terminal"],
        ["workspace", "Workspace"],
        ["widgets", "Widgets"],
        ["integrations", "Integrations"],
        ["privacy", "Privacy"],
        ["advanced", "Advanced"]
    ];

    const shell = document.createElement("div");
    shell.id = "settingsEditorShell";
    table.parentNode.insertBefore(shell, table);

    const quick = document.createElement("div");
    quick.className = "settings_editor_quickbar";
    quick.innerHTML = `
        <div>
            <strong>eDEX Settings</strong>
            <span>Core controls first. Use search for exact setting names.</span>
        </div>
        <input id="settingsEditorSearch" type="search" placeholder="Search settings">
        <button type="button" class="primary" data-settings-action="save">Save</button>
        <button type="button" data-settings-action="reset-section">Reset Section</button>
        <details class="settings_editor_more">
            <summary>More</summary>
            <div>
                <button type="button" data-settings-action="preview-theme">Preview Theme</button>
                <button type="button" data-settings-action="apply-theme">Apply Theme</button>
                <button type="button" data-settings-action="export-profile">Export Profile</button>
                <button type="button" data-settings-action="import-profile">Import Profile</button>
                <button type="button" data-settings-action="open-file">Open JSON</button>
                <button type="button" data-settings-action="reload">Reload UI</button>
                <button type="button" data-settings-action="restart">Restart eDEX</button>
            </div>
        </details>`;

    const tabs = document.createElement("div");
    tabs.className = "settings_editor_tabs";
    tabs.innerHTML = sections.map(([id, label], index) => (
        `<button type="button" class="${index === 0 ? "active" : ""}" data-settings-section="${id}">${label}</button>`
    )).join("");

    const body = document.createElement("div");
    body.className = "settings_editor_body";

    shell.appendChild(quick);
    shell.appendChild(tabs);
    shell.appendChild(body);
    body.appendChild(table);

    Array.from(table.querySelectorAll("tr")).forEach((row, index) => {
        if (index === 0) {
            row.classList.add("settings_header_row");
            return;
        }
        const key = row.cells && row.cells[0] ? row.cells[0].textContent.trim() : "";
        row.dataset.settingsGroup = window.settingsSectionForKey(key);
    });

    const search = quick.querySelector("#settingsEditorSearch");
    const filterRows = () => {
        const section = shell.dataset.activeSection || "core";
        const query = search ? search.value.trim().toLowerCase() : "";
        table.querySelectorAll("tr[data-settings-group]").forEach(row => {
            const matchesSearch = !query || row.textContent.toLowerCase().includes(query);
            const matchesSection = query ? true : row.dataset.settingsGroup === section;
            row.classList.toggle("settings_section_hidden", !matchesSearch || !matchesSection);
        });
    };

    const activate = section => {
        shell.dataset.activeSection = section;
        tabs.querySelectorAll("button").forEach(button => {
            button.classList.toggle("active", button.dataset.settingsSection === section);
        });
        filterRows();
    };

    tabs.addEventListener("click", event => {
        const button = event.target.closest("button[data-settings-section]");
        if (button) activate(button.dataset.settingsSection);
    });
    quick.addEventListener("click", event => {
        const button = event.target.closest("button[data-settings-action]");
        if (!button) return;
        if (button.dataset.settingsAction === "save") window.writeSettingsFile();
        if (button.dataset.settingsAction === "preview-theme") window.previewSettingsThemeNow();
        if (button.dataset.settingsAction === "apply-theme") window.applySettingsThemeNow();
        if (button.dataset.settingsAction === "reset-section") window.resetSettingsSection();
        if (button.dataset.settingsAction === "export-profile") window.exportSettingsProfile();
        if (button.dataset.settingsAction === "import-profile") window.importSettingsProfile();
        if (button.dataset.settingsAction === "open-file") {
            edex.openPath(settingsFile);
            appWindow.minimize();
        }
        if (button.dataset.settingsAction === "reload") window.location.reload(true);
        if (button.dataset.settingsAction === "restart") {
            edex.app.relaunch();
            edex.app.quit();
        }
    });
    if (search) search.addEventListener("input", filterRows);
    const testShellButton = document.getElementById("settingsEditor-testShell");
    if (testShellButton) {
        testShellButton.addEventListener("click", () => window.testSettingsShell());
    }
    table.addEventListener("click", event => {
        const button = event.target.closest("button[data-settings-spotify-action]");
        if (!button) return;
        event.preventDefault();
        window.handleSpotifySettingsAction(button.dataset.settingsSpotifyAction);
    });
    const spotifyPortInput = document.getElementById("settingsEditor-spotify-callbackPort");
    if (spotifyPortInput) {
        spotifyPortInput.addEventListener("input", () => window.updateSpotifySettingsRedirectUri());
        window.updateSpotifySettingsRedirectUri();
    }

    activate("core");
};

window.currentSpotifySettingsRedirectUri = () => {
    const port = Number(window.settingsEditorValue("settingsEditor-spotify-callbackPort"));
    const safePort = Number.isInteger(port) && port >= 1024 && port <= 65535
        ? port
        : window.defaultSpotifySettings().callbackPort;
    return `http://127.0.0.1:${safePort}/spotify/callback`;
};

window.updateSpotifySettingsRedirectUri = () => {
    const input = document.getElementById("settingsEditor-spotify-redirectUri");
    const uri = window.currentSpotifySettingsRedirectUri();
    if (input) input.value = uri;
    return uri;
};

window.handleSpotifySettingsAction = action => {
    const status = document.getElementById("settingsEditorStatus");
    if (action === "dashboard") {
        edex.openExternal("https://developer.spotify.com/dashboard");
        if (status) status.innerText = "Opened Spotify Developer Dashboard in your browser.";
        return true;
    }
    if (action === "pkce-docs") {
        edex.openExternal("https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow");
        if (status) status.innerText = "Opened Spotify PKCE documentation in your browser.";
        return true;
    }
    if (action === "scope-docs") {
        edex.openExternal("https://developer.spotify.com/documentation/web-api/concepts/scopes");
        if (status) status.innerText = "Opened Spotify scopes documentation in your browser.";
        return true;
    }
    if (action === "copy-redirect") {
        const uri = window.updateSpotifySettingsRedirectUri();
        edex.clipboard.writeText(uri);
        if (status) status.innerText = `Copied Spotify Redirect URI: ${uri}`;
        return true;
    }
    return false;
};

window.testSettingsShell = async () => {
    const status = document.getElementById("settingsEditorStatus");
    if (status) status.innerText = "Testing shell...";
    const result = await edex.shell.test({
        shell: window.settingsEditorValue("settingsEditor-shell"),
        shellArgs: window.settingsEditorValue("settingsEditor-shellArgs"),
        cwd: window.settingsEditorValue("settingsEditor-cwd"),
        env: window.settingsEditorValue("settingsEditor-env")
    });
    if (status) {
        status.innerText = result && result.ok
            ? `Shell test passed in ${result.elapsedMs || 0}ms.`
            : `Shell test failed: ${result && result.error ? result.error : "unknown error"}`;
    }
    return result;
};

window.settingsProfileStamp = () => new Date().toISOString().replace(/[:.]/g, "-");

window.exportSettingsProfile = () => {
    const status = document.getElementById("settingsEditorStatus");
    try {
        const target = path.join(settingsDir, `settings-profile-${window.settingsProfileStamp()}.json`);
        fs.writeFileSync(target, fs.readFileSync(settingsFile, "utf-8"), "utf-8");
        edex.clipboard.writeText(target);
        if (status) status.innerText = `Settings profile exported and path copied: ${target}`;
        return target;
    } catch(error) {
        if (status) status.innerText = `Settings export failed: ${error.message}`;
        return false;
    }
};

window.importSettingsProfile = () => {
    const status = document.getElementById("settingsEditorStatus");
    const source = window.prompt("Path to settings profile JSON");
    if (!source) return false;

    try {
        const parsed = JSON.parse(fs.readFileSync(source, "utf-8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Profile must be a JSON object.");
        }

        const backup = path.join(settingsDir, `settings-backup-before-import-${window.settingsProfileStamp()}.json`);
        fs.writeFileSync(backup, fs.readFileSync(settingsFile, "utf-8"), "utf-8");
        fs.writeFileSync(settingsFile, JSON.stringify(parsed, "", 4), "utf-8");
        window.settings = parsed;
        if (status) status.innerText = `Settings profile imported. Backup saved: ${backup}. Reload UI to apply.`;
        return true;
    } catch(error) {
        if (status) status.innerText = `Settings import failed: ${error.message}`;
        return false;
    }
};

window.settingsEditorDefaults = () => Object.assign({
    shell: process.platform === "win32" ? "powershell.exe" : "bash",
    shellArgs: "",
    cwd: edex.paths.userData,
    env: "",
    username: "",
    keyboard: "en-US",
    theme: "tron",
    layoutPreset: "classic",
    "performance.profile": "cinematic",
    "performance.systemInfoWorkers": 2,
    "performance.maxSystemInfoWorkers": 2,
    "performance.systemInfoWorkerIdleMs": 30000,
    "performance.systemInfoWorkerScaleDelayMs": 750,
    "performance.pauseHiddenWidgets": false,
    "performance.pauseWhenWindowBlurred": false,
    "performance.enableGlobeByDefault": true,
    "performance.enableTerminalWebGL": true,
    "performance.enableTerminalLigatures": true,
    "performance.enableFeedbackAudio": true,
    "performance.enableCinematicAudio": true,
    "performance.lazyAudio": false,
    "performance.disableBackgroundThrottling": true,
    "performance.enableErrorLens": "ai-only",
    "launcherRail.enabled": true,
    "launcherRail.position": "top",
    "launcherRail.compact": false,
    "launcherRail.labels": true,
    "launcherRail.autoHide": true,
    "dualMonitor.enabled": false,
    "dualMonitor.display": "auto",
    "dualMonitor.content": "spotify",
    "dualMonitor.orientation": "auto",
    "dualMonitor.fullscreen": true,
    termFontSize: 15,
    "terminalStyle.foreground": "",
    "terminalStyle.background": "",
    "terminal.showStartupBanner": true,
    "updates.enabled": true,
    "updates.checkOnStartup": true,
    "updates.autoDownload": true,
    "updates.installOnQuit": true,
    "spotify.enabled": false,
    "spotify.clientId": "",
    "spotify.callbackPort": 43879,
    "spotify.pollIntervalMs": 5000,
    "spotify.market": "",
    "spotify.showAlbumArt": true,
    "spotify.showDevices": true,
    audio: true,
    audioVolume: 1,
    disableFeedbackAudio: false,
    pingAddr: "1.1.1.1",
    clockHours: 24,
    port: 3000,
    monitor: 0,
    nointro: false,
    nocursor: false,
    iface: "",
    allowWindowed: false,
    launchOnStartup: false,
    "ai.enabled": false,
    "ai.defaultProvider": "auto",
    "ai.contextBytes": 60000,
    "ai.redactSecrets": true,
    "ai.commands.codex": "codex",
    "ai.commands.claude": "claude",
    "devExplorer.enabled": true,
    "devExplorer.mode": "dock",
    "devExplorer.defaultView": "list",
    "devExplorer.showPreview": true,
    "devExplorer.showGitStatus": true,
    "devExplorer.showExtensions": true,
    "devExplorer.confirmTrash": true,
    "editor.enabled": true,
    "editor.fontSize": 13,
    "editor.tabSize": 4,
    "editor.wordWrap": true,
    "editor.autosave": false,
    "editor.ideMode": true,
    "editor.defaultOpenBehavior": "smart",
    "editor.useCodeMirror": false,
    keepGeometry: true,
    excludeThreadsFromToplist: true,
    hideDotfiles: false,
    fsListView: false,
    experimentalGlobeFeatures: false,
    experimentalFeatures: false
}, Object.keys(window.defaultWidgetSettings()).reduce((defaults, key) => {
    defaults[`widgets.${key}`] = window.defaultWidgetSettings()[key];
    return defaults;
}, {
    "privacy.showIp": true,
    "privacy.showInterface": true,
    "privacy.showGeo": true
}));

window.setSettingsControlValue = (control, value) => {
    const next = String(value);
    if (control.tagName === "SELECT") {
        const exists = Array.from(control.options).some(option => option.value === next || option.textContent === next);
        if (!exists) {
            const option = document.createElement("option");
            option.value = next;
            option.textContent = next;
            control.insertBefore(option, control.firstChild);
        }
    }
    control.value = next;
};

window.resetSettingsSection = () => {
    const shell = document.getElementById("settingsEditorShell");
    const table = document.getElementById("settingsEditor");
    const status = document.getElementById("settingsEditorStatus");
    if (!shell || !table) return false;

    const section = shell.dataset.activeSection || "general";
    const defaults = window.settingsEditorDefaults();
    let changed = 0;
    Array.from(table.querySelectorAll(`tr[data-settings-group="${section}"]`)).forEach(row => {
        const key = row.cells && row.cells[0] ? row.cells[0].textContent.trim() : "";
        if (!Object.prototype.hasOwnProperty.call(defaults, key)) return;
        const control = row.querySelector("input, select");
        if (!control) return;
        window.setSettingsControlValue(control, defaults[key]);
        changed++;
    });

    if (status) status.innerText = changed
        ? `Reset ${changed} setting${changed === 1 ? "" : "s"} in this section. Save to persist.`
        : "No reset defaults are available for this section.";
    return changed > 0;
};

window.previewSettingsThemeNow = () => {
    const select = document.getElementById("settingsEditor-theme");
    const status = document.getElementById("settingsEditorStatus");
    if (!select) return false;
    try {
        const theme = require(path.join(themesDir, select.value+".json"));
        window._loadTheme(theme);
        if (status) status.innerText = `Previewing theme "${select.value}". Save or Apply Theme to persist it.`;
        return true;
    } catch(error) {
        if (status) status.innerText = `Theme preview failed: ${error.message}`;
        return false;
    }
};

window.applySettingsThemeNow = () => {
    const select = document.getElementById("settingsEditor-theme");
    if (!select) return false;
    window.writeSettingsFile();
    window.themeChanger(select.value);
    return true;
};

window.applyTerminalStyle = () => {
    const style = window.settings.terminalStyle || {};
    const foreground = String(style.foreground || "").trim() || window.theme.terminal.foreground;
    const background = String(style.background || "").trim() || window.theme.terminal.background;
    if (!window.term) return;
    Object.keys(window.term).forEach(key => {
        const terminal = window.term[key] && window.term[key].term;
        if (!terminal) return;
        terminal.options.theme = Object.assign({}, terminal.options.theme || {}, {
            foreground,
            background
        });
    });
};

window.writeFile = (path) => {
    fs.writeFile(path, document.getElementById("fileEdit").value, "utf-8", () => {
        document.getElementById("fedit-status").innerHTML = "<i>File saved.</i>";
    });
};

window.settingsEditorValue = id => {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
};

window.isValidCssColor = value => {
    const color = String(value || "").trim();
    if (!color) return true;
    return !!(window.CSS && CSS.supports && CSS.supports("color", color));
};

window.validateSettingsEditor = () => {
    const errors = [];
    const warnings = [];
    const value = window.settingsEditorValue;
    const numberValue = id => Number(value(id));
    const integerInRange = (id, label, min, max) => {
        const number = numberValue(id);
        if (!Number.isInteger(number) || number < min || number > max) {
            errors.push(`${label} must be an integer between ${min} and ${max}.`);
        }
    };
    const floatInRange = (id, label, min, max) => {
        const number = numberValue(id);
        if (!Number.isFinite(number) || number < min || number > max) {
            errors.push(`${label} must be a number between ${min} and ${max}.`);
        }
    };

    const shellValue = value("settingsEditor-shell");
    if (!shellValue) errors.push("Shell cannot be empty.");
    if (path.isAbsolute(shellValue) && !fs.existsSync(shellValue)) {
        errors.push("Shell path does not exist.");
    }

    const cwdValue = value("settingsEditor-cwd");
    try {
        if (!cwdValue || !fs.existsSync(cwdValue) || !fs.lstatSync(cwdValue).isDirectory()) {
            errors.push("Startup working directory must exist and be a directory.");
        }
    } catch(e) {
        errors.push("Startup working directory cannot be accessed.");
    }

    const themeValue = value("settingsEditor-theme");
    if (!themeValue || !fs.existsSync(path.join(themesDir, themeValue+".json"))) {
        errors.push("Selected theme does not exist.");
    }

    const presetValue = value("settingsEditor-layoutPreset");
    if (!Object.prototype.hasOwnProperty.call(window.revivalLayoutPresets(), presetValue)) {
        errors.push("Layout preset is invalid.");
    }

    const keyboardValue = value("settingsEditor-keyboard");
    if (!keyboardValue || !fs.existsSync(path.join(keyboardsDir, keyboardValue+".json"))) {
        errors.push("Selected keyboard layout does not exist.");
    }

    integerInRange("settingsEditor-port", "Terminal port", 1, 65535);
    integerInRange("settingsEditor-termFontSize", "Terminal font size", 6, 72);
    integerInRange("settingsEditor-performance-systemInfoWorkers", "System information workers", 1, 4);
    integerInRange("settingsEditor-performance-maxSystemInfoWorkers", "Maximum system information workers", 1, 4);
    integerInRange("settingsEditor-performance-systemInfoWorkerIdleMs", "System information worker idle timeout", 5000, 300000);
    integerInRange("settingsEditor-performance-systemInfoWorkerScaleDelayMs", "System information worker scale delay", 100, 60000);
    integerInRange("settingsEditor-spotify-callbackPort", "Spotify callback port", 1024, 65535);
    integerInRange("settingsEditor-spotify-pollIntervalMs", "Spotify polling interval", 2500, 30000);
    floatInRange("settingsEditor-audioVolume", "Audio volume", 0, 1);
    integerInRange("settingsEditor-editor-fontSize", "Editor font size", 8, 72);
    integerInRange("settingsEditor-editor-tabSize", "Editor tab size", 1, 16);
    integerInRange("settingsEditor-ai-contextBytes", "AI context bytes", 1024, 1000000);

    const monitorValue = value("settingsEditor-monitor");
    if (monitorValue) {
        const monitor = Number(monitorValue);
        const displays = edex.screen.getAllDisplays();
        if (!Number.isInteger(monitor) || monitor < 0 || monitor >= displays.length) {
            errors.push("Monitor must match an available display index.");
        }
    }

    const dualMonitorDisplay = value("settingsEditor-dualMonitor-display");
    const displays = edex.screen.getAllDisplays();
    if (dualMonitorDisplay !== "auto") {
        const display = Number(dualMonitorDisplay);
        if (!Number.isInteger(display) || display < 0 || display >= displays.length) {
            errors.push("Dual monitor display must be auto or an available display index.");
        }
    }
    if (!["spotify", "widgets", "terminal", "blank"].includes(value("settingsEditor-dualMonitor-content"))) {
        errors.push("Dual monitor content is invalid.");
    }
    if (!["auto", "landscape", "portrait"].includes(value("settingsEditor-dualMonitor-orientation"))) {
        errors.push("Dual monitor orientation is invalid.");
    }
    if (value("settingsEditor-dualMonitor-enabled") === "true" && displays.length < 2) {
        warnings.push("Dual monitor mode is enabled, but only one display is currently detected.");
    }

    const clockValue = Number(value("settingsEditor-clockHours"));
    if (![12, 24].includes(clockValue)) errors.push("Clock format must be 12 or 24.");

    if (!window.isValidCssColor(value("settingsEditor-terminalStyle-foreground"))) {
        errors.push("Terminal foreground override must be a valid CSS color or empty.");
    }
    if (!window.isValidCssColor(value("settingsEditor-terminalStyle-background"))) {
        errors.push("Terminal background override must be a valid CSS color or empty.");
    }

    const explorerMode = value("settingsEditor-devExplorer-mode");
    if (!["dock", "window", "cockpit"].includes(explorerMode)) errors.push("Explorer mode is invalid.");
    const explorerView = value("settingsEditor-devExplorer-defaultView");
    if (!["list", "grid", "columns", "dualPane"].includes(explorerView)) errors.push("Explorer default view is invalid.");

    if (value("settingsEditor-launcherRail-position") !== "top") errors.push("Launcher header position is invalid.");
    if (!["balanced", "max", "cinematic"].includes(value("settingsEditor-performance-profile"))) errors.push("Performance profile is invalid.");
    if (Number(value("settingsEditor-performance-maxSystemInfoWorkers")) < Number(value("settingsEditor-performance-systemInfoWorkers"))) {
        errors.push("Maximum system information workers must be greater than or equal to the baseline worker count.");
    }
    if (!["off", "ai-only", "always"].includes(value("settingsEditor-performance-enableErrorLens"))) errors.push("Error Lens mode is invalid.");
    if (!["full", "reduced", "offline", "hidden"].includes(value("settingsEditor-widgets-globeMode"))) errors.push("Globe mode is invalid.");
    if (!["smart", "editor", "preview", "external", "ask"].includes(value("settingsEditor-editor-defaultOpenBehavior"))) {
        errors.push("Editor default open behavior is invalid.");
    }

    if (!["auto", "codex", "claude"].includes(value("settingsEditor-ai-defaultProvider"))) {
        errors.push("AI provider is invalid.");
    }

    if (window.settingsEditorValue("settingsEditor-ai-enabled") === "true") {
        warnings.push("Error to Fix is enabled; terminal diagnostics may be sent to the selected local CLI provider after redaction.");
    }

    const spotifyClientId = value("settingsEditor-spotify-clientId");
    if (spotifyClientId && !/^[A-Za-z0-9_-]{8,128}$/.test(spotifyClientId)) {
        errors.push("Spotify Client ID contains invalid characters.");
    }
    const spotifyMarket = value("settingsEditor-spotify-market");
    if (spotifyMarket && !/^[A-Za-z]{2}$/.test(spotifyMarket)) {
        errors.push("Spotify market must be a two-letter country code or empty.");
    }
    if (value("settingsEditor-spotify-enabled") === "true" && !spotifyClientId) {
        warnings.push("Spotify is enabled but no Client ID is configured yet.");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

window.writeSettingsFile = () => {
    const validation = window.validateSettingsEditor();
    const status = document.getElementById("settingsEditorStatus");
    if (!validation.valid) {
        if (status) {
            status.innerHTML = "Settings not saved:<br>"+validation.errors.map(error => "- "+window._escapeHtml(error)).join("<br>");
        }
        return false;
    }

    const previousSettings = window.settings || {};
    const selectedLayoutPreset = document.getElementById("settingsEditor-layoutPreset").value;

    window.settings = {
        shell: document.getElementById("settingsEditor-shell").value,
        shellArgs: document.getElementById("settingsEditor-shellArgs").value,
        cwd: document.getElementById("settingsEditor-cwd").value,
        env: document.getElementById("settingsEditor-env").value,
        username: document.getElementById("settingsEditor-username").value,
        keyboard: document.getElementById("settingsEditor-keyboard").value,
        theme: document.getElementById("settingsEditor-theme").value,
        layoutPreset: selectedLayoutPreset,
        launcherRail: {
            enabled: (document.getElementById("settingsEditor-launcherRail-enabled").value === "true"),
            position: document.getElementById("settingsEditor-launcherRail-position").value,
            compact: (document.getElementById("settingsEditor-launcherRail-compact").value === "true"),
            labels: (document.getElementById("settingsEditor-launcherRail-labels").value === "true"),
            autoHide: true
        },
        dualMonitor: {
            enabled: (document.getElementById("settingsEditor-dualMonitor-enabled").value === "true"),
            display: document.getElementById("settingsEditor-dualMonitor-display").value === "auto"
                ? "auto"
                : Number(document.getElementById("settingsEditor-dualMonitor-display").value),
            content: document.getElementById("settingsEditor-dualMonitor-content").value,
            orientation: document.getElementById("settingsEditor-dualMonitor-orientation").value,
            fullscreen: (document.getElementById("settingsEditor-dualMonitor-fullscreen").value === "true")
        },
        performance: {
            profile: document.getElementById("settingsEditor-performance-profile").value,
            systemInfoWorkers: Number(document.getElementById("settingsEditor-performance-systemInfoWorkers").value),
            maxSystemInfoWorkers: Number(document.getElementById("settingsEditor-performance-maxSystemInfoWorkers").value),
            systemInfoWorkerIdleMs: Number(document.getElementById("settingsEditor-performance-systemInfoWorkerIdleMs").value),
            systemInfoWorkerScaleDelayMs: Number(document.getElementById("settingsEditor-performance-systemInfoWorkerScaleDelayMs").value),
            pauseHiddenWidgets: (document.getElementById("settingsEditor-performance-pauseHiddenWidgets").value === "true"),
            pauseWhenWindowBlurred: (document.getElementById("settingsEditor-performance-pauseWhenWindowBlurred").value === "true"),
            disableBackgroundThrottling: (document.getElementById("settingsEditor-performance-disableBackgroundThrottling").value === "true"),
            enableGlobeByDefault: (document.getElementById("settingsEditor-performance-enableGlobeByDefault").value === "true"),
            enableTerminalWebGL: (document.getElementById("settingsEditor-performance-enableTerminalWebGL").value === "true"),
            enableTerminalLigatures: (document.getElementById("settingsEditor-performance-enableTerminalLigatures").value === "true"),
            enableFeedbackAudio: (document.getElementById("settingsEditor-performance-enableFeedbackAudio").value === "true"),
            enableCinematicAudio: (document.getElementById("settingsEditor-performance-enableCinematicAudio").value === "true"),
            lazyAudio: (document.getElementById("settingsEditor-performance-lazyAudio").value === "true"),
            enableErrorLens: document.getElementById("settingsEditor-performance-enableErrorLens").value
        },
        termFontSize: Number(document.getElementById("settingsEditor-termFontSize").value),
        terminalStyle: {
            foreground: document.getElementById("settingsEditor-terminalStyle-foreground").value.trim(),
            background: document.getElementById("settingsEditor-terminalStyle-background").value.trim()
        },
        terminal: Object.assign({}, previousSettings.terminal || {}, {
            showStartupBanner: (document.getElementById("settingsEditor-terminal-showStartupBanner").value === "true")
        }),
        audio: (document.getElementById("settingsEditor-audio").value === "true"),
        audioVolume: Number(document.getElementById("settingsEditor-audioVolume").value),
        disableFeedbackAudio: (document.getElementById("settingsEditor-disableFeedbackAudio").value === "true"),
        pingAddr: document.getElementById("settingsEditor-pingAddr").value,
        clockHours: Number(document.getElementById("settingsEditor-clockHours").value),
        port: Number(document.getElementById("settingsEditor-port").value),
        monitor: Number(document.getElementById("settingsEditor-monitor").value),
        nointro: (document.getElementById("settingsEditor-nointro").value === "true"),
        nocursor: (document.getElementById("settingsEditor-nocursor").value === "true"),
        iface: document.getElementById("settingsEditor-iface").value,
        allowWindowed: (document.getElementById("settingsEditor-allowWindowed").value === "true"),
        launchOnStartup: (document.getElementById("settingsEditor-launchOnStartup").value === "true"),
        updates: {
            enabled: (document.getElementById("settingsEditor-updates-enabled").value === "true"),
            checkOnStartup: (document.getElementById("settingsEditor-updates-checkOnStartup").value === "true"),
            autoDownload: (document.getElementById("settingsEditor-updates-autoDownload").value === "true"),
            installOnQuit: (document.getElementById("settingsEditor-updates-installOnQuit").value === "true")
        },
        spotify: {
            enabled: (document.getElementById("settingsEditor-spotify-enabled").value === "true"),
            clientId: document.getElementById("settingsEditor-spotify-clientId").value.trim(),
            callbackPort: Number(document.getElementById("settingsEditor-spotify-callbackPort").value),
            pollIntervalMs: Number(document.getElementById("settingsEditor-spotify-pollIntervalMs").value),
            market: document.getElementById("settingsEditor-spotify-market").value.trim().toUpperCase(),
            showAlbumArt: (document.getElementById("settingsEditor-spotify-showAlbumArt").value === "true"),
            showDevices: (document.getElementById("settingsEditor-spotify-showDevices").value === "true")
        },
        ai: {
            enabled: (document.getElementById("settingsEditor-ai-enabled").value === "true"),
            provider: document.getElementById("settingsEditor-ai-defaultProvider").value,
            defaultProvider: document.getElementById("settingsEditor-ai-defaultProvider").value,
            contextBytes: Number(document.getElementById("settingsEditor-ai-contextBytes").value),
            redactSecrets: (document.getElementById("settingsEditor-ai-redactSecrets").value === "true"),
            commands: {
                codex: document.getElementById("settingsEditor-ai-codex").value,
                claude: document.getElementById("settingsEditor-ai-claude").value
            }
        },
        devExplorer: {
            enabled: (document.getElementById("settingsEditor-devExplorer-enabled").value === "true"),
            mode: document.getElementById("settingsEditor-devExplorer-mode").value,
            defaultView: document.getElementById("settingsEditor-devExplorer-defaultView").value,
            showPreview: (document.getElementById("settingsEditor-devExplorer-showPreview").value === "true"),
            showGitStatus: (document.getElementById("settingsEditor-devExplorer-showGitStatus").value === "true"),
            showExtensions: (document.getElementById("settingsEditor-devExplorer-showExtensions").value === "true"),
            confirmTrash: (document.getElementById("settingsEditor-devExplorer-confirmTrash").value === "true"),
            enableAiActions: (document.getElementById("settingsEditor-ai-enabled").value === "true"),
            pinned: window.fsDisp && window.fsDisp.store ? window.fsDisp.store.settings.pinned || [] : (window.settings.devExplorer && window.settings.devExplorer.pinned || []),
            recent: window.fsDisp && window.fsDisp.store ? window.fsDisp.store.settings.recent || [] : (window.settings.devExplorer && window.settings.devExplorer.recent || []),
            recentLimit: window.settings.devExplorer && window.settings.devExplorer.recentLimit || 12,
            tabs: window.fsDisp && window.fsDisp.store ? window.fsDisp.store.settings.tabs || [] : (window.settings.devExplorer && window.settings.devExplorer.tabs || []),
            activeTabId: window.fsDisp && window.fsDisp.store ? window.fsDisp.store.activeTabId : (window.settings.devExplorer && window.settings.devExplorer.activeTabId || "tab-1"),
            windowRect: window.fsDisp && window.fsDisp.store ? window.fsDisp.store.windowRect : (window.settings.devExplorer && window.settings.devExplorer.windowRect)
        },
        editor: {
            enabled: (document.getElementById("settingsEditor-editor-enabled").value === "true"),
            fontSize: Number(document.getElementById("settingsEditor-editor-fontSize").value) || 13,
            tabSize: Number(document.getElementById("settingsEditor-editor-tabSize").value) || 4,
            wordWrap: (document.getElementById("settingsEditor-editor-wordWrap").value === "true"),
            autosave: (document.getElementById("settingsEditor-editor-autosave").value === "true"),
            ideMode: (document.getElementById("settingsEditor-editor-ideMode").value === "true"),
            defaultOpenMode: window.settings.editor && window.settings.editor.defaultOpenMode || "window",
            defaultOpenBehavior: document.getElementById("settingsEditor-editor-defaultOpenBehavior").value,
            useCodeMirror: (document.getElementById("settingsEditor-editor-useCodeMirror").value === "true")
        },
        windowManager: window.settings.windowManager || {
            rememberLayout: true,
            snap: true,
            windows: {}
        },
        ssh: window.normalizeSshSettings(window.settings.ssh || previousSettings.ssh),
        plugins: window.settings.plugins || {
            enabled: true,
            paths: [],
            disabled: [],
            errors: {},
            permissions: {}
        },
        widgets: Object.assign(window.defaultWidgetSettings(), window.settings.widgets || {}, {
            visible: (document.getElementById("settingsEditor-widgets-visible").value === "true"),
            keyboard: (document.getElementById("settingsEditor-widgets-keyboard").value === "true"),
            systemPanel: (document.getElementById("settingsEditor-widgets-systemPanel").value === "true"),
            networkPanel: (document.getElementById("settingsEditor-widgets-networkPanel").value === "true"),
            clock: (document.getElementById("settingsEditor-widgets-clock").value === "true"),
            sysinfo: (document.getElementById("settingsEditor-widgets-sysinfo").value === "true"),
            hardware: (document.getElementById("settingsEditor-widgets-hardware").value === "true"),
            cpu: (document.getElementById("settingsEditor-widgets-cpu").value === "true"),
            memory: (document.getElementById("settingsEditor-widgets-memory").value === "true"),
            processes: (document.getElementById("settingsEditor-widgets-processes").value === "true"),
            spotify: (document.getElementById("settingsEditor-widgets-spotify").value === "true"),
            networkStatus: (document.getElementById("settingsEditor-widgets-networkStatus").value === "true"),
            networkTraffic: (document.getElementById("settingsEditor-widgets-networkTraffic").value === "true"),
            globe: (document.getElementById("settingsEditor-widgets-globe").value === "true"),
            globeMode: document.getElementById("settingsEditor-widgets-globeMode").value,
            showIp: (document.getElementById("settingsEditor-widgets-showIp").value === "true"),
            showInterface: (document.getElementById("settingsEditor-widgets-showInterface").value === "true"),
            showGeo: (document.getElementById("settingsEditor-widgets-showGeo").value === "true"),
            layout: window.normalizeWidgetLayout(window.settings.widgets && window.settings.widgets.layout)
        }),
        forceFullscreen: window.settings.forceFullscreen,
        keepGeometry: (document.getElementById("settingsEditor-keepGeometry").value === "true"),
        excludeThreadsFromToplist: (document.getElementById("settingsEditor-excludeThreadsFromToplist").value === "true"),
        hideDotfiles: (document.getElementById("settingsEditor-hideDotfiles").value === "true"),
        fsListView: (document.getElementById("settingsEditor-fsListView").value === "true"),
        experimentalGlobeFeatures: (document.getElementById("settingsEditor-experimentalGlobeFeatures").value === "true"),
        experimentalFeatures: (document.getElementById("settingsEditor-experimentalFeatures").value === "true")
    };

    Object.keys(window.settings).forEach(key => {
        if (window.settings[key] === "undefined") {
            delete window.settings[key];
        }
    });

    if (selectedLayoutPreset !== (previousSettings.layoutPreset || "classic")) {
        window.applyLayoutPresetToSettings(selectedLayoutPreset);
    } else {
        window.normalizeRevivalSettings();
    }

    fs.writeFileSync(settingsFile, JSON.stringify(window.settings, "", 4));
    edex.startup.set(window.settings.launchOnStartup);
    if (edex.dualMonitor && typeof edex.dualMonitor.apply === "function") {
        edex.dualMonitor.apply().then(state => {
            const status = document.getElementById("settingsEditorStatus");
            if (!status || !state || window.settings.dualMonitor.enabled !== true) return;
            status.innerText += state.running
                ? ` Secondary display running on monitor ${state.display}.`
                : " Secondary display is enabled but no secondary monitor is available.";
        }).catch(error => {
            const status = document.getElementById("settingsEditorStatus");
            if (status) status.innerText += ` Dual monitor apply failed: ${error.message || error}`;
        });
    }
    window.renderLauncherRail();
    window.applyWidgetVisibility();
    window.applyTerminalStyle();
    const suffix = validation.warnings.length ? " Warnings: "+validation.warnings.join(" ") : "";
    document.getElementById("settingsEditorStatus").innerText = "New values written to settings.json file at "+new Date().toTimeString()+"."+suffix;
    return true;
};

window.toggleFullScreen = () => {
    let useFullscreen = (appWindow.isFullScreen() ? false : true);
    appWindow.setFullScreen(useFullscreen);

    //Update settings
    window.lastWindowState["useFullscreen"] = useFullscreen;

    fs.writeFileSync(lastWindowStateFile, JSON.stringify(window.lastWindowState, "", 4));
};

window.isAiIntegrationEnabled = () => !!(window.settings && window.settings.ai && window.settings.ai.enabled === true);

// Display available keyboard shortcuts and custom shortcuts helper
window.openShortcutsHelp = () => {
    if (document.getElementById("settingsEditor")) return;
    const shortcutsDefinition = {
        "COPY": "Copy selected buffer from the terminal.",
        "PASTE": "Paste system clipboard to the terminal.",
        "NEXT_TAB": "Switch to the next opened terminal tab (left to right order).",
        "PREVIOUS_TAB": "Switch to the previous opened terminal tab (right to left order).",
        "TAB_X": "Switch to terminal tab <strong>X</strong>, or create it if it hasn't been opened yet.",
        "SETTINGS": "Open the settings editor.",
        "SHORTCUTS": "List and edit available keyboard shortcuts.",
        "TOGGLE_WIDGETS": "Open the widget visibility panel.",
        "FUZZY_SEARCH": "Search for entries in the current working directory.",
        "FS_LIST_VIEW": "Toggle between list and grid view in the file browser.",
        "FS_DOTFILES": "Toggle hidden files and directories in the file browser.",
        "KB_PASSMODE": "Toggle the on-screen keyboard's \"Password Mode\", which allows you to safely<br>type sensitive information even if your screen might be recorded (disable visual input feedback).",
        "DEV_DEBUG": "Open Chromium Dev Tools, for debugging purposes.",
        "DEV_RELOAD": "Trigger front-end hot reload."
    };

    let appList = "";
    window.shortcuts.filter(e => e.type === "app").forEach(cut => {
        let action = (cut.action.startsWith("TAB_")) ? "TAB_X" : cut.action;
        if (!shortcutsDefinition[action]) return;

        appList += `<tr>
                        <td>${(cut.enabled) ? 'YES' : 'NO'}</td>
                        <td><input disabled type="text" maxlength=25 value="${cut.trigger}"></td>
                        <td>${shortcutsDefinition[action]}</td>
                    </tr>`;
    });

    let customList = "";
    window.shortcuts.filter(e => e.type === "shell").forEach(cut => {
        customList += `<tr>
                            <td>${(cut.enabled) ? 'YES' : 'NO'}</td>
                            <td><input disabled type="text" maxlength=25 value="${cut.trigger}"></td>
                            <td>
                                <input disabled type="text" placeholder="Run terminal command..." value="${cut.action}">
                                <input disabled type="checkbox" name="shortcutsHelpNew_Enter" ${(cut.linebreak) ? 'checked' : ''}>
                                <label for="shortcutsHelpNew_Enter">Enter</label>
                            </td>
                        </tr>`;
    });

    window.keyboard.detach();
    new Modal({
        type: "custom",
        title: `Available Keyboard Shortcuts <i>(v${edex.app.getVersion()})</i>`,
        html: `<h5>Using either the on-screen or a physical keyboard, you can use the following shortcuts:</h5>
                <details open id="shortcutsHelpAccordeon1">
                    <summary>Emulator shortcuts</summary>
                    <table class="shortcutsHelp">
                        <tr>
                            <th>Enabled</th>
                            <th>Trigger</th>
                            <th>Action</th>
                        </tr>
                        ${appList}
                    </table>
                </details>
                <br>
                <details id="shortcutsHelpAccordeon2">
                    <summary>Custom command shortcuts</summary>
                    <table class="shortcutsHelp">
                        <tr>
                            <th>Enabled</th>
                            <th>Trigger</th>
                            <th>Command</th>
                        <tr>
                       ${customList}
                    </table>
                </details>
                <br>`,
        buttons: [
            {label: "Open Shortcuts File", action:`edex.openPath('${shortcutsFile}');appWindow.minimize();`},
            {label: "Reload UI", action: "window.location.reload(true);"},
        ]
    }, () => {
        window.keyboard.attach();
        window.term[window.currentTerm].term.focus();
    });

    let wrap1 = document.getElementById('shortcutsHelpAccordeon1');
    let wrap2 = document.getElementById('shortcutsHelpAccordeon2');

    wrap1.addEventListener('toggle', e => {
        wrap2.open = !wrap1.open;
    });

    wrap2.addEventListener('toggle', e => {
        wrap1.open = !wrap2.open;
    });
};

window.useAppShortcut = action => {
    switch(action) {
        case "COPY":
            if (!window.term || !window.term[window.currentTerm]) return false;
            window.term[window.currentTerm].clipboard.copy();
            return true;
        case "PASTE":
            if (!window.term || !window.term[window.currentTerm]) return false;
            window.term[window.currentTerm].clipboard.paste();
            return true;
        case "NEXT_TAB":
                if (window.term[window.currentTerm+1]) {
                    window.focusShellTab(window.currentTerm+1);
                } else if (window.term[window.currentTerm+2]) {
                    window.focusShellTab(window.currentTerm+2);
                } else if (window.term[window.currentTerm+3]) {
                    window.focusShellTab(window.currentTerm+3);
                } else if (window.term[window.currentTerm+4]) {
                    window.focusShellTab(window.currentTerm+4);
                } else {
                    window.focusShellTab(0);
                }
            return true;
        case "PREVIOUS_TAB":
                let i = window.currentTerm || 4;
                if (window.term[i] && i !== window.currentTerm) {
                    window.focusShellTab(i);
                } else if (window.term[i-1]) {
                    window.focusShellTab(i-1);
                } else if (window.term[i-2]) {
                    window.focusShellTab(i-2);
                } else if (window.term[i-3]) {
                    window.focusShellTab(i-3);
                } else if (window.term[i-4]) {
                    window.focusShellTab(i-4);
                }
            return true;
        case "TAB_1":
            window.focusShellTab(0);
            return true;
        case "TAB_2":
            window.focusShellTab(1);
            return true;
        case "TAB_3":
            window.focusShellTab(2);
            return true;
        case "TAB_4":
            window.focusShellTab(3);
            return true;
        case "TAB_5":
            window.focusShellTab(4);
            return true;
        case "SETTINGS":
            window.openSettings();
            return true;
        case "SHORTCUTS":
            window.openShortcutsHelp();
            return true;
        case "TOGGLE_WIDGETS":
            window.openWidgetVisibility();
            return true;
        case "FUZZY_SEARCH":
            window.activeFuzzyFinder = new FuzzyFinder();
            return true;
        case "FS_LIST_VIEW":
            window.fsDisp.toggleListview();
            return true;
        case "FS_DOTFILES":
            window.fsDisp.toggleHidedotfiles();
            return true;
        case "KB_PASSMODE":
            window.keyboard.togglePasswordMode();
            return true;
        case "DEV_DEBUG":
            edex.window.toggleDevTools();
            return true;
        case "DEV_RELOAD":
            window.location.reload(true);
            return true;
        default:
            console.warn(`Unknown "${action}" app shortcut action`);
            return false;
    }
};

// Global keyboard shortcuts
const globalShortcut = edex.globalShortcut;
if (!window.isSecondaryDisplay) globalShortcut.unregisterAll();

window.registerKeyboardShortcuts = () => {
    if (window.isSecondaryDisplay) return;
    window.shortcuts.forEach(cut => {
        if (!cut.enabled) return;
        if (cut.type === "app") {
            if (cut.action === "COPY" || cut.action === "PASTE") return;
            if (cut.action === "TAB_X") {
                for (let i = 1; i <= 5; i++) {
                    let trigger = cut.trigger.replace("X", i);
                    let dfn = () => { window.useAppShortcut(`TAB_${i}`) };
                    globalShortcut.register(trigger, dfn);
                }
            } else {
                globalShortcut.register(cut.trigger, () => {
                    window.useAppShortcut(cut.action);
                });
            }
        } else if (cut.type === "shell") {
            globalShortcut.register(cut.trigger, () => {
                let fn = (cut.linebreak) ? "writelr" : "write";
                window.term[window.currentTerm][fn](cut.action);
            });
        } else {
            console.warn(`${cut.trigger} has unknown type`);
        }
    });
};
window.registerKeyboardShortcuts();

// See #361
window.addEventListener("focus", () => {
    if (window.isSecondaryDisplay) return;
    window.registerKeyboardShortcuts();
});

window.addEventListener("blur", () => {
    if (window.isSecondaryDisplay) return;
    globalShortcut.unregisterAll();
});

// Prevent showing menu, exiting fullscreen or app with keyboard shortcuts
document.addEventListener("keydown", e => {
    const target = e.target;
    const isXtermHelper = target && target.classList && target.classList.contains("xterm-helper-textarea");
    const isEditableTarget = target && target.closest && target.closest("input, textarea, select, button, [contenteditable='true'], .dev_window, .modal_popup, #filesystem");
    if (!isEditableTarget || isXtermHelper) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyC") {
            e.preventDefault();
            window.useAppShortcut("COPY");
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyV") {
            e.preventDefault();
            window.useAppShortcut("PASTE");
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.code === "Insert") {
            e.preventDefault();
            window.useAppShortcut("COPY");
            return;
        }
        if (e.shiftKey && e.code === "Insert") {
            e.preventDefault();
            window.useAppShortcut("PASTE");
            return;
        }
    }
    if (e.key === "Alt") {
        e.preventDefault();
    }
    if (e.code.startsWith("Alt") && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
    }
    if (e.key === "F11" && !settings.allowWindowed) {
        e.preventDefault();
    }
    if (e.code === "KeyD" && e.ctrlKey) {
        e.preventDefault();
    }
    if (e.code === "KeyA" && e.ctrlKey) {
        e.preventDefault();
    }
});

// Fix #265
window.addEventListener("keyup", e => {
    if (edex.platform === "win32" && e.key === "F4" && e.altKey === true) {
        edex.app.quit();
    }
});

// Fix double-tap zoom on touchscreens
edex.setVisualZoomLevelLimits(1, 1);

// Resize terminal with window
window.onresize = () => {
    if (typeof window.currentTerm !== "undefined") {
        if (typeof window.term[window.currentTerm] !== "undefined") {
            window.term[window.currentTerm].fit();
        }
    }
};

// See #413
window.resizeTimeout = null;
let appWindow = edex.window;
window.appWindow = appWindow;
appWindow.on("resize", () => {
    if (settings.keepGeometry === false) return;
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        let win = edex.window;
        if (win.isFullScreen()) return false;
        if (win.isMaximized()) {
            win.unmaximize();
            win.setFullScreen(true);
            return false;
        }

        let size = win.getSize();

        if (size[0] >= size[1]) {
            win.setSize(size[0], parseInt(size[0] * 9 / 16));
        } else {
            win.setSize(size[1], parseInt(size[1] * 9 / 16));
        }
    }, 100);
});

appWindow.on("leave-full-screen", () => {
    edex.window.setSize(960, 540);
});

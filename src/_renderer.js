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
edex.app.focus();

let i = 0;
if (window.settings.nointro || window.settings.nointroOverride) {
    initGraphicalErrorHandling();
    initSystemInformationProxy();
    document.getElementById("boot_screen").remove();
    document.body.setAttribute("class", "");
    waitForFonts().then(initUI);
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
        initUI();
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
            case "layout":
                return window.devActionOrDefer(action, "openDevLayoutEditor");
            case "theme":
                return window.devActionOrDefer(action, "openDevThemeEditor");
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
        ["network", "network", "Network Lens"],
        ["theme", "theme", "Theme Tools"],
        ["layout", "layout", "Layout Tools"]
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
    networkStatus: true,
    networkTraffic: true,
    globe: true,
    globeMode: "full",
    showIp: true,
    showInterface: true,
    showGeo: true
});

window.normalizeWidgetSettings = () => {
    window.settings.widgets = Object.assign(window.defaultWidgetSettings(), window.settings.widgets || {});
    if (!["full", "reduced", "offline", "hidden"].includes(window.settings.widgets.globeMode)) {
        window.settings.widgets.globeMode = "full";
    }
    return window.settings.widgets;
};

window.areWidgetsVisible = () => window.normalizeWidgetSettings().visible !== false;

window.isWidgetVisible = key => {
    const widgets = window.normalizeWidgetSettings();
    return widgets.visible !== false && widgets[key] !== false;
};

window.__edexWindowBlurred = false;
window.areWidgetTimersPaused = () => {
    const perf = window.performanceSettings();
    return perf.pauseWhenWindowBlurred !== false && (document.hidden || window.__edexWindowBlurred === true);
};

window.setWidgetRuntime = (key, shouldRun) => {
    const map = {
        clock: "clock",
        sysinfo: "sysinfo",
        hardware: "hardwareInspector",
        cpu: "cpuinfo",
        memory: "ramwatcher",
        processes: "toplist",
        networkStatus: "netstat",
        networkTraffic: "conninfo",
        globe: "globe"
    };
    const mod = window.mods && window.mods[map[key]];
    if (!mod) return false;
    if (shouldRun && typeof mod.start === "function") return mod.start();
    if (!shouldRun && typeof mod.stop === "function") return mod.stop();
    return false;
};

window.shouldStartWidgetInitially = key => {
    const perf = window.performanceSettings();
    if (perf.pauseHiddenWidgets === false) return true;
    const widgets = window.normalizeWidgetSettings();
    const visible = widgets.visible !== false;
    const states = {
        clock: visible && widgets.systemPanel !== false && widgets.clock !== false,
        sysinfo: visible && widgets.systemPanel !== false && widgets.sysinfo !== false,
        hardware: visible && widgets.systemPanel !== false && widgets.hardware !== false,
        cpu: visible && widgets.systemPanel !== false && widgets.cpu !== false,
        memory: visible && widgets.systemPanel !== false && widgets.memory !== false,
        processes: visible && widgets.systemPanel !== false && widgets.processes !== false,
        networkStatus: visible && widgets.networkPanel !== false && widgets.networkStatus !== false,
        networkTraffic: visible && widgets.networkPanel !== false && widgets.networkTraffic !== false,
        globe: visible && widgets.networkPanel !== false && widgets.globe !== false && widgets.globeMode !== "hidden" && perf.enableGlobeByDefault !== false
    };
    return !!states[key] && !window.areWidgetTimersPaused();
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
    const map = {
        clock: "clock",
        sysinfo: "sysinfo",
        hardware: "hardwareInspector",
        cpu: "cpuinfo",
        memory: "ramwatcher",
        processes: "toplist",
        networkStatus: "netstat",
        networkTraffic: "conninfo",
        globe: "globe"
    };
    const widgets = {};
    Object.keys(map).forEach(key => {
        const mod = window.mods && window.mods[map[key]];
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

window.applyWidgetVisibility = () => {
    const widgets = window.normalizeWidgetSettings();
    const perf = window.performanceSettings();
    const visible = widgets.visible !== false;
    const globeMode = widgets.globeMode || "full";
    const globeEnabled = perf.enableGlobeByDefault !== false;
    const hidden = [];
    const setHidden = (selector, hide, key) => {
        document.querySelectorAll(selector).forEach(element => element.classList.toggle("widget-hidden", hide));
        if (hide && key) hidden.push(key);
    };

    setHidden("section#keyboard", !visible || widgets.keyboard === false, "keyboard");
    setHidden("section#mod_column_left", !visible || widgets.systemPanel === false, "systemPanel");
    setHidden("section#mod_column_right", !visible || widgets.networkPanel === false, "networkPanel");
    setHidden("#mod_clock", !visible || widgets.systemPanel === false || widgets.clock === false, "clock");
    setHidden("#mod_sysinfo", !visible || widgets.systemPanel === false || widgets.sysinfo === false, "sysinfo");
    setHidden("#mod_hardwareInspector", !visible || widgets.systemPanel === false || widgets.hardware === false, "hardware");
    setHidden("#mod_cpuinfo", !visible || widgets.systemPanel === false || widgets.cpu === false, "cpu");
    setHidden("#mod_ramwatcher", !visible || widgets.systemPanel === false || widgets.memory === false, "memory");
    setHidden("#mod_toplist", !visible || widgets.systemPanel === false || widgets.processes === false, "processes");
    setHidden("#mod_netstat", !visible || widgets.networkPanel === false || widgets.networkStatus === false, "networkStatus");
    setHidden("#mod_conninfo", !visible || widgets.networkPanel === false || widgets.networkTraffic === false, "networkTraffic");
    setHidden("#mod_globe", !visible || widgets.networkPanel === false || widgets.globe === false || globeMode === "hidden" || !globeEnabled, "globe");
    window.syncWidgetLifecycles({
        clock: visible && widgets.systemPanel !== false && widgets.clock !== false,
        sysinfo: visible && widgets.systemPanel !== false && widgets.sysinfo !== false,
        hardware: visible && widgets.systemPanel !== false && widgets.hardware !== false,
        cpu: visible && widgets.systemPanel !== false && widgets.cpu !== false,
        memory: visible && widgets.systemPanel !== false && widgets.memory !== false,
        processes: visible && widgets.systemPanel !== false && widgets.processes !== false,
        networkStatus: visible && widgets.networkPanel !== false && widgets.networkStatus !== false,
        networkTraffic: visible && widgets.networkPanel !== false && widgets.networkTraffic !== false,
        globe: visible && widgets.networkPanel !== false && widgets.globe !== false && globeMode !== "hidden" && globeEnabled
    });

    document.body.classList.toggle("widgets-hidden", !visible);
    document.body.classList.toggle("widgets-keyboard-hidden", !visible || widgets.keyboard === false);
    document.body.classList.toggle("widgets-system-hidden", !visible || widgets.systemPanel === false);
    document.body.classList.toggle("widgets-network-hidden", !visible || widgets.networkPanel === false);
    document.body.classList.toggle("widgets-side-hidden", !visible || (widgets.systemPanel === false && widgets.networkPanel === false));
    document.body.classList.toggle("widgets-hide-ip", widgets.showIp === false);
    document.body.classList.toggle("widgets-hide-interface", widgets.showInterface === false);
    document.body.classList.toggle("widgets-hide-geo", widgets.showGeo === false);
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

window.applyWidgetVisibilityFromModal = () => {
    const widgets = window.normalizeWidgetSettings();
    document.querySelectorAll("#widgetVisibilityPanel input[type='checkbox'][data-widget-key]").forEach(input => {
        widgets[input.dataset.widgetKey] = input.checked;
    });
    widgets.visible = document.getElementById("widgetToggle-visible").checked;
    const globeMode = document.getElementById("widgetToggle-globeMode");
    if (globeMode) widgets.globeMode = globeMode.value;
    window.applyWidgetVisibility();
    window.persistWidgetVisibility();
    const status = document.getElementById("widgetVisibilityStatus");
    if (status) status.textContent = "Saved at "+new Date().toTimeString();
    return true;
};

window.openWidgetVisibility = () => {
    if (document.getElementById("widgetVisibilityPanel")) return;
    const widgets = window.normalizeWidgetSettings();
    const row = (key, label, description) => `
        <label class="widget_visibility_row">
            <input type="checkbox" data-widget-key="${key}" ${widgets[key] !== false ? "checked" : ""}>
            <span><strong>${label}</strong><em>${description}</em></span>
        </label>`;

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
                    <h4>Layout</h4>
                    ${row("keyboard", "Keyboard", "On-screen keyboard at the bottom.")}
                    ${row("systemPanel", "System panel", "Left column container.")}
                    ${row("networkPanel", "Network panel", "Right column container.")}
                </section>
                <section>
                    <h4>System Widgets</h4>
                    ${row("clock", "Clock", "Large digital clock.")}
                    ${row("sysinfo", "System status", "Date, uptime and power state.")}
                    ${row("hardware", "Hardware identity", "Manufacturer/model/chassis block.")}
                    ${row("cpu", "CPU graphs", "CPU usage, speed and tasks.")}
                    ${row("memory", "Memory graph", "RAM and swap widget.")}
                    ${row("processes", "Top processes", "Process list widget.")}
                </section>
                <section>
                    <h4>Network Widgets</h4>
                    ${row("networkStatus", "Network status", "Online state and ping block.")}
                    ${row("networkTraffic", "Traffic graph", "Upload/download graph.")}
                    ${row("globe", "World view", "Network globe and endpoint map.")}
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
            {label: "Show All", action: "window.setWidgetModalState(true);document.getElementById('widgetToggle-visible').checked=true;"},
            {label: "Hide All", action: "window.setWidgetModalState(false);document.getElementById('widgetToggle-visible').checked=false;"},
            {label: "Save", action: "window.applyWidgetVisibilityFromModal();"}
        ]
    });
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
    let keyboards = "", themes = "", monitors = "", ifaces = "";
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
    for (let i = 0; i < edex.screen.getAllDisplays().length; i++) {
        if (i !== window.settings.monitor) monitors += `<option>${i}</option>`;
    }
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
        buttons: [
            {label: "Open in External Editor", action:`edex.openPath('${settingsFile}');appWindow.minimize();`},
            {label: "Save to Disk", action: "window.writeSettingsFile()"},
            {label: "Reload UI", action: "window.location.reload(true);"},
            {label: "Restart eDEX", action: "edex.app.relaunch();edex.app.quit();"}
        ]
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
    if (/^devExplorer\.|^hideDotfiles$|^fsListView$/.test(key)) return "explorer";
    if (/^editor\./.test(key)) return "editor";
    if (/^ai\./.test(key)) return "ai";
    if (/^widgets\./.test(key)) return "widgets";
    if (/^updates\./.test(key)) return "updates";
    if (/^privacy\./.test(key)) return "privacy";
    if (/^performance\./.test(key)) return "performance";
    if (/^theme$|^layoutPreset$|^launcherRail\.|^keyboard$|^monitor$|^clockHours$|^nointro$|^nocursor$|^allowWindowed$|^keepGeometry$/.test(key)) return "appearance";
    if (/^iface$|^pingAddr$/.test(key)) return "network";
    if (/^shell|^cwd$|^env$|^termFontSize$|^terminalStyle\.|^terminal\.|^port$|^launchOnStartup$/.test(key)) return "terminal";
    if (/^experimental|^excludeThreadsFromToplist$/.test(key)) return "advanced";
    return "general";
};

window.enhanceSettingsEditor = () => {
    const table = document.getElementById("settingsEditor");
    if (!table || table.dataset.enhanced === "true") return;
    table.dataset.enhanced = "true";

    const sections = [
        ["general", "General"],
        ["appearance", "Appearance"],
        ["terminal", "Terminal"],
        ["explorer", "File Explorer"],
        ["editor", "Editor"],
        ["widgets", "Widgets"],
        ["updates", "Updates"],
        ["privacy", "Privacy"],
        ["performance", "Performance"],
        ["network", "Network"],
        ["ai", "AI"],
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
            <span>Change values, save to disk, then reload/restart when required.</span>
        </div>
        <button type="button" data-settings-action="preview-theme">Preview Theme</button>
        <button type="button" data-settings-action="apply-theme">Apply Theme</button>
        <button type="button" data-settings-action="reset-section">Reset Section</button>
        <button type="button" data-settings-action="export-profile">Export</button>
        <button type="button" data-settings-action="import-profile">Import</button>
        <button type="button" data-settings-action="save">Save</button>`;

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

    const activate = section => {
        shell.dataset.activeSection = section;
        tabs.querySelectorAll("button").forEach(button => {
            button.classList.toggle("active", button.dataset.settingsSection === section);
        });
        table.querySelectorAll("tr[data-settings-group]").forEach(row => {
            row.classList.toggle("settings_section_hidden", row.dataset.settingsGroup !== section);
        });
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
    });
    const testShellButton = document.getElementById("settingsEditor-testShell");
    if (testShellButton) {
        testShellButton.addEventListener("click", () => window.testSettingsShell());
    }

    activate("general");
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
    termFontSize: 15,
    "terminalStyle.foreground": "",
    "terminalStyle.background": "",
    "terminal.showStartupBanner": true,
    "updates.enabled": true,
    "updates.checkOnStartup": true,
    "updates.autoDownload": true,
    "updates.installOnQuit": true,
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
            networkStatus: (document.getElementById("settingsEditor-widgets-networkStatus").value === "true"),
            networkTraffic: (document.getElementById("settingsEditor-widgets-networkTraffic").value === "true"),
            globe: (document.getElementById("settingsEditor-widgets-globe").value === "true"),
            globeMode: document.getElementById("settingsEditor-widgets-globeMode").value,
            showIp: (document.getElementById("settingsEditor-widgets-showIp").value === "true"),
            showInterface: (document.getElementById("settingsEditor-widgets-showInterface").value === "true"),
            showGeo: (document.getElementById("settingsEditor-widgets-showGeo").value === "true")
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
            window.term[window.currentTerm].clipboard.copy();
            return true;
        case "PASTE":
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
globalShortcut.unregisterAll();

window.registerKeyboardShortcuts = () => {
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
    window.registerKeyboardShortcuts();
});

window.addEventListener("blur", () => {
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

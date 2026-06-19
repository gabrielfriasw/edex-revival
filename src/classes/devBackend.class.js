const crypto = require("crypto");
const dns = require("dns");
const fs = require("fs");
const fsp = fs.promises;
const http = require("http");
const https = require("https");
const os = require("os");
const path = require("path");
const url = require("url");
const childProcess = require("child_process");
const {clipboard, safeStorage} = require("electron");
const mime = require("mime-types");

const MAX_PREVIEW_BYTES = 1024 * 1024;
const DEFAULT_CONTEXT_BYTES = 60000;
const MAX_EDITOR_BYTES = 5 * 1024 * 1024;
const MAX_WORKSPACE_FILES = 2500;
const MAX_WORKSPACE_SEARCH_MATCHES = 250;
const MAX_WORKSPACE_SEARCH_BYTES = 256 * 1024;
const SPOTIFY_TOKEN_SKEW_MS = 60000;
const SPOTIFY_IMAGE_MAX_BYTES = 768 * 1024;
const SPOTIFY_SCOPES = [
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-modify-playback-state"
];

const moduleCache = {};

async function loadModule(name) {
    if (!moduleCache[name]) {
        moduleCache[name] = import(name);
    }
    const mod = await moduleCache[name];
    return mod.default || mod;
}

function isSafeLocalPath(value) {
    return typeof value === "string"
        && value.length > 0
        && value.length < 4096
        && !value.includes("\0")
        && !/^[a-z]+:\/\//i.test(value);
}

function resolveLocalPath(value) {
    if (!isSafeLocalPath(value)) throw new Error("Invalid local path");
    return path.resolve(value);
}

function readJsonFile(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, ""));
    } catch(e) {
        return fallback;
    }
}

function writeJsonFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf-8");
}

function mergeDefaults(target, defaults) {
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
            mergeDefaults(target[key], defaults[key]);
        }
    });
    return target;
}

function defaultAiSettings() {
    return {
        enabled: false,
        provider: "auto",
        defaultProvider: "auto",
        contextBytes: DEFAULT_CONTEXT_BYTES,
        redactSecrets: true,
        commands: {
            codex: "codex",
            claude: "claude"
        }
    };
}

function defaultSpotifySettings() {
    return {
        enabled: false,
        clientId: "",
        callbackPort: 43879,
        pollIntervalMs: 5000,
        market: "",
        showAlbumArt: true,
        showDevices: true
    };
}

function defaultDevSettings() {
    return {
        layoutPreset: "classic",
        launcherRail: {
            enabled: true,
            position: "top",
            compact: false,
            labels: true,
            autoHide: true
        },
        performance: {
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
        },
        ai: defaultAiSettings(),
        spotify: defaultSpotifySettings(),
        ssh: {
            profiles: [],
            lastProfileId: ""
        },
        devExplorer: {
            enabled: true,
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
        },
        editor: {
            enabled: true,
            fontSize: 13,
            tabSize: 4,
            wordWrap: true,
            autosave: false,
            defaultOpenMode: "window",
            defaultOpenBehavior: "smart",
            ideMode: true,
            useCodeMirror: false
        },
        windowManager: {
            rememberLayout: true,
            snap: true,
            windows: {}
        },
        plugins: {
            enabled: true,
            paths: [],
            disabled: [],
            errors: {},
            permissions: {}
        },
        launchOnStartup: false
    };
}

function clampInteger(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isInteger(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

function normalizeAiProvider(value) {
    const provider = String(value || "").toLowerCase();
    return ["auto", "codex", "claude"].includes(provider) ? provider : "auto";
}

function normalizeAiSettings(ai) {
    const next = mergeDefaults(ai && typeof ai === "object" && !Array.isArray(ai) ? ai : {}, defaultAiSettings());
    next.enabled = next.enabled === true;
    next.provider = normalizeAiProvider(next.provider || next.defaultProvider || "auto");
    next.defaultProvider = normalizeAiProvider(next.defaultProvider || next.provider);
    if (next.defaultProvider === "auto" && next.provider !== "auto") next.defaultProvider = next.provider;
    next.contextBytes = clampInteger(next.contextBytes, 1024, 1000000, DEFAULT_CONTEXT_BYTES);
    next.redactSecrets = next.redactSecrets !== false;
    next.commands = Object.assign({codex: "codex", claude: "claude"}, next.commands || {});
    next.commands.codex = String(next.commands.codex || "codex").trim() || "codex";
    next.commands.claude = String(next.commands.claude || "claude").trim() || "claude";
    delete next.ollama;
    return next;
}

function normalizeSpotifySettings(spotify) {
    const defaults = defaultSpotifySettings();
    const next = mergeDefaults(spotify && typeof spotify === "object" && !Array.isArray(spotify) ? spotify : {}, defaults);
    next.enabled = next.enabled === true;
    next.clientId = String(next.clientId || "").trim();
    if (!/^[A-Za-z0-9_-]{0,128}$/.test(next.clientId)) next.clientId = "";
    next.callbackPort = clampInteger(next.callbackPort, 1024, 65535, defaults.callbackPort);
    next.pollIntervalMs = clampInteger(next.pollIntervalMs, 2500, 30000, defaults.pollIntervalMs);
    next.market = String(next.market || "").trim().toUpperCase();
    if (next.market && !/^[A-Z]{2}$/.test(next.market)) next.market = "";
    next.showAlbumArt = next.showAlbumArt !== false;
    next.showDevices = next.showDevices !== false;
    return next;
}

function normalizePerformanceSettings(performance) {
    const defaults = defaultDevSettings().performance;
    const source = performance && typeof performance === "object" && !Array.isArray(performance) ? performance : {};
    const next = mergeDefaults(source, defaults);
    if (!["balanced", "max", "cinematic"].includes(next.profile)) next.profile = "balanced";
    next.systemInfoWorkers = clampInteger(next.systemInfoWorkers, 1, 4, defaults.systemInfoWorkers);
    next.maxSystemInfoWorkers = clampInteger(next.maxSystemInfoWorkers, next.systemInfoWorkers, 4, defaults.maxSystemInfoWorkers);
    next.systemInfoWorkerIdleMs = clampInteger(next.systemInfoWorkerIdleMs, 5000, 300000, defaults.systemInfoWorkerIdleMs);
    next.systemInfoWorkerScaleDelayMs = clampInteger(next.systemInfoWorkerScaleDelayMs, 100, 60000, defaults.systemInfoWorkerScaleDelayMs);
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
}

function normalizeSettings(settings) {
    const next = mergeDefaults(settings || {}, defaultDevSettings());
    next.ai = normalizeAiSettings(next.ai);
    next.spotify = normalizeSpotifySettings(next.spotify);
    next.performance = normalizePerformanceSettings(next.performance);
    return next;
}

async function accessReport(target, type) {
    const report = {
        path: target,
        exists: false,
        readable: false,
        writable: false,
        type,
        error: null
    };

    try {
        const stats = await fsp.stat(target);
        report.exists = true;
        report.type = stats.isDirectory() ? "directory" : (stats.isFile() ? "file" : "other");
    } catch(error) {
        report.error = error.message;
        return report;
    }

    try {
        await fsp.access(target, fs.constants.R_OK);
        report.readable = true;
    } catch(error) {
        report.readError = error.message;
    }

    try {
        await fsp.access(target, fs.constants.W_OK);
        report.writable = true;
    } catch(error) {
        report.writeError = error.message;
    }

    return report;
}

function diagnosticStatus(condition, warnCondition) {
    if (condition) return "ok";
    if (warnCondition) return "warn";
    return "error";
}

function stripControlText(value) {
    return String(value || "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function redactSecrets(input) {
    let text = stripControlText(input);

    text = text.replace(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");
    text = text.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/gi, "Bearer [REDACTED_TOKEN]");
    text = text.replace(/\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN|GH_TOKEN|NPM_TOKEN|AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID)\s*=\s*["']?[^"'\s]+["']?/gi, "$1=[REDACTED]");
    text = text.replace(/^([A-Za-z0-9_.-]*(?:KEY|TOKEN|SECRET|PASSWORD)[A-Za-z0-9_.-]*\s*=\s*).+$/gim, "$1[REDACTED]");
    text = text.replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9_]{16,}|github_pat_[A-Za-z0-9_]{24,})\b/g, "[REDACTED_TOKEN]");

    return text;
}

function quotePowerShell(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function quotePosix(value) {
    return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function buildPipeCommand(command, promptFile) {
    if (process.platform === "win32") {
        return `Get-Content -Raw -LiteralPath ${quotePowerShell(promptFile)} | ${command}`;
    }
    return `cat ${quotePosix(promptFile)} | ${command}`;
}

function limitedUtf8(text, maxBytes) {
    const source = String(text || "");
    const bytes = Buffer.from(source, "utf-8");
    if (bytes.length <= maxBytes) {
        return {text: source, bytes: bytes.length, truncated: false};
    }
    const limited = bytes.subarray(0, maxBytes).toString("utf-8").replace(/\uFFFD$/g, "");
    return {text: limited, bytes: Buffer.byteLength(limited, "utf-8"), truncated: true};
}

function prepareAiPrompt(settingsOrAi, prompt) {
    const ai = settingsOrAi && typeof settingsOrAi === "object" && typeof settingsOrAi.enabled !== "undefined"
        ? normalizeAiSettings(settingsOrAi)
        : normalizeSettings(settingsOrAi || {}).ai;
    if (ai.enabled !== true) {
        throw new Error("AI integration is disabled");
    }
    const source = ai.redactSecrets === false ? stripControlText(prompt) : redactSecrets(prompt);
    const limited = limitedUtf8(source, Number(ai.contextBytes) || DEFAULT_CONTEXT_BYTES);
    return {
        prompt: limited.text,
        bytes: limited.bytes,
        truncated: limited.truncated,
        redacted: ai.redactSecrets !== false
    };
}

async function detectCommand(command) {
    if (typeof command !== "string" || command.trim() === "") {
        return {command, available: false, path: null, error: "empty command"};
    }

    const firstToken = command.trim().match(/^"([^"]+)"|'([^']+)'|(\S+)/);
    const executable = firstToken ? (firstToken[1] || firstToken[2] || firstToken[3]) : command;

    try {
        const which = await loadModule("which");
        const resolved = await which(executable);
        return {command, executable, available: true, path: resolved};
    } catch(error) {
        return {command, executable, available: false, path: null, error: error.message};
    }
}

async function getGit(cwd) {
    const simpleGit = await loadModule("simple-git");
    return simpleGit({baseDir: cwd, binary: "git", maxConcurrentProcesses: 1});
}

function relativeGitPath(root, file) {
    return path.relative(root, file).replace(/\\/g, "/");
}

async function getGitStatusMap(dir) {
    try {
        const git = await getGit(dir);
        const root = (await git.revparse(["--show-toplevel"])).trim();
        const status = await git.status();
        const map = {};

        status.files.forEach(file => {
            map[file.path] = file.working_dir || file.index || "?";
        });

        return {isRepo: true, root, branch: status.current, map};
    } catch(error) {
        return {isRepo: false, root: null, branch: null, map: {}, error: error.message};
    }
}

function classifyDirent(name, stats, dirent) {
    const ext = path.extname(name).slice(1).toLowerCase();
    const isDirectory = dirent ? dirent.isDirectory() : stats.isDirectory();
    const isSymbolicLink = dirent ? dirent.isSymbolicLink() : stats.isSymbolicLink();
    const isFile = dirent ? dirent.isFile() : stats.isFile();

    let type = "other";
    if (isDirectory) type = "dir";
    if (isSymbolicLink) type = "symlink";
    if (isFile) type = "file";

    return {type, ext, hidden: name.startsWith(".")};
}

async function readDirectory(rawDir, options = {}) {
    const dir = resolveLocalPath(rawDir);
    const entries = await fsp.readdir(dir, {withFileTypes: true});
    const git = options.git ? await getGitStatusMap(dir) : {isRepo: false, root: null, branch: null, map: {}};

    const items = await Promise.all(entries.map(async dirent => {
        const itemPath = path.join(dir, dirent.name);
        let stats = null;
        try {
            stats = await fsp.lstat(itemPath);
        } catch(error) {
            return {
                name: dirent.name,
                path: itemPath,
                type: "system",
                ext: "",
                hidden: dirent.name.startsWith("."),
                size: null,
                mtime: null,
                git: null,
                error: error.message
            };
        }

        const classified = classifyDirent(dirent.name, stats, dirent);
        let gitStatus = null;
        if (git.isRepo) {
            const rel = relativeGitPath(git.root, itemPath);
            gitStatus = git.map[rel] || null;
        }

        return {
            name: dirent.name,
            path: itemPath,
            type: classified.type,
            ext: classified.ext,
            hidden: classified.hidden,
            size: stats.size,
            mtime: stats.mtimeMs,
            git: gitStatus
        };
    }));

    if (git.isRepo) {
        const existing = new Set(items.map(item => item.path));
        Object.keys(git.map).forEach(rel => {
            const itemPath = path.join(git.root, rel);
            if (existing.has(itemPath) || path.dirname(itemPath) !== dir) return;
            const status = git.map[rel];
            if (!String(status || "").includes("D")) return;
            items.push({
                name: path.basename(itemPath),
                path: itemPath,
                type: "deleted",
                ext: path.extname(itemPath).slice(1).toLowerCase(),
                hidden: path.basename(itemPath).startsWith("."),
                size: null,
                mtime: null,
                git: status
            });
        });
    }

    const ordering = {dir: 0, symlink: 1, file: 2, system: 3, other: 4};
    items.sort((a, b) => {
        const diff = (ordering[a.type] || 4) - (ordering[b.type] || 4);
        return diff || a.name.localeCompare(b.name);
    });

    return {
        cwd: dir,
        parent: path.dirname(dir),
        separator: path.sep,
        git: {
            isRepo: git.isRepo,
            root: git.root,
            branch: git.branch
        },
        items
    };
}

async function statPath(rawTarget) {
    const target = resolveLocalPath(rawTarget);
    const stats = await fsp.lstat(target);
    const classified = classifyDirent(path.basename(target), stats, null);
    return {
        path: target,
        name: path.basename(target),
        type: classified.type,
        ext: classified.ext,
        hidden: classified.hidden,
        size: stats.size,
        mtime: stats.mtimeMs,
        atime: stats.atimeMs,
        ctime: stats.ctimeMs,
        birthtime: stats.birthtimeMs,
        mode: stats.mode,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        isSymbolicLink: stats.isSymbolicLink()
    };
}

function createHexPreview(buffer) {
    const lines = [];
    for (let offset = 0; offset < buffer.length; offset += 16) {
        const slice = buffer.subarray(offset, offset + 16);
        const hex = Array.from(slice).map(byte => byte.toString(16).padStart(2, "0")).join(" ").padEnd(47, " ");
        const ascii = Array.from(slice).map(byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".").join("");
        lines.push(`${offset.toString(16).padStart(8, "0")}  ${hex}  ${ascii}`);
    }
    return lines.join("\n");
}

function utf8DecodeError(buffer) {
    const replacement = Buffer.from([0xef, 0xbf, 0xbd]).toString("utf-8");
    return buffer.toString("utf-8").includes(replacement);
}

function editorReadError(code, message, extra = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, extra);
    return error;
}

async function previewFile(rawFile, requestedBytes) {
    const file = resolveLocalPath(rawFile);
    const stats = await fsp.stat(file);
    if (!stats.isFile()) {
        return {path: file, kind: "directory", size: stats.size};
    }

    const limit = Math.max(1024, Math.min(Number(requestedBytes) || MAX_PREVIEW_BYTES, MAX_PREVIEW_BYTES));
    const ext = path.extname(file).slice(1).toLowerCase();
    const mimeType = mime.lookup(file) || "application/octet-stream";
    const fileURL = url.pathToFileURL(file).toString();

    if (mimeType.startsWith("image/")) {
        return {path: file, url: fileURL, kind: "image", mime: mimeType, size: stats.size};
    }

    if (mimeType === "application/pdf") {
        return {path: file, url: fileURL, kind: "pdf", mime: mimeType, size: stats.size};
    }

    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
        return {path: file, url: fileURL, kind: "media", mime: mimeType, size: stats.size};
    }

    const textExts = new Set([
        "txt", "md", "markdown", "json", "jsonc", "js", "jsx", "ts", "tsx", "mjs", "cjs",
        "css", "scss", "html", "xml", "yml", "yaml", "toml", "ini", "env", "ps1", "sh",
        "bat", "cmd", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "cs", "php",
        "sql", "log", "gitignore", "dockerfile"
    ]);
    const isTextMime = /^text\//.test(mimeType) || /json|javascript|xml|yaml|toml/i.test(mimeType);

    if (textExts.has(ext) || isTextMime || path.basename(file).toLowerCase() === "dockerfile") {
        const handle = await fsp.open(file, "r");
        try {
            const buffer = Buffer.alloc(Math.min(limit, stats.size));
            await handle.read(buffer, 0, buffer.length, 0);
            return {
                path: file,
                kind: ext === "md" || ext === "markdown" ? "markdown" : (ext === "json" || ext === "jsonc" ? "json" : "text"),
                mime: mimeType,
                size: stats.size,
                truncated: stats.size > buffer.length,
                content: buffer.toString("utf-8")
            };
        } finally {
            await handle.close();
        }
    }

    const handle = await fsp.open(file, "r");
    try {
        const buffer = Buffer.alloc(Math.min(4096, stats.size));
        await handle.read(buffer, 0, buffer.length, 0);
        return {
            path: file,
            kind: "binary",
            mime: mimeType,
            size: stats.size,
            truncated: stats.size > buffer.length,
            hex: createHexPreview(buffer)
        };
    } finally {
        await handle.close();
    }
}

async function readEditorFile(rawFile, requestedBytes) {
    const file = resolveLocalPath(rawFile);
    let stats;
    try {
        stats = await fsp.stat(file);
    } catch(error) {
        if (error && ["EACCES", "EPERM"].includes(error.code)) {
            throw editorReadError("permission-denied", `Permission denied while reading ${path.basename(file)}.`, {path: file});
        }
        throw error;
    }
    if (!stats.isFile()) throw editorReadError("not-file", "Editor can open files only", {path: file});
    const limit = Math.max(1024, Math.min(Number(requestedBytes) || MAX_EDITOR_BYTES, MAX_EDITOR_BYTES));
    if (stats.size > limit) {
        throw editorReadError("file-too-large", `File is too large for editor (${stats.size} bytes).`, {
            path: file,
            size: stats.size,
            limit
        });
    }
    let buffer;
    try {
        buffer = await fsp.readFile(file);
    } catch(error) {
        if (error && ["EACCES", "EPERM"].includes(error.code)) {
            throw editorReadError("permission-denied", `Permission denied while reading ${path.basename(file)}.`, {path: file});
        }
        throw error;
    }
    if (buffer.includes(0)) {
        throw editorReadError("binary-file", "Binary file detected. Use Preview or Open External instead.", {
            path: file,
            size: stats.size
        });
    }
    if (utf8DecodeError(buffer)) {
        throw editorReadError("invalid-utf8", "File is not valid UTF-8. Use Preview or Open External instead.", {
            path: file,
            size: stats.size
        });
    }
    return {
        path: file,
        name: path.basename(file),
        size: stats.size,
        mtime: stats.mtimeMs,
        encoding: "utf-8",
        content: buffer.toString("utf-8")
    };
}

async function writeEditorFile(rawFile, content) {
    const file = resolveLocalPath(rawFile);
    await fsp.mkdir(path.dirname(file), {recursive: true});
    await fsp.writeFile(file, String(content == null ? "" : content), "utf-8");
    const stats = await fsp.stat(file);
    return {
        path: file,
        name: path.basename(file),
        size: stats.size,
        mtime: stats.mtimeMs
    };
}

async function listDrives() {
    if (process.platform !== "win32") {
        return [{name: "/", path: "/", type: "root"}];
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const drives = [];
    await Promise.all(letters.map(async letter => {
        const drivePath = `${letter}:\\`;
        try {
            await fsp.access(drivePath);
            drives.push({name: `${letter}:`, path: drivePath, type: "drive"});
        } catch(e) {}
    }));
    drives.sort((a, b) => a.name.localeCompare(b.name));
    return drives;
}

function pluginSearchPaths(settings, app) {
    const configured = settings.plugins && Array.isArray(settings.plugins.paths) ? settings.plugins.paths : [];
    const defaults = [
        path.join(app.getPath("userData"), "plugins"),
        path.join(app.getAppPath(), "plugins")
    ];
    return defaults.concat(configured).filter(Boolean);
}

async function listPlugins(settings, app) {
    const disabled = new Set(settings.plugins && Array.isArray(settings.plugins.disabled) ? settings.plugins.disabled : []);
    const errors = settings.plugins && settings.plugins.errors && typeof settings.plugins.errors === "object" ? settings.plugins.errors : {};
    const roots = pluginSearchPaths(settings, app);
    const plugins = [];

    for (const root of roots) {
        const safeRoot = resolveLocalPath(root);
        let entries = [];
        try {
            entries = await fsp.readdir(safeRoot, {withFileTypes: true});
        } catch(e) {
            continue;
        }

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const dir = path.join(safeRoot, entry.name);
            const manifestFile = path.join(dir, "plugin.json");
            const manifest = readJsonFile(manifestFile, null);
            if (!manifest || typeof manifest.id !== "string" || typeof manifest.entry !== "string") continue;
            const entryPath = path.resolve(dir, manifest.entry);
            if (!entryPath.startsWith(dir + path.sep) && entryPath !== dir) continue;
            plugins.push({
                id: manifest.id,
                name: manifest.name || manifest.id,
                version: manifest.version || "0.0.0",
                description: manifest.description || "",
                permissions: Array.isArray(manifest.permissions) ? manifest.permissions : [],
                contributes: manifest.contributes || {},
                root: dir,
                entry: entryPath,
                enabled: !disabled.has(manifest.id),
                error: errors[manifest.id] || ""
            });
        }
    }

    return plugins;
}

async function resolveEndpoint(value) {
    const target = stripControlText(value).trim();
    if (!target || target.length > 255) throw new Error("Invalid endpoint");
    const ipRe = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    if (ipRe.test(target)) return {input: target, ip: target, hostname: null};
    const result = await dns.promises.lookup(target, {family: 4});
    return {input: target, ip: result.address, hostname: target, family: result.family};
}

async function hashPath(rawFile) {
    const file = resolveLocalPath(rawFile);
    const stats = await fsp.stat(file);
    if (!stats.isFile()) throw new Error("Hashes are available for files only");

    const hashes = {
        md5: crypto.createHash("md5"),
        sha1: crypto.createHash("sha1"),
        sha256: crypto.createHash("sha256")
    };

    await new Promise((resolve, reject) => {
        const stream = fs.createReadStream(file);
        stream.on("data", chunk => {
            hashes.md5.update(chunk);
            hashes.sha1.update(chunk);
            hashes.sha256.update(chunk);
        });
        stream.on("error", reject);
        stream.on("end", resolve);
    });

    return {
        path: file,
        size: stats.size,
        md5: hashes.md5.digest("hex"),
        sha1: hashes.sha1.digest("hex"),
        sha256: hashes.sha256.digest("hex")
    };
}

async function copyRecursive(source, target) {
    await fsp.cp(resolveLocalPath(source), resolveLocalPath(target), {
        recursive: true,
        errorOnExist: false,
        force: false
    });
    return true;
}

async function pathExists(target) {
    try {
        await fsp.access(target);
        return true;
    } catch(e) {
        return false;
    }
}

async function uniqueDuplicateTarget(source) {
    const parsed = path.parse(source);
    for (let index = 1; index < 1000; index++) {
        const suffix = index === 1 ? " copy" : ` copy ${index}`;
        const target = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`);
        if (!await pathExists(target)) return target;
    }
    throw new Error("Unable to choose a duplicate target");
}

async function duplicatePath(source, target) {
    const from = resolveLocalPath(source);
    const to = target ? resolveLocalPath(target) : await uniqueDuplicateTarget(from);
    await fsp.cp(from, to, {
        recursive: true,
        errorOnExist: true,
        force: false
    });
    return {path: to};
}

async function movePath(source, target) {
    const from = resolveLocalPath(source);
    const to = resolveLocalPath(target);
    try {
        await fsp.rename(from, to);
    } catch(error) {
        if (error.code !== "EXDEV") throw error;
        await copyRecursive(from, to);
        await trashPath(from);
    }
    return true;
}

async function trashPath(target) {
    const trash = await loadModule("trash");
    await trash([resolveLocalPath(target)]);
    return true;
}

function toWslPath(rawFile) {
    const file = resolveLocalPath(rawFile);
    if (process.platform !== "win32") return file;

    const match = file.match(/^([A-Za-z]):\\(.*)$/);
    if (!match) return file.replace(/\\/g, "/");
    return `/mnt/${match[1].toLowerCase()}/${match[2].replace(/\\/g, "/")}`;
}

function quoteCmd(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function quoteLocalShellArg(value, shellPath) {
    const shellName = path.basename(shellPath || "").toLowerCase();
    if (process.platform === "win32") {
        if (shellName.includes("powershell") || shellName.includes("pwsh")) return quotePowerShell(value);
        if (shellName.includes("cmd")) return quoteCmd(value);
        if (shellName.includes("bash") || shellName === "sh" || shellName.startsWith("sh.") || shellName.includes("zsh") || shellName.includes("fish")) return quotePosix(value);
        return quotePowerShell(value);
    }
    return quotePosix(value);
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

function terminalCommandForPath(rawTarget, settings = {}) {
    const target = resolveLocalPath(rawTarget);
    const shellName = path.basename(settings.shell || "").toLowerCase();

    if (process.platform === "win32") {
        if (shellName.includes("cmd")) return `cd /d ${quoteCmd(target)}`;
        if (shellName.includes("bash") || shellName.includes("sh")) return `cd ${quotePosix(toWslPath(target))}`;
        return `Set-Location -LiteralPath ${quotePowerShell(target)}`;
    }

    return `cd ${quotePosix(target)}`;
}

function sshDirPath() {
    return path.join(os.homedir(), ".ssh");
}

function isInsidePath(parent, child) {
    const relative = path.relative(parent, child);
    return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function safeSshKeySlug(value, fallback = "default") {
    const slug = String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9_.-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 64);
    return slug || fallback;
}

function defaultSshKeyPath(profile = {}) {
    const target = [profile.user, profile.host].filter(Boolean).join("@") || profile.name || "default";
    return path.join(sshDirPath(), `edex_revival_${safeSshKeySlug(target)}_ed25519`);
}

function resolveSshKeyPath(rawPath, profile = {}) {
    const baseDir = path.resolve(sshDirPath());
    const requested = String(rawPath || "").trim();
    const target = requested
        ? (path.isAbsolute(requested) ? path.resolve(requested) : path.resolve(baseDir, requested))
        : defaultSshKeyPath(profile);
    if (!isSafeLocalPath(target)) throw new Error("Invalid SSH key path.");
    if (target.endsWith(".pub")) throw new Error("Use the private key path, not the .pub file.");
    if (!isInsidePath(baseDir, target)) throw new Error("SSH key setup can only manage keys under your .ssh folder.");
    const basename = path.basename(target);
    if (!/^[A-Za-z0-9._-]+$/.test(basename)) throw new Error("SSH key filename can only use letters, numbers, dots, dashes and underscores.");
    return target;
}

function normalizeSshProfileInput(profile = {}) {
    const host = String(profile.host || "").trim();
    const user = String(profile.user || "").trim();
    const port = clampInteger(Number(profile.port) || 22, 1, 65535, 22);
    const endpointPattern = /^[A-Za-z0-9_.:%+\-[\]]+$/;
    const userPattern = /^[A-Za-z0-9_.+\-]+$/;
    if (!host) throw new Error("Host is required.");
    if (!endpointPattern.test(host)) throw new Error("Host contains unsupported characters.");
    if (user && !userPattern.test(user)) throw new Error("User contains unsupported characters.");
    return {
        name: String(profile.name || "").trim(),
        host,
        user,
        port,
        hostKeyPolicy: ["default", "accept-new", "yes", "no"].includes(profile.hostKeyPolicy) ? profile.hostKeyPolicy : "default"
    };
}

function validatePublicSshKey(publicKey) {
    const key = stripControlText(publicKey).trim();
    if (key.length < 40 || key.length > 16000) throw new Error("Public key content is invalid.");
    if (!/^(ssh-ed25519|sk-ssh-ed25519@openssh\.com|ecdsa-sha2-nistp[0-9]+|ssh-rsa)\s+[A-Za-z0-9+/=]+(?:\s+.*)?$/.test(key)) {
        throw new Error("Public key format is not supported.");
    }
    return key;
}

function publicSshKeyMaterial(publicKey) {
    return validatePublicSshKey(publicKey).split(/\s+/).slice(0, 2).join(" ");
}

function runProcess(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = childProcess.spawn(command, args, {
            cwd: options.cwd || os.homedir(),
            env: Object.assign({}, process.env, options.env || {}),
            windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        let settled = false;
        const finish = (error, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(result);
        };
        const timer = setTimeout(() => {
            try {
                child.kill();
            } catch(e) {}
            finish(new Error(`${path.basename(command)} timed out.`));
        }, options.timeoutMs || 10000);
        child.stdout.on("data", chunk => {
            stdout = (stdout + chunk.toString()).slice(-12000);
        });
        child.stderr.on("data", chunk => {
            stderr = (stderr + chunk.toString()).slice(-12000);
        });
        child.on("error", error => finish(error));
        child.on("close", code => {
            const result = {
                code,
                stdout: stripControlText(stdout).trim(),
                stderr: stripControlText(stderr).trim()
            };
            if (code === 0) {
                finish(null, result);
            } else if (options.allowFailure) {
                finish(null, result);
            } else {
                finish(new Error(result.stderr || result.stdout || `${path.basename(command)} exited with code ${code}.`));
            }
        });
    });
}

async function readSshPublicKey(rawKeyPath, profile = {}) {
    const keyPath = resolveSshKeyPath(rawKeyPath, profile);
    const publicPath = `${keyPath}.pub`;
    const stats = await fsp.stat(publicPath);
    if (!stats.isFile() || stats.size > 16000) throw new Error("Public key file is invalid.");
    return {
        keyPath,
        publicPath,
        publicKey: validatePublicSshKey(await fsp.readFile(publicPath, "utf-8"))
    };
}

async function sshKeyFingerprint(publicPath) {
    const tool = await detectCommand("ssh-keygen");
    if (!tool.available) return "";
    try {
        const result = await runProcess(tool.path || tool.executable || "ssh-keygen", ["-lf", publicPath], {timeoutMs: 5000});
        return result.stdout;
    } catch(error) {
        return "";
    }
}

async function sshKeyStatus(options = {}) {
    const profile = options.profile || {};
    const keyPath = resolveSshKeyPath(options.keyPath, profile);
    const publicPath = `${keyPath}.pub`;
    const [sshKeygen, sshCopyId] = await Promise.all([
        detectCommand("ssh-keygen"),
        detectCommand("ssh-copy-id")
    ]);
    const privateStat = await fsp.stat(keyPath).catch(() => null);
    const publicStat = await fsp.stat(publicPath).catch(() => null);
    let publicKey = "";
    let fingerprint = "";
    if (publicStat && publicStat.isFile() && publicStat.size <= 16000) {
        publicKey = validatePublicSshKey(await fsp.readFile(publicPath, "utf-8"));
        fingerprint = await sshKeyFingerprint(publicPath);
    }
    return {
        keyPath,
        publicPath,
        privateExists: !!(privateStat && privateStat.isFile()),
        publicExists: !!(publicStat && publicStat.isFile()),
        publicKey,
        fingerprint,
        defaultPath: defaultSshKeyPath(profile),
        tools: {
            sshKeygen: sshKeygen.available,
            sshCopyId: sshCopyId.available
        }
    };
}

async function generateSshKey(options = {}) {
    const profile = options.profile || {};
    const keyPath = resolveSshKeyPath(options.keyPath, profile);
    const publicPath = `${keyPath}.pub`;
    const privateExists = await fsp.stat(keyPath).then(stats => stats.isFile()).catch(() => false);
    const publicExists = await fsp.stat(publicPath).then(stats => stats.isFile()).catch(() => false);
    if (privateExists || publicExists) {
        if (privateExists && publicExists) {
            return Object.assign(await sshKeyStatus({keyPath, profile}), {created: false, reused: true});
        }
        throw new Error("A partial SSH key already exists at this path. Choose another key name or repair the missing .pub/private pair.");
    }

    const tool = await detectCommand("ssh-keygen");
    if (!tool.available) throw new Error("ssh-keygen was not found. Install OpenSSH client first.");

    await fsp.mkdir(path.dirname(keyPath), {recursive: true, mode: 0o700});
    await fsp.chmod(path.dirname(keyPath), 0o700).catch(() => {});
    const commentTarget = [profile.user, profile.host].filter(Boolean).join("@") || profile.name || "edex-revival";
    const comment = `edex-revival-${safeSshKeySlug(commentTarget)}`;
    await runProcess(tool.path || tool.executable || "ssh-keygen", [
        "-t", "ed25519",
        "-a", "64",
        "-f", keyPath,
        "-C", comment,
        "-N", ""
    ], {timeoutMs: 15000});
    await fsp.chmod(keyPath, 0o600).catch(() => {});
    await fsp.chmod(publicPath, 0o644).catch(() => {});
    return Object.assign(await sshKeyStatus({keyPath, profile}), {created: true, reused: false});
}

async function buildSshKeyInstallCommand(options = {}, settings = {}) {
    const profile = normalizeSshProfileInput(options.profile || {});
    const key = await readSshPublicKey(options.keyPath, profile);
    const privateStat = await fsp.stat(key.keyPath).catch(() => null);
    if (!privateStat || !privateStat.isFile()) throw new Error("Private key file is missing.");
    const remoteKey = quotePosix(publicSshKeyMaterial(key.publicKey));
    const remoteCommand = [
        "umask 077",
        "mkdir -p ~/.ssh",
        "touch ~/.ssh/authorized_keys",
        `{ grep -qxF ${remoteKey} ~/.ssh/authorized_keys || printf '%s\\n' ${remoteKey} >> ~/.ssh/authorized_keys; }`,
        "chmod go-w ~",
        "chmod 700 ~/.ssh",
        "chmod 600 ~/.ssh/authorized_keys",
        "printf '%s\\n' 'eDEX SSH key ready'"
    ].join(" && ");
    const parts = ["ssh"];
    if (profile.port !== 22) parts.push("-p", String(profile.port));
    parts.push("-o", "PreferredAuthentications=password,keyboard-interactive");
    if (profile.hostKeyPolicy !== "default") parts.push("-o", `StrictHostKeyChecking=${profile.hostKeyPolicy}`);
    const target = profile.user ? `${profile.user}@${profile.host}` : profile.host;
    parts.push(target, quoteLocalShellArg(remoteCommand, settings.shell));
    return {
        command: parts.join(" "),
        keyPath: key.keyPath,
        publicPath: key.publicPath
    };
}

function analyzeSshKeyTest(result) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    const lower = output.toLowerCase();
    const authMatch = output.match(/Authentications that can continue:\s*([^\r\n]+)/i);
    const notes = [];
    const offered = /offering public key/i.test(output) || /will attempt key/i.test(output);
    const accepted = /server accepts key/i.test(output) || String(result.stdout || "").includes("EDEX_SSH_KEY_OK");

    if (offered) notes.push("Local key was offered to the server.");
    if (accepted) notes.push("Server accepted the key.");
    if (authMatch) notes.push(`Server auth methods after refusal: ${authMatch[1].trim()}.`);

    if (result.code === 0 && accepted) {
        return {
            ok: true,
            status: "ok",
            message: "SSH key login succeeded.",
            notes
        };
    }

    if (offered && /permission denied/i.test(output)) {
        notes.push("Run Install on Server again to repair key file permissions, then test again.");
        notes.push("If it still fails, check server-side AuthorizedKeysFile, PubkeyAuthentication, StrictModes, sshd logs, and the target user.");
        return {
            ok: false,
            status: "error",
            message: "The server rejected the offered public key.",
            notes
        };
    }

    if (/unprotected private key file|bad permissions|permissions are too open/i.test(output)) {
        return {
            ok: false,
            status: "error",
            message: "OpenSSH refused the local private key because its file permissions are too open.",
            notes
        };
    }

    if (!offered && /identity file .* not accessible|load key .*: no such file/i.test(lower)) {
        return {
            ok: false,
            status: "error",
            message: "The configured private key file is not readable.",
            notes
        };
    }

    if (!offered && /load key .*invalid format|error in libcrypto|invalid format/i.test(lower)) {
        return {
            ok: false,
            status: "error",
            message: "OpenSSH could not read the local private key format.",
            notes
        };
    }

    if (/no mutual signature algorithm|signature algorithm|key type .* not in pubkeyacceptedalgorithms/i.test(lower)) {
        notes.push("The server may not accept this key algorithm. Try an RSA key if the server is old.");
        return {
            ok: false,
            status: "error",
            message: "The server and client could not agree on a public key algorithm.",
            notes
        };
    }

    if (/host key verification failed|strict host key checking/i.test(lower)) {
        return {
            ok: false,
            status: "error",
            message: "Host key verification blocked the test.",
            notes
        };
    }

    if (/connection timed out|operation timed out|connection refused|could not resolve hostname|no route to host/i.test(lower)) {
        return {
            ok: false,
            status: "error",
            message: "The SSH endpoint could not be reached.",
            notes
        };
    }

    return {
        ok: false,
        status: "error",
        message: result.code === 0 ? "SSH key test finished without confirmation." : "SSH key login failed.",
        notes
    };
}

async function testSshKeyLogin(options = {}) {
    const profile = normalizeSshProfileInput(options.profile || {});
    const key = await readSshPublicKey(options.keyPath, profile);
    const privateStat = await fsp.stat(key.keyPath).catch(() => null);
    if (!privateStat || !privateStat.isFile()) throw new Error("Private key file is missing.");

    const tool = await detectCommand("ssh");
    if (!tool.available) throw new Error("ssh was not found. Install OpenSSH client first.");

    const target = profile.user ? `${profile.user}@${profile.host}` : profile.host;
    const connectTimeout = clampInteger(Number(options.profile && options.profile.connectTimeout) || 15, 1, 300, 15);
    const args = [
        "-vvv",
        "-o", "BatchMode=yes",
        "-o", "PasswordAuthentication=no",
        "-o", "KbdInteractiveAuthentication=no",
        "-o", "PreferredAuthentications=publickey",
        "-o", "PubkeyAuthentication=yes",
        "-o", "IdentitiesOnly=yes",
        "-o", `ConnectTimeout=${connectTimeout}`,
        "-i", key.keyPath
    ];
    if (profile.port !== 22) args.push("-p", String(profile.port));
    if (profile.hostKeyPolicy !== "default") args.push("-o", `StrictHostKeyChecking=${profile.hostKeyPolicy}`);
    args.push(target, "printf '%s\\n' EDEX_SSH_KEY_OK");

    const result = await runProcess(tool.path || tool.executable || "ssh", args, {
        timeoutMs: Math.max(8000, connectTimeout * 1000 + 5000),
        allowFailure: true
    });
    const analysis = analyzeSshKeyTest(result);
    const fingerprint = await sshKeyFingerprint(key.publicPath);
    return Object.assign(analysis, {
        code: result.code,
        keyPath: key.keyPath,
        publicPath: key.publicPath,
        fingerprint
    });
}

function testCommandForShell(shellPath) {
    const shellName = path.basename(shellPath || "").toLowerCase();
    if (process.platform === "win32") {
        if (shellName.includes("powershell") || shellName.includes("pwsh")) {
            return ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "Write-Output EDEX_SHELL_OK"];
        }
        if (shellName === "cmd.exe" || shellName === "cmd") {
            return ["/d", "/s", "/c", "echo EDEX_SHELL_OK"];
        }
        if (shellName.includes("bash") || shellName.includes("sh")) {
            return ["-lc", "printf EDEX_SHELL_OK"];
        }
        if (shellName.includes("wsl")) {
            return ["--exec", "sh", "-lc", "printf EDEX_SHELL_OK"];
        }
    }
    return shellName.includes("fish")
        ? ["-c", "printf EDEX_SHELL_OK"]
        : ["-lc", "printf EDEX_SHELL_OK"];
}

async function testShellLaunch(options = {}) {
    const shellPath = String(options.shell || "").trim();
    if (!shellPath) throw new Error("Shell cannot be empty.");
    const cwd = resolveLocalPath(options.cwd || process.cwd());
    const stats = await fsp.stat(cwd);
    if (!stats.isDirectory()) throw new Error("Startup cwd is not a directory.");

    const env = Object.assign({}, process.env, parseEnvOverrides(options.env), {
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        TERM_PROGRAM: "eDEX Revival"
    });
    const args = splitShellArgs(options.shellArgs).concat(testCommandForShell(shellPath));

    return new Promise((resolve, reject) => {
        const started = Date.now();
        const child = childProcess.spawn(shellPath, args, {
            cwd,
            env,
            windowsHide: true
        });
        let stdout = "";
        let stderr = "";
        let settled = false;
        const finish = (error, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(result);
        };
        const timer = setTimeout(() => {
            try {
                child.kill();
            } catch(e) {}
            finish(new Error("Shell test timed out after 5 seconds."));
        }, 5000);

        child.stdout.on("data", chunk => {
            stdout = (stdout + chunk.toString()).slice(-4000);
        });
        child.stderr.on("data", chunk => {
            stderr = (stderr + chunk.toString()).slice(-4000);
        });
        child.on("error", error => finish(error));
        child.on("close", code => {
            const ok = code === 0 && stdout.includes("EDEX_SHELL_OK");
            finish(ok ? null : new Error(stderr || stdout || `Shell exited with code ${code}.`), {
                ok,
                code,
                stdout: stripControlText(stdout).trim(),
                stderr: stripControlText(stderr).trim(),
                elapsedMs: Date.now() - started
            });
        });
    });
}

async function gitDiffForPath(rawTarget) {
    const target = resolveLocalPath(rawTarget);
    const stats = await fsp.lstat(target).catch(() => null);
    const baseDir = stats && stats.isDirectory() ? target : path.dirname(target);

    try {
        const git = await getGit(baseDir);
        const root = (await git.revparse(["--show-toplevel"])).trim();
        return {
            isRepo: true,
            root,
            path: target,
            diff: await git.diff(["--", target])
        };
    } catch(error) {
        return {isRepo: false, path: target, diff: "", error: error.message};
    }
}

function readPackage(cwd) {
    const pkgFile = path.join(cwd, "package.json");
    return readJsonFile(pkgFile, null);
}

const WORKSPACE_IGNORE = [
    "**/.git/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/out/**",
    "**/.next/**",
    "**/.cache/**",
    "**/coverage/**",
    "**/tmp/**",
    "**/temp/**"
];

const WORKSPACE_TEXT_EXTENSIONS = new Set([
    "txt", "md", "markdown", "json", "jsonc", "js", "jsx", "ts", "tsx", "mjs", "cjs",
    "css", "scss", "sass", "less", "html", "htm", "xml", "svg", "yml", "yaml", "toml",
    "ini", "env", "ps1", "sh", "bash", "bat", "cmd", "py", "rb", "go", "rs", "java",
    "c", "cpp", "cc", "h", "hpp", "cs", "php", "sql", "log", "gitignore", "dockerfile"
]);

function workspaceLimit(value, fallback, max) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.min(Math.floor(number), max);
}

function isWorkspaceTextFile(file) {
    const basename = path.basename(file).toLowerCase();
    if (["dockerfile", "makefile", "license", "readme", ".env", ".gitignore"].includes(basename)) return true;
    return WORKSPACE_TEXT_EXTENSIONS.has(path.extname(file).slice(1).toLowerCase());
}

async function workspaceListFiles(rawCwd, options = {}) {
    const cwd = resolveLocalPath(rawCwd);
    const query = stripControlText(options.query || "").toLowerCase();
    const limit = workspaceLimit(options.limit, 300, MAX_WORKSPACE_FILES);
    const fg = await loadModule("fast-glob");
    let entries = await fg(["**/*"], {
        cwd,
        dot: true,
        onlyFiles: true,
        unique: true,
        followSymbolicLinks: false,
        suppressErrors: true,
        ignore: WORKSPACE_IGNORE
    });

    if (query) {
        entries = entries.filter(item => item.toLowerCase().includes(query));
    }
    entries = entries.slice(0, limit);

    const files = await Promise.all(entries.map(async relative => {
        const file = path.join(cwd, relative);
        const stats = await fsp.stat(file).catch(() => null);
        return {
            path: file,
            relative: relative.replace(/\\/g, "/"),
            name: path.basename(file),
            ext: path.extname(file).slice(1).toLowerCase(),
            size: stats && stats.isFile() ? stats.size : null,
            mtime: stats && stats.isFile() ? stats.mtimeMs : null
        };
    }));

    return {cwd, query: options.query || "", files: files.filter(Boolean), truncated: entries.length >= limit};
}

async function workspaceSearch(rawCwd, rawQuery, options = {}) {
    const cwd = resolveLocalPath(rawCwd);
    const query = stripControlText(rawQuery || "");
    if (!query || query.length > 240) return {cwd, query, matches: [], truncated: false};

    const maxMatches = workspaceLimit(options.maxMatches, 120, MAX_WORKSPACE_SEARCH_MATCHES);
    const maxFiles = workspaceLimit(options.maxFiles, 1800, MAX_WORKSPACE_FILES);
    const listing = await workspaceListFiles(cwd, {limit: maxFiles});
    const lowerQuery = query.toLowerCase();
    const matches = [];
    let truncated = false;

    for (const file of listing.files) {
        if (matches.length >= maxMatches) {
            truncated = true;
            break;
        }
        if (!isWorkspaceTextFile(file.path) || file.size > MAX_WORKSPACE_SEARCH_BYTES) continue;
        const content = await fsp.readFile(file.path, "utf-8").catch(() => null);
        if (content == null) continue;
        const lines = content.split(/\r?\n/);
        for (let index = 0; index < lines.length; index++) {
            const column = lines[index].toLowerCase().indexOf(lowerQuery);
            if (column < 0) continue;
            matches.push({
                path: file.path,
                relative: file.relative,
                line: index + 1,
                column: column + 1,
                preview: lines[index].slice(0, 260)
            });
            if (matches.length >= maxMatches) {
                truncated = true;
                break;
            }
        }
    }

    return {cwd, query, matches, truncated: truncated || listing.truncated};
}

async function readMaybe(file, limit = 12000) {
    try {
        const stats = await fsp.stat(file);
        if (!stats.isFile()) return "";
        const handle = await fsp.open(file, "r");
        try {
            const buffer = Buffer.alloc(Math.min(limit, stats.size));
            await handle.read(buffer, 0, buffer.length, 0);
            return buffer.toString("utf-8");
        } finally {
            await handle.close();
        }
    } catch(e) {
        return "";
    }
}

async function scanRepo(rawCwd) {
    const cwd = resolveLocalPath(rawCwd);
    const pkg = readPackage(cwd);
    const readme = await readMaybe(path.join(cwd, "README.md"), 10000);
    const workflowsDir = path.join(cwd, ".github", "workflows");
    let workflows = [];
    try {
        workflows = (await fsp.readdir(workflowsDir)).filter(file => /\.(ya?ml)$/i.test(file));
    } catch(e) {
        workflows = [];
    }

    let structure = [];
    try {
        const fg = await loadModule("fast-glob");
        structure = await fg(["*", "src/*", "scripts/*", ".github/workflows/*"], {
            cwd,
            dot: true,
            onlyFiles: false,
            unique: true,
            followSymbolicLinks: false,
            suppressErrors: true
        });
    } catch(e) {
        structure = [];
    }

    const scripts = pkg && pkg.scripts ? pkg.scripts : {};
    const commandHints = Object.keys(scripts).filter(key => /^(test|build|start|lint|typecheck|rebuild|install)/i.test(key));

    return {
        cwd,
        name: pkg && pkg.name ? pkg.name : path.basename(cwd),
        description: pkg && pkg.description ? pkg.description : "",
        scripts,
        commandHints,
        workflows,
        readmeSummary: readme.split(/\r?\n/).filter(Boolean).slice(0, 12),
        structure: structure.slice(0, 120)
    };
}

function npmCommand(script) {
    return script === "start" ? "npm start" : `npm run ${script}`;
}

function renderRepoMap(scan) {
    const scripts = scan.commandHints.length
        ? scan.commandHints.map(name => `- ${npmCommand(name)}: ${scan.scripts[name]}`).join("\n")
        : "- No standard npm scripts detected.";
    const workflows = scan.workflows.length
        ? scan.workflows.map(name => `- .github/workflows/${name}`).join("\n")
        : "- No GitHub workflows detected.";
    const structure = scan.structure.length
        ? scan.structure.map(item => `- ${item}`).join("\n")
        : "- No shallow structure detected.";

    return [
        `# ${scan.name}`,
        "",
        scan.description ? scan.description : "Repository context generated by eDEX Revival.",
        "",
        "## Commands",
        scripts,
        "",
        "## Workflows",
        workflows,
        "",
        "## Repository Map",
        structure,
        "",
        "## Notes",
        "- Keep changes scoped to the request.",
        "- Prefer existing project conventions over broad rewrites.",
        "- Run the smallest relevant verification command before handing off."
    ].join("\n");
}

function renderAgents(scan) {
    return [
        "# AGENTS.md",
        "",
        `Repository: ${scan.name}`,
        scan.description ? `Purpose: ${scan.description}` : "",
        "",
        "## Working Rules",
        "- Read nearby code before editing.",
        "- Keep changes scoped and avoid unrelated refactors.",
        "- Preserve renderer security: context isolation stays enabled and Node integration stays disabled.",
        "- Use main/preload IPC for privileged filesystem, shell, Git, or OS actions.",
        "",
        "## Common Commands",
        ...(scan.commandHints.length
            ? scan.commandHints.map(name => `- ${npmCommand(name)}: ${scan.scripts[name]}`)
            : ["- No standard npm scripts detected."]),
        "",
        "## Project Structure",
        ...(scan.structure.slice(0, 40).map(item => `- ${item}`)),
        "",
        "## Verification",
        "- Run targeted checks for changed code.",
        "- For Electron UI work, smoke-test normal app startup and use --nointro only when explicitly needed."
    ].filter(Boolean).join("\n");
}

function renderClaude(scan) {
    return [
        "# CLAUDE.md",
        "",
        `This repository is ${scan.name}.`,
        scan.description ? scan.description : "",
        "",
        "## Instructions",
        "- Make minimal, well-scoped changes.",
        "- Do not introduce API keys or direct AI API calls into the app.",
        "- Route privileged work through Electron main/preload IPC.",
        "- Preserve the existing sci-fi interface language and dense technical layout.",
        "",
        "## Useful Commands",
        ...(scan.commandHints.length
            ? scan.commandHints.map(name => `- ${npmCommand(name)}: ${scan.scripts[name]}`)
            : ["- No standard npm scripts detected."]),
        "",
        "## Repo Map",
        ...(scan.structure.slice(0, 40).map(item => `- ${item}`))
    ].filter(Boolean).join("\n");
}

function renderClaudeCommand(type, scan) {
    const name = type === "build" ? "build" : "test";
    const matching = scan.commandHints.find(script => script.toLowerCase().includes(name));
    const command = matching ? npmCommand(matching) : `# Add ${name} command for this project`;

    return [
        `# ${name}`,
        "",
        `Run the project ${name} workflow and summarize failures.`,
        "",
        "```bash",
        command,
        "```"
    ].join("\n");
}

async function createContextPack(type, rawCwd, options = {}) {
    const cwd = resolveLocalPath(rawCwd);
    const scan = await scanRepo(cwd);
    let target;
    let content;

    switch(type) {
        case "agents":
        case "AGENTS.md":
            target = path.join(cwd, "AGENTS.md");
            content = renderAgents(scan);
            break;
        case "claude":
        case "CLAUDE.md":
            target = path.join(cwd, "CLAUDE.md");
            content = renderClaude(scan);
            break;
        case "repo-map":
            target = path.join(cwd, "REPO_MAP.md");
            content = renderRepoMap(scan);
            break;
        case "claude-command-build":
            target = path.join(cwd, ".claude", "commands", "build.md");
            content = renderClaudeCommand("build", scan);
            break;
        case "claude-command-test":
        default:
            target = path.join(cwd, ".claude", "commands", "test.md");
            content = renderClaudeCommand("test", scan);
            break;
    }

    if (fs.existsSync(target) && !options.overwrite) {
        return {created: false, exists: true, path: target, content};
    }

    await fsp.mkdir(path.dirname(target), {recursive: true});
    await fsp.writeFile(target, content, "utf-8");
    return {created: true, exists: false, path: target, content};
}

function spotifyBase64Url(input) {
    return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function spotifyVerifier() {
    return spotifyBase64Url(crypto.randomBytes(64)).slice(0, 96);
}

function spotifyChallenge(verifier) {
    return spotifyBase64Url(crypto.createHash("sha256").update(verifier).digest());
}

function spotifyRedirectUri(settings) {
    return `http://127.0.0.1:${settings.callbackPort}/spotify/callback`;
}

function spotifySafeError(error) {
    return error && error.message ? String(error.message).replace(/Bearer\s+[A-Za-z0-9._~-]+/g, "Bearer [REDACTED]") : String(error || "Unknown Spotify error");
}

function spotifyHttpRequest(method, rawUrl, options = {}) {
    return new Promise((resolve, reject) => {
        let parsed;
        try {
            parsed = new URL(rawUrl);
        } catch(error) {
            reject(new Error("Invalid Spotify URL"));
            return;
        }
        if (!["https:", "http:"].includes(parsed.protocol)) {
            reject(new Error("Unsupported Spotify URL protocol"));
            return;
        }
        const body = options.body == null ? null : (Buffer.isBuffer(options.body) ? options.body : Buffer.from(String(options.body)));
        const headers = Object.assign({}, options.headers || {});
        if (body && !headers["Content-Length"] && !headers["content-length"]) headers["Content-Length"] = body.length;
        const client = parsed.protocol === "https:" ? https : http;
        const req = client.request({
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port || undefined,
            method,
            path: `${parsed.pathname}${parsed.search}`,
            headers
        }, res => {
            const chunks = [];
            let length = 0;
            res.on("data", chunk => {
                length += chunk.length;
                if (options.maxBytes && length > options.maxBytes) {
                    req.destroy(new Error("Spotify response exceeded size limit"));
                    return;
                }
                chunks.push(chunk);
            });
            res.on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    statusCode: res.statusCode || 0,
                    headers: res.headers || {},
                    buffer,
                    text: buffer.toString("utf-8")
                });
            });
        });
        req.on("error", reject);
        req.setTimeout(options.timeoutMs || 12000, () => {
            req.destroy(new Error("Spotify request timed out"));
        });
        if (body) req.write(body);
        req.end();
    });
}

async function spotifyJsonRequest(method, rawUrl, options = {}) {
    const response = await spotifyHttpRequest(method, rawUrl, options);
    let json = null;
    const text = String(response.text || "").trim();
    if (text) {
        try {
            json = JSON.parse(text);
        } catch(error) {
            if (response.statusCode >= 200 && response.statusCode < 300) throw new Error("Spotify returned invalid JSON");
        }
    }
    return Object.assign(response, {json});
}

function spotifyAuthResponse(title, detail) {
    return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:monospace;background:#020606;color:#39ffcc;padding:32px"><h1>${title}</h1><p>${detail}</p></body></html>`;
}

function spotifyNormalizeTokens(payload, previous) {
    const now = Date.now();
    return {
        accessToken: String(payload.access_token || previous && previous.accessToken || ""),
        refreshToken: String(payload.refresh_token || previous && previous.refreshToken || ""),
        tokenType: String(payload.token_type || previous && previous.tokenType || "Bearer"),
        scope: String(payload.scope || previous && previous.scope || ""),
        expiresAt: now + (Number(payload.expires_in) || 3600) * 1000
    };
}

function spotifySafeSettings(settings) {
    const spotify = normalizeSpotifySettings(settings && settings.spotify || {});
    return {
        enabled: spotify.enabled === true,
        configured: spotify.enabled === true && !!spotify.clientId,
        clientId: spotify.clientId,
        callbackPort: spotify.callbackPort,
        redirectUri: spotifyRedirectUri(spotify),
        pollIntervalMs: spotify.pollIntervalMs,
        market: spotify.market,
        showAlbumArt: spotify.showAlbumArt,
        showDevices: spotify.showDevices,
        scopes: SPOTIFY_SCOPES.slice()
    };
}

function spotifyImageUrl(item) {
    if (!item || typeof item !== "object") return "";
    const albumImages = item.album && Array.isArray(item.album.images) ? item.album.images : [];
    const itemImages = Array.isArray(item.images) ? item.images : [];
    const images = albumImages.length ? albumImages : itemImages;
    if (!images.length) return "";
    const sorted = images.slice().sort((a, b) => Math.abs((a.width || 300) - 300) - Math.abs((b.width || 300) - 300));
    return sorted[0] && sorted[0].url || "";
}

function spotifyArtistLabel(item) {
    if (!item || typeof item !== "object") return "";
    if (Array.isArray(item.artists) && item.artists.length) return item.artists.map(artist => artist && artist.name).filter(Boolean).join(", ");
    if (item.show && item.show.publisher) return item.show.publisher;
    if (item.show && item.show.name) return item.show.name;
    return item.publisher || "";
}

function spotifyPlaybackSummary(playback, imageDataUrl) {
    if (!playback || !playback.item) {
        return {
            active: !!playback,
            isPlaying: !!(playback && playback.is_playing),
            progressMs: playback && Number(playback.progress_ms) || 0,
            durationMs: 0,
            item: null,
            device: playback && playback.device || null,
            shuffleState: !!(playback && playback.shuffle_state),
            repeatState: playback && playback.repeat_state || "off"
        };
    }
    const item = playback.item;
    return {
        active: true,
        isPlaying: playback.is_playing === true,
        progressMs: Number(playback.progress_ms) || 0,
        durationMs: Number(item.duration_ms) || 0,
        item: {
            id: item.id || "",
            uri: item.uri || "",
            type: item.type || playback.currently_playing_type || "track",
            name: item.name || "",
            artist: spotifyArtistLabel(item),
            album: item.album && item.album.name || item.show && item.show.name || "",
            externalUrl: item.external_urls && item.external_urls.spotify || "",
            imageUrl: spotifyImageUrl(item),
            imageDataUrl: imageDataUrl || ""
        },
        device: playback.device || null,
        shuffleState: playback.shuffle_state === true,
        repeatState: playback.repeat_state || "off"
    };
}

function registerDevBackend({app, ipc, shell, getWindow, settingsFile, isTrustedSender, signale}) {
    const watchers = new Map();
    const promptDir = path.join(app.getPath("userData"), "ai-prompts");
    const spotifyTokenFile = path.join(app.getPath("userData"), "spotify-auth.json");
    const spotifyRuntime = {
        tokens: null,
        auth: null,
        imageCache: new Map()
    };

    function readSettings() {
        const current = normalizeSettings(readJsonFile(settingsFile, {}));
        return current;
    }

    function persistSettings(settings) {
        writeJsonFile(settingsFile, normalizeSettings(settings));
    }

    function spotifyCanEncrypt() {
        try {
            return !!(safeStorage && safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable());
        } catch(error) {
            return false;
        }
    }

    function spotifyReadTokens() {
        if (spotifyRuntime.tokens) return spotifyRuntime.tokens;
        const payload = readJsonFile(spotifyTokenFile, null);
        if (!payload || typeof payload !== "object") return null;
        try {
            if (payload.encrypted === true && spotifyCanEncrypt()) {
                const raw = safeStorage.decryptString(Buffer.from(String(payload.data || ""), "base64"));
                spotifyRuntime.tokens = JSON.parse(raw);
            }
        } catch(error) {
            spotifyRuntime.tokens = null;
        }
        return spotifyRuntime.tokens;
    }

    function spotifyPersistTokens(tokens) {
        spotifyRuntime.tokens = tokens;
        if (!spotifyCanEncrypt()) return {persistent: false};
        const data = safeStorage.encryptString(JSON.stringify(tokens)).toString("base64");
        writeJsonFile(spotifyTokenFile, {
            version: 1,
            encrypted: true,
            createdAt: new Date().toISOString(),
            data
        });
        return {persistent: true};
    }

    function spotifyClearTokens() {
        spotifyRuntime.tokens = null;
        spotifyRuntime.imageCache.clear();
        try {
            fs.unlinkSync(spotifyTokenFile);
        } catch(error) {}
    }

    function spotifyAuthInProgress() {
        return !!(spotifyRuntime.auth && spotifyRuntime.auth.expiresAt > Date.now());
    }

    function spotifyCloseAuth() {
        if (spotifyRuntime.auth && spotifyRuntime.auth.server) {
            try {
                spotifyRuntime.auth.server.close();
            } catch(error) {}
        }
        if (spotifyRuntime.auth && spotifyRuntime.auth.timeout) clearTimeout(spotifyRuntime.auth.timeout);
        spotifyRuntime.auth = null;
    }

    function spotifyStatus(settings = readSettings()) {
        const safe = spotifySafeSettings(settings);
        const tokens = spotifyReadTokens();
        return Object.assign({}, safe, {
            connected: !!(tokens && tokens.refreshToken),
            expiresAt: tokens && tokens.expiresAt || 0,
            authInProgress: spotifyAuthInProgress(),
            tokenPersistence: spotifyCanEncrypt() ? "encrypted" : "memory-only"
        });
    }

    async function spotifyTokenRequest(params) {
        const body = new URLSearchParams(params).toString();
        const response = await spotifyJsonRequest("POST", "https://accounts.spotify.com/api/token", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            body
        });
        if (response.statusCode < 200 || response.statusCode >= 300) {
            const message = response.json && (response.json.error_description || response.json.error) || `Spotify token request failed (${response.statusCode})`;
            throw new Error(message);
        }
        return response.json || {};
    }

    async function spotifyRefresh(settings, tokens) {
        if (!tokens || !tokens.refreshToken) throw new Error("Spotify is not connected");
        const payload = await spotifyTokenRequest({
            grant_type: "refresh_token",
            refresh_token: tokens.refreshToken,
            client_id: settings.spotify.clientId
        });
        const next = spotifyNormalizeTokens(payload, tokens);
        spotifyPersistTokens(next);
        return next;
    }

    async function spotifyAccessToken(settings = readSettings()) {
        settings = normalizeSettings(settings);
        const spotify = settings.spotify;
        if (spotify.enabled !== true || !spotify.clientId) throw new Error("Spotify integration is not configured");
        let tokens = spotifyReadTokens();
        if (!tokens || !tokens.refreshToken) throw new Error("Spotify is not connected");
        if (!tokens.accessToken || Number(tokens.expiresAt) - SPOTIFY_TOKEN_SKEW_MS <= Date.now()) {
            tokens = await spotifyRefresh(settings, tokens);
        }
        return tokens.accessToken;
    }

    async function spotifyApi(settings, method, endpoint, options = {}, allowRefresh = true) {
        const token = await spotifyAccessToken(settings);
        const query = options.query ? `?${new URLSearchParams(options.query).toString()}` : "";
        const body = options.body ? JSON.stringify(options.body) : null;
        const response = await spotifyJsonRequest(method, `https://api.spotify.com/v1${endpoint}${query}`, {
            headers: Object.assign({
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }, body ? {"Content-Type": "application/json"} : {}),
            body
        });
        if (response.statusCode === 401 && allowRefresh) {
            await spotifyRefresh(normalizeSettings(settings), spotifyReadTokens());
            return spotifyApi(settings, method, endpoint, options, false);
        }
        if (response.statusCode === 204) return null;
        if (response.statusCode < 200 || response.statusCode >= 300) {
            const message = response.json && response.json.error && (response.json.error.message || response.json.error_description)
                || `Spotify API request failed (${response.statusCode})`;
            const error = new Error(message);
            error.statusCode = response.statusCode;
            throw error;
        }
        return response.json;
    }

    async function spotifyImageDataUrl(rawUrl) {
        if (!rawUrl) return "";
        let parsed;
        try {
            parsed = new URL(rawUrl);
        } catch(error) {
            return "";
        }
        if (parsed.protocol !== "https:") return "";
        const cacheKey = parsed.toString();
        const cached = spotifyRuntime.imageCache.get(cacheKey);
        if (cached) return cached;
        const response = await spotifyHttpRequest("GET", cacheKey, {
            headers: {"Accept": "image/avif,image/webp,image/png,image/jpeg,image/*"},
            maxBytes: SPOTIFY_IMAGE_MAX_BYTES,
            timeoutMs: 8000
        });
        if (response.statusCode < 200 || response.statusCode >= 300) return "";
        const type = String(response.headers["content-type"] || "image/jpeg").split(";")[0].trim();
        if (!/^image\/(?:jpeg|jpg|png|webp|avif)$/i.test(type)) return "";
        const dataUrl = `data:${type};base64,${response.buffer.toString("base64")}`;
        spotifyRuntime.imageCache.set(cacheKey, dataUrl);
        if (spotifyRuntime.imageCache.size > 12) {
            const first = spotifyRuntime.imageCache.keys().next().value;
            spotifyRuntime.imageCache.delete(first);
        }
        return dataUrl;
    }

    async function spotifyPlaybackState() {
        const settings = normalizeSettings(readSettings());
        const status = spotifyStatus(settings);
        if (!status.configured || !status.connected) {
            return {status, playback: null, devices: []};
        }
        try {
            const query = settings.spotify.market ? {market: settings.spotify.market} : null;
            const playback = await spotifyApi(settings, "GET", "/me/player", {query});
            const devicesData = settings.spotify.showDevices === false ? {devices: []} : await spotifyApi(settings, "GET", "/me/player/devices").catch(() => ({devices: []}));
            const imageUrl = spotifyImageUrl(playback && playback.item);
            const imageDataUrl = settings.spotify.showAlbumArt === false ? "" : await spotifyImageDataUrl(imageUrl).catch(() => "");
            return {
                status: spotifyStatus(settings),
                playback: spotifyPlaybackSummary(playback, imageDataUrl),
                devices: Array.isArray(devicesData && devicesData.devices) ? devicesData.devices.map(device => ({
                    id: device.id || "",
                    name: device.name || "",
                    type: device.type || "",
                    isActive: device.is_active === true,
                    isRestricted: device.is_restricted === true,
                    isPrivateSession: device.is_private_session === true,
                    volumePercent: typeof device.volume_percent === "number" ? device.volume_percent : null,
                    supportsVolume: device.supports_volume === true
                })) : []
            };
        } catch(error) {
            return {
                status: spotifyStatus(settings),
                playback: null,
                devices: [],
                error: spotifySafeError(error),
                premiumRequired: error && error.statusCode === 403
            };
        }
    }

    async function spotifyControl(action, options = {}) {
        const settings = normalizeSettings(readSettings());
        const deviceId = typeof options.deviceId === "string" && options.deviceId.length < 240 ? options.deviceId : "";
        const deviceQuery = deviceId ? {device_id: deviceId} : null;
        switch(action) {
            case "play":
                await spotifyApi(settings, "PUT", "/me/player/play", {query: deviceQuery, body: options.contextUri ? {context_uri: String(options.contextUri)} : undefined});
                break;
            case "pause":
                await spotifyApi(settings, "PUT", "/me/player/pause", {query: deviceQuery});
                break;
            case "next":
                await spotifyApi(settings, "POST", "/me/player/next", {query: deviceQuery});
                break;
            case "previous":
                await spotifyApi(settings, "POST", "/me/player/previous", {query: deviceQuery});
                break;
            case "seek":
                await spotifyApi(settings, "PUT", "/me/player/seek", {query: Object.assign({position_ms: Math.max(0, Math.round(Number(options.positionMs) || 0))}, deviceQuery || {})});
                break;
            case "volume":
                await spotifyApi(settings, "PUT", "/me/player/volume", {query: Object.assign({volume_percent: Math.max(0, Math.min(100, Math.round(Number(options.volumePercent) || 0)))}, deviceQuery || {})});
                break;
            case "shuffle":
                await spotifyApi(settings, "PUT", "/me/player/shuffle", {query: Object.assign({state: options.state === true ? "true" : "false"}, deviceQuery || {})});
                break;
            case "repeat":
                await spotifyApi(settings, "PUT", "/me/player/repeat", {query: Object.assign({state: ["track", "context", "off"].includes(options.state) ? options.state : "off"}, deviceQuery || {})});
                break;
            case "transfer":
                if (!deviceId) throw new Error("Spotify device is required");
                await spotifyApi(settings, "PUT", "/me/player", {body: {device_ids: [deviceId], play: options.play === true}});
                break;
            default:
                throw new Error("Unsupported Spotify control");
        }
        return {ok: true};
    }

    async function spotifyConfigure(options = {}) {
        const settings = readSettings();
        const patch = {};
        if (typeof options.enabled === "boolean") patch.enabled = options.enabled;
        if (typeof options.clientId === "string") patch.clientId = options.clientId;
        if (typeof options.callbackPort !== "undefined") patch.callbackPort = options.callbackPort;
        if (typeof options.pollIntervalMs !== "undefined") patch.pollIntervalMs = options.pollIntervalMs;
        if (typeof options.market === "string") patch.market = options.market;
        if (typeof options.showAlbumArt === "boolean") patch.showAlbumArt = options.showAlbumArt;
        if (typeof options.showDevices === "boolean") patch.showDevices = options.showDevices;
        settings.spotify = normalizeSpotifySettings(Object.assign({}, settings.spotify || {}, patch));
        persistSettings(settings);
        return spotifyStatus(settings);
    }

    async function spotifyStartAuth(options = {}) {
        let settings = readSettings();
        if (options && Object.keys(options).length) {
            await spotifyConfigure(Object.assign({}, settings.spotify || {}, options, {enabled: true}));
            settings = readSettings();
        }
        settings = normalizeSettings(settings);
        const spotify = settings.spotify;
        if (spotify.enabled !== true || !spotify.clientId) throw new Error("Set a Spotify Client ID before connecting");
        spotifyCloseAuth();
        const verifier = spotifyVerifier();
        const state = crypto.randomBytes(16).toString("hex");
        const redirectUri = spotifyRedirectUri(spotify);
        const server = http.createServer(async (request, response) => {
            try {
                const parsed = new URL(request.url, redirectUri);
                if (parsed.pathname !== "/spotify/callback") {
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.end("Not found");
                    return;
                }
                if (parsed.searchParams.get("state") !== state) throw new Error("Spotify authorization state mismatch");
                if (parsed.searchParams.get("error")) throw new Error(parsed.searchParams.get("error"));
                const code = parsed.searchParams.get("code");
                if (!code) throw new Error("Spotify did not return an authorization code");
                const payload = await spotifyTokenRequest({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                    client_id: spotify.clientId,
                    code_verifier: verifier
                });
                spotifyPersistTokens(spotifyNormalizeTokens(payload));
                response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
                response.end(spotifyAuthResponse("Spotify connected", "Return to eDEX Revival. This browser tab can be closed."));
            } catch(error) {
                response.writeHead(400, {"Content-Type": "text/html; charset=utf-8"});
                response.end(spotifyAuthResponse("Spotify authorization failed", spotifySafeError(error)));
            } finally {
                setTimeout(spotifyCloseAuth, 250);
            }
        });
        await new Promise((resolve, reject) => {
            server.once("error", reject);
            server.listen(spotify.callbackPort, "127.0.0.1", resolve);
        });
        const authUrl = new URL("https://accounts.spotify.com/authorize");
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("client_id", spotify.clientId);
        authUrl.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("state", state);
        authUrl.searchParams.set("code_challenge_method", "S256");
        authUrl.searchParams.set("code_challenge", spotifyChallenge(verifier));
        spotifyRuntime.auth = {
            server,
            state,
            expiresAt: Date.now() + 5 * 60 * 1000,
            timeout: setTimeout(spotifyCloseAuth, 5 * 60 * 1000)
        };
        shell.openExternal(authUrl.toString());
        return Object.assign(spotifyStatus(settings), {
            authUrl: authUrl.toString(),
            redirectUri
        });
    }

    async function spotifyDisconnect() {
        spotifyCloseAuth();
        spotifyClearTokens();
        return spotifyStatus(readSettings());
    }

    function setPluginState(pluginId, enabled, errorMessage) {
        const settings = readSettings();
        settings.plugins = settings.plugins || {};
        settings.plugins.disabled = Array.isArray(settings.plugins.disabled) ? settings.plugins.disabled : [];
        settings.plugins.errors = settings.plugins.errors && typeof settings.plugins.errors === "object" ? settings.plugins.errors : {};
        settings.plugins.disabled = settings.plugins.disabled.filter(id => id !== pluginId);
        if (!enabled) settings.plugins.disabled.push(pluginId);
        if (errorMessage) settings.plugins.errors[pluginId] = String(errorMessage).slice(0, 1000);
        else delete settings.plugins.errors[pluginId];
        persistSettings(settings);
        return true;
    }

    function trusted(event) {
        return isTrustedSender(event);
    }

    async function detectTools(settings = readSettings()) {
        const ai = normalizeSettings(settings).ai;
        const codex = await detectCommand(ai.commands && ai.commands.codex || "codex");
        const claude = await detectCommand(ai.commands && ai.commands.claude || "claude");
        let preferred = normalizeAiProvider(ai.provider || ai.defaultProvider || "auto");
        if (preferred === "auto") {
            preferred = codex.available ? "codex" : (claude.available ? "claude" : "codex");
        }
        return {
            enabled: ai.enabled === true,
            preferred,
            providers: {codex, claude},
            contextBytes: Number(ai.contextBytes) || DEFAULT_CONTEXT_BYTES,
            redactSecrets: ai.redactSecrets !== false
        };
    }

    function getStartupStatus() {
        if (process.platform !== "win32") {
            return {supported: false, openAtLogin: false};
        }
        const status = app.getLoginItemSettings();
        return {supported: true, openAtLogin: !!status.openAtLogin};
    }

    function setStartup(enabled) {
        if (process.platform === "win32") {
            app.setLoginItemSettings({
                openAtLogin: !!enabled,
                args: []
            });
        }
        const settings = readSettings();
        settings.launchOnStartup = !!enabled;
        persistSettings(settings);
        return getStartupStatus();
    }

    async function diagnosticsSnapshot() {
        const settings = normalizeSettings(readSettings());
        const aiTools = settings.ai && settings.ai.enabled === true ? await detectTools(settings).catch(() => null) : null;
        const win = getWindow();
        const appPath = app.getAppPath();
        const userData = app.getPath("userData");
        const paths = {
            app: appPath,
            userData,
            settings: settingsFile,
            cwd: settings.cwd,
            themes: path.join(userData, "themes"),
            keyboards: path.join(userData, "keyboards"),
            fonts: path.join(userData, "fonts")
        };
        const pathReports = {};
        await Promise.all(Object.keys(paths).map(async key => {
            pathReports[key] = await accessReport(paths[key], key);
        }));

        const shellCheck = await detectCommand(settings.shell || "");
        const startup = getStartupStatus();
        const gpu = typeof app.getGPUFeatureStatus === "function" ? app.getGPUFeatureStatus() : {};
        const appMetrics = typeof app.getAppMetrics === "function"
            ? app.getAppMetrics().map(metric => ({
                pid: metric.pid,
                type: metric.type,
                cpu: {
                    percentCPUUsage: metric.cpu && metric.cpu.percentCPUUsage,
                    idleWakeupsPerSecond: metric.cpu && metric.cpu.idleWakeupsPerSecond
                },
                memory: metric.memory ? {
                    workingSetSize: metric.memory.workingSetSize,
                    peakWorkingSetSize: metric.memory.peakWorkingSetSize,
                    privateBytes: metric.memory.privateBytes,
                    sharedBytes: metric.memory.sharedBytes
                } : {}
            }))
            : [];
        let systemInformation = {started: false};
        try {
            systemInformation = require("../_multithread.js").getMetrics();
        } catch(e) {}
        const windowState = win && !win.isDestroyed() ? {
            available: true,
            size: win.getSize(),
            fullScreen: win.isFullScreen(),
            maximized: win.isMaximized()
        } : {available: false};

        const checks = [
            {
                id: "settings-file",
                title: "Settings file",
                status: diagnosticStatus(pathReports.settings.exists && pathReports.settings.readable && pathReports.settings.writable),
                detail: pathReports.settings.error || `${pathReports.settings.readable ? "readable" : "not readable"} / ${pathReports.settings.writable ? "writable" : "not writable"}`
            },
            {
                id: "shell",
                title: "Shell command",
                status: diagnosticStatus(shellCheck.available, !!settings.shell),
                detail: shellCheck.available ? shellCheck.path : (shellCheck.error || "Shell command not found")
            },
            {
                id: "cwd",
                title: "Startup cwd",
                status: diagnosticStatus(pathReports.cwd.exists && pathReports.cwd.readable),
                detail: pathReports.cwd.error || `${pathReports.cwd.readable ? "readable" : "not readable"}`
            },
            {
                id: "gpu",
                title: "GPU acceleration",
                status: diagnosticStatus(!Object.values(gpu).includes("disabled_software"), Object.keys(gpu).length > 0),
                detail: Object.keys(gpu).length ? JSON.stringify(gpu) : "GPU feature status unavailable"
            },
            {
                id: "startup",
                title: "Windows startup",
                status: startup.supported ? "ok" : "warn",
                detail: startup.supported ? `openAtLogin=${startup.openAtLogin}` : "Not supported on this platform"
            },
            {
                id: "dev-explorer",
                title: "Dev Explorer",
                status: settings.devExplorer && settings.devExplorer.enabled !== false ? "ok" : "warn",
                detail: settings.devExplorer && settings.devExplorer.enabled !== false ? `${settings.devExplorer.mode || "dock"} / ${settings.devExplorer.defaultView || "list"}` : "Disabled, legacy filesystem display will be used"
            },
            {
                id: "ai",
                title: "Error to Fix",
                status: settings.ai && settings.ai.enabled === true
                    ? (aiTools && aiTools.providers && ((aiTools.providers.codex && aiTools.providers.codex.available) || (aiTools.providers.claude && aiTools.providers.claude.available)) ? "ok" : "warn")
                    : "ok",
                detail: settings.ai && settings.ai.enabled === true
                    ? `${settings.ai.provider || settings.ai.defaultProvider || "auto"} / Codex or Claude CLI`
                    : "Disabled by settings"
            }
        ];

        return {
            generatedAt: new Date().toISOString(),
            app: {
                name: app.getName(),
                version: app.getVersion(),
                electron: process.versions.electron,
                chrome: process.versions.chrome,
                node: process.versions.node,
                pid: process.pid
            },
            os: {
                platform: process.platform,
                release: os.release(),
                arch: os.arch(),
                type: os.type(),
                hostname: os.hostname(),
                uptime: os.uptime(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                cpus: os.cpus().length
            },
            window: windowState,
            settings: {
                theme: settings.theme,
                keyboard: settings.keyboard,
                shell: settings.shell,
                shellArgs: settings.shellArgs || "",
                launchOnStartup: settings.launchOnStartup === true,
                aiEnabled: !!(settings.ai && settings.ai.enabled === true),
                aiProvider: settings.ai && (settings.ai.provider || settings.ai.defaultProvider) || "auto",
                spotifyEnabled: !!(settings.spotify && settings.spotify.enabled === true),
                spotifyConfigured: !!(settings.spotify && settings.spotify.clientId),
                devExplorerEnabled: !!(settings.devExplorer && settings.devExplorer.enabled !== false),
                widgetsVisible: !(settings.widgets && settings.widgets.visible === false),
                performance: settings.performance
            },
            performance: {
                appMetrics,
                systemInformation
            },
            startup,
            shell: shellCheck,
            paths,
            pathReports,
            gpu,
            checks
        };
    }

    ipc.handle("edex:ai-detect-tools", async event => {
        if (!trusted(event)) return null;
        return detectTools();
    });

    ipc.handle("edex:ai-run-prompt", async (event, provider, prompt) => {
        if (!trusted(event)) return null;
        const settings = readSettings();
        const tools = await detectTools(settings);
        const ai = settings.ai || {};
        if (ai.enabled !== true) throw new Error("AI integration is disabled");
        let selected = provider || tools.preferred || "codex";
        if (selected === "auto") selected = tools.preferred;
        if (!["codex", "claude"].includes(selected)) selected = tools.providers.codex.available ? "codex" : "claude";

        const providerCommand = ai.commands && ai.commands[selected] || selected;
        const safePrompt = prepareAiPrompt(normalizeSettings(settings).ai, prompt).prompt;
        await fsp.mkdir(promptDir, {recursive: true});
        const promptFile = path.join(promptDir, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${selected}.txt`);
        await fsp.writeFile(promptFile, safePrompt.slice(0, Number(ai.contextBytes) || DEFAULT_CONTEXT_BYTES), "utf-8");

        return {
            provider: selected,
            command: buildPipeCommand(providerCommand, promptFile),
            promptFile,
            tools
        };
    });

    ipc.handle("edex:git-status", async (event, cwd) => {
        if (!trusted(event)) return null;
        const dir = resolveLocalPath(cwd);
        try {
            const git = await getGit(dir);
            const root = (await git.revparse(["--show-toplevel"])).trim();
            const status = await git.status();
            return {
                isRepo: true,
                root,
                branch: status.current,
                files: status.files,
                ahead: status.ahead,
                behind: status.behind
            };
        } catch(error) {
            return {isRepo: false, error: error.message, files: []};
        }
    });

    ipc.handle("edex:git-diff", async (event, cwd, file) => {
        if (!trusted(event)) return null;
        const dir = resolveLocalPath(cwd);
        try {
            const git = await getGit(dir);
            const args = file ? ["--", resolveLocalPath(file)] : [];
            return {isRepo: true, diff: await git.diff(args)};
        } catch(error) {
            return {isRepo: false, error: error.message, diff: ""};
        }
    });

    ipc.handle("edex:devfs-read-dir", async (event, dir, options) => {
        if (!trusted(event)) return null;
        return readDirectory(dir, options || {});
    });

    ipc.handle("edex:devfs-preview", async (event, file, bytes) => {
        if (!trusted(event)) return null;
        return previewFile(file, bytes);
    });

    ipc.handle("edex:devfs-read-file", async (event, file, bytes) => {
        if (!trusted(event)) return null;
        try {
            return await readEditorFile(file, bytes);
        } catch(error) {
            return {
                error: true,
                code: error.code || "read-error",
                message: error.message || String(error),
                path: error.path || file,
                size: error.size || null,
                limit: error.limit || null
            };
        }
    });

    ipc.handle("edex:devfs-write-file", async (event, file, content) => {
        if (!trusted(event)) return null;
        return writeEditorFile(file, content);
    });

    ipc.handle("edex:devfs-save-as", async (event, file, content) => {
        if (!trusted(event)) return null;
        return writeEditorFile(file, content);
    });

    ipc.handle("edex:devfs-list-drives", async event => {
        if (!trusted(event)) return null;
        return listDrives();
    });

    ipc.handle("edex:devfs-stat", async (event, target) => {
        if (!trusted(event)) return null;
        return statPath(target);
    });

    ipc.handle("edex:devfs-hash", async (event, target) => {
        if (!trusted(event)) return null;
        return hashPath(target);
    });

    ipc.handle("edex:devfs-git-status", async (event, target) => {
        if (!trusted(event)) return null;
        const file = resolveLocalPath(target);
        const baseDir = (await fsp.lstat(file).catch(() => null))?.isDirectory() ? file : path.dirname(file);
        return getGitStatusMap(baseDir);
    });

    ipc.handle("edex:devfs-git-diff", async (event, target) => {
        if (!trusted(event)) return null;
        return gitDiffForPath(target);
    });

    ipc.handle("edex:devfs-create-file", async (event, file, content = "") => {
        if (!trusted(event)) return null;
        const target = resolveLocalPath(file);
        await fsp.mkdir(path.dirname(target), {recursive: true});
        await fsp.writeFile(target, String(content), {encoding: "utf-8", flag: "wx"});
        return {path: target};
    });

    ipc.handle("edex:devfs-create-folder", async (event, dir) => {
        if (!trusted(event)) return null;
        const target = resolveLocalPath(dir);
        await fsp.mkdir(target, {recursive: false});
        return {path: target};
    });

    ipc.handle("edex:devfs-rename", async (event, source, targetName) => {
        if (!trusted(event)) return null;
        const from = resolveLocalPath(source);
        const to = path.join(path.dirname(from), path.basename(String(targetName || "")));
        if (!path.basename(to)) throw new Error("Invalid target name");
        await fsp.rename(from, to);
        return {path: to};
    });

    ipc.handle("edex:devfs-copy", async (event, source, target) => {
        if (!trusted(event)) return null;
        await copyRecursive(source, target);
        return {path: resolveLocalPath(target)};
    });

    ipc.handle("edex:devfs-duplicate", async (event, source, target) => {
        if (!trusted(event)) return null;
        return duplicatePath(source, target);
    });

    ipc.handle("edex:devfs-move", async (event, source, target) => {
        if (!trusted(event)) return null;
        await movePath(source, target);
        return {path: resolveLocalPath(target)};
    });

    ipc.handle("edex:devfs-trash", async (event, target) => {
        if (!trusted(event)) return null;
        await trashPath(target);
        return {path: resolveLocalPath(target)};
    });

    ipc.handle("edex:devfs-to-wsl-path", (event, target) => {
        if (!trusted(event)) return null;
        return toWslPath(target);
    });

    ipc.handle("edex:devfs-copy-path", (event, target, format) => {
        if (!trusted(event)) return false;
        const value = format === "wsl" ? toWslPath(target) : resolveLocalPath(target);
        clipboard.writeText(value);
        return {path: value};
    });

    ipc.handle("edex:devfs-copy-text", (event, value) => {
        if (!trusted(event)) return false;
        clipboard.writeText(String(value || ""));
        return true;
    });

    ipc.handle("edex:devfs-open-external", async (event, target) => {
        if (!trusted(event)) return false;
        return shell.openPath(resolveLocalPath(target));
    });

    ipc.handle("edex:devfs-open-terminal-here", async (event, target) => {
        if (!trusted(event)) return null;
        const settings = readSettings();
        return {
            path: resolveLocalPath(target),
            command: terminalCommandForPath(target, settings)
        };
    });

    ipc.handle("edex:devfs-watch-start", async (event, dir) => {
        if (!trusted(event)) return null;
        const target = resolveLocalPath(dir);
        try {
            await fsp.realpath(target);
        } catch(error) {
            return {error: error.message || String(error)};
        }
        const chokidar = await loadModule("chokidar");
        const id = crypto.randomBytes(8).toString("hex");
        const watcher = chokidar.watch(target, {
            ignoreInitial: true,
            ignorePermissionErrors: true,
            depth: 1,
            awaitWriteFinish: {stabilityThreshold: 250, pollInterval: 100}
        });
        watchers.set(id, watcher);
        const channel = `edex:devfs-watch-event:${id}`;
        const sender = event.sender;
        watcher.on("all", (type, filePath) => {
            if (!sender.isDestroyed()) sender.send(channel, {type, path: filePath});
        });
        watcher.on("error", error => {
            if (!sender.isDestroyed()) sender.send(channel, {type: "error", error: error.message});
        });
        return {id};
    });

    ipc.handle("edex:devfs-watch-stop", async (event, id) => {
        if (!trusted(event)) return false;
        const watcher = watchers.get(id);
        if (!watcher) return false;
        await watcher.close();
        watchers.delete(id);
        return true;
    });

    ipc.handle("edex:context-scan-repo", async (event, cwd) => {
        if (!trusted(event)) return null;
        return scanRepo(cwd);
    });

    ipc.handle("edex:context-create", async (event, type, cwd, options) => {
        if (!trusted(event)) return null;
        return createContextPack(type, cwd, options || {});
    });

    ipc.handle("edex:workspace-list-files", async (event, cwd, options) => {
        if (!trusted(event)) return null;
        return workspaceListFiles(cwd, options || {});
    });

    ipc.handle("edex:workspace-search", async (event, cwd, query, options) => {
        if (!trusted(event)) return null;
        return workspaceSearch(cwd, query, options || {});
    });

    ipc.handle("edex:plugins-list", async event => {
        if (!trusted(event)) return [];
        return listPlugins(readSettings(), app);
    });

    ipc.handle("edex:plugins-set-state", async (event, pluginId, enabled, errorMessage) => {
        if (!trusted(event) || typeof pluginId !== "string" || !pluginId) return false;
        return setPluginState(pluginId, !!enabled, errorMessage || "");
    });

    ipc.handle("edex:shell-test", async (event, options) => {
        if (!trusted(event)) return {ok: false, error: "Untrusted sender"};
        try {
            return await testShellLaunch(options || {});
        } catch(error) {
            return {
                ok: false,
                error: error.message || String(error)
            };
        }
    });

    ipc.handle("edex:ssh-key-status", async (event, options) => {
        if (!trusted(event)) return null;
        return sshKeyStatus(options || {});
    });

    ipc.handle("edex:ssh-key-generate", async (event, options) => {
        if (!trusted(event)) return null;
        return generateSshKey(options || {});
    });

    ipc.handle("edex:ssh-key-copy-public", async (event, options) => {
        if (!trusted(event)) return false;
        const key = await readSshPublicKey(options && options.keyPath, options && options.profile || {});
        clipboard.writeText(key.publicKey);
        return {
            copied: true,
            keyPath: key.keyPath,
            publicPath: key.publicPath
        };
    });

    ipc.handle("edex:ssh-key-install-command", async (event, options) => {
        if (!trusted(event)) return null;
        return buildSshKeyInstallCommand(options || {}, readSettings());
    });

    ipc.handle("edex:ssh-key-test", async (event, options) => {
        if (!trusted(event)) return null;
        return testSshKeyLogin(options || {});
    });

    ipc.handle("edex:network-resolve-endpoint", async (event, endpoint) => {
        if (!trusted(event)) return null;
        return resolveEndpoint(endpoint);
    });

    ipc.handle("edex:spotify-status", async event => {
        if (!trusted(event)) return null;
        return spotifyStatus(readSettings());
    });

    ipc.handle("edex:spotify-configure", async (event, options) => {
        if (!trusted(event)) return null;
        return spotifyConfigure(options || {});
    });

    ipc.handle("edex:spotify-connect", async (event, options) => {
        if (!trusted(event)) return null;
        return spotifyStartAuth(options || {});
    });

    ipc.handle("edex:spotify-disconnect", async event => {
        if (!trusted(event)) return null;
        return spotifyDisconnect();
    });

    ipc.handle("edex:spotify-state", async event => {
        if (!trusted(event)) return null;
        return spotifyPlaybackState();
    });

    ipc.handle("edex:spotify-control", async (event, action, options) => {
        if (!trusted(event)) return null;
        return spotifyControl(String(action || ""), options || {});
    });

    ipc.handle("edex:diagnostics-snapshot", async event => {
        if (!trusted(event)) return null;
        return diagnosticsSnapshot();
    });

    ipc.handle("edex:startup-get", event => {
        if (!trusted(event)) return null;
        return getStartupStatus();
    });

    ipc.handle("edex:startup-set", (event, enabled) => {
        if (!trusted(event)) return null;
        return setStartup(!!enabled);
    });

    app.on("before-quit", () => {
        watchers.forEach(watcher => watcher.close().catch(() => {}));
        watchers.clear();
    });

    return {
        normalizeSettings,
        detectTools,
        getStartupStatus,
        setStartup,
        diagnosticsSnapshot
    };
}

module.exports = {
    defaultDevSettings,
    normalizeSettings,
    registerDevBackend,
    redactSecrets
};

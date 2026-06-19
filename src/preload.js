const { contextBridge, ipcRenderer, clipboard, webFrame } = require("electron");
const fs = require("fs");
const https = require("https");
const net = require("net");
const os = require("os");
const path = require("path");
const { createRequire } = require("module");

const appRequire = createRequire(path.join(__dirname, "_renderer.js"));
const context = ipcRenderer.sendSync("edex:get-context");

const callbacks = new Map();
const windowEventCallbacks = new Map();
let idCounter = 0;
let geoLookup = null;
let geoInitPromise = null;
const devfsWatchListeners = new Map();

function isSafePath(value) {
    return typeof value === "string" && value.length > 0 && !/^[a-z]+:\/\//i.test(value);
}

function cloneStats(stats) {
    return {
        size: stats.size,
        mtime: stats.mtime,
        isDirectory: () => stats.isDirectory(),
        isFile: () => stats.isFile(),
        isSymbolicLink: () => stats.isSymbolicLink()
    };
}

function readFileSync(file, options) {
    if (!isSafePath(file)) throw new Error("Invalid file path");
    const data = fs.readFileSync(file, options);
    return Buffer.isBuffer(data) ? data.toString() : data;
}

const fsApi = {
    existsSync: file => isSafePath(file) && fs.existsSync(file),
    mkdirSync: (dir, options) => {
        if (!isSafePath(dir)) throw new Error("Invalid directory path");
        return fs.mkdirSync(dir, options);
    },
    readFileSync,
    readdirSync: dir => {
        if (!isSafePath(dir)) throw new Error("Invalid directory path");
        return fs.readdirSync(dir);
    },
    lstatSync: file => {
        if (!isSafePath(file)) throw new Error("Invalid file path");
        return cloneStats(fs.lstatSync(file));
    },
    writeFileSync: (file, data, options) => {
        if (!isSafePath(file)) throw new Error("Invalid file path");
        return fs.writeFileSync(file, data, options);
    },
    readFile: (file, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }
        if (!isSafePath(file)) return callback(new Error("Invalid file path"));
        fs.readFile(file, options, callback);
    },
    writeFile: (file, data, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }
        if (!isSafePath(file)) return callback(new Error("Invalid file path"));
        fs.writeFile(file, data, options, callback);
    },
    readdir: (dir, callback) => {
        if (!isSafePath(dir)) return callback(new Error("Invalid directory path"));
        fs.readdir(dir, callback);
    },
    lstat: (file, callback) => {
        if (!isSafePath(file)) return callback(new Error("Invalid file path"));
        fs.lstat(file, (error, stats) => callback(error, stats ? cloneStats(stats) : stats));
    },
    readlink: (file, callback) => {
        if (!isSafePath(file)) return callback(new Error("Invalid file path"));
        fs.readlink(file, callback);
    },
    watch: (target, listener) => {
        if (!isSafePath(target)) throw new Error("Invalid watch path");
        const watcher = fs.watch(target, listener);
        return {
            close: () => watcher.close()
        };
    }
};

const pathApi = {
    basename: path.basename,
    dirname: path.dirname,
    extname: path.extname,
    isAbsolute: path.isAbsolute,
    join: path.join,
    normalize: path.normalize,
    parse: path.parse,
    resolve: path.resolve,
    sep: path.sep
};

function nanoid(size = 21) {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    let id = "";
    for (let i = 0; i < size; i++) id += alphabet[bytes[i] & 63];
    return id;
}

function formatBytes(value) {
    if (!Number.isFinite(value)) return "0 B";
    const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const sign = value < 0 ? "-" : "";
    let size = Math.abs(value);
    let unit = 0;
    while (size >= 1000 && unit < units.length - 1) {
        size /= 1000;
        unit++;
    }
    return `${sign}${unit === 0 ? size : Number(size.toFixed(1))} ${units[unit]}`;
}

function safeRequire(request) {
    if (request === "fs") return fsApi;
    if (request === "path") return pathApi;
    if (request === "os") {
        return {
            platform: () => os.platform(),
            type: () => os.type(),
            uptime: () => os.uptime()
        };
    }
    if (request === "mime-types") return appRequire("mime-types");
    if (request === "smoothie") return appRequire("smoothie");
    if (request === "howler") return appRequire("howler");
    if (request === "nanoid" || request === "nanoid/non-secure") return { nanoid };
    if (request === "pretty-bytes") return formatBytes;
    if (request === "fuse.js") return appRequire("fuse.js");
    if (request === "codemirror") return appRequire("codemirror");
    if (request === "@codemirror/view") return appRequire("@codemirror/view");
    if (request === "@codemirror/search") return appRequire("@codemirror/search");
    if (request === "@codemirror/autocomplete") return appRequire("@codemirror/autocomplete");
    if (request === "@codemirror/lint") return appRequire("@codemirror/lint");
    if (request === "@codemirror/language") return appRequire("@codemirror/language");
    if (request === "@codemirror/commands") return appRequire("@codemirror/commands");
    if (request === "@codemirror/lang-javascript") return appRequire("@codemirror/lang-javascript");
    if (request === "@codemirror/lang-json") return appRequire("@codemirror/lang-json");
    if (request === "@codemirror/lang-markdown") return appRequire("@codemirror/lang-markdown");
    if (request === "@xterm/xterm") return appRequire("@xterm/xterm");
    if (request === "@xterm/addon-attach") return appRequire("@xterm/addon-attach");
    if (request === "@xterm/addon-fit") return appRequire("@xterm/addon-fit");
    if (request === "@xterm/addon-ligatures") return appRequire("@xterm/addon-ligatures");
    if (request === "@xterm/addon-webgl") return appRequire("@xterm/addon-webgl");

    const resolved = path.resolve(__dirname, request);
    const inApp = resolved === __dirname || resolved.startsWith(__dirname + path.sep);
    const inUserData = resolved === context.paths.userData || resolved.startsWith(context.paths.userData + path.sep);
    if (!inApp && !inUserData) throw new Error(`Blocked renderer require: ${request}`);

    if (resolved.endsWith(".json")) {
        return JSON.parse(fs.readFileSync(resolved, "utf-8").replace(/^\uFEFF/, ""));
    }
    if (resolved.endsWith(".js")) {
        return appRequire(resolved);
    }
    throw new Error(`Unsupported renderer require: ${request}`);
}

const allowedIpc = new Set([
    "log",
    "ttyspawn",
    "ttyspawn-reply",
    "getThemeOverride",
    "getKbOverride",
    "setThemeOverride",
    "setKbOverride",
    "systeminformation-call"
]);

function isAllowedIpc(channel) {
    return allowedIpc.has(channel)
        || channel.startsWith("terminal_channel-")
        || channel.startsWith("systeminformation-reply-");
}

const ipcApi = {
    send: (channel, ...args) => {
        if (!isAllowedIpc(channel)) throw new Error(`Blocked IPC send: ${channel}`);
        ipcRenderer.send(channel, ...args);
    },
    on: (channel, listener) => {
        if (!isAllowedIpc(channel)) throw new Error(`Blocked IPC listener: ${channel}`);
        ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    },
    once: (channel, listener) => {
        if (!isAllowedIpc(channel)) throw new Error(`Blocked IPC listener: ${channel}`);
        ipcRenderer.once(channel, (event, ...args) => listener(event, ...args));
    }
};

ipcRenderer.on("edex:global-shortcut", (event, id) => {
    const callback = callbacks.get(id);
    if (callback) callback();
});

ipcRenderer.on("edex:window-event", (event, name) => {
    const list = windowEventCallbacks.get(name) || [];
    list.forEach(callback => callback());
});

const windowApi = {
    minimize: () => ipcRenderer.send("edex:window-control", "minimize"),
    toggleDevTools: () => ipcRenderer.send("edex:window-control", "toggleDevTools"),
    isFullScreen: () => ipcRenderer.sendSync("edex:window-sync", "isFullScreen"),
    setFullScreen: value => ipcRenderer.send("edex:window-control", "setFullScreen", !!value),
    isMaximized: () => ipcRenderer.sendSync("edex:window-sync", "isMaximized"),
    unmaximize: () => ipcRenderer.send("edex:window-control", "unmaximize"),
    getSize: () => ipcRenderer.sendSync("edex:window-sync", "getSize"),
    setSize: (width, height) => ipcRenderer.send("edex:window-control", "setSize", Number(width), Number(height)),
    on: (name, callback) => {
        if (!["resize", "leave-full-screen"].includes(name)) throw new Error(`Blocked window event: ${name}`);
        const list = windowEventCallbacks.get(name) || [];
        list.push(callback);
        windowEventCallbacks.set(name, list);
    }
};

const globalShortcutApi = {
    register: (accelerator, callback) => {
        const id = `shortcut-${++idCounter}`;
        callbacks.set(id, callback);
        ipcRenderer.send("edex:global-shortcut-register", id, accelerator);
        return true;
    },
    unregisterAll: () => {
        callbacks.clear();
        ipcRenderer.send("edex:global-shortcut-unregister-all");
    }
};

function openExternal(url) {
    return ipcRenderer.invoke("edex:open-external", url);
}

function openPath(file) {
    return ipcRenderer.invoke("edex:open-path", file);
}

function devfsWatch(target, callback) {
    if (typeof callback !== "function") throw new Error("devfs.watch requires a callback");
    return ipcRenderer.invoke("edex:devfs-watch-start", target).then(result => {
        if (!result || result.error || !result.id) throw new Error(result && result.error || "Unable to start watcher");
        const channel = `edex:devfs-watch-event:${result.id}`;
        const listener = (event, payload) => callback(payload);
        ipcRenderer.on(channel, listener);
        devfsWatchListeners.set(result.id, {channel, listener});
        return {
            id: result.id,
            close: () => {
                const saved = devfsWatchListeners.get(result.id);
                if (saved) {
                    ipcRenderer.removeListener(saved.channel, saved.listener);
                    devfsWatchListeners.delete(result.id);
                }
                return ipcRenderer.invoke("edex:devfs-watch-stop", result.id);
            }
        };
    });
}

function getLatestRelease() {
    return new Promise((resolve, reject) => {
        https.get({
            protocol: "https:",
            host: "api.github.com",
            path: "/repos/gabrielfriasw/edex-revival/releases/latest",
            headers: {
                "User-Agent": "eDEX Revival UpdateChecker"
            }
        }, res => {
            let raw = "";
            res.on("data", chunk => { raw += chunk; });
            res.on("end", () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`GitHub API returned ${res.statusCode}: ${raw}`));
                    return;
                }
                try {
                    resolve(JSON.parse(raw));
                } catch (error) {
                    reject(error);
                }
            });
        }).on("error", reject);
    });
}

function externalIp(localAddress) {
    return new Promise((resolve, reject) => {
        const req = https.get({
            host: "myexternalip.com",
            port: 443,
            path: "/json",
            ...(localAddress ? {localAddress} : {}),
            agent: new https.Agent({ keepAlive: false, maxSockets: 10 })
        }, res => {
            let raw = "";
            res.on("data", chunk => { raw += chunk; });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(raw));
                } catch (error) {
                    error.raw = raw;
                    reject(error);
                }
            });
        });
        req.on("error", error => {
            if (localAddress && error.code === "EINVAL") {
                externalIp().then(resolve).catch(reject);
            } else {
                reject(error);
            }
        });
    });
}

function ping(target, port, localAddress) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const started = process.hrtime.bigint();
        socket.connect({ port, host: target, ...(localAddress ? {localAddress} : {}), family: 4 }, () => {
            const elapsed = Number(process.hrtime.bigint() - started) / 1e6;
            resolve(elapsed);
            socket.destroy();
        });
        socket.on("error", error => {
            socket.destroy();
            if (localAddress && error.code === "EINVAL") {
                ping(target, port).then(resolve).catch(reject);
            } else {
                reject(error);
            }
        });
        socket.setTimeout(1900, () => {
            socket.destroy();
            reject(new Error("Socket timeout"));
        });
    });
}

async function initGeoIp() {
    if (geoInitPromise) return geoInitPromise;
    geoInitPromise = (async () => {
        const geolite2 = appRequire("geolite2-redist");
        const maxmind = appRequire("maxmind");
        const dbPath = path.join(context.paths.userData, "geoIPcache");
        await geolite2.downloadDbs({path: dbPath});
        geoLookup = await geolite2.open("GeoLite2-City", databasePath => maxmind.open(databasePath), dbPath);
        return true;
    })();
    return geoInitPromise;
}

function lookupGeoIp(ip) {
    return geoLookup ? geoLookup.get(ip) : null;
}

contextBridge.exposeInMainWorld("__dirname", __dirname);
contextBridge.exposeInMainWorld("process", {
    env: {},
    platform: process.platform,
    type: "renderer",
    versions: process.versions
});
contextBridge.exposeInMainWorld("require", safeRequire);
contextBridge.exposeInMainWorld("edex", {
    ai: {
        detectTools: () => ipcRenderer.invoke("edex:ai-detect-tools"),
        runPromptInTab: (provider, prompt) => ipcRenderer.invoke("edex:ai-run-prompt", provider, prompt)
    },
    app: {
        argv: context.argv,
        focus: () => ipcRenderer.send("edex:app-control", "focus"),
        getVersion: () => context.appVersion,
        quit: () => ipcRenderer.send("edex:app-control", "quit"),
        relaunch: () => ipcRenderer.send("edex:app-control", "relaunch")
    },
    appVersion: context.appVersion,
    clipboard: {
        readText: () => clipboard.readText(),
        writeText: value => clipboard.writeText(String(value))
    },
    formatBytes,
    getLatestRelease,
    geoip: {
        init: initGeoIp,
        lookup: lookupGeoIp
    },
    globalShortcut: globalShortcutApi,
    git: {
        status: cwd => ipcRenderer.invoke("edex:git-status", cwd),
        diff: (cwd, file) => ipcRenderer.invoke("edex:git-diff", cwd, file)
    },
    ipc: ipcApi,
    isArchUser: () => os.platform() === "linux"
        && fs.existsSync("/etc/os-release")
        && fs.readFileSync("/etc/os-release", "utf-8").includes("arch"),
    nanoid,
    netstat: {
        externalIp,
        ping
    },
    openExternal,
    openPath,
    recoveryWarnings: context.recoveryWarnings || [],
    contextPack: {
        create: (type, cwd, options) => ipcRenderer.invoke("edex:context-create", type, cwd, options || {}),
        scanRepo: cwd => ipcRenderer.invoke("edex:context-scan-repo", cwd)
    },
    diagnostics: {
        snapshot: () => ipcRenderer.invoke("edex:diagnostics-snapshot")
    },
    devfs: {
        readDir: (target, options) => ipcRenderer.invoke("edex:devfs-read-dir", target, options || {}),
        preview: (target, bytes) => ipcRenderer.invoke("edex:devfs-preview", target, bytes),
        readFile: (target, bytes) => ipcRenderer.invoke("edex:devfs-read-file", target, bytes),
        writeFile: (target, content) => ipcRenderer.invoke("edex:devfs-write-file", target, content),
        saveAs: (target, content) => ipcRenderer.invoke("edex:devfs-save-as", target, content),
        listDrives: () => ipcRenderer.invoke("edex:devfs-list-drives"),
        stat: target => ipcRenderer.invoke("edex:devfs-stat", target),
        hash: target => ipcRenderer.invoke("edex:devfs-hash", target),
        gitStatus: target => ipcRenderer.invoke("edex:devfs-git-status", target),
        gitDiff: target => ipcRenderer.invoke("edex:devfs-git-diff", target),
        watch: devfsWatch,
        createFile: (target, content) => ipcRenderer.invoke("edex:devfs-create-file", target, content || ""),
        createFolder: target => ipcRenderer.invoke("edex:devfs-create-folder", target),
        rename: (source, targetName) => ipcRenderer.invoke("edex:devfs-rename", source, targetName),
        duplicate: (source, target) => ipcRenderer.invoke("edex:devfs-duplicate", source, target),
        copy: (source, target) => ipcRenderer.invoke("edex:devfs-copy", source, target),
        move: (source, target) => ipcRenderer.invoke("edex:devfs-move", source, target),
        trash: target => ipcRenderer.invoke("edex:devfs-trash", target),
        openExternal: target => ipcRenderer.invoke("edex:devfs-open-external", target),
        openTerminalHere: target => ipcRenderer.invoke("edex:devfs-open-terminal-here", target),
        copyPath: (target, format) => ipcRenderer.invoke("edex:devfs-copy-path", target, format),
        toWslPath: target => ipcRenderer.invoke("edex:devfs-to-wsl-path", target),
        copyText: value => ipcRenderer.invoke("edex:devfs-copy-text", value)
    },
    plugins: {
        list: () => ipcRenderer.invoke("edex:plugins-list"),
        setState: (pluginId, enabled, errorMessage) => ipcRenderer.invoke("edex:plugins-set-state", pluginId, !!enabled, errorMessage || "")
    },
    shell: {
        test: options => ipcRenderer.invoke("edex:shell-test", options || {})
    },
    sshKey: {
        status: options => ipcRenderer.invoke("edex:ssh-key-status", options || {}),
        generate: options => ipcRenderer.invoke("edex:ssh-key-generate", options || {}),
        copyPublic: options => ipcRenderer.invoke("edex:ssh-key-copy-public", options || {}),
        installCommand: options => ipcRenderer.invoke("edex:ssh-key-install-command", options || {}),
        test: options => ipcRenderer.invoke("edex:ssh-key-test", options || {})
    },
    networkLens: {
        resolveEndpoint: endpoint => ipcRenderer.invoke("edex:network-resolve-endpoint", endpoint)
    },
    paths: context.paths,
    platform: process.platform,
    screen: {
        getAllDisplays: () => ipcRenderer.sendSync("edex:screen-sync", "getAllDisplays")
    },
    updates: {
        state: () => ipcRenderer.invoke("edex:updates-state"),
        check: () => ipcRenderer.invoke("edex:updates-check"),
        download: () => ipcRenderer.invoke("edex:updates-download"),
        install: () => ipcRenderer.invoke("edex:updates-install"),
        onEvent: callback => {
            if (typeof callback !== "function") return () => {};
            const listener = (event, state) => callback(state);
            ipcRenderer.on("edex:update-event", listener);
            return () => ipcRenderer.removeListener("edex:update-event", listener);
        }
    },
    spotify: {
        status: () => ipcRenderer.invoke("edex:spotify-status"),
        configure: options => ipcRenderer.invoke("edex:spotify-configure", options || {}),
        connect: options => ipcRenderer.invoke("edex:spotify-connect", options || {}),
        disconnect: () => ipcRenderer.invoke("edex:spotify-disconnect"),
        state: () => ipcRenderer.invoke("edex:spotify-state"),
        control: (action, options) => ipcRenderer.invoke("edex:spotify-control", action, options || {})
    },
    setVisualZoomLevelLimits: (minimum, maximum) => webFrame.setVisualZoomLevelLimits(minimum, maximum),
    startup: {
        get: () => ipcRenderer.invoke("edex:startup-get"),
        set: enabled => ipcRenderer.invoke("edex:startup-set", !!enabled)
    },
    workspace: {
        listFiles: (cwd, options) => ipcRenderer.invoke("edex:workspace-list-files", cwd, options || {}),
        search: (cwd, query, options) => ipcRenderer.invoke("edex:workspace-search", cwd, query, options || {})
    },
    username: async () => {
        const mod = await import("username");
        const fn = mod.default || mod.username || mod;
        return fn();
    },
    versions: process.versions,
    window: windowApi
});

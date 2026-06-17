const crypto = require("crypto");
const dns = require("dns");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const url = require("url");
const childProcess = require("child_process");
const {clipboard} = require("electron");
const mime = require("mime-types");

const MAX_PREVIEW_BYTES = 1024 * 1024;
const DEFAULT_CONTEXT_BYTES = 60000;
const MAX_EDITOR_BYTES = 5 * 1024 * 1024;
const MAX_WORKSPACE_FILES = 2500;
const MAX_WORKSPACE_SEARCH_MATCHES = 250;
const MAX_WORKSPACE_SEARCH_BYTES = 256 * 1024;

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
        return JSON.parse(fs.readFileSync(file, "utf-8"));
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
        ai: {
            enabled: false,
            defaultProvider: "auto",
            contextBytes: DEFAULT_CONTEXT_BYTES,
            redactSecrets: true,
            commands: {
                codex: "codex",
                claude: "claude"
            }
        },
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

function normalizeSettings(settings) {
    return mergeDefaults(settings || {}, defaultDevSettings());
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

function registerDevBackend({app, ipc, shell, getWindow, settingsFile, isTrustedSender, signale}) {
    const watchers = new Map();
    const promptDir = path.join(app.getPath("userData"), "ai-prompts");

    function readSettings() {
        const current = normalizeSettings(readJsonFile(settingsFile, {}));
        return current;
    }

    function persistSettings(settings) {
        writeJsonFile(settingsFile, normalizeSettings(settings));
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
        let preferred = ai.defaultProvider || "auto";
        if (preferred === "auto") {
            preferred = codex.available ? "codex" : (claude.available ? "claude" : "custom");
        }
        return {
            enabled: ai.enabled !== false,
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
        const settings = readSettings();
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
                title: "AI integration",
                status: settings.ai && settings.ai.enabled !== false ? "warn" : "ok",
                detail: settings.ai && settings.ai.enabled !== false ? "Enabled by settings" : "Disabled by settings"
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
                aiEnabled: !!(settings.ai && settings.ai.enabled !== false),
                devExplorerEnabled: !!(settings.devExplorer && settings.devExplorer.enabled !== false),
                widgetsVisible: !(settings.widgets && settings.widgets.visible === false)
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
        let selected = provider || tools.preferred || "codex";
        if (selected === "auto") selected = tools.preferred;
        if (!["codex", "claude"].includes(selected)) selected = tools.providers.codex.available ? "codex" : "claude";

        const providerCommand = ai.commands && ai.commands[selected] || selected;
        const safePrompt = ai.redactSecrets === false ? stripControlText(prompt) : redactSecrets(prompt);
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
        const chokidar = await loadModule("chokidar");
        const id = crypto.randomBytes(8).toString("hex");
        const watcher = chokidar.watch(target, {
            ignoreInitial: true,
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

    ipc.handle("edex:network-resolve-endpoint", async (event, endpoint) => {
        if (!trusted(event)) return null;
        return resolveEndpoint(endpoint);
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

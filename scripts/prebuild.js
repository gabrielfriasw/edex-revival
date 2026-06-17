const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "src");
const target = path.join(root, "prebuild-src");

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, {
    recursive: true,
    filter: entry => path.basename(entry) !== "node_modules"
});

const minify = spawnSync(process.execPath, [path.join(root, "prebuild-minify.js")], {
    cwd: root,
    stdio: "inherit"
});

if (minify.status !== 0) {
    process.exit(minify.status || 1);
}

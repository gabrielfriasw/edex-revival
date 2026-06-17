const fs = require("fs");
const path = require("path");

fs.rmSync(path.resolve(__dirname, "..", "prebuild-src"), {
    recursive: true,
    force: true
});

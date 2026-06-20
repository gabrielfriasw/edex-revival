const assert = require("assert");
const {
    isLoopbackAddress,
    safeTokenEqual,
    terminalAuthFromRequest
} = require("../src/classes/terminal.class.js");

const token = "0123456789abcdef0123456789abcdef";
const request = (remoteAddress, url) => ({
    req: {
        socket: {remoteAddress},
        url
    }
});

assert.strictEqual(isLoopbackAddress("127.0.0.1"), true);
assert.strictEqual(isLoopbackAddress("127.12.34.56"), true);
assert.strictEqual(isLoopbackAddress("::1"), true);
assert.strictEqual(isLoopbackAddress("::ffff:127.0.0.1"), true);
assert.strictEqual(isLoopbackAddress("192.168.1.10"), false);

assert.strictEqual(safeTokenEqual(token, token), true);
assert.strictEqual(safeTokenEqual("wrong", token), false);
assert.strictEqual(safeTokenEqual("", token), false);

assert.deepStrictEqual(terminalAuthFromRequest(request("127.0.0.1", "/"), token), {
    ok: false,
    reason: "bad-token"
});
assert.deepStrictEqual(terminalAuthFromRequest(request("127.0.0.1", "/?token=wrong"), token), {
    ok: false,
    reason: "bad-token"
});
assert.deepStrictEqual(terminalAuthFromRequest(request("192.168.1.10", `/?token=${token}`), token), {
    ok: false,
    reason: "non-loopback"
});
assert.deepStrictEqual(terminalAuthFromRequest(request("127.0.0.1", `/?token=${token}`), token), {
    ok: true,
    reason: "ok"
});

console.log("terminal transport harness passed");

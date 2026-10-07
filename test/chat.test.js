const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { app, isValidMessage, isValidSessionId } = require("../backend/server");

const requiredEnvironment = ["OPENAI_API_KEY", "MONGODB_URI"];
const originalEnvironment = new Map();
let server;
let baseUrl;

before(async () => {
    for (const key of requiredEnvironment) {
        originalEnvironment.set(key, process.env[key]);
        delete process.env[key];
    }

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });

    for (const key of requiredEnvironment) {
        const value = originalEnvironment.get(key);
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
});

test("validates message lengths and UUID session IDs", () => {
    assert.equal(isValidMessage("Hello VKY"), true);
    assert.equal(isValidMessage("  "), false);
    assert.equal(isValidMessage("x".repeat(2001)), false);
    assert.equal(isValidSessionId("3b12f1df-5232-4804-897e-917bf397618a"), true);
    assert.equal(isValidSessionId("not-a-session"), false);
});

test("reports service readiness without exposing secrets", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        status: "ok",
        openAIConfigured: false,
        mongoConfigured: false,
        contactMongoState: "disconnected"
    });
});

test("rejects invalid chat requests before calling external services", async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sessionId: "invalid",
            message: "Hello"
        })
    });

    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /session ID is invalid/);
});

test("explains when VKY credentials have not been configured", async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sessionId: "3b12f1df-5232-4804-897e-917bf397618a",
            message: "Hello"
        })
    });

    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /not configured/);
});

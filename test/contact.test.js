const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { app } = require("../backend/server");

let originalMongoUri;
let server;
let baseUrl;

before(async () => {
  originalMongoUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (originalMongoUri === undefined) {
    delete process.env.MONGODB_URI;
  } else {
    process.env.MONGODB_URI = originalMongoUri;
  }
});

async function postContact(body) {
  return fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

test("rejects missing required contact fields", async () => {
  const response = await postContact({
    name: "Vivek",
    email: "vivek@example.com"
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /required/);
});

test("rejects an invalid contact email", async () => {
  const response = await postContact({
    name: "Vivek",
    email: "not-an-email",
    reason: "Other",
    message: "Hello"
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid email/);
});

test("returns a JSON service error when MongoDB is not configured", async () => {
  const response = await postContact({
    name: "Vivek",
    email: "vivek@example.com",
    reason: "Other",
    message: "Hello",
    phone: "",
    company: ""
  });

  assert.equal(response.status, 503);
  const result = await response.json();
  assert.match(result.error, /temporarily unavailable/);
  assert.match(result.details, /MONGODB_URI is not configured/);
  assert.match(result.details, /repository-root \.env file/);
});

test("explains placeholder Atlas credentials without attempting a connection", async () => {
  process.env.MONGODB_URI =
    "mongodb+srv://test-user:%3Cpassword%3E@cluster.example.mongodb.net/";

  try {
    const response = await postContact({
      name: "Vivek",
      email: "vivek@example.com",
      reason: "Other",
      message: "Hello"
    });

    assert.equal(response.status, 503);
    const result = await response.json();
    assert.match(result.details, /still contains placeholder credentials/);
    assert.doesNotMatch(result.details, /test-user|password.*@/i);
  } finally {
    delete process.env.MONGODB_URI;
  }
});

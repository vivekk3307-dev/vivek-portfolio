const { spawn } = require("node:child_process");

const children = [
  spawn(process.execPath, ["--watch", "backend/server.js"], {
    stdio: "inherit"
  }),
  spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--config",
      "frontend/vite.config.mjs",
      "--host",
      "127.0.0.1"
    ],
    { stdio: "inherit" }
  )
];

let stopping = false;

function stopChildren(signal = "SIGTERM") {
  if (stopping) {
    return;
  }
  stopping = true;
  children.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

children.forEach((child) => {
  child.on("error", (error) => {
    console.error("Unable to start a development process:", error.message);
    process.exitCode = 1;
    stopChildren();
  });
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code || 0;
      stopChildren();
    }
  });
});

process.once("SIGINT", () => {
  process.exitCode = 130;
  stopChildren("SIGINT");
});
process.once("SIGTERM", () => {
  process.exitCode = 143;
  stopChildren("SIGTERM");
});

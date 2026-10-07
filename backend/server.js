const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env")
});

const express = require("express");
const mongoose = require("mongoose");

const {
  createChatRouter,
  isValidMessage,
  isValidSessionId
} = require("./routes/chat");

const { createContactRouter } = require("./routes/contact");

const app = express();

const frontendBuildDirectory = path.join(
  __dirname,
  "..",
  "frontend",
  "dist"
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (request, response) => {
  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  response.json({
    status: "ok",
    openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
    mongoConfigured: Boolean(process.env.MONGODB_URI),
    mongoState: mongoStates[mongoose.connection.readyState] || "unknown",
    mongoDatabase: mongoose.connection.name || null
  });
});

app.use("/api/chat", createChatRouter());
app.use("/api/contact", createContactRouter());

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return response.status(400).json({
      error: "Request body must be valid JSON."
    });
  }

  console.error("Unhandled API error:", error.message);

  return response.status(500).json({
    error: "An unexpected server error occurred."
  });
});

if (fs.existsSync(frontendBuildDirectory)) {
  app.use(express.static(frontendBuildDirectory));

  app.get(
    /^(?!\/api(?:\/|$)).*/,
    (request, response) => {
      response.sendFile(
        path.join(frontendBuildDirectory, "index.html")
      );
    }
  );
}

async function connectToMongoDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to the repository-root .env file."
    );
  }

  console.log("Connecting to MongoDB...");

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "devspace",
    serverSelectionTimeoutMS: 5000
  });

  console.log("MongoDB connected successfully");
  console.log(`MongoDB database: ${mongoose.connection.name}`);
}

async function startServer() {
  const port = Number(process.env.PORT) || 3000;

  try {
    await connectToMongoDB();

    const server = app.listen(port, () => {
      console.log(
        `Server running on http://localhost:${port}`
      );
    });

    const shutdown = async () => {
      console.log("\nShutting down server...");

      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log("MongoDB connection closed.");
          process.exit(0);
        } catch (error) {
          console.error(
            "Unable to close MongoDB connection:",
            error.message
          );
          process.exit(1);
        }
      });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("MongoDB startup failed:");
    console.error(error.message);

    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  isValidMessage,
  isValidSessionId
};
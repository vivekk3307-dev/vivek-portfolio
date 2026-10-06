require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const { createChatRouter, isValidMessage, isValidSessionId } = require("./routes/chat");
const { closeDatabase } = require("./services/chatService");

const app = express();
const frontendBuildDirectory = path.join(__dirname, "..", "frontend", "dist");

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (request, response) => {
    response.json({
        status: "ok",
        openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
        mongoConfigured: Boolean(process.env.MONGODB_URI)
    });
});

app.use("/api/chat", createChatRouter());

if (fs.existsSync(frontendBuildDirectory)) {
    app.use(express.static(frontendBuildDirectory));
    app.get(/^(?!\/api(?:\/|$)).*/, (request, response) => {
        response.sendFile(path.join(frontendBuildDirectory, "index.html"));
    });
}

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    const shutdown = () => {
        server.close(() => {
            closeDatabase().catch((error) => {
                console.error("Unable to close the MongoDB connection:", error.message);
            });
        });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

module.exports = { app, isValidMessage, isValidSessionId };

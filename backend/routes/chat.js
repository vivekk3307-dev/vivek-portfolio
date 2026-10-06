const express = require("express");
const {
  createChatReply,
  getChatHistory,
  prepareChatService
} = require("../services/chatService");

const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidSessionId(sessionId) {
  return typeof sessionId === "string" && sessionIdPattern.test(sessionId);
}

function isValidMessage(message) {
  return (
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.length <= 2000
  );
}

function createChatRouter() {
  const router = express.Router();

  router.get("/:sessionId", async (request, response) => {
    const { sessionId } = request.params;

    if (!isValidSessionId(sessionId)) {
      return response
        .status(400)
        .json({ error: "The chat session ID is invalid." });
    }

    try {
      const messages = await getChatHistory(sessionId);
      return response.json({ messages });
    } catch (error) {
      console.error("Unable to load chat history:", error.message);
      return response.status(503).json({
        error:
          "Chat history is unavailable. Check the MongoDB configuration and connection."
      });
    }
  });

  router.post("/", async (request, response) => {
    const { sessionId, message } = request.body || {};

    if (!isValidSessionId(sessionId)) {
      return response
        .status(400)
        .json({ error: "The chat session ID is invalid." });
    }

    if (!isValidMessage(message)) {
      return response
        .status(400)
        .json({ error: "Enter a message of 1 to 2,000 characters." });
    }

    let chatServices;
    try {
      chatServices = await prepareChatService();
    } catch (error) {
      console.error("VKY configuration is incomplete:", error.message);
      return response.status(503).json({
        error:
          "VKY is not configured yet. Set the OpenAI API key and MongoDB connection in the server environment."
      });
    }

    try {
      const reply = await createChatReply(
        sessionId,
        message.trim(),
        chatServices
      );
      return response.json({ reply });
    } catch (error) {
      if (error.message === "OpenAI returned an empty response for VKY.") {
        console.error(error.message);
        return response.status(502).json({
          error: "VKY could not create a reply. Please try again."
        });
      }

      console.error("VKY could not complete the chat request:", error.message);
      return response.status(502).json({
        error:
          "VKY could not reply right now. Check the API and database connections, then try again."
      });
    }
  });

  return router;
}

module.exports = { createChatRouter, isValidMessage, isValidSessionId };

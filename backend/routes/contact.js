const express = require("express");
const mongoose = require("mongoose");
const { saveContact } = require("../services/contactService");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redactMongoUri(value) {
  return value.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://[REDACTED]");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createContactRouter() {
  const router = express.Router();

  router.post("/", async (request, response) => {
    const body = request.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response.status(400).json({ error: "A contact form is required." });
    }

    const { name, email, phone = "", company = "", reason, message } = body;
    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(reason) ||
      !isNonEmptyString(message)
    ) {
      return response.status(400).json({
        error: "Name, email, reason, and message are required."
      });
    }

    const normalizedEmail = email.trim();
    if (!emailPattern.test(normalizedEmail)) {
      return response.status(400).json({ error: "Enter a valid email address." });
    }

    if (
      (typeof phone !== "string") ||
      (typeof company !== "string")
    ) {
      return response.status(400).json({
        error: "Phone number and company must be text when provided."
      });
    }

    try {
      const contact = await saveContact({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        company: company.trim(),
        reason: reason.trim(),
        message: message.trim()
      });

      return response.status(201).json({
        message: "Contact message saved successfully.",
        contact: {
          id: contact.id,
          createdAt: contact.createdAt
        }
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return response.status(400).json({
          error: "Please check the contact form fields and try again."
        });
      }

      if (
        typeof error.message === "string" &&
        error.message.startsWith("MONGODB_URI is not configured.")
      ) {
        console.error("Unable to save contact message:", {
          name: error.name,
          message: redactMongoUri(error.message)
        });
        return response.status(503).json({
          error: "Contact form is temporarily unavailable. Please try again later.",
          ...(!isProduction() && {
            details: redactMongoUri(error.message)
          })
        });
      }

      const diagnosticMessage =
        typeof error.message === "string"
          ? redactMongoUri(error.message)
          : "Unknown database error.";
      console.error("Unable to save contact message:", {
        name: error.name,
        code: error.code,
        message: diagnosticMessage
      });
      return response.status(503).json({
        error: "We couldn't save your message right now. Please try again later.",
        ...(!isProduction() && { details: diagnosticMessage })
      });
    }
  });

  return router;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

module.exports = { createContactRouter };

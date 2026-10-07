const mongoose = require("mongoose");
const Contact = require("../models/Contact");

async function saveContact(contactDetails) {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to the repository-root .env file."
    );
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected.");
  }

  return Contact.create(contactDetails);
}

async function closeContactDatabase() {
  // MongoDB connection is managed centrally by server.js.
}

module.exports = {
  closeContactDatabase,
  saveContact
};
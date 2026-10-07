require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    console.error("Server failed to start:");
    console.error(error.message);
    process.exitCode = 1;
  });

  try {
    console.log("MongoDB connection try ho raha hai...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI .env file me nahi mila");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      tls: true,
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  }
}

startServer();
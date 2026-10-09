"use strict";

const express = require("express");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const INDEX_FILE = path.join(__dirname, "index.html");

app.disable("x-powered-by");

// Parse JSON requests safely
app.use(express.json({ limit: "20kb" }));

// Basic health check
app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");

  res.status(200).json({
    success: true,
    platform: "VELNORA",
    status: "online",
    version: "1.0.0",
    aiConnected: false
  });
});

// Main website
app.get("/", (req, res, next) => {
  res.sendFile(INDEX_FILE, (err) => {
    if (err) next(err);
  });
});

// AI endpoint — placeholder until a real provider is configured
app.post("/api/chat", (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please enter a message."
    });
  }

  if (message.length > 4000) {
    return res.status(413).json({
      success: false,
      error: "Message is too long."
    });
  }

  return res.status(503).json({
    success: false,
    aiConnected: false,
    error: "AI_NOT_CONFIGURED",
    message:
      "The VELNORA AI engine has not been configured yet."
  });
});

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found."
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status < 600
      ? err.status
      : 500;

  res.status(status).json({
    success: false,
    error:
      status === 500
        ? "An internal server error occurred."
        : err.message
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`VELNORA server listening on port ${PORT}`);
});

// Handle unexpected server errors
server.on("error", (err) => {
  console.error("Server startup error:", err);
  process.exitCode = 1;
});
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

// Serve the VELNORA website
app.use(express.static(__dirname));

// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Server status
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    platform: "VELNORA",
    status: "online",
    aiMode: "not-connected",
    apiKeyRequired: false
  });
});

// AI endpoint — ready for a future free AI integration
app.post("/api/chat", (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please enter a message."
    });
  }

  if (message.length > 4000) {
    return res.status(400).json({
      success: false,
      error: "Message is too long."
    });
  }

  return res.status(503).json({
    success: false,
    aiConnected: false,
    reply:
      "VELNORA is running, but its AI engine has not been connected yet. " +
      "A suitable AI provider must be configured before real AI responses are available."
 
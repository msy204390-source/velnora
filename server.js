"use strict";

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const INDEX_FILE = path.join(__dirname, "index.html");

app.disable("x-powered-by");

app.use(express.json({ limit: "20kb" }));

// VELNORA health check
app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");

  res.status(200).json({
    success: true,
    platform: "VELNORA",
    status: "online",
    version: "2.0.0",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

// Main website
app.get("/", (req, res) => {
  res.sendFile(INDEX_FILE);
});

// AI assistant
app.post("/api/chat", async (req, res) => {
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

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: "AI_NOT_CONFIGURED",
      message: "The AI service has not been configured yet."
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions:
        "You are VELNORA AI, a professional multilingual business assistant. Be accurate, helpful, and clear. Never claim to have performed actions you did not perform.",
      input: message.trim(),
      max_output_tokens: 800
    });

    return res.json({
      success: true,
      reply: response.output_text
    });
  } catch (error) {
    console.error("AI request failed:", error.message);

    return res.status(502).json({
      success: false,
      error: "AI_REQUEST_FAILED",
      message: "The AI service could not complete the request."
    });
  }
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
  console.error("Server request error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    error: "An internal server error occurred."
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`VELNORA is running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Startup error:", error.message);
  process.exitCode = 1;
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
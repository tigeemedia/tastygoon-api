const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Configure environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Secure headers
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || "*" })); // Restrict CORS if needed

// Performance Middleware
app.use(compression()); // Gzip compression for better performance

// Rate Limiting (Prevent API abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging & JSON Parsing Middleware
app.use(express.json());
app.use(morgan("dev"));

// Default Route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the TastyGoon API");
});

// API Routes
app.use("/api/auth", require("../routes/auth")); // Authentication routes
app.use("/api/protected", require("../routes/protected")); // Protected routes
app.use("/api/videos", require("../routes/videos")); // Video management routes

// Handle 404 Errors
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

module.exports = app;

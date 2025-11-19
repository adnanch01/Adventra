const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

// Proxy API calls to Flask backend
app.use(
  "/api/hotels",
  createProxyMiddleware({
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
  })
);

app.use(
  "/api/flights",
  createProxyMiddleware({
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
  })
);

app.use(
  "/api/airports",
  createProxyMiddleware({
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Serve React build folder
const buildPath = path.join(__dirname, "../build");
app.use(express.static(buildPath));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// PRODUCTION: serve frontend build
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "dist");

  app.use(express.static(frontendPath));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// IMPORTANT — DO NOT PUT THIS INSIDE THE IF STATEMENT!
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

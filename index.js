require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const billRoutes = require("./routes/bills");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Default route
app.get("/", (req, res) => {
  res.json({ message: "✅ Utility Bill Management API is running..." });
});

// 🔹 API routes

app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/users", userRoutes);

// 🔹 Start server only after DB connects successfully
(async () => {
  try {
    await connectToDB(); // no need to pass URI or db name manually
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
})();

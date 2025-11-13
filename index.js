require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "API running" }));

// routes
app.use("/api/auth", authRoutes);

(async () => {
  try {
    await connectToDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

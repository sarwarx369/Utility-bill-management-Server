const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
require("dotenv").config();

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const db = getDB(); // ✅ getDB call inside function
    const users = db.collection("users");

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await users.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({ name, email, password: hashed });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection("users");

    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const db = getDB();
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("❌ GetMe error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

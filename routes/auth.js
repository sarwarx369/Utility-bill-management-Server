// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

// Register
router.post("/register", async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      name: name || "",
      email: email.toLowerCase(),
      password: hashed,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    const userId = result.insertedId;

    const token = jwt.sign({ userId: userId.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return res
      .status(201)
      .json({
        token,
        user: { _id: userId, name: user.name, email: user.email },
      });
  } catch (err) {
    console.error(err);
    // unique email error from Mongo
    if (err && err.code === 11000)
      return res.status(400).json({ message: "Email already registered" });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    // hide password
    delete user.password;
    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

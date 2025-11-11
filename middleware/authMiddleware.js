// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, JWT_SECRET);
    // attach user info to request
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(payload.userId) },
        { projection: { password: 0 } }
      );
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid token - user not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
}

module.exports = { requireAuth };

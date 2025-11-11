// routes/users.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");

// Get own profile
router.get("/me", requireAuth, async (req, res) => {
  // req.user provided by requireAuth
  return res.json(req.user);
});

module.exports = router;

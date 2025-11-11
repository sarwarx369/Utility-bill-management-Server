// routes/bills.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// Create bill
router.post("/", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { type, amount, month, year, status = "unpaid", notes } = req.body;
    if (!type || !amount || !month || !year)
      return res.status(400).json({ message: "Missing fields" });

    const bill = {
      userId: new ObjectId(req.user._id),
      type, // 'electricity', 'gas', 'water', 'internet'
      amount: Number(amount),
      month,
      year: Number(year),
      status,
      notes: notes || "",
      createdAt: new Date(),
    };
    const result = await db.collection("bills").insertOne(bill);
    return res.status(201).json({ _id: result.insertedId, ...bill });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Get all bills for logged user (with optional query)
router.get("/", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const query = { userId: new ObjectId(req.user._id) };
    // optional filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.year) query.year = Number(req.query.year);
    if (req.query.type) query.type = req.query.type;

    const bills = await db
      .collection("bills")
      .find(query)
      .sort({ year: -1, month: -1 })
      .toArray();
    return res.json(bills);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Get a single bill
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const bill = await db
      .collection("bills")
      .findOne({
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.user._id),
      });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    return res.json(bill);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Update bill
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const updates = { ...req.body, updatedAt: new Date() };
    // forbid changing owner:
    delete updates.userId;
    const result = await db
      .collection("bills")
      .findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id),
          userId: new ObjectId(req.user._id),
        },
        { $set: updates },
        { returnDocument: "after" }
      );
    if (!result.value)
      return res.status(404).json({ message: "Bill not found or not allowed" });
    return res.json(result.value);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// Delete bill
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("bills")
      .deleteOne({
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.user._id),
      });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Bill not found or not allowed" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

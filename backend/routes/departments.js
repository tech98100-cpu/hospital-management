const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const dept = await Department.create({ name, icon: icon || "🩺" });
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: "Failed to add department" });
  }
});

module.exports = router;

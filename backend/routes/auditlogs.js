const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const AuditLog = require("../models/AuditLog");

// GET /api/audit-logs?action=LOGIN&limit=100 — admin only
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.role) filter.role = req.query.role;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

module.exports = router;

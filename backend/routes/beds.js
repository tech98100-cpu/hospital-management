const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const Bed = require("../models/Bed");

// GET /api/beds — everyone logged in can view (dashboard analytics)
router.get("/", requireAuth, async (req, res) => {
  try {
    const beds = await Bed.find().populate("patient", "name").sort({ ward: 1, bedNumber: 1 });
    res.json(beds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch beds" });
  }
});

// POST /api/beds — admin adds a bed to inventory
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { ward, bedNumber, department } = req.body;
    if (!ward || !bedNumber) return res.status(400).json({ error: "ward and bedNumber are required" });
    const bed = await Bed.create({ ward, bedNumber, department: department || "" });
    res.status(201).json(bed);
  } catch (err) {
    res.status(500).json({ error: "Failed to add bed (ward + bed number must be unique)" });
  }
});

// PUT /api/beds/:id — admin/nurse/receptionist assign, free, or mark maintenance
router.put("/:id", requireAuth, requireRole("admin", "nurse", "receptionist"), async (req, res) => {
  try {
    const { status, patientId } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ error: "Bed not found" });
    if (status) bed.status = status;
    bed.patient = status === "occupied" ? patientId || bed.patient : null;
    await bed.save();
    await logAction(req, { action: "UPDATE_BED", targetType: "Bed", targetId: bed._id, details: `${bed.ward}-${bed.bedNumber} -> ${bed.status}` });
    res.json(bed);
  } catch (err) {
    res.status(500).json({ error: "Failed to update bed" });
  }
});

module.exports = router;

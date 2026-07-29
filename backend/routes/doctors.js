const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/doctors?department=Cardiology
router.get("/", async (req, res) => {
  try {
    const filter = req.query.department ? { department: req.query.department } : {};
    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// POST /api/doctors - add a doctor profile only (admin). Use /api/admin/users to also create a login.
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, specialty, department, experienceYears, rating, reviewCount, initials } = req.body;
    if (!name || !specialty || !department) {
      return res.status(400).json({ error: "name, specialty, and department are required" });
    }
    const doctor = await Doctor.create({
      name, specialty, department,
      experienceYears: experienceYears || 0,
      rating: rating || 4.8,
      reviewCount: reviewCount || 0,
      initials: initials || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    });
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Failed to add doctor" });
  }
});

// PUT /api/doctors/:id
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

// DELETE /api/doctors/:id
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Doctor not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete doctor" });
  }
});

module.exports = router;

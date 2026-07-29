const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const Patient = require("../models/Patient");
const MedicalHistory = require("../models/MedicalHistory");

const STAFF_ROLES = ["admin", "doctor", "nurse", "receptionist"];

async function getOwnPatientId(req) {
  if (req.user.role !== "patient") return null;
  const patient = await Patient.findOne({ user: req.user.id });
  return patient?._id || null;
}

// GET /api/patients — staff-only directory (search by name/email)
router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
      : {};
    const patients = await Patient.find(filter).sort({ name: 1 }).limit(100);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// GET /api/patients/me — the logged-in patient's own profile
router.get("/me", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ error: "Profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/patients/me — patient edits their own demographic info
router.put("/me", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const { phone, dob, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, allergies, chronicConditions } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { user: req.user.id },
      { phone, dob, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, allergies, chronicConditions },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ error: "Profile not found" });
    await logAction(req, { action: "UPDATE_PROFILE", targetType: "Patient", targetId: patient._id });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/patients/:id — staff view of a specific patient's profile
router.get("/:id", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// GET /api/patients/:id/history — medical history for a patient (staff, or the patient themself)
router.get("/:id/history", requireAuth, async (req, res) => {
  try {
    if (req.user.role === "patient") {
      const ownId = await getOwnPatientId(req);
      if (String(ownId) !== req.params.id) return res.status(403).json({ error: "Not authorized" });
    } else if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const history = await MedicalHistory.find({ patient: req.params.id })
      .populate("recordedBy", "name role")
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch medical history" });
  }
});

// POST /api/patients/:id/history — doctor/nurse/admin adds a medical history entry
router.post("/:id/history", requireAuth, requireRole("doctor", "nurse", "admin"), async (req, res) => {
  try {
    const { condition, diagnosedDate, notes, status } = req.body;
    if (!condition) return res.status(400).json({ error: "condition is required" });
    const entry = await MedicalHistory.create({
      patient: req.params.id, recordedBy: req.user.id, condition,
      diagnosedDate: diagnosedDate || "", notes: notes || "", status: status || "active",
    });
    await logAction(req, { action: "ADD_MEDICAL_HISTORY", targetType: "Patient", targetId: req.params.id, details: condition });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add medical history" });
  }
});

module.exports = router;

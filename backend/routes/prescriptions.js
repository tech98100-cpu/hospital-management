const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// GET /api/prescriptions/mine — logged-in patient's own prescriptions
router.get("/mine", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json([]);
    const list = await Prescription.find({ patient: patient._id })
      .populate("doctor", "name specialty department")
      .sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// GET /api/prescriptions/patient/:patientId — staff view of a patient's prescriptions
router.get("/patient/:patientId", requireAuth, requireRole("admin", "doctor", "nurse"), async (req, res) => {
  try {
    const list = await Prescription.find({ patient: req.params.patientId })
      .populate("doctor", "name specialty department")
      .sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// POST /api/prescriptions — doctor writes a new prescription
router.post("/", requireAuth, requireRole("doctor"), async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes, date } = req.body;
    if (!patientId || !medicines?.length || !date) {
      return res.status(400).json({ error: "patientId, at least one medicine, and date are required" });
    }
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(400).json({ error: "No doctor profile linked to this account" });

    const prescription = await Prescription.create({
      patient: patientId, doctor: doctor._id, appointment: appointmentId || null,
      medicines, notes: notes || "", date,
    });
    await logAction(req, { action: "CREATE_PRESCRIPTION", targetType: "Patient", targetId: patientId });
    const populated = await prescription.populate("doctor", "name specialty department");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create prescription" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const LabReport = require("../models/LabReport");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// GET /api/lab-reports/mine
router.get("/mine", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json([]);
    const list = await LabReport.find({ patient: patient._id })
      .populate("doctor", "name specialty")
      .sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lab reports" });
  }
});

// GET /api/lab-reports/patient/:patientId — staff view
router.get("/patient/:patientId", requireAuth, requireRole("admin", "doctor", "nurse"), async (req, res) => {
  try {
    const list = await LabReport.find({ patient: req.params.patientId })
      .populate("doctor", "name specialty")
      .sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lab reports" });
  }
});

// POST /api/lab-reports — doctor/nurse orders a test
router.post("/", requireAuth, requireRole("doctor", "nurse"), async (req, res) => {
  try {
    const { patientId, testName, date } = req.body;
    if (!patientId || !testName || !date) {
      return res.status(400).json({ error: "patientId, testName, and date are required" });
    }
    let doctorId = null;
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      doctorId = doctor?._id || null;
    }
    const report = await LabReport.create({
      patient: patientId, doctor: doctorId, requestedBy: req.user.id, testName, date,
    });
    await logAction(req, { action: "ORDER_LAB_TEST", targetType: "Patient", targetId: patientId, details: testName });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to order lab test" });
  }
});

// PUT /api/lab-reports/:id — mark completed with a result summary
router.put("/:id", requireAuth, requireRole("doctor", "nurse", "admin"), async (req, res) => {
  try {
    const { resultSummary, status } = req.body;
    const report = await LabReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Lab report not found" });
    if (resultSummary !== undefined) report.resultSummary = resultSummary;
    if (status) report.status = status;
    if (status === "completed") report.completedAt = new Date();
    await report.save();
    await logAction(req, { action: "UPDATE_LAB_REPORT", targetType: "LabReport", targetId: report._id });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to update lab report" });
  }
});

module.exports = router;

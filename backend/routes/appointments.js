const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const STAFF_ROLES = ["admin", "doctor", "nurse", "receptionist"];

// GET /api/appointments/mine - the logged-in patient's appointments
router.get("/mine", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json([]);
    const appointments = await Appointment.find({ patient: patient._id })
      .populate("doctor", "name specialty department")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your appointments" });
  }
});

// GET /api/appointments/queue?date=YYYY-MM-DD — staff view (doctor sees own, others see all)
router.get("/queue", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const filter = { date, status: { $ne: "cancelled" } };
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.json([]);
      filter.doctor = doctor._id;
    }
    const appointments = await Appointment.find(filter)
      .populate("patient", "name phone")
      .populate("doctor", "name specialty department")
      .sort({ time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// GET /api/appointments/patient/:patientId — staff view of one patient's appointment history
router.get("/patient/:patientId", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate("doctor", "name specialty department")
      .sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment history" });
  }
});

// POST /api/appointments - book a new appointment (patient only)
router.post("/", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const { doctorId, department, date, time, isEmergency } = req.body;
    if (!doctorId || !department || !date || !time) {
      return res.status(400).json({ error: "doctorId, department, date, and time are all required" });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(400).json({ error: "No patient profile found for this account" });

    const clash = await Appointment.findOne({ doctor: doctorId, date, time, status: "confirmed" });
    if (clash) {
      return res.status(409).json({ error: "That time slot was just booked by someone else — please pick another." });
    }

    const appointment = await Appointment.create({
      patient: patient._id, doctor: doctorId, department, date, time, isEmergency: !!isEmergency,
    });
    const populated = await appointment.populate("doctor", "name specialty department");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// GET /api/appointments/booked-slots?doctorId=&date= - slots already taken, for the UI to grey out
router.get("/booked-slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.json([]);
    const booked = await Appointment.find({ doctor: doctorId, date, status: "confirmed" }).select("time");
    res.json(booked.map(b => b.time));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// PUT /api/appointments/:id/consult — doctor/nurse records vitals, notes, or marks completed
router.put("/:id/consult", requireAuth, requireRole("doctor", "nurse"), async (req, res) => {
  try {
    const { consultationNotes, vitals, status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes;
    if (vitals) appointment.vitals = { ...vitals, recordedBy: req.user.id };
    if (status) appointment.status = status;
    await appointment.save();
    await logAction(req, { action: "UPDATE_CONSULTATION", targetType: "Appointment", targetId: appointment._id });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// DELETE /api/appointments/:id - cancel (patient's own, or staff)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user.id });
      filter.patient = patient?._id;
    } else if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const appointment = await Appointment.findOne(filter);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    appointment.status = "cancelled";
    await appointment.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;

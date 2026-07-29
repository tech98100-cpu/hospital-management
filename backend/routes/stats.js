const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Bill = require("../models/Bill");
const Bed = require("../models/Bed");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/stats — public, high-level counts for the marketing homepage
router.get("/", async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments({ status: "confirmed" }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const appointmentsToday = await Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } });

    res.json({ doctorCount, patientCount, appointmentCount, appointmentsToday });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/stats/dashboard — staff-only, richer analytics for the admin/staff dashboard
router.get("/dashboard", requireAuth, requireRole("admin", "doctor", "nurse", "receptionist"), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalPatients,
      todaysAppointments,
      availableBeds,
      totalBeds,
      pendingBills,
      emergencyCasesToday,
      totalDoctors,
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } }),
      Bed.countDocuments({ status: "available" }),
      Bed.countDocuments(),
      Bill.countDocuments({ status: { $in: ["pending", "partial"] } }),
      Appointment.countDocuments({ date: today, isEmergency: true, status: { $ne: "cancelled" } }),
      Doctor.countDocuments(),
    ]);

    const pendingBillsAgg = await Bill.aggregate([
      { $match: { status: { $in: ["pending", "partial"] } } },
      { $group: { _id: null, outstanding: { $sum: { $subtract: ["$totalAmount", "$paidAmount"] } } } },
    ]);

    res.json({
      totalPatients,
      todaysAppointments,
      availableBeds,
      totalBeds,
      pendingBills,
      pendingBillsAmount: pendingBillsAgg[0]?.outstanding || 0,
      emergencyCasesToday,
      totalDoctors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;

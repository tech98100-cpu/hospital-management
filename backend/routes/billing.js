const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const Bill = require("../models/Bill");
const Patient = require("../models/Patient");

function computeStatus(totalAmount, paidAmount) {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= totalAmount) return "paid";
  return "partial";
}

// GET /api/billing/mine
router.get("/mine", requireAuth, requireRole("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.json([]);
    const bills = await Bill.find({ patient: patient._id }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// GET /api/billing — staff view, optional ?status=pending
router.get("/", requireAuth, requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const bills = await Bill.find(filter).populate("patient", "name email").sort({ createdAt: -1 }).limit(200);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// POST /api/billing — receptionist/admin creates a bill
router.post("/", requireAuth, requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { patientId, appointmentId, items, dueDate } = req.body;
    if (!patientId || !items?.length) {
      return res.status(400).json({ error: "patientId and at least one line item are required" });
    }
    const totalAmount = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const bill = await Bill.create({
      patient: patientId, appointment: appointmentId || null, createdBy: req.user.id,
      items, totalAmount, dueDate: dueDate || "",
    });
    await logAction(req, { action: "CREATE_BILL", targetType: "Patient", targetId: patientId, details: `Rs ${totalAmount}` });
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: "Failed to create bill" });
  }
});

// PUT /api/billing/:id/pay — record a payment (partial or full)
router.put("/:id/pay", requireAuth, requireRole("admin", "receptionist"), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "A positive amount is required" });
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    bill.paidAmount = Math.min(bill.totalAmount, bill.paidAmount + Number(amount));
    bill.status = computeStatus(bill.totalAmount, bill.paidAmount);
    await bill.save();
    await logAction(req, { action: "RECORD_PAYMENT", targetType: "Bill", targetId: bill._id, details: `Rs ${amount}` });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: "Failed to record payment" });
  }
});

module.exports = router;

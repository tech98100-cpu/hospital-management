const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAction } = require("../utils/audit");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");

router.use(requireAuth, requireRole("admin"));

// GET /api/admin/users?role=doctor — list staff/patient accounts
router.get("/users", async (req, res) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users.map((u) => u.toSafeJSON()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users — create a staff account (admin/doctor/nurse/receptionist)
router.post("/users", async (req, res) => {
  try {
    const { name, email, role, phone, specialty, department, experienceYears, shift } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: "name, email, and role are required" });
    }
    if (!["admin", "doctor", "nurse", "receptionist"].includes(role)) {
      return res.status(400).json({ error: "Invalid role for staff creation" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const tempPassword = crypto.randomBytes(6).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash, role, phone: phone || "",
      mustChangePassword: true, createdBy: req.user.id,
    });

    if (role === "doctor") {
      if (!specialty || !department) {
        return res.status(400).json({ error: "specialty and department are required for doctors" });
      }
      await Doctor.create({
        user: user._id, name, email: email.toLowerCase(), specialty, department,
        experienceYears: experienceYears || 0,
        initials: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      });
    } else if (role === "nurse") {
      await Nurse.create({ user: user._id, name, department: department || "", shift: shift || "" });
    }

    await logAction(req, { action: "CREATE_STAFF", targetType: "User", targetId: user._id, details: `Created ${role}: ${email}` });
    res.status(201).json({ user: user.toSafeJSON(), tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create staff account" });
  }
});

// PUT /api/admin/users/:id — update name/phone/role/isActive
router.put("/users/:id", async (req, res) => {
  try {
    const { name, phone, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    await logAction(req, {
      action: isActive === false ? "DEACTIVATE_USER" : "UPDATE_USER",
      targetType: "User", targetId: user._id,
    });
    res.json(user.toSafeJSON());
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// POST /api/admin/users/:id/reset-password — issue a new temp password
router.post("/users/:id/reset-password", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const tempPassword = crypto.randomBytes(6).toString("hex");
    user.passwordHash = await bcrypt.hash(tempPassword, 10);
    user.mustChangePassword = true;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await logAction(req, { action: "RESET_PASSWORD", targetType: "User", targetId: user._id });
    res.json({ tempPassword });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;

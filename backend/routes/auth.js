const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const { requireAuth } = require("../middleware/auth");
const { logAction } = require("../utils/audit");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function signToken(user, patientId) {
  return jwt.sign(
    { userId: user._id, role: user.role, name: user.name, patientId: patientId || undefined },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user, extra = {}) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, ...extra };
}

// Public self-registration — always creates a "patient" account.
// Staff accounts (admin/doctor/nurse/receptionist) are created by an admin via /api/admin/users.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone: phone || "", role: "patient" });
    const patient = await Patient.create({ user: user._id, name, email: email.toLowerCase(), phone: phone || "" });

    const token = signToken(user, patient._id);
    await logAction({ user: { id: user._id, name: user.name, role: user.role } }, {
      action: "REGISTER", targetType: "User", targetId: user._id, details: "Self-registered as patient",
    });
    res.status(201).json({ token, user: publicUser(user, { patientId: patient._id }), patient: publicUser(user, { patientId: patient._id }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Unified login for every role.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (user.isLocked()) {
      return res.status(423).json({ error: "Account temporarily locked due to too many failed attempts. Try again later." });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "This account has been deactivated. Contact an administrator." });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    let patientId;
    if (user.role === "patient") {
      const patient = await Patient.findOne({ user: user._id });
      patientId = patient?._id;
    }

    const token = signToken(user, patientId);
    await logAction({ user: { id: user._id, name: user.name, role: user.role }, ip: req.ip }, {
      action: "LOGIN", targetType: "User", targetId: user._id,
    });
    res.json({ token, user: publicUser(user, { patientId }), patient: publicUser(user, { patientId }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me — current logged-in user, fresh from the DB.
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    let patientId;
    if (user.role === "patient") {
      const patient = await Patient.findOne({ user: user._id });
      patientId = patient?._id;
    }
    res.json(publicUser(user, { patientId }));
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    await logAction(req, { action: "CHANGE_PASSWORD", targetType: "User", targetId: user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;

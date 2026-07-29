const AuditLog = require("../models/AuditLog");

// Fire-and-forget audit trail. Never throws — logging failures shouldn't break requests.
async function logAction(req, { action, targetType = "", targetId = "", details = "" }) {
  try {
    await AuditLog.create({
      user: req.user?.id || null,
      userName: req.user?.name || "",
      role: req.user?.role || "",
      action,
      targetType,
      targetId: targetId ? String(targetId) : "",
      details,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}

module.exports = { logAction };

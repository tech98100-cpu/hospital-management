const jwt = require("jsonwebtoken");

// Verifies the JWT and attaches { id, role, name } to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Please log in to continue" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role, name: payload.name };
    // kept for backward compatibility with routes still reading req.patientId
    if (payload.role === "patient") req.patientId = payload.patientId || null;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please log in again" });
  }
}

// Usage: requireRole("admin", "doctor")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Please log in to continue" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that" });
    }
    next();
  };
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;

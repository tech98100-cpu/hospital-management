const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "" },
    role: { type: String, default: "" },
    action: { type: String, required: true }, // e.g. "LOGIN", "CREATE_PRESCRIPTION"
    targetType: { type: String, default: "" }, // e.g. "Patient", "Bill"
    targetId: { type: String, default: "" },
    details: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

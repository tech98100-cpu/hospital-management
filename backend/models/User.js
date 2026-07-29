const mongoose = require("mongoose");

const ROLES = ["admin", "doctor", "nurse", "receptionist", "patient"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: "patient" },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    isActive: this.isActive,
    mustChangePassword: this.mustChangePassword,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;

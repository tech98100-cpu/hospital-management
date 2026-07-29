const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    condition: { type: String, required: true },
    diagnosedDate: { type: String, default: "" }, // YYYY-MM-DD
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "resolved", "chronic"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);

const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testName: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    resultSummary: { type: String, default: "" },
    date: { type: String, required: true }, // YYYY-MM-DD
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabReport", labReportSchema);

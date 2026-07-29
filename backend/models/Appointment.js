const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // e.g. "10:00 AM"
    status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
    isEmergency: { type: Boolean, default: false },
    consultationNotes: { type: String, default: "" }, // doctor's notes after the visit
    vitals: {
      bloodPressure: { type: String, default: "" },
      temperature: { type: String, default: "" },
      pulse: { type: String, default: "" },
      weight: { type: String, default: "" },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

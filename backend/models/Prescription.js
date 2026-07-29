const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    medicines: { type: [medicineSchema], default: [] },
    notes: { type: String, default: "" },
    date: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);

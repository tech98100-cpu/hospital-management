const mongoose = require("mongoose");

// Patient = the medical profile. Login credentials live on the linked User doc.
const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },

    dob: { type: String, default: "" }, // YYYY-MM-DD
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContactName: { type: String, default: "" },
    emergencyContactPhone: { type: String, default: "" },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);

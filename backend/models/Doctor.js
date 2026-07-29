const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // login account, if any
    name: { type: String, required: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    specialty: { type: String, required: true },
    department: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    initials: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);

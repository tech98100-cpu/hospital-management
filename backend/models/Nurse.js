const mongoose = require("mongoose");

const nurseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, default: "" },
    shift: { type: String, enum: ["morning", "evening", "night", ""], default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nurse", nurseSchema);

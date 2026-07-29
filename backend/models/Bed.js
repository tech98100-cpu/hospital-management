const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    ward: { type: String, required: true },
    bedNumber: { type: String, required: true },
    department: { type: String, default: "" },
    status: { type: String, enum: ["available", "occupied", "maintenance"], default: "available" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
  },
  { timestamps: true }
);

bedSchema.index({ ward: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model("Bed", bedSchema);

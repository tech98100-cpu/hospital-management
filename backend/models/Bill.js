const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [billItemSchema], default: [] },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
    dueDate: { type: String, default: "" }, // YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);

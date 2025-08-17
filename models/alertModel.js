import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coinId: { type: String, required: true }, // e.g., 'bitcoin'
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ["above", "below"], required: true },
  preferredCurrency: { type: String, default: "usd" },
  frequency: { type: Number, default: 1 }, // in minutes
  lastChecked: { type: Date, default: null },
  active: { type: Boolean, default: true },
  triggered: { type: Boolean, default: false },
}, { timestamps: true });


// module.exports = mongoose.model("Alert", alertSchema);
export default mongoose.model("Alert" , alertSchema);

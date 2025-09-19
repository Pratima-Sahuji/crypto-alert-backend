import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coinSymbol: {
      type: String, // BTC, ETH, etc.
      required: true,
      uppercase: true,
      trim: true,
    },
    coinName: {
      type: String, // Bitcoin, Ethereum, etc.
      required: true,
      trim: true,
    },
    transactionType: {
      type: String, // BUY or SELL
      enum: ["BUY", "SELL"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number, // Price per coin
      required: true,
      min: 0,
    },
//     total: {
//       type: Number, // price * quantity
//       required: true,
//       min: 0,
//     },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-calculate total if not provided
// transactionSchema.pre("save", function (next) {
//   if (!this.total) {
//     this.total = this.price * this.quantity;
//   }
//   next();
// });

export default mongoose.model("Transaction", transactionSchema);



import mongoose from "mongoose";

const TokenTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const TokenTransaction = mongoose.model(
  "TokenTransaction",
  TokenTransactionSchema
);

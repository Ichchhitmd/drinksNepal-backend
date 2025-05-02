import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);

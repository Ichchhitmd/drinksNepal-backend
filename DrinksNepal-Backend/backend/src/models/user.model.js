import mongoose from "mongoose";
import { AddressSchema } from "./address.model.js";
const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    balance: { type: Number, default: 0 },
    previousRedeemedBalance: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["customer", "admin", "deliveryGuy"],
      default: "customer",
      required: true,
    },
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    addresses: [{ type: AddressSchema, required: false }],
    pushToken: { type: String, required: false },
    notificationsLastReadAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);

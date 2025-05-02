import mongoose from "mongoose";

export const AddressSchema = new mongoose.Schema(
  {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    addressDetails: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    otp: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true }
);

OtpSchema.methods.saveOTP = async function () {
  const expiration =
    Date.now() + (parseInt(process.env.OTP_EXPIRATION) || 300) * 1000; // default 5 minutes
  this.expirationTime = new Date(expiration);
  await this.save();
};

OtpSchema.methods.verifyOTP = async function (otp) {
  if (this.otp === otp && this.expirationTime > Date.now()) {
    await this.deleteOne();
    return true;
  }
  return false;
};

export const OTP = mongoose.model("OTP", OtpSchema);

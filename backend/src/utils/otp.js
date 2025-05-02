import crypto from "crypto";

/**
 * Generates a 6-digit One-Time Password (OTP)
 * @returns {string} A 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(10000, 99999).toString(); // 5-digit OTP
};

import jwt from "jsonwebtoken";
import logger from "../configs/logger.config.js";

/**
 * Generates an access token
 * @param {Object} payload - The payload to be encoded in the token
 * @returns {string} The generated access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: `${process.env.ACCESS_TOKEN_EXPIRATION || 900}s`, // default 15 minutes
  });
};

/**
 * Generates a refresh token
 * @param {Object} payload - The payload to be encoded in the token
 * @returns {string} The generated refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION}d`,
  });
};

/**
 * Verifies an access token
 * @param {string} token - The access token to verify
 * @returns {Object|null} The decoded token payload if valid, null otherwise
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    logger.error("Access Token verification failed:", error);
    return null;
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - The refresh token to verify
 * @returns {Object|null} The decoded token payload if valid, null otherwise
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.error("Refresh Token verification failed:", error);
    return null;
  }
};

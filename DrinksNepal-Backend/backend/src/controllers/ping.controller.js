import asyncHandler from "../utils/asyncHandler.js";
import logger from "../configs/logger.config.js";

/**
 * Responds with a "pong" message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with "pong" message
 */
const ping = asyncHandler(async (req, res, next) => {
  logger.info("Pinging the server");
  res.status(200).json({ message: "Healthy. 21/10/2024" });
});

export default { ping };

import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import analyticsService from "../services/analytics.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get analytics data including total sales, orders, products and customers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with analytics data
 */
const getAnalytics = asyncHandler(async (req, res, next) => {
  logger.info("Starting getAnalytics");
  const analytics = await analyticsService.getAnalytics();
  res.status(200).json(responseDTO(200, "success", analytics));
});

export default {
  getAnalytics,
};

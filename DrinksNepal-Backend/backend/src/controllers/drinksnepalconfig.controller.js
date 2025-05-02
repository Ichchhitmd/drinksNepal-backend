import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import HttpError from "../error/custom.error.js";
import drinksnepalconfigService from "../services/drinksnepalconfig.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Upload and add a new banner image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated banner images
 */
const uploadBannerImage = asyncHandler(async (req, res, next) => {
  logger.info("Starting uploadBannerImage");

  if (!req.file) {
    throw new HttpError(400, "No image file provided");
  }

  const result = await drinksnepalconfigService.addBannerImage(req.file);
  res
    .status(200)
    .json(responseDTO(200, "Banner image uploaded successfully", result));
});

/**
 * Get all banner images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with all banner images
 */
const getBannerImages = asyncHandler(async (req, res, next) => {
  logger.info("Starting getBannerImages");

  const banners = await drinksnepalconfigService.getBannerImages();
  res
    .status(200)
    .json(responseDTO(200, "Banner images retrieved successfully", banners));
});

/**
 * Delete a banner image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated banner images
 */
const deleteBannerImage = asyncHandler(async (req, res, next) => {
  logger.info("Starting deleteBannerImage");

  const { id } = req.params;
  if (!id) {
    throw new HttpError(400, "Banner ID is required");
  }

  const result = await drinksnepalconfigService.deleteBannerImage(id);
  res
    .status(200)
    .json(responseDTO(200, "Banner image deleted successfully", result));
});

/**
 * Reorder banner images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with reordered banner images
 */
const reorderBannerImages = asyncHandler(async (req, res, next) => {
  logger.info("Starting reorderBannerImages");

  const { bannerIds } = req.body;
  if (!bannerIds || !Array.isArray(bannerIds) || bannerIds.length === 0) {
    throw new HttpError(400, "Valid banner IDs array is required");
  }

  const result = await drinksnepalconfigService.reorderBannerImages(bannerIds);
  res
    .status(200)
    .json(responseDTO(200, "Banner images reordered successfully", result));
});

export default {
  uploadBannerImage,
  getBannerImages,
  deleteBannerImage,
  reorderBannerImages,
};

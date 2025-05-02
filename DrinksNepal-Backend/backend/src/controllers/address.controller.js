import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import addressService from "../services/address.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create a new address for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created address data
 */
const createAddress = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting createAddress. Request body: ${JSON.stringify(req.body)}`
  );
  const { userId, longitude, latitude, addressDetails, isDefault } = req.body;
  const newAddress = await addressService.createAddress(
    userId,
    longitude,
    latitude,
    addressDetails,
    isDefault
  );
  res.status(201).json(responseDTO(201, "success", newAddress));
});

/**
 * Get all addresses for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user's addresses
 */
const getAddresses = asyncHandler(async (req, res, next) => {
  logger.info(`Starting getAddresses. UserId: ${req.params.userId}`);
  const { userId } = req.params;
  const addresses = await addressService.getAddresses(userId);
  res.status(200).json(responseDTO(200, "success", addresses));
});

/**
 * Update an address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated address data
 */
const updateAddress = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting updateAddress. UserId: ${req.params.userId}, AddressId: ${
      req.params.addressId
    }, Request body: ${JSON.stringify(req.body)}`
  );
  const { userId, addressId } = req.params;
  const address = await addressService.updateAddress(
    userId,
    addressId,
    req.body
  );
  res.status(200).json(responseDTO(200, "success", address));
});

/**
 * Delete an address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response indicating success
 */
const deleteAddress = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting deleteAddress. UserId: ${req.params.userId}, AddressId: ${req.params.addressId}`
  );
  const { userId, addressId } = req.params;
  await addressService.deleteAddress(userId, addressId);
  res
    .status(200)
    .json(responseDTO(200, "success", "Address Deleted Successfully"));
});

export default {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};

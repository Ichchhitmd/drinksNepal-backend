import { validationResult } from "express-validator";
import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import HttpError from "../error/custom.error.js";
import authService from "../services/auth.service.js";
import notificationService from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.phone_number - User's phone number
 * @param {string} req.body.fullname - User's full name
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user data
 */
const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`Validation errors: ${JSON.stringify(errors.array())}`);
    throw new HttpError(
      400,
      `Validation errors. Error : ${JSON.stringify(errors.array())}`
    );
  }
  logger.info(
    `Starting user registration process. Phone Number: ${req.body.phoneNumber}`
  );

  const { phoneNumber, fullName, email } = req.body;
  const result = await authService.registerUser(phoneNumber, fullName, email);
  return res.status(201).json(responseDTO(201, "success", result));
});

/**
 * Refresh user's access token
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header containing refresh token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with new tokens
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  logger.info("Starting token refresh process");
  const { authorization } = req.headers;
  if (!authorization) {
    logger.error("Refresh token is missing");
    throw new HttpError(401, "Refresh token is required");
  }
  const refreshToken = authorization.split(" ")[1];
  if (!refreshToken) {
    logger.error("Refresh token is malformed");
    throw new HttpError(401, "Refresh token is malformed");
  }
  const tokens = await authService.refreshTokenService(refreshToken);
  return res.status(200).json(responseDTO(200, "success", tokens));
});

/**
 * Verify OTP and login user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.phone_number - User's phone number
 * @param {string} req.body.otp - One-time password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with login result
 */
const verifyOtpLogin = asyncHandler(async (req, res, next) => {
  const { phoneNumber, otp } = req.body;
  logger.info(
    `Starting OTP verification and login process. Phone number: ${phoneNumber}`
  );

  const result = await authService.verifyOtpLoginService(phoneNumber, otp);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Generate OTP for user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.phone_number - User's phone number
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response indicating success
 */
const generateOtp = asyncHandler(async (req, res, next) => {
  const { phoneNumber } = req.body;
  logger.info(`Starting OTP generation process. Phone number: ${phoneNumber}`);

  if (!phoneNumber) {
    logger.error("Phone number is missing");
    throw new HttpError(400, "Phone number is required");
  }
  const result = await authService.generateOtpService(phoneNumber);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Authenticate user
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header containing access token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user data
 */
const authenticate = asyncHandler(async (req, res, next) => {
  logger.info("Starting user authentication process");
  const { authorization } = req.headers;
  if (!authorization) {
    logger.error("Access token is missing");
    throw new HttpError(401, "Access token is required");
  }

  const userData = await authService.authenticateService(authorization);
  return res.status(200).json(responseDTO(200, "success", userData));
});

/**
 * Create delivery user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Delivery user's name
 * @param {string} req.body.phoneNumber - Delivery user's phone number
 * @param {string} req.body.email - Delivery user's email
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created delivery user data
 */
const createDeliveryUser = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting delivery user creation process. Phone number: ${req.body.phoneNumber}`
  );
  const { fullName, phoneNumber, email } = req.body;

  if (!fullName || !phoneNumber || !email) {
    logger.error("Missing required fields for delivery user creation");
    throw new HttpError(400, "Name, phone number, and email are required");
  }

  const deliveryUser = await authService.createDeliveryUserService(
    fullName,
    phoneNumber,
    email
  );
  return res.status(201).json(responseDTO(201, "success", deliveryUser));
});

const updatePushToken = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting update push token process. User ID: ${req.params.userId}`
  );
  const { pushToken } = req.body;
  const { userId } = req.params;
  const result = await notificationService.updatePushToken(userId, pushToken);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Get notifications for a user
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number
 * @param {number} req.query.pageSize - Page size
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with notifications data
 */
const getNotifications = asyncHandler(async (req, res, next) => {
  logger.info(`Fetching notifications for user ID: ${req.body.userId}`);
  const { page, pageSize, userId } = req.body;

  const options = {
    page: parseInt(page) || 1,
    pageSize: parseInt(pageSize) || 10,
  };

  const notifications = await notificationService.getNotifications(
    userId,
    options
  );
  return res.status(200).json(responseDTO(200, "success", notifications));
});

/**
 * Mark notifications as read for a user
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated user data
 */
const markNotificationsAsRead = asyncHandler(async (req, res, next) => {
  logger.info(`Marking notifications as read for user ID: ${req.body.userId}`);
  const { userId } = req.body;

  const result = await notificationService.markNotificationsAsRead(userId);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Login admin user with email and password
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Admin's email address
 * @param {string} req.body.password - Admin's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with admin user data and tokens
 */
const loginAdmin = asyncHandler(async (req, res, next) => {
  logger.info(`Admin login attempt for email: ${req.body.email}`);
  const { email, password } = req.body;

  const result = await authService.loginAdmin(email, password);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Search users
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.query - Search query for name/email
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with users data
 */
const searchUsers = asyncHandler(async (req, res, next) => {
  const { query, filters, sort, page, pageSize } = req.body;
  const result = await authService.searchUsers({
    query,
    filters,
    sort,
    page,
    pageSize,
  });
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Update delivery user
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - Delivery user ID to update
 * @param {Object} req.body - Request body containing update data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated user data
 */
const updateDeliveryUser = asyncHandler(async (req, res, next) => {
  logger.info(`Updating delivery user with ID: ${req.params.userId}`);
  const { userId } = req.params;
  const updateData = req.body;

  const result = await authService.updateDeliveryUserService(
    userId,
    updateData
  );
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Delete delivery user
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - Delivery user ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with deleted user data
 */
const deleteDeliveryUser = asyncHandler(async (req, res, next) => {
  logger.info(`Deleting delivery user with ID: ${req.params.userId}`);
  const { userId } = req.params;

  const result = await authService.deleteDeliveryUserService(userId);
  return res.status(200).json(responseDTO(200, "success", result));
});

/**
 * Redeem user's balance by moving current balance to previousRedeemedBalance and setting balance to 0
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID whose balance to redeem
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated user data
 */
const redeemBalance = asyncHandler(async (req, res, next) => {
  logger.info(`Redeeming balance for user with ID: ${req.params.userId}`);
  const { userId } = req.params;

  const result = await authService.redeemBalance(userId);
  return res.status(200).json(responseDTO(200, "success", result));
});

export default {
  register,
  refreshToken,
  verifyOtpLogin,
  generateOtp,
  authenticate,
  createDeliveryUser,
  updatePushToken,
  getNotifications,
  markNotificationsAsRead,
  loginAdmin,
  searchUsers,
  updateDeliveryUser,
  deleteDeliveryUser,
  redeemBalance,
};

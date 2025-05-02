import bcrypt from "bcryptjs";
import logger from "../configs/logger.config.js";
import HttpError from "../error/custom.error.js";
import { Notification, OTP, User } from "../models/models.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { generateOTP } from "../utils/otp.js";
import otpService from "./otp.service.js";
/**
 * Register a new user
 * @param {string} phoneNumber - The user's phone number
 * @param {string} fullName - The user's full name
 * @returns {Object} An object containing access token, refresh token, and user information
 * @throws {HttpError} If the user already exists
 */
const registerUser = async (phoneNumber, fullName, email) => {
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new HttpError(400, "User already exists");
  }

  const accessToken = generateAccessToken({ userId: null }); // Placeholder, will update after user creation
  const refreshToken = generateRefreshToken({ userId: null }); // Placeholder

  const newUser = new User({
    fullName,
    phoneNumber,
    email,
    accessToken: accessToken,
    refreshToken: refreshToken,
    refreshTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  await newUser.save();

  // Generate tokens with the actual user ID
  const updatedAccessToken = generateAccessToken({ userId: newUser._id });
  const updatedRefreshToken = generateRefreshToken({ userId: newUser._id });

  // Update user with new tokens
  newUser.accessToken = updatedAccessToken;
  newUser.refreshToken = updatedRefreshToken;
  newUser.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await newUser.save();

  return {
    accessToken: updatedAccessToken,
    refreshToken: updatedRefreshToken,
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

/**
 * Refresh the user's access token
 * @param {string} refreshToken - The user's refresh token
 * @returns {Object} An object containing new access token and refresh token
 * @throws {Error} If the refresh token is invalid or the user is not found
 */
const refreshTokenService = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findOne({
    _id: decoded.userId,
    refreshToken: refreshToken,
  });
  if (!user) {
    throw new Error("User not found or refresh token mismatch");
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken({ userId: user._id });
  const newRefreshToken = generateRefreshToken({ userId: user._id });

  user.accessToken = newAccessToken;
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Verify OTP and login user
 * @param {string} phoneNumber - The user's phone number
 * @param {string} otp - The one-time password to verify
 * @returns {Object} An object containing access token, refresh token, and user information (or null if new user)
 * @throws {HttpError} If phone number or OTP is missing, or if OTP is invalid
 */
const verifyOtpLoginService = async (phoneNumber, otp) => {
  if (!phoneNumber || !otp) {
    throw new HttpError(400, "Phone number and OTP are required");
  }

  const otpRecord = await OTP.findOne({ phoneNumber, otp });
  if (!otpRecord) {
    throw new HttpError(400, "OTP not found");
  }

  const isValidOtp = await otpRecord.verifyOTP(otp);
  if (!isValidOtp) {
    throw new HttpError(400, "Invalid OTP");
  }

  const user = await User.findOne({ phoneNumber });

  if (user) {
    // User exists, generate new tokens
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    logger.info(`User logged in: ${JSON.stringify(user)}`);

    // Get unread notifications count
    const lastReadAt = user?.notificationsLastReadAt || new Date(0);
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      createdAt: { $gt: lastReadAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        pushToken: user?.pushToken,
        notification: {
          unreadCount,
          notifications: [],
        },
      },
    };
  } else {
    // User does not exist, return tokens with user as null
    const accessToken = generateAccessToken({ userId: null }); // Placeholder
    const refreshToken = generateRefreshToken({ userId: null }); // Placeholder

    return {
      accessToken,
      refreshToken,
      user: null,
    };
  }
};

/**
 * Generate and send OTP to the user
 * @param {string} phoneNumber - The user's phone number
 * @returns {boolean} True if OTP was successfully generated and sent
 */
const generateOtpService = async (phoneNumber) => {
  // Delete any existing OTPs for this phone number
  await OTP.deleteMany({ phoneNumber });

  const otp = generateOTP();

  // Check if user exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    const otpRecord = new OTP({ phoneNumber, otp, user: existingUser._id });
    await otpRecord.saveOTP();
  } else {
    const otpRecord = new OTP({ phoneNumber, otp });
    await otpRecord.saveOTP();
  }

  // Send OTP via SMS
  await otpService.sendSMS(phoneNumber, `Your OTP for Drinks Nepal is: ${otp}`);
  return true;
};

/**
 * Authenticate user using access token
 * @param {string} authorization - The authorization header containing the access token
 * @returns {Object} An object containing user information
 * @throws {HttpError} If the access token is missing, invalid, or doesn't match the user
 */
const authenticateService = async (authorization) => {
  const accessToken = authorization.split(" ")[1];
  if (!accessToken) {
    throw new HttpError(401, "Access token is malformed");
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    throw new HttpError(401, "Invalid access token");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new HttpError(401, "User not found");
  }

  // Get unread notifications count
  const lastReadAt = user?.notificationsLastReadAt || new Date(0);
  const unreadCount = await Notification.countDocuments({
    userId: user._id,
    createdAt: { $gt: lastReadAt },
  });

  return {
    _id: user._id,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    addresses: user.addresses,
    pushToken: user?.pushToken,
    notification: {
      unreadCount,
      notifications: [],
    },
  };
};

/**
 * Create a new delivery user
 * @param {string} name - The delivery user's full name
 * @param {string} phoneNumber - The delivery user's phone number
 * @param {string} email - The delivery user's email address
 * @returns {Object} An object containing the created delivery user's information
 * @throws {HttpError} If a user with the given phone number already exists
 */
const createDeliveryUserService = async (fullName, phoneNumber, email) => {
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new HttpError(400, "User already exists");
  }

  const newUser = new User({
    fullName,
    phoneNumber,
    email,
    role: "deliveryGuy",
  });

  await newUser.save();

  return {
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  };
};

/**
 * Update a delivery user's information
 * @param {string} userId - The delivery user's ID
 * @param {Object} updateData - Object containing fields to update (fullName, phoneNumber, email)
 * @returns {Object} An object containing the updated delivery user's information
 * @throws {HttpError} If user is not found or if phone number is already taken
 */
const updateDeliveryUserService = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.role !== "deliveryGuy") {
    throw new HttpError(400, "User is not a delivery partner");
  }

  // Check if phone number is being updated and is unique
  if (updateData.phoneNumber && updateData.phoneNumber !== user.phoneNumber) {
    const existingUser = await User.findOne({
      phoneNumber: updateData.phoneNumber,
    });
    if (existingUser) {
      throw new HttpError(400, "Phone number already in use");
    }
  }

  // Update allowed fields
  user.fullName = updateData.fullName || user.fullName;
  user.phoneNumber = updateData.phoneNumber || user.phoneNumber;
  user.email = updateData.email || user.email;

  await user.save();

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Delete a delivery user
 * @param {string} userId - The delivery user's ID
 * @returns {Object} An object containing the deleted user's information
 * @throws {HttpError} If user is not found or if user is not a delivery partner
 */
const deleteDeliveryUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.role !== "deliveryGuy") {
    throw new HttpError(400, "User is not a delivery partner");
  }

  await User.findByIdAndDelete(userId);

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Create a new admin user
 * @param {string} fullName - The admin's full name
 * @param {string} email - The admin's email address
 * @param {string} password - The admin's password
 * @returns {Object} An object containing the created admin user's information
 * @throws {HttpError} If a user with the given email already exists
 */
const createAdminUser = async () => {
  const fullName = process.env.ADMIN_FULL_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  logger.info(`Creating admin user with email: ${email}`);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.info(`User with email ${email} already exists`);
    return {
      message: "User with email already exists",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
    role: "admin",
    phoneNumber: "admin", // Required field but not used for admin
  });

  await newUser.save();
  logger.info("Admin user created successfully");
  return {
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      phoneNumber: newUser.phoneNumber,
    },
  };
};

/**
 * Login admin user with email and password
 * @param {string} email - Admin's email address
 * @param {string} password - Admin's password
 * @returns {Object} Object containing user info and tokens
 * @throws {HttpError} If invalid credentials or user not found
 */
const loginAdmin = async (email, password) => {
  const user = await User.findOne({ email, role: "admin" });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new HttpError(401, "Invalid credentials");
  }

  logger.info(`Admin user logged in: ${JSON.stringify(user)}`);
  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); //30 days
  await user.save();

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Search and filter users based on criteria
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query for name/email
 * @param {string} params.type - User type/role filter
 * @param {Object} params.sort - Sort parameters
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @returns {Promise<Object>} Filtered users and pagination info
 */
const searchUsers = async ({
  query = "",
  filters = {},
  sort = {},
  page = 1,
  pageSize = 10,
}) => {
  const matchStage = {};

  // Add role/type filter if specified
  if (filters.role) {
    matchStage.role = filters.role;
  }
  logger.info(`Search query: ${query}`);
  // Add search query for name/email if provided
  if (query) {
    matchStage.$or = [
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  // Build aggregation pipeline
  const pipeline = [];

  // Add match stage if we have any filters
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Add sorting
  const sortStage = {};
  if (Object.keys(sort).length > 0) {
    Object.keys(sort).forEach((key) => {
      sortStage[key] = sort[key] === "desc" ? -1 : 1;
    });
  } else {
    // Default sort by createdAt desc
    sortStage.createdAt = -1;
  }
  pipeline.push({ $sort: sortStage });

  // Add pagination
  pipeline.push({ $skip: (page - 1) * pageSize }, { $limit: pageSize });

  // Execute pipeline
  const users = await User.aggregate(pipeline);

  // Get total count for pagination
  const totalUsers = await User.countDocuments(matchStage);

  return {
    users: users.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      balance: user.balance,
      phoneNumber: user.phoneNumber,
    })),
    page,
    pageSize,
    totalPages: Math.ceil(totalUsers / pageSize),
    count: totalUsers,
  };
};

/**
 * Redeem user's balance by moving current balance to previousRedeemedBalance and setting balance to 0
 * @param {string} userId - The ID of the user whose balance is being redeemed
 * @returns {Object} Updated user object
 * @throws {HttpError} If user is not found
 */
const redeemBalance = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  user.previousRedeemedBalance = user.balance;
  user.balance = 0;
  await user.save();

  return user;
};

export default {
  registerUser,
  refreshTokenService,
  verifyOtpLoginService,
  generateOtpService,
  authenticateService,
  createDeliveryUserService,
  loginAdmin,
  createAdminUser,
  searchUsers,
  updateDeliveryUserService,
  deleteDeliveryUserService,
  redeemBalance,
};

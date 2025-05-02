import axios from "axios";
import logger from "../configs/logger.config.js";
import { Notification, User } from "../models/models.js";
/**
 * Sends a push notification to a device using Expo's push notification service
 * @param {string} expoPushToken - The Expo push token of the target device
 * @param {Object} notification - The notification object containing the message details
 * @param {string} notification.title - The title of the notification
 * @param {string} notification.body - The body text of the notification
 * @param {string} notification.orderId - The ID of the order associated with the notification
 * @param {string} notification._id - The ID of the notification
 * @param {string} notification.createdAt - The creation date of the notification
 * @returns {Promise<Object>} The response data from the Expo push notification service
 * @throws {Error} If the push notification fails to send
 */
const sendNotification = async (expoPushToken, notification) => {
  if (!expoPushToken) {
    logger.error("Expo push token is required");
    throw new Error("Expo push token is required");
  }
  const expoUrl = process.env.EXPO_PUSH_NOTIFICATION_URL;
  const message = {
    to: expoPushToken,
    sound: "default",
    title: notification.title,
    body: notification.body,
    priority: "high",
    channelId: "default",
    badge: 1,
    data: {
      orderId: notification.orderId,
      _id: notification._id?.toString(),
      createdAt: notification.createdAt,
    },
    ttl: 3600, // Time to live in seconds
  };

  logger.info(
    `Sending notification: ${JSON.stringify(message)}`,
    expoPushToken
  );

  const response = await axios.post(expoUrl, message, {
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
  });

  logger.info(`Notification response: ${JSON.stringify(response.data)}`);

  // Check push receipt
  if (response.data.data && response.data.data.status === "error") {
    throw new Error(`Push receipt error: ${response.data.data.message}`);
  }

  return response.data;
};

/**
 * Updates the push notification token for a user
 * @param {string} userId - The ID of the user
 * @param {string} pushToken - The new push notification token
 * @returns {Promise<Object>} The updated user object
 * @throws {Error} If user is not found or update fails
 */
const updatePushToken = async (userId, pushToken) => {
  logger.info(`Updating push token for user ID: ${userId}`);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { pushToken: pushToken },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

/**
 * Adds a new notification for a user
 * @param {string} userId - The ID of the user
 * @param {Object} notification - The notification details
 * @param {string} notification.orderId - The associated order ID
 * @param {string} notification.title - The notification title
 * @param {string} notification.message - The notification message
 * @returns {Promise<Object>} The created notification
 */
const addNotification = async (userId, notification) => {
  logger.info(`Adding notification for user ID: ${userId}`);
  const newNotification = new Notification({
    userId,
    orderId: notification.orderId,
    title: notification.title,
    message: notification.message,
  });

  const savedNotification = await newNotification.save();
  return savedNotification;
};

/**
 * Fetches notifications for a user with read status and pagination
 * @param {string} userId - The ID of the user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Maximum number of notifications per page (default: 10)
 * @returns {Promise<Object>} Object containing notifications, pagination metadata and unread count
 */
const getNotifications = async (
  userId,
  options = { page: 1, pageSize: 10 }
) => {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, options.pageSize || 10);
  const skip = (page - 1) * pageSize;

  const [notifications, user, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    User.findById(userId).select("notificationsLastReadAt"),
    Notification.countDocuments({ userId }),
  ]);

  const lastReadAt = user?.notificationsLastReadAt || new Date(0);

  return {
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    count: total,
    notifications,
    unreadCount: await Notification.countDocuments({
      userId,
      createdAt: { $gt: lastReadAt },
    }),
  };
};

/**
 * Updates the last read timestamp for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The updated user object
 */
const markNotificationsAsRead = async (userId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { notificationsLastReadAt: new Date() },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

export default {
  sendNotification,
  updatePushToken,
  addNotification,
  getNotifications,
  markNotificationsAsRead,
};

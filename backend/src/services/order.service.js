import logger from "../configs/logger.config.js";
import { io } from "../configs/socket.config.js";
import HttpError from "../error/custom.error.js";
import {
  DrinksNepalConfig,
  ExchangeRate,
  Order,
  Product,
  TokenTransaction,
  User,
} from "../models/models.js";
import fonepayService from "./fonepay.service.js";
import googlemapsService from "./googlemaps.service.js";
import notificationService from "./notification.service.js";
/**
 * Create a new order in the database
 * @param {Object} orderData - Data required to create an order
 * @param {string} orderData.userId - ID of the user placing the order
 * @param {Array} orderData.items - Array of items in the order
 * @param {string} orderData.deliveryAddressId - ID of delivery address
 * @param {string} orderData.paymentType - Type of payment (cash/online)
 * @param {string} [orderData.orderId] - Optional order ID for online payments
 * @returns {Promise<Order>} Created order object
 * @throws {HttpError} If user validation fails or exchange rate not found
 */
const createOrder = async (orderData) => {
  const { userId, items, deliveryAddressId, paymentType, orderId } = orderData;

  await validateUser(userId);
  const activeExchangeRate = await getActiveExchangeRate();
  const { orderItems, totalAmount } = await processOrderItems(items, true);

  const newOrder = new Order({
    orderId: orderId || generateOrderId(userId),
    user: userId,
    items: orderItems,
    deliveryAddress: deliveryAddressId,
    paymentType: paymentType,
    totalAmount: totalAmount,
    exchangeRate: activeExchangeRate._id,
    tokenAmount: totalAmount * activeExchangeRate.rate,
    paymentStatus: paymentType === "cash" ? "pending" : "paid",
  });

  logger.info(
    `Order created successfully: ${newOrder.paymentStatus}, ${
      newOrder.paymentStatus === "paid"
    } `
  );

  const savedOrder = await newOrder.save();

  if (newOrder.paymentStatus === "paid") {
    await handleTokenTransaction(savedOrder);
    await updateOrderAnalytics(savedOrder.totalAmount, true);
  } else if (paymentType === "cash") {
    await updateOrderAnalytics(0, true);
  }

  try {
    logger.info(`Emitting order_updated event: ${savedOrder._id}`);
    // Emit socket event for new order
    io.emit("order_updated", {
      order: savedOrder,
      status: "pending",
    });
  } catch (error) {
    logger.error(`Failed to emit order_updated event: ${error.message}`);
  }

  return savedOrder;
};

/**
 * Update order analytics in DrinksNepalConfig
 * @param {number} orderAmount - Total amount of the order
 */
const updateOrderAnalytics = async (
  orderAmount,
  increaseOrderCount = false,
  isCancelled = false
) => {
  const analyticsConfig = await DrinksNepalConfig.findOne({
    key: "analytics",
  });
  logger.info(
    `Analytics config: ${orderAmount}, ${increaseOrderCount}, ${isCancelled}`
  );

  if (analyticsConfig) {
    const updateData = {};
    if (increaseOrderCount) {
      logger.info(`Increase order count: ${analyticsConfig.value.totalOrders}`);
      logger.info(
        `Increase sales count: ${analyticsConfig.value.totalSalesRevenue}`
      );
      updateData["value.totalOrders"] =
        (analyticsConfig.value.totalOrders || 0) + 1;
    }
    updateData["value.totalSalesRevenue"] =
      (analyticsConfig.value.totalSalesRevenue || 0) +
      (isCancelled ? -orderAmount : orderAmount);

    logger.info(`Increase order count 2: ${updateData["value.totalOrders"]}`);
    logger.info(
      `Increase sales count2: ${updateData["value.totalSalesRevenue"]}`
    );

    await DrinksNepalConfig.updateOne(
      { key: "analytics" },
      { $set: updateData }
    );
  } else {
    if (increaseOrderCount) {
      await DrinksNepalConfig.create({
        key: "analytics",
        value: {
          totalOrders: 1,
          totalSalesRevenue: isCancelled ? -orderAmount : orderAmount,
        },
      });
    } else {
      await DrinksNepalConfig.create({
        key: "analytics",
        value: {
          totalSalesRevenue: isCancelled ? -orderAmount : orderAmount,
        },
      });
    }
  }
};

/**
 * Process an order based on payment type
 * @param {Object} params - Order processing parameters
 * @param {string} params.userId - ID of the user placing the order
 * @param {Array} params.items - Array of items in the order
 * @param {string} params.deliveryAddressId - ID of delivery address
 * @param {string} params.paymentType - Type of payment (cash/online)
 * @returns {Promise<Order|Object>} Created order for cash payments, or payment details for online payments
 * @throws {HttpError} If order creation or payment processing fails
 */
const processOrder = async ({
  userId,
  items,
  deliveryAddressId,
  paymentType,
}) => {
  if (paymentType === "cash") {
    return await createOrder({ userId, items, deliveryAddressId, paymentType });
  } else {
    const tempOrder = await generateTempOrderDetails(
      userId,
      items,
      deliveryAddressId,
      paymentType
    );
    return fonepayService.generatePaymentDetails(tempOrder);
  }
};

/**
 * Verify payment and create order if verification is successful
 * @param {Object} paymentData - Payment verification data from payment gateway
 * @param {string} paymentData.UID - Unique transaction ID
 * @param {string} paymentData.PRN - Payment reference number
 * @param {string} [paymentData.BID] - Bank ID (optional)
 * @param {Object} orderData - Order details
 * @param {string} orderData.orderId - Order ID
 * @param {string} orderData.userId - User ID
 * @param {Array} orderData.items - Order items
 * @param {string} orderData.deliveryAddressId - Delivery address ID
 * @param {string} orderData.paymentType - Payment type
 * @returns {Promise<Order>} Created order if payment verification succeeds
 * @throws {HttpError} If payment verification fails or order creation fails
 */
const verifyPaymentAndCreateOrder = async (paymentData, orderData) => {
  try {
    const { UID, PRN: prn, BID: bid } = paymentData;
    const { orderId, userId, items, deliveryAddressId, paymentType } =
      orderData;

    if (!UID || !prn) {
      logger.error("Missing required payment verification details");
      throw new HttpError(400, "Missing required payment verification details");
    }

    // Validate items before processing payment
    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.error("Invalid or empty items array");
      throw new HttpError(400, "Invalid order items");
    }

    for (const item of items) {
      if (!item.volume || !Array.isArray(item.volume)) {
        logger.error("Invalid item volume details");
        throw new HttpError(400, "Invalid item volume details");
      }
    }

    const { totalAmount } = await processOrderItems(items);

    const verificationResult = await fonepayService.verifyPayment(
      UID,
      prn,
      bid || "",
      totalAmount
    );
    if (verificationResult.success === "true") {
      const newOrder = await createOrder({
        userId,
        items,
        deliveryAddressId,
        paymentType,
        orderId,
      });

      logger.info(
        `Order created successfully after payment verification: ${newOrder._id}`
      );
      return newOrder;
    } else {
      logger.error(
        `Payment verification failed: ${verificationResult.message}`
      );
      throw new HttpError(400, "Payment verification failed");
    }
  } catch (error) {
    logger.error(`Payment verification error: ${error.message}`);
    throw new HttpError(error.statusCode || 500, error.message);
  }
};

/**
 * Change the status of an existing order
 * @param {string} orderId - ID of the order to update
 * @param {string} newStatus - New status to set
 * @param {string} [deliveryGuyId] - ID of delivery person (required for pickup status)
 * @returns {Promise<Order>} Updated order
 * @throws {HttpError} If order not found
 */
const changeOrderStatus = async (
  orderId,
  newStatus,
  deliveryGuyId,
  longitude,
  latitude
) => {
  const order = await Order.findById(orderId).populate("user");
  if (!order) {
    logger.error(`Order not found: ${orderId}`);
    throw new HttpError(404, "Order not found");
  }

  order.status = newStatus;

  // Handle delivery guy assignment
  if (newStatus === "processing" && !order.assignedTo && deliveryGuyId) {
    order.assignedTo = deliveryGuyId;
    await notifyDeliveryGuy(deliveryGuyId, order);
  }

  // Handle out for delivery status
  if (newStatus === "outfordelivery") {
    if (longitude && latitude) {
      await updateDeliveryDetails(order, longitude, latitude);
    }
    try {
      logger.info(`Emitting order_updated event: ${order._id}`);
      io.emit("order_updated", { order, status: "outfordelivery" });
    } catch (error) {
      logger.error(`Failed to emit order_updated event: ${error.message}`);
    }
  }
  // Handle delivered status
  if (newStatus === "delivered") {
    if (order.paymentType === "cash") {
      order.paymentStatus = "paid";
      await updateOrderAnalytics(order.totalAmount, false);
      await handleTokenTransaction(order);
    }
    try {
      logger.info(`Emitting order_updated event: ${order._id}`);
      io.emit("order_updated", { order, status: "delivered" });
    } catch (error) {
      logger.error(`Failed to emit order_updated event: ${error.message}`);
    }
  }

  // Handle cancelled status
  if (newStatus === "cancelled" && order.paymentStatus === "paid") {
    await updateOrderAnalytics(order.totalAmount, false, true);
  }

  await order.save();

  // Send notifications asynchronously
  sendOrderStatusNotification(order, newStatus).catch((error) =>
    logger.error(`Failed to send notification: ${error.message}`)
  );

  return order;
};

// Helper function to notify delivery guy
const notifyDeliveryGuy = async (deliveryGuyId, order) => {
  const deliveryUser = await User.findById(deliveryGuyId);
  if (!deliveryUser?.pushToken) return;

  const title = "New Order Assigned";
  const body = `You have been assigned order #${order.orderId}`;

  const notification = await notificationService.addNotification(
    order.user._id,
    {
      orderId: order._id,
      title,
      message: body,
    }
  );

  await notificationService.sendNotification(deliveryUser.pushToken, {
    title,
    body,
    orderId: order._id,
    _id: notification?._id,
    createdAt: notification?.createdAt,
  });
};

// Helper function to update delivery details
const updateDeliveryDetails = async (order, longitude, latitude) => {
  const { distance, duration } = await googlemapsService.fetchDistanceAndTime(
    { longitude, latitude },
    {
      longitude: order.deliveryAddress.longitude,
      latitude: order.deliveryAddress.latitude,
    }
  );
  order.deliveryDistanceInMeters = distance;
  order.deliveryDurationInMinutes = duration;
};

const sendOrderStatusNotification = async (order, newStatus) => {
  let title, body;

  if (newStatus === "processing") {
    title = "Order Processing";
    body = `Your order #${order.orderId} has been confirmed and is being processed`;
  } else if (newStatus === "outfordelivery") {
    title = "Out for Delivery";
    body = `Your order #${order.orderId} is out for delivery`;
  } else if (newStatus === "delivered") {
    title = "Order Delivered";
    body = `Your order #${order.orderId} has been delivered successfully`;
  } else if (newStatus === "cancelled") {
    title = "Order Cancelled";
    body = `Your order #${order.orderId} has been cancelled`;
  }

  if (title && body) {
    // Add notification to database
    const notification = await notificationService.addNotification(
      order.user._id,
      {
        orderId: order._id,
        title,
        message: body,
      }
    );

    // Send push notification
    await notificationService.sendNotification(order?.user?.pushToken, {
      title,
      body,
      orderId: order.orderId,
      createdAt: notification?.createdAt,
      _id: notification?._id,
    });
  }
};

/**
 * Filter and paginate orders based on provided criteria
 * @param {Object} req - Express request object containing filter parameters
 * @param {Object} req.body - Request body
 * @param {Object} req.body.filters - Filter criteria
 * @param {number} [req.body.page=1] - Page number
 * @param {number} [req.body.pageSize=10] - Items per page
 * @param {Object} [req.body.sort] - Sort criteria
 * @returns {Promise<Object>} Paginated orders with metadata
 * @throws {HttpError} If no valid filters provided
 */
const filterOrders = async (req) => {
  const {
    filters,
    query = "",
    page = 1,
    pageSize = 10,
    sort = { createdAt: -1 },
  } = req.body;

  const filterQuery = buildOrderFilterQuery(filters);
  const totalOrders = await Order.countDocuments(filterQuery);
  const skip = (page - 1) * pageSize;

  if (query) {
    filterQuery.$or = [{ orderId: { $regex: query, $options: "i" } }];
  }

  const orders = await Order.find(filterQuery)
    .populate("items.product")
    .populate("assignedTo", "fullName phoneNumber email")
    .populate("exchangeRate")
    .populate("user", "fullName phoneNumber email")
    .sort(sort)
    .skip(skip)
    .limit(pageSize);

  const ordersWithAddress = await Promise.all(
    orders.map(async (order) => {
      const address = await User.findOne(
        { _id: order.user, "addresses._id": order.deliveryAddress },
        { "addresses.$": 1 }
      );
      return {
        ...order.toObject(),
        deliveryAddress: address ? address.addresses[0] : null,
      };
    })
  );

  return {
    page,
    pageSize,
    totalPages: Math.ceil(totalOrders / pageSize),
    count: totalOrders,
    orders: ordersWithAddress,
  };
};

/**
 * Create a new exchange rate and deactivate all existing rates
 * @param {number} rate - New exchange rate value
 * @returns {Promise<ExchangeRate>} Created exchange rate object
 */
const createExchangeRate = async (rate) => {
  await ExchangeRate.updateMany({}, { $set: { isActive: false } });

  const newExchangeRate = new ExchangeRate({
    rate: rate,
    isActive: true,
    createdAt: new Date(),
  });

  await newExchangeRate.save();
  return newExchangeRate;
};

/**
 * Get the current active exchange rate
 * @returns {Promise<ExchangeRate|null>} Current active exchange rate or null if none found
 */
const getCurrentExchangeRate = async () => {
  const currentRate = await ExchangeRate.findOne({ isActive: true }).sort({
    createdAt: -1,
  });

  if (!currentRate) {
    logger.warn("No active exchange rate found");
    return null;
  }

  return currentRate;
};

/**
 * Validate user exists
 * @param {string} userId - User ID to validate
 * @throws {HttpError} If user not found
 */
const validateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error(`User not found: ${userId}`);
    throw new HttpError(404, "User not found");
  }
  return user;
};

/**
 * Get active exchange rate
 * @throws {HttpError} If no active rate found
 */
const getActiveExchangeRate = async () => {
  const activeExchangeRate = await ExchangeRate.findOne({ isActive: true });
  if (!activeExchangeRate) {
    logger.error("Active exchange rate not found");
    throw new HttpError(404, "Active exchange rate not found");
  }
  return activeExchangeRate;
};

/**
 * Generate order ID
 */
const generateOrderId = (userId) => {
  return `ORD-${Date.now().toString().slice(-8)}-${userId.slice(-4)}`;
};

/**
 * Process order items and calculate totals
 * @param {Array} items - Order items with volume variations
 * @param {boolean} updateStock - Whether to update product stock
 */
const processOrderItems = async (items, updateStock = false) => {
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      logger.error(`Product not found: ${item.productId}`);
      throw new HttpError(404, `Product not found: ${item.productId}`);
    }

    for (const volumeItem of item.volume) {
      const volumeVariation = product.details.volume.find(
        (v) => v.volume === volumeItem.volume
      );

      if (!volumeVariation) {
        logger.error(
          `Volume variation ${volumeItem.volume} not found for product: ${product.name}`
        );
        throw new HttpError(
          404,
          `Volume variation ${volumeItem.volume} not found for product: ${product.name}`
        );
      }

      if (volumeVariation.stock < volumeItem.quantity) {
        logger.error(
          `Insufficient stock for ${product.name} (${volumeItem.volume})`
        );
        throw new HttpError(
          400,
          `Insufficient stock for ${product.name} (${volumeItem.volume})`
        );
      }

      const itemPrice = volumeVariation.regularPrice * volumeItem.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        product: product._id,
        volume: volumeItem.volume,
        quantity: volumeItem.quantity,
        price: itemPrice,
      });

      if (updateStock) {
        volumeVariation.stock -= volumeItem.quantity;
        await product.save();
      }
    }
  }

  return { orderItems, totalAmount };
};

/**
 * Generate temporary order details without saving
 * @param {string} userId - ID of the user placing the order
 * @param {Array} items - Array of items with volume variations
 * @param {string} deliveryAddressId - ID of delivery address
 * @param {string} paymentType - Type of payment
 * @returns {Promise<Object>} Temporary order details
 */
const generateTempOrderDetails = async (
  userId,
  items,
  deliveryAddressId,
  paymentType
) => {
  const activeExchangeRate = await getActiveExchangeRate();
  const { orderItems, totalAmount } = await processOrderItems(items);

  return {
    orderId: generateOrderId(userId),
    user: userId,
    items: orderItems,
    deliveryAddress: deliveryAddressId,
    paymentType: paymentType,
    totalAmount: totalAmount,
    exchangeRate: activeExchangeRate._id,
    tokenAmount: totalAmount * activeExchangeRate.rate,
  };
};

/**
 * Handle token transaction for delivered orders
 */
const handleTokenTransaction = async (order) => {
  const tokenTransaction = new TokenTransaction({
    user: order.user._id,
    order: order._id,
    amount: order.tokenAmount,
    transactionId: `TRX-${Date.now()}-${order.user._id.toString().slice(-4)}`,
  });
  await tokenTransaction.save();

  order.user.balance += order.tokenAmount;
  await order.user.save();
};

/**
 * Build query for filtering orders
 */
const buildOrderFilterQuery = (filters) => {
  const query = {};

  if (filters.userId) query.user = filters.userId;
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.month && filters.year) {
    const year = parseInt(filters.year);
    const month = parseInt(filters.month);
    if (month >= 1 && month <= 12) {
      query.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
      };
    }
  }

  return query;
};

/**
 * Get monthly sales revenue for past 5 months
 * @returns {Promise<Array>} Array of monthly sales data
 */
const getMonthlyRevenue = async () => {
  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
  fiveMonthsAgo.setDate(1);
  fiveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fiveMonthsAgo },
        status: "delivered",
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalRevenue: 1,
      },
    },
    {
      $sort: {
        year: 1,
        month: 1,
      },
    },
  ]);

  return monthlyRevenue;
};

/**
 * Get 5 most recent orders
 * @returns {Promise<Array>} Array of recent orders
 */
const getRecentOrders = async () => {
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "fullName")
    .populate("items.product", "name");

  return recentOrders.map((order) => ({
    id: order.orderId,
    customer: order?.user?.fullName,
    amount: order?.totalAmount,
    status: order?.status,
    paymentStatus: order?.paymentStatus,
    date: order?.createdAt,
    items: order?.items?.map((item) => ({
      product: item?.product?.name,
      volume: item?.volume,
      quantity: item?.quantity,
    })),
  }));
};

export default {
  createOrder,
  processOrder,
  verifyPaymentAndCreateOrder,
  changeOrderStatus,
  filterOrders,
  createExchangeRate,
  getCurrentExchangeRate,
  getMonthlyRevenue,
  getRecentOrders,
};

import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import orderService from "../services/order.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created order data
 */
const processOrder = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting createOrder. Request body: ${JSON.stringify(req.body)}`
  );
  const { items, deliveryAddressId, paymentType } = req.body;
  const { userId } = req.params;
  const newOrder = await orderService.processOrder({
    userId,
    items,
    deliveryAddressId,
    paymentType,
  });
  res.status(201).json(responseDTO(201, "success", newOrder));
});

/**
 * Verify payment and create order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created order data
 */
const verifyAndCreateOrder = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting verifyAndCreateOrder. Payment data: ${JSON.stringify(
      req.query
    )}, Order data: ${JSON.stringify(req.body)}`
  );

  const paymentData = {
    UID: req.query.UID,
    PRN: req.query.PRN,
    BID: req.query.BID,
  };

  const orderData = {
    orderId: req.body.orderId,
    userId: req.body.userId,
    items: req.body.items,
    deliveryAddressId: req.body.deliveryAddressId,
    paymentType: req.body.paymentType,
  };

  const order = await orderService.verifyPaymentAndCreateOrder(
    paymentData,
    orderData
  );

  res.status(201).json(responseDTO(201, "success", order));
});

/**
 * Change the status of an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated order data
 */
const changeOrderStatus = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting changeOrderStatus. OrderId: ${req.params.orderId}, New status: ${req.body.newStatus}`
  );
  const { orderId } = req.params;
  const { newStatus, deliveryGuyId, longitude, latitude } = req.body;
  const updatedOrder = await orderService.changeOrderStatus(
    orderId,
    newStatus,
    deliveryGuyId,
    longitude,
    latitude
  );
  res.status(200).json(responseDTO(200, "success", updatedOrder));
});

/**
 * Get all orders for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with user's orders
 */
const filterOrders = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting filterOrders. Request body: ${JSON.stringify(req.body)}`
  );
  const orders = await orderService.filterOrders(req);
  res.status(200).json(responseDTO(200, "success", orders));
});

/**
 * Create a new exchange rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created exchange rate data
 */
const createExchangeRate = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting createExchangeRate. Request body: ${JSON.stringify(req.body)}`
  );
  const { rate } = req.body;
  const newExchangeRate = await orderService.createExchangeRate(rate);
  res.status(201).json(responseDTO(201, "success", newExchangeRate));
});

/**
 * Get the current active exchange rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with current exchange rate data
 */
const getCurrentExchangeRate = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting getCurrentExchangeRate. Request body: ${JSON.stringify(req.body)}`
  );
  const currentRate = await orderService.getCurrentExchangeRate();
  res.status(200).json(responseDTO(200, "success", currentRate));
});

export default {
  processOrder,
  verifyAndCreateOrder,
  changeOrderStatus,
  filterOrders,
  createExchangeRate,
  getCurrentExchangeRate,
};

import express from "express";
import orderController from "../controllers/order.controller.js";

const router = express.Router();

/**
 * @swagger
 * /exchange-rate:
 *   post:
 *     summary: Create a new exchange rate
 *     tags: [Exchange Rate]
 */
router.post("/exchange-rate", orderController.createExchangeRate);

/**
 * @swagger
 * /exchange-rate:
 *   get:
 *     summary: Get the current active exchange rate
 *     tags: [Exchange Rate]
 */
router.get("/exchange-rate", orderController.getCurrentExchangeRate);

/**
 * @swagger
 * /orders/{userId}:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               deliveryAddressId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post("/process/:userId", orderController.processOrder);

/**
 * @swagger
 * /orders/verify:
 *   post:
 *     summary: Verify payment and create order
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: UID
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID from Fonepay
 *       - in: query
 *         name: PRN
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference number
 *       - in: query
 *         name: BID
 *         required: false
 *         schema:
 *           type: string
 *         description: Bank ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               deliveryAddressId:
 *                 type: string
 *               paymentType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully after payment verification
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/verify", orderController.verifyAndCreateOrder);

/**
 * @swagger
 * /orders/{userId}/{orderId}:
 *   put:
 *     summary: Change the status of an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.put("/:orderId", orderController.changeOrderStatus);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Filter and get orders
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: Filter orders by user ID
 *                   status:
 *                     type: string
 *                     enum: [pending, processing, pickedup, delivered, canceled]
 *                     description: Filter orders by status
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Filter orders from this date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Filter orders until this date
 *                   month:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 12
 *                     description: Filter orders by month (1-12)
 *                   year:
 *                     type: integer
 *                     description: Filter orders by year
 *                   assignedTo:
 *                     type: string
 *                     description: Filter orders by assigned delivery user ID
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Page number for pagination
 *               pageSize:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 description: Number of items per page
 *               sort:
 *                 type: object
 *                 properties:
 *                   createdAt:
 *                     type: integer
 *                     enum: [-1, 1]
 *                     description: Sort by creation date (-1 for desc, 1 for asc)
 *                 default: { createdAt: -1 }
 *                 description: Sort criteria
 */
router.post("/", orderController.filterOrders);

export default router;

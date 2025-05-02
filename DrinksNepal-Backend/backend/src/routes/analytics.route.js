import express from "express";
import analyticsController from "../controllers/analytics.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSalesRevenue:
 *                   type: number
 *                   description: Total sales revenue
 *                 totalOrders:
 *                   type: number
 *                   description: Total number of orders
 *                 totalProducts:
 *                   type: number
 *                   description: Total number of products
 *                 totalCustomers:
 *                   type: number
 *                   description: Total number of customers
 *                 topProducts:
 *                   type: array
 *                   description: Top 5 selling products
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       totalSales:
 *                         type: number
 *                 monthlyRevenue:
 *                   type: array
 *                   description: Monthly revenue for past 5 months
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: number
 *                       month:
 *                         type: number
 *                       totalRevenue:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get("/", analyticsController.getAnalytics);

export default router;

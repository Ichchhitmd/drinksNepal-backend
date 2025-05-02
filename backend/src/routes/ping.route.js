import express from "express";
import pingController from "../controllers/ping.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/ping:
 *   get:
 *     summary: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Healthy. 21/10/2024
 */
router.get("/", pingController.ping);

export default router;

import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Unauthorized
 */
router.get("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /api/auth/verify-otp-login:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified and user logged in
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-otp-login", authController.verifyOtpLogin);

/**
 * @swagger
 * /api/auth/generate-otp:
 *   post:
 *     summary: Generate OTP for login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP generated and sent
 *       400:
 *         description: Bad request
 */
router.post("/generate-otp", authController.generateOtp);

/**
 * @swagger
 * /api/auth/authenticate:
 *   get:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User authenticated
 *       401:
 *         description: Unauthorized
 */
router.get("/authenticate", authController.authenticate);

/**
 * @swagger
 * /api/auth/create-delivery-user:
 *   post:
 *     summary: Create a delivery user
 *     tags: [Authentication]
 */
router.post("/delivery-user", authController.createDeliveryUser);

/**
 * @swagger
 * /api/auth/update-push-token/{userId}:
 *   put:
 *     summary: Update push token for a user
 *     tags: [Authentication]
 */
router.put("/update-push-token/:userId", authController.updatePushToken);

/**
 * @swagger
 * /api/auth/notifications/{userId}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Authentication]
 */
router.post("/notifications", authController.getNotifications);

/**
 * @swagger
 * /api/auth/mark-notifications-as-read/{userId}:
 *   put:
 *     summary: Mark notifications as read for a user
 *     tags: [Authentication]
 */
router.put(
  "/mark-notifications-as-read",
  authController.markNotificationsAsRead
);

/**
 * @swagger
 * /api/auth/login-admin:
 *   post:
 *     summary: Login admin user
 *     tags: [Authentication]
 */
router.post("/login-admin", authController.loginAdmin);

/**
 * @swagger
 * /api/auth/search-users:
 *   post:
 *     summary: Search users
 *     tags: [Authentication]
 */
router.post("/search", authController.searchUsers);

/**
 * @swagger
 * /api/auth/update-delivery-user/{userId}:
 *   put:
 *     summary: Update delivery user
 *     tags: [Authentication]
 */
router.put("/delivery-user/:userId", authController.updateDeliveryUser);

/**
 * @swagger
 * /api/auth/delete-delivery-user/{userId}:
 *   delete:
 *     summary: Delete delivery user
 *     tags: [Authentication]
 */
router.delete("/delivery-user/:userId", authController.deleteDeliveryUser);

/**
 * @swagger
 * /api/auth/redeem-balance/{userId}:
 *   put:
 *     summary: Redeem user's balance by moving current balance to previousRedeemedBalance and setting balance to 0
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose balance to redeem
 *     responses:
 *       200:
 *         description: Balance redeemed successfully
 *       404:
 *         description: User not found
 */
router.put("/redeem-balance/:userId", authController.redeemBalance);

export default router;

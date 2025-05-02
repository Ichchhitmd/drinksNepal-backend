import express from "express";
import addressController from "../controllers/address.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longitude
 *               - latitude
 *               - addressDetails
 *             properties:
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               addressDetails:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", addressController.createAddress);

/**
 * @swagger
 * /api/addresses/{userId}:
 *   get:
 *     summary: Get all addresses for a user
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of addresses
 */
router.get("/:userId", addressController.getAddresses);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               addressDetails:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Address not found
 */
router.put("/:userId/:addressId", addressController.updateAddress);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete("/:userId/:addressId", addressController.deleteAddress);

export default router;

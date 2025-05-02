import express from "express";
import multer from "multer";
import drinksnepalconfigController from "../controllers/drinksnepalconfig.controller.js";

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * /api/config/banner:
 *   post:
 *     summary: Upload a new banner image
 *     tags: [Config]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Banner image file to upload (maximum 5 banners allowed)
 *     responses:
 *       200:
 *         description: Banner image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Banner image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1234567890"
 *                           url:
 *                             type: string
 *                             example: /images/banner/banner-1234567890.jpg
 *                           filename:
 *                             type: string
 *                             example: banner-1234567890.jpg
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: No image file provided or maximum banner limit reached
 */
router.post(
  "/banner",
  upload.single("image"),
  drinksnepalconfigController.uploadBannerImage
);

/**
 * @swagger
 * /api/config/banners:
 *   get:
 *     summary: Get all banner images
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Successfully retrieved banner images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Banner images retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1234567890"
 *                           url:
 *                             type: string
 *                             example: /images/banner/banner-1234567890.jpg
 *                           filename:
 *                             type: string
 *                             example: banner-1234567890.jpg
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get("/banners", drinksnepalconfigController.getBannerImages);

/**
 * @swagger
 * /api/config/banner/{id}:
 *   delete:
 *     summary: Delete a banner image
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the banner to delete
 *     responses:
 *       200:
 *         description: Banner image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Banner image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           url:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid banner ID
 *       404:
 *         description: Banner not found
 */
router.delete("/banner/:id", drinksnepalconfigController.deleteBannerImage);

/**
 * @swagger
 * /api/config/banners/reorder:
 *   put:
 *     summary: Reorder banner images
 *     tags: [Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bannerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1234567890", "0987654321"]
 *     responses:
 *       200:
 *         description: Banner images reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Banner images reordered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           url:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid banner IDs array
 */
router.put("/banners/reorder", drinksnepalconfigController.reorderBannerImages);

export default router;

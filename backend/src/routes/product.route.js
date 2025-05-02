import express from "express";
import multer from "multer";
import productController from "../controllers/product.controller.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

/**
 * @swagger
 * /api/products/index:
 *   post:
 *     summary: Index products from a CSV file
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: CSV file containing product data
 *     responses:
 *       200:
 *         description: Products indexed successfully
 *       400:
 *         description: No file uploaded or invalid file format
 */
router.post("/index", upload.single("file"), productController.indexProducts);

/**
 * @swagger
 * /api/products/export:
 *   get:
 *     summary: Download products in CSV format
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: CSV file containing product data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export", productController.downloadProductsCSV);

/**
 * @swagger
 * /api/products/search:
 *   post:
 *     summary: Search for products
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               filters:
 *                 type: object
 *               sort:
 *                 type: object
 *               page:
 *                 type: number
 *               pageSize:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful search results
 */
router.post("/search", productController.search);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/:productId", productController.updateProduct);
/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Error fetching categories
 */
router.get("/categories", productController.getCategories);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               type:
 *                 type: string
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               regularPrice:
 *                 type: number
 *               stock:
 *                 type: number
 *               details:
 *                 type: object
 *                 properties:
 *                   volume:
 *                     type: string
 *                   country:
 *                     type: string
 *                   age:
 *                     type: string
 *                   abv:
 *                     type: string
 *             required:
 *               - id
 *               - sku
 *               - name
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid product data
 */
router.post("/", productController.createProduct);

/**
 * @swagger
 * /api/products/home-categories:
 *   get:
 *     summary: Get all home categories
 *     tags: [Products]
 */
router.get("/home-categories", productController.getHomeCategories);

export default router;

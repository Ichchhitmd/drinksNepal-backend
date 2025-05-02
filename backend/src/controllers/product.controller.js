import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";
import HttpError from "../error/custom.error.js";
import productService from "../services/product.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Creates/Updates a list of products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with product data
 */
const indexProducts = asyncHandler(async (req, res, next) => {
  logger.info(`Starting indexProducts`);
  if (!req.file) {
    logger.error("No file uploaded in indexProducts");
    throw new HttpError(400, "No file uploaded");
  }

  res
    .status(200)
    .json(
      responseDTO(
        200,
        "success",
        await productService.createProducts(req.file.path)
      )
    );
});

/**
 * Downloads products in CSV format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} CSV file containing product data
 */
const downloadProductsCSV = asyncHandler(async (req, res, next) => {
  logger.info(
    `Starting downloadProductsCSV. Query params: ${JSON.stringify(req.query)}`
  );
  const csvData = await productService.getProductsCSVFormat(req.query);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=products.csv");

  res.status(200).send(csvData);
});

/**
 * Searches for products based on provided criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with search results
 */
const search = asyncHandler(async (req, res, next) => {
  logger.info(`Starting search. Request body: ${JSON.stringify(req.body)}`);
  res
    .status(200)
    .json(
      responseDTO(200, "success", await productService.searchProducts(req))
    );
});

/**
 * Updates a product by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with updated product data
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const updateData = req.body;
  logger.info(
    `Starting updateProduct. ProductId: ${productId}, Update data: ${JSON.stringify(
      updateData
    )}`
  );

  res
    .status(200)
    .json(
      responseDTO(
        200,
        "success",
        await productService.updateProductById(productId, updateData)
      )
    );
});

/**
 * Gets all product categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with categories data
 */
const getCategories = asyncHandler(async (req, res, next) => {
  logger.info("Getting all product categories");
  res
    .status(200)
    .json(responseDTO(200, "success", await productService.getCategories()));
});

/**
 * Get all home categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with home categories data
 */
const getHomeCategories = asyncHandler(async (req, res, next) => {
  logger.info("Getting all home categories");
  res
    .status(200)
    .json(
      responseDTO(200, "success", await productService.getHomeCategories())
    );
});

/**
 * Creates a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with created product data
 */
const createProduct = asyncHandler(async (req, res, next) => {
  const productData = req.body;
  logger.info(`Creating new product with data: ${JSON.stringify(productData)}`);

  res
    .status(201)
    .json(
      responseDTO(
        201,
        "success",
        await productService.createProduct(productData)
      )
    );
});

export default {
  downloadProductsCSV,
  indexProducts,
  search,
  updateProduct,
  getCategories,
  getHomeCategories,
  createProduct,
};

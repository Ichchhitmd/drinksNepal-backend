import csv from "csv-parser";
import fs from "fs";
import mongoose from "mongoose";
import logger from "../configs/logger.config.js";
import { homeCategoryData } from "../models/categories.model.js";
import { Category, Order, Product } from "../models/models.js";

/**
 * Creates products from a CSV file.
 * @param {string} path - The path to the CSV file.
 * @returns {Promise<string>} A success message.
 */
const createProducts = async (path) => {
  const results = await readCSV(path);
  const response = await processProducts(results);
  fs.unlinkSync(path); // Remove the temporary file
  return response;
};

/**
 * Creates a single product
 * @param {Object} productData - The product data
 * @returns {Promise<Object>} The created product
 */
const createProduct = async (productData) => {
  try {
    logger.info(`Creating product with data: ${JSON.stringify(productData)}`);

    // Get default categories
    const defaultCategories = await Category.find({
      name: { $in: Object.values(CategoryEnum) },
    });

    // Find matching category or use Others
    let productCategory = defaultCategories.find(
      (cat) => cat.name === CategoryEnum.OTHERS
    );

    if (productData.category) {
      const matchingCategory = defaultCategories.find(
        (cat) =>
          cat.name.toLowerCase() === productData.category.toLowerCase() ||
          productData.category.toLowerCase().includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(productData.category.toLowerCase())
      );

      if (matchingCategory) {
        productCategory = matchingCategory;
      }
    }

    // Create new product with assigned category
    const product = new Product({
      ...productData,
      category: productCategory._id,
    });

    const savedProduct = await product.save();
    logger.info(`Successfully created product with ID: ${savedProduct._id}`);

    return savedProduct;
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    throw error;
  }
};

/**
 * Get products in CSV .
 * @param {Object} filters - The filters to apply when selecting products.
 * @returns {Promise<string>} A CSV string containing the product data.
 */
const getProductsCSVFormat = async (filters = {}) => {
  const products = await Product.find(filters).populate("category").lean();

  const csvHeader = [
    "ID",
    "Type",
    "SKU",
    "Name",
    "Published",
    "Is featured?",
    "Visibility in catalog",
    "Short description",
    "Description",
    "Date sale price starts",
    "Date sale price ends",
    "Tax status",
    "Tax class",
    "In stock?",
    "Stock",
    "Low stock amount",
    "Sold individually?",
    "Weight (kg)",
    "Length (cm)",
    "Width (cm)",
    "Height (cm)",
    "Allow customer reviews?",
    "Purchase note",
    "Sale price",
    "Regular price",
    "Categories",
    "Tags",
    "Shipping class",
    "Images",
    "Download limit",
    "Download expiry days",
    "Parent",
    "Grouped products",
    "Upsells",
    "Cross-sells",
    "External URL",
    "Button text",
    "Position",
    "Attribute 1 name",
    "Attribute 1 value(s)",
    "Attribute 1 visible",
    "Attribute 1 global",
    "Attribute 1 default",
    "Attribute 2 name",
    "Attribute 2 value(s)",
    "Attribute 2 visible",
    "Attribute 2 global",
    "Attribute 2 default",
  ].join(",");

  const csvRows = products.map((product) => {
    // Get category hierarchy
    const getCategoryHierarchy = (category) => {
      if (!category) return "";
      if (!category.parent) return category.name;
      return `${getCategoryHierarchy(category.parent)} > ${category.name}`;
    };

    // Handle volume variations
    const defaultVolume =
      product.details.volume.find((v) => v.isDefault) ||
      product.details.volume[0];

    return [
      product.id || "",
      product.type || "simple",
      product.sku || "",
      product.name || "",
      "1", // Published
      product.isFeatured ? "1" : "0",
      product.visibilityInCatalog || "visible",
      product.shortDescription || "",
      product.description || "",
      product.dateSalePriceStarts || "",
      product.dateSalePriceEnds || "",
      product.taxStatus || "",
      product.taxClass || "",
      product.inStock ? "1" : "0",
      product.stock || "0",
      product.lowStockAmount || "",
      product.soldIndividually ? "1" : "0",
      product.weight || "",
      product.length || "",
      product.width || "",
      product.height || "",
      "1", // Allow customer reviews
      product.purchaseNote || "",
      defaultVolume?.salePrice || "",
      defaultVolume?.regularPrice || "",
      getCategoryHierarchy(product.category),
      product.tags || "",
      product.shippingClass || "",
      (product.images || []).join(","),
      product.downloadLimit || "",
      product.downloadExpiryDays || "",
      product.parent || "",
      product.groupedProducts || "",
      product.upsells || "",
      product.crossSells || "",
      product.externalUrl || "",
      product.buttonText || "",
      "", // Position
      "Volume",
      defaultVolume?.volume || "",
      "1", // Attribute 1 visible
      "1", // Attribute 1 global
      "1", // Attribute 1 default
      "Country",
      product.details?.country || "",
      "1", // Attribute 2 visible
      "1", // Attribute 2 global
      product.details?.country || "", // Attribute 2 default
    ]
      .map((field) => `"${field}"`)
      .join(",");
  });

  // For variable products, add variation rows
  const variationRows = products
    .filter((product) => product.type === "variable")
    .flatMap((product) =>
      product.details.volume
        .filter((vol) => !vol.isDefault)
        .map((variation) => {
          return [
            variation.id || "",
            "variation",
            `${product.sku}-${variation.volume}`,
            product.name,
            "1", // Published
            "0", // Is featured
            "visible",
            product.shortDescription || "",
            product.description || "",
            "", // Date sale price starts
            "", // Date sale price ends
            product.taxStatus || "",
            product.taxClass || "",
            variation.inStock ? "1" : "0",
            variation.stock || "0",
            "", // Low stock amount
            "0", // Sold individually
            product.weight || "",
            product.length || "",
            product.width || "",
            product.height || "",
            "0", // Allow customer reviews
            "", // Purchase note
            variation.salePrice || "",
            variation.regularPrice || "",
            "", // Categories
            "", // Tags
            "", // Shipping class
            "", // Images
            "", // Download limit
            "", // Download expiry days
            product.sku, // Parent SKU
            "", // Grouped products
            "", // Upsells
            "", // Cross-sells
            "", // External URL
            "", // Button text
            "", // Position
            "Volume",
            variation.volume || "",
            "1", // Attribute 1 visible
            "1", // Attribute 1 global
            "0", // Attribute 1 default
            "", // Attribute 2 name
            "", // Attribute 2 value(s)
            "", // Attribute 2 visible
            "", // Attribute 2 global
            "", // Attribute 2 default
          ]
            .map((field) => `"${field}"`)
            .join(",");
        })
    );

  return [csvHeader, ...csvRows, ...variationRows].join("\n");
};

/**
 * Searches for products based on various criteria.
 * @param {Object} req - The request object containing search parameters.
 * @returns {Promise<Object>} An object containing search results and pagination info.
 */
const searchProducts = async (req) => {
  const {
    query,
    filters = {},
    sort = {},
    page = 1,
    pageSize = 10,
    searchType = "text",
    userId,
  } = req.body;

  logger.info(
    `Searching for products with request body: ${JSON.stringify(req.body)}`
  );

  let pipeline = [];

  addFilteringStage(pipeline, filters);
  addTextSearchStage(pipeline, query);
  await addSpecialSearchStage(pipeline, searchType, userId);
  addSortingStage(pipeline, sort, searchType);
  addPaginationStage(pipeline, page, pageSize);
  const products = await Product.aggregate(pipeline).exec();
  const populatedProducts = await Product.populate(products, {
    path: "category",
    model: "Category",
  });
  const total = await getTotalCount(pipeline);
  return {
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    count: total,
    products: populatedProducts,
  };
};

/**
 * Updates a product by its ID
 * @param {string} id - The ID of the product to update
 * @param {Object} updateData - The data to update the product with
 * @returns {Promise<Object>} The updated product
 */
const updateProductById = async (id, updateData) => {
  const product = await Product.findById(id);

  if (!product) {
    logger.error(`Product not found with ID: ${id}`);
    throw new HttpError(404, "Product not found");
  }

  // Update only the fields that are present in updateData
  Object.keys(updateData).forEach((key) => {
    if (key in product) {
      if (key !== "details") product[key] = updateData[key];
    }
  });

  if (updateData.details) {
    Object.keys(updateData.details).forEach((key) => {
      if (key in product.details) {
        product.details[key] = updateData.details[key];
      }
    });
  }

  const updatedProduct = await product.save();

  return updatedProduct;
};

/**
 * Get all categories with their subcategories nested
 * @returns {Promise<Array>} Array of main categories with nested subcategories
 */
const getCategories = async () => {
  // Get all main categories (those without parent)
  const mainCategories = await Category.find({ parent: null });

  // For each main category, get its subcategories
  const categoriesWithSubs = await Promise.all(
    mainCategories.map(async (mainCat) => {
      const subcategories = await Category.find({ parent: mainCat._id });
      return {
        _id: mainCat._id,
        name: mainCat.name,
        imageUrl: mainCat.imageUrl,
        subcategories: subcategories,
        isHome: mainCat.isHome,
      };
    })
  );

  return categoriesWithSubs;
};

/**
 * Get all home categories
 * @returns {Promise<Array>} Array of home categories with their products
 */
const getHomeCategories = async () => {
  // Get all categories marked as home categories
  const homeCategories = await Category.find({ isHome: true });

  // Get source categories from homeCategoryData
  const sourceCategories = homeCategoryData.filter(
    (cat) => cat.type === "source"
  );

  // Combine home categories from DB with source categories
  const allCategories = [
    ...homeCategories,
    ...sourceCategories.map((sourceCat) => ({
      _id: sourceCat.id,
      name: sourceCat.name,
      imageUrl: sourceCat?.image,
      isHome: true,
      type: "source",
    })),
  ];

  // For each category, get its products and details
  const categoriesWithProducts = await Promise.all(
    allCategories.map(async (category) => {
      // Only look up subcategories for DB categories (not source categories)
      const subcategories =
        category.type !== "source"
          ? await Category.find({ parent: category._id })
          : [];

      // Find matching home category data
      const homeCategoryMatch = homeCategoryData.find(
        (cat) => cat.name.toLowerCase() === category.name.toLowerCase()
      );

      return {
        _id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        subcategories: subcategories,
        isHome: true,
        type: homeCategoryMatch?.type || "category",
      };
    })
  );

  return categoriesWithProducts;
};

// Processes an array of product data and updates the database.
const processProducts = async (results) => {
  logger.info("Processing products");
  const errors = [];
  const processedResults = [];

  await processParentProducts(results, errors, processedResults);
  await processVariations(results, errors, processedResults);

  logProcessingResults(errors, results);

  return generateProcessingReport(results, errors);
};

// Process category hierarchy and return the final category ID
const processCategory = async (categoryString) => {
  if (!categoryString) return null;

  let categoryHierarchy = categoryString.split(">").map((c) => c.trim());
  let parentCategory = null;
  let finalCategoryId = null;

  // Process each level of the hierarchy sequentially
  for (const categoryName of categoryHierarchy) {
    // Check if this is a home category
    const homeCategory = homeCategoryData.find(
      (cat) =>
        cat.name.toLowerCase() === categoryName.toLowerCase() &&
        cat.type === "category"
    );

    // Use findOneAndUpdate with upsert instead of find + create
    // This makes the operation atomic and prevents duplicate categories
    const category = await Category.findOneAndUpdate(
      {
        name: { $regex: new RegExp(`^${categoryName}$`, "i") },
        parent: parentCategory,
      },
      {
        name: categoryName,
        parent: parentCategory,
        isHome: !!homeCategory,
        imageUrl: homeCategory ? `${homeCategory.image}` : undefined,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    parentCategory = category._id;
    finalCategoryId = category._id;
  }

  return finalCategoryId;
};

// Reads a CSV file and returns its contents as an array of objects.
const readCSV = (path) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

// Process parent/variable products in first pass
const processParentProducts = async (results, errors, processedResults) => {
  for (const [index, row] of results.entries()) {
    try {
      if (row.Type === "variation" || row.Parent !== "") {
        continue;
      }

      const productData = await buildProductData(row);
      const updatedProduct = await upsertProduct(productData);
      processedResults.push(updatedProduct);
    } catch (error) {
      handleProcessingError(error, index, row, errors);
    }
  }
};

// Build product data object from CSV row
const buildProductData = async (row) => {
  const productCategory = await processCategory(row.Categories);

  const productData = {
    id: parseInt(row.ID) || 0,
    type: row.Type === "variable" ? "variable" : "simple",
    sku: row.SKU,
    name: row.Name,
    isFeatured: row["Is featured?"] === "1",
    visibilityInCatalog: row["Visibility in catalog"],
    shortDescription: row["Short description"],
    description: row.Description,
    dateSalePriceStarts: row["Date sale price starts"],
    dateSalePriceEnds: row["Date sale price ends"],
    taxStatus: row["Tax status"],
    taxClass: row["Tax class"],
    inStock: row["In stock?"] === "1",
    stock: parseInt(row.Stock) || 0,
    lowStockAmount: row["Low stock amount"],
    soldIndividually: row["Sold individually?"] === "1",
    weight: row["Weight (kg)"],
    length: row["Length (cm)"],
    width: row["Width (cm)"],
    height: row["Height (cm)"],
    purchaseNote: row["Purchase note"],
    salePrice: parseFloat(row["Sale price"]) || 0,
    regularPrice: parseFloat(row["Regular price"]) || 0,
    category: productCategory,
    tags: row.Tags,
    shippingClass: row["Shipping class"],
    images: processImages(row.Images),
    downloadLimit: parseInt(row["Download limit"]) || 0,
    downloadExpiryDays: parseInt(row["Download expiry days"]) || 0,
    parent: row.Parent,
    groupedProducts: row["Grouped products"],
    upsells: row.Upsells,
    crossSells: row["Cross-sells"],
    externalUrl: row["External URL"],
    buttonText: row["Button text"],
    totalSales: 0,
    details: initializeProductDetails(),
  };

  processAttributes(row, productData);
  return productData;
};

const processImages = (images) => {
  return images && images !== "[]"
    ? images.split(",").map((url) => url.trim())
    : [];
};

const initializeProductDetails = () => ({
  volume: [],
  country: "",
  age: "",
  abv: "",
  source: "",
  closure: "",
  packaging: "",
  colour: "",
  flavour: "",
  grapeVarieties: "",
});

/**
 * Process product attributes from CSV row
 */
const processAttributes = (row, productData) => {
  let volumeValue = "";

  Object.keys(row).forEach((key) => {
    if (key.startsWith("Attribute") && key.endsWith("name")) {
      const index = key.match(/\d+/)[0];
      const name = row[`Attribute ${index} name`]
        .toLowerCase()
        .replace(/\s+/g, "");
      const value = row[`Attribute ${index} value(s)`];

      if (name === "volume") {
        volumeValue = value;
      } else if (name && value && productData.details.hasOwnProperty(name)) {
        productData.details[name] = value;
      }
    }
  });

  // Add single volume variation for simple products
  if (productData.type === "simple") {
    productData.details.volume = [
      {
        volume: volumeValue,
        regularPrice: parseFloat(row["Regular price"]) || 0,
        salePrice: parseFloat(row["Sale price"]) || 0,
        stock: parseInt(row.Stock) || 0,
        inStock: row["In stock?"] === "1",
        isDefault: true,
      },
    ];
  }
};

/**
 * Process variations in second pass
 */
const processVariations = async (results, errors, processedResults) => {
  for (const [index, row] of results.entries()) {
    try {
      if (row.Type !== "variation" && row.Parent === "") {
        continue;
      }

      const parentRow = findParentRow(results, row);
      const volumeAttributeIndex = findVolumeAttributeIndex(row);
      const volumeVariation = buildVolumeVariation(
        row,
        parentRow,
        volumeAttributeIndex
      );

      await addVariationToParent(row, volumeVariation, processedResults);
    } catch (error) {
      handleProcessingError(error, index, row, errors);
    }
  }
};

const findParentRow = (results, row) => {
  const parentRow = results.find((r) => r.SKU === row.Parent);
  if (!parentRow) {
    throw new Error(`Parent row with SKU ${row.Parent} not found`);
  }
  return parentRow;
};

const findVolumeAttributeIndex = (row) => {
  let volumeAttributeIndex = null;
  Object.keys(row).forEach((key) => {
    if (key.startsWith("Attribute") && key.endsWith("name")) {
      const index = key.match(/\d+/)[0];
      const name = row[`Attribute ${index} name`]
        .toLowerCase()
        .replace(/\s+/g, "");
      if (name === "volume") {
        volumeAttributeIndex = index;
      }
    }
  });

  if (!volumeAttributeIndex) {
    throw new Error("Volume attribute not found for variation");
  }
  return volumeAttributeIndex;
};

const buildVolumeVariation = (row, parentRow, volumeAttributeIndex) => ({
  id: row.ID,
  volume: row[`Attribute ${volumeAttributeIndex} value(s)`] || "",
  regularPrice: parseFloat(row["Regular price"]) || 0,
  salePrice: parseFloat(row["Sale price"]) || 0,
  stock: parseInt(row.Stock) || 0,
  inStock: row["In stock?"] === "1",
  isDefault:
    parentRow[`Attribute ${volumeAttributeIndex} default`] ===
    row[`Attribute ${volumeAttributeIndex} value(s)`],
});

const addVariationToParent = async (row, volumeVariation, processedResults) => {
  const parentProduct = await Product.findOne({ sku: row.Parent });
  if (!parentProduct) {
    throw new Error(`Parent product with SKU ${row.Parent} not found`);
  }

  const volumeExists = parentProduct.details.volume.some(
    (v) => v.volume === volumeVariation.volume
  );

  if (!volumeExists) {
    const updatedParent = await Product.findOneAndUpdate(
      { sku: row.Parent },
      {
        $push: { "details.volume": volumeVariation },
        $set: { type: "variable" },
      },
      { new: true }
    );
    processedResults.push(updatedParent);
  } else {
    logger.info(
      `Skipping duplicate volume variation for SKU ${row.Parent}: ${volumeVariation.volume}`
    );
  }
};

const handleProcessingError = (error, index, row, errors) => {
  const errorDetails = {
    rowIndex: index,
    sku: row.SKU || "Unknown SKU",
    name: row.Name || "Unknown Name",
    error: error.message,
  };
  errors.push(errorDetails);
  logger.error(`Error processing row: ${JSON.stringify(errorDetails)}`);
};

const logProcessingResults = (errors, results) => {
  if (errors.length > 0) {
    logger.error(`Processing completed with ${errors.length} errors:`, {
      errors: errors,
    });
  }

  logger.info(
    `Processing Products Completed. Successfully processed ${
      results.length - errors.length
    } products with ${errors.length} errors`
  );
};

const generateProcessingReport = (results, errors) => ({
  totalProducts: results.length,
  successCount: results.length - errors.length,
  errorCount: errors.length,
  errors: errors,
});

// Adds a text search stage to the pipeline if a query is provided.
const addTextSearchStage = (pipeline, query) => {
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { shortDescription: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
          { "details.country": { $regex: query, $options: "i" } },
          { "details.flavour": { $regex: query, $options: "i" } },
        ],
      },
    });
  }
};

// Adds a filtering stage to the pipeline based on provided filters.
const addFilteringStage = (pipeline, filters) => {
  const matchStage = {};
  if (filters.minPrice || filters.maxPrice) {
    pipeline.push({
      $addFields: {
        minProductPrice: {
          $min: {
            $map: {
              input: "$details.volume",
              as: "vol",
              in: "$$vol.regularPrice",
            },
          },
        },
        maxProductPrice: {
          $max: {
            $map: {
              input: "$details.volume",
              as: "vol",
              in: "$$vol.regularPrice",
            },
          },
        },
      },
    });

    const priceMatch = {};
    if (filters.minPrice) {
      priceMatch.minProductPrice = { $gte: parseFloat(filters.minPrice) };
    }
    if (filters.maxPrice) {
      priceMatch.maxProductPrice = { $lte: parseFloat(filters.maxPrice) };
    }

    pipeline.push({ $match: priceMatch });
  }

  if (filters.source) {
    matchStage["details.source"] = filters.source;
  }

  if (filters.isFeatured) {
    matchStage.isFeatured = filters.isFeatured;
  }

  // Handle category filtering
  if (filters.category) {
    // If subcategory is specified, only get products from that subcategory
    if (filters.subCategory) {
      matchStage.category = mongoose.Types.ObjectId.createFromHexString(
        filters.subCategory
      );
    } else {
      pipeline.push({
        $lookup: {
          from: "categories",
          let: { mainCategoryId: filters.category },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$mainCategoryId" }] },
                    { $eq: ["$parent", { $toObjectId: "$$mainCategoryId" }] },
                  ],
                },
              },
            },
          ],
          as: "categories",
        },
      });

      pipeline.push({
        $match: {
          categories: { $ne: [] },
          $expr: {
            $in: ["$category", "$categories._id"],
          },
        },
      });

      // Remove the categories array since we don't need it anymore
      pipeline.push({
        $project: {
          categories: 0,
        },
      });
    }
    logger.info(`Pipeline test: ${JSON.stringify(pipeline)}`);
  }

  if (filters.id) {
    matchStage.id = parseInt(filters.id);
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }
};

// Adds a special search stage to the pipeline based on the search type.
const addSpecialSearchStage = async (pipeline, searchType, userId) => {
  if (searchType === "trending") {
    addTrendingSearchStage(pipeline);
  } else if (searchType === "bestsellers") {
    addBestsellersSearchStage(pipeline);
  } else if (searchType === "new") {
    addNewProductsSearchStage(pipeline);
  } else if (searchType === "recommended") {
    await addRecommendedProductsSearchStage(pipeline, userId);
  }
};

//Adds a trending products search stage to the pipeline.
const addTrendingSearchStage = (pipeline) => {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  pipeline.push(
    {
      $lookup: {
        from: "orders",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $gte: ["$createdAt", twoMonthsAgo] },
                  { $in: ["$$productId", "$items.product"] },
                ],
              },
            },
          },
          { $unwind: "$items" },
          {
            $match: {
              $expr: { $eq: ["$items.product", "$$productId"] },
            },
          },
          {
            $group: {
              _id: {
                $cond: [
                  { $gte: ["$createdAt", oneMonthAgo] },
                  "currentMonth",
                  "previousMonth",
                ],
              },
              totalQty: { $sum: "$items.quantity" },
            },
          },
        ],
        as: "salesData",
      },
    },
    {
      $addFields: {
        currentMonthSales: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$salesData",
                    as: "sale",
                    cond: { $eq: ["$$sale._id", "currentMonth"] },
                  },
                },
                0,
              ],
            },
            { totalQty: 0 },
          ],
        },
        previousMonthSales: {
          $ifNull: [
            {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$salesData",
                    as: "sale",
                    cond: { $eq: ["$$sale._id", "previousMonth"] },
                  },
                },
                0,
              ],
            },
            { totalQty: 0 },
          ],
        },
      },
    },
    {
      $addFields: {
        salesIncrease: {
          $subtract: [
            "$currentMonthSales.totalQty",
            "$previousMonthSales.totalQty",
          ],
        },
        salesIncreasePercentage: {
          $cond: [
            { $eq: ["$previousMonthSales.totalQty", 0] },
            100,
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        "$currentMonthSales.totalQty",
                        "$previousMonthSales.totalQty",
                      ],
                    },
                    "$previousMonthSales.totalQty",
                  ],
                },
                100,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: { salesIncreasePercentage: -1, salesIncrease: -1 },
    }
  );
};

//Adds a bestsellers search stage to the pipeline.
const addBestsellersSearchStage = (pipeline) => {
  pipeline.push({
    $sort: { totalSales: -1 },
  });
};

//Adds a new products search stage to the pipeline.
const addNewProductsSearchStage = (pipeline) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  pipeline.push(
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $sort: { createdAt: -1 } }
  );
};

//Adds a recommended products search stage to the pipeline.
const addRecommendedProductsSearchStage = async (pipeline, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const userPurchases = await Order.getUserPurchasedProducts(userId, 50);

  // If user has no purchase history, return random products
  if (!userPurchases || userPurchases.length === 0) {
    logger.info("No purchase history found, returning random products");
    pipeline.push({ $sample: { size: 10 } });
    return;
  }

  const userPurchasedProductIds = userPurchases.map((item) => item._id);

  // Find similar users
  const similarUsers = await Order.aggregate([
    { $match: { "items.product": { $in: userPurchasedProductIds } } },
    { $group: { _id: "$user", commonProducts: { $sum: 1 } } },
    { $match: { _id: { $ne: userObjectId } } },
    { $sort: { commonProducts: -1 } },
    { $limit: 10 },
  ]);

  // If no similar users found, return random products
  if (!similarUsers || similarUsers.length === 0) {
    logger.info("No similar users found, returning random products");
    pipeline.push({ $sample: { size: 10 } });
    return;
  }

  const similarUserIds = similarUsers.map((user) => user._id);

  pipeline.push(
    {
      $lookup: {
        from: "orders",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$user", similarUserIds] },
                  { $in: ["$$productId", "$items.product"] },
                ],
              },
              createdAt: {
                $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $unwind: "$items" },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: "similarUsersPurchases",
      },
    },
    {
      $match: {
        _id: { $nin: userPurchasedProductIds },
        similarUsersPurchases: { $ne: [] },
      },
    },
    {
      $addFields: {
        recommendationScore: {
          $arrayElemAt: ["$similarUsersPurchases.count", 0],
        },
      },
    },
    {
      $sort: { recommendationScore: -1 },
    }
  );

  // Check if we have enough recommended products
  const recommendedCount = await Product.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);
  if (!recommendedCount.length || recommendedCount[0].total < 5) {
    logger.info(
      "Not enough recommended products found, returning random products"
    );
    pipeline.length = 0;
    pipeline.push({ $sample: { size: 10 } });
  }
};

//Adds a sorting stage to the pipeline for 'text' search type.
const addSortingStage = (pipeline, sort, searchType) => {
  if (searchType === "text" && Object.keys(sort).length > 0) {
    const sortStage = {};
    Object.keys(sort).forEach((key) => {
      if (key === "price") {
        // Add stage to calculate max price across volumes
        pipeline.push({
          $addFields: {
            maxPrice: {
              $max: {
                $map: {
                  input: "$details.volume",
                  as: "vol",
                  in: "$$vol.regularPrice",
                },
              },
            },
          },
        });
        // Sort by the calculated max price
        sortStage.maxPrice = sort[key] === "desc" ? -1 : 1;
      } else {
        sortStage[key] = sort[key] === "desc" ? -1 : 1;
      }
    });
    pipeline.push({ $sort: sortStage });
  }
};

//Adds a pagination stage to the pipeline.
const addPaginationStage = (pipeline, page, pageSize) => {
  pipeline.push({ $skip: (page - 1) * pageSize }, { $limit: pageSize });
};

//Gets the total count of products matching the search criteria.
const getTotalCount = async (pipeline) => {
  const countPipeline = pipeline.slice(0, -2);
  countPipeline.push({ $count: "total" });
  const [{ total } = { total: 0 }] = await Product.aggregate(countPipeline);
  return total;
};

// Upserts a product in the database
const upsertProduct = async (productData) => {
  const { sku, ...data } = productData;

  // If ID exists, try to update existing product
  if (sku) {
    const existingProduct = await Product.findOneAndUpdate({ sku: sku }, data, {
      new: true,
      upsert: true,
    });
    return existingProduct;
  }

  // If no ID, create new product
  const newProduct = new Product(data);
  return await newProduct.save();
};

export default {
  createProducts,
  createProduct,
  getProductsCSVFormat,
  searchProducts,
  updateProductById,
  getCategories,
  getHomeCategories,
};

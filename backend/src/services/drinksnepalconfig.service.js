import fs from "fs";
import path from "path";
import { DrinksNepalConfig } from "../models/models.js";

const BANNER_IMAGES_KEY = "bannerImages";
const MAX_BANNERS = 5;

/**
 * Adds a new banner image to the config
 * @param {Object} imageFile - The uploaded image file
 * @returns {Promise<Object>} The updated list of banner images
 */
const addBannerImage = async (imageFile) => {
  // Create banner directory if it doesn't exist
  const bannerDir = "public/images/banner";
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }

  // Get current banners
  const currentConfig = await DrinksNepalConfig.findOne({
    key: BANNER_IMAGES_KEY,
  });
  const currentBanners = currentConfig?.value || [];

  // Check if maximum limit reached
  if (currentBanners.length >= MAX_BANNERS) {
    throw new Error(`Maximum limit of ${MAX_BANNERS} banner images reached`);
  }

  // Generate unique filename
  const filename = `banner-${Date.now()}${path.extname(
    imageFile.originalname
  )}`;
  const filepath = path.join(bannerDir, filename);

  // Save file
  await fs.promises.writeFile(filepath, imageFile.buffer);

  // Generate static URL
  const staticUrl = `/images/banner/${filename}`;

  // Add new banner to list with metadata
  const newBanner = {
    id: Date.now().toString(),
    url: staticUrl,
    filename: filename,
    createdAt: new Date(),
  };

  // Update config in DB
  const updatedConfig = await DrinksNepalConfig.findOneAndUpdate(
    { key: BANNER_IMAGES_KEY },
    {
      key: BANNER_IMAGES_KEY,
      value: [...currentBanners, newBanner],
    },
    {
      upsert: true,
      new: true,
    }
  );

  return { banners: updatedConfig.value };
};

/**
 * Deletes a banner image by ID
 * @param {string} bannerId - The ID of the banner to delete
 * @returns {Promise<Object>} The updated list of banner images
 */
const deleteBannerImage = async (bannerId) => {
  const config = await DrinksNepalConfig.findOne({ key: BANNER_IMAGES_KEY });
  if (!config || !config.value) {
    throw new Error("No banner images found");
  }

  const bannerToDelete = config.value.find((banner) => banner.id === bannerId);
  if (!bannerToDelete) {
    throw new Error("Banner not found");
  }

  // Delete physical file
  const filepath = path.join("public", bannerToDelete.url);
  try {
    await fs.promises.unlink(filepath);
  } catch (error) {
    console.error("Error deleting file:", error);
    // Continue even if file deletion fails
  }

  // Update config in DB
  const updatedConfig = await DrinksNepalConfig.findOneAndUpdate(
    { key: BANNER_IMAGES_KEY },
    {
      key: BANNER_IMAGES_KEY,
      value: config.value.filter((banner) => banner.id !== bannerId),
    },
    { new: true }
  );

  return { banners: updatedConfig.value };
};

/**
 * Fetches all banner images from config
 * @returns {Promise<Object>} List of banner images
 */
const getBannerImages = async () => {
  const config = await DrinksNepalConfig.findOne({ key: BANNER_IMAGES_KEY });
  return config ? { banners: config.value } : { banners: [] };
};

/**
 * Updates the order of banner images
 * @param {Array<string>} bannerIds - Array of banner IDs in desired order
 * @returns {Promise<Object>} The updated list of banner images
 */
const reorderBannerImages = async (bannerIds) => {
  const config = await DrinksNepalConfig.findOne({ key: BANNER_IMAGES_KEY });
  if (!config || !config.value) {
    throw new Error("No banner images found");
  }

  // Verify all IDs exist
  const currentBanners = config.value;
  const allIdsExist = bannerIds.every((id) =>
    currentBanners.some((banner) => banner.id === id)
  );

  if (!allIdsExist) {
    throw new Error("Invalid banner ID provided");
  }

  // Reorder banners according to provided IDs
  const reorderedBanners = bannerIds.map((id) =>
    currentBanners.find((banner) => banner.id === id)
  );

  // Update config in DB
  const updatedConfig = await DrinksNepalConfig.findOneAndUpdate(
    { key: BANNER_IMAGES_KEY },
    {
      key: BANNER_IMAGES_KEY,
      value: reorderedBanners,
    },
    { new: true }
  );

  return { banners: updatedConfig.value };
};

export default {
  addBannerImage,
  deleteBannerImage,
  getBannerImages,
  reorderBannerImages,
};

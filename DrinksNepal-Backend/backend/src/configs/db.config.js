import mongoose from "mongoose";
import logger from "./logger.config.js";

/**
 * Connects to MongoDB using the URI specified in the environment variables.
 * Logs the connection status and exits the process if an error occurs.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} If unable to connect to MongoDB
 */
const connectDB = async () => {
  try {
    logger.info(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;

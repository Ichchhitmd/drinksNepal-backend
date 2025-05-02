import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Configures and creates a Winston logger with daily log rotation and console output.
 * Handles unhandled rejections and uncaught exceptions.
 * @module logger
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a logs directory if it doesn't exist
 */
const logsDirectory = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

/**
 * Creates a daily rotate file transport for log files
 */
const transport = new DailyRotateFile({
  filename: path.join(logsDirectory, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
  level: "info",
});

/**
 * Creates and configures the Winston logger
 */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

/**
 * Handles unhandled rejections
 */
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

/**
 * Handles uncaught exceptions
 */
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception thrown:", error);
  process.exit(1); // Exit the process after logging the error
});

export default logger;

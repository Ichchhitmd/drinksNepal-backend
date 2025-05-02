import logger from "../configs/logger.config.js";
import responseDTO from "../dtos/responseDTO.js";

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json(responseDTO(statusCode, "error", null, message));
};

export default errorHandler;

import logger from "../configs/logger.config.js";
import User from "../models/models.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Middleware to authenticate user requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Access token is missing" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token is malformed" });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.access_token !== token) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Error in authenticateMiddleware:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export default authenticateMiddleware;

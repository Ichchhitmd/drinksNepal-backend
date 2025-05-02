import logger from "../configs/logger.config.js";
import { DrinksNepalConfig, Product, User } from "../models/models.js";
import orderService from "./order.service.js";
/**
 * Fetch analytics data including total sales, orders, products and customers
 * @returns {Promise<Object>} Analytics data
 */
const getAnalytics = async () => {
  try {
    // Get analytics data from DrinksNepalConfig
    const analyticsConfig = await DrinksNepalConfig.findOne({
      key: "analytics",
    });

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get total customers count
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // Get top 5 selling products
    const topProducts = await Product.aggregate([
      {
        $sort: { totalSales: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSales: 1,
        },
      },
    ]);

    return {
      totalSalesRevenue: analyticsConfig?.value?.totalSalesRevenue || 0,
      totalOrders: analyticsConfig?.value?.totalOrders || 0,
      totalProducts,
      totalCustomers,
      topProducts,
      recentOrders: await orderService.getRecentOrders(),
      monthlyRevenue: await orderService.getMonthlyRevenue(),
    };
  } catch (error) {
    logger.error(`Error fetching analytics: ${error.message}`);
    throw error;
  }
};

export default {
  getAnalytics,
};

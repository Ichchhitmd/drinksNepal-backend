export const BASE_URL = "http://localhost:8001";

const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${BASE_URL}/api/auth/login-admin`,
  AUTHENTICATE: `${BASE_URL}/api/auth/authenticate`,

  // Order endpoints
  CREATE_EXCHANGE_RATE: `${BASE_URL}/api/orders/exchange-rate`,
  GET_CURRENT_EXCHANGE_RATE: `${BASE_URL}/api/orders/exchange-rate`,
  ORDERS: `${BASE_URL}/api/orders`,

  // Banner endpoints
  GET_BANNERS_URL: `${BASE_URL}/api/config/banners`,
  UPLOAD_BANNER_URL: `${BASE_URL}/api/config/banner`,
  DELETE_BANNER_URL: `${BASE_URL}/api/config/banner`,
  REORDER_BANNERS_URL: `${BASE_URL}/api/config/banners/reorder`,

  // Product endpoints
  POST_PRODUCTS: `${BASE_URL}/api/products/index`,
  SEARCH_PRODUCTS: `${BASE_URL}/api/products/search`,
  EXPORT_PRODUCTS: `${BASE_URL}/api/products/export`,
  GET_ALL_CATEGORIES: `${BASE_URL}/api/products/categories`,

  // User endpoints
  SEARCH_USERS: `${BASE_URL}/api/auth/search`,
  DELIVERY_USER: `${BASE_URL}/api/auth/delivery-user`,
  REDEEM_BALANCE: `${BASE_URL}/api/auth/redeem-balance`,

  // Analytics endpoints
  ANALYTICS: `${BASE_URL}/api/analytics`,
};

export default API_ENDPOINTS;

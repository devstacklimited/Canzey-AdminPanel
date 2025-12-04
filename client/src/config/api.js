/**
 * API Configuration
 * 
 * This file centralizes all API-related configuration.
 * It reads from environment variables and provides a single source of truth
 * for API endpoints throughout the application.
 */

// Get API base URL from environment variable, fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNIN: `${API_BASE_URL}/api/admin/signin`,
    SIGNUP: `${API_BASE_URL}/api/admin/signup`,
    LOGOUT: `${API_BASE_URL}/api/admin/logout`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    USER_INFO: `${API_BASE_URL}/api/admin/userinfo`,
  },
  
  // Admin endpoints
  ADMIN: {
    EDIT: `${API_BASE_URL}/api/admin/edit`,
    CUSTOMERS: `${API_BASE_URL}/api/admin/customers`,
    ADD_CUSTOMER: `${API_BASE_URL}/api/admin/customers`,
    UPDATE_CUSTOMER: (id) => `${API_BASE_URL}/api/admin/customers/${id}`,
    UPDATE_CUSTOMER_STATUS: (id) => `${API_BASE_URL}/api/admin/customers/${id}/status`,
    CUSTOMER_AVATAR: (id) => `${API_BASE_URL}/api/admin/customers/${id}/avatar`,
  },
  
  // Products endpoints
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/admin/products`,
    CREATE: `${API_BASE_URL}/api/admin/products`,
    GET: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/api/admin/products/${id}/status`,
  },
  
  // Users endpoints
  USERS: {
    LIST: `${API_BASE_URL}/api/users`,
    GET: (id) => `${API_BASE_URL}/api/users/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/users/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
  },
  
  // Customer endpoints
  CUSTOMER: {
    INFO: `${API_BASE_URL}/api/customer/info`,
    EDIT: `${API_BASE_URL}/api/customer/edit`,
  },
  
  // Profile endpoints
  PROFILE: {
    GET: `${API_BASE_URL}/api/auth/profile`,
  },
};

/**
 * Helper function to get authorization headers
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Helper function to get full headers including Content-Type
 * @returns {Object} Headers object with Authorization and Content-Type
 */
export const getJsonHeaders = () => {
  return {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
};

/**
 * Helper function to build image URL
 * @param {string} imagePath - Relative image path from server
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getAuthHeaders,
  getJsonHeaders,
  getImageUrl,
};

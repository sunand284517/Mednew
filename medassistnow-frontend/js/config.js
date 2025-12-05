/**
 * API Configuration
 * Central configuration for backend API
 */

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROTECTED: '/auth/protected',
    
    // Users
    USERS: '/users',
    USER_BY_ID: (id) => `/users/${id}`,
    
    // Pharmacies
    PHARMACIES: '/pharmacies',
    PHARMACY_BY_ID: (id) => `/pharmacies/${id}`,
    
    // Medicines
    MEDICINES: '/medicines',
    MEDICINE_BY_ID: (id) => `/medicines/${id}`,
    SEARCH_MEDICINES: '/search/medicines',
    
    // Inventory
    INVENTORY: '/inventory',
    INVENTORY_BY_PHARMACY: (pharmacyId) => `/inventory/pharmacy/${pharmacyId}`,
    INVENTORY_BY_ID: (id) => `/inventory/${id}`,
    
    // Orders
    ORDERS: '/orders',
    USER_ORDERS: (userId) => `/orders/user/${userId}`,
    PHARMACY_ORDERS: (pharmacyId) => `/orders/pharmacy/${pharmacyId}`,
    ORDER_STATUS: (id) => `/orders/${id}/status`,
    
    // Delivery
    DELIVERY: '/delivery',
    AVAILABLE_DELIVERY: '/delivery/available',
    DELIVERY_AVAILABILITY: (id) => `/delivery/${id}/availability`,
    
    // Health
    HEALTH: '/health'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

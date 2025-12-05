/**
 * Order API Service
 * Handle order-related API calls
 */

const OrderService = {
  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      const response = await API.post(API_CONFIG.ENDPOINTS.ORDERS, orderData);
      return response.data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  /**
   * Get user orders
   */
  async getUserOrders(userId) {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.USER_ORDERS(userId));
      return response.data.orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },
  
  /**
   * Get pharmacy orders
   */
  async getPharmacyOrders(pharmacyId) {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.PHARMACY_ORDERS(pharmacyId));
      return response.data.orders || [];
    } catch (error) {
      console.error('Error fetching pharmacy orders:', error);
      return [];
    }
  },
  
  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, deliveryPartnerId = null) {
    try {
      const payload = { status };
      if (deliveryPartnerId) {
        payload.deliveryPartnerId = deliveryPartnerId;
      }
      
      const response = await API.put(API_CONFIG.ENDPOINTS.ORDER_STATUS(orderId), payload);
      return response.data.order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrderService;
}

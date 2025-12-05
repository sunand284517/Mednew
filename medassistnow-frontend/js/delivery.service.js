/**
 * Delivery API Service
 * Handle delivery partner API calls
 */

const DeliveryService = {
  /**
   * Register delivery partner
   */
  async registerPartner(partnerData) {
    try {
      const response = await API.post(API_CONFIG.ENDPOINTS.DELIVERY, partnerData);
      return response.data.deliveryPartner;
    } catch (error) {
      console.error('Error registering delivery partner:', error);
      throw error;
    }
  },
  
  /**
   * Get available delivery partners
   */
  async getAvailablePartners() {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.AVAILABLE_DELIVERY);
      return response.data.partners || [];
    } catch (error) {
      console.error('Error fetching available partners:', error);
      return [];
    }
  },
  
  /**
   * Update availability status
   */
  async updateAvailability(partnerId, isAvailable) {
    try {
      const response = await API.put(
        API_CONFIG.ENDPOINTS.DELIVERY_AVAILABILITY(partnerId),
        { isAvailable }
      );
      return response.data.partner;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeliveryService;
}

/**
 * Pharmacy API Service
 * Handle pharmacy-related API calls
 */

const PharmacyService = {
  /**
   * Get all pharmacies
   */
  async getAllPharmacies() {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.PHARMACIES);
      return response.data.pharmacies || [];
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      return [];
    }
  },
  
  /**
   * Get pharmacy by ID
   */
  async getPharmacyById(id) {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.PHARMACY_BY_ID(id));
      return response.data.pharmacy;
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
      throw error;
    }
  },
  
  /**
   * Create pharmacy
   */
  async createPharmacy(pharmacyData) {
    try {
      const response = await API.post(API_CONFIG.ENDPOINTS.PHARMACIES, pharmacyData);
      return response.data.pharmacy;
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  },
  
  /**
   * Update pharmacy
   */
  async updatePharmacy(id, pharmacyData) {
    try {
      const response = await API.put(API_CONFIG.ENDPOINTS.PHARMACY_BY_ID(id), pharmacyData);
      return response.data.pharmacy;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      throw error;
    }
  },
  
  /**
   * Delete pharmacy
   */
  async deletePharmacy(id) {
    try {
      await API.delete(API_CONFIG.ENDPOINTS.PHARMACY_BY_ID(id));
      return true;
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      throw error;
    }
  },
  
  /**
   * Get pharmacy inventory
   */
  async getPharmacyInventory(pharmacyId) {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.INVENTORY_BY_PHARMACY(pharmacyId));
      return response.data.inventory || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PharmacyService;
}

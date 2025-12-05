/**
 * Medicine API Service
 * Handle medicine-related API calls
 */

const MedicineService = {
  /**
   * Get all medicines
   */
  async getAllMedicines() {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.MEDICINES);
      return response.data.medicines || [];
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return [];
    }
  },
  
  /**
   * Search medicines
   */
  async searchMedicines(keyword) {
    try {
      const response = await API.get(`${API_CONFIG.ENDPOINTS.SEARCH_MEDICINES}?q=${keyword}`);
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  },
  
  /**
   * Get medicine by ID
   */
  async getMedicineById(id) {
    try {
      const response = await API.get(API_CONFIG.ENDPOINTS.MEDICINE_BY_ID(id));
      return response.data.medicine;
    } catch (error) {
      console.error('Error fetching medicine:', error);
      throw error;
    }
  },
  
  /**
   * Create medicine (pharmacy/admin)
   */
  async createMedicine(medicineData) {
    try {
      const response = await API.post(API_CONFIG.ENDPOINTS.MEDICINES, medicineData);
      return response.data.medicine;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error;
    }
  },
  
  /**
   * Update medicine
   */
  async updateMedicine(id, medicineData) {
    try {
      const response = await API.put(API_CONFIG.ENDPOINTS.MEDICINE_BY_ID(id), medicineData);
      return response.data.medicine;
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw error;
    }
  },
  
  /**
   * Delete medicine
   */
  async deleteMedicine(id) {
    try {
      await API.delete(API_CONFIG.ENDPOINTS.MEDICINE_BY_ID(id));
      return true;
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MedicineService;
}

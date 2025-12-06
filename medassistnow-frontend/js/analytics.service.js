/**
 * Analytics Service
 * Handles all API calls for analytics data
 */

class AnalyticsService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Get headers with authorization
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * Fetch top selling medicines
   */
  async getTopMedicines(timeRange = '30days', limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/medicines/top-selling?timeRange=${timeRange}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch top medicines');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching top medicines:', error);
      return [];
    }
  }

  /**
   * Fetch pharmacy analytics
   */
  async getPharmacyAnalytics(timeRange = '30days', limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/pharmacies/analytics?timeRange=${timeRange}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch pharmacy analytics');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching pharmacy analytics:', error);
      return [];
    }
  }

  /**
   * Fetch delivery partner analytics
   */
  async getDeliveryPartnerAnalytics(timeRange = '30days', limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/delivery-partners/analytics?timeRange=${timeRange}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch delivery partner analytics');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching delivery partner analytics:', error);
      return [];
    }
  }

  /**
   * Fetch medicine inventory analytics
   */
  async getMedicineInventoryAnalytics(limit = 15) {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/medicines/inventory?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch inventory analytics');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      return [];
    }
  }

  /**
   * Fetch dashboard summary
   */
  async getDashboardSummary(timeRange = '30days') {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/dashboard/summary?timeRange=${timeRange}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch dashboard summary');
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {};
    }
  }

  /**
   * Fetch hourly trends
   */
  async getHourlyTrends(timeRange = '24hours') {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/trends/hourly?timeRange=${timeRange}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch hourly trends');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching hourly trends:', error);
      return [];
    }
  }

  /**
   * Fetch category analytics
   */
  async getCategoryAnalytics(timeRange = '30days') {
    try {
      const response = await fetch(
        `${this.baseURL}/analytics/categories/analytics?timeRange=${timeRange}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) throw new Error('Failed to fetch category analytics');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      return [];
    }
  }
}

// Create global instance
const analyticsService = new AnalyticsService();

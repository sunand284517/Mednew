/**
 * API Client
 * HTTP request wrapper for backend API calls
 */

const API = {
  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...Auth.getAuthHeaders()
    };
    
    const config = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  
  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },
  
  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}

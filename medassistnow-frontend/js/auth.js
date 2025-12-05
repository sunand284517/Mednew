/**
 * Authentication Utilities
 * Handle JWT token storage and authentication with proper backend integration
 */

const Auth = {
  // Token storage key
  TOKEN_KEY: 'token',
  USER_CACHE_KEY: 'userCache', // Temporary cache only

  /**
   * Save authentication token
   */
  saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  /**
   * Get authentication token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Remove authentication token
   */
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_CACHE_KEY);
  },

  /**
   * Cache user data temporarily (NOT for authentication)
   */
  cacheUser(user) {
    localStorage.setItem(this.USER_CACHE_KEY, JSON.stringify(user));
  },

  /**
   * Get cached user data (for display only, not for auth decisions)
   */
  getCachedUser() {
    const user = localStorage.getItem(this.USER_CACHE_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Fetch authenticated user from backend
   * This is the SOURCE OF TRUTH for user data
   */
  async fetchUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      if (data.success && data.data && data.data.user) {
        // Cache for quick display
        this.cacheUser(data.data.user);
        return data.data.user;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Fetch user error:', error);
      this.removeToken();
      return null;
    }
  },

  /**
   * Get user data - tries cache first, then fetches from backend
   */
  getUser() {
    // Return cached version for immediate display
    // Check both 'userCache' and 'user' for compatibility
    let user = this.getCachedUser();
    if (!user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
    return user;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * Logout user
   */
  logout() {
    this.removeToken();
    window.location.href = '../index.html';
  },

  /**
   * Redirect if not authenticated
   */
  requireAuth(redirectUrl = 'login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}

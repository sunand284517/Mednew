/**
 * Authentication API Service
 * Handle login, register, and authentication
 */

const AuthService = {
  /**
   * Register new user
   */
  async register(userData) {
    try {
      console.log('AuthService.register - Sending data:', userData);
      const response = await API.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      console.log('AuthService.register - Response:', response);
      return response;
    } catch (error) {
      console.error('AuthService.register - Error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  /**
   * Login user
   */
  async login(credentials) {
    try {
      console.log('AuthService.login - Sending credentials to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`);
      console.log('AuthService.login - Credentials:', { email: credentials.email, passwordLength: credentials.password ? credentials.password.length : 0 });
      
      const response = await API.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      console.log('AuthService.login - Raw response:', response);
      
      if (response.success && response.data && response.data.token) {
        // Only store JWT token - user data will be fetched from backend
        Auth.saveToken(response.data.token);
        console.log('AuthService.login - Token saved successfully');
        
        // Cache user for immediate display (optional)
        if (response.data.user) {
          Auth.cacheUser(response.data.user);
          console.log('AuthService.login - User cached:', response.data.user);
        }
      } else {
        console.warn('AuthService.login - Response missing success or token:', response);
      }
      
      return response;
    } catch (error) {
      console.error('AuthService.login - Error caught:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  /**
   * Logout user
   */
  logout() {
    Auth.logout();
  },
  
  /**
   * Get current user
   */
  getCurrentUser() {
    return Auth.getUser();
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}

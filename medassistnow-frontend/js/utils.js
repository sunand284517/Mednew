/**
 * Utility Functions
 * Common helper functions for frontend
 */

const Utils = {
  /**
   * Show loading spinner
   */
  showLoading(elementId = 'loading') {
    let loader = document.getElementById(elementId);
    if (!loader) {
      // Create a global loader if it doesn't exist
      loader = document.createElement('div');
      loader.id = elementId;
      loader.innerHTML = '<div class="spinner"></div>';
      loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      `;
      const spinner = loader.querySelector('.spinner');
      spinner.style.cssText = `
        border: 4px solid #f3f3f3;
        border-top: 4px solid #0891b2;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      `;
      document.body.appendChild(loader);
      
      // Add keyframes animation if not already added
      if (!document.getElementById('spinner-styles')) {
        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    }
    loader.style.display = 'flex';
  },
  
  /**
   * Hide loading spinner
   */
  hideLoading(elementId = 'loading') {
    const loader = document.getElementById(elementId);
    if (loader) loader.style.display = 'none';
  },
  
  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  /**
   * Format currency
   */
  formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
  },
  
  /**
   * Validate email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * Get query parameter
   */
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

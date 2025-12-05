/**
 * Notification Service
 * Handles notification API calls and real-time updates
 */

const NotificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(limit = 20, unreadOnly = false) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { notifications: [], unreadCount: 0 };
      
      const params = new URLSearchParams({ limit, unreadOnly });
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      return data.data || { notifications: [], unreadCount: 0 };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  },
  
  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },
  
  /**
   * Clear all notifications
   */
  async clearAll() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  },
  
  /**
   * Format time ago
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  },
  
  /**
   * Play notification sound
   */
  playSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1dcXOFhYqGdmd4hYuLiod8cnh+hIiJioZ+d3d9goaHh4V9dHR6foOGhYOAfHZ2en6Bg4OBfnp2dXl8f4GBf3x5dnR3en2Af396eHZ0dnh7fX9+fHp4dXR2eHt9fn18enl3dnZ4ent8fHt6eXh3dnd5ent7e3p5eHd3d3l6e3t6enl4d3d3eHp6e3p6eXh3d3d4eXp6enl5eHd3d3d4eXl5eXl4eHd3d3d4eXl5eXh4d3d3d3h4eXl5eHh4d3d3d3h4eHl4eHh4d3d3d3h4eHh4eHh4d3d3d3d4eHh4eHh3d3d3d3d4eHh4eHd3d3d3d3d4eHh4d3d3d3d3d3h4eHh3d3d3d3d3d3h4eHd3d3d3d3d3d3h4d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  },
  
  /**
   * Request browser notification permission
   */
  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },
  
  /**
   * Show browser notification
   */
  showBrowserNotification(title, body, icon = '../assets/logos/favicon.png') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    }
  }
};

// Make available globally
window.NotificationService = NotificationService;

/**
 * Socket.IO Integration with Redis Pub/Sub
 * Bridges Redis Pub/Sub messages to Socket.IO clients
 */

const redisPubSub = require('../services/redis.pubsub.service');
const socketService = require('../services/socket.service');

/**
 * Initialize Socket.IO integration with Redis Pub/Sub
 * This bridges Redis Pub/Sub events to Socket.IO clients
 */
const initializeSocketIOIntegration = async () => {
  try {
    // Subscribe to Redis channels and forward to Socket.IO
    
    // Order updates
    await redisPubSub.subscribe('order:updates', (message) => {
      console.log('📡 Broadcasting order update via Socket.IO');
      socketService.broadcast('order:update', message);
      
      // Also emit to specific user
      if (message.userId) {
        socketService.emitToUser(message.userId, 'order:update', message);
      }
    });

    // User events
    await redisPubSub.subscribe('user:events', (message) => {
      console.log('📡 Broadcasting user event via Socket.IO');
      if (message.userId) {
        socketService.emitToUser(message.userId, 'user:event', message);
      }
    });

    // Medicine updates (stock, price changes)
    await redisPubSub.subscribe('medicine:updates', (message) => {
      console.log('📡 Broadcasting medicine update via Socket.IO');
      socketService.broadcast('medicine:update', message);
      
      // Notify pharmacies
      if (message.pharmacyId) {
        socketService.emitToRoom(`pharmacy:${message.pharmacyId}`, 'medicine:update', message);
      }
    });

    // Notifications - pattern matching for user-specific notifications
    await redisPubSub.pSubscribe('notifications:*', (message, channel) => {
      // Extract userId from channel (e.g., notifications:USER123)
      const userId = channel.split(':')[1];
      console.log(`📡 Sending notification to user ${userId} via Socket.IO`);
      socketService.emitToUser(userId, 'notification', message);
    });

    // New orders for pharmacies
    await redisPubSub.subscribe('pharmacy:new_orders', (message) => {
      console.log('📡 Broadcasting new order to pharmacies via Socket.IO');
      socketService.emitToRole('pharmacy', 'new:order', message);
      
      // Also emit to specific pharmacy
      if (message.pharmacyId) {
        socketService.emitToRoom(`pharmacy:${message.pharmacyId}`, 'new:order', message);
      }
    });

    // Delivery updates
    await redisPubSub.subscribe('delivery:updates', (message) => {
      console.log('📡 Broadcasting delivery update via Socket.IO');
      socketService.emitToRole('delivery', 'delivery:update', message);
      
      // Notify customer
      if (message.userId) {
        socketService.emitToUser(message.userId, 'delivery:update', message);
      }
    });

    console.log('✅ Socket.IO <-> Redis Pub/Sub integration initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Socket.IO integration:', error.message);
    throw error;
  }
};

module.exports = { initializeSocketIOIntegration };

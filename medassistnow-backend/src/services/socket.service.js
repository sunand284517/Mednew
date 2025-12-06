/**
 * Socket.IO Service
 * Real-time bidirectional communication using Socket.IO
 */

let io = null;

/**
 * Initialize Socket.IO with HTTP server
 * @param {Server} server - HTTP server instance
 */
const initializeSocketIO = (server) => {
  const socketIO = require('socket.io');
  
  io = socketIO(server, {
    cors: {
      origin: '*', // In production, specify allowed origins
      methods: ['GET', 'POST']
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle user authentication/identification
    socket.on('authenticate', (data) => {
      const { userId, role } = data;
      socket.userId = userId;
      socket.role = role;
      
      // Join user-specific room
      socket.join(`user:${userId}`);
      
      // Join role-specific room
      if (role) {
        socket.join(`role:${role}`);
      }
      
      console.log(`✅ User authenticated: ${userId} (${role})`);
      socket.emit('authenticated', { success: true, userId });
    });

    // Handle room subscriptions
    socket.on('subscribe', (channel) => {
      socket.join(channel);
      console.log(`📡 Client ${socket.id} subscribed to: ${channel}`);
      socket.emit('subscribed', { channel });
    });

    // Handle unsubscribe
    socket.on('unsubscribe', (channel) => {
      socket.leave(channel);
      console.log(`📴 Client ${socket.id} unsubscribed from: ${channel}`);
      socket.emit('unsubscribed', { channel });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO() first.');
  }
  return io;
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📤 Broadcast: ${event}`);
  }
};

/**
 * Emit event to specific room/channel
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`📤 Emit to room ${room}: ${event}`);
  }
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    console.log(`📤 Emit to user ${userId}: ${event}`);
  }
};

/**
 * Emit event to specific role
 * @param {string} role - Role name (admin, pharmacy, delivery, user)
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    console.log(`📤 Emit to role ${role}: ${event}`);
  }
};

/**
 * Get connected clients count
 */
const getConnectedClientsCount = () => {
  if (io) {
    return io.sockets.sockets.size;
  }
  return 0;
};

module.exports = {
  initializeSocketIO,
  getIO,
  broadcast,
  emitToRoom,
  emitToUser,
  emitToRole,
  getConnectedClientsCount
};

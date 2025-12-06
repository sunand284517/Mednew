/**
 * Queue Worker
 * Consumes messages from RabbitMQ queues
 */

const { connectRabbitMQ } = require('../config/rabbitmq');
const rabbitmqService = require('../services/rabbitmq.service');
const redisPubSub = require('../services/redis.pubsub.service');
const { initializeSocketIOIntegration } = require('../services/socket.integration');

// Queue handlers
const emailQueue = require('../queues/email.queue');
const orderQueue = require('../queues/order.queue');
const notificationQueue = require('../queues/notification.queue');

/**
 * Start all queue workers
 */
const startWorkers = async () => {
  try {
    console.log('🚀 Starting queue workers...');

    // Connect to RabbitMQ
    await connectRabbitMQ();
    await rabbitmqService.initialize();

    // Initialize Redis Pub/Sub
    await redisPubSub.initialize();

    // Initialize Socket.IO integration (if running alongside server)
    // Note: This is optional for worker, mainly for server process
    // await initializeSocketIOIntegration();

    // Start consuming queues
    await emailQueue.processQueue();
    await orderQueue.processQueue();
    await notificationQueue.processQueue();

    console.log('✅ All queue workers started successfully');
    console.log('📊 Monitoring queues:');
    console.log('  - Email Queue');
    console.log('  - Order Queue');
    console.log('  - Notification Queue');

    // Subscribe to Redis channels for real-time events
    await redisPubSub.subscribe('order:updates', (message) => {
      console.log('📡 Order update received:', message);
    });

    await redisPubSub.subscribe('user:events', (message) => {
      console.log('📡 User event received:', message);
    });

  } catch (error) {
    console.error('❌ Failed to start queue workers:', error.message);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  console.log('\n⏳ Shutting down workers...');
  
  try {
    await redisPubSub.disconnect();
    console.log('✅ Workers shut down successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start workers
startWorkers();

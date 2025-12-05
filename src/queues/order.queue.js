/**
 * Order Queue Handler
 * Processes order-related tasks from RabbitMQ
 */

const rabbitmqService = require('../services/rabbitmq.service');
const redisPubSub = require('../services/redis.pubsub.service');

class OrderQueue {
  constructor() {
    this.queueName = rabbitmqService.queues.ORDER;
  }

  /**
   * Add order processing task to queue
   */
  async processOrder(orderData) {
    const message = {
      orderId: orderData.orderId,
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    return await rabbitmqService.sendToQueue(this.queueName, message, { priority: 8 });
  }

  /**
   * Add order confirmation task
   */
  async confirmOrder(orderId, orderDetails) {
    const message = {
      type: 'confirm',
      orderId,
      orderDetails,
      timestamp: new Date().toISOString()
    };

    return await rabbitmqService.sendToQueue(this.queueName, message, { priority: 9 });
  }

  /**
   * Add order cancellation task
   */
  async cancelOrder(orderId, reason) {
    const message = {
      type: 'cancel',
      orderId,
      reason,
      timestamp: new Date().toISOString()
    };

    return await rabbitmqService.sendToQueue(this.queueName, message, { priority: 7 });
  }

  /**
   * Process order queue (consumer)
   */
  async processQueue() {
    await rabbitmqService.consumeQueue(this.queueName, async (message) => {
      console.log('📦 Processing order task:', message);

      try {
        switch (message.type) {
          case 'confirm':
            await this.handleOrderConfirmation(message);
            break;
          case 'cancel':
            await this.handleOrderCancellation(message);
            break;
          default:
            await this.handleOrderProcessing(message);
        }

        // Publish event to Redis Pub/Sub for real-time updates
        await redisPubSub.publish('order:updates', {
          orderId: message.orderId,
          status: message.type || 'processed',
          timestamp: new Date().toISOString()
        });

        console.log(`✅ Order task completed: ${message.orderId}`);
      } catch (error) {
        console.error('❌ Order processing failed:', error.message);
        throw error;
      }
    });
  }

  /**
   * Handle order processing
   */
  async handleOrderProcessing(orderData) {
    // Simulate order processing logic
    console.log(`🔄 Processing order: ${orderData.orderId}`);
    await this.delay(2000);
    
    // Update order status in database
    // await Order.findByIdAndUpdate(orderData.orderId, { status: 'processing' });
    
    return true;
  }

  /**
   * Handle order confirmation
   */
  async handleOrderConfirmation(data) {
    console.log(`✅ Confirming order: ${data.orderId}`);
    await this.delay(1000);
    
    // Update order status
    // await Order.findByIdAndUpdate(data.orderId, { status: 'confirmed' });
    
    return true;
  }

  /**
   * Handle order cancellation
   */
  async handleOrderCancellation(data) {
    console.log(`❌ Cancelling order: ${data.orderId}`);
    await this.delay(1000);
    
    // Update order status
    // await Order.findByIdAndUpdate(data.orderId, { status: 'cancelled', cancelReason: data.reason });
    
    return true;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new OrderQueue();

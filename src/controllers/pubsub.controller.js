/**
 * Pub/Sub Controller
 * API endpoints to interact with Redis Pub/Sub
 */

const redisPubSub = require('../services/redis.pubsub.service');

/**
 * Publish message to channel
 */
exports.publishMessage = async (req, res) => {
  try {
    const { channel, message } = req.body;

    if (!channel || !message) {
      return res.status(400).json({
        success: false,
        message: 'Channel and message are required'
      });
    }

    await redisPubSub.publish(channel, message);

    res.status(200).json({
      success: true,
      message: 'Message published successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Broadcast order update
 */
exports.broadcastOrderUpdate = async (req, res) => {
  try {
    const { orderId, status, details } = req.body;

    const message = {
      orderId,
      status,
      details,
      timestamp: new Date().toISOString()
    };

    await redisPubSub.publish('order:updates', message);

    res.status(200).json({
      success: true,
      message: 'Order update broadcasted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Broadcast user event
 */
exports.broadcastUserEvent = async (req, res) => {
  try {
    const { userId, event, data } = req.body;

    const message = {
      userId,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    await redisPubSub.publish('user:events', message);

    res.status(200).json({
      success: true,
      message: 'User event broadcasted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Broadcast medicine update (e.g., stock changes)
 */
exports.broadcastMedicineUpdate = async (req, res) => {
  try {
    const { medicineId, pharmacyId, stock, action } = req.body;

    const message = {
      medicineId,
      pharmacyId,
      stock,
      action, // 'stock_update', 'price_change', 'new_medicine'
      timestamp: new Date().toISOString()
    };

    await redisPubSub.publish('medicine:updates', message);

    res.status(200).json({
      success: true,
      message: 'Medicine update broadcasted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Test pub/sub functionality
 */
exports.testPubSub = async (req, res) => {
  try {
    const testChannel = 'test:channel';
    const testMessage = {
      message: 'Hello from Redis Pub/Sub!',
      timestamp: new Date().toISOString()
    };

    await redisPubSub.publish(testChannel, testMessage);

    res.status(200).json({
      success: true,
      message: 'Test message published',
      data: { channel: testChannel, message: testMessage }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

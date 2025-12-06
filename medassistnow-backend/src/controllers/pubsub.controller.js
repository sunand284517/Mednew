/*
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






















































































































};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      data: { channel: testChannel, message: testMessage }      message: 'Test message published',      success: true,
n    res.status(200).json({
n    await redisPubSub.publish(testChannel, testMessage);    };      timestamp: new Date().toISOString()      message: 'Hello from Redis Pub/Sub!',    const testMessage = {    const testChannel = 'test:channel';  try {exports.testPubSub = async (req, res) => { */ * Test pub/sub functionality/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Medicine update broadcasted'      success: true,
n    res.status(200).json({
n    await redisPubSub.publish('medicine:updates', message);    };      timestamp: new Date().toISOString()      action, // 'stock_update', 'price_change', 'new_medicine'      stock,      pharmacyId,      medicineId,
n    const message = {    const { medicineId, pharmacyId, stock, action } = req.body;  try {exports.broadcastMedicineUpdate = async (req, res) => { */ * Broadcast medicine update (e.g., stock changes)/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'User event broadcasted'      success: true,
n    res.status(200).json({
n    await redisPubSub.publish('user:events', message);    };      timestamp: new Date().toISOString()      data,      event,      userId,
n    const message = {    const { userId, event, data } = req.body;  try {exports.broadcastUserEvent = async (req, res) => { */ * Broadcast user event/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Order update broadcasted'      success: true,
n    res.status(200).json({
n    await redisPubSub.publish('order:updates', message);    };      timestamp: new Date().toISOString()      details,      status,      orderId,
n    const message = {    const { orderId, status, details } = req.body;  try {exports.broadcastOrderUpdate = async (req, res) => { */ * Broadcast order update/**};  }    });      message: error.message      success: false,    res.status(500).json({  } catch (error) {    });      message: 'Message published successfully'      success: true,
n    res.status(200).json({
n    await redisPubSub.publish(channel, message);    }      });        message: 'Channel and message are required'        success: false,      return res.status(400).json({n    if (!channel || !message) {
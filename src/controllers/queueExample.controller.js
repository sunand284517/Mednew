/**
 * Queue Example Controller
 * Demonstrates sending messages to RabbitMQ queue
 */

const { sendToQueue } = require('../services/queue.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Send message to sample queue
 * POST /api/queue/send
 * Body: { message: "hello" }
 */
const sendMessage = async (req, res, next) => {
  try {
    // Get message from request body
    const { message } = req.body;
    
    // Validate input
    if (!message) {
      return errorResponse(res, 'Message is required', 400);
    }
    
    // Queue name
    const queueName = 'sample_queue';
    
    // Prepare payload
    const payload = {
      message: message,
      timestamp: new Date().toISOString(),
      source: 'queue-example-controller'
    };
    
    // Send to queue
    await sendToQueue(queueName, payload);
    
    // Return success response
    return successResponse(res, 'Message queued successfully', {
      status: 'queued',
      queue: queueName,
      payload: payload
    }, 201);
    
  } catch (error) {
    console.error('❌ Queue send error:', error);
    next(error);
  }
};

/**
 * Send bulk messages to queue (bonus endpoint)
 * POST /api/queue/send-bulk
 * Body: { messages: ["msg1", "msg2", "msg3"], count: 5 }
 */
const sendBulkMessages = async (req, res, next) => {
  try {
    const { messages, count } = req.body;
    
    if (!messages && !count) {
      return errorResponse(res, 'Either messages array or count is required', 400);
    }
    
    const queueName = 'sample_queue';
    const sentMessages = [];
    
    // Send array of messages
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        const payload = {
          message: msg,
          timestamp: new Date().toISOString()
        };
        await sendToQueue(queueName, payload);
        sentMessages.push(payload);
      }
    }
    
    // Send N identical messages (for testing)
    if (count && typeof count === 'number') {
      for (let i = 1; i <= count; i++) {
        const payload = {
          message: `Test message ${i}`,
          timestamp: new Date().toISOString(),
          index: i
        };
        await sendToQueue(queueName, payload);
        sentMessages.push(payload);
      }
    }
    
    return successResponse(res, `${sentMessages.length} messages queued successfully`, {
      status: 'queued',
      queue: queueName,
      count: sentMessages.length,
      messages: sentMessages
    }, 201);
    
  } catch (error) {
    console.error('❌ Bulk queue send error:', error);
    next(error);
  }
};

module.exports = {
  sendMessage,
  sendBulkMessages
};

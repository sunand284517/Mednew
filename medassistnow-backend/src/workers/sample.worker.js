/**
 * Sample Worker
 * Demonstrates RabbitMQ message consumption
 * This is a simple worker for college project demonstration
 */

const { connectRabbitMQ } = require('../config/rabbitmq');

// Queue name
const QUEUE_NAME = 'sample_queue';

/**
 * Start the sample worker
 */
const startSampleWorker = async () => {
  try {
    console.log('========================================');
    console.log('🔧 Starting Sample Worker...');
    console.log('========================================');
    
    // Connect to RabbitMQ
    const { channel } = await connectRabbitMQ();
    
    // Assert queue exists
    await channel.assertQueue(QUEUE_NAME, {
      durable: true
    });
    
    console.log(`✅ Worker connected to queue: "${QUEUE_NAME}"`);
    console.log('⏳ Waiting for messages...');
    console.log('========================================');
    
    // Set prefetch to 1 - process one message at a time
    channel.prefetch(1);
    
    // Start consuming messages
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          // Parse message content
          const content = msg.content.toString();
          console.log('\n📥 Worker received message:', content);
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(content);
            console.log('📦 Parsed data:', jsonData);
          } catch {
            console.log('📝 Plain text message:', content);
          }
          
          // Simulate processing work
          console.log('⚙️  Processing message...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          
          console.log('✅ Message processed successfully\n');
          
          // Acknowledge message (remove from queue)
          channel.ack(msg);
          
        } catch (error) {
          console.error('❌ Error processing message:', error.message);
          // Reject message and requeue it
          channel.nack(msg, false, true);
        }
      }
    }, {
      noAck: false // Manual acknowledgment
    });
    
  } catch (error) {
    console.error('❌ Worker startup failed:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Worker shutting down...');
  process.exit(0);
});

// Start the worker if this file is run directly
if (require.main === module) {
  startSampleWorker();
}

module.exports = { startSampleWorker };

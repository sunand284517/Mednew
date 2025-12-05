/**
 * Reset RabbitMQ Queues
 * This script deletes existing queues so they can be recreated with new properties
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

const QUEUES = [
  'email_queue',
  'order_queue',
  'notification_queue',
  'payment_queue',
  'data_sync_queue'
];

async function resetQueues() {
  let connection;
  let channel;

  try {
    console.log('🔄 Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log('✅ Connected to RabbitMQ\n');

    for (const queueName of QUEUES) {
      try {
        await channel.deleteQueue(queueName);
        console.log(`✅ Deleted queue: ${queueName}`);
      } catch (error) {
        if (error.message.includes('NOT_FOUND')) {
          console.log(`ℹ️  Queue does not exist: ${queueName}`);
        } else {
          console.error(`❌ Error deleting ${queueName}:`, error.message);
        }
      }
    }

    console.log('\n✅ All queues reset successfully!');
    console.log('💡 Now you can start the worker: npm run worker');

    await channel.close();
    await connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to reset queues:', error.message);
    if (channel) await channel.close();
    if (connection) await connection.close();
    process.exit(1);
  }
}

resetQueues();

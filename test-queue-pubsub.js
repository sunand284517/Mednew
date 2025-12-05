/**
 * Quick Test Script for Redis Pub/Sub and RabbitMQ
 * Run this after starting the server and worker
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`)
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRedisPubSub() {
  console.log('\n' + '='.repeat(50));
  log.info('Testing Redis Pub/Sub');
  console.log('='.repeat(50) + '\n');

  try {
    // Test basic pub/sub
    log.test('Test 1: Basic Pub/Sub');
    const pubsubTest = await axios.get(`${BASE_URL}/pubsub/test`);
    log.success('Basic pub/sub test passed');
    console.log('  Response:', pubsubTest.data);

    await delay(1000);

    // Test order broadcast
    log.test('Test 2: Broadcast Order Update');
    const orderBroadcast = await axios.post(`${BASE_URL}/pubsub/broadcast/order`, {
      orderId: 'ORD' + Date.now(),
      status: 'processing',
      details: { items: 3, total: 1500 }
    });
    log.success('Order broadcast successful');
    console.log('  Response:', orderBroadcast.data);

    await delay(1000);

    // Test user event
    log.test('Test 3: Broadcast User Event');
    const userEvent = await axios.post(`${BASE_URL}/pubsub/broadcast/user`, {
      userId: 'USER123',
      event: 'login',
      data: { timestamp: new Date().toISOString() }
    });
    log.success('User event broadcast successful');
    console.log('  Response:', userEvent.data);

  } catch (error) {
    log.error('Redis Pub/Sub test failed');
    console.error('  Error:', error.message);
  }
}

async function testRabbitMQ() {
  console.log('\n' + '='.repeat(50));
  log.info('Testing RabbitMQ Queues');
  console.log('='.repeat(50) + '\n');

  try {
    // Test email queue
    log.test('Test 1: Send Test Email');
    const emailTest = await axios.post(`${BASE_URL}/queue/email/test`, {
      to: 'test@example.com',
      subject: 'Test Email from RabbitMQ',
      body: 'This is an automated test email'
    });
    log.success('Email queued successfully');
    console.log('  Response:', emailTest.data);

    await delay(1000);

    // Test welcome email
    log.test('Test 2: Send Welcome Email');
    const welcomeEmail = await axios.post(`${BASE_URL}/queue/email/welcome`, {
      email: 'newuser@example.com',
      name: 'John Doe'
    });
    log.success('Welcome email queued successfully');
    console.log('  Response:', welcomeEmail.data);

    await delay(1000);

    // Test order processing
    log.test('Test 3: Process Order');
    const orderProcess = await axios.post(`${BASE_URL}/queue/order/process`, {
      orderId: 'ORD' + Date.now(),
      userId: 'USER123',
      items: [
        { medicineId: 'MED001', quantity: 2, price: 50 }
      ],
      totalAmount: 100
    });
    log.success('Order queued for processing');
    console.log('  Response:', orderProcess.data);

    await delay(1000);

    // Test notification
    log.test('Test 4: Send In-App Notification');
    const notification = await axios.post(`${BASE_URL}/queue/notification/send`, {
      userId: 'USER123',
      title: 'Order Confirmed',
      message: 'Your order has been confirmed and is being processed!',
      type: 'in_app'
    });
    log.success('Notification queued successfully');
    console.log('  Response:', notification.data);

    await delay(2000);

    // Get queue stats
    log.test('Test 5: Get Queue Statistics');
    const stats = await axios.get(`${BASE_URL}/queue/stats`);
    log.success('Queue statistics retrieved');
    console.log('  Queue Stats:', JSON.stringify(stats.data, null, 2));

  } catch (error) {
    log.error('RabbitMQ test failed');
    console.error('  Error:', error.message);
  }
}

async function runAllTests() {
  console.log('\n' + '🚀'.repeat(25));
  console.log('  REDIS PUB/SUB & RABBITMQ TEST SUITE');
  console.log('🚀'.repeat(25) + '\n');

  log.info('Make sure the following are running:');
  console.log('  1. Docker services (docker-compose up -d)');
  console.log('  2. Backend server (npm run dev)');
  console.log('  3. Queue worker (npm run worker)\n');

  await delay(2000);

  await testRedisPubSub();
  await delay(2000);
  await testRabbitMQ();

  console.log('\n' + '='.repeat(50));
  log.success('All tests completed!');
  console.log('='.repeat(50) + '\n');

  log.info('Check the worker terminal to see message processing logs');
  log.info('Check RabbitMQ UI at http://localhost:15672 (admin/admin)');
}

// Run tests
runAllTests().catch(error => {
  log.error('Test suite failed');
  console.error(error);
  process.exit(1);
});

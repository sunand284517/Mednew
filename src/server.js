/**
 * MedAssist Now - Backend Server
 * Real-Time Medicine Availability & Delivery System
 * College Project - 50 Marks
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const metricsMiddleware = require('./middleware/metrics.middleware');
const requestLogger = require('./middleware/requestLogger');

// Import configuration
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { connectElasticsearch } = require('./config/elasticsearch');
const { PORT, NODE_ENV } = require('./config/environment');
const { initializeSocketIO } = require('./services/socket.service');

// Import routes
const apiRoutes = require('./routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// ========================================
// Middleware Configuration
// ========================================

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware - Increased limit for prescription image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP request logger (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========================================
// Routes Configuration
// ========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MedAssist Now API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to MedAssist Now API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// ========================================
// Error Handling
// ========================================

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ========================================
// Server Initialization
// ========================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to Redis
    await connectRedis();
    
    // Connect to RabbitMQ
    await connectRabbitMQ();
    
    // Connect to Elasticsearch
    await connectElasticsearch();
    
    // Initialize Socket.IO
    const io = initializeSocketIO(server);
    
    // Make io available to routes
    app.set('io', io);
    
    // Start Express server
    server.listen(PORT, () => {
      console.log('========================================');
      console.log('🚀 MedAssist Now Backend Server');
      console.log('========================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log('========================================');
      console.log('🔗 MAIN ENDPOINTS:');
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   API: http://localhost:${PORT}/api/health`);
      console.log('========================================');
      console.log('🔐 AUTHENTICATION:');
      console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   Protected: GET http://localhost:${PORT}/api/auth/protected`);
      console.log('========================================');
      console.log('📦 CRUD ROUTES:');
      console.log(`   Users: http://localhost:${PORT}/api/users`);
      console.log(`   Pharmacies: http://localhost:${PORT}/api/pharmacies`);
      console.log(`   Medicines: http://localhost:${PORT}/api/medicines`);
      console.log(`   Inventory: http://localhost:${PORT}/api/inventory`);
      console.log(`   Orders: http://localhost:${PORT}/api/orders`);
      console.log(`   Delivery: http://localhost:${PORT}/api/delivery`);
      console.log('========================================');
      console.log('🛠️  INTEGRATION TESTS:');
      console.log(`   Redis Cache: GET http://localhost:${PORT}/api/cache/example`);
      console.log(`   RabbitMQ Queue: POST http://localhost:${PORT}/api/queue/send`);
      console.log(`   Elasticsearch: GET http://localhost:${PORT}/api/search/medicines?q=keyword`);
      console.log(`   Prometheus: GET http://localhost:${PORT}/api/metrics`);
      console.log(`   Winston Logs: GET http://localhost:${PORT}/api/log/test`);
      console.log(`   Pub/Sub Test: GET http://localhost:${PORT}/api/pubsub/test`);
      console.log(`   Broadcast Order: POST http://localhost:${PORT}/api/pubsub/broadcast/order`);
      console.log('========================================');
      console.log('🔌 SOCKET.IO:');
      console.log(`   WebSocket: ws://localhost:${PORT}`);
      console.log(`   Test: Open frontend and check browser console`);
      console.log('========================================');
      console.log('📬 QUEUE ENDPOINTS:');
      console.log(`   Process Order: POST http://localhost:${PORT}/api/queue/order/process`);
      console.log(`   Send Notification: POST http://localhost:${PORT}/api/queue/notification/send`);
      console.log(`   Pub/Sub Test: GET http://localhost:${PORT}/api/pubsub/test`);
      console.log(`   Broadcast Order: POST http://localhost:${PORT}/api/pubsub/broadcast/order`);
      console.log('========================================');
      console.log('💡 Worker: npm run worker (RabbitMQ consumer)');
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

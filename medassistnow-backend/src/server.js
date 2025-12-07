/*
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
const metricsMiddleware = require('./middleware/middleware/metrics.middleware');
const requestLogger = require('./middleware/middleware/requestLogger');

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

// Security middleware - Configure helmet with CSP allowing inline scripts for frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https://cdn.socket.io"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware - Increased limit for prescription image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory (frontend)
const path = require('path');
const fs = require('fs');

// Serve medassistnow-frontend if it exists
const frontendPath = path.join(__dirname, '../../medassistnow-frontend');
const publicPath = path.join(__dirname, '../public');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log(`📁 Serving frontend from: ${frontendPath}`);
}

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

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

// Root endpoint - serve frontend index if available, otherwise return API info
app.get('/', (req, res) => {
  const frontendIndex = path.join(frontendPath, 'index.html');
  const publicIndex = path.join(publicPath, 'index.html');

  if (fs.existsSync(frontendIndex)) {
    return res.sendFile(frontendIndex);
  }

  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }

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

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API requests that don't exist
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'API Route not found',
      path: req.originalUrl
    });
  } else {
    // Serve index.html for all other non-API routes (SPA routing)
    const frontendIndex = path.join(frontendPath, 'index.html');
    const publicIndex = path.join(publicPath, 'index.html');
    const indexToServe = fs.existsSync(frontendIndex) ? frontendIndex : publicIndex;

    if (!fs.existsSync(indexToServe)) {
      return res.status(404).json({
        success: false,
        message: 'Not Found'
      });
    }

    res.sendFile(indexToServe, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Failed to serve index'
        });
      }
    });
  }
});

// ========================================
// Error Handling
// ========================================

// 404 Not Found handler (if above routes don't match)
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

// ========================================
// Server Initialization
// ========================================

const startServer = async () => {
  try {
    console.log('Starting service connections...');
    
    // Connect to MongoDB with timeout
    let mongoConnected = false;
    try {
      await Promise.race([
        connectDB(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB connection timeout')), 8000))
      ]);
      mongoConnected = true;
    } catch (error) {
      console.warn('⚠️  MongoDB connection failed:', error.message);
      console.log('Continuing server startup...');
    }
    
    // Connect to Redis (non-blocking)
    try {
      await Promise.race([
        connectRedis(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
      ]);
    } catch (error) {
      console.warn('⚠️  Redis connection failed');
    }
    
    // Connect to RabbitMQ (non-blocking)
    try {
      await Promise.race([
        connectRabbitMQ(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('RabbitMQ connection timeout')), 5000))
      ]);
    } catch (error) {
      console.warn('⚠️  RabbitMQ connection failed');
    }
    
    // Connect to Elasticsearch (non-blocking)
    try {
      await Promise.race([
        connectElasticsearch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Elasticsearch connection timeout')), 5000))
      ]);
      
      // Initialize delivery index for Kibana visualizations
      try {
        const deliveryLogger = require('./services/delivery-logger.service');
        await deliveryLogger.initializeDeliveryIndex();
      } catch (error) {
        console.warn('⚠️  Failed to initialize delivery index:', error.message);
      }
    } catch (error) {
      console.warn('⚠️  Elasticsearch connection failed');
    }
    
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
    console.error('⚠️  Server startup error:', error.message);
    // Still try to start the server even if there are connection issues
    try {
      const io = initializeSocketIO(server);
      app.set('io', io);
      
      server.listen(PORT, () => {
        console.log('========================================');
        console.log('🚀 MedAssist Now Backend Server (Limited Mode)');
        console.log('========================================');
        console.log(`📡 Server running on port ${PORT}`);
        console.log('⚠️  Running with limited functionality due to service unavailability');
        console.log('========================================');
      });
    } catch (innerError) {
      console.error('❌ Cannot start server:', innerError.message);
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections (don't crash)
process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled Promise Rejection:', err.message || err);
  // Don't exit - let the server keep running
});

// Handle uncaught exceptions (don't crash)
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err.message || err);
  // Don't exit - let the server keep running
});

// Start the server
startServer();

module.exports = app;
/*
 * Environment Configuration
 * Centralized environment variables management
 */

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/medassistnow?authSource=admin',
  
  // Redis configuration (Not used yet)
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  
  // RabbitMQ configuration (Not used yet)
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
  
  // Elasticsearch configuration
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1d',
  
  // Prometheus configuration (Not used yet)
  PROMETHEUS_PORT: process.env.PROMETHEUS_PORT || 9090
};
/**
 * Prometheus Configuration
 * Setup metrics collection for monitoring
 */

const client = require('prom-client');

// Create a Registry to register metrics
const prometheusRegistry = new client.Registry();

// Collect default metrics (CPU, memory, event loop lag)
client.collectDefaultMetrics({ 
  register: prometheusRegistry,
  prefix: 'medassist_'
});

// Custom metric: HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'medassist_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry]
});

// Custom metric: HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: 'medassist_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry]
});

module.exports = {
  prometheusRegistry,
  httpRequestCounter,
  httpRequestDuration
};

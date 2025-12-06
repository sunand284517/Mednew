/*
 * Prometheus Configuration
 * Setup metrics collection for monitoring
 */

const client = require('prom-client');




























};  httpRequestDuration  httpRequestCounter,  prometheusRegistry,
nmodule.exports = {});  registers: [prometheusRegistry]  labelNames: ['method', 'route', 'status_code'],  help: 'Duration of HTTP requests in seconds',  name: 'medassist_http_request_duration_seconds',const httpRequestDuration = new client.Histogram({
n// Custom metric: HTTP request duration});  registers: [prometheusRegistry]  labelNames: ['method', 'route', 'status_code'],  help: 'Total number of HTTP requests',  name: 'medassist_http_requests_total',const httpRequestCounter = new client.Counter({// Custom metric: HTTP request counter});  prefix: 'medassist_'  register: prometheusRegistry,client.collectDefaultMetrics({ // Collect default metrics (CPU, memory, event loop lag)const prometheusRegistry = new client.Registry();n// Create a Registry to register metrics
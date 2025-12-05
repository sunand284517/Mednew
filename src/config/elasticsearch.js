/**
 * Elasticsearch Configuration
 * Setup connection to Elasticsearch for search functionality
 */

const { Client } = require('@elastic/elasticsearch');
const { ELASTICSEARCH_URL } = require('./environment');

// Create Elasticsearch client
const esClient = new Client({
  node: ELASTICSEARCH_URL
});

/**
 * Connect to Elasticsearch and verify connection
 */
const connectElasticsearch = async () => {
  try {
    const health = await esClient.cluster.health();
    console.log('✅ Elasticsearch Connected:', ELASTICSEARCH_URL);
    console.log(`📊 Cluster Status: ${health.status}`);
  } catch (error) {
    console.error('❌ Elasticsearch Connection Failed:', error.message);
    console.log('⚠️  Continuing without Elasticsearch...');
  }
};

/**
 * Disconnect from Elasticsearch
 */
const disconnectElasticsearch = async () => {
  try {
    await esClient.close();
    console.log('Elasticsearch connection closed');
  } catch (error) {
    console.error('Error closing Elasticsearch:', error.message);
  }
};

module.exports = {
  esClient,
  connectElasticsearch,
  disconnectElasticsearch
};

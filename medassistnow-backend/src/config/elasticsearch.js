/*
 * Elasticsearch Configuration
 * Setup connection to Elasticsearch for search functionality
 */

const { Client } = require('@elastic/elasticsearch');
const { ELASTICSEARCH_URL } = require('./environment');



































};  disconnectElasticsearch  connectElasticsearch,  esClient,
nmodule.exports = {};  }    console.error('Error closing Elasticsearch:', error.message);  } catch (error) {    console.log('Elasticsearch connection closed');    await esClient.close();  try {const disconnectElasticsearch = async () => { */ * Disconnect from Elasticsearch/**};  }    console.log('⚠️  Continuing without Elasticsearch...');    console.error('❌ Elasticsearch Connection Failed:', error.message);  } catch (error) {    console.log(`📊 Cluster Status: ${health.status}`);    console.log('✅ Elasticsearch Connected:', ELASTICSEARCH_URL);    const health = await esClient.cluster.health();  try {const connectElasticsearch = async () => { */ * Connect to Elasticsearch and verify connection/**});  node: ELASTICSEARCH_URLconst esClient = new Client({n// Create Elasticsearch client
/**
 * Search Service
 * Simple Elasticsearch operations for college project
 */

const { esClient } = require('../config/elasticsearch');

/**
 * Index a document in Elasticsearch
 * @param {String} index - Index name (e.g., "medicines")
 * @param {Object} body - Document data
 * @returns {Object} - Indexed document result
 * 
 * Example usage:
 * await indexDocument('medicines', {
 *   name: 'Paracetamol',
 *   brand: 'Crocin',
 *   price: 50
 * });
 */
const indexDocument = async (index, body) => {
  try {
    const result = await esClient.index({
      index: index,
      body: body
    });
    console.log(`✅ Document indexed in "${index}":`, result._id);
    return result;
  } catch (error) {
    console.error('❌ Error indexing document:', error.message);
    throw error;
  }
};

/**
 * Search documents in Elasticsearch
 * @param {String} index - Index name (e.g., "medicines")
 * @param {String} query - Search keyword
 * @returns {Array} - Array of matching documents
 * 
 * Example usage:
 * const results = await searchDocuments('medicines', 'paracetamol');
 */
const searchDocuments = async (index, query) => {
  try {
    const result = await esClient.search({
      index: index,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['*'] // Search in all fields
          }
        }
      }
    });
    
    // Extract source documents from hits
    const documents = result.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));
    
    console.log(`🔍 Found ${documents.length} results for "${query}"`);
    console.log('📦 First result:', JSON.stringify(documents[0], null, 2)); // Debug log
    return documents;
    
  } catch (error) {
    // If index doesn't exist, return empty array (college-friendly)
    if (error.meta && error.meta.statusCode === 404) {
      console.log(`⚠️  Index "${index}" not found. Returning empty results.`);
      return [];
    }
    console.error('❌ Error searching documents:', error.message);
    throw error;
  }
};

module.exports = {
  indexDocument,
  searchDocuments
};

/*
===========================================
HOW TO CREATE SAMPLE INDEX (For Testing)
===========================================

Option 1: Using CURL (Windows PowerShell)
------------------------------------------
# Create index with sample medicine data
Invoke-RestMethod -Uri "http://localhost:9200/medicines/_doc" -Method POST -ContentType "application/json" -Body '{
  "name": "Paracetamol",
  "brand": "Crocin",
  "price": 50,
  "category": "fever"
}'

Invoke-RestMethod -Uri "http://localhost:9200/medicines/_doc" -Method POST -ContentType "application/json" -Body '{
  "name": "Amoxicillin",
  "brand": "Novamox",
  "price": 120,
  "category": "antibiotic"
}'

Option 2: Using Kibana Dev Tools
---------------------------------
Open: http://localhost:5601 (if Kibana is running)
Go to: Dev Tools > Console
Run:

POST /medicines/_doc
{
  "name": "Paracetamol",
  "brand": "Crocin",
  "price": 50,
  "category": "fever"
}

POST /medicines/_doc
{
  "name": "Amoxicillin",
  "brand": "Novamox",
  "price": 120,
  "category": "antibiotic"
}

Option 3: Using the indexDocument function
-------------------------------------------
You can also use the indexDocument() function in your code
to add documents programmatically.

===========================================
*/

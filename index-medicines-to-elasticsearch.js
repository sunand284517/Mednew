/**
 * Index Medicines to Elasticsearch
 * This script indexes all medicines from MongoDB to Elasticsearch
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Client } = require('@elastic/elasticsearch');
const Medicine = require('./src/models/Medicine.model');
const Inventory = require('./src/models/Inventory.model');
const Pharmacy = require('./src/models/Pharmacy.model');

const ELASTICSEARCH_INDEX = 'medicines';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

// Create ES client with older version compatibility
const esClient = new Client({
  node: ELASTICSEARCH_URL,
  requestTimeout: 30000,
  maxRetries: 3
});

async function indexMedicinesToElasticsearch() {
  try {
    console.log('========================================');
    console.log('🔍 Elasticsearch Indexing Started');
    console.log('========================================\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medassist_now');
    console.log('✅ Connected to MongoDB\n');

    // Check Elasticsearch connection
    const esHealth = await esClient.cluster.health();
    console.log('✅ Connected to Elasticsearch');
    console.log(`   Status: ${esHealth.status}`);
    console.log(`   Cluster: ${esHealth.cluster_name}\n`);

    // Delete existing index if it exists
    try {
      const indexExists = await esClient.indices.exists({ index: ELASTICSEARCH_INDEX });
      if (indexExists) {
        console.log(`🗑️  Deleting existing index: ${ELASTICSEARCH_INDEX}`);
        await esClient.indices.delete({ index: ELASTICSEARCH_INDEX });
        console.log('✅ Index deleted\n');
      }
    } catch (error) {
      console.log('⚠️  Index does not exist, creating new one\n');
    }

    // Create index with proper mappings
    console.log(`📝 Creating index: ${ELASTICSEARCH_INDEX}`);
    await esClient.indices.create({
      index: ELASTICSEARCH_INDEX,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              medicine_analyzer: {
                type: 'standard',
                stopwords: '_english_'
              }
            }
          }
        },
        mappings: {
          properties: {
            name: {
              type: 'text',
              analyzer: 'medicine_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            description: {
              type: 'text',
              analyzer: 'medicine_analyzer'
            },
            category: {
              type: 'keyword'
            },
            price: {
              type: 'float'
            },
            stock: {
              type: 'integer'
            },
            pharmacy: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            availableAt: {
              type: 'nested',
              properties: {
                pharmacy: { type: 'keyword' },
                stock: { type: 'integer' },
                price: { type: 'float' }
              }
            }
          }
        }
      }
    });
    console.log('✅ Index created with mappings\n');

    // Fetch all medicines from MongoDB
    console.log('📊 Fetching medicines from MongoDB...');
    const medicines = await Medicine.find({});
    console.log(`✅ Found ${medicines.length} medicines\n`);

    if (medicines.length === 0) {
      console.log('⚠️  No medicines found in MongoDB!');
      console.log('💡 Run: npm run seed (to create sample medicines)\n');
      process.exit(0);
    }

    // Index each medicine with inventory data
    console.log('📤 Indexing medicines to Elasticsearch...\n');
    let indexed = 0;
    let failed = 0;

    for (const medicine of medicines) {
      try {
        // Get inventory for this medicine
        const inventory = await Inventory.find({ 
          medicineId: medicine._id 
        }).populate('pharmacyId', 'name address location');

        console.log(`   🔍 Medicine: ${medicine.name}, Inventory count: ${inventory.length}`);
        if (inventory.length > 0) {
          console.log(`      📦 First inventory: quantity=${inventory[0].quantity}, pharmacyId=${inventory[0].pharmacyId?.name}`);
        }

        const totalStock = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
        const firstPharmacy = inventory[0]?.pharmacyId?.name || 'Available';
        
        console.log(`      ✅ Total stock: ${totalStock}, Pharmacy: ${firstPharmacy}`);

        // Prepare document for Elasticsearch
        const document = {
          id: medicine._id.toString(),
          name: medicine.name,
          description: medicine.description,
          category: medicine.category,
          price: medicine.price,
          stock: totalStock,
          pharmacy: firstPharmacy,
          availableAt: inventory.map(inv => ({
            pharmacy: inv.pharmacyId?.name || 'Unknown',
            stock: inv.quantity || 0,
            price: inv.price || medicine.price
          }))
        };

        // Index to Elasticsearch
        await esClient.index({
          index: ELASTICSEARCH_INDEX,
          id: medicine._id.toString(),
          body: document
        });

        indexed++;
        console.log(`   ✅ [${indexed}/${medicines.length}] ${medicine.name}`);
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to index ${medicine.name}:`, error.message);
      }
    }

    // Refresh index to make documents searchable
    await esClient.indices.refresh({ index: ELASTICSEARCH_INDEX });
    console.log('\n🔄 Index refreshed\n');

    // Final summary
    console.log('========================================');
    console.log('✅ Indexing Complete!');
    console.log('========================================');
    console.log(`📊 Total Medicines: ${medicines.length}`);
    console.log(`✅ Successfully Indexed: ${indexed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('========================================');
    console.log('\n🔍 Test searches:');
    console.log('   GET /api/search/medicines?q=paracetamol');
    console.log('   GET /api/search/medicines?q=vitamin');
    console.log('   GET /api/search/medicines?q=fever');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Indexing failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run indexing
indexMedicinesToElasticsearch();

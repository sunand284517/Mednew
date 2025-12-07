/**
 * Delivery Logger Service
 * Logs delivery orders to Elasticsearch for Kibana visualization
 */

const { client: esClient } = require('../config/elasticsearch');

const DELIVERY_INDEX = 'delivery-orders';

/**
 * Initialize Elasticsearch index for delivery orders if it doesn't exist
 */
async function initializeDeliveryIndex() {
  try {
    // Check if index exists
    const indexExists = await esClient.indices.exists({ index: DELIVERY_INDEX });
    
    if (!indexExists) {
      // Create index with mapping
      await esClient.indices.create({
        index: DELIVERY_INDEX,
        body: {
          mappings: {
            properties: {
              orderId: { type: 'keyword' },
              deliveryPartnerId: { type: 'keyword' },
              partnerName: { type: 'text' },
              partnerPhone: { type: 'keyword' },
              status: { type: 'keyword' },
              pickupLocation: {
                type: 'geo_point'
              },
              deliveryLocation: {
                type: 'geo_point'
              },
              pickupAddress: { type: 'text' },
              deliveryAddress: { type: 'text' },
              orderTotal: { type: 'float' },
              deliveryFee: { type: 'float' },
              estimatedTime: { type: 'integer' },
              actualTime: { type: 'integer' },
              itemCount: { type: 'integer' },
              timestamp: { type: 'date' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              rating: { type: 'float' },
              feedback: { type: 'text' }
            }
          }
        }
      });
      
      console.log('✅ Delivery orders index created in Elasticsearch');
    }
  } catch (error) {
    console.error('❌ Error initializing delivery index:', error);
  }
}

/**
 * Log a delivery order to Elasticsearch
 */
async function logDeliveryOrder(orderData) {
  try {
    const document = {
      orderId: orderData._id || orderData.id,
      deliveryPartnerId: orderData.deliveryPartner?._id || orderData.deliveryPartnerId,
      partnerName: orderData.deliveryPartner?.name || 'Unknown',
      partnerPhone: orderData.deliveryPartner?.phone || '',
      status: orderData.status || 'pending',
      pickupAddress: orderData.pharmacy?.address ? 
        `${orderData.pharmacy.address.street}, ${orderData.pharmacy.address.city}` : '',
      deliveryAddress: orderData.deliveryAddress ? 
        `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}` : '',
      orderTotal: orderData.totalAmount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      itemCount: orderData.items?.length || 0,
      timestamp: new Date(),
      createdAt: orderData.createdAt || new Date(),
      updatedAt: orderData.updatedAt || new Date(),
      rating: orderData.deliveryRating || 0,
      feedback: orderData.deliveryFeedback || ''
    };

    const result = await esClient.index({
      index: DELIVERY_INDEX,
      id: document.orderId,
      body: document,
      refresh: true
    });

    console.log(`📝 Delivery order logged: ${document.orderId}`);
    return result;
  } catch (error) {
    console.error('❌ Error logging delivery order:', error);
  }
}

/**
 * Get delivery orders for a specific delivery partner
 */
async function getDeliveryPartnerOrders(partnerId, options = {}) {
  try {
    const { limit = 50, offset = 0, status = null } = options;

    const query = {
      bool: {
        must: [
          { match: { deliveryPartnerId: partnerId } }
        ]
      }
    };

    if (status) {
      query.bool.must.push({ match: { status } });
    }

    const result = await esClient.search({
      index: DELIVERY_INDEX,
      body: {
        query,
        size: limit,
        from: offset,
        sort: [{ createdAt: { order: 'desc' } }]
      }
    });

    return {
      total: result.hits.total.value,
      orders: result.hits.hits.map(hit => hit._source)
    };
  } catch (error) {
    console.error('❌ Error fetching delivery partner orders:', error);
    return { total: 0, orders: [] };
  }
}

/**
 * Get delivery analytics by partner
 */
async function getDeliveryAnalytics(timeRange = '30d') {
  try {
    const result = await esClient.search({
      index: DELIVERY_INDEX,
      body: {
        query: {
          range: {
            createdAt: {
              gte: `now-${timeRange}`
            }
          }
        },
        aggs: {
          by_partner: {
            terms: {
              field: 'deliveryPartnerId',
              size: 100
            },
            aggs: {
              partner_name: {
                terms: {
                  field: 'partnerName'
                }
              },
              total_deliveries: {
                value_count: {
                  field: 'orderId'
                }
              },
              completed_deliveries: {
                filter: {
                  term: { status: 'completed' }
                }
              },
              total_earnings: {
                sum: {
                  field: 'deliveryFee'
                }
              },
              avg_rating: {
                avg: {
                  field: 'rating'
                }
              },
              avg_delivery_time: {
                avg: {
                  field: 'actualTime'
                }
              }
            }
          }
        }
      }
    });

    const analytics = result.aggregations.by_partner.buckets.map(bucket => ({
      partnerId: bucket.key,
      partnerName: bucket.partner_name?.buckets[0]?.key || 'Unknown',
      totalDeliveries: bucket.total_deliveries.value,
      completedDeliveries: bucket.completed_deliveries.doc_count,
      completionRate: ((bucket.completed_deliveries.doc_count / bucket.total_deliveries.value) * 100).toFixed(2),
      totalEarnings: bucket.total_earnings.value?.toFixed(2) || 0,
      avgRating: bucket.avg_rating.value?.toFixed(2) || 0,
      avgDeliveryTime: Math.round(bucket.avg_delivery_time.value || 0)
    }));

    return analytics;
  } catch (error) {
    console.error('❌ Error fetching delivery analytics:', error);
    return [];
  }
}

/**
 * Update delivery order status in Elasticsearch
 */
async function updateDeliveryOrderStatus(orderId, status, additionalData = {}) {
  try {
    const updateBody = {
      status,
      updatedAt: new Date(),
      ...additionalData
    };

    const result = await esClient.update({
      index: DELIVERY_INDEX,
      id: orderId,
      body: {
        doc: updateBody,
        doc_as_upsert: true
      },
      refresh: true
    });

    console.log(`✅ Delivery order updated: ${orderId}`);
    return result;
  } catch (error) {
    console.error('❌ Error updating delivery order:', error);
  }
}

module.exports = {
  initializeDeliveryIndex,
  logDeliveryOrder,
  getDeliveryPartnerOrders,
  getDeliveryAnalytics,
  updateDeliveryOrderStatus
};

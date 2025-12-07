# Kibana Dashboard Integration - Delivery Orders Analytics

## Overview
Kibana has been integrated into MedAssist Now to provide visual analytics for delivery orders by delivery partner. This document provides a quick start guide.

## What's New

### 1. **Kibana Service** 
- Added Kibana 8.6.2 to docker-compose.yml
- Listens on port 5601
- Connects to Elasticsearch for data visualization

### 2. **Delivery Logger Service**
- New service: `src/services/delivery-logger.service.js`
- Automatically logs all delivery orders to Elasticsearch
- Provides analytics queries and aggregations

### 3. **Delivery Analytics API**
- New routes: `src/routes/delivery-analytics.routes.js`
- Endpoints:
  - `GET /api/delivery-analytics/partner-orders/:partnerId` - Get orders by partner
  - `GET /api/delivery-analytics/summary` - Get analytics summary
  - `GET /api/delivery-analytics/kibana-info` - Get setup instructions

### 4. **Migration Script**
- `migrate-delivery-orders.js` - Migrates existing orders to Elasticsearch

## Quick Start

### Step 1: Start All Services
```bash
cd Mednew
docker-compose up -d
```

### Step 2: Access Kibana
```
Open browser: http://localhost:5601
```

### Step 3: Create Index Pattern
1. Go to **Stack Management** → **Index Patterns**
2. Click **Create index pattern**
3. Enter: `delivery-orders*`
4. Select **timestamp** as time field
5. Click **Create**

### Step 4: View Delivery Orders
1. Go to **Analytics** → **Discover**
2. Select `delivery-orders` pattern
3. View all logged delivery orders

### Step 5 (Optional): Migrate Existing Data
```bash
cd medassistnow-backend
node migrate-delivery-orders.js
```

## Architecture

```
Application
    ↓
Delivery Order Created/Updated
    ↓
Delivery Logger Service
    ↓
Elasticsearch (delivery-orders index)
    ↓
Kibana Dashboard
```

## Key Features

### 📊 Available Metrics
- Total deliveries by partner
- Completion rate
- Total earnings
- Average rating
- Average delivery time
- Order status breakdown

### 🎯 Available Filters
- Delivery partner ID/name
- Order status (pending, in-transit, completed, cancelled)
- Date range
- Rating (0-5 stars)
- Delivery fee range

### 📈 Visualization Types
- Bar charts (deliveries by partner)
- Pie/Donut charts (status distribution)
- Metric cards (KPIs)
- Tables (detailed orders)
- Heat maps (delivery times)
- Geo maps (pickup/delivery locations)

## API Endpoints

### 1. Get Partner Orders
```bash
curl -X GET "http://localhost:5000/api/delivery-analytics/partner-orders/PARTNER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Analytics Summary
```bash
curl -X GET "http://localhost:5000/api/delivery-analytics/summary?timeRange=30d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Kibana Information
```bash
curl -X GET "http://localhost:5000/api/delivery-analytics/kibana-info" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Sample Queries for Kibana

### Find Completed Orders
```
status: "completed"
```

### Find Orders with Rating >= 4.5
```
rating: >= 4.5
```

### Find Orders by Specific Partner
```
partnerName: "John Doe"
```

### Find Recent Orders (Last 7 Days)
```
createdAt: [now-7d TO now]
```

## Dashboard Examples

### 1. Delivery Partner Performance Dashboard
- Total deliveries (metric)
- Completion rate (gauge)
- Average rating (metric)
- Orders by status (pie chart)
- Earnings over time (line chart)

### 2. Delivery Quality Dashboard
- Average delivery time (metric)
- Rating distribution (bar chart)
- Top-rated partners (table)
- Low-rated orders (filtered table)

### 3. Business Analytics Dashboard
- Total earnings (metric)
- Revenue by partner (bar chart)
- Delivery fee trends (line chart)
- Top performers (table)

## Troubleshooting

### Kibana not accessible
```bash
# Check Kibana container
docker logs kibana_server

# Check Elasticsearch connection
curl http://localhost:9200
```

### No data in Kibana
```bash
# Verify index exists
curl http://localhost:9200/_cat/indices

# Check document count
curl http://localhost:9200/delivery-orders/_count
```

### Index pattern error
```bash
# Manually check index
curl http://localhost:9200/delivery-orders
```

## File Structure

```
├── docker-compose.yml                          (Updated with Kibana)
├── KIBANA_SETUP.md                             (Detailed setup guide)
├── medassistnow-backend/
│   ├── migrate-delivery-orders.js              (Migration script)
│   ├── src/
│   │   ├── services/
│   │   │   └── delivery-logger.service.js      (New: Logger service)
│   │   └── routes/
│   │       └── delivery-analytics.routes.js    (New: Analytics routes)
│   └── src/server.js                           (Updated: Initialize index)
```

## Admin Dashboard Integration

The admin analytics dashboard can now use the new API endpoints:

```javascript
// In admin dashboard
const analyticsData = await fetch('/api/delivery-analytics/summary?timeRange=30d', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Display delivery partner analytics
console.log(analyticsData.data.partners);
```

## Next Steps

1. ✅ **View data in Kibana** - http://localhost:5601
2. ✅ **Create custom dashboards** for each delivery partner
3. ✅ **Set up alerts** for low ratings
4. ✅ **Export reports** for performance reviews
5. ✅ **Integrate metrics** into admin dashboard

## Support

- **Kibana Docs**: https://www.elastic.co/guide/en/kibana/current/
- **Elasticsearch Docs**: https://www.elastic.co/guide/en/elasticsearch/reference/
- **Project README**: See root README.md

---

**Status**: ✅ Kibana integration complete and ready to use!

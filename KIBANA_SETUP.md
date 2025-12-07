# Kibana Dashboard Setup Guide - Delivery Orders Analytics

## Overview
Kibana is now integrated to visualize delivery orders by delivery partner. This guide will help you set up and use the Kibana dashboard.

## Prerequisites
- Docker and Docker Compose installed
- MedAssist Now backend running
- Elasticsearch and Kibana services running

## Starting Kibana

### Step 1: Start All Services
```bash
cd c:\Users\sunan\Downloads\Mednew-main\Mednew
docker-compose up -d
```

### Step 2: Verify Services
```bash
docker-compose ps
```

You should see:
- ✅ elasticsearch_server (port 9200)
- ✅ kibana_server (port 5601)
- ✅ Other services (MongoDB, Redis, RabbitMQ, Prometheus)

### Step 3: Access Kibana
Open your browser and navigate to:
```
http://localhost:5601
```

## Setting Up Index Pattern

### Step 1: Create Index Pattern
1. Go to **Menu** (hamburger icon) → **Stack Management** → **Index Patterns**
2. Click **Create index pattern**
3. Enter pattern name: `delivery-orders*`
4. Click **Next step**
5. Select **@timestamp** as the Time field (if available) or **timestamp**
6. Click **Create index pattern**

### Step 2: Explore Data
1. Go to **Analytics** → **Discover**
2. Select **delivery-orders** index pattern from dropdown
3. You'll see all delivery orders logged from your application

## Available Fields for Analysis

| Field | Type | Description |
|-------|------|-------------|
| **orderId** | keyword | Unique order identifier |
| **deliveryPartnerId** | keyword | Delivery partner ID |
| **partnerName** | text | Delivery partner name |
| **partnerPhone** | keyword | Delivery partner phone |
| **status** | keyword | Order status (pending, in-transit, completed, cancelled) |
| **pickupAddress** | text | Pharmacy pickup address |
| **deliveryAddress** | text | Customer delivery address |
| **orderTotal** | float | Total order amount |
| **deliveryFee** | float | Delivery fee charged |
| **itemCount** | integer | Number of items in order |
| **rating** | float | Delivery rating (0-5 stars) |
| **feedback** | text | Delivery feedback/comments |
| **actualTime** | integer | Actual delivery time in minutes |
| **timestamp** | date | When order was logged |
| **createdAt** | date | When order was created |
| **updatedAt** | date | When order was last updated |

## Creating Visualizations

### Example 1: Orders by Delivery Partner
1. Click **Create visualization** (in Discover)
2. Choose visualization type: **Pie chart** or **Bar chart**
3. Configure:
   - **Metrics**: Count of documents
   - **Buckets**: Terms aggregation on `deliveryPartnerId`
4. Click **Update**

### Example 2: Total Earnings by Partner
1. Create new visualization
2. Choose: **Vertical bar**
3. Configure:
   - **Metrics**: Sum of `deliveryFee`
   - **Buckets**: Terms on `deliveryPartnerId`
4. Click **Update**

### Example 3: Average Rating by Partner
1. Create new visualization
2. Choose: **Metric**
3. Configure:
   - **Metrics**: Average of `rating`
4. Add filter: `partnerName` exists
5. Click **Update**

### Example 4: Delivery Status Distribution
1. Create new visualization
2. Choose: **Donut chart**
3. Configure:
   - **Metrics**: Count of documents
   - **Buckets**: Terms aggregation on `status`
4. Click **Update**

## Creating a Dashboard

### Step 1: Create Dashboard
1. Go to **Analytics** → **Dashboards**
2. Click **Create dashboard**
3. Click **Add an existing visualization** or **Create visualization**

### Step 2: Add Visualizations
1. Select visualizations you created
2. Arrange them in the dashboard
3. Save the dashboard with name: `Delivery Partner Analytics`

### Step 3: Add Filters
1. Click **Add filter** at the top
2. Create filters for:
   - **Date range**: Last 7 days, 30 days, etc.
   - **Status**: Show only completed orders
   - **Partner**: Filter by specific partner
3. Save the dashboard

## API Endpoints for Admin Dashboard Integration

### Get Delivery Partner Orders
```
GET /api/delivery-analytics/partner-orders/:partnerId?limit=50&offset=0&status=completed
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "message": "Delivery partner orders retrieved",
  "data": {
    "total": 45,
    "orders": [
      {
        "orderId": "order123",
        "deliveryPartnerId": "partner456",
        "partnerName": "John Doe",
        "status": "completed",
        "orderTotal": 500,
        "deliveryFee": 50,
        "rating": 4.5,
        "createdAt": "2025-12-07T10:30:00Z"
      }
    ]
  }
}
```

### Get Delivery Analytics Summary
```
GET /api/delivery-analytics/summary?timeRange=30d
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "message": "Delivery analytics retrieved",
  "data": {
    "timeRange": "30d",
    "totalPartners": 5,
    "totalDeliveries": 234,
    "totalEarnings": "12345.67",
    "avgRating": "4.52",
    "partners": [
      {
        "partnerId": "partner001",
        "partnerName": "John Doe",
        "totalDeliveries": 56,
        "completedDeliveries": 54,
        "completionRate": "96.43",
        "totalEarnings": "2800.00",
        "avgRating": "4.8",
        "avgDeliveryTime": 25
      }
    ]
  }
}
```

### Get Kibana Info
```
GET /api/delivery-analytics/kibana-info
Authorization: Bearer <admin_token>
```

## Troubleshooting

### Issue: No data showing in Kibana
**Solution:**
1. Verify Elasticsearch is running: `curl http://localhost:9200`
2. Check delivery orders are being logged to the application
3. In Discover, check if documents exist: `curl http://localhost:9200/delivery-orders/_count`

### Issue: Index pattern not found
**Solution:**
1. Make sure at least one delivery order has been processed
2. Go to **Stack Management** → **Index Management**
3. Look for `delivery-orders` index
4. If not present, create a test delivery order through the API

### Issue: Timestamps not showing correctly
**Solution:**
1. In Index Pattern settings, ensure the time field is set correctly
2. Try using `@timestamp` or `createdAt` field
3. Refresh the pattern

## Advanced Queries

### Find Orders by Status in Last 7 Days
In Discover search box:
```
status: "completed" AND createdAt: [now-7d TO now]
```

### Find Orders Above Average Rating
```
rating: >= 4.5
```

### Find Orders by Specific Partner
```
partnerName: "John Doe"
```

## Next Steps

1. **Create custom dashboards** for each delivery partner
2. **Set up alerts** for low ratings or long delivery times
3. **Export reports** for performance reviews
4. **Integrate with admin dashboard** using the API endpoints

## Support

For more Kibana documentation:
- https://www.elastic.co/guide/en/kibana/current/index.html

For MedAssist Now API documentation:
- See `INTEGRATION.md` in project root

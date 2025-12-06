/*
 * Order Controller
 * Handle order operations
 */

const Order = require('../models/Order.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const Inventory = require('../models/Inventory.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const notificationQueue = require('../queues/notification.queue');

/**
 * Create order
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { userId, pharmacyId, items, totalPrice } = req.body;
    
    // Validate stock availability and reduce stock for each item
    for (const item of items) {
      const inventory = await Inventory.findOne({ 
        medicineId: item.medicineId,
        pharmacyId: pharmacyId
      });
      
      if (!inventory) {
        // Try to find inventory without pharmacy filter (for demo)
        const anyInventory = await Inventory.findOne({ medicineId: item.medicineId });
        if (!anyInventory) {
          return errorResponse(res, `Medicine not found in inventory`, 400);
        }
        if (anyInventory.quantity < item.quantity) {
          return errorResponse(res, `Insufficient stock for medicine. Available: ${anyInventory.quantity}`, 400);
        }
        // Reduce stock
        anyInventory.quantity -= item.quantity;
        await anyInventory.save();
        console.log(`📦 Stock reduced for medicine ${item.medicineId}: -${item.quantity} (now: ${anyInventory.quantity})`);
      } else {
        if (inventory.quantity < item.quantity) {
          return errorResponse(res, `Insufficient stock. Available: ${inventory.quantity}`, 400);
        }
        // Reduce stock
        inventory.quantity -= item.quantity;
        await inventory.save();
        console.log(`📦 Stock reduced for medicine ${item.medicineId}: -${item.quantity} (now: ${inventory.quantity})`);
      }
    }
    
    const order = new Order({
      userId,
      pharmacyId,
      items,
      totalPrice,
      status: 'pending',
      timestamps: {
        placed: new Date()
      }
    });
    
    await order.save();
    
    // Populate the order with medicine and pharmacy details
    await order.populate([
      { path: 'pharmacyId', select: 'name pharmacyName email address' },
      { path: 'items.medicineId', select: 'name price category' },
      { path: 'userId', select: 'name email phone' }
    ]);
    
    // Send RabbitMQ notification to pharmacy
    try {
      const orderNumber = order._id.toString().slice(-6).toUpperCase();
      const customerName = order.userId?.name || 'Customer';
      const itemCount = order.items?.length || 0;
      
      // Find pharmacy user(s) to send notification
      const pharmacyUsers = await User.find({ role: 'pharmacy' }).select('_id').lean();
      
      // Save notification to database for each pharmacy user
      for (const pharmUser of pharmacyUsers) {
        await Notification.create({
          userId: pharmUser._id,
          type: 'order',
          title: '🛒 New Order Received!',
          message: `Order #${orderNumber} from ${customerName} - ${itemCount} item(s) - ₹${totalPrice}`,
          data: {
            orderId: order._id,
            extra: { orderNumber, customerName, totalPrice, itemCount }
          }
        });
      }
      
      // Send notification via RabbitMQ
      await notificationQueue.sendInAppNotification(
        pharmacyId.toString(),
        '🛒 New Order Received!',
        `Order #${orderNumber} placed by ${customerName} with ${itemCount} item(s). Total: ₹${totalPrice}`,
        `/pharmacy/orders.html`
      );
      
      console.log(`📬 RabbitMQ notification sent for order #${orderNumber}`);
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError.message);
    }
    
    // Save notification for the user who placed the order
    try {
      await Notification.create({
        userId: userId,
        type: 'order',
        title: '✅ Order Placed Successfully!',
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed and is being processed.`,
        data: {
          orderId: order._id,
          extra: { status: 'pending' }
        }
      });
    } catch (err) {
      console.error('User notification error:', err.message);
    }
    
    // Emit real-time event via Socket.IO
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Notify the pharmacy about new order
      io.to(`pharmacy_${pharmacyId}`).emit('newOrder', { 
        order,
        message: `New order #${order._id.toString().slice(-6).toUpperCase()} received!`
      });
      
      // Notify all pharmacies (broadcast)
      io.emit('orderCreated', { order });
      
      // Notify the user who placed the order
      io.to(`user_${userId}`).emit('orderConfirmed', { 
        order,
        message: 'Your order has been placed successfully!'
      });
      
      console.log(`🔌 Socket.IO events emitted for order`);
    }
    
    return successResponse(res, 'Order created successfully', { order }, 201);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    next(error);
  }
};

/**
 * Get current user's orders
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user._id || req.user.id;
    const Pharmacy = require('../models/Pharmacy.model');
    
    const orders = await Order.find({ userId })
      .populate('items.medicineId', 'name price category description')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });
    
    // Transform orders for frontend - resolve pharmacy from both collections
    const transformedOrders = await Promise.all(orders.map(async (order) => {
      // Try to get pharmacy info from both Pharmacy and User collections
      let pharmacyName = 'N/A';
      let pharmacyAddress = '';
      
      if (order.pharmacyId) {
        // First check Pharmacy collection
        const pharmacy = await Pharmacy.findById(order.pharmacyId).lean();
        if (pharmacy) {
          pharmacyName = pharmacy.pharmacyName || pharmacy.name;
          pharmacyAddress = pharmacy.address || '';
        } else {
          // Fallback to User collection
          const pharmacyUser = await User.findById(order.pharmacyId).lean();
          if (pharmacyUser) {
            pharmacyName = pharmacyUser.pharmacyName || pharmacyUser.name;
            pharmacyAddress = pharmacyUser.address || '';
          }
        }
      }
      
      return {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        status: order.status,
        totalAmount: order.totalPrice,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedDelivery: getEstimatedDelivery(order),
        pharmacy: {
          _id: order.pharmacyId,
          name: pharmacyName,
          address: pharmacyAddress
        },
        items: order.items.map(item => ({
          _id: item._id,
          medicine: item.medicineId ? {
            _id: item.medicineId._id,
            name: item.medicineId.name,
            price: item.medicineId.price
          } : { name: 'Unknown Medicine' },
          quantity: item.quantity,
          name: item.medicineId?.name || 'Unknown'
        })),
        deliveryPartner: order.deliveryPartnerId ? {
          name: order.deliveryPartnerId.name,
          phone: order.deliveryPartnerId.phone
        } : null,
        timestamps: order.timestamps || {}
      };
    }));
    
    return successResponse(res, 'Orders retrieved successfully', transformedOrders);
  } catch (error) {
    console.error('❌ Error getting my orders:', error);
    next(error);
  }
};

... (file continues)
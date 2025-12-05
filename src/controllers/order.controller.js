/**
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

/**
 * Helper to calculate estimated delivery time
 */
function getEstimatedDelivery(order) {
  const statusTimes = {
    'pending': '45-60 min',
    'confirmed': '35-50 min',
    'processing': '30-45 min',
    'packed': '20-35 min',
    'in_transit': '15-25 min',
    'out_for_delivery': '5-15 min',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusTimes[order.status] || '30-45 min';
}

/**
 * Get user orders
 * GET /api/orders/user/:userId
 */
const getUserOrders = async (req, res, next) => {
  try {
    const Pharmacy = require('../models/Pharmacy.model');
    
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.medicineId', 'name price category')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });
    
    // Resolve pharmacy names from both collections
    const ordersWithPharmacy = await Promise.all(orders.map(async (order) => {
      let pharmacyName = 'N/A';
      let pharmacyAddress = '';
      
      if (order.pharmacyId) {
        const pharmacy = await Pharmacy.findById(order.pharmacyId).lean();
        if (pharmacy) {
          pharmacyName = pharmacy.pharmacyName || pharmacy.name;
          pharmacyAddress = pharmacy.address || '';
        } else {
          const pharmacyUser = await User.findById(order.pharmacyId).lean();
          if (pharmacyUser) {
            pharmacyName = pharmacyUser.pharmacyName || pharmacyUser.name;
            pharmacyAddress = pharmacyUser.address || '';
          }
        }
      }
      
      return {
        ...order.toObject(),
        pharmacyId: {
          _id: order.pharmacyId,
          name: pharmacyName,
          pharmacyName: pharmacyName,
          address: pharmacyAddress
        }
      };
    }));
    
    return successResponse(res, 'Orders retrieved successfully', { orders: ordersWithPharmacy });
  } catch (error) {
    console.error('❌ Error getting user orders:', error);
    next(error);
  }
};

/**
 * Get pharmacy orders (authenticated pharmacy)
 * GET /api/orders/pharmacy-orders
 */
const getPharmacyOrders = async (req, res, next) => {
  try {
    // Get pharmacy ID from authenticated user
    const pharmacyUserId = req.user._id || req.user.id;
    
    // Try to find orders by multiple possible pharmacy IDs
    // 1. Orders where pharmacyId matches the user's ID directly
    // 2. Orders where pharmacyId matches any Pharmacy document
    const Pharmacy = require('../models/Pharmacy.model');
    
    // Get all pharmacy IDs to check (include the user's ID and any Pharmacy documents)
    let pharmacyIds = [pharmacyUserId];
    
    // Also check if there are Pharmacy documents we should include
    // For now, include all pharmacy orders for pharmacies (for demo purposes)
    const pharmacies = await Pharmacy.find().select('_id').lean();
    pharmacyIds = [...pharmacyIds, ...pharmacies.map(p => p._id)];
    
    const orders = await Order.find({ pharmacyId: { $in: pharmacyIds } })
      .populate('userId', 'name email phone address')
      .populate('items.medicineId', 'name price category')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });
    
    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order._id.toString().slice(-6).toUpperCase(),
      status: order.status,
      totalAmount: order.totalPrice,
      total: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.userId ? {
        _id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone
      } : null,
      customer: order.userId ? {
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone
      } : null,
      items: order.items.map(item => ({
        _id: item._id,
        medicine: item.medicineId ? {
          _id: item.medicineId._id,
          name: item.medicineId.name,
          price: item.medicineId.price
        } : null,
        name: item.medicineId?.name || 'Unknown',
        quantity: item.quantity
      })),
      deliveryPartner: order.deliveryPartnerId ? {
        name: order.deliveryPartnerId.name,
        phone: order.deliveryPartnerId.phone
      } : null,
      timestamps: order.timestamps || {}
    }));
    
    return successResponse(res, 'Orders retrieved successfully', transformedOrders);
  } catch (error) {
    console.error('❌ Error getting pharmacy orders:', error);
    next(error);
  }
};

/**
 * Get orders by pharmacy ID (for backward compatibility)
 * GET /api/orders/pharmacy/:pharmacyId
 */
const getOrdersByPharmacyId = async (req, res, next) => {
  try {
    const orders = await Order.find({ pharmacyId: req.params.pharmacyId })
      .populate('userId', 'name email phone address')
      .populate('items.medicineId', 'name price category')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });
    
    return successResponse(res, 'Orders retrieved successfully', { orders });
  } catch (error) {
    console.error('❌ Error getting pharmacy orders:', error);
    next(error);
  }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, deliveryPartnerId } = req.body;
    
    // Get the order first to check current status
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    // If cancelling an order, restore the stock
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      for (const item of existingOrder.items) {
        const inventory = await Inventory.findOne({ medicineId: item.medicineId });
        if (inventory) {
          inventory.quantity += item.quantity;
          await inventory.save();
          console.log(`📦 Stock restored for medicine ${item.medicineId}: +${item.quantity} (now: ${inventory.quantity})`);
        }
      }
    }
    
    const updateData = { 
      status,
      [`timestamps.${status}`]: new Date()
    };
    
    if (deliveryPartnerId) {
      updateData.deliveryPartnerId = deliveryPartnerId;
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'pharmacyId', select: 'name pharmacyName' },
      { path: 'items.medicineId', select: 'name price' },
      { path: 'deliveryPartnerId', select: 'name phone' }
    ]);
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    // Create notification for the user about status update
    try {
      const orderNumber = order._id.toString().slice(-6).toUpperCase();
      const statusMessages = {
        'processing': { title: '🔄 Order Being Prepared', message: `Your order #${orderNumber} is being prepared by the pharmacy.` },
        'packed': { title: '📦 Order Packed', message: `Your order #${orderNumber} has been packed and is ready for delivery.` },
        'ready': { title: '✅ Order Ready', message: `Your order #${orderNumber} is ready for pickup/delivery.` },
        'in_transit': { title: '🚚 Order On The Way!', message: `Your order #${orderNumber} is out for delivery.` },
        'out_for_delivery': { title: '🏃 Almost There!', message: `Your order #${orderNumber} will arrive shortly.` },
        'delivered': { title: '🎉 Order Delivered!', message: `Your order #${orderNumber} has been delivered. Enjoy!` },
        'cancelled': { title: '❌ Order Cancelled', message: `Your order #${orderNumber} has been cancelled.` },
        'confirmed': { title: '✅ Order Confirmed', message: `Your order #${orderNumber} has been confirmed by the pharmacy.` }
      };
      
      const notifData = statusMessages[status];
      if (notifData && order.userId) {
        await Notification.create({
          userId: order.userId,
          type: 'order',
          title: notifData.title,
          message: notifData.message,
          data: {
            orderId: order._id,
            extra: { status, orderNumber }
          }
        });
      }
      
      // When order is packed, notify all delivery partners
      if (status === 'packed' || status === 'ready') {
        // Get pharmacy info for notification
        let pharmacyName = 'Pharmacy';
        if (order.pharmacyId) {
          pharmacyName = order.pharmacyId.pharmacyName || order.pharmacyId.name || 'Pharmacy';
        }
        
        // Get all delivery partners
        const deliveryPartners = await User.find({ role: 'delivery' }).select('_id').lean();
        
        // Create notification for each delivery partner
        for (const partner of deliveryPartners) {
          await Notification.create({
            userId: partner._id,
            type: 'delivery',
            title: '📦 New Delivery Request!',
            message: `Order #${orderNumber} from ${pharmacyName} is ready for pickup`,
            data: {
              orderId: order._id,
              extra: { orderNumber, pharmacyName, status: 'packed' }
            }
          });
        }
        
        console.log(`📬 Delivery notifications sent to ${deliveryPartners.length} partners for order #${orderNumber}`);
        
        // Emit Socket.IO event to all delivery partners
        if (req.app.get('io')) {
          req.app.get('io').to('delivery_all').emit('newDeliveryRequest', {
            orderId: order._id,
            orderNumber: orderNumber,
            pharmacyName: pharmacyName,
            message: `Order #${orderNumber} is ready for pickup!`
          });
          
          req.app.get('io').emit('orderPacked', {
            orderId: order._id,
            orderNumber: orderNumber,
            pharmacyName: pharmacyName
          });
        }
      }
    } catch (notifErr) {
      console.error('Status notification error:', notifErr.message);
    }
    
    // Emit real-time status update
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${order.userId}`).emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        order: order
      });
      req.app.get('io').emit('orderUpdated', { order });
    }
    
    return successResponse(res, 'Order status updated successfully', { order });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    next(error);
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('pharmacyId', 'name pharmacyName email address location')
      .populate('items.medicineId', 'name price category')
      .populate('deliveryPartnerId', 'name phone')
      .populate('userId', 'name email phone');
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    return successResponse(res, 'Order retrieved successfully', { order });
  } catch (error) {
    console.error('❌ Error getting order:', error);
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getUserOrders,
  getPharmacyOrders,
  getOrdersByPharmacyId,
  updateOrderStatus,
  getOrderById
};

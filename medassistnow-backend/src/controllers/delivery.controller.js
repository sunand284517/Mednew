/*
 * Delivery Partner Controller
 * Handle delivery partner operations
 */

const DeliveryPartner = require('../models/DeliveryPartner.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register delivery partner
 * POST /api/delivery
 */
const registerDeliveryPartner = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    const deliveryPartner = new DeliveryPartner({
      name,
      email,
      phone
    });
    
    await deliveryPartner.save();
    
    return successResponse(res, 'Delivery partner registered successfully', { deliveryPartner }, 201);
  } catch (error) {
    console.error('❌ Error registering delivery partner:', error);
    next(error);
  }
};

/**
 * Get available delivery partners
 * GET /api/delivery/available
 */
const getAvailablePartners = async (req, res, next) => {
  try {
    const partners = await DeliveryPartner.find({ isAvailable: true });
    
    return successResponse(res, 'Available partners retrieved successfully', { partners });
  } catch (error) {
    console.error('❌ Error getting available partners:', error);
    next(error);
  }
};

/**
 * Update availability
 * PUT /api/delivery/:id/availability
 */
const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    
    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true, runValidators: true }
    );
    
    if (!partner) {
      return errorResponse(res, 'Delivery partner not found', 404);
    }
    
    return successResponse(res, 'Availability updated successfully', { partner });
  } catch (error) {
    console.error('❌ Error updating availability:', error);
    next(error);
  }
};

/**
 * Get delivery requests (orders that are packed and ready for pickup)
 * GET /api/delivery/requests
 */
const getDeliveryRequests = async (req, res, next) => {
  try {
    // Find orders that are packed/ready and don't have a delivery partner assigned
    const orders = await Order.find({
      status: { $in: ['packed', 'ready', 'ready_for_pickup'] },
      $or: [
        { deliveryPartnerId: null },
        { deliveryPartnerId: { $exists: false } }
      ]
    })
    .populate('userId', 'name email phone address')
    .populate('pharmacyId', 'name pharmacyName address')
    .populate('items.medicineId', 'name price')
    .sort({ createdAt: -1 });
    
    // Transform orders to delivery request format
    const requests = await Promise.all(orders.map(async (order) => {
      // Get pharmacy info from User collection if pharmacyId doesn't populate
      let pharmacyName = order.pharmacyId?.pharmacyName || order.pharmacyId?.name || 'Pharmacy';
      let pharmacyAddress = order.pharmacyId?.address || '';
      
      if (!order.pharmacyId?.name) {
        const pharmacyUser = await User.findById(order.pharmacyId).lean();
        if (pharmacyUser) {
          pharmacyName = pharmacyUser.pharmacyName || pharmacyUser.name;
          pharmacyAddress = pharmacyUser.address || '';
        }
      }
      
      const customerAddress = typeof order.userId?.address === 'string' 
        ? order.userId.address 
        : order.deliveryAddress || 'Customer Address';
      
      return {
        _id: order._id,
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        pharmacyName: pharmacyName,
        pharmacyAddress: pharmacyAddress,
        customerName: order.userId?.name || 'Customer',
        deliveryAddress: customerAddress,
        pickup: {
          name: pharmacyName,
          address: pharmacyAddress
        },
        drop: {
          name: order.userId?.name || 'Customer',
          address: customerAddress
        },
        distance: (Math.random() * 5 + 1).toFixed(1), // Simulated distance
        fee: 50, // Standard delivery fee
        deliveryFee: 50,
        urgent: order.status === 'ready' || order.urgent,
        status: order.status,
        totalAmount: order.totalPrice,
        itemCount: order.items?.length || 0,
        createdAt: order.createdAt
      };
    }));
    
    return successResponse(res, 'Delivery requests retrieved successfully', { requests });
  } catch (error) {
    console.error('❌ Error getting delivery requests:', error);
    next(error);
  }
};

/**
 * Accept a delivery request
 * POST /api/delivery/requests/:id/accept
 */
const acceptDeliveryRequest = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user._id || req.user.id;
    const orderId = req.params.id;
    
    // Find and update the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }
    
    if (order.deliveryPartnerId) {
      return errorResponse(res, 'This order has already been accepted by another delivery partner', 400);
    }
    
    // Assign delivery partner and update status
    order.deliveryPartnerId = deliveryPartnerId;
    order.status = 'in_transit';
    order.timestamps = order.timestamps || {};
    order.timestamps.accepted = new Date();
    order.timestamps.in_transit = new Date();
    
    await order.save();
    
    // Notify the customer
    try {
      const orderNumber = order._id.toString().slice(-6).toUpperCase();
      const deliveryPartner = await User.findById(deliveryPartnerId).select('name phone').lean();
      
      await Notification.create({
        userId: order.userId,
        type: 'order',
        title: '🚚 Delivery Partner Assigned!',
        message: `${deliveryPartner?.name || 'A delivery partner'} is on the way to pick up your order #${orderNumber}`,
        data: {
          orderId: order._id,
          extra: { status: 'in_transit', deliveryPartner: deliveryPartner?.name }
        }
      });
      
      // Emit Socket.IO event
      if (req.app.get('io')) {
        req.app.get('io').to(`user_${order.userId}`).emit('orderStatusUpdate', {
          orderId: order._id,
          status: 'in_transit',
          message: 'Your order is on the way!'
        });
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }
    
    return successResponse(res, 'Delivery request accepted successfully', { order });
  } catch (error) {
    console.error('❌ Error accepting delivery request:', error);
    next(error);
  }
};

/**
 * Get delivery partner stats
 * GET /api/delivery/stats
 */
const getDeliveryStats = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user._id || req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's completed deliveries
    const todayDeliveries = await Order.countDocuments({
      deliveryPartnerId,
      status: 'delivered',
      'timestamps.delivered': { $gte: today }
    });
    
    // Calculate today's earnings (₹50 per delivery)
    const todayEarnings = todayDeliveries * 50;
    
    // Get pending requests count
    const pendingRequests = await Order.countDocuments({
      status: { $in: ['packed', 'ready', 'ready_for_pickup'] },
      $or: [
        { deliveryPartnerId: null },
        { deliveryPartnerId: { $exists: false } }
      ]
    });
    
    // Get active delivery (if any)
    const activeDelivery = await Order.findOne({
      deliveryPartnerId,
      status: { $in: ['in_transit', 'out_for_delivery'] }
    }).populate('userId', 'name address').lean();
    
    // Get partner's rating from user profile
    const partner = await User.findById(deliveryPartnerId).select('rating').lean();
    
    return successResponse(res, 'Stats retrieved successfully', {
      todayDeliveries,
      todayEarnings,
      pendingRequests,
      rating: partner?.rating || 4.5,
      activeDelivery: activeDelivery ? {
        orderId: activeDelivery._id,
        orderNumber: activeDelivery._id.toString().slice(-6).toUpperCase(),
        customerName: activeDelivery.userId?.name || 'Customer',
        status: activeDelivery.status
      } : null
    });
  } catch (error) {
    console.error('❌ Error getting delivery stats:', error);
    next(error);
  }
};

/**
 * Get delivery partner earnings
 * GET /api/delivery/earnings
 */
const getDeliveryEarnings = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user._id || req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all completed deliveries
    const completedDeliveries = await Order.find({
      deliveryPartnerId,
      status: 'delivered'
    })
    .populate('userId', 'name')
    .populate('pharmacyId', 'name pharmacyName')
    .sort({ 'timestamps.delivered': -1 })
    .lean();
    
    // Calculate earnings by period
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    const deliveryFeePerOrder = 50;
    
    const deliveries = completedDeliveries.map(order => {
      const deliveredDate = order.timestamps?.delivered || order.updatedAt || order.createdAt;
      const date = new Date(deliveredDate);
      const fee = deliveryFeePerOrder;
      
      totalEarnings += fee;
      if (date >= today) todayEarnings += fee;
      if (date >= weekStart) weekEarnings += fee;
      if (date >= monthStart) monthEarnings += fee;
      
      return {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        customer: { name: order.userId?.name || 'Customer' },
        pharmacy: { name: order.pharmacyId?.pharmacyName || order.pharmacyId?.name || 'Pharmacy' },
        deliveryFee: fee,
        fee: fee,
        completedAt: deliveredDate,
        createdAt: order.createdAt
      };
    });
    
    return successResponse(res, 'Earnings retrieved successfully', {
      totalEarnings,
      todayEarnings,
      weekEarnings,
      monthEarnings,
      deliveryFees: totalEarnings,
      tips: 0,
      surgeBonus: 0,
      incentives: 0,
      netEarnings: totalEarnings,
      availableBalance: totalEarnings,
      deliveries
    });
  } catch (error) {
    console.error('❌ Error getting delivery earnings:', error);
    next(error);
  }
};

/**
 * Get my delivery history
 * GET /api/deliveries/my-history
 */
const getMyDeliveryHistory = async (req, res, next) => {
  try {
    const deliveryPartnerId = req.user._id || req.user.id;
    
    const deliveries = await Order.find({
      deliveryPartnerId,
      status: 'delivered'
    })
    .populate('userId', 'name address')
    .populate('pharmacyId', 'name pharmacyName address')
    .sort({ 'timestamps.delivered': -1 })
    .lean();
    
    const history = deliveries.map(order => ({
      orderId: order._id,
      orderNumber: order._id.toString().slice(-6).toUpperCase(),
      customer: { name: order.userId?.name || 'Customer' },
      customerName: order.userId?.name || 'Customer',
      pharmacy: { name: order.pharmacyId?.pharmacyName || order.pharmacyId?.name || 'Pharmacy' },
      pickupLocation: order.pharmacyId?.pharmacyName || order.pharmacyId?.name || 'Pharmacy',
      dropLocation: typeof order.userId?.address === 'string' ? order.userId.address : 'Customer Address',
      deliveryAddress: typeof order.userId?.address === 'string' ? order.userId.address : 'Customer Address',
      distance: (Math.random() * 5 + 1).toFixed(1),
      deliveryFee: 50,
      fee: 50,
      rating: 5,
      completedAt: order.timestamps?.delivered || order.updatedAt,
      createdAt: order.createdAt
    }));
    
    return successResponse(res, 'Delivery history retrieved successfully', history);
  } catch (error) {
    console.error('❌ Error getting delivery history:', error);
    next(error);
  }
};

/**
 * Update delivery status
 * PUT /api/delivery/orders/:id/status
 */
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const deliveryPartnerId = req.user._id || req.user.id;
    
    const order = await Order.findOne({ _id: orderId, deliveryPartnerId });
    
    if (!order) {
      return errorResponse(res, 'Order not found or not assigned to you', 404);
    }
    
    order.status = status;
    order.timestamps = order.timestamps || {};
    order.timestamps[status] = new Date();
    
    await order.save();
    
    // Notify customer
    const orderNumber = order._id.toString().slice(-6).toUpperCase();

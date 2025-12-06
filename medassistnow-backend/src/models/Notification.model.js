/**
 * Notification Model
 * Stores user notifications for real-time updates
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['order', 'delivery', 'stock', 'system', 'promotion'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    link: String,
    extra: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Static method to create notification for pharmacy on new order
notificationSchema.statics.createOrderNotification = async function(pharmacyUserId, order) {
  const orderNumber = order.orderNumber || order._id.toString().slice(-6).toUpperCase();
  const customerName = order.user?.name || 'Customer';
  const totalAmount = order.totalAmount || order.total || 0;
  
  return await this.create({
    userId: pharmacyUserId,
    type: 'order',
    title: '🛒 New Order Received!',
    message: `Order #${orderNumber} from ${customerName} - ₹${totalAmount}`,
    data: {
      orderId: order._id,
      extra: { orderNumber, customerName, totalAmount }
    }
  });
};

// Static method to create notification for user on order status update
notificationSchema.statics.createStatusNotification = async function(userId, order, newStatus) {
  const orderNumber = order.orderNumber || order._id.toString().slice(-6).toUpperCase();
  const statusMessages = {
    'processing': '🔄 Your order is being prepared',
    'packed': '📦 Your order has been packed',
    'ready': '✅ Your order is ready for pickup/delivery',
    'in_transit': '🚚 Your order is on the way!',
    'delivered': '🎉 Your order has been delivered!',
    'cancelled': '❌ Your order has been cancelled'
  };
  
  return await this.create({
    userId: userId,
    type: 'order',
    title: statusMessages[newStatus] || `Order #${orderNumber} Updated`,
    message: `Order #${orderNumber} status changed to ${newStatus}`,
    data: {
      orderId: order._id,
      extra: { orderNumber, status: newStatus }
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);

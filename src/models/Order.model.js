/**
 * Order Model
 * MongoDB schema for customer orders
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy ID is required']
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    default: null
  },
  items: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'accepted', 'in_transit', 'out_for_delivery', 'out-for-delivery', 'delivered', 'cancelled', 'completed'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  },
  // Timestamps for each status change (for timeline tracking)
  timestamps: {
    placed: { type: Date },
    confirmed: { type: Date },
    processing: { type: Date },
    packed: { type: Date },
    in_transit: { type: Date },
    out_for_delivery: { type: Date },
    delivered: { type: Date },
    cancelled: { type: Date }
  },
  // Delivery address
  deliveryAddress: {
    type: String
  },
  // Notes for delivery
  notes: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Order', orderSchema);

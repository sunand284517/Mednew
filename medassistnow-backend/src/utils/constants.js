/**
 * Application Constants
 * Centralized constants for the application
 */

// User roles
const USER_ROLES = {
  PATIENT: 'patient',
  PHARMACY: 'pharmacy',
  DELIVERY_PARTNER: 'delivery_partner',
  ADMIN: 'admin'
};

// Order status
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Delivery status
const DELIVERY_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed'
};

// Medicine categories
const MEDICINE_CATEGORIES = {
  PRESCRIPTION: 'prescription',
  OTC: 'over_the_counter',
  SUPPLEMENT: 'supplement',
  EMERGENCY: 'emergency'
};

// Payment methods
const PAYMENT_METHODS = {
  CASH: 'cash_on_delivery',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet'
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  MEDICINE_CATEGORIES,
  PAYMENT_METHODS,
  HTTP_STATUS
};

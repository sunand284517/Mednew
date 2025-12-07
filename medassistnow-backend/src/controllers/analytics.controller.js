/*
 * Analytics Controller
 * Provides comprehensive analytics endpoints for admin dashboard
 */

const Order = require('../models/Order.model');
const Medicine = require('../models/Medicine.model');
const Pharmacy = require('../models/Pharmacy.model');
const DeliveryPartner = require('../models/DeliveryPartner.model');
const User = require('../models/User.model');
const Inventory = require('../models/Inventory.model');

/**
 * Get top selling medicines
 */
exports.getTopMedicines = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const timeRange = req.query.timeRange || 'all'; // 'all', '7days', '30days', '90days'

    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '90days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
    }

    const topMedicines = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicineId',
          medicineName: { $first: '$items.medicineName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          medicineName: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      }
    ]);

    // Add rank manually
    const rankedMedicines = topMedicines.map((med, index) => ({
      ...med,
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      message: 'Top medicines retrieved successfully',
      data: rankedMedicines,
      count: rankedMedicines.length,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching top medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top medicines',
      error: error.message
    });
  }
};

/**
 * Get pharmacy analytics - orders, revenue, ratings
 */
exports.getPharmacyAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'all';
    const limit = req.query.limit || 10;

    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const pharmacyStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$pharmacyId',
          pharmacyName: { $first: '$pharmacyName' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } },
          avgRating: { $avg: '$pharmacyRating' }
        }
      },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'pharmacyDetails'
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          pharmacyName: 1,
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          totalItems: 1,
          avgRating: { $round: ['$avgRating', 1] },
          status: { $arrayElemAt: ['$pharmacyDetails.status', 0] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Pharmacy analytics retrieved successfully',
      data: pharmacyStats,
      count: pharmacyStats.length,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching pharmacy analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy analytics',
      error: error.message
    });
  }
};

/**
 * Get delivery partner analytics
 */
exports.getDeliveryPartnerAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || 'all';
    const limit = req.query.limit || 10;

    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const deliveryStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$deliveryPartnerId',
          partnerName: { $first: '$deliveryPartnerName' },
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          failedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalEarnings: { $sum: '$deliveryCharges' },
          avgRating: { $avg: '$deliveryRating' },
          totalOrderValue: { $sum: '$totalAmount' }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ['$completedDeliveries', '$totalDeliveries'] },
              100
            ]
          }
        }
      },
      { $sort: { totalDeliveries: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          partnerName: 1,
          totalDeliveries: 1,
          completedDeliveries: 1,
          failedDeliveries: 1,
          successRate: { $round: ['$successRate', 1] },
          totalEarnings: { $round: ['$totalEarnings', 2] },
          avgRating: { $round: ['$avgRating', 1] },
          totalOrderValue: { $round: ['$totalOrderValue', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Delivery partner analytics retrieved successfully',
      data: deliveryStats,
      count: deliveryStats.length,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching delivery partner analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery partner analytics',
      error: error.message
    });
  }
};

/**
 * Get medicine inventory analytics
 */
exports.getMedicineInventoryAnalytics = async (req, res) => {
  try {
    const limit = req.query.limit || 15;

    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$medicineId',
          medicineName: { $first: '$medicineName' },
          pharmacyCount: { $sum: 1 },
          totalStockAcrossPharma: { $sum: '$quantity' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          criticalStock: {
            $sum: { $cond: [{ $lt: ['$quantity', 10] }, 1, 0] }
          }
        }
      },
      { $sort: { totalStockAcrossPharma: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          medicineName: 1,
          pharmacyCount: 1,
          totalStockAcrossPharma: 1,
          priceRange: {
            $concat: [
              '₹',
              { $toString: { $round: ['$minPrice', 0] } },
              ' - ₹',
              { $toString: { $round: ['$maxPrice', 0] } }
            ]
          },
          avgPrice: { $round: ['$avgPrice', 2] },
          criticalStock: 1,
          status: {
            $cond: [
              { $eq: ['$criticalStock', 0] },
              'In Stock',
              'Critical'
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Medicine inventory analytics retrieved successfully',
      data: inventoryStats,
      count: inventoryStats.length
    });
  } catch (error) {
    console.error('Error fetching medicine inventory analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine inventory analytics',
      error: error.message
    });
  }
};

/**
 * Get dashboard summary statistics
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30days';
    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeRange === '30days') {
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (timeRange === '90days') {
      dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    }

    // Parallel queries
    const [
      orderStats,
      userStats,
      pharmacyStats,
      deliveryStats,
      medicineStats
    ] = await Promise.all([
      // Order statistics
      Order.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]),
      // User statistics
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            newUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            }
          }
        }
      ]),
      // Pharmacy statistics
      Pharmacy.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            newPharmacies: { $sum: 1 },
            verifiedPharmacies: {
              $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
            }
          }
        }
      ]),
      // Delivery partner statistics
      DeliveryPartner.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            newPartners: { $sum: 1 },
            activePartners: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            }
          }
        }
      ]),
      // Medicine statistics
      Medicine.aggregate([
        {
          $group: {
            _id: null,
            totalMedicines: { $sum: 1 }
          }
        }
      ])
    ]);

    const summary = {
      orders: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      },
      users: userStats[0] || {
        newUsers: 0,
        activeUsers: 0
      },
      pharmacies: pharmacyStats[0] || {
        newPharmacies: 0,
        verifiedPharmacies: 0
      },
      deliveryPartners: deliveryStats[0] || {
        newPartners: 0,
        activePartners: 0
      },
      medicines: medicineStats[0] || {
        totalMedicines: 0
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: summary,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
};

/**
 * Get hourly order trends
 */
exports.getHourlyTrends = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '24hours'; // '24hours', '7days'
    let dateFilter = {};
    const now = new Date();

    if (timeRange === '24hours') {
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
    } else if (timeRange === '7days') {
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    }

    const hourlyData = await Order.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timeRange === '24hours' ? '%H:%M' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Hourly trends retrieved successfully',
      data: hourlyData,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching hourly trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hourly trends',
      error: error.message
    });
  }
};

/**
 * Get category-wise medicine sales
 */
exports.getCategoryAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '30days';
    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '30days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '90days') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
    }

    const categoryStats = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 1,
          category: '$_id',
          totalOrders: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Category analytics retrieved successfully',
      data: categoryStats,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category analytics',
      error: error.message
    });
  }
};

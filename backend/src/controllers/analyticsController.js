const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalOrders, totalProducts, totalUsers, totalCategories] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Category.countDocuments(),
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const recentOrders = await Order.find().populate('user', 'name email').sort('-createdAt').limit(10).lean();

    const topProducts = await Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(10).populate('brand').lean();

    const lowStock = await Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock sku').limit(10).lean();

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalCategories,
        totalRevenue: revenue[0]?.total || 0,
        monthlySales,
        recentOrders,
        topProducts,
        lowStock,
        ordersByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

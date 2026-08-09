const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res, next) => {
  try {
    if (req.uploadedImages && req.uploadedImages[0]) {
      req.body.image = req.uploadedImages[0];
    }
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    // Get categories with product counts aggregated from Product collection
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
          pipeline: [{ $match: { isActive: true } }, { $count: 'count' }],
        },
      },
      {
        $addFields: {
          productCount: { $ifNull: [{ $arrayElemAt: ['$products.count', 0] }, 0] },
        },
      },
      { $project: { products: 0 } },
      { $sort: { order: 1, name: 1 } },
    ]);
    
    res.json({ success: true, data: categories });
  } catch (error) {
    // Fallback to simple query if aggregation fails
    try {
      const Product = require('../Product');
      const categories = await Category.find({ isActive: true }).sort('order name').lean();
      const counts = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
      const countMap = {};
      counts.forEach(c => { countMap[c._id.toString()] = c.count; });
      categories.forEach(cat => { cat.productCount = countMap[cat._id.toString()] || 0; });
      res.json({ success: true, data: categories });
    } catch (fallbackError) {
      next(error);
    }
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate('subcategories').lean();
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const products = await Product.find({ category: category._id, isActive: true })
      .populate('brand').sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: { category, products } });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

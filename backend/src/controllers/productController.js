const Product = require('../models/Product');
const Review = require('../models/Review');

exports.createProduct = async (req, res, next) => {
  try {
    if (req.uploadedImages) {
      req.body.images = req.uploadedImages;
    }
    const product = await Product.create(req.body);
    await product.populate(['brand', 'category']);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.brand) filter.brand = { $in: req.query.brand.split(',') };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.rating) filter.rating = { $gte: Number(req.query.rating) };
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.isFeatured) filter.isFeatured = true;
    if (req.query.isTrending) filter.isTrending = true;
    if (req.query.isNewArrival) filter.isNewArrival = true;
    if (req.query.isBestSeller) filter.isBestSeller = true;
    if (req.query.inStock) filter.stock = { $gt: 0 };
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.query.color) filter.color = { $in: req.query.color.split(',') };

    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    if (req.query.sort === 'price_desc') sort = { price: -1 };
    if (req.query.sort === 'rating') sort = { rating: -1 };
    if (req.query.sort === 'popular') sort = { soldCount: -1 };
    if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).populate('brand').populate('category').sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('brand')
      .populate('category')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(8).populate('brand').lean();

    const frequentlyBought = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isBestSeller: true,
      isActive: true,
    }).limit(4).populate('brand').lean();

    res.json({ success: true, data: { product, related, frequentlyBought } });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (req.uploadedImages) {
      req.body.images = req.uploadedImages;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('brand').populate('category');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, lowStockProducts] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      require('../models/Category').countDocuments(),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock sku').lean(),
    ]);

    const topSelling = await Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(10).populate('brand').lean();
    const newProducts = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(10).populate('brand').lean();

    res.json({
      success: true,
      data: { totalProducts, totalCategories, lowStockProducts, topSelling, newProducts },
    });
  } catch (error) {
    next(error);
  }
};

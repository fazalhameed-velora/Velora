const Banner = require('../models/Banner');

exports.createBanner = async (req, res, next) => {
  try {
    if (req.uploadedImages && req.uploadedImages[0]) {
      req.body.image = req.uploadedImages[0];
    }
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

exports.getBanners = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.position) filter.position = req.query.position;
    if (!req.query.all) {
      filter.isActive = true;
      // For public API, filter by date range if startDate/endDate are set
      const now = new Date();
      filter.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ];
    }
    const banners = await Banner.find(filter).sort('order').lean();
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
};

// Track banner click
exports.trackBannerClick = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 }, lastClickedAt: new Date() },
      { new: true }
    );
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: { clicks: banner.clicks } });
  } catch (error) {
    next(error);
  }
};

// Track banner impression
exports.trackBannerImpression = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Banner IDs required' });
    }
    await Banner.updateMany(
      { _id: { $in: ids } },
      { $inc: { impressions: 1 }, lastImpressionAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Get banner analytics (admin)
exports.getBannerAnalytics = async (req, res, next) => {
  try {
    const banners = await Banner.find({})
      .select('title position clicks impressions lastClickedAt lastImpressionAt isActive')
      .sort({ clicks: -1 })
      .lean();
    
    const totalClicks = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);
    const totalImpressions = banners.reduce((sum, b) => sum + (b.impressions || 0), 0);
    const clickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;
    
    res.json({ 
      success: true, 
      data: { 
        banners, 
        summary: { totalClicks, totalImpressions, clickRate } 
      } 
    });
  } catch (error) {
    next(error);
  }
};

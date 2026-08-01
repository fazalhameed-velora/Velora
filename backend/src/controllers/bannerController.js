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
    if (!req.query.all) filter.isActive = true;
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

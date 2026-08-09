const router = require('express').Router();
const ctrl = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');

// Public routes
router.get('/', ctrl.getBanners);
router.post('/:id/click', ctrl.trackBannerClick);
router.post('/impressions', ctrl.trackBannerImpression);

// Admin routes
router.get('/analytics', protect, authorize('admin'), ctrl.getBannerAnalytics);
router.post('/', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.createBanner);
router.put('/:id', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.updateBanner);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteBanner);

module.exports = router;

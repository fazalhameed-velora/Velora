const router = require('express').Router();
const ctrl = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');

router.get('/', ctrl.getBanners);
router.post('/', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.createBanner);
router.put('/:id', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.updateBanner);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteBanner);

module.exports = router;

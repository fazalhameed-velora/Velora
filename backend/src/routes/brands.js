const router = require('express').Router();
const ctrl = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');

router.get('/', ctrl.getBrands);
router.post('/', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.createBrand);
router.put('/:id', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.updateBrand);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteBrand);

module.exports = router;

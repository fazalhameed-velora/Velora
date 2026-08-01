const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');

router.get('/', ctrl.getCategories);
router.get('/:slug', ctrl.getCategoryBySlug);
router.post('/', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.createCategory);
router.put('/:id', protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.updateCategory);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteCategory);

module.exports = router;

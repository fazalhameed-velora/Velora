const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');
const { validations } = require('../middleware/validate');

router.get('/', ctrl.getCategories);
router.get('/:slug', ctrl.getCategoryBySlug);
router.post('/', validations.createCategory, protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.createCategory);
router.put('/:id', validations.mongoIdParam, protect, authorize('admin'), upload.array('images', 1), uploadProductImages, ctrl.updateCategory);
router.delete('/:id', validations.mongoIdParam, protect, authorize('admin'), ctrl.deleteCategory);

module.exports = router;

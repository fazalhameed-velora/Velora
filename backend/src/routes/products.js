const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadProductImages } = require('../middleware/upload');

router.get('/dashboard', protect, authorize('admin'), ctrl.getDashboardStats);
router.get('/', ctrl.getProducts);
router.get('/:slug', ctrl.getProductBySlug);
router.post('/', protect, authorize('admin'), upload.array('images', 10), uploadProductImages, ctrl.createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 10), uploadProductImages, ctrl.updateProduct);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProduct);

module.exports = router;

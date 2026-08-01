const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), ctrl.getOrderStats);
router.get('/', protect, ctrl.getOrders);
router.get('/:id', protect, ctrl.getOrderById);
router.post('/', optionalAuth, ctrl.createOrder);
router.put('/:id/status', protect, authorize('admin'), ctrl.updateOrderStatus);

module.exports = router;

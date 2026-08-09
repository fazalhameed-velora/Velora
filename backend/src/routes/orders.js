const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validations } = require('../middleware/validate');

router.get('/stats', protect, authorize('admin'), ctrl.getOrderStats);
router.get('/', protect, ctrl.getOrders);
router.get('/:id', validations.mongoIdParam, protect, ctrl.getOrderById);
router.post('/', validations.createOrder, optionalAuth, ctrl.createOrder);
router.put('/:id/status', validations.mongoIdParam, protect, authorize('admin'), ctrl.updateOrderStatus);
router.delete('/:id', validations.mongoIdParam, protect, authorize('admin'), ctrl.deleteOrder);

module.exports = router;

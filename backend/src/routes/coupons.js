const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), ctrl.getCoupons);
router.get('/validate/:code', ctrl.validateCoupon);
router.post('/', protect, authorize('admin'), ctrl.createCoupon);
router.put('/:id', protect, authorize('admin'), ctrl.updateCoupon);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteCoupon);

module.exports = router;

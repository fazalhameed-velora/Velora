const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');
const { validations } = require('../middleware/validate');

router.get('/', protect, authorize('admin'), ctrl.getCoupons);
router.get('/validate/:code', ctrl.validateCoupon);
router.post('/', validations.createCoupon, protect, authorize('admin'), ctrl.createCoupon);
router.put('/:id', validations.mongoIdParam, protect, authorize('admin'), ctrl.updateCoupon);
router.delete('/:id', validations.mongoIdParam, protect, authorize('admin'), ctrl.deleteCoupon);

module.exports = router;

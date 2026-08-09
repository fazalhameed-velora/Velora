const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validations } = require('../middleware/validate');

router.get('/:productId', validations.mongoIdParam, ctrl.getProductReviews);
router.post('/', validations.createReview, protect, ctrl.createReview);
router.delete('/:id', validations.mongoIdParam, protect, ctrl.deleteReview);

module.exports = router;

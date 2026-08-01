const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);
router.delete('/profile', protect, ctrl.deleteMyAccount);
router.post('/addresses', protect, ctrl.addAddress);
router.put('/addresses/:addressId', protect, ctrl.updateAddress);
router.delete('/addresses/:addressId', protect, ctrl.deleteAddress);
router.post('/wishlist/:productId', protect, ctrl.toggleWishlist);
router.get('/wishlist', protect, ctrl.getWishlist);
router.get('/', protect, authorize('admin'), ctrl.getAllUsers);
router.get('/:id', protect, authorize('admin'), ctrl.getUserById);
router.put('/:id', protect, authorize('admin'), ctrl.updateUser);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteUser);

module.exports = router;

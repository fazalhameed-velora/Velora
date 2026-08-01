const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const guestId = req.headers['x-guest-id'];
    const clerkId = req.headers['x-clerk-id'];

    if (clerkId) {
      let user = await User.findOne({ clerkId });
      if (!user) {
        user = await User.create({
          clerkId,
          email: req.headers['x-user-email'] || '',
          name: req.headers['x-user-name'] || 'User',
          avatar: req.headers['x-user-avatar'] || '',
        });
      }
      req.user = user;
      return next();
    }

    if (guestId) {
      let guest = await User.findOne({ guestId, isGuest: true });
      if (!guest) {
        guest = await User.create({
          guestId,
          email: `guest_${guestId}@guest.local`,
          name: 'Guest User',
          isGuest: true,
        });
      }
      req.user = guest;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Not authorized' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const guestId = req.headers['x-guest-id'];
    const clerkId = req.headers['x-clerk-id'];

    if (clerkId) {
      req.user = await User.findOne({ clerkId });
    } else if (guestId) {
      req.user = await User.findOne({ guestId, isGuest: true });
    }
  } catch (error) {
    // Continue without user
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };

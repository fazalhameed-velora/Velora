const User = require('../models/User');

/**
 * protect middleware - Verifies Clerk authentication or guest session
 * 
 * For Clerk users:
 * - Uses req.auth.userId from @clerk/express middleware (cryptographically verified)
 * - Looks up MongoDB user by clerkId
 * - Creates user if not found (auto-sync from Clerk)
 * 
 * For guest users:
 * - Uses x-guest-id header
 * - Looks up or creates guest user
 */
const protect = async (req, res, next) => {
  try {
    // Debug logging
    const hasAuthHeader = !!req.headers.authorization;
    const hasClerkAuth = !!(req.auth && req.auth.userId);
    
    console.log(`[AUTH DEBUG] Route: ${req.method} ${req.path}`);
    console.log(`[AUTH DEBUG] Authorization header present: ${hasAuthHeader}`);
    console.log(`[AUTH DEBUG] req.auth.userId present: ${hasClerkAuth}`);
    
    if (hasClerkAuth) {
      console.log(`[AUTH DEBUG] Clerk userId: ${req.auth.userId}`);
    }
    
    // Check for Clerk authenticated user first (highest priority)
    // req.auth is populated by clerkMiddleware() from @clerk/express
    if (req.auth && req.auth.userId) {
      const clerkId = req.auth.userId;
      
      // Find or create user in MongoDB
      let user = await User.findOne({ clerkId });
      
      console.log(`[AUTH DEBUG] MongoDB user found: ${!!user}`);
      
      if (!user) {
        // Auto-create user from Clerk data if not exists
        // This handles cases where Clerk webhook didn't fire or was missed
        user = await User.create({
          clerkId,
          email: req.headers['x-user-email'] || `${clerkId}@clerk.generated`,
          name: req.headers['x-user-name'] || 'User',
          avatar: req.headers['x-user-avatar'] || '',
          role: 'user', // Default role - admin must be set manually in MongoDB
        });
        console.log(`[AUTH DEBUG] Created new user: ${user._id}`);
      }
      
      req.user = user;
      return next();
    }
    
    // Check for guest user (lower priority than Clerk)
    const guestId = req.headers['x-guest-id'];
    console.log(`[AUTH DEBUG] x-guest-id present: ${!!guestId}`);
    
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
    
    // No authentication found
    console.log(`[AUTH DEBUG] No authentication found - returning 401`);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  } catch (error) {
    console.error('[AUTH] Error in protect middleware:', error.message);
    console.error('[AUTH] Error stack:', error.stack);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

/**
 * authorize middleware - Role-based access control
 * Must be used after protect middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};

/**
 * optionalAuth middleware - Attaches user if available, but doesn't require auth
 * Used for routes that work with both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Try Clerk auth first
    if (req.auth && req.auth.userId) {
      req.user = await User.findOne({ clerkId: req.auth.userId });
    } else {
      // Try guest ID
      const guestId = req.headers['x-guest-id'];
      if (guestId) {
        req.user = await User.findOne({ guestId, isGuest: true });
      }
    }
  } catch (error) {
    // Continue without user - this is optional auth
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };

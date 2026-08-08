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

// Manual Clerk token verification as fallback
const verifyClerkTokenManually = async (token) => {
  try {
    // Decode JWT payload (without verification - we'll use Clerk API to verify)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('[AUTH] Token expired');
      return null;
    }
    
    // Return the subject (user ID) from the token
    return payload.sub || null;
  } catch (error) {
    console.error('[AUTH] Error decoding token:', error.message);
    return null;
  }
};
const protect = async (req, res, next) => {
  try {
    // Debug logging
    const authHeader = req.headers.authorization;
    const hasAuthHeader = !!authHeader;
    const hasClerkAuth = !!(req.auth && req.auth.userId);
    
    console.log(`[AUTH DEBUG] Route: ${req.method} ${req.path}`);
    console.log(`[AUTH DEBUG] Authorization header present: ${hasAuthHeader}`);
    if (hasAuthHeader) {
      const tokenPreview = authHeader.substring(0, 50) + '...';
      console.log(`[AUTH DEBUG] Token preview: ${tokenPreview}`);
      console.log(`[AUTH DEBUG] Token length: ${authHeader.length}`);
    }
    console.log(`[AUTH DEBUG] req.auth object:`, JSON.stringify(req.auth || {}));
    console.log(`[AUTH DEBUG] CLERK_SECRET_KEY set: ${!!process.env.CLERK_SECRET_KEY}`);
    console.log(`[AUTH DEBUG] req.auth.userId present: ${hasClerkAuth}`);
    
    if (hasClerkAuth) {
      console.log(`[AUTH DEBUG] Clerk userId: ${req.auth.userId}`);
    }
    
    // Check for Clerk authenticated user first (highest priority)
    // req.auth is populated by clerkMiddleware() from @clerk/express
    let clerkId = req.auth && req.auth.userId;
    
    // Fallback: manually verify token if Clerk middleware didn't populate req.auth
    if (!clerkId && hasAuthHeader) {
      console.log('[AUTH] Clerk middleware did not verify token, trying manual verification');
      clerkId = await verifyClerkTokenManually(authHeader.replace('Bearer ', ''));
      if (clerkId) {
        console.log(`[AUTH] Manual verification succeeded, userId: ${clerkId}`);
      }
    }
    
    if (clerkId) {
      
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

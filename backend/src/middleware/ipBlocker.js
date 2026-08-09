const BlockedIP = require('../models/BlockedIP');

// In-memory cache for blocked IPs (faster than DB lookup on every request)
const blockedIPCache = new Map();
const suspiciousActivityCache = new Map();

// Cleanup cache every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of blockedIPCache.entries()) {
    if (data.blockedUntil && data.blockedUntil < now) {
      blockedIPCache.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware to check if IP is blocked
 */
const checkBlockedIP = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  
  // Check cache first (fast)
  const cachedBlock = blockedIPCache.get(ip);
  if (cachedBlock) {
    if (!cachedBlock.blockedUntil || cachedBlock.blockedUntil > Date.now()) {
      console.log(`[SECURITY] Blocked IP attempted access: ${ip}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Your IP has been blocked due to suspicious activity.'
      });
    } else {
      // Block expired, remove from cache
      blockedIPCache.delete(ip);
    }
  }

  // Check database (slower, but persistent)
  const blockedIP = await BlockedIP.findOne({ 
    ip, 
    isActive: true,
    $or: [
      { blockedUntil: null }, // Permanent block
      { blockedUntil: { $gt: new Date() } } // Temporary block not expired
    ]
  });

  if (blockedIP) {
    // Cache for faster future lookups
    blockedIPCache.set(ip, {
      blockedUntil: blockedIP.blockedUntil,
      reason: blockedIP.reason
    });
    
    console.log(`[SECURITY] Blocked IP attempted access: ${ip} (Reason: ${blockedIP.reason})`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your IP has been blocked due to suspicious activity.'
    });
  }

  // Store IP for suspicious activity tracking
  req.clientIP = ip;
  next();
};

/**
 * Track suspicious activity and auto-block if threshold exceeded
 */
const trackSuspiciousActivity = async (req, res, next) => {
  const ip = req.clientIP || req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Initialize or get activity data
  if (!suspiciousActivityCache.has(ip)) {
    suspiciousActivityCache.set(ip, {
      requests: [],
      failedLogins: 0,
      suspiciousPaths: 0,
      lastReset: now
    });
  }
  
  const activity = suspiciousActivityCache.get(ip);
  
  // Reset counters every 15 minutes
  if (now - activity.lastReset > 15 * 60 * 1000) {
    activity.requests = [];
    activity.failedLogins = 0;
    activity.suspiciousPaths = 0;
    activity.lastReset = now;
  }
  
  // Track request
  activity.requests.push(now);
  activity.requests = activity.requests.filter(t => now - t < 60000); // Keep last minute
  
  // Check for suspicious patterns
  const isSuspiciousPath = /(\.\.|\/etc\/|\/proc\/|\/sys\/|<script|javascript:|onerror=|onload=)/i.test(req.originalUrl);
  const isSQLInjectionAttempt = /(union\s+select|insert\s+into|delete\s+from|drop\s+table|update\s+.*set)/i.test(req.originalUrl + JSON.stringify(req.body));
  const isXSSAttempt = /(<script|javascript:|onerror=|onload=|onclick=|onmouse)/i.test(req.originalUrl + JSON.stringify(req.body));
  
  if (isSuspiciousPath) activity.suspiciousPaths++;
  if (isSQLInjectionAttempt || isXSSAttempt) {
    activity.suspiciousPaths += 5; // Higher weight for injection attempts
  }
  
  // Auto-block conditions
  const shouldBlock = 
    activity.requests.length > 100 || // More than 100 requests per minute
    activity.suspiciousPaths > 5 || // Multiple suspicious path attempts
    activity.failedLogins > 10; // More than 10 failed login attempts
  
  if (shouldBlock) {
    const reason = activity.suspiciousPaths > 5 ? 'suspicious_activity' : 
                   activity.failedLogins > 10 ? 'brute_force' : 'rate_limit_abuse';
    
    // Block for 1 hour
    const blockedUntil = new Date(now + 60 * 60 * 1000);
    
    try {
      await BlockedIP.findOneAndUpdate(
        { ip },
        {
          ip,
          reason,
          blockedBy: 'system',
          requestCount: activity.requests.length,
          failedAttempts: activity.failedLogins,
          lastActivity: new Date(),
          blockedUntil,
          isActive: true,
          userAgent: req.headers['user-agent'],
          $push: { 
            requestedPaths: { $each: [req.originalUrl], $slice: -10 } 
          }
        },
        { upsert: true, new: true }
      );
      
      // Cache the block
      blockedIPCache.set(ip, { blockedUntil, reason });
      
      console.log(`[SECURITY] Auto-blocked IP: ${ip} (Reason: ${reason}, Requests: ${activity.requests.length})`);
      
      // Reset activity
      suspiciousActivityCache.delete(ip);
      
      return res.status(403).json({
        success: false,
        message: 'Access denied due to suspicious activity. Try again later.'
      });
    } catch (error) {
      console.error('[SECURITY] Error blocking IP:', error);
    }
  }
  
  next();
};

/**
 * Track failed login attempts
 */
const trackFailedLogin = (ip) => {
  const activity = suspiciousActivityCache.get(ip) || {
    requests: [],
    failedLogins: 0,
    suspiciousPaths: 0,
    lastReset: Date.now()
  };
  activity.failedLogins++;
  suspiciousActivityCache.set(ip, activity);
};

/**
 * Get blocked IPs list (for admin)
 */
const getBlockedIPs = async () => {
  return BlockedIP.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Block IP manually (for admin)
 */
const blockIP = async (ip, reason, blockedBy, notes, duration) => {
  const blockedUntil = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;
  
  return BlockedIP.findOneAndUpdate(
    { ip },
    {
      ip,
      reason,
      blockedBy: blockedBy || 'admin',
      blockedUntil,
      isActive: true,
      notes,
      lastActivity: new Date()
    },
    { upsert: true, new: true }
  );
};

/**
 * Unblock IP (for admin)
 */
const unblockIP = async (ip) => {
  blockedIPCache.delete(ip);
  return BlockedIP.findOneAndUpdate(
    { ip },
    { isActive: false },
    { new: true }
  );
};

/**
 * Get suspicious activity stats
 */
const getActivityStats = () => {
  const stats = {
    blockedIPs: blockedIPCache.size,
    suspiciousIPs: suspiciousActivityCache.size,
  };
  return stats;
};

module.exports = {
  checkBlockedIP,
  trackSuspiciousActivity,
  trackFailedLogin,
  getBlockedIPs,
  blockIP,
  unblockIP,
  getActivityStats
};

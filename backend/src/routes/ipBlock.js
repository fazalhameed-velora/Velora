const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getBlockedIPs, 
  blockIP, 
  unblockIP, 
  getActivityStats 
} = require('../middleware/ipBlocker');
const BlockedIP = require('../models/BlockedIP');

// Get all blocked IPs (admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const blockedIPs = await BlockedIP.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(100);
    
    const stats = getActivityStats();
    
    res.json({
      success: true,
      data: {
        blockedIPs,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get IP activity logs
router.get('/logs', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await BlockedIP.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await BlockedIP.countDocuments();
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Block an IP manually
router.post('/block', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { ip, reason, notes, duration } = req.body;
    
    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address is required' });
    }
    
    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ success: false, message: 'Invalid IP address format' });
    }
    
    const blocked = await blockIP(
      ip,
      reason || 'manual_block',
      'admin',
      notes,
      duration
    );
    
    res.json({
      success: true,
      message: `IP ${ip} has been blocked`,
      data: blocked
    });
  } catch (error) {
    next(error);
  }
});

// Unblock an IP
router.post('/unblock', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address is required' });
    }
    
    const result = await unblockIP(ip);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'IP not found in blocklist' });
    }
    
    res.json({
      success: true,
      message: `IP ${ip} has been unblocked`
    });
  } catch (error) {
    next(error);
  }
});

// Get security stats
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const totalBlocked = await BlockedIP.countDocuments({ isActive: true });
    const autoBlocked = await BlockedIP.countDocuments({ isActive: true, blockedBy: 'system' });
    const manualBlocked = await BlockedIP.countDocuments({ isActive: true, blockedBy: 'admin' });
    
    const recentBlocks = await BlockedIP.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const reasonStats = await BlockedIP.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalBlocked,
        autoBlocked,
        manualBlocked,
        recentBlocks,
        reasonStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

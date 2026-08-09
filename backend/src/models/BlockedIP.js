const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ip: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  reason: { 
    type: String, 
    required: true,
    enum: ['brute_force', 'suspicious_activity', 'manual_block', 'rate_limit_abuse', 'sql_injection_attempt', 'xss_attempt', 'other']
  },
  blockedBy: { 
    type: String, 
    default: 'system' // 'system' for auto-blocked, 'admin' for manual blocks
  },
  requestCount: { 
    type: Number, 
    default: 0 
  },
  failedAttempts: { 
    type: Number, 
    default: 0 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  blockedUntil: { 
    type: Date, 
    default: null // null = permanent block
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  notes: String,
  userAgent: String,
  requestedPaths: [String],
}, { timestamps: true });

// Index for efficient queries
blockedIPSchema.index({ ip: 1, isActive: 1 });
blockedIPSchema.index({ blockedUntil: 1 }); // For cleanup of expired blocks

module.exports = mongoose.model('BlockedIP', blockedIPSchema);

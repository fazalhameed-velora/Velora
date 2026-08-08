const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  // Event identification
  eventId: { type: String, required: true, unique: true }, // Svix event ID
  eventType: { type: String, required: true, index: true },
  
  // Event payload
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'dead_letter'],
    default: 'pending',
    index: true,
  },
  
  // Retry tracking
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 5 },
  
  // Error tracking
  lastError: { type: String },
  errorHistory: [{
    attempt: Number,
    error: String,
    timestamp: { type: Date, default: Date.now },
  }],
  
  // Timing
  nextRetryAt: { type: Date, index: true },
  completedAt: { type: Date },
  
  // Source tracking
  source: { type: String, default: 'clerk' },
  
  // Dead letter queue fields
  deadLetterReason: { type: String },
  deadLetterAt: { type: Date },
  
}, { timestamps: true });

// Index for efficient retry processing
webhookEventSchema.index({ status: 1, nextRetryAt: 1 });
webhookEventSchema.index({ status: 1, createdAt: 1 });

// Method to mark as processing
webhookEventSchema.methods.markProcessing = function() {
  this.status = 'processing';
  return this.save();
};

// Method to mark as completed
webhookEventSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark as failed and schedule retry
webhookEventSchema.methods.markFailed = function(error) {
  this.retryCount += 1;
  this.lastError = error;
  this.errorHistory.push({
    attempt: this.retryCount,
    error: error,
    timestamp: new Date(),
  });
  
  if (this.retryCount >= this.maxRetries) {
    // Move to dead letter queue
    this.status = 'dead_letter';
    this.deadLetterReason = `Max retries (${this.maxRetries}) exceeded. Last error: ${error}`;
    this.deadLetterAt = new Date();
  } else {
    // Schedule retry with exponential backoff
    this.status = 'failed';
    const backoffMs = Math.pow(2, this.retryCount) * 1000; // 2^retryCount seconds
    const maxBackoffMs = 30 * 60 * 1000; // 30 minutes max
    this.nextRetryAt = new Date(Date.now() + Math.min(backoffMs, maxBackoffMs));
  }
  
  return this.save();
};

// Method to reset for manual retry
webhookEventSchema.methods.resetForRetry = function() {
  this.status = 'pending';
  this.retryCount = 0;
  this.lastError = null;
  this.errorHistory = [];
  this.nextRetryAt = new Date();
  this.deadLetterReason = null;
  this.deadLetterAt = null;
  return this.save();
};

// Static method to get events ready for retry
webhookEventSchema.statics.getRetryableEvents = function(limit = 10) {
  return this.find({
    status: 'failed',
    nextRetryAt: { $lte: new Date() },
    retryCount: { $lt: this.schema.path('maxRetries').defaultValue },
  })
  .sort({ nextRetryAt: 1 })
  .limit(limit);
};

// Static method to get dead letter events
webhookEventSchema.statics.getDeadLetterEvents = function(limit = 50) {
  return this.find({ status: 'dead_letter' })
    .sort({ deadLetterAt: -1 })
    .limit(limit);
};

// Static method to get event statistics
webhookEventSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const result = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    dead_letter: 0,
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);

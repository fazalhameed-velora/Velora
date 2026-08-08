const WebhookEvent = require('../models/WebhookEvent');
const User = require('../models/User');

/**
 * Webhook Queue Service
 * 
 * Handles webhook event processing with:
 * - Immediate processing for new events
 * - Retry queue with exponential backoff for failed events
 * - Dead letter queue for permanently failed events
 * - Statistics and monitoring
 */
class WebhookQueueService {
  constructor() {
    this.isProcessing = false;
    this.processingInterval = null;
  }

  /**
   * Start the retry processor
   * Checks for failed events every 30 seconds
   */
  startRetryProcessor(intervalMs = 30000) {
    if (this.processingInterval) {
      console.log('[WEBHOOK QUEUE] Retry processor already running');
      return;
    }

    console.log(`[WEBHOOK QUEUE] Starting retry processor (interval: ${intervalMs}ms)`);
    
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processRetries();
      }
    }, intervalMs);

    // Process immediately on start
    this.processRetries();
  }

  /**
   * Stop the retry processor
   */
  stopRetryProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[WEBHOOK QUEUE] Retry processor stopped');
    }
  }

  /**
   * Enqueue a new webhook event
   */
  async enqueueEvent(eventId, eventType, data) {
    try {
      // Check if event already exists (idempotency)
      const existing = await WebhookEvent.findOne({ eventId });
      if (existing) {
        console.log(`[WEBHOOK QUEUE] Event ${eventId} already exists, skipping`);
        return existing;
      }

      const event = new WebhookEvent({
        eventId,
        eventType,
        data,
        status: 'pending',
        nextRetryAt: new Date(),
      });

      await event.save();
      console.log(`[WEBHOOK QUEUE] Event ${eventId} (${eventType}) enqueued`);
      
      // Process immediately
      await this.processEvent(event);
      
      return event;
    } catch (error) {
      console.error(`[WEBHOOK QUEUE] Error enqueueing event ${eventId}:`, error.message);
      throw error;
    }
  }

  /**
   * Process a single webhook event
   */
  async processEvent(event) {
    try {
      await event.markProcessing();
      
      const { eventType, data } = event;
      console.log(`[WEBHOOK QUEUE] Processing event: ${eventType} (${event.eventId})`);

      switch (eventType) {
        case 'user.created':
          await this.handleUserCreated(data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(data);
          break;
        case 'session.created':
          await this.handleSessionCreated(data);
          break;
        default:
          console.log(`[WEBHOOK QUEUE] Unhandled event type: ${eventType}`);
      }

      await event.markCompleted();
      console.log(`[WEBHOOK QUEUE] Event ${event.eventId} processed successfully`);
      
      return true;
    } catch (error) {
      console.error(`[WEBHOOK QUEUE] Error processing event ${event.eventId}:`, error.message);
      await event.markFailed(error.message);
      return false;
    }
  }

  /**
   * Process failed events (retry queue)
   */
  async processRetries() {
    try {
      this.isProcessing = true;
      
      const retryableEvents = await WebhookEvent.getRetryableEvents(10);
      
      if (retryableEvents.length === 0) {
        return;
      }

      console.log(`[WEBHOOK QUEUE] Processing ${retryableEvents.length} retryable events`);
      
      for (const event of retryableEvents) {
        await this.processEvent(event);
        // Small delay between retries to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('[WEBHOOK QUEUE] Error processing retries:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle user.created event
   */
  async handleUserCreated(data) {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address || '',
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
        avatar: data.image_url || '',
        role: 'user',
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Handle user.updated event
   */
  async handleUserUpdated(data) {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: data.email_addresses?.[0]?.email_address,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        avatar: data.image_url,
      }
    );
  }

  /**
   * Handle user.deleted event
   */
  async handleUserDeleted(data) {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      { isActive: false }
    );
  }

  /**
   * Handle session.created event
   */
  async handleSessionCreated(data) {
    // Optional: Track user sessions
    console.log(`[WEBHOOK QUEUE] Session created for user: ${data.user_id}`);
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    return await WebhookEvent.getStats();
  }

  /**
   * Get dead letter events
   */
  async getDeadLetterEvents(limit = 50) {
    return await WebhookEvent.getDeadLetterEvents(limit);
  }

  /**
   * Retry a specific dead letter event
   */
  async retryDeadLetterEvent(eventId) {
    const event = await WebhookEvent.findOne({ eventId, status: 'dead_letter' });
    if (!event) {
      throw new Error(`Dead letter event ${eventId} not found`);
    }
    
    await event.resetForRetry();
    await this.processEvent(event);
    
    return event;
  }

  /**
   * Retry all dead letter events
   */
  async retryAllDeadLetterEvents() {
    const deadLetterEvents = await WebhookEvent.find({ status: 'dead_letter' });
    
    console.log(`[WEBHOOK QUEUE] Retrying ${deadLetterEvents.length} dead letter events`);
    
    for (const event of deadLetterEvents) {
      await event.resetForRetry();
      await this.processEvent(event);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return deadLetterEvents.length;
  }

  /**
   * Clean up old completed events (older than 30 days)
   */
  async cleanupOldEvents(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await WebhookEvent.deleteMany({
      status: 'completed',
      completedAt: { $lt: cutoffDate },
    });
    
    console.log(`[WEBHOOK QUEUE] Cleaned up ${result.deletedCount} old events`);
    return result.deletedCount;
  }
}

// Export singleton instance
module.exports = new WebhookQueueService();

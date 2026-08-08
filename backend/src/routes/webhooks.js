const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const webhookQueue = require('../services/webhookQueue');
const WebhookEvent = require('../models/WebhookEvent');

/**
 * Webhook Admin Routes
 * 
 * These routes are for monitoring and managing webhook events.
 * All routes require admin authentication.
 */

// GET /api/webhooks/stats - Get webhook queue statistics
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await webhookQueue.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error getting stats:', error.message);
    res.status(500).json({ success: false, message: 'Error getting webhook stats' });
  }
});

// GET /api/webhooks/dead-letter - Get dead letter queue events
router.get('/dead-letter', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = await webhookQueue.getDeadLetterEvents(limit);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error getting dead letter events:', error.message);
    res.status(500).json({ success: false, message: 'Error getting dead letter events' });
  }
});

// POST /api/webhooks/retry/:eventId - Retry a specific dead letter event
router.post('/retry/:eventId', protect, authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await webhookQueue.retryDeadLetterEvent(eventId);
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error retrying event:', error.message);
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/webhooks/retry-all - Retry all dead letter events
router.post('/retry-all', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await webhookQueue.retryAllDeadLetterEvents();
    res.json({ success: true, data: { retriedCount: count } });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error retrying all events:', error.message);
    res.status(500).json({ success: false, message: 'Error retrying events' });
  }
});

// GET /api/webhooks/recent - Get recent webhook events
router.get('/recent', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const events = await WebhookEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-data'); // Exclude large data payload for list view
    
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error getting recent events:', error.message);
    res.status(500).json({ success: false, message: 'Error getting recent events' });
  }
});

// GET /api/webhooks/event/:eventId - Get specific webhook event details
router.get('/event/:eventId', protect, authorize('admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await WebhookEvent.findOne({ eventId });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error getting event:', error.message);
    res.status(500).json({ success: false, message: 'Error getting event' });
  }
});

// DELETE /api/webhooks/cleanup - Clean up old completed events
router.delete('/cleanup', protect, authorize('admin'), async (req, res) => {
  try {
    const daysOld = parseInt(req.query.days) || 30;
    const deletedCount = await webhookQueue.cleanupOldEvents(daysOld);
    res.json({ success: true, data: { deletedCount } });
  } catch (error) {
    console.error('[WEBHOOK ADMIN] Error cleaning up events:', error.message);
    res.status(500).json({ success: false, message: 'Error cleaning up events' });
  }
});

module.exports = router;

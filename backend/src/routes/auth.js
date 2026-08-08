const router = require('express').Router();
const User = require('../models/User');
const { Webhook } = require('svix');
const webhookQueue = require('../services/webhookQueue');

// Guest creation endpoint
router.post('/guest', async (req, res) => {
  try {
    const guestId = 'guest_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    let guest = await User.findOne({ guestId, isGuest: true });
    if (!guest) {
      guest = await User.create({
        guestId,
        email: `guest_${guestId}@guest.local`,
        name: 'Guest',
        isGuest: true,
      });
    }
    res.json({ success: true, data: { guestId, user: guest } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Clerk Webhook Endpoint
 * 
 * This endpoint receives events from Clerk when users sign up, update their profile, or delete their account.
 * 
 * IMPORTANT SECURITY NOTES:
 * - This endpoint requires raw body for signature verification
 * - The webhook secret (CLERK_WEBHOOK_SECRET) must be set in environment variables
 * - Svix signature verification prevents spoofing attacks
 * 
 * To set up in Clerk Dashboard:
 * 1. Go to https://dashboard.clerk.com
 * 2. Select your application
 * 3. Go to Webhooks in the sidebar
 * 4. Add endpoint: https://your-backend-url/api/auth/clerk-webhook
 * 5. Select events: user.created, user.updated, user.deleted
 * 6. Copy the signing secret and add it as CLERK_WEBHOOK_SECRET in your Render environment variables
 */
router.post('/clerk-webhook', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('[WEBHOOK] Missing CLERK_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ success: false, message: 'Webhook not configured' });
  }

  // Get Svix headers from the request
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  // Check for missing headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[WEBHOOK] Missing Svix headers');
    return res.status(400).json({ success: false, message: 'Missing webhook headers' });
  }

  // Get the raw body (Buffer)
  const payload = req.body;
  const bodyString = payload.toString();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    // Verify the payload against the headers
    evt = wh.verify(bodyString, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    // Verification failed (spoofing attempt, invalid signature, or expired timestamp)
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Webhook verification failed',
    });
  }

  // Safely process the verified event
  const eventType = evt.type;
  const eventData = evt.data;
  const svixId = req.headers['svix-id'];

  console.log(`[WEBHOOK] Received event: ${eventType} for user: ${eventData.id}`);

  try {
    // Enqueue the event for processing with retry support
    await webhookQueue.enqueueEvent(svixId, eventType, eventData);
    
    // Return success immediately - processing happens asynchronously
    res.json({ success: true });
  } catch (error) {
    console.error(`[WEBHOOK] Error enqueueing ${eventType}:`, error.message);
    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
});

module.exports = router;

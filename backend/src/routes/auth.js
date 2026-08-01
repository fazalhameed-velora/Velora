const router = require('express').Router();
const User = require('../models/User');

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

router.post('/clerk-webhook', async (req, res) => {
  try {
    const { data, type } = req.body;
    if (type === 'user.created') {
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
          avatar: data.image_url || '',
        },
        { upsert: true, new: true }
      );
    }
    if (type === 'user.updated') {
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          avatar: data.image_url,
        }
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

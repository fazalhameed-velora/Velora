const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  image: { url: String, alt: String },
  link: String,
  position: { type: String, enum: ['hero', 'promo', 'sidebar'], default: 'hero' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  // Analytics tracking
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  lastClickedAt: Date,
  lastImpressionAt: Date,
}, { timestamps: true });

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);

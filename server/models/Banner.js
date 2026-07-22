const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  eyebrow: String,          // "SOFTNESS YOU CAN HUG"
  heading: String,          // "Cute Friends"
  highlightWord: String,    // "Every Mood!" (rendered in pink)
  subtext: String,
  image: String,            // S3 URL
  discountBadgeText: String,// "UP TO 40% OFF"
  ctaPrimaryText: String, 
  ctaPrimaryLink: String,
  ctaSecondaryText: String, 
  ctaSecondaryLink: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  scheduleStart: Date, 
  scheduleEnd: Date,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);

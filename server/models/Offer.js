const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  type: { type: String, enum: ['coupon', 'combo', 'sale'], default: 'coupon' },
  code: { type: String, uppercase: true, unique: true, sparse: true },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  
  // Keep legacy fields in case they were used elsewhere
  validFrom: { type: Date },
  validTill: { type: Date },
  usageLimitPerUser: { type: Number },
  totalUsageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);

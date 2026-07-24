const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String },
  highlights: [{ type: String }],
  specifications: [{ 
    name: { type: String },
    value: { type: String }
  }],
  images: [{ type: String }], // S3 URLs, max 5
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  stock: { type: Number, default: 0 },
  sku: { type: String },
  tags: [{ type: String, enum: ['bestseller', 'new-arrival', 'combo', 'featured', 'limited-edition', 'discounted', 'trending'] }],
  bestSellerRank: { type: Number },
  activeOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  offerPrice: { type: Number },
  ageGroup: { type: String, enum: ['0-18 months', '18-36 months', '3-5 years', '9-12 years', '12+ years', 'Kids', 'All Ages'] },
  gender: { type: String, enum: ['Unisex', 'Girls', 'Boys'] },
  size: { type: String, enum: ['Small (0-20 cm)', 'Medium (20-40 cm)', 'Large (40-60 cm)', 'Extra Large (60 cm+)'] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Pre-save to compute discount percentage
productSchema.pre('save', function() {
  if (this.mrp && this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
});

module.exports = mongoose.model('Product', productSchema);

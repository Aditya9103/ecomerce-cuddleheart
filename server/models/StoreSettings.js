const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Cuddle Hearts' },
  tagline: { type: String, default: 'Bringing Smiles, Everytime!' },
  logo: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  freeShippingThreshold: { type: Number, default: 999 },
  codEnabled: { type: Boolean, default: true },
  onlineEnabled: { type: Boolean, default: false }, // flips true after Razorpay phase
  announcementMessages: [{ type: String }],
  socialLinks: { 
    facebook: String, 
    instagram: String, 
    pinterest: String, 
    youtube: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

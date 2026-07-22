const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  subscribedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Newsletter', newsletterSchema);

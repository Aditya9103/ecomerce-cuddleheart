const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
    name: String, 
    image: String, 
    quantity: Number, 
    price: Number 
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'RAZORPAY'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String }, 
  razorpayPaymentId: { type: String }, 
  razorpaySignature: { type: String },
  orderStatus: { type: String, default: 'Processing' },
  shippingAddress: { 
    fullName: String,
    phone: String,
    pincode: String,
    flatHouse: String,
    areaStreet: String,
    landmark: String,
    city: String,
    state: String,
    label: String
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

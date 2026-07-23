const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const StoreSettings = require('../models/StoreSettings');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const sendEmail = require('../utils/sendEmail');
const { generateInvoice } = require('../utils/generateInvoice');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

const calculateSecureOrderData = async (orderItems, couponCode, session) => {
  if (!orderItems || orderItems.length === 0) {
    throw new Error('No order items');
  }

  const items = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product).populate('activeOffer').session(session);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (product.stock < item.qty) throw new Error(`Insufficient stock for product: ${product.name}`);

    const priceToUse = (product.activeOffer && product.offerPrice) ? product.offerPrice : product.price;
    itemsPrice += priceToUse * item.qty;

    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      quantity: item.qty,
      price: priceToUse
    });
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 50;
  let discount = 0;

  if (couponCode) {
    const offer = await Offer.findOne({ 
      code: couponCode, 
      type: 'coupon', 
      isActive: true 
    }).session(session);
    
    if (offer) {
      if (itemsPrice >= (offer.minPurchaseAmount || 0)) {
        if (offer.discountType === 'percentage') {
          discount = Math.round((itemsPrice * offer.discountValue) / 100);
        } else if (offer.discountType === 'fixed') {
          discount = Math.round(offer.discountValue);
        }
      }
    }
  }

  const totalAmount = Math.round((itemsPrice + shippingPrice) - discount);

  return { items, itemsPrice, shippingPrice, discount, totalAmount };
};

const sendOrderConfirmation = async (order) => {
  try {
    const storeSettings = await StoreSettings.findOne() || {};
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    
    // Generate PDF to a buffer
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      generateInvoice(
        populatedOrder,
        storeSettings,
        (chunk) => chunks.push(chunk),
        () => resolve(Buffer.concat(chunks))
      );
    });

    const message = `Your order ${order._id} has been successfully placed.`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Your order ID is <strong>${order._id}</strong>.</p>
        <p>Please find your official tax invoice attached to this email.</p>
      </div>
    `;

    await sendEmail({
      email: populatedOrder.user.email,
      subject: `Order Confirmation - ${order._id}`,
      message,
      html,
      attachments: [
        {
          filename: `Invoice-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponApplied
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Only COD is currently supported.' });
    }

    const { items, itemsPrice, shippingPrice, discount, totalAmount } = await calculateSecureOrderData(orderItems, couponApplied, null);

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: itemsPrice,
      shippingFee: shippingPrice,
      totalAmount,
      couponCode: couponApplied,
      discount: discount > 0 ? discount : 0,
      paymentStatus: 'pending',
    });

    const createdOrder = await order.save();

    // Clear the user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    sendOrderConfirmation(createdOrder);

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (order && (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      const oldStatus = order.orderStatus;
      const newStatus = req.body.orderStatus || order.orderStatus;
      
      order.orderStatus = newStatus;
      
      if (newStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        
        if (order.paymentMethod === 'COD' && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();

      // Send email if status changed
      if (oldStatus !== newStatus && order.user && order.user.email) {
        try {
          const message = `Hello ${order.user.name},\n\nYour order (ID: ${order._id}) status has been updated to: ${newStatus}.\n\nThank you for shopping with Cuddle Hearts!`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #EC4899; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Order Status Update</h1>
              </div>
              <div style="padding: 32px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #374151;">Hello <strong>${order.user.name}</strong>,</p>
                <p style="font-size: 16px; color: #4B5563; line-height: 1.5;">Great news! The status for your order <strong>#${order._id.toString().substring(0,8)}</strong> has been updated.</p>
                
                <div style="background-color: #FDF2F8; border: 1px solid #FCE7F3; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                  <span style="font-size: 12px; color: #DB2777; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Current Status</span><br/>
                  <span style="font-size: 28px; color: #BE185D; font-weight: 900; text-transform: capitalize; display: inline-block; margin-top: 8px;">${newStatus}</span>
                </div>
                
                <p style="font-size: 14px; color: #6B7280; text-align: center; margin-top: 30px;">Thank you for shopping with Cuddle Hearts!<br/>We hope you love your new cuddly companion.</p>
              </div>
            </div>
          `;
          await sendEmail({
            email: order.user.email,
            subject: `Order Update: ${newStatus} 🧸`,
            message,
            html
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/orders/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesAgg[0] ? totalSalesAgg[0].total : 0;
    
    // Total Customers
    const User = require('../models/User'); // inline require to avoid circular deps if any
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Recent Orders
    const recentOrders = await Order.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(5);

    // Simple top products based on DB or just return latest products
    const Product = require('../models/Product');
    const topProducts = await Product.find({}).sort({ bestSellerRank: -1 }).limit(5);

    res.json({
      totalOrders,
      totalSales,
      totalCustomers,
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay order
// @route   POST /api/orders/razorpay/create
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderItems, shippingAddress, couponApplied } = req.body;
    if (orderItems && orderItems.length === 0) {
      throw new Error('No order items');
    }

    // 1. Calculate Secure Prices and Verify Stock
    const { items, itemsPrice, shippingPrice, discount, totalAmount } = await calculateSecureOrderData(orderItems, couponApplied, session);

    // 2. Create Razorpay Order
    const options = {
      amount: totalAmount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`
    };
    
    const razorpayOrder = await razorpay.orders.create(options);

    // 3. Create Pending Order in DB
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: 'RAZORPAY',
      subtotal: itemsPrice,
      shippingFee: shippingPrice,
      totalAmount,
      couponCode: couponApplied,
      discount: discount > 0 ? discount : 0,
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      orderStatus: 'Processing'
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/razorpay/verify
// @access  Private
const verifyRazorpayPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', env.RAZORPAY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Find the order
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id }).session(session);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentStatus === 'paid' || order.isPaid) {
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({ message: 'Order already verified by webhook', orderId: order._id });
      }

      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.isPaid = true;
      order.paidAt = Date.now();
      
      await order.save({ session });
      
      sendOrderConfirmation(order);

      // Decrement Stock
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock = product.stock - item.quantity;
          await product.save({ session });
        }
      }

      // Clear the user's cart
      const cart = await Cart.findOne({ user: req.user._id }).session(session);
      if (cart) {
        cart.items = [];
        await cart.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({ message: 'Payment verified successfully', orderId: order._id });
    } else {
      throw new Error('Invalid signature');
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    next(error);
  }
};

// @desc    Razorpay Webhook handler for robust background verification
// @route   POST /api/orders/razorpay/webhook
// @access  Public
const razorpayWebhook = async (req, res, next) => {
  const secret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.rawBody || JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    
    if (event === 'payment.captured' || event === 'payment.authorized' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const order = await Order.findOne({ razorpayOrderId }).session(session);
        
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'paid';
          order.razorpayPaymentId = paymentEntity.id;
          order.isPaid = true;
          order.paidAt = Date.now();
          
          await order.save({ session });

          // Decrement Stock
          for (const item of order.items) {
            const product = await Product.findById(item.product).session(session);
            if (product) {
              product.stock = product.stock - item.quantity;
              await product.save({ session });
            }
          }

          // Clear the user's cart
          const cart = await Cart.findOne({ user: order.user }).session(session);
          if (cart) {
            cart.items = [];
            await cart.save({ session });
          }

          await session.commitTransaction();
        } else {
          // If order not found or already paid, just commit empty to release session
          await session.commitTransaction();
        }
      } catch (err) {
        await session.abortTransaction();
        console.error('Webhook processing error:', err);
      } finally {
        session.endSession();
      }
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ status: 'invalid signature' });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const storeSettings = await StoreSettings.findOne() || {};

    const filename = `Invoice-INV-${order._id.toString().slice(-6).toUpperCase()}.pdf`;
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    generateInvoice(
      order,
      storeSettings,
      (chunk) => res.write(chunk),
      () => res.end()
    );
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Server Error generating invoice' });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  downloadInvoice
};

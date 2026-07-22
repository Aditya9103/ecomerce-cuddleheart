const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getDashboardStats, createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, downloadInvoice } = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, requireAdmin, getAllOrders); // Admin get all

router.get('/myorders', protect, getMyOrders);
router.get('/dashboard/stats', protect, requireAdmin, getDashboardStats); // Admin stats
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/razorpay/webhook', razorpayWebhook);

router.route('/:id')
  .get(protect, getOrderById);

router.get('/:id/invoice', protect, downloadInvoice);

router.route('/:id/status')
  .put(protect, requireAdmin, updateOrderStatus); // Admin update status

module.exports = router;

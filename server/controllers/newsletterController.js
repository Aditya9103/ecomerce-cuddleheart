const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    const subscriber = new Newsletter({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter
// @access  Private/Admin
const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribeNewsletter, getSubscribers };

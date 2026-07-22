const ContactMessage = require('../models/ContactMessage');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const contactMsg = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      data: contactMsg
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContactMessage = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    let message = await ContactMessage.findById(req.params.id);

    if (!message) {
      res.status(404);
      throw new Error(`Message not found with id of ${req.params.id}`);
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};

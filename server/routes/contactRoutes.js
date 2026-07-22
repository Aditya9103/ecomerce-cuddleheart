const express = require('express');
const { submitContactMessage, getContactMessages, updateContactMessage } = require('../controllers/contactController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(submitContactMessage)
  .get(protect, requireAdmin, getContactMessages);

router.route('/:id')
  .put(protect, requireAdmin, updateContactMessage);

module.exports = router;

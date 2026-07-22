const express = require('express');
const router = express.Router();
const { subscribeNewsletter, getSubscribers } = require('../controllers/newsletterController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', subscribeNewsletter);
router.get('/', protect, requireAdmin, getSubscribers);

module.exports = router;

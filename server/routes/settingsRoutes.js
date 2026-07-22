const express = require('express');
const router = express.Router();
const { getStoreSettings, updateStoreSettings } = require('../controllers/settingsController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getStoreSettings)
  .put(protect, requireAdmin, updateStoreSettings);

module.exports = router;

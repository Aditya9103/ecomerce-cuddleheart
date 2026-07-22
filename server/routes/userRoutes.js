const express = require('express');
const router = express.Router();
const { getUsers, toggleBlockUser } = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, requireAdmin, getUsers);

router.route('/:id/block')
  .put(protect, requireAdmin, toggleBlockUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { validateCoupon, getPublicOffers, getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { uploadS3 } = require('../utils/uploadFile');

router.post('/validate', protect, validateCoupon);

router.route('/')
  .get(getOffers)
  .post(protect, requireAdmin, uploadS3.single('image'), createOffer);

router.get('/public', getPublicOffers);

router.route('/:id')
  .put(protect, requireAdmin, uploadS3.single('image'), updateOffer)
  .delete(protect, requireAdmin, deleteOffer);

module.exports = router;

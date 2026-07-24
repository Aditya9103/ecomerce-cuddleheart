const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, getCategories, getBanners, createProduct, updateProduct, deleteProduct, createBanner, updateBanner, deleteBanner, createProductReview, getAllReviews, deleteReview } = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { uploadS3 } = require('../utils/uploadFile');

router.route('/reviews/all')
  .get(protect, requireAdmin, getAllReviews);

router.route('/products')
  .get(getProducts)
  .post(protect, requireAdmin, uploadS3.array('images', 5), createProduct);

router.route('/products/:slug')
  .get(getProductBySlug);

router.route('/products/:id')
  .put(protect, requireAdmin, uploadS3.array('images', 5), updateProduct)
  .delete(protect, requireAdmin, deleteProduct);

router.route('/products/:id/reviews')
  .post(protect, createProductReview);

router.route('/products/:productId/reviews/:reviewId')
  .delete(protect, requireAdmin, deleteReview);

router.get('/categories', getCategories);
router.route('/banners')
  .get(getBanners)
  .post(protect, requireAdmin, uploadS3.single('image'), createBanner);

router.route('/banners/:id')
  .put(protect, requireAdmin, uploadS3.single('image'), updateBanner)
  .delete(protect, requireAdmin, deleteBanner);

module.exports = router;

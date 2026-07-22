const express = require('express');
const router = express.Router();
const { createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
// Also need to get Categories. It is in productController, let's keep it there for public, 
// and add the new ones here. We can move getCategories here as well to make it clean.
const { getCategories } = require('../controllers/productController');

const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { uploadS3 } = require('../utils/uploadFile');

router.route('/')
  .get(getCategories)
  .post(protect, requireAdmin, uploadS3.single('image'), createCategory);

router.route('/:id')
  .put(protect, requireAdmin, uploadS3.single('image'), updateCategory)
  .delete(protect, requireAdmin, deleteCategory);

module.exports = router;

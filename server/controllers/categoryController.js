const Category = require('../models/Category');

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, bgColor, displayOrder } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.location; // S3 url
    }

    const category = new Category({
      name,
      slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description,
      image,
      bgColor,
      displayOrder
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      const { name, description, bgColor, displayOrder, isActive } = req.body;

      category.name = name || category.name;
      if (name) {
        category.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      category.description = description !== undefined ? description : category.description;
      category.bgColor = bgColor || category.bgColor;
      category.displayOrder = displayOrder || category.displayOrder;
      category.isActive = isActive !== undefined ? isActive : category.isActive;

      if (req.file) {
        category.image = req.file.location;
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory
};

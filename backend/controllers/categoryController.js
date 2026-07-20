const Category = require('../models/Category');
const { createNotification } = require('./notificationController');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });
    res.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;

    const categoryExists = await Category.findOne({ user: req.user._id, name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists', errors: [] });
    }

    const category = new Category({
      user: req.user._id,
      name,
      color
    });

    const createdCategory = await category.save();
    
    // Create notification
    await createNotification(req.user._id, 'Category Created', `New category "${name}" has been created`, 'success');
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: createdCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found', errors: [] });
    }

    await category.deleteOne();
    
    // Create notification
    await createNotification(req.user._id, 'Category Deleted', `Category "${category.name}" has been deleted`, 'warning');
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found', errors: [] });
    }

    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ user: req.user._id, name });
      if (categoryExists) {
        return res.status(400).json({ success: false, message: 'Category already exists', errors: [] });
      }
      category.name = name;
    }
    
    if (color) {
      category.color = color;
    }

    const updatedCategory = await category.save();
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory
};

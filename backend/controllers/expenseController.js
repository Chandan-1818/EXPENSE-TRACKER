const Expense = require('../models/Expense');
const { createNotification } = require('./notificationController');

// @desc    Get all expenses for a user (with pagination, filtering, sorting, search)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      type, 
      startDate, 
      endDate, 
      search, 
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    let query = { user: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenses = await Expense.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      message: 'Expenses fetched successfully',
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Get a single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found', errors: [] });
    }
    res.json({
      success: true,
      message: 'Expense fetched successfully',
      data: expense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const expense = new Expense({
      user: req.user._id,
      ...req.body
    });

    const createdExpense = await expense.save();
    
    // Create notification
    const type = req.body.type === 'income' ? 'success' : 'info';
    const message = req.body.type === 'income' 
      ? `Income of ₹${req.body.amount} added successfully`
      : `Expense of ₹${req.body.amount} for ${req.body.category} added successfully`;
    await createNotification(req.user._id, 'Expense Added', message, type);
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: createdExpense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found', errors: [] });
    }

    // Check if editing is allowed (within 24 hours of creation)
    const isEditable = Date.now() - new Date(expense.createdAt).getTime() < 24 * 60 * 60 * 1000;
    if (!isEditable) {
      return res.status(403).json({
        success: false,
        message: 'This expense can only be edited within 24 hours of creation.'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Create notification
    await createNotification(req.user._id, 'Expense Updated', `Expense "${updatedExpense.description}" has been updated`, 'info');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found', errors: [] });
    }

    await expense.deleteOne();
    
    // Create notification
    await createNotification(req.user._id, 'Expense Deleted', `Expense "${expense.description}" has been deleted`, 'warning');
    
    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};

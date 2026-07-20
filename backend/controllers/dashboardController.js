const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Start and end of current month for budget calculation
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Use aggregation pipeline for efficient calculation
    const aggregationResult = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                totalExpenses: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                }
              }
            }
          ],
          currentMonthExpenses: [
            {
              $match: {
                type: 'expense',
                date: { $gte: startOfMonth, $lte: endOfMonth }
              }
            },
            {
              $group: {
                _id: null,
                spent: { $sum: '$amount' }
              }
            }
          ],
          categoryTotals: [
            {
              $match: { type: 'expense' }
            },
            {
              $group: {
                _id: '$category',
                amount: { $sum: '$amount' }
              }
            },
            { $sort: { amount: -1 } },
            { $limit: 1 }
          ]
        }
      }
    ]);

    const result = aggregationResult[0];
    const totals = result.totals[0] || { totalIncome: 0, totalExpenses: 0 };
    const currentMonthData = result.currentMonthExpenses[0] || { spent: 0 };
    const topCategoryData = result.categoryTotals[0] || { _id: 'None', amount: 0 };

    // Get user preferences for budget (optimized with lean)
    const user = await User.findById(userId).select('preferences').lean();
    const monthlyBudget = user?.preferences?.monthlyBudget || null;

    const totalIncome = totals.totalIncome;
    const totalExpenses = totals.totalExpenses;
    const currentBalance = totalIncome - totalExpenses;
    const currentMonthExpenses = currentMonthData.spent;

    let budgetProgress = null;
    if (monthlyBudget && monthlyBudget > 0) {
      budgetProgress = (currentMonthExpenses / monthlyBudget) * 100;
    }

    res.json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        totalIncome,
        totalExpenses,
        currentBalance,
        budget: {
          spent: currentMonthExpenses,
          total: monthlyBudget,
          progress: budgetProgress !== null ? (budgetProgress > 100 ? 100 : budgetProgress) : null
        },
        quickStats: {
          topCategory: topCategoryData._id,
          topCategoryAmount: topCategoryData.amount
        }
      }
    });

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats', 
      errors: process.env.NODE_ENV === 'development' ? [error.message, error.stack] : [error.message] 
    });
  }
};

module.exports = {
  getDashboardStats
};

const Expense = require('../models/Expense');
const Category = require('../models/Category');
const User = require('../models/User');

// Helper function to get date range based on timeRange
const getDateRange = (timeRange) => {
  const now = new Date();
  const startDate = new Date();
  let endDate = new Date(now);
  
  switch (timeRange) {
    case 'This Month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'Last Month':
      startDate.setMonth(now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'This Year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
  }
  
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = 'This Month' } = req.query;

    const { startDate, endDate } = getDateRange(timeRange);
    
    // Calculate previous period dates for comparison
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    previousStartDate.setDate(previousStartDate.getDate() - (daysDiff > 0 ? daysDiff : 30));
    previousEndDate.setDate(previousEndDate.getDate() - (daysDiff > 0 ? daysDiff : 30));

    // Use aggregation pipeline for efficient calculation
    const aggregationResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                totalExpense: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                },
                transactionCount: { $sum: 1 }
              }
            }
          ],
          monthlyData: [
            {
              $group: {
                _id: {
                  month: { $month: '$date' },
                  year: { $year: '$date' },
                  monthName: { $arrayElemAt: [['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], { $subtract: [{ $month: '$date' }, 1] }] }
                },
                income: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                expense: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                },
                sortKey: { $min: '$date' }
              }
            },
            { $sort: { sortKey: 1 } },
            {
              $project: {
                _id: 0,
                name: '$_id.monthName',
                income: 1,
                expense: 1
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
            { $limit: 5 }
          ],
          expenseByCategory: [
            {
              $match: { type: 'expense' }
            },
            {
              $group: {
                _id: '$category',
                amount: { $sum: '$amount' }
              }
            }
          ]
        }
      }
    ]);

    // Get previous period expense using aggregation
    const previousPeriodResult = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: previousStartDate, $lte: previousEndDate },
          type: 'expense'
        }
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: '$amount' }
        }
      }
    ]);

    const result = aggregationResult[0];
    const totals = result.totals[0] || { totalIncome: 0, totalExpense: 0, transactionCount: 0 };
    const monthlyData = result.monthlyData || [];
    const topCategories = result.categoryTotals || [];
    const expenseByCategory = result.expenseByCategory || [];
    const previousExpense = previousPeriodResult[0]?.totalExpense || 0;

    const totalIncome = totals.totalIncome;
    const totalExpense = totals.totalExpense;
    const transactionCount = totals.transactionCount;

    // Fetch categories for color mapping (optimized with lean)
    const categories = await Category.find({ user: userId }).lean();
    const categoryColorMap = {};
    categories.forEach(c => {
      categoryColorMap[c.name] = c.color;
    });

    // Build pie data with colors
    const pieData = expenseByCategory.map(cat => ({
      name: cat._id,
      value: cat.amount,
      color: categoryColorMap[cat._id] || '#6366f1'
    }));

    // Build top categories with colors
    const topCategoriesWithColors = topCategories.map(cat => ({
      name: cat._id,
      amount: cat.amount,
      color: categoryColorMap[cat._id] || '#6366f1'
    }));

    // Monthly comparison
    const monthlyComparison = {
      current: totalExpense,
      previous: previousExpense,
      change: previousExpense > 0 ? ((totalExpense - previousExpense) / previousExpense) * 100 : 0
    };

    // KPIs
    const averageSpend = transactionCount > 0 ? totalExpense / transactionCount : 0;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : null;
    
    let highestCategory = null;
    let highestCategoryAmount = 0;
    if (topCategoriesWithColors.length > 0) {
      highestCategory = topCategoriesWithColors[0].name;
      highestCategoryAmount = topCategoriesWithColors[0].amount;
    }

    // Get budget from user settings (optimized with lean)
    const user = await User.findById(userId).select('preferences').lean();
    const budgetTotal = user?.preferences?.monthlyBudget;
    let budgetUtilization = null;
    if (budgetTotal && budgetTotal > 0) {
      budgetUtilization = Math.min(100, (totalExpense / budgetTotal) * 100);
    }

    // Financial Insights
    const insights = [];
    if (savingsRate !== null && savingsRate < 20) {
      insights.push({ type: 'warning', message: 'Your savings rate is below 20%. Consider reducing expenses.' });
    } else if (savingsRate !== null && savingsRate >= 20) {
      insights.push({ type: 'success', message: 'Great job! Your savings rate is healthy.' });
    }
    
    if (budgetUtilization !== null && budgetUtilization > 90) {
      insights.push({ type: 'error', message: 'You have used over 90% of your budget. Be cautious with spending.' });
    } else if (budgetUtilization !== null && budgetUtilization > 75) {
      insights.push({ type: 'warning', message: 'You have used over 75% of your budget.' });
    }

    if (monthlyComparison.change > 20) {
      insights.push({ type: 'warning', message: `Your spending increased by ${monthlyComparison.change.toFixed(1)}% compared to the last period.` });
    } else if (monthlyComparison.change < -10) {
      insights.push({ type: 'success', message: `Great! Your spending decreased by ${Math.abs(monthlyComparison.change).toFixed(1)}% compared to the last period.` });
    }

    if (highestCategory && totalExpense > 0 && highestCategoryAmount > totalExpense * 0.4) {
      insights.push({ type: 'info', message: `${highestCategory} accounts for over 40% of your expenses.` });
    }

    res.json({
      success: true,
      message: 'Analytics fetched successfully',
      data: {
        kpi: {
          averageSpend,
          savingsRate,
          savingsRateTrend: monthlyComparison.change >= 0 ? '↑' : '↓',
          highestCategory,
          highestCategoryAmount,
          budgetUtilization,
          budgetTotal
        },
        monthlyData,
        pieData,
        topCategories: topCategoriesWithColors,
        monthlyComparison,
        insights
      }
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics', 
      errors: process.env.NODE_ENV === 'development' ? [error.message, error.stack] : [error.message] 
    });
  }
};

module.exports = {
  getAnalytics
};

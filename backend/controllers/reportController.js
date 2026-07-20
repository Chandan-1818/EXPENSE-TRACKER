const Expense = require('../models/Expense');
const User = require('../models/User');

// Helper function to get start and end dates for a given month/year
const getMonthDateRange = (month, year) => {
  // month is 1-indexed (1-12)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const numDaysInMonth = endDate.getDate(); // Calculate number of days in month
  return { startDate, endDate, numDaysInMonth };
};

// Helper function to get previous month's date range
const getPreviousMonthDateRange = (month, year) => {
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return getMonthDateRange(prevMonth, prevYear);
};

// Generate monthly report
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    let { month, year } = req.query;

    // Default to current month/year if not provided
    const currentDate = new Date();
    if (!month) month = currentDate.getMonth() + 1;
    if (!year) year = currentDate.getFullYear();

    month = parseInt(month);
    year = parseInt(year);

    const { startDate, endDate, numDaysInMonth } = getMonthDateRange(month, year);
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousMonthDateRange(month, year);

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
                totalExpenses: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                },
                totalTransactions: { $sum: 1 },
                numExpenseTransactions: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] }
                },
                numIncomeTransactions: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] }
                }
              }
            }
          ],
          highestExpense: [
            { $match: { type: 'expense' } },
            { $sort: { amount: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                amount: 1,
                description: 1,
                category: 1
              }
            }
          ],
          highestIncome: [
            { $match: { type: 'income' } },
            { $sort: { amount: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                amount: 1,
                description: 1,
                category: 1
              }
            }
          ],
          expenseByCategory: [
            { $match: { type: 'expense' } },
            {
              $group: {
                _id: '$category',
                amount: { $sum: '$amount' }
              }
            },
            { $sort: { amount: -1 } }
          ],
          dailyData: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$date' }
                },
                income: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                expense: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                }
              }
            },
            { $sort: { '_id': 1 } }
          ]
        }
      }
    ]);

    const result = aggregationResult[0];
    const totals = result.totals[0] || { totalIncome: 0, totalExpenses: 0, totalTransactions: 0, numExpenseTransactions: 0, numIncomeTransactions: 0 };
    const highestExpense = result.highestExpense[0] || null;
    const highestIncome = result.highestIncome[0] || null;
    const expenseByCategory = result.expenseByCategory || [];
    const dailyData = result.dailyData || [];

    // If no transactions, return basic report
    if (totals.totalTransactions === 0) {
      return res.json({
        success: true,
        data: {
          month,
          year,
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          message: "No transactions this month."
        }
      });
    }

    const totalIncome = totals.totalIncome;
    const totalExpenses = totals.totalExpenses;
    const totalSavings = totalIncome - totalExpenses;
    const totalTransactions = totals.totalTransactions;
    const numExpenseTransactions = totals.numExpenseTransactions;
    const numIncomeTransactions = totals.numIncomeTransactions;

    // Calculate highest spending category
    let highestCategory = null;
    let highestCategoryAmount = 0;
    if (expenseByCategory.length > 0) {
      highestCategory = expenseByCategory[0]._id;
      highestCategoryAmount = expenseByCategory[0].amount;
    }
    const totalCategoriesUsed = expenseByCategory.length;

    // Calculate averages
    const averageSpend = numExpenseTransactions > 0 ? totalExpenses / numExpenseTransactions : 0;

    // Budget calculations (optimized with lean)
    const user = await User.findById(userId).select('preferences').lean();
    const budget = user?.preferences?.monthlyBudget || null;
    let budgetUsedPercent = null;
    let budgetRemaining = null;
    if (budget && budget > 0) {
      budgetUsedPercent = Math.min(100, (totalExpenses / budget) * 100);
      budgetRemaining = budget - totalExpenses;
    }

    // Prepare pie chart data
    const pieData = expenseByCategory.map(cat => ({
      name: cat._id,
      value: cat.amount
    }));

    // Prepare bar chart data (daily income/expense) from aggregation result
    const barData = dailyData.map(day => ({
      day: parseInt(day._id.split('-')[2]),
      income: day.income,
      expense: day.expense
    }));

    // Prepare line chart data (daily expenses only)
    const lineData = dailyData.map(day => ({
      day: parseInt(day._id.split('-')[2]),
      amount: day.expense
    }));

    // Get previous month's metrics using aggregation
    const prevMonthResult = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
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
          expenseByCategory: [
            { $match: { type: 'expense' } },
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

    const prevResult = prevMonthResult[0];
    const prevTotals = prevResult.totals[0] || { totalIncome: 0, totalExpenses: 0 };
    const prevExpenseByCategory = prevResult.expenseByCategory || [];
    
    const prevTotalIncome = prevTotals.totalIncome;
    const prevTotalExpenses = prevTotals.totalExpenses;

    // Create a map for easy lookup
    const prevCategoryMap = {};
    prevExpenseByCategory.forEach(cat => {
      prevCategoryMap[cat._id] = cat.amount;
    });

    // Generate insights
    const insights = [];

    // Savings insight
    if (totalIncome > 0) {
      insights.push({
        type: totalSavings > 0 ? 'success' : 'warning',
        message: `You saved ${totalSavings >= 0 ? '+' : ''}${formatCurrency(totalSavings)} this month.`
      });
    }

    // Spending change insight
    if (prevTotalExpenses > 0) {
      const spendingChangePercent = ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
      if (Math.abs(spendingChangePercent) >= 5) {
        insights.push({
          type: spendingChangePercent > 0 ? 'warning' : 'success',
          message: `Your spending ${spendingChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChangePercent).toFixed(0)}% compared to last month.`
        });
      }
    }

    // Highest category insight
    if (highestCategory && totalExpenses > 0) {
      const categoryPercent = (highestCategoryAmount / totalExpenses) * 100;
      if (categoryPercent >= 20) {
        insights.push({
          type: 'info',
          message: `${highestCategory} accounted for ${categoryPercent.toFixed(0)}% of your expenses.`
        });
      }
    }

    // Category change insights
    expenseByCategory.forEach(cat => {
      const prevAmount = prevCategoryMap[cat._id] || 0;
      if (prevAmount > 0) {
        const categoryChangePercent = ((cat.amount - prevAmount) / prevAmount) * 100;
        if (Math.abs(categoryChangePercent) >= 15) {
          insights.push({
            type: categoryChangePercent > 0 ? 'warning' : 'success',
            message: `${cat._id} ${categoryChangePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(categoryChangePercent).toFixed(0)}%.`
          });
        }
      }
    });

    // Budget insight
    if (budget && budget > 0) {
      if (budgetUsedPercent > 90) {
        insights.push({
          type: 'error',
          message: `You've used ${budgetUsedPercent.toFixed(0)}% of your monthly budget!`
        });
      } else if (budgetUsedPercent > 70) {
        insights.push({
          type: 'warning',
          message: `You've used ${budgetUsedPercent.toFixed(0)}% of your monthly budget.`
        });
      }
    }

    // Limit to top 5 insights to avoid clutter
    const finalInsights = insights.slice(0, 5);

    res.json({
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalExpenses,
        totalSavings,
        totalTransactions,
        highestExpense,
        highestIncome,
        highestCategory,
        highestCategoryAmount,
        totalCategoriesUsed,
        averageSpend,
        budget,
        budgetUsedPercent,
        budgetRemaining,
        numExpenseTransactions,
        numIncomeTransactions,
        // Chart data
        pieData,
        barData,
        lineData,
        // Insights
        insights: finalInsights
      }
    });
  } catch (error) {
    console.error('Error in getMonthlyReport:', error);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate monthly report', 
      errors: process.env.NODE_ENV === 'development' ? [error.message, error.stack] : [error.message] 
    });
  }
};

// Helper function to format currency (basic, since it's backend)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

module.exports = { getMonthlyReport };

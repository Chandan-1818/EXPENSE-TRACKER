const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  date: { type: Date, required: true },
  paymentMethod: { type: String, default: 'Credit Card' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Indexes for performance optimization
expenseSchema.index({ user: 1, date: -1 }); // Composite index for user queries sorted by date
expenseSchema.index({ user: 1, category: 1 }); // For category filtering
expenseSchema.index({ user: 1, type: 1 }); // For type filtering
expenseSchema.index({ user: 1, createdAt: -1 }); // For sorting by creation time

module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'System', 'Payment', 'Report'], default: 'info' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for performance optimization
notificationSchema.index({ user: 1, createdAt: -1 }); // For fetching user notifications sorted by date
notificationSchema.index({ user: 1, isRead: 1 }); // For filtering unread notifications

module.exports = mongoose.model('Notification', notificationSchema);

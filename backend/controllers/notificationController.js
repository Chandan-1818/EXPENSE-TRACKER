const Notification = require('../models/Notification');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, search = '', type = '' } = req.query;

    const query = { user: userId };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findOne({ _id: req.params.id, user: userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found', errors: [] });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findOne({ _id: req.params.id, user: userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found', errors: [] });
    }

    await Notification.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Create notification (internal helper)
// @access  Private
const createNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};

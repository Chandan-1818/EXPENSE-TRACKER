const User = require('../models/User');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const { createNotification } = require('./notificationController');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists', errors: [] });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      generateToken(res, user._id);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data', errors: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Optimize query by selecting only necessary fields
    const user = await User.findOne({ email }).select('_id name email avatar password createdAt');

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password', errors: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully', data: {} });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // Optimize with lean() to return plain JavaScript object instead of Mongoose document
    const user = await User.findById(req.user._id).select('-password').lean();
    if (user) {
      res.json({
        success: true,
        message: 'Profile fetched successfully',
        data: {
          ...user,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found', errors: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errors: [] });
    }

    const { name, email, phone, occupation, location, avatar } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (occupation) user.occupation = occupation;
    if (location) user.location = location;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    // Create notification
    await createNotification(req.user._id, 'Profile Updated', 'Your profile information has been updated successfully', 'success');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser.toObject(),
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};

// @desc    Delete user account permanently
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Validate password is provided
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required', errors: [] });
    }

    // Find user and verify password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errors: [] });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password', errors: [] });
    }

    // Delete all user-related data
    await Expense.deleteMany({ userId: user._id });
    await Category.deleteMany({ userId: user._id });
    await Notification.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    // Clear JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      expires: new Date(0)
    });

    res.status(200).json({ success: true, message: 'Account deleted successfully', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete account', errors: [error.message] });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteAccount
};

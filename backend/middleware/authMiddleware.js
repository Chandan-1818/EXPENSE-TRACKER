const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Optimize with lean() to return plain JavaScript object instead of Mongoose document
      req.user = await User.findById(decoded.userId).select('-password').lean();
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed', errors: [] });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token', errors: [] });
  }
};

module.exports = { protect };

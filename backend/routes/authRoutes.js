const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;

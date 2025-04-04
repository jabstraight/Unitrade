const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register & login routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Profile routes (protected)
router.get('/profile', protect, getUserProfile);
router.put(
  '/profile',
  protect,
  upload.single('profilePicture'),
  updateUserProfile
);

module.exports = router;